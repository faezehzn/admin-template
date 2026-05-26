import { Permission } from "@prisma/client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const permissionsApi = createApi({
  reducerPath: "permissionsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
  }),

  tagTypes: ["Permissions"],

  endpoints: (builder) => ({
    /**
     * GET ALL
     */
    getPermissions: builder.query<Permission[], void>({
      query: () => ({
        url: "permissions",
      }),

      providesTags: [
        {
          type: "Permissions",
          id: "LIST",
        },
      ],
    }),
  }),
});

export const { useGetPermissionsQuery } = permissionsApi;
