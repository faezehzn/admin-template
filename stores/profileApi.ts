import { UpdateProfileInput } from "@/lib/validations/profile";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const profileApi = createApi({
  reducerPath: "profileApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Profile"],
  endpoints: (builder) => ({
    getProfile: builder.query<UpdateProfileInput, void>({
      query: () => ({
        url: "profile",
      }),

      providesTags: ["Profile"],
    }),

    updateProfile: builder.mutation({
      query: (body) => ({
        url: "profile",
        method: "PATCH",
        body,
      }),

      invalidatesTags: ["Profile"],
    }),

    changePassword: builder.mutation({
      query: (body) => ({
        url: "profile/change-password",
        method: "PATCH",
        body,
      }),
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = profileApi;
