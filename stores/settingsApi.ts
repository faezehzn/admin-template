import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const settingsApi = createApi({
  reducerPath: "settingsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Settings"],
  endpoints: (builder) => ({
    getSettings: builder.query<Record<string, string>, void>({
      query: () => "settings",
      providesTags: ["Settings"],
    }),
    updateSetting: builder.mutation<void, { key: string; value: string | number | boolean }>({
      query: (payload) => ({
        url: "settings",
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["Settings"],
    }),
    sendEmail: builder.mutation<{ message: string }, {to: string, subject: string, text: string }>({
      query: (body) => ({
        url: "settings/send-email",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useUpdateSettingMutation,
  useSendEmailMutation,
} = settingsApi;
