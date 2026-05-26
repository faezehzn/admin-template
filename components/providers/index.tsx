"use client";
import { ReactNode, Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { Loading } from "../shared/loading";
import { ThemeProvider } from "./theme-provider";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/stores/store";

const FullScreenLoader = () => (
  <div className="fixed inset-0 grid place-items-center">
    <Loading />
  </div>
);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ReduxProvider store={store}>
          <Suspense fallback={<FullScreenLoader />}>{children}</Suspense>
        </ReduxProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
