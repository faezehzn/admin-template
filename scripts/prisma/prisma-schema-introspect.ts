import { resolveUIKind } from "../utils";
import { FileMode, IntrospectionType } from "./types";

function findBlockRanges(schemaText: string, keyword: string) {
  // finds blocks like: `${keyword} Name { ... }` and returns ranges
  const ranges = [];
  const re = new RegExp(
    `\\b${keyword}\\s+([A-Za-z_][A-Za-z0-9_]*)\\s*\\{`,
    "g",
  );
  let m;

  while ((m = re.exec(schemaText))) {
    const name = m[1];
    const start = m.index;
    const braceStart = m.index + m[0].length;

    let i = braceStart;
    let depth = 1;
    while (i < schemaText.length) {
      const ch = schemaText[i];
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) break;
      }
      i++;
    }
    if (depth !== 0)
      throw new Error(`Unclosed ${keyword} block for "${name}".`);

    const end = i + 1; // include closing }
    const bodyStart = braceStart;
    const bodyEnd = i;

    ranges.push({
      name,
      start,
      end,
      bodyStart,
      bodyEnd,
      block: schemaText.slice(start, end),
      body: schemaText.slice(bodyStart, bodyEnd),
    });

    re.lastIndex = end;
  }

  return ranges;
}

function parseModelFields(modelBody: string) {
  // naive line parsing:
  // ignores @@... and comments
  // field line: name Type?[] @attr ...
  const fields = new Map();

  const lines = modelBody.split("\n");
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith("//")) continue;
    if (line.startsWith("@@")) continue;

    const m = line.match(
      /^([A-Za-z_][A-Za-z0-9_]*)\s+([A-Za-z_][A-Za-z0-9_]*)(\[\])?(\?)?/,
    );
    if (!m) continue;

    const [, name, type, arr, opt] = m;
    const isArray = Boolean(arr);
    const isOptional = Boolean(opt);

    const attrsPart = line.slice(m[0].length).trim();
    const attrs = attrsPart
      ? attrsPart
          .split(/\s+(?=@)/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    // const isRelation =
    //   attrs.some((a) => a.startsWith("@relation")) || /^[A-Z]/.test(type);

    let uiHint;
    let fileMode;

    const uiHintMatch = line.match(/\/\/\/\s*@ui:([a-zA-Z]+)/);
    if (uiHintMatch) uiHint = uiHintMatch[1];

    const modeMatch = line.match(/\/\/\/\s*@mode:([a-zA-Z]+)/);
    if (modeMatch) fileMode = modeMatch[1] as FileMode;

    fields.set(name, {
      name,
      type,
      array: isArray,
      optional: isOptional,
      attributes: attrs,
      rawLine: line,
      uiHint,
      fileMode,
    });
  }

  return fields;
}

function parseEnumValues(enumBody: string) {
  const values = [];
  for (const rawLine of enumBody.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith("//")) continue;
    // value lines are identifiers
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)$/);
    if (m) values.push(m[1]);
  }
  return values;
}

export function introspectSchema(schemaText: string): IntrospectionType {
  const enumBlocks = findBlockRanges(schemaText, "enum");
  const modelBlocks = findBlockRanges(schemaText, "model");

  const enums = new Map();
  for (const e of enumBlocks) {
    enums.set(e.name, {
      name: e.name,
      values: parseEnumValues(e.body),
      block: e.block,
    });
  }

  const models = new Map();
  for (const mb of modelBlocks) {
    models.set(mb.name, {
      name: mb.name,
      fields: parseModelFields(mb.body),
      block: mb.block,
      bodyRange: { start: mb.bodyStart, end: mb.bodyEnd },
      blockRange: { start: mb.start, end: mb.end },
    });
  }

  const intro = { enums, models };

  return enrichIntrospection(intro);
}

export function modelHasField(
  introspection: IntrospectionType,
  modelName: string,
  fieldName: string,
) {
  const m = introspection.models.get(modelName);
  if (!m) return false;
  return m.fields.has(fieldName);
}

export function listRelationsFromModel(
  introspection: IntrospectionType,
  modelName: string,
) {
  const m = introspection.models.get(modelName);
  if (!m) return [];
  const out = [];

  for (const f of m.fields.values()) {
    const relAttr = (f.attributes || []).find((a) => a.startsWith("@relation"));
    const relationNameMatch = relAttr?.match(/@relation\("([^"]+)"\)/);
    const relationName = relationNameMatch ? relationNameMatch[1] : "";

    // relation-ish if type is another model (not scalar) - we can't know scalars perfectly
    // but we can use: if type is an existing model name => relation
    const isRelation = introspection.models.has(f.type);

    if (isRelation) {
      out.push({
        fieldName: f.name,
        targetModel: f.type,
        array: f.array,
        optional: f.optional,
        relationName,
        rawLine: f.rawLine,
      });
    }
  }

  return out;
}

export function enrichIntrospection(intro: IntrospectionType) {
  for (const model of intro.models.values()) {
    for (const field of model.fields.values()) {
      field.enumDef = intro.enums.get(field.type);

      field.isRelation = intro.models.has(field.type);

      field.uiKind = resolveUIKind(field);
    }
  }

  return intro;
}
