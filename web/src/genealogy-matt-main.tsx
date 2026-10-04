import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import GenealogyMattPage from "./GenealogyMattPage";
import "./genealogy-matt.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GenealogyMattPage />
  </StrictMode>
);
