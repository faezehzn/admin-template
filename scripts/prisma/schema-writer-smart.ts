import {
  introspectSchema,
} from "./prisma-schema-introspect";

function insertAt(schemaText: string, index: number, block: string) {
  return schemaText.slice(0, index) + block + schemaText.slice(index);
}

function findMarkerIndex(schemaText: string, marker: string) {
  const idx = schemaText.indexOf(marker);
  return idx >= 0 ? idx : null;
}

function findInsertPointAfterLastBlock(schemaText: string, keyword: string) {
  // best-effort: find last occurrence of "keyword Name {" and insert after its closing brace
  const re = new RegExp(`\\b${keyword}\\s+[A-Za-z_][A-Za-z0-9_]*\\s*\\{`, "g");
  let last = null;
  let m;
  while ((m = re.exec(schemaText))) last = m;

  if (!last) return schemaText.trimEnd().length;

  const braceStart = last.index + last[0].length;

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
  if (depth !== 0) return schemaText.trimEnd().length;
  return i + 1;
}

export function insertEnumSmart(schemaText: string, enumBlock: string) {
  const marker = "// [ENUMS_MARKER]";
  const markerIdx = findMarkerIndex(schemaText, marker);

  if (markerIdx != null) {
    return schemaText.replace(marker, `${enumBlock}\n${marker}`);
  }

  // no marker: insert after last enum, otherwise append at end
  const point = findInsertPointAfterLastBlock(schemaText, "enum");
  const normalized = `\n\n${enumBlock.trimEnd()}\n`;
  return insertAt(schemaText, point, normalized);
}

export function insertModelSmart(schemaText: string, modelBlock: string) {
  const marker = "// [MODELS_MARKER]";
  const markerIdx = findMarkerIndex(schemaText, marker);

  if (markerIdx != null) {
    return schemaText.replace(marker, `${modelBlock}\n${marker}`);
  }

  // no marker: insert after last model, otherwise after last enum, otherwise append
  let point = findInsertPointAfterLastBlock(schemaText, "model");
  if (point === schemaText.trimEnd().length) {
    point = findInsertPointAfterLastBlock(schemaText, "enum");
  }

  const normalized = `\n\n${modelBlock.trimEnd()}\n`;
  return insertAt(schemaText, point, normalized);
}

function insertFieldIntoModelBody(
  schemaText: string,
  modelRange: { bodyStart: number; bodyEnd: number },
  fieldLine: string,
) {
  // Prefer RELATIONS_MARKER within model body if present
  const marker = "// [RELATIONS_MARKER]";
  const body = schemaText.slice(modelRange.bodyStart, modelRange.bodyEnd);

  if (body.includes(fieldLine.trim())) return schemaText;

  if (body.includes(marker)) {
    const newBody = body.replace(marker, `  ${fieldLine}\n  ${marker}`);
    return (
      schemaText.slice(0, modelRange.bodyStart) +
      newBody +
      schemaText.slice(modelRange.bodyEnd)
    );
  }

  // Insert before body end (before closing })
  const trimmed = body.trimEnd();
  const newBody = `${trimmed}\n  ${fieldLine}\n`;
  return (
    schemaText.slice(0, modelRange.bodyStart) +
    newBody +
    schemaText.slice(modelRange.bodyEnd)
  );
}

export function applyOppositeInsert({
  schemaText,
  targetModel,
  oppositeFieldLine,
}: {
  schemaText: string;
  targetModel: string;
  oppositeFieldLine: string;
}) {
  const intro = introspectSchema(schemaText);
  const target = intro.models.get(targetModel);
  if (!target) throw new Error(`Target model "${targetModel}" not found.`);
  return insertFieldIntoModelBody(
    schemaText,
    {
      bodyStart: target.bodyRange.start,
      bodyEnd: target.bodyRange.end,
    },
    oppositeFieldLine,
  );
}
