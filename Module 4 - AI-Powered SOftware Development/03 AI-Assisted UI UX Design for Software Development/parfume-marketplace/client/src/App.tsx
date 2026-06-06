/**
 * @file App.tsx
 * @description Utility/Module for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for App operations.
 * 
 * @relations
 * Interacts with: react-router-dom, ./components/layout/Layout, ./pages/HomePage, ./pages/ShopPage, ./pages/ProductDetailPage.
 * 
 * @howItWorks
 * Executes core logic by exporting necessary functions, hooks, or components. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AuthPage from "./pages/AuthPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import ProfilePage from "./pages/ProfilePage";
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminProductEditPage from "./pages/admin/AdminProductEditPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminPagesList from "./pages/admin/AdminPagesList";
import AdminPageEdit from "./pages/admin/AdminPageEdit";
import ContentPage from "./pages/ContentPage";
import { useEffect } from "react";
import apiClient from "./lib/apiClient";
import { API_ROUTES } from "./lib/routes";
import { useAuthStore } from "./stores/authStore";

function App() {
  const { token, login, logout } = useAuthStore();

  // Validate token on mount
  useEffect(() => {
    if (token) {
      apiClient
        .get(API_ROUTES.AUTH.ME)
        .then((res) => {
          login(res.data.data.user, token);
        })
        .catch(() => {
          logout();
        });
    }
  }, []); // Run once on mount

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="products/:slug" element={<ProductDetailPage />} />
        <Route path="auth" element={<AuthPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="order-confirmation/:id" element={<OrderConfirmationPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route path="pages/:slug" element={<ContentPage />} />
        {/* Fallback 404 could go here */}
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/:id" element={<AdminProductEditPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="pages" element={<AdminPagesList />} />
        <Route path="pages/:slug" element={<AdminPageEdit />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
