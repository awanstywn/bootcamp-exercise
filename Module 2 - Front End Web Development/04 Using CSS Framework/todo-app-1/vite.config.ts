import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/bootcamp-exercise/demos/todo-app/",
  plugins: [react(), tailwindcss()],
});
