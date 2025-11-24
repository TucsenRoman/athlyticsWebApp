import { createContext, useContext } from "react";

interface DemoContextType {
  demoMode: boolean;
}

export const DemoContext = createContext<DemoContextType>({
  demoMode: false,
});

export const useDemo = () => useContext(DemoContext);
