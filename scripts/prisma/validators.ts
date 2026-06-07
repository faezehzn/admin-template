import { SCALAR_TYPES } from "./parser";
import { extractRelationAttrFromField } from "./relation-utils";
import {
  BlockAttributeName,
  EnumType,
  FieldType,
  ParsedModelType,
  ValidationError,
} from "./types";

const RESERVED_FIELD_NAMES = new Set(["model", "enum", "type"]);

function hasAttribute(field: FieldType, attrName: string) {
  return (field.attributes || []).some((attr) => attr.startsWith(attrName));
}

export function validateModelName(modelName: string) {
  if (!/^[A-Z][A-Za-z0-9_]*$/.test(modelName)) {
    throw new Error(
      `Invalid model name "${modelName}". Model name should be PascalCase like "Product".`,
    );
  }
}

export function validateParsedFields(fields: FieldType[]) {
  const seen = new Set();

  for (const field of fields) {
    if (RESERVED_FIELD_NAMES.has(field.name)) {
      throw new Error(`Field name "${field.name}" is reserved.`);
    }

    if (seen.has(field.name)) {
      throw new Error(`Duplicate field name "${field.name}".`);
    }
    seen.add(field.name);

    if (!/^[a-zA-Z_][A-Za-z0-9_]*$/.test(field.name)) {
      throw new Error(`Invalid field name "${field.name}".`);
    }

    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(field.type)) {
      throw new Error(
        `Invalid field type "${field.type}" for field "${field.name}".`,
      );
    }

    if (field.array && field.optional) {
      throw new Error(
        `Field "${field.name}" cannot be both array and optional in this DSL format.`,
      );
    }

    if (field.isRelation) {
      const relationAttr = hasAttribute(field, "@relation");
      const hasDefault = hasAttribute(field, "@default");
      const hasUnique = hasAttribute(field, "@unique");

      if (hasDefault) {
        throw new Error(`Relation field "${field.name}" cannot have @default.`);
      }

      if (hasUnique) {
        throw new Error(`Relation field "${field.name}" cannot have @unique.`);
      }

      if (!relationAttr && !field.array) {
        // console.warn(
        //   `⚠️ Relation-like field "${field.name}: ${field.type}" has no @relation attribute.`,
        // );
        throw new Error(
          `Relation-like field "${field.name}: ${field.type}" must have @relation attribute.`,
        );
      }
    }

    if (SCALAR_TYPES.has(field.type)) {
      const relationAttr = hasAttribute(field, "@relation");
      if (relationAttr) {
        throw new Error(`Scalar field "${field.name}" cannot have @relation.`);
      }
    }
  }
}

export function validateBlockAttributes(
  blockAttributes: string[],
  fields: FieldType[],
) {
  const fieldNames = new Set(fields.map((f) => f.name));
  const supported: Set<BlockAttributeName> = new Set([
    "@@id",
    "@@unique",
    "@@index",
    "@@map",
    "@@schema",
    "@@fulltext",
  ]);

  const errors: ValidationError[] = [];

  for (const attr of blockAttributes) {
    if (!attr.startsWith("@@")) {
      errors.push({
        attribute: attr,
        message: `Block attribute must start with @@`,
      });
      continue;
    }

    const name = attr.split("(")[0] as BlockAttributeName;

    if (!supported.has(name)) {
      errors.push({
        attribute: attr,
        message: `Unsupported block attribute "${name}"`,
      });
      continue;
    }

    if (
      [
        "@@" + "id",
        "@@" + "unique",
        "@@" + "index",
        "@@" + "fulltext",
      ].includes(name)
    ) {
      const match = attr.match(/\[([^\]]+)\]/);

      if (!match) {
        errors.push({
          attribute: attr,
          message: `Missing or invalid field list syntax. Expected format: @@name([field1, field2])`,
        });
        continue;
      }

      const refs = match[1]
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

      if (refs.length === 0) {
        errors.push({
          attribute: attr,
          message: `Field list cannot be empty`,
        });
        continue;
      }

      for (const ref of refs) {
        if (!fieldNames.has(ref)) {
          errors.push({
            attribute: attr,
            message: `Unknown field "${ref}" referenced`,
          });
        }
      }
    }
  }

  if (errors.length > 0) {
    const formatted = errors
      .map((e) => `❌ ${e.attribute}\n   → ${e.message}`)
      .join("\n\n");

    throw new Error(`Block attribute validation failed:\n\n${formatted}`);
  }
}

export function validateRelationIntegrity(fields: FieldType[]) {
  // ensure relation fields refer to existing FK fields
  const fieldNames = new Set(fields.map((f) => f.name));

  for (const f of fields) {
    const relFields = extractRelationAttrFromField(f);
    if (!relFields) continue;

    for (const rf of relFields) {
      if (!fieldNames.has(rf)) {
        throw new Error(
          `Relation field "${f.name}" references missing FK field "${rf}". ` +
            `Add "${rf}:String" (or appropriate type) first.`,
        );
      }
    }
  }
}

export function validateEnums(enumDefs: EnumType[]) {
  const names = new Set();
  for (const e of enumDefs || []) {
    if (!/^[A-Z][A-Za-z0-9_]*$/.test(e.name)) {
      throw new Error(`Invalid enum name "${e.name}". Use PascalCase.`);
    }
    if (names.has(e.name)) {
      // allow duplicates only if identical? keep simple: error
      throw new Error(`Duplicate enum definition "${e.name}".`);
    }
    names.add(e.name);

    if (!e.values?.length) throw new Error(`Enum "${e.name}" has no values.`);
    for (const v of e.values) {
      if (!/^[A-Z][A-Z0-9_]*$/.test(v)) {
        throw new Error(
          `Invalid enum value "${v}" in "${e.name}". Use SCREAMING_SNAKE_CASE like DRAFT.`,
        );
      }
      // if (names.has(v)) {
      //   throw new Error(`Duplicate enum value "${v}".`);
      // }

      // names.add(v);
    }
  }
}

export function validateParsedModel(parsedModel: ParsedModelType) {
  validateModelName(parsedModel.modelName);
  validateParsedFields(parsedModel.fields);
  validateRelationIntegrity(parsedModel.fields);
  validateBlockAttributes(
    parsedModel.blockAttributes ?? [],
    parsedModel.fields ?? [],
  );
  validateEnums(parsedModel.enums || []);
}

export function validateMultipleModels(models: ParsedModelType[]) {
  const seen = new Set();

  for (const model of models) {
    if (seen.has(model.modelName)) {
      throw new Error(
        `Duplicate model name "${model.modelName}" in generated output.`,
      );
    }
    seen.add(model.modelName);
    validateParsedModel(model);
  }
}
