import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/bootcamp-exercise/demos/todo-app-1.3/",
  plugins: [react(), tailwindcss()],
});
