import {
  introspectSchema,
  modelHasField,
  listRelationsFromModel,
} from "./prisma-schema-introspect";
import {
  extractRelationName,
  replaceRelationNameInAttributes,
} from "./relation-utils";
import {
  EnumBlockType,
  oppositeUpdatesType,
  PlanPrismaType,
  ResolutionType,
} from "./types";

export function buildInitialPlan({
  schemaText,
  enums = [],
  models = [],
  oppositeUpdates = [],
}: {
  schemaText: string;
  enums: EnumBlockType[];
  models: { name: string; block: string }[];
  oppositeUpdates?: oppositeUpdatesType[];
}) {
  const intro = introspectSchema(schemaText);

  const plan: PlanPrismaType = {
    schemaSnapshot: schemaText,
    enumsToInsert: [],
    modelsToInsert: [],
    oppositePlans: [],
    conflicts: [],
    warnings: [],
  };

  // enums
  for (const e of enums) {
    // enumExist
    if (intro.enums.has(e.name)) {
      plan.warnings.push({
        type: "enum_exists",
        enumName: e.name,
        message: `Enum "${e.name}" already exists and will be skipped.`,
      });
      continue;
    }

    plan.enumsToInsert.push(e);
  }

  // models
  for (const m of models) {
    // enumExistmodelExist
    if (intro.models.has(m.name)) {
      plan.conflicts.push({
        type: "model_exists",
        modelName: m.name,
        severity: "error",
        message: `Model "${m.name}" already exists in schema.`,
      });
      continue;
    }

    plan.modelsToInsert.push(m);
  }

  // opposite relation planning
  for (const update of oppositeUpdates) {
    const { targetModel, field } = update;

    if (!intro.models.has(targetModel)) {
      plan.conflicts.push({
        type: "target_model_missing",
        severity: "error",
        targetModel,
        fieldName: field.name,
        message: `Target model "${targetModel}" does not exist for opposite relation "${field.name}".`,
        update,
      });
      continue;
    }

    if (modelHasField(intro, targetModel, field.name)) {
      plan.conflicts.push({
        type: "opposite_field_exists",
        severity: "interactive",
        targetModel,
        fieldName: field.name,
        message: `Field "${field.name}" already exists in model "${targetModel}".`,
        suggestions: {
          renameField: true,
          skip: true,
        },
        update,
      });
      continue;
    }

    const currentModelName = field.type?.replace(/\[\]|\?/g, "");
    const existingRelations = listRelationsFromModel(intro, targetModel).filter(
      (r) => r.targetModel === currentModelName,
    );

    const relationName = extractRelationName(field.attributes || []);

    if (existingRelations.length > 0 && !relationName) {
      plan.conflicts.push({
        type: "relation_ambiguity",
        severity: "interactive",
        targetModel,
        currentModelName,
        fieldName: field.name,
        existingRelations,
        message:
          `Model "${targetModel}" already has relation(s) to "${currentModelName}". ` +
          `You must provide relationName to avoid ambiguity.`,
        suggestions: {
          setRelationName: true,
          renameField: true,
          skip: true,
        },
        update,
      });
      continue;
    }

    plan.oppositePlans.push({
      action: "insert",
      targetModel,
      field,
      update,
    });
  }

  return plan;
}

export function applyConflictResolution(
  plan: PlanPrismaType,
  resolution: ResolutionType,
) {
  const conflict = plan.conflicts[resolution.conflictIndex];
  if (!conflict) {
    throw new Error(`Conflict at index ${resolution.conflictIndex} not found.`);
  }

  const update = conflict.update;
  if (!update) {
    throw new Error(
      `Conflict type "${conflict.type}" has no mutable update payload.`,
    );
  }

  if (resolution.action === "skip") {
    conflict.resolved = true;
    conflict.resolution = resolution;
    return plan;
  }

  const nextField = {
    ...update.field,
    attributes: [...(update.field.attributes || [])],
  };

  if (resolution.newFieldName) {
    nextField.name = resolution.newFieldName;
  }

  if (resolution.oppositeArity) {
    const baseType = nextField.type.replace(/\[\]|\?/g, "");
    if (resolution.oppositeArity === "list") nextField.type = `${baseType}[]`;
    else nextField.type = baseType;
  }

  if (resolution.relationName) {
    nextField.attributes = replaceRelationNameInAttributes(
      nextField.attributes,
      resolution.relationName,
    );
  }

  plan.oppositePlans.push({
    action: "insert",
    targetModel: update.targetModel,
    field: nextField,
    update: {
      ...update,
      field: nextField,
    },
  });

  conflict.resolved = true;
  conflict.resolution = resolution;

  return plan;
}

export function getUnresolvedConflicts(plan: PlanPrismaType) {
  return plan.conflicts.filter((c) => !c.resolved && c.severity !== "warning");
}
