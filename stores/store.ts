"use client";
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { usersApi } from "./usersApi";
import { rolesApi } from "./rolesApi";
import { permissionsApi } from "./permissionApi";
import { settingsApi } from "./settingsApi";
import { profileApi } from "./profileApi";

export const store = configureStore({
  reducer: {
    [usersApi.reducerPath]: usersApi.reducer,
    [rolesApi.reducerPath]: rolesApi.reducer,
    [permissionsApi.reducerPath]: permissionsApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(
      usersApi.middleware,
      rolesApi.middleware,
      permissionsApi.middleware,
      settingsApi.middleware,
      profileApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
