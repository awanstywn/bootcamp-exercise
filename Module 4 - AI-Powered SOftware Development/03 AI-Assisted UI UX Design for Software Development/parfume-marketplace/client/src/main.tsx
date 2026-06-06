/**
 * @file main.tsx
 * @description Utility/Module for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for main operations.
 * 
 * @relations
 * Interacts with: react, react-dom/client, react-router-dom, ./App.tsx.
 * 
 * @howItWorks
 * Executes core logic by exporting necessary functions, hooks, or components. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
