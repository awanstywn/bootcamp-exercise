/**
 * @file routes.ts
 * @description Utility/Module for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for routes operations.
 * 
 * @relations
 * Functions independently as a standalone module.
 * 
 * @howItWorks
 * Executes core logic by exporting necessary functions, hooks, or components. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

export const API_ROUTES = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    ME: "/auth/me",
  },
  PRODUCTS: {
    LIST: "/products",
    DETAIL: (slug: string) => `/products/${slug}`,
  },
  ORDERS: {
    CREATE: "/orders",
    GET_BY_ID: (id: string) => `/orders/${id}`,
    LIST_MY_ORDERS: "/orders/my/list",
    CANCEL: (id: string) => `/orders/${id}/cancel`,
  },
  SETTINGS: {
    GET: "/settings",
  },
  PAGES: {
    GET: (slug: string) => `/pages/${slug}`,
  },
  ADMIN: {
    PRODUCTS: "/admin/products",
    PRODUCT_BY_ID: (id: string) => `/admin/products/${id}`,
    PRODUCT_STOCK: (id: string) => `/admin/products/${id}/stock`,
    PRODUCT_IMAGES: (id: string) => `/admin/products/${id}/images`,
    ORDERS: "/admin/orders",
    ORDER_STATUS: (id: string) => `/admin/orders/${id}/status`,
    SETTINGS: "/admin/settings",
    PAGES: "/admin/pages",
    PAGE_BY_SLUG: (slug: string) => `/admin/pages/${slug}`,
  }
} as const;
