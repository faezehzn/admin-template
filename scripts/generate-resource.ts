// scripts/generate-resource.js
import { execSync } from "node:child_process";
import {
  appendToFile,
  capitalize,
  createFile,
  handleZodFields,
  insertAfterMarker,
  pluralize,
  readFile,
  replaceInFile,
} from "./utils";
import { addModelHybrid, resolveProjectPath } from "./prisma/add-model";
import { introspectSchema } from "./prisma/prisma-schema-introspect";
import { FieldType } from "./prisma/types";
import { createPromptSession, makeRlPrompt } from "./prisma/prompts";
import { generateUIFields } from "./generateUIFields";

// -- Main Generator Logic --
async function generateResource() {
  // --- Update Prisma Schema ---
  const modelPrisma = await addModelHybrid();

  if (!modelPrisma) return;
  const modelNamePrisma = modelPrisma.modelName;

  const modelName = capitalize(modelNamePrisma);
  const modelNameLower = modelNamePrisma.toLowerCase();
  const modelNamePlural = pluralize(modelNameLower);
  const ModelNamePlural = pluralize(modelName);

  // read schema
  const schemaPath = resolveProjectPath("prisma/schema.prisma");
  if (!schemaPath) {
    throw new Error(`Schema path not found in this root`);
  }

  const schemaText = readFile(schemaPath);
  if (!schemaText) {
    throw new Error(`Schema text does not readable`);
  }

  const intro = introspectSchema(schemaText);
  if (!intro) {
    throw new Error(`introspection Schema does not readable`);
  }

  const currentModel = intro.models.get(modelName);
  if (!currentModel) {
    throw new Error(`Model ${modelName} not found in schema after generation.`);
  }

  const allFields = Array.from(currentModel.fields.values());
  const availableFields = allFields.filter(
    (f) =>
      !["id", "createdAt", "updatedAt", "deletedAt", "deletedBy"].includes(
        (f as FieldType).name,
      ) && !(f as FieldType).isRelation,
  );
  const hasDeletedAt = currentModel.fields.has("deletedAt");

  // Ask for createInputs/updateInputs
  const rl = await createPromptSession();
  const prompt = makeRlPrompt(rl);
  const { createFormFields } = await prompt([
    {
      type: "multiselect",
      name: "createFormFields",
      message: `Which fields should be included in the Create forms for ${modelName}?`,
      choices: availableFields.map((f) => ({
        title: (f as FieldType).name,
        value: (f as FieldType).name,
        selected: true,
      })),
    },
  ]);
  const { updateFormFields } = await prompt([
    {
      type: "multiselect",
      name: "updateFormFields",
      message: `Which fields should be included in the Update forms for ${modelName}?`,
      choices: allFields.map((f) => ({
        title: (f as FieldType).name,
        value: (f as FieldType).name,
        selected: true,
      })),
    },
  ]);

  // Ask for columns table
  const { tableFields } = await prompt([
    {
      type: "multiselect",
      name: "tableFields",
      validate: (value) =>
        value.length > 4 ? "You can select at most 4 fields for a responsive table." : true,
      message: `Which fields should be visible in the table for ${ModelNamePlural}?`,
      choices: Array.from(currentModel.fields.values())
        .filter((f) => !(f as FieldType).isRelation)
        .map((f) => ({
          title: (f as FieldType).name,
          value: (f as FieldType).name,
          selected: true,
        })),
    },
  ]);

  // --------------- generate dynamic templates/zod ------------------------------
  // For Validation (Zod)
  const zodCreateFields = handleZodFields(
    createFormFields as string[],
    currentModel,
  );

  const zodUpdateFields = handleZodFields(
    updateFormFields as string[],
    currentModel,
  );

  // For Table Columns
  const tableCols = (tableFields as string[])
    .map((fname) => {
      return `{ header: "${capitalize(fname)}", accessor: (row) => {
              return (
                <Tooltip
                  side={"bottom"}
                  offOrOn={isMobileSize ? "off" : "on"}
                  content={row.${fname}}
                  className={cn(" justify-center")}
                >
                  <span className="break-all font-medium">{row.${fname}}</span>
                </Tooltip>
              );
            },
            cellClassName: "md:max-w-24 lg:max-w-52 xl:max-w-60 truncate", sortKey: "${fname}", sortable: true },`;
    })
    .join("\n    ");

  // Generate UI Form Content
  const createFormUI = generateUIFields(
    createFormFields as string[],
    currentModel,
    "createForm",
    "setCreateForm",
  );
  const editFormUI = generateUIFields(
    updateFormFields as string[],
    currentModel,
    "editItemData",
    "setEditItemData",
  );

  const pageTemplate = `
  import {{ModelName}}Component from "@/components/admin/{{modelNamePlural}}/page";
  import { requirePagePermission } from "@/lib/server/requirePagePermission";

  export default async function {{ModelNamePlural}}Page() {
    await requirePagePermission("{{modelName}}.read");

    return <{{ModelName}}Component />;
  }
  `;

  const componentTemplate = `
"use client";

import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomTable } from "@/components/shared/table";
import { Column, Action } from "@/components/shared/table/type";
import { Pagination } from "@/components/shared/pagination";
import { Tooltip } from "@/components/shared/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CreateBaseModal from "@/components/modals/create-base-modal";
import EditBaseDrawer from "@/components/admin/edit-base-drawer";
import { DeleteBaseModal } from "@/components/modals/delete-base-modal";
import { cn } from "@/lib/utils";
import useMobileSize from "@/hooks/useMobileSize";
import { useSuccessToast, useErrorToast } from "@/hooks/useCustomToasts";
import { useDebounce } from "@/hooks/useDebounce";
import { handleError } from "@/lib/errorHandler";
import { UserStatus } from "@prisma/client"; // Need to import relevant enum
import { TableMobile } from "@/components/shared/tableMobile";

// required imports
import { FormField } from "@/components/shared/formField";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/shared/datePicker";
import { JsonEditor } from "@/components/shared/jsonEditor";
import { FileUploader } from "@/components/shared/fileUploader";
import { Textarea } from "@/components/ui/textarea";
import { SelectCombobox } from "@/components/shared/combobox";
import { RelationSelect } from "@/components/shared/relationSelect";

import type { {{ModelName}}ListItem, Update{{ModelName}}Input, Create{{ModelName}}Input } from "@/types";
import { useGet{{ModelNamePlural}}Query, useCreate{{ModelName}}Mutation, useUpdate{{ModelName}}Mutation,
  useDelete{{ModelName}}Mutation,
  SortByColumn, } from "@/stores/{{modelNamePlural}}Api";
import Can from "@/components/auth/can";


export default function {{ModelNamePlural}}Component() {
  const { isMobileSize } = useMobileSize();
  const { show: showSuccess } = useSuccessToast();
  const { show: showError } = useErrorToast();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<SortByColumn>("createdAt"); // Adjust based on actual fields
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

    // --- Modal/Drawer State and Handlers ---
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editItemData, setEditItemData] = useState<Update{{ModelName}}Input | null>(
      null,
    );
    const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
    const [createForm, setCreateForm] = useState<Create{{ModelName}}Input | null>(null);

  // --- RTK Query Hooks ---
  const { data, isLoading, isFetching } = useGet{{ModelNamePlural}}Query({
    page,
    pageSize,
    search: debouncedSearch,
    sortBy,
    sortDir,
  });
  const [create{{ModelName}}Mutation, { isLoading: isCreating }] =
    useCreate{{ModelName}}Mutation();
  const [update{{ModelName}}Mutation, { isLoading: isUpdating }] =
    useUpdate{{ModelName}}Mutation();
  const [delete{{ModelName}}Mutation, { isLoading: isDeleting }] =
    useDelete{{ModelName}}Mutation();

  const items = data?.items ?? [];
  const meta = data?.meta;



  const columns: Column<${modelName}ListItem>[] = [\n    ${tableCols}\n  ];

  // --- Define Actions (Edit, Delete) ---
  const actions: Action<{{ModelName}}ListItem>[] = [
    {
      label: (
        <Tooltip side={"bottom"} content={"Edit"} className={cn(" justify-center")}>
          <span><Pencil size={16} className="w-full min-w-4" /></span>
        </Tooltip>
      ),
      variant: "ghost",
      onClick: (row) => {  
        setEditOpen(true);
        setEditItemData(row); },
    },
    {
      label: (
        <Tooltip side={"bottom"} content={"Delete"} className={cn(" justify-center")}>
          <span><Trash2 size={16} className="w-full min-w-4" /></span>
        </Tooltip>
      ),
      variant: "danger",
      onClick: (row) => { 
        setDeleteItemId(row.id);
        setDeleteOpen(true); },
    },
  ];
  // --- End Actions ---

  // Placeholder handlers - replace with actual mutation calls
  const handleCreate = async () => {
    if(!createForm) return
    try {
      await create{{ModelName}}Mutation(createForm);

      setCreateOpen(false);
      setCreateForm(null);
      showSuccess("{{ModelName}} created successfully.");
    } catch (error) {
      handleError({ showError, error });
    }
  };

  const handleUpdate = async () => {
    if (!editItemData) return;

    try {
      await update{{ModelName}}Mutation({ ...editItemData });

      setEditOpen(false);
      setEditItemData(null);
      showSuccess("{{ModelName}} updated successfully.");
    } catch (error) {
      handleError({ showError, error });
    }
  };

  const handleDelete = async () => {
    if (!deleteItemId) return;

    try {
      const resp = await delete{{ModelName}}Mutation(deleteItemId);
      if (resp.error) {
        handleError({ showError, error: resp.error });
        return;
      }
      setDeleteOpen(false);
      setDeleteItemId(null);
      showSuccess("{{ModelName}} deleted successfully.");
    } catch (error) {
      handleError({ showError, error });
    }
  };
  // --- End Handlers ---


  return (
    <div className="flex flex-col gap-6 justify-between w-full text-primary-700 ">
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{{ModelName}}</h1>
            <p className="text-diactive">Manage platform {{modelNamePlural}}</p>
          </div>
          <Can permission="{{modelName}}.create"> 
            <Button onClick={() => setCreateOpen(true)} className="gap-2 w-full sm:w-auto">
              <Plus size={16} /> Create {{ModelName}}
            </Button>
           </Can>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 z-1 -translate-y-1/2 text-primary-300" size={18} />
          <Input
            placeholder="Search {{modelNamePlural}}..."
            className="pl-9 w-full sm:w-72 bg-primary-50"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {isMobileSize && (
          <div className="flex flex-col gap-2">
            <span className="text-sm text-primary-400">Sort</span>
            <Select value={sortBy + "-" + sortDir} onValueChange={(v) => {
                const [key, dir] = v.split("-");
                setSortBy(key as typeof sortBy);
                setSortDir(dir as typeof sortDir);
                setPage(1);
              }}
                >
              <SelectTrigger className="w-full bg-primary-50"> <SelectValue placeholder="Sort by..." /> </SelectTrigger>
              <SelectContent>
                {columns
                  .filter((c) => c.sortable)
                  .flatMap((c) => [
                    <SelectItem
                      key={c.sortKey + "-asc"}
                      value={c.sortKey + "-asc"}
                    >
                      {c.header} (A → Z / Oldest)
                    </SelectItem>,
                    <SelectItem
                      key={c.sortKey + "-desc"}
                      value={c.sortKey + "-desc"}
                    >
                      {c.header} (Z → A / Newest)
                    </SelectItem>,
                  ])}
              </SelectContent>
            </Select>
          </div>
        )}

        {isMobileSize ? (
          <TableMobile columns={columns} data={items} isLoading={isLoading || isFetching} emptyText={
              search ? "No {{modelName}} match your search." : "No {{modelName}} found."
            } actions={actions} />
        ) : (
          <CustomTable
            columns={columns}
            data={items}
            isLoading={isLoading || isFetching}
            emptyText={
              search ? "No {{modelName}} match your search." : "No {{modelName}} found."
            }
            actions={actions}
            sortBy={sortBy}
            sortDir={sortDir}
            onSortChange={(key, dir) => {
              setSortBy(key as SortByColumn);
              setSortDir(dir as "asc" | "desc");
              setPage(1);
            }}
          />
        )}
      </div>

      {meta && meta.pageCount > 1 && (
        <Pagination
          page={meta.page}
          pageCount={meta.pageCount}
          total={meta.total}
          pageSize={meta.pageSize}
          isLoading={isFetching}
          onPageChange={(p) => setPage(p)}
          showPageSizeSelector={true}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      )}

      {/* Modals and Drawers - Placeholder */}
      <CreateBaseModal onClose={() => setCreateForm(null)} open={createOpen} setOpen={setCreateOpen} title={\`Create {{ModelName}}\`} description="Create a new {{modelName}} by filling out the form below." handler={handleCreate} isLoading={isCreating} content={<>${createFormUI}</>} />
      {editItemData && <EditBaseDrawer onClose={() => setEditItemData(null)} handler={handleUpdate} isLoading={isUpdating} content={<>${editFormUI}</>} title={\`Edit {{ModelName}}\`} open={editOpen} setOpen={setEditOpen} />}
      <DeleteBaseModal open={deleteOpen} setOpen={setDeleteOpen} handleDelete={handleDelete} title={\`Delete {{ModelName}}?\`} description="This action cannot be undone. The product will be permanently removed." isLoading={isDeleting} />
    </div>
  );
}
`;

  const apiRouteTemplate = `
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { create{{ModelName}}Schema, update{{ModelName}}Schema, {{modelNamePlural}}ListQuerySchema } from "@/lib/validations/{{modelNamePlural}}"; 
import { requirePermission } from "@/lib/server/requirePermission";

// ******************* GET All ********************************
export async function GET(req: Request) {
  const permission = await requirePermission("{{modelName}}.read");
  if (permission.error) return permission.error;

  const { searchParams } = new URL(req.url);
  const parsed = {{modelNamePlural}}ListQuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid query", issues: parsed.error.issues?.[0].message }, { status: 400 });
  }

  const { page, pageSize, search, sortBy, sortDir } = parsed.data;
  const skip = (page - 1) * pageSize;

  // --- Dynamic WHERE clause ---
  const where =
    search.length > 0
      ? {
          OR: [
            // Adjust fields based on your {{modelName}} model
            { name: { contains: search } },
            // Add other searchable fields here
          ],
          ${hasDeletedAt ? "deletedAt: null," : ""},
        }
      : ${hasDeletedAt ? "{deletedAt: null}" : "undefined"};
  // --- End Dynamic WHERE ---

  // --- Dynamic ORDER BY clause ---
  const orderBy = { [sortBy]: sortDir };
  // --- End Dynamic ORDER BY ---


  try {
    const [items, total] = await Promise.all([
      prisma.{{modelNameLower}}.findMany({ 
        where,
        skip,
        take: pageSize,
        orderBy,
      }),
      prisma.{{modelNameLower}}.count({ where }),
    ]);

    return NextResponse.json({
      items,
      meta: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching {{modelNamePlural}}" }, { status: 500 });
  }
}

// ******************* POST ********************************
export async function POST(req: Request) {
  const permission = await requirePermission("{{modelName}}.create");
  if (permission.error) return permission.error;

  const json = await req.json();
  const parsed = create{{ModelName}}Schema.safeParse(json); 

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid data", errors: parsed.error.issues?.[0].message }, { status: 400 });
  }

  const data = parsed.data;

  try {
    const new{{ModelName}} = await prisma.{{modelNameLower}}.create({
      data,
    });

    return NextResponse.json({ {{modelNameLower}}: new{{ModelName}} }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error creating {{modelName}}" }, { status: 500 });
  }
}

// ******************* PATCH (UPDATE) ********************************
export async function PATCH(req: Request) {
  const permission = await requirePermission("{{modelName}}.update");
  if (permission.error) return permission.error;

  const json = await req.json();
  const parsed = update{{ModelName}}Schema.safeParse(json); 

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid data", errors: parsed.error.issues?.[0].message }, { status: 400 });
  }

  const { id, ...data } = parsed.data; 

  if (!id) {
     return NextResponse.json({ message: "Missing ID for update" }, { status: 400 });
  }

  try {
    const updated{{ModelName}} = await prisma.{{modelNameLower}}.update({
      where: { id },
      data,
    });

    return NextResponse.json({ {{modelNameLower}}: updated{{ModelName}} });
  } catch (error) {
    return NextResponse.json({ message: "Error updating {{modelName}}" }, { status: 500 });
  }
}

// ******************* DELETE ********************************
export async function DELETE(req: Request) {
  const permission = await requirePermission("{{modelName}}.delete");
  if (permission.error) return permission.error;

  const session = permission.session;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "Missing ID for deletion" }, { status: 400 });
  }

  try {
    ${
      hasDeletedAt
        ? `// soft delete
      await prisma.{{modelNameLower}}.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: session.user.id,
        },
      });`
        : ` // hard delete - force delete
      // await prisma.{{modelNameLower}}.delete({
      //   where: { id },
      // });
`
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting {{modelName}}" }, { status: 500 });
  }
}
`;

  const rtkQueryTemplate = `
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {  ListArgsAPI, ModelPrismaResponse, {{ModelName}}ListItem } from "@/types"; 
import { Update{{ModelName}}Input, Create{{ModelName}}Input } from "@/lib/validations/{{modelNamePlural}}"; 

export type SortByColumn = "createdAt";

export const {{modelNamePlural}}Api = createApi({
  reducerPath: "{{modelNamePlural}}Api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["{{ModelNamePlural}}"], // Add other relevant tag types if needed
  endpoints: (builder) => ({
    get{{ModelNamePlural}}: builder.query<
          ModelPrismaResponse<{{ModelName}}ListItem>,
          ListArgsAPI<SortByColumn>
        >({
      query: ({ page, pageSize, search = "", sortBy = "createdAt", sortDir = "desc" }) => ({
        url: "{{modelNamePlural}}", // API route path
        params: { page, pageSize, search, sortBy, sortDir },
      }),
      providesTags: (res) =>
        res
          ? [
              ...res.items.map((item) => ({ type: "{{ModelNamePlural}}" as const, id: item.id })),
              { type: "{{ModelNamePlural}}" as const, id: "LIST" },
            ]
          : [{ type: "{{ModelNamePlural}}" as const, id: "LIST" }],
    }),

    // CREATE
    create{{ModelName}}: builder.mutation<{ {{modelNameLower}}: {{ModelName}}ListItem }, Create{{ModelName}}Input>({
      query: (body) => ({
        url: "{{modelNamePlural}}",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, error) => error ? [] : [{ type: "{{ModelNamePlural}}", id: "LIST" }],
    }),

    // UPDATE
    update{{ModelName}}: builder.mutation<{ {{modelNameLower}}: {{ModelName}}ListItem }, Update{{ModelName}}Input>({
      query: (body) => ({
        url: "{{modelNamePlural}}",
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, error, body) =>
        error ? [] : [{ type: "{{ModelNamePlural}}", id: body.id }],
    }),

    // DELETE
    delete{{ModelName}}: builder.mutation<{ ok: boolean }, string>({
      query: (id) => ({
        url:  "{{modelNamePlural}}", 
        method: "DELETE",
        params: { id },
      }),
      invalidatesTags: [{ type: "{{ModelNamePlural}}", id: "LIST" }],
    }),
  }),
});

export const {
  useGet{{ModelNamePlural}}Query,
  useCreate{{ModelName}}Mutation,
  useUpdate{{ModelName}}Mutation,
  useDelete{{ModelName}}Mutation,
} = {{modelNamePlural}}Api;
`;

  const validationTemplate = `
import { z } from "zod";

// Schema for creating a new {{modelName}}
export const create{{ModelName}}Schema = z.object({
  ${zodCreateFields}
  // Add other fields relevant for creation
});
export type Create{{ModelName}}Input = z.infer<typeof create{{ModelName}}Schema>;

// Schema for updating an existing {{modelName}}
export const update{{ModelName}}Schema = z.object({
  id: z.string().min(1, "ID is required for update"),
  ${zodUpdateFields}
  // Add other updatable fields
});
export type Update{{ModelName}}Input = z.infer<typeof update{{ModelName}}Schema>;

// Schema for listing {{modelNamePlural}} (query parameters)
export const {{modelNamePlural}}ListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).default(10),
  search: z.string().trim().optional().default(""),
  sortBy: z.enum(["createdAt"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});
`;

  // ****** Generate final templates/types files **********
  // --- Generate page app File ---
  let pageContent = pageTemplate
    .replace(/{{ModelNamePlural}}/g, ModelNamePlural)
    .replace(/{{modelNamePlural}}/g, modelNamePlural)
    .replace(/{{ModelName}}/g, modelName)
    .replace(/{{modelName}}/g, modelNameLower);
  createFile({
    filePath: `app/admin/${modelNamePlural}/page.tsx`,
    content: pageContent,
  });

  // --- Generate Component File ---
  let componentContent = componentTemplate
    .replace(/{{ModelNamePlural}}/g, ModelNamePlural)
    .replace(/{{modelNamePlural}}/g, modelNamePlural)
    .replace(/{{ModelName}}/g, modelName)
    .replace(/{{modelName}}/g, modelNameLower);
  createFile({
    filePath: `components/admin/${modelNamePlural}/index.tsx`,
    content: componentContent,
  });

  // --- Generate API Route File ---
  let apiRouteContent = apiRouteTemplate
    .replace(/{{ModelNamePlural}}/g, ModelNamePlural)
    .replace(/{{modelNamePlural}}/g, modelNamePlural)
    .replace(/{{ModelName}}/g, modelName)
    .replace(/{{modelName}}/g, modelNameLower);
  createFile({
    filePath: `app/api/${modelNamePlural}/route.ts`,
    content: apiRouteContent,
  });

  // --- Generate RTK Query File ---
  let rtkQueryContent = rtkQueryTemplate
    .replace(/{{ModelNamePlural}}/g, ModelNamePlural)
    .replace(/{{modelNamePlural}}/g, modelNamePlural)
    .replace(/{{ModelName}}/g, modelName)
    .replace(/{{modelName}}/g, modelNameLower);
  createFile({
    filePath: `stores/${modelNamePlural}Api.ts`,
    content: rtkQueryContent,
  });

  // --- Generate Validation File ---
  let validationContent = validationTemplate
    .replace(/{{ModelNamePlural}}/g, ModelNamePlural)
    .replace(/{{modelNamePlural}}/g, modelNamePlural)
    .replace(/{{ModelName}}/g, modelName)
    .replace(/{{modelName}}/g, modelNameLower);

  createFile({
    filePath: `lib/validations/${modelNamePlural}.ts`,
    content: validationContent,
  });

  // --- Update Sidebar File ---
  insertAfterMarker({
    filePath: "components/admin/sidebar.tsx",
    marker: "// [SIDEBAR_ITEM_MARKER]",
    content: `{
    name: "{{ModelNamePlural}}",
    href: "/admin/{{modelNamePlural}}",
    icon: Blocks,
    permission: "{{modelName}}.read",
  },`,
  });
  insertAfterMarker({
    filePath: "components/admin/sidebar.tsx",
    marker: "// [SIDEBAR_ITEM_ICON_IMPORT_MARKER]",
    content: `Blocks,`,
  });

  // --- Update Seed File For Adding Permissions ---
  insertAfterMarker({
    filePath: "prisma/seed.ts",
    marker: "// [INSERT_PERMISSIONS]",
    content: `"{{modelName}}.create",
  "{{modelName}}.read",
  "{{modelName}}.update",
  "{{modelName}}.delete",`,
  });

  // --- Update Store File ---
  insertAfterMarker({
    filePath: "stores/store.ts",
    marker: "// [IMPORTS_MARKER]",
    content: `import { {{modelNamePlural}}Api } from "./{{modelNamePlural}}Api"`,
  });
  insertAfterMarker({
    filePath: "stores/store.ts",
    marker: "// [REDUCERS_MARKER]",
    content: `[{{modelNamePlural}}Api.reducerPath]: {{modelNamePlural}}Api.reducer`,
  });
  insertAfterMarker({
    filePath: "stores/store.ts",
    marker: "// [MIDDLEWARE_MARKER]",
    content: `{{modelNamePlural}}Api.middleware,`,
  });

  // --- Append A Type To Types File ---
  appendToFile(
    "types/prisma.ts",
    `export type {{ModelName}}ListItem = Prisma.{{ModelName}}GetPayload<{}>`,
  );
}

// --- Command Line Argument Handling ---
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error("Usage: node scripts/generate-resource.ts");
  process.exit(1);
}

generateResource();
