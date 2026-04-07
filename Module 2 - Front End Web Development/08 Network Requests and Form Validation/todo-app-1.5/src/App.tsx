/**
 * App — Root component that handles routing and page layout.
 *
 * If user is NOT logged in → show Sign In or Sign Up page
 * If user IS logged in → show Todo app
 */

import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/useAuthStore";

// ── Pages Imports ──
import TodoPage from "./pages/TodoPage";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

import "./App.css";

// ── App: Root component with routing ───────────────────────
function App() {
  // Read login state from the auth store
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  return (
    <Routes>
      {/* 
        Route for Sign In page.
        If user is already logged in → redirect to home page.
        If not → show the SignIn component.
      */}
      <Route
        path="/signin"
        element={isLoggedIn ? <Navigate to="/" replace /> : <SignIn />}
      />

      {/* 
        Route for Sign Up page.
        If user is already logged in → redirect to home page.
        If not → show the SignUp component.
      */}
      <Route
        path="/signup"
        element={isLoggedIn ? <Navigate to="/" replace /> : <SignUp />}
      />

      {/*
        Route for Todo page (home).
        If user is NOT logged in → redirect to sign in page.
        If logged in → show the TodoPage.
      */}
      <Route
        path="/"
        element={isLoggedIn ? <TodoPage /> : <Navigate to="/signin" replace />}
      />
    </Routes>
  );
}

export default App;
