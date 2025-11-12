import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AutoRedeemApp } from "./components/AutoRedeemApp";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AutoRedeemApp />
  </StrictMode>
);
