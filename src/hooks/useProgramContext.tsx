import { createContext, useContext, useState, ReactNode } from "react";

interface ProgramContextType {
  selectedProgramId: string | null;
  setSelectedProgramId: (id: string) => void;
}

const ProgramContext = createContext<ProgramContextType | undefined>(undefined);

export function ProgramProvider({ children }: { children: ReactNode }) {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  return (
    <ProgramContext.Provider value={{ selectedProgramId, setSelectedProgramId }}>
      {children}
    </ProgramContext.Provider>
  );
}

export function useProgramContext() {
  const context = useContext(ProgramContext);
  if (context === undefined) {
    throw new Error("useProgramContext must be used within a ProgramProvider");
  }
  return context;
}
