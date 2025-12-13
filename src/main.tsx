import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ProgramProvider } from "./features/program_cloak/useProgramContext.tsx";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <ProgramProvider>
    <App />
  </ProgramProvider>
);
