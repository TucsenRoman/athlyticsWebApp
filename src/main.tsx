import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ProgramProvider } from "./hooks/useProgramContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ProgramProvider>
    <App />
  </ProgramProvider>
);
