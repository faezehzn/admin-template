import readline, { Interface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { SCALAR_TYPES } from "./parser";
import { EnumType, UITextType } from "./types";
import {
  buildManyToManyRelation,
  buildOneToManyRelation,
  buildOneToOneRelation,
} from "./relation-utils";
import { Question } from "./types";
import { lowerFirst, pluralize } from "@/scripts/utils";
export async function createPromptSession() {
  return readline.createInterface({ input, output });
}

export async function askMode(rl: Interface) {
  const answer = (
    await rl.question(
      `Choose Prisma model input mode:\n` +
        `1) interactive (wizard)\n` +
        `2) dsl (name:Type?[]@attr)\n` +
        `3) raw (paste full prisma model)\n` +
        `> `,
    )
  ).trim();

  if (answer === "1") return "interactive";
  if (answer === "2") return "dsl";
  if (answer === "3") return "raw";

  throw new Error("Invalid mode selected.");
}

export async function askModelName(rl: Interface) {
  return (await rl.question("Model name (PascalCase, e.g. Product): ")).trim();
}

export async function askYesNo(
  rl: Interface,
  label: string,
  defaultValue = true,
) {
  const suffix = defaultValue ? "Y/n" : "y/N";
  const answer = (await rl.question(`${label} (${suffix}): `))
    .trim()
    .toLowerCase();

  if (!answer) return defaultValue;
  return ["y", "yes"].includes(answer);
}

export async function askIdStrategy(rl: Interface) {
  const answer = (
    await rl.question("ID strategy (cuid/uuid/autoincrement) [cuid]: ")
  )
    .trim()
    .toLowerCase();

  if (!answer) return "cuid";
  if (["cuid", "uuid", "autoincrement"].includes(answer)) return answer;

  throw new Error("Invalid id strategy.");
}

export async function collectDslLines(rl: Interface) {
  console.log(`\nEnter fields one per line. Examples:`);
  console.log(`name:String`);
  console.log(`slug:String@unique`);
  console.log(`price:Float`);
  console.log(`tags:String[]`);
  console.log(`isActive:Boolean@default(true)`);
  console.log(`status:enum(ProductStatus){DRAFT,PUBLISHED}@default(DRAFT)`);
  console.log(`userId:String`);
  console.log(`user:User@relation(fields:[userId],references:[id])`);
  console.log(`\nSubmit empty line to finish.\n`);

  const lines = [];

  while (true) {
    const line = (await rl.question("> ")).trim();
    if (!line) break;
    lines.push(line);
  }

  return lines;
}

export async function collectRawBlock(rl: Interface) {
  console.log("\nPaste full Prisma model block. Finish with an empty line:");
  const lines = [];

  while (true) {
    const line = await rl.question("");
    if (!line.trim() && lines.length > 0) break;
    lines.push(line);
  }

  return lines.join("\n");
}

export async function collectBlockAttributes(rl: Interface) {
  const attrs: string[] = [];
  const add = await askYesNo(
    rl,
    "Add block attributes (@@index/@@unique/@@map)?",
    false,
  );

  if (!add) return attrs;

  console.log("Enter block attributes (one per line). Empty line to finish:");
  console.log("@@index([name])");
  console.log("@@unique([slug])");
  console.log('@@map("products")\n');

  while (true) {
    const line = (await rl.question("> ")).trim();
    if (!line) break;
    attrs.push(line);
  }

  return attrs;
}

async function collectEnumWizard(rl: Interface) {
  const enums: EnumType[] = [];
  const addEnums = await askYesNo(rl, "Add enums in interactive mode?", false);
  if (!addEnums) return enums;

  while (true) {
    const addOne = await askYesNo(rl, "Create an enum?", enums.length === 0);
    if (!addOne) break;

    const name = (
      await rl.question("Enum name (PascalCase, e.g. ProductStatus): ")
    ).trim();

    console.log(
      "Enter enum values in SCREAMING_SNAKE_CASE. Empty line to finish:",
    );
    const values = [];
    while (true) {
      const v = (await rl.question("> ")).trim();
      if (!v) break;
      values.push(v);
    }

    enums.push({ name, values });
  }

  return enums;
}

async function collectScalarFieldInteractive(
  rl: Interface,
  predefinedEnums: { name: string }[],
) {
  const name = (await rl.question("Field name: ")).trim();

  const useEnum = await askYesNo(rl, "Is this field an enum?", false);
  let type;

  if (useEnum) {
    if (predefinedEnums.length > 0) {
      console.log("Available enums:");
      predefinedEnums.forEach((e, i) => console.log(`${i + 1}) ${e.name}`));
    }

    const enumName = (await rl.question("Enum type name: ")).trim();
    type = enumName;
  } else {
    type = (
      await rl.question("Field type (String, Int, Boolean, DateTime, ...): ")
    ).trim();
  }

  const optional = await askYesNo(rl, "Optional?", false);
  const array = optional ? false : await askYesNo(rl, "Array?", false);

  const unique = await askYesNo(rl, "Unique?", false);
  const hasDefault = await askYesNo(rl, "Has default?", false);

  const attributes = [];
  if (unique) attributes.push("@unique");

  if (hasDefault) {
    const def = (
      await rl.question("Default expression (e.g. true, 0, now(), DRAFT): ")
    ).trim();
    attributes.push(`@default(${def})`);
  }

  return {
    name,
    type,
    optional,
    array,
    attributes,
  };
}

export async function askOppositeConfig(
  rl: Interface,
  {
    currentModelName,
    targetModel,
    defaultMode,
  }: {
    currentModelName: string;
    targetModel: string;
    defaultMode: string;
  },
) {
  const shouldUpdateOpposite = await askYesNo(
    rl,
    `Add/update opposite relation field in "${targetModel}"?`,
    true,
  );

  if (!shouldUpdateOpposite) return null;

  const mode =
    (
      await rl.question(
        `Opposite field kind in "${targetModel}"? (single/list) [${defaultMode}]: `,
      )
    )
      .trim()
      .toLowerCase() || defaultMode;

  const defaultName =
    mode === "list"
      ? pluralize(lowerFirst(currentModelName))
      : lowerFirst(currentModelName);

  const fieldName =
    (await rl.question(`Opposite field name [${defaultName}]: `)).trim() ||
    defaultName;

  return {
    mode,
    fieldName,
  };
}

async function collectRelationFieldInteractive(
  rl: Interface,
  currentModelName: string,
) {
  const relationFieldName = (
    await rl.question("Relation field name in current model: ")
  ).trim();

  const targetModel = (
    await rl.question("Target model name (PascalCase): ")
  ).trim();

  const relationKind = (
    await rl.question(
      "Relation kind? (1=one-to-one, 2=one-to-many, 3=many-to-many): ",
    )
  ).trim();

  if (relationKind === "1") {
    return buildOneToOneRelation(
      rl,
      currentModelName,
      relationFieldName,
      targetModel,
    );
  }
  if (relationKind === "2") {
    return buildOneToManyRelation(
      rl,
      currentModelName,
      relationFieldName,
      targetModel,
    );
  }
  if (relationKind === "3") {
    return buildManyToManyRelation(
      rl,
      currentModelName,
      relationFieldName,
      targetModel,
    );
  }

  throw new Error("Invalid relation kind.");
}

export async function collectInteractiveFieldsWithRelations(
  rl: Interface,
  currentModelName: string,
) {
  const enums = await collectEnumWizard(rl);

  const fields = [];
  const extraModels = [];
  const oppositeUpdates = [];
  const warnings = [];

  while (true) {
    const addMore = await askYesNo(rl, "Add a field?", fields.length === 0);
    if (!addMore) break;

    const isRelation = await askYesNo(rl, "Is this a relation field?", false);

    if (!isRelation) {
      const scalarField = await collectScalarFieldInteractive(rl, enums);
      fields.push(scalarField);
      continue;
    }

    const relationResult = await collectRelationFieldInteractive(
      rl,
      currentModelName,
    );
    fields.push(...relationResult.fields);

    if (relationResult.extraModels?.length) {
      extraModels.push(...relationResult.extraModels);
    }
    if (relationResult.oppositeUpdates?.length) {
      oppositeUpdates.push(...relationResult.oppositeUpdates);
    }
    if (relationResult.warnings?.length) {
      warnings.push(...relationResult.warnings);
    }
  }

  return {
    enums,
    fields,
    extraModels,
    oppositeUpdates,
    warnings,
  };
}

export function makeRlPrompt(rl: Interface) {
  return async function rlPrompt(questions: Question[]) {
    const answers: Record<string, string | string[]> = {};

    for (const q of questions) {
      if (q.type === "text") {
        while (true) {
          const raw = (
            await rl.question(
              `${q.message}${q.initial ? ` (${q.initial})` : ""}: `,
            )
          ).trim();
          const value = raw || q.initial || "";

          if (q.validate) {
            const res = q.validate(value);
            if (res !== true) {
              console.log(typeof res === "string" ? res : "Invalid input.");
              continue;
            }
          }

          answers[q.name] = value;
          break;
        }
        continue;
      }

      if (q.type === "select" && q.choices) {
        console.log(`\n${q.message}`);
        q.choices.forEach((c, idx) => {
          console.log(`  ${idx + 1}) ${c.title}`);
        });

        while (true) {
          const raw = (
            await rl.question(`Choose [1-${q.choices.length}]: `)
          ).trim();
          const n = Number(raw);
          if (!Number.isInteger(n) || n < 1 || n > q.choices.length) {
            console.log(
              "❌ Invalid choice. Please enter a number from the list.",
            );
            continue;
          }
          answers[q.name] = q.choices[n - 1].value as string;
          break;
        }
        continue;
      }

      if (q.type === "multiselect" && q.choices) {
        console.log(`\n${q.message}`);
        console.log(`  0) [SELECT ALL]`);

        q.choices.forEach((c, idx) => {
          const status = c.selected ? "[x]" : "[ ]";
          console.log(`  ${idx + 1}) ${status} ${c.title}`);
        });

        while (true) {
          const raw = (
            await rl.question(
              `Select numbers (separated by space/comma) or 'enter' for defaults: `,
            )
          ).trim();

          if (raw === "") {
            const defaults = q.choices
              .filter((c) => c.selected)
              .map((c) => c.value);
            if (defaults.length === 0) {
              console.log("⚠️ Please select at least one option.");
              continue;
            }
            answers[q.name] = defaults;
            break;
          }

          // separate space/comma
          const indexes = raw
            .split(/[\s,]+/)
            .map((s) => parseInt(s))
            .filter((n) => !isNaN(n));

          // select-all mode
          if (indexes.includes(0)) {
            answers[q.name] = q.choices.map((c) => c.value);
            break;
          }

          // validate entered numbers
          const validIndexes = indexes.filter(
            (n) => n >= 1 && n <= q.choices!.length,
          );

          if (validIndexes.length === 0) {
            console.log(
              "❌ No valid options selected. Try again (e.g., '1 2 4').",
            );
            continue;
          }

          // final
          answers[q.name] = validIndexes.map(
            (idx) => q.choices![idx - 1].value,
          );
          break;
        }
        continue;
      }

      //if new type added
      const _exhaustive = q;
      throw new Error(`Unsupported question type: ${q.type}`);
    }

    return answers;
  };
}

export async function askStringFieldUI(fieldName: string): Promise<UITextType> {
  const rl = await createPromptSession();
  const prompt = makeRlPrompt(rl);

  const answer = await prompt([
    {
      type: "select",
      name: "action",
      message: `Field "${fieldName}" is a String. How should it appear in the admin UI?`,
      choices: [
        {
          title: "Short text (Input)",
          value: "input",
        },
        {
          title: "Long text (Textarea)",
          value: "textarea",
        },
        {
          title: "Email text",
          value: "email",
        },
        {
          title: "Password",
          value: "password",
        },
        {
          title: "Rich text",
          value: "richtext",
        },
      ],
    },
  ]);

  return answer.action as UITextType;
}
