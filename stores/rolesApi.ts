import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RoleOption } from "@/types/prisma";
import { CreateRoleInput, UpdateRoleInput } from "@/lib/validations/roles";

export const rolesApi = createApi({
  reducerPath: "rolesApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Roles"],
  endpoints: (builder) => ({
    // GET ALL
    getRoles: builder.query<RoleOption[], void>({
      query: () => ({
        url: "roles",
      }),

      providesTags: (res) =>
        res
          ? [
              ...res.map((r) => ({
                type: "Roles" as const,
                id: r.id,
              })),
              { type: "Roles" as const, id: "LIST" },
            ]
          : [{ type: "Roles" as const, id: "LIST" }],
    }),

    // CREATE
    createRole: builder.mutation<{ role: RoleOption }, CreateRoleInput>({
      query: (body) => ({
        url: "roles",
        method: "POST",
        body,
      }),

      invalidatesTags: [{ type: "Roles", id: "LIST" }],
    }),

    // UPDATE
    updateRole: builder.mutation<{ role: RoleOption }, UpdateRoleInput>({
      query: (body) => ({
        url: "roles",
        method: "PATCH",
        body,
      }),

      invalidatesTags: (result) =>
        result
          ? [
              { type: "Roles", id: result.role.id },
              { type: "Roles", id: "LIST" },
            ]
          : [{ type: "Roles", id: "LIST" }],
    }),

    // DELETE
    deleteRole: builder.mutation<{ ok: boolean }, string>({
      query: (id) => ({
        url: "roles",
        method: "DELETE",
        params: { id },
      }),

      invalidatesTags: [{ type: "Roles", id: "LIST" }],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = rolesApi;
