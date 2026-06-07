"use client";
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { usersApi } from "./usersApi";
import { rolesApi } from "./rolesApi";
import { permissionsApi } from "./permissionApi";
import { settingsApi } from "./settingsApi";
import { profileApi } from "./profileApi";
import { relationApi } from "./relationApi";
// [IMPORTS_MARKER]

export const store = configureStore({
  reducer: {
    [usersApi.reducerPath]: usersApi.reducer,
    [rolesApi.reducerPath]: rolesApi.reducer,
    [permissionsApi.reducerPath]: permissionsApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [relationApi.reducerPath]: relationApi.reducer,
    // [REDUCERS_MARKER]
  },
  middleware: (getDefault) =>
    getDefault().concat(
      usersApi.middleware,
      rolesApi.middleware,
      permissionsApi.middleware,
      settingsApi.middleware,
      profileApi.middleware,
      relationApi.middleware,
      // [MIDDLEWARE_MARKER]
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
