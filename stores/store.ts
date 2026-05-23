"use client";
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

export const store = configureStore({
  reducer: {
  },
//   middleware: (getDefault) =>
    // getDefault().concat(
    //   projectsApi.middleware,
    //   usersApi.middleware,
    //   concreteRequestsApi.middleware,
    //   quotesApi.middleware,
    // ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
