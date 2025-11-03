import { createContext, useContext } from "react";

interface EditModeContextType {
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
}

export const EditModeContext = createContext<EditModeContextType>({
  isEditMode: false,
  setIsEditMode: () => {},
});

// ✅ this is the hook you’ll import later
export const useEditMode = () => useContext(EditModeContext);