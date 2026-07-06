# Blog Application - Client (Frontend)

This is the frontend layer of the Fullstack Blog Application. It is a modern Single Page Application (SPA) built with React 19 and bundled using Vite for blazing-fast Hot Module Replacement (HMR) and optimized Server-Side Rendering (SSR).

## 🚀 Tech Stack

- **Core:** React 19, TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS 4
- **State Management:** Zustand 5 (Global State)
- **Routing:** React Router v7
- **Data Fetching:** Axios (with custom interceptors for JWT rotation)
- **SEO & PWA:** React Helmet Async, Vite PWA

## 📁 Folder Structure

```text
client/
├── src/
│   ├── components/    # Reusable, "dumb" UI components (Buttons, Cards, Layouts)
│   ├── pages/         # Route-level components (Home, Admin, PostDetail)
│   ├── store/         # Zustand global state stores (e.g., authStore.ts)
│   ├── lib/           # Utility libraries (e.g., Axios configuration)
│   ├── index.css      # Global CSS and Tailwind directives
│   ├── App.tsx        # Main application router
│   ├── entry-client.tsx # Hydration entry point for the browser
│   └── entry-server.tsx # SSR entry point for the Express server
├── server.ts          # Express wrapper to serve Vite SSR
```

## 🛠️ Development

*Note: Because this project uses NPM Workspaces, you should generally run commands from the root directory of the monorepo.*

However, if you want to run **only** the frontend for UI testing (without the backend):

1. Ensure dependencies are installed at the root (`npm install`).
2. Start the Vite dev server wrapper:
   ```bash
   npm run dev
   ```

## 🔒 Types and API Contracts

This frontend relies heavily on the `shared/` workspace for strict typing. 
**Do not create local interfaces for API responses.** Always import `UserDTO`, `PostDTO`, `Role` etc., directly from `../../shared/src/types.ts` to ensure the frontend stays perfectly in sync with the backend database.
