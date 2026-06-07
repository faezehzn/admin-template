import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { UserListItem } from "@/types/prisma";
import { UpdateUserInput } from "@/lib/validations/users";
import { ListArgsAPI } from "@/types";

type UsersListResponse = {
  items: UserListItem[];
  meta: { page: number; pageSize: number; total: number; pageCount: number };
};

type SortByColumn = "createdAt" | "name" | "email" | "status" | "role"


type CreateUserInput = {
  name?: string | null;
  email: string;
  roleId: string;
};

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Users", "Roles"],
  endpoints: (builder) => ({
    getUsers: builder.query<UsersListResponse, ListArgsAPI<SortByColumn>>({
      query: ({
        page,
        pageSize,
        search = "",
        sortBy = "createdAt",
        sortDir = "desc",
      }) => ({
        url: "users",
        params: { page, pageSize, search, sortBy, sortDir },
      }),
      providesTags: (res) =>
        res
          ? [
              ...res.items.map((u) => ({ type: "Users" as const, id: u.id })),
              { type: "Users" as const, id: "LIST" },
            ]
          : [{ type: "Users" as const, id: "LIST" }],
    }),

    // CREATE
    createUser: builder.mutation<{ user: UserListItem }, CreateUserInput>({
      query: (body) => ({
        url: "users",
        method: "POST",
        body,
      }),
      invalidatesTags: (ـ, error) =>
        error ? [] : [{ type: "Users", id: "LIST" }],
    }),

    // UPDATE
    updateUser: builder.mutation<{ user: UserListItem }, UpdateUserInput>({
      query: (body) => ({
        url: "users",
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result) =>
        result
          ? [
              { type: "Users", id: result.user.id },
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
    }),

    // DELETE
    deleteUser: builder.mutation<{ ok: boolean }, string>({
      query: (id) => ({
        url: `users`,
        method: "DELETE",
        params: { id },
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;
