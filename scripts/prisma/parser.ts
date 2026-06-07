import { FieldType } from "./types";

export const SCALAR_TYPES = new Set([
  "String",
  "Boolean",
  "Int",
  "BigInt",
  "Float",
  "Decimal",
  "DateTime",
  "Json",
  "Bytes",
]);

function readIdentifier(str: string, i: number) {
  let j = i;
  while (j < str.length && /[A-Za-z0-9_]/.test(str[j])) j++;
  return [str.slice(i, j), j];
}

function readBalancedParens(str: string, i: number) {
  // expects str[i] === '('
  let depth = 0;
  let j = i;
  while (j < str.length) {
    const ch = str[j];
    if (ch === "(") depth++;
    else if (ch === ")") {
      depth--;
      if (depth === 0) {
        j++;
        return [str.slice(i, j), j];
      }
    }
    j++;
  }
  throw new Error("Unclosed parentheses in attribute.");
}

function extractAttributes(attributesPart: string) {
  // robust scanning for @attr(...) with balanced parentheses
  const attrs = [];
  let i = 0;
  while (i < attributesPart.length) {
    if (attributesPart[i] !== "@") {
      i++;
      continue;
    }

    const [name, next] = readIdentifier(attributesPart, i + 1);
    if (!name)
      throw new Error(`Invalid attribute near: "${attributesPart.slice(i)}"`);

    i = Number(next);

    // skip whitespace
    while (i < attributesPart.length && /\s/.test(attributesPart[i])) i++;

    if (attributesPart[i] === "(") {
      const [parenChunk, after] = readBalancedParens(attributesPart, i);
      attrs.push(`@${name}${parenChunk}`);
      i = Number(after);
    } else {
      attrs.push(`@${name}`);
    }
  }

  return attrs;
}

export function parseFieldLine(line: string): FieldType {
  const trimmed = line.trim();
  if (!trimmed) throw new Error("Empty field line is not allowed.");

  const colonIndex = trimmed.indexOf(":");
  if (colonIndex === -1) {
    throw new Error(
      `Invalid field syntax "${line}". Expected "name:Type" format.`,
    );
  }

  const fieldName = trimmed.slice(0, colonIndex).trim();
  let rest = trimmed.slice(colonIndex + 1).trim();

  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(fieldName)) {
    throw new Error(`Invalid field name "${fieldName}".`);
  }

  let enumDef: FieldType["enumDef"] ;

  // enum(...) { ... } pattern
  if (rest.startsWith("enum(")) {
    const enumNameMatch = rest.match(
      /^enum\(([A-Za-z_][A-Za-z0-9_]*)\)\{([^}]*)\}/,
    );
    if (!enumNameMatch) {
      throw new Error(
        `Invalid enum field syntax in "${line}". Expected enum(EnumName){A,B,C}`,
      );
    }

    const [, enumName, rawValues] = enumNameMatch;
    const values = rawValues
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    if (values.length === 0) {
      throw new Error(`Enum "${enumName}" must have at least one value.`);
    }

    enumDef = { name: enumName, values };
    rest = rest.slice(enumNameMatch[0].length).trim();

    // now type becomes enumName
    rest = `${enumName}${rest ? " " + rest : ""}`.trim();
  }

  const typeMatch = rest.match(/^([A-Za-z_][A-Za-z0-9_]*)(\[\])?(\?)?/);
  if (!typeMatch) throw new Error(`Invalid field type syntax in "${line}".`);

  const [, rawType, arrayToken, optionalToken] = typeMatch;
  const typePart = typeMatch[0];
  const attributesPart = rest.slice(typePart.length).trim();

  const array = Boolean(arrayToken);
  const optional = Boolean(optionalToken);

  // attributesPart.split(" ").filter(Boolean) instead of extractAttributes
  const attributes = attributesPart ? extractAttributes(attributesPart) : [];

  // ✅ extract @ui:
  let uiHint: string | null = null;
  for (const attr of attributes) {
    if (attr.startsWith("@ui:")) {
      uiHint = attr.replace("@ui:", "").trim();
    }
  }

  const isScalar = SCALAR_TYPES.has(rawType);

  return {
    name: fieldName,
    type: rawType,
    optional,
    array,
    attributes,
    // isScalar,
    isRelation: !isScalar,
    enumDef, // nullable
    uiHint
  };
}

export function parseFieldLines(lines: string[]) {
  return lines
    .map((l) => l.trim())
    .filter(Boolean)
    .map(parseFieldLine);
}

