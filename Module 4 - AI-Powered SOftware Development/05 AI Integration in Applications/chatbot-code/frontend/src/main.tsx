/**
 * @file main.tsx
 * @description The main entry point for the React application. Mounts the root component to the DOM.
 * @module Frontend/Entry
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
