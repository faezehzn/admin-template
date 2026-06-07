import fs from "node:fs";

export function backupFile(filePath: string) {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = `${filePath}.bak.${ts}`;
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

export function restoreFile(backupPath: string, originalPath: string) {
  fs.copyFileSync(backupPath, originalPath);
}

export function readText(filePath: string) {
  return fs.readFileSync(filePath, "utf-8");
}

export function writeText(filePath: string, text: string) {
  fs.writeFileSync(filePath, text, "utf-8");
}

export function writeModelToSchema(schemaPath: string, modelBlock: string) {
  const schema = fs.readFileSync(schemaPath, "utf-8");
  const marker = "// [MODELS_MARKER]";

  if (schema.includes(marker)) {
    const updated = schema.replace(marker, `${modelBlock}\n${marker}`);
    fs.writeFileSync(schemaPath, updated, "utf-8");
    return;
  }

  fs.writeFileSync(schemaPath, `${schema.trimEnd()}\n\n${modelBlock}`, "utf-8");
}

export function schemaHasModel(schemaText: string, modelName: string) {
  const safe = modelName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\bmodel\\s+${safe}\\b`).test(schemaText);
}


