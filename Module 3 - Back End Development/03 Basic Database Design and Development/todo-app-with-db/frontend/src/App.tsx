/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE: App.tsx
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DESCRIPTION:
 *   Root component that handles Application Routing and Layout management.
 *   Determines which page to render based on the user's authentication status.
 *
 * RELATIONS:
 *   - main.tsx           → Mounts this component into the React root.
 *   - store/useAuthStore.ts → Provides 'isLoggedIn' state for route protection.
 *   - pages/*            → All viewable screens in the application.
 *
 * FLOW:
 *   1. Check 'isLoggedIn' from global state.
 *   2. If route is protected (/) and not logged in → Redirect to /signin.
 *   3. If route is public (/shared/:id) → Always allow access.
 *   4. If route is auth (/signin, /signup) and already logged in → Redirect to /.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/useAuthStore";

// --- Pages ---
import TodoPage from "./pages/TodoPage";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { SharedTodoPage } from "./pages/SharedTodoPage";

import "./App.css";

function App() {
  // Sync login status from the global auth store
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  return (
    <Routes>
      {/* --- Authentication Routes --- */}
      <Route
        path="/signin"
        element={isLoggedIn ? <Navigate to="/" replace /> : <SignIn />}
      />
      <Route
        path="/signup"
        element={isLoggedIn ? <Navigate to="/" replace /> : <SignUp />}
      />

      {/* --- Protected Dashboard --- */}
      <Route
        path="/"
        element={isLoggedIn ? <TodoPage /> : <Navigate to="/signin" replace />}
      />

      {/* --- Public Shared View --- */}
      <Route path="/shared/:id" element={<SharedTodoPage />} />
      
      {/* Catch-all: Redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
