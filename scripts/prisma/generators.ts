import { EnumType, FieldType, OptionsType, ParsedModelType } from "./types";

function generateFieldType(field: FieldType) {
  let result = field.type;

  if (field.array) {
    result += "[]";
  } else if (field.optional) {
    result += "?";
  }

  return result;
}

export function generateFieldBlock(field: FieldType) {
  const type = generateFieldType(field);
  const attrs = field.attributes?.length
    ? ` ${field.attributes.join(" ")}`
    : "";

  let line = `${field.name} ${type}${attrs};

  if (field.uiHint) line += ` /// @ui:${field.uiHint}`;
  if (field.fileMode) line += ` /// @mode:${field.fileMode}`;

  return line;
}

function buildBaseFields({ options = {} }: { options: OptionsType }) {
  const {
    idStrategy = "cuid",
    timestamps = true,
    softDelete = true,
    skipBaseId = false,
  } = options;

  const lines = [];

  if (!skipBaseId) {
    const idDefault =
      idStrategy === "uuid"
        ? "@default(uuid())"
        : idStrategy === "autoincrement"
          ? "@default(autoincrement())"
          : "@default(cuid())";

    const idType = idStrategy === "autoincrement" ? "Int" : "String";
    lines.push(`id ${idType} @id ${idDefault}`);
  }

  if (timestamps) {
    lines.push(`createdAt DateTime @default(now())`);
    lines.push(`updatedAt DateTime @updatedAt`);
  }

  if (softDelete) {
    lines.push(`deletedAt    DateTime?`);
    lines.push(`deletedBy    String?`);
  }

  return lines;
}

export function generateEnumBlock(enumDef: EnumType) {
  const lines = [
    `enum ${enumDef.name} {`,
    ...enumDef.values.map((v) => `  ${v}`),
    `}`,
  ];
  return `${lines.join("\n")}\n`;
}

export function generatePrismaModel(parsedModel: ParsedModelType) {
  const baseFields = buildBaseFields({ options: parsedModel.options });
  const customFields = parsedModel.fields.map(generateFieldBlock);
  const blockAttributes = parsedModel.blockAttributes || [];

  const lines = [
    `model ${parsedModel.modelName} {`,
    ...baseFields.map((line) => `  ${line}`),
    ...(customFields.length ? [""] : []),
    ...customFields.map((line) => `  ${line}`),
    ...(blockAttributes.length ? [""] : []),
    ...blockAttributes.map((line) => `  ${line}`),
    `}`,
  ];

  return `${lines.join("\n")}\n`;
}
