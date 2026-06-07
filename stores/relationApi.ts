import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type RelationItem = {
  id: string | number;
  label: string;
};

export const relationApi = createApi({
  reducerPath: "relationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/",
  }),
  tagTypes: ["Relation"],
  endpoints: (builder) => ({
    getRelation: builder.query<RelationItem[], string>({
      query: (model) => `${model.toLowerCase()}s`,
      transformResponse: (
        resp:
          | RelationItem[]
          | {
              items: any[];
            },
      ): RelationItem[] => {
        const items = Array.isArray(resp) ? resp : (resp.items ?? []);

        return items.map((i: any) => ({
          id: i.id,
          label: i.name ?? i.title ?? String(i.id),
        }));
      },
      providesTags: (_result, __error, model) => [
        { type: "Relation", id: model },
      ],
    }),
  }),
});

export const { useGetRelationQuery } = relationApi;
