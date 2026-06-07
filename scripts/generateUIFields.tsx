import { ModelType } from "./prisma/types";
import { humanize } from "./utils";

export function generateUIFields<T>(
  fields: string[],
  model: ModelType,
  setState: string,
  state: string,
) {
  return fields
    .map((fname) => {
      const field = model.fields.get(fname);
      if (!field) return "";

      const label = humanize(fname);
      const uiKind = field.uiKind ?? "input";

      switch (uiKind) {
        case "input":
        case "email":
        case "password":
          return `<FormField id='${fname}' label="${label}" >
                  <Input
                    id='${fname}'
                    type="${uiKind === "input" ? "text" : uiKind}"
                    placeholder="Enter ${label.toLowerCase()}..."
                    value={${state}?.${fname}}
                    onChange={(e) =>
                      ${setState}((p) => ({ ...p, ${fname}: e.target.value }))
                    }
                  />
                </FormField>`;

        case "textarea":
          return `<FormField label="${label}" >
                  <Textarea
                    placeholder="Enter ${label.toLowerCase()}..."
                    className="max-h-24"
                    rows={3}
                    value={${state}?.${fname}}
                    onChange={(e) =>
                      ${setState}((p) => ({ ...p, ${fname}: e.target.value }))
                    }
                  />
                </FormField>`;

        case "number":
          return `<FormField id='${fname}' label="${label}" >
            <Input
              id='${fname}'
              type="number"
              value={${state}?.${fname}}
              onChange={(e) =>
                ${setState}((p) => (p ? { ...p, ${fname}: Number(e.target.value) } : p))
              }
              placeholder="Enter ${label.toLowerCase()}..."
            />
          </FormField>`;

        case "switch":
          return `<FormField
            label="${label}"
            className="flex items-center justify-between py-1"
          >
            <Switch
              checked={${state}?.${fname}}
              onCheckedChange={(val) => ${setState}((p) => (p? { ...p, ${fname}: val }: p))}
            />
          </FormField>`;

        // options value field (only enums)
        case "select":
          return `<FormField label="${label}" >
            <Select
            value={${state}?.${fname}}
              onValueChange={(val) =>
                ${setState}((p) => (p ? { ...p, ${fname}: val } : p))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select ${label}" />
              </SelectTrigger>
              <SelectContent className="w-full">
                {${field.enumDef?.values}.map((val) => (
                  <SelectItem key={val} value={val} className="capitalize">
                    {val}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>`;

        // options value field (only enums)
        case "multiselect":
          return `<FormField label="${label}" >
                  <SelectCombobox
                    options={[
                      ${field.enumDef?.values
                        .map((item) => `{ label: "${item}", value: "${item}" }`)
                        .join(",\n")}
                      ]}
                    value={${state}?.${fname} ?? []}
                    onChange={(vals) =>
                      ${setState}((p) => (p ? { ...p, ${fname}: vals } : p))
                    }
                  />
                </FormField>`;

        case "relation":
          return `<FormField label="${label}" ><RelationSelect
                    model="${field.type}"
                    value={${state}?.${fname}}
                    onChange={(val) =>
                      ${setState}((p) => (p ? { ...p, ${fname}: val } : p))
                    }
                  /></FormField>`;

        case "date":
          return `<FormField label="${label}" >
                  <DatePicker
                    value={${state}?.${fname}}
                    placeholder="Enter ${label.toLowerCase()}..."
                    onChange={(val) =>
                      ${setState}((p) => (p ? { ...p, ${fname}: val } : p))
                    }
                  />
                </FormField>`;

        case "file":
          return `<FormField label="${label}" >
                  <FileUploader
                    mode="${field.fileMode ?? "document"}"
                    maxFiles={3}
                    onChange={(files) =>
                      ${setState}((p) =>
                        p ? { ...p, ${fname}: files } : p
                      )
                    }
                  />
                </FormField>`;

        case "json":
          return `<FormField label="${label}" >
                  <JsonEditor
                    value={${state}?.${fname} ?? {}}
                    onChange={(val) =>
                      ${setState}((p) => (p ? { ...p, ${fname}: val } : p))
                    }
                  />
                </FormField>`;

        default:
          return `<FormField id='${fname}' label="${label}" >
                  <Input
                    id='${fname}'
                    placeholder="Enter ${label.toLowerCase()}..."
                    value={${state}?.${fname}}
                    onChange={(e) =>
                      ${setState}((p) => ({ ...p, ${fname}: e.target.value }))
                    }
                  />
                </FormField>`;
      }
    })
    .filter(Boolean)
    .join("\n\n");
}
