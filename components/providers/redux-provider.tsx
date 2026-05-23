import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/stores/store";


export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <ReduxProvider store={store}>{children}</ReduxProvider>;
}
