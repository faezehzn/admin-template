import fs from "node:fs";
import path from "node:path";
import {
  FieldType,
  FileMode,
  ModelType,
  UIKind,
  UITextType,
} from "./prisma/types";
import { extractRelationFieldsFromLawLine } from "./prisma/relation-utils";
import pluralizeLib from "pluralize";

export function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function fileExists(filePath: string) {
  return fs.existsSync(filePath);
}

export function readFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  return fs.readFileSync(filePath, "utf-8");
}

export function createFile({
  filePath,
  content,
  options = { overwrite: true },
}: {
  filePath: string;
  content: string;
  options?: { overwrite: boolean };
}) {
  const { overwrite } = options;

  ensureDir(filePath);

  if (fs.existsSync(filePath) && !overwrite) {
    console.log(`⚠️ File already exists, skipped: ${filePath}`);
    return;
  }

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`✅ Created: ${filePath}`);
}

export function appendToFile(filePath: string, content: string) {
  ensureDir(filePath);

  fs.appendFileSync(filePath, `\n\n${content}`, "utf-8");
  console.log(`✅ Appended to: ${filePath}`);
}

export function appendUniqueToFile(filePath: string, content: string) {
  ensureDir(filePath);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`✅ Created and appended: ${filePath}`);
    return;
  }

  const currentContent = fs.readFileSync(filePath, "utf-8");
  const normalizedContent = content.trim();

  if (currentContent.includes(normalizedContent)) {
    console.log(`⚠️ Content already exists in: ${filePath}`);
    return;
  }

  const prefix = currentContent.endsWith("\n") ? "" : "\n";
  fs.appendFileSync(filePath, `${prefix}${content}`, "utf-8");
  console.log(`✅ Appended uniquely to: ${filePath}`);
}

export function replaceInFile({
  filePath,
  searchValue,
  replaceValue,
}: {
  filePath: string;
  searchValue: string;
  replaceValue: string;
}) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");

  if (!fileContent.includes(searchValue)) {
    console.log(`⚠️ Search value not found in: ${filePath}`);
    return;
  }

  const updatedContent = fileContent.replace(searchValue, replaceValue);
  fs.writeFileSync(filePath, updatedContent, "utf-8");

  console.log(`✅ Replaced content in: ${filePath}`);
}

export function insertBeforeMarker({
  filePath,
  content,
  marker,
  options,
}: {
  filePath: string;
  content: string;
  marker: string;
  options: { unique: boolean };
}) {
  const { unique = true } = options;

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");

  if (!fileContent.includes(marker)) {
    throw new Error(`Marker not found in file: ${marker}`);
  }

  if (unique && fileContent.includes(content.trim())) {
    console.log(`⚠️ Content already exists in: ${filePath}`);
    return;
  }

  const updatedContent = fileContent.replace(marker, `${content}\n${marker}`);
  fs.writeFileSync(filePath, updatedContent, "utf-8");

  console.log(`✅ Inserted before marker in: ${filePath}`);
}

export function insertAfterMarker({
  filePath,
  content,
  marker,
  options = { unique: true },
}: {
  filePath: string;
  content: string;
  marker: string;
  options?: { unique: boolean };
}) {
  const { unique } = options;

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");

  if (!fileContent.includes(marker)) {
    throw new Error(`Marker not found in file: ${marker}`);
  }

  if (unique && fileContent.includes(content.trim())) {
    console.log(`⚠️ Content already exists in: ${filePath}`);
    return;
  }

  const updatedContent = fileContent.replace(marker, `${marker}\n${content}`);
  fs.writeFileSync(filePath, updatedContent, "utf-8");

  console.log(`✅ Inserted after marker in: ${filePath}`);
}

export function prependToFile({
  filePath,
  content,
  options,
}: {
  filePath: string;
  content: string;
  options: { unique: boolean };
}) {
  const { unique = false } = options;

  ensureDir(filePath);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`✅ Created and prepended: ${filePath}`);
    return;
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");

  if (unique && fileContent.includes(content.trim())) {
    console.log(`⚠️ Content already exists in: ${filePath}`);
    return;
  }

  fs.writeFileSync(filePath, `${content}\n${fileContent}`, "utf-8");
  console.log(`✅ Prepended to: ${filePath}`);
}

export function removeFromFile(filePath: string, content: string) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");

  if (!fileContent.includes(content)) {
    console.log(`⚠️ Content not found in: ${filePath}`);
    return;
  }

  const updatedContent = fileContent.replace(content, "");
  fs.writeFileSync(filePath, updatedContent, "utf-8");

  console.log(`✅ Removed content from: ${filePath}`);
}

// *******************
export function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function lowerFirst(str: string) {
  return str ? str.charAt(0).toLowerCase() + str.slice(1) : str;
}

export function pluralize(name: string) {
  // if (name.endsWith("y") && !/[aeiou]y$/i.test(name)) {
  //   return `${name.slice(0, -1)}ies`;
  // }
  // if (name.endsWith("s")) return `${name}es`;
  // return `${name}s`;
  return pluralizeLib(name);
}

export function toSnakeCase(str: string) {
  return str.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`);
}

export function humanize(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}


// **********************
export const handleZodFields = (fields: string[], currentModel: ModelType) => {
  return fields
    .map((fname) => {
      const f = currentModel.fields.get(fname);
      if (!f) return "";

      let baseZod = "";

      //  ✅ RELATION HANDLING
      if (f.isRelation) {
        const foreignKeys = extractRelationFieldsFromLawLine(f.rawLine);

        // if foreignKey defineded
        if (foreignKeys.length > 0) {
          return foreignKeys
            .map((fkName) => {
              const fkField = currentModel.fields.get(fkName);

              let fkZod = `z.string().min(1, "Required")`;

              if (fkField?.optional) {
                fkZod += `.optional().nullable()`;
              }

              return `  ${fkName}: ${fkZod},`;
            })
            .join("\n");
        } else {
          // if rawLine doesn't exist
          console.warn(
            `⚠ Relation "${fname}" has no explicit foreign keys. Skipped in Zod schema.`,
          );
          return "";
        }
      }

      // ✅ ENUM
      else if (f.enumDef) {
        baseZod = `z.nativeEnum(${f.type})`;
      }

      // ✅ FILE Type
      else if (
        f.type === "Bytes" ||
        /file|image|img|avatar|upload/i.test(f.name)
      ) {
        baseZod =
          `z.instanceof(File).refine((file) => file.size > 0, "File is required")
        `.trim();
      }

      // JSON type
      else if (f.type === "Json") {
        baseZod = `z.string().refine((val) => {
          try {
            JSON.parse(val)
            return true
          } catch {
            return false
          }
        }, "Invalid JSON")
        `.trim();
      }

      // ✅ SCALAR TYPES
      else {
        switch (f.type) {
          case "String":
            baseZod = `z.string().min(1, "Required")`;
            break;

          case "Int":
          case "Float":
          case "Decimal":
            baseZod = `z.coerce.number()`;
            break;

          case "Boolean":
            baseZod = `z.boolean()`;
            break;

          case "DateTime":
            baseZod = `z.coerce.date()`;
            break;

          case "BigInt":
            baseZod = `z.coerce.bigint()`;
            break;

          default:
            baseZod = "z.string()";
        }
      }

      // ✅ ARRAY HANDLING
      if (f.array) {
        baseZod = `z.array(${baseZod})`;
      }

      // ✅ OPTIONAL / NULLABLE
      if (f.optional) {
        baseZod = `${baseZod}.optional().nullable()`;
      }

      return `  ${fname}: ${baseZod},`;
    })
    .filter(Boolean)
    .join("\n");
};

export function resolveFileMode(field: FieldType): FileMode | null {
  if (field.type !== "Bytes" && field.type !== "String") return null;

  // annotation priority
  if (field.uiHint?.includes("image")) return field.array ? "images" : "image";
  if (field.uiHint?.includes("document"))
    return field.array ? "documents" : "document";

  // name-based fallback
  const name = field.name.toLowerCase();

  if (
    name.includes("image") ||
    name.includes("photo") ||
    name.includes("img") ||
    name.includes("pic") ||
    name.includes("picture") ||
    name.includes("thumbnail") ||
    name.includes("avatar")
  )
    return field.array ? "images" : "image";

  if (
    name.includes("file") ||
    name.includes("doc") ||
    name.includes("document") ||
    name.includes("pdf") ||
    name.includes("excel") ||
    name.includes("attachment")
  )
    return field.array ? "documents" : "document";

  return null;
}

export function resolveUIKind(field: FieldType): UIKind {
  if (field.uiHint === "file") return "file";

  if (field.uiHint) return field.uiHint as UIKind;

  // enum
  if (field.enumDef) return field.array ? "multiselect" : "select";

  // relation
  if (field.isRelation) return "relation";

  // Json
  if (field.type === "Json" || field.type === "JSON") return "json";

  // Boolean
  if (field.type === "Boolean") return "switch";

  // Number
  if (["Int", "Float", "Decimal"].includes(field.type)) return "number";

  // Date
  if (field.type === "DateTime") return "date";

  if (field.name.toLowerCase().includes("email")) return "email";
  if (field.name.toLowerCase().includes("password")) return "password";
  if (field.name.toLowerCase().includes("description")) return "textarea";
  if (field.name.toLowerCase().includes("content")) return "textarea";

  // String
  if (field.type === "String") {
    if (field.uiType === "textarea") return "textarea";
    return "input";
  }

  return "input";
}

export async function enrichFieldWithUI(
  field: FieldType,
  interactive: boolean,
  askStringFieldUI: (name: string) => Promise<UITextType>,
): Promise<FieldType> {
  // file mode
  field.fileMode = resolveFileMode(field);

  // annotation override
  if (field.uiHint) {
    field.uiType = field.uiHint as UITextType;
  }

  // interactive string decision
  if (
    interactive &&
    field.type === "String" &&
    !field.array &&
    !field.uiType &&
    !field.fileMode
  ) {
    field.uiType = await askStringFieldUI(field.name);
  }

  field.uiKind = resolveUIKind(field);

  return field;
}
