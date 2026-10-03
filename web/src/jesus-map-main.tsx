import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import JesusMapPage from "./JesusMapPage";
import "./jesus-map.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <JesusMapPage />
  </StrictMode>
);
