import { Interface } from "node:readline/promises";
import { lowerFirst } from "../utils";
import { askOppositeConfig, askYesNo } from "./prompts";
import { FieldType } from "./types";

function buildRelationAttribute({
  relationName,
  fkFields,
  references = ["id"],
}: {
  relationName: string;
  fkFields?: string[];
  references?: string[];
}) {
  const chunks = [];

  if (relationName) {
    chunks.push(`"${relationName}"`);
  }

  if (fkFields?.length) {
    chunks.push(`fields: [${fkFields.join(", ")}]`);
  }

  if (references?.length) {
    chunks.push(`references: [${references.join(", ")}]`);
  }

  return `@relation(${chunks.join(", ")})`;
}

function buildSimpleRelationAttribute(relationName: string) {
  if (!relationName) return "";
  return `@relation("${relationName}")`;
}

function createRelationField({
  name,
  type,
  optional = false,
  array = false,
  relationName,
  fkFields,
  references = ["id"],
}: {
  name: string;
  type: string;
  optional: boolean;
  array: boolean;
  relationName?: string | null;
  fkFields?: string[];
  references?: string[];
}) {
  const attributes = [];

  if (array) {
    const relAttr = buildSimpleRelationAttribute(relationName ?? "-");
    if (relAttr) attributes.push(relAttr);
  } else {
    const relAttr = buildRelationAttribute({
      relationName: relationName ?? "-",
      fkFields,
      references,
    });
    attributes.push(relAttr);
  }

  return {
    name,
    type,
    optional,
    array,
    attributes,
  };
}

export async function buildOneToOneRelation(
  rl: Interface,
  currentModelName: string,
  relationFieldName: string,
  targetModel: string,
) {
  const relationNameInput = (
    await rl.question(
      `Relation name for disambiguation (optional, e.g. "UserProfile"): `,
    )
  ).trim();
  const relationName = relationNameInput || null;

  const relationOwner =
    (
      await rl.question(
        `Which model owns the foreign key? ("current"=${currentModelName}, "target"=${targetModel}) [current]: `,
      )
    )
      .trim()
      .toLowerCase() || "current";

  const currentFields = [];
  const oppositeUpdates = [];
  const warnings = [];

  if (relationOwner === "current") {
    const fkName =
      (await rl.question(`FK field name [${relationFieldName}Id]: `)).trim() ||
      `${relationFieldName}Id`;
    const fkType =
      (await rl.question(`FK type (String/Int) [String]: `)).trim() || "String";
    const optional = await askYesNo(rl, "Optional one-to-one relation?", false);

    currentFields.push({
      name: fkName,
      type: fkType,
      optional,
      array: false,
      attributes: ["@unique"],
    });

    currentFields.push(
      createRelationField({
        name: relationFieldName,
        type: targetModel,
        optional,
        array: false,
        relationName: relationName ?? "-",
        fkFields: [fkName],
        references: ["id"],
      }),
    );

    const opposite = await askOppositeConfig(rl, {
      currentModelName,
      targetModel,
      defaultMode: "single",
    });

    if (opposite) {
      const attrs = relationName ? [`@relation("${relationName}")`] : [];
      oppositeUpdates.push({
        targetModel,
        field: {
          name: opposite.fieldName,
          type: currentModelName,
          optional: true,
          array: false,
          attributes: attrs,
        },
      });
    }
  } else {
    currentFields.push(
      createRelationField({
        name: relationFieldName,
        type: targetModel,
        optional: true,
        array: false,
        relationName: relationName ?? "-",
      }),
    );

    warnings.push(
      `One-to-one FK owner is "${targetModel}". You must ensure the opposite side gets FK + @unique.`,
    );

    const opposite = await askOppositeConfig(rl, {
      currentModelName,
      targetModel,
      defaultMode: "single",
    });

    if (opposite) {
      warnings.push(
        `Automatic opposite update for FK-owned one-to-one on target side should include FK scalar + @unique manually if target model is not generated in same run.`,
      );
    }
  }

  return {
    fields: currentFields,
    oppositeUpdates,
    extraModels: [],
    warnings,
  };
}

export async function buildOneToManyRelation(
  rl: Interface,
  currentModelName: string,
  relationFieldName: string,
  targetModel: string,
) {
  const side =
    (
      await rl.question(
        `Which side is current model "${currentModelName}"? ("one" or "many") [many]: `,
      )
    )
      .trim()
      .toLowerCase() || "many";

  const relationNameInput = (
    await rl.question(`Relation name for disambiguation (optional): `)
  ).trim();
  const relationName = relationNameInput || null;

  const fields = [];
  const oppositeUpdates = [];
  const warnings = [];

  if (side === "many") {
    const fkName =
      (await rl.question(`FK field name [${relationFieldName}Id]: `)).trim() ||
      `${relationFieldName}Id`;
    const fkType =
      (await rl.question(`FK type (String/Int) [String]: `)).trim() || "String";
    const optional = await askYesNo(
      rl,
      "Optional many-to-one relation?",
      false,
    );

    fields.push({
      name: fkName,
      type: fkType,
      optional,
    });

    fields.push(
      createRelationField({
        name: relationFieldName,
        type: targetModel,
        optional,
        array: false,
        relationName,
        fkFields: [fkName],
        references: ["id"],
      }),
    );

    const opposite = await askOppositeConfig(rl, {
      currentModelName,
      targetModel,
      defaultMode: "list",
    });

    if (opposite) {
      const attrs = relationName ? [`@relation("${relationName}")`] : [];
      oppositeUpdates.push({
        targetModel,
        field: {
          name: opposite.fieldName,
          type: currentModelName,
          optional: false,
          array: opposite.mode === "list",
          attributes: attrs,
        },
      });
    }
  } else {
    fields.push(
      createRelationField({
        name: relationFieldName,
        type: targetModel,
        optional: false,
        array: true,
        relationName,
      }),
    );

    const opposite = await askOppositeConfig(rl, {
      currentModelName,
      targetModel,
      defaultMode: "single",
    });

    if (opposite) {
      const attrs = relationName ? [`@relation("${relationName}")`] : [];
      oppositeUpdates.push({
        targetModel,
        field: {
          name: opposite.fieldName,
          type: currentModelName,
          optional: true,
          array: false,
          attributes: attrs,
        },
      });

      warnings.push(
        `Because current model is the "one" side, foreign key must exist on "${targetModel}" model. Opposite update may need manual FK scalar field on target if not already present.`,
      );
    }
  }

  return {
    fields,
    oppositeUpdates,
    extraModels: [],
    warnings,
  };
}

export async function buildManyToManyRelation(
  rl: Interface,
  currentModelName: string,
  relationFieldName: string,
  targetModel: string,
) {
  const relationNameInput = (
    await rl.question(
      `Relation name for disambiguation (optional, recommended if multiple m2m): `,
    )
  ).trim();
  const relationName = relationNameInput || null;

  const useExplicitJoin = await askYesNo(
    rl,
    "Use explicit join model instead of implicit many-to-many?",
    false,
  );

  const fields = [];
  const oppositeUpdates = [];
  const extraModels: {
    modelName: string;
    fields: FieldType[];
    blockAttributes: string[];
    options: {
      timestamps: boolean;
      softDelete: boolean;
      idStrategy: string;
      skipBaseId: boolean;
    };
  }[] = [];
  const warnings: string[] = [];

  if (!useExplicitJoin) {
    fields.push(
      createRelationField({
        name: relationFieldName,
        type: targetModel,
        array: true,
        optional: false,
        relationName,
      }),
    );

    const opposite = await askOppositeConfig(rl, {
      currentModelName,
      targetModel,
      defaultMode: "list",
    });

    if (opposite) {
      const attrs = relationName ? [`@relation("${relationName}")`] : [];
      oppositeUpdates.push({
        targetModel,
        field: {
          name: opposite.fieldName,
          type: currentModelName,
          optional: false,
          array: true,
          attributes: attrs,
        },
      });
    }

    return { fields, oppositeUpdates, extraModels, warnings };
  }

  const defaultJoinName = `${currentModelName}${targetModel}`;
  const joinModelName =
    (await rl.question(`Join model name [${defaultJoinName}]: `)).trim() ||
    defaultJoinName;

  const currentRefName =
    (
      await rl.question(
        `Field name in join model pointing to ${currentModelName} [${lowerFirst(currentModelName)}]: `,
      )
    ).trim() || lowerFirst(currentModelName);

  const targetRefName =
    (
      await rl.question(
        `Field name in join model pointing to ${targetModel} [${lowerFirst(targetModel)}]: `,
      )
    ).trim() || lowerFirst(targetModel);

  const currentFk = `${currentRefName}Id`;
  const targetFk = `${targetRefName}Id`;

  fields.push(
    createRelationField({
      name: relationFieldName,
      type: joinModelName,
      array: true,
      optional: false,
    }),
  );

  const opposite = await askOppositeConfig(rl, {
    currentModelName,
    targetModel,
    defaultMode: "list",
  });

  if (opposite) {
    oppositeUpdates.push({
      targetModel,
      field: {
        name: opposite.fieldName,
        type: joinModelName,
        optional: false,
        array: true,
        attributes: [],
      },
    });
  }

  extraModels.push({
    modelName: joinModelName,
    fields: [
      {
        name: "id",
        type: "String",
        optional: false,
        array: false,
        attributes: ["@id", "@default(cuid())"],
      },
      {
        name: "createdAt",
        type: "DateTime",
        optional: false,
        array: false,
        attributes: ["@default(now())"],
      },

      { name: currentFk, type: "String", optional: false },
      {
        name: currentRefName,
        type: currentModelName,
        optional: false,
        array: false,
        fkFields: [currentFk],
        references: ["id"],
      },

      { name: targetFk, type: "String", optional: false },
      {
        name: targetRefName,
        type: targetModel,
        optional: false,
        array: false,
        fkFields: [targetFk],
        references: ["id"],
      },
    ],
    blockAttributes: [`@@unique([${currentFk}, ${targetFk}])`],
    options: {
      timestamps: false,
      softDelete: false,
      idStrategy: "cuid",
      skipBaseId: true,
    },
  });

  warnings.push(
    `Explicit join model "${joinModelName}" was generated. You may want to rename relation fields for domain clarity.`,
  );

  return { fields, oppositeUpdates, extraModels, warnings };
}



export function extractRelationName(attributes: string[] = []) {
  const rel = attributes.find((a) => a.startsWith("@relation"));
  if (!rel) return null;

  const m = rel.match(/@relation\("([^"]+)"\)/);
  if (m) return m[1];

  const m2 = rel.match(/name:\s*"([^"]+)"/);
  if (m2) return m2[1];

  return null;
}

export function replaceRelationNameInAttributes(
  attributes: string[] = [],
  relationName: string,
) {
  let found = false;

  const next = attributes.map((attr) => {
    if (!attr.startsWith("@relation")) return attr;

    found = true;

    if (/@relation\("([^"]+)"\)/.test(attr)) {
      return attr.replace(
        /@relation\("([^"]+)"\)/,
        `@relation("${relationName}")`,
      );
    }

    if (/name:\s*"([^"]+)"/.test(attr)) {
      return attr.replace(/name:\s*"([^"]+)"/, `name: "${relationName}"`);
    }

    if (attr === "@relation") {
      return `@relation("${relationName}")`;
    }

    if (attr.startsWith("@relation(")) {
      return attr.replace("@relation(", `@relation("${relationName}", `);
    }

    return attr;
  });

  if (!found) next.push(`@relation("${relationName}")`);
  return next;
}

export function extractRelationAttrFromField(field: FieldType) {
  // tries to extract fields:[a,b] from @relation(...)
  const rel = (field.attributes || []).find((a) => a.startsWith("@relation("));
  if (!rel) return null;

  const m = rel.match(/fields\s*:\s*\[([^\]]*)\]/);
  if (!m) return [];
  return m[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const extractRelationFieldsFromLawLine = (rawLine?: string): string[] => {
  if (!rawLine) return [];

  const match = rawLine.match(/fields\s*:\s*\[([^\]]+)\]/);

  if (!match) return [];

  return match[1]
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);
};