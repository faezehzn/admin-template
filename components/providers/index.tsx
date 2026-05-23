"use client";
import { ReactNode, Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { Loading } from "../shared/loading";
import { ThemeProvider } from "./theme-provider";

const FullScreenLoader = () => (
  <div className="fixed inset-0 grid place-items-center">
    <Loading />
  </div>
);

export function Providers({ children }: { children: ReactNode }) {
  // const [isReady, setIsReady] = useState(false);

  // useEffect(() => {
  //   const markReady = () => setIsReady(true);

  //   if (typeof window !== "undefined") {
  //     if (document.readyState === "complete") {
  //       markReady();
  //     } else {
  //       window.addEventListener("load", markReady);
  //       return () => window.removeEventListener("load", markReady);
  //     }
  //   }
  // }, []);

  // if (!isReady) return <FullScreenLoader />;
  return (
    <SessionProvider>
      <ThemeProvider>
        {/* <ReduxProvider store={store}> */}
          <Suspense fallback={<FullScreenLoader />}>{children}</Suspense>
        {/* </ReduxProvider> */}
      </ThemeProvider>
    </SessionProvider>
  );
}
