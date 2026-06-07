export type FileMode = "image" | "images" | "document" | "documents";

export type UITextType =
  | "input"
  | "textarea"
  | "email"
  | "password"
  | "richtext";

export type UIKind =
  | "input"
  | "textarea"
  | "number"
  | "switch"
  | "select"
  | "multiselect"
  | "relation"
  | "date"
  | "file"
  | "json"
  | "email"
  | "password";

export type FieldType = {
  name: string;
  type: string;
  array?: boolean;
  value?: string | boolean | number | Date;

  optional: boolean;

  isRelation?: boolean;
  // isScalar: boolean;

  attributes?: string[];

  enumDef?: EnumType;

  kind?: string;
  relationName?: string;
  rawLine?: string;
  fkFields?: string[];
  references?: string[];

  // UI metadata
  uiHint?: string | null;
  uiType?: UITextType;
  fileMode?: FileMode | null;
  uiKind?: UIKind;
};

export type BlockAttributesType = string[];

export type OptionsType = {
  idStrategy?: string;
  timestamps?: boolean;
  softDelete?: boolean;
  skipBaseId?: boolean;
};

export type EnumType = { name: string; values: string[] };
export type EnumBlockType = { name: string; block: string };

export type ParsedModelType = {
  modelName: string;
  fields: FieldType[];
  blockAttributes: BlockAttributesType;
  options: OptionsType;
  enums?: {
    name: string;
    values: string[];
  }[];
};

export type oppositeUpdatesType = {
  targetModel: string;
  field: {
    name: string;
    type: string;
    optional: boolean;
    array: boolean;
    attributes: string[];
  };
  oppositeFieldLine?: string;
};

export type ModelType = {
  name: string;
  fields: Map<string, FieldType>;
  rawBlock: string;
  bodyRange: { start: number; end: number };
};
export type ModelIntrospectionType = Map<string, ModelType>;

export type IntrospectionType = {
  enums: Map<string, { name: string; values: string[] }>;
  models: ModelIntrospectionType;
};

export type ResolutionType = {
  conflictIndex: number;
  action: string;
  newFieldName?: string;
  relationName?: string;
  oppositeArity?: string;
};

export type ConflictType = {
  type: string;
  modelName?: string;
  severity: string;
  message: string;
  currentModelName?: string;
  targetModel?: string;
  existingRelations?: {
    fieldName: string;
    targetModel: string;
    array?: boolean;
    optional: boolean;
    relationName?: string;
    rawLine?: string;
  }[];
  fieldName?: string;
  update?: oppositeUpdatesType;
  suggestions?: {
    renameField: boolean;
    skip: boolean;
    setRelationName?: boolean;
  };
  resolved?: boolean;
  resolution?: ResolutionType;
};

export type PlanPrismaType = {
  schemaSnapshot: string;
  enumsToInsert: EnumBlockType[];
  modelsToInsert: { name: string; block: string }[];
  oppositePlans: {
    action: string;
    targetModel: string;
    field: FieldType;
    update: oppositeUpdatesType;
  }[];
  conflicts: ConflictType[];
  warnings: { type: string; enumName: string; message: string }[];
};

export type PromptType = {
  type: string;
  name: string;
  message: string;
  choices: { title: string }[];
};

export type Choice = { title: string; value?: string };

export interface Question {
  type: "text" | "select" | "multiselect";
  name: string;
  message: string;
  initial?: string;
  choices?: { title: string; value: string; selected?: boolean }[];
  validate?: (val: string) => boolean | string;
}

export type PromptFn = (
  questions: Question[],
) => Promise<Record<string, string | string[]>>;



export type BlockAttributeName =
  | "@@id"
  | "@@unique"
  | "@@index"
  | "@@map"
  | "@@schema"
  | "@@fulltext";

export interface ValidationError {
  attribute: string;
  message: string;
}
