import fs from "node:fs";
import path from "node:path";
import {
  createPromptSession,
  askMode,
  askModelName,
  askYesNo,
  askIdStrategy,
  collectDslLines,
  collectRawBlock,
  collectBlockAttributes,
  collectInteractiveFieldsWithRelations,
  makeRlPrompt,
  askStringFieldUI,
} from "./prompts";
import { parseFieldLines } from "./parser";
import {
  validateParsedModel,
  validateModelName,
  validateMultipleModels,
} from "./validators";
import {
  ParsedModelType,
  FieldType,
  EnumType,
  oppositeUpdatesType,
} from "./types";
import {
  generatePrismaModel,
  generateEnumBlock,
  generateFieldBlock,
} from "./generators";
import {
  backupFile,
  readText,
  schemaHasModel,
  writeModelToSchema,
} from "./schema-writer";
import {
  runPrismaFormat,
  runPrismaMigrate,
  runPrismaValidate,
  withRollback,
} from "./migrate";
import { introspectSchema } from "./prisma-schema-introspect";
import {
  insertEnumSmart,
  insertModelSmart,
  applyOppositeInsert,
} from "./schema-writer-smart";
// import { ask } from "./prompts";
import { buildInitialPlan } from "./planner";
import { resolvePlanConflictsInteractively } from "./conflict-resolver";
import { enrichFieldWithUI } from "../utils";

export function resolveProjectPath(...segments: string[]) {
  return path.join(process.cwd(), ...segments);
}

function normalizeRawModelBlock(raw: string, expectedModelName: string) {
  const trimmed = raw.trim();

  if (!trimmed.includes(`model ${expectedModelName}`)) {
    throw new Error(
      `Raw block must contain "model ${expectedModelName} { ... }"`,
    );
  }
  if (!trimmed.includes("{") || !trimmed.includes("}")) {
    throw new Error("Raw block must contain { }.");
  }

  return `${trimmed}\n`;
}

function printPreview({
  enumBlocks,
  modelBlocks,
  oppositeUpdates,
  warnings,
}: {
  enumBlocks: { block: string }[];
  modelBlocks: { name: string; block: string }[];
  warnings: string[];
  oppositeUpdates: oppositeUpdatesType[];
}) {
  console.log("\n--- Preview ---\n");

  if (enumBlocks?.length) {
    console.log("Enums to add:\n");
    for (const eb of enumBlocks) console.log(eb.block);
  }

  if (modelBlocks?.length) {
    console.log("Models to add:\n");
    for (const mb of modelBlocks) console.log(mb.block);
  }

  if (oppositeUpdates?.length) {
    console.log("Opposite relation updates:\n");
    for (const u of oppositeUpdates) {
      console.log(`- in model ${u.targetModel}: add "${u.oppositeFieldLine}"`);
    }
  }

  if (warnings?.length) {
    console.log("Warnings:\n");
    for (const w of warnings) console.log(`- ${w}`);
  }

  console.log("\n--------------\n");
}

function extractEnumDefsFromFields(fields: FieldType[]) {
  const enums: EnumType[] = [];
  for (const f of fields) {
    if (f.enumDef) enums.push(f.enumDef);
  }
  // de-dup by name (keep first)
  const map = new Map();
  for (const e of enums) {
    if (!map.has(e.name)) map.set(e.name, e);
  }
  return [...map.values()];
}

export async function addModelHybrid() {
  const rl = await createPromptSession();

  try {
    const schemaPath = resolveProjectPath("prisma", "schema.prisma");

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`schema.prisma not found at ${schemaPath}`);
    }

    const modelName = await askModelName(rl);
    validateModelName(modelName);

    const schemaText = readText(schemaPath);
    if (schemaHasModel(schemaText, modelName)) {
      throw new Error(`Model "${modelName}" already exists.`);
    }

    const mode = await askMode(rl);
    let modelBlocks: { name: string; block: string }[] = [];
    let enumDefs = [];
    let oppositeUpdates: oppositeUpdatesType[] = [];
    let warnings: string[] = [];
    let blockAttributes = [];

    if (mode === "interactive") {
      // relationsForOppositeUpdate = opp;
      const interactive = await collectInteractiveFieldsWithRelations(
        rl,
        modelName,
      );

      const timestamps = await askYesNo(rl, "Add createdAt/updatedAt?", true);
      const softDelete = await askYesNo(rl, "Add deletedAt?", true);
      const idStrategy = await askIdStrategy(rl);

      blockAttributes = await collectBlockAttributes(rl);

      const parsedModel: ParsedModelType = {
        modelName,
        blockAttributes: blockAttributes.map((l) => l.trim()).filter(Boolean),
        options: {
          timestamps,
          softDelete,
          idStrategy,
        },
        fields: interactive.fields,
        enums: interactive.enums,
      };

      const extraModels = (interactive.extraModels || []).map((m) => ({
        ...m,
        enums: [],
      }));

      validateMultipleModels([parsedModel, ...extraModels]);

      modelBlocks = [
        {
          name: parsedModel.modelName,
          block: generatePrismaModel(parsedModel),
        },
        ...extraModels.map((m) => ({
          name: m.modelName,
          block: generatePrismaModel(m),
        })),
      ];

      enumDefs = interactive.enums || [];
      oppositeUpdates = interactive.oppositeUpdates || [];
      warnings = interactive.warnings || [];
    }

    if (mode === "dsl") {
      const lines = await collectDslLines(rl);
      const fields = parseFieldLines(lines) as FieldType[];

      enumDefs = extractEnumDefsFromFields(fields);

      const timestamps = await askYesNo(rl, "Add createdAt/updatedAt?", true);
      const softDelete = await askYesNo(rl, "Add deletedAt?", true);
      const idStrategy = await askIdStrategy(rl);

      blockAttributes = await collectBlockAttributes(rl);

      const enrichedFields = [];
      for (const f of fields) {
        const enriched = await enrichFieldWithUI(f, true, askStringFieldUI);

        enrichedFields.push(enriched);
      }

      const parsedModel = {
        modelName,
        fields: enrichedFields,
        enums: enumDefs,
        blockAttributes: blockAttributes.map((l) => l.trim()).filter(Boolean),
        options: {
          timestamps,
          softDelete,
          idStrategy,
        },
      };

      validateParsedModel(parsedModel);

      modelBlocks = [
        {
          name: parsedModel.modelName,
          block: generatePrismaModel(parsedModel),
        },
      ];
    }

    if (mode === "raw") {
      const rawBlock = await collectRawBlock(rl);
      modelBlocks = [
        {
          name: modelName,
          block: normalizeRawModelBlock(rawBlock, modelName),
        },
      ];
    }

    const enumBlocks = (enumDefs || []).map((e) => ({
      name: e.name as string,
      block: generateEnumBlock(e),
    }));

    printPreview({
      enumBlocks,
      modelBlocks,
      oppositeUpdates,
      warnings,
    });

    const initialSchemaText = readText(schemaPath);

    const plan = buildInitialPlan({
      schemaText: initialSchemaText,
      enums: enumBlocks,
      models: modelBlocks,
      oppositeUpdates,
    });

    const blockingConflicts = plan.conflicts.filter(
      (c) => !c.resolved && c.severity === "error",
    );

    if (blockingConflicts.length > 0) {
      console.log("\n❌ Blocking conflicts found:\n");
      for (const c of blockingConflicts) {
        console.log(`- [${c.type}] ${c.message}`);
      }
      throw new Error("Cannot continue until blocking conflicts are resolved.");
    }

    const prompt = makeRlPrompt(rl);
    await resolvePlanConflictsInteractively(plan, prompt);

    const unresolvedAfterInteractive = plan.conflicts.filter(
      (c) => !c.resolved && c.severity === "interactive",
    );

    if (unresolvedAfterInteractive.length > 0) {
      console.log("\n❌ Some interactive conflicts are still unresolved:\n");
      for (const c of unresolvedAfterInteractive) {
        console.log(`- [${c.type}] ${c.message}`);
      }
      throw new Error("Cannot continue with unresolved conflicts.");
    }

    if (plan.warnings.length) {
      console.log("\n⚠️ Warnings:");
      for (const w of plan.warnings) {
        console.log(`- ${w.message}`);
      }
    }

    console.log("\n🧠 Final plan summary:");
    console.log(`- Enums to insert: ${plan.enumsToInsert.length}`);
    console.log(`- Models to insert: ${plan.modelsToInsert.length}`);
    console.log(
      `- Opposite fields to insert: ${plan.oppositePlans.filter((p) => p.action === "insert").length}`,
    );

    if (plan.oppositePlans.length) {
      console.log("\nOpposite inserts:");
      for (const op of plan.oppositePlans) {
        if (op.action !== "insert") continue;
        console.log(`- ${op.targetModel}.${op.field.name}: ${op.field.type}`);
      }
    }

    const confirmed = await askYesNo(
      rl,
      "Apply these changes to schema.prisma?",
      true,
    );
    if (!confirmed) {
      console.log("Operation cancelled by user before applying changes.");
      return;
    }

    const backupPath = backupFile(schemaPath);

    await withRollback({
      schemaPath,
      backupPath,
      fn: async () => {
        let schemaText = readText(schemaPath);

        // 1) enums
        for (const eb of plan.enumsToInsert) {
          schemaText = insertEnumSmart(schemaText, eb.block);
        }

        // 2) models
        for (const mb of plan.modelsToInsert) {
          schemaText = insertModelSmart(schemaText, mb.block);
        }

        // 3) opposite inserts (only resolved/valid ones)
        for (const op of plan.oppositePlans) {
          if (op.action !== "insert") continue;

          const fieldLine = generateFieldBlock(op.field);

          schemaText = applyOppositeInsert({
            schemaText,
            targetModel: op.targetModel,
            oppositeFieldLine: fieldLine,
          });
        }
        writeModelToSchema(schemaPath, schemaText);

        // "AST-level" validation via Prisma itself
        const doValidate = await askYesNo(rl, "Run `prisma validate`?", true);
        if (doValidate) runPrismaValidate();

        const doFormat = await askYesNo(rl, "Run `prisma format`?", true);
        if (doFormat) runPrismaFormat();

        const doMigrate = await askYesNo(rl, "Run `prisma migrate dev`?", true);
        if (doMigrate) {
          const def = `add-${modelName.toLowerCase()}`;
          const migName =
            (await rl.question(`Migration name [${def}]: `)).trim() || def;
          runPrismaMigrate(migName);
        }
      },
    });

    console.log(`✅ Model "${modelName}" added successfully.`);
    return { modelName };
  } catch {
    return null;
  } finally {
    rl.close();
  }
}
