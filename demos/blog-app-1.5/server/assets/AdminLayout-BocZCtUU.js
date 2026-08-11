import { r as useAuthStore } from "../entry-server.js";
import { t as SEOHead } from "./SEOHead-CJrGekG-.js";
import { Link, NavLink, Outlet } from "react-router-dom";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/pages/admin/AdminLayout.tsx
/**
* @fileoverview Admin Layout Component
* @objective Provide a persistent sidebar navigation wrapper for all Admin-related pages.
* @risk None inherently, but relies heavily on `ProtectedRoute` wrapping this component in `App.tsx` to prevent unauthorized access.
* @relations Route: `/admin/*`. Parent to `AdminUsersPage`, `AdminPostsPage`, etc., rendering them via `<Outlet />`.
* @logic
* - Defines a list of navigation items.
* - Highlights the active link based on `useLocation().pathname`.
* - Renders a sidebar (hidden on mobile) and a main content area.
*/
function AdminLayout() {
	const { user } = useAuthStore();
	return /* @__PURE__ */ jsxs("div", {
		className: "flex min-h-[calc(100vh-140px)] bg-slate-50",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: "Admin Dashboard" }),
			/* @__PURE__ */ jsxs("aside", {
				className: "w-64 bg-white border-r border-slate-200 p-6 hidden md:block",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "mb-8",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "text-sm font-bold text-slate-500 uppercase tracking-wider mb-2",
							children: "Admin Panel"
						}), /* @__PURE__ */ jsxs("p", {
							className: "text-xs text-slate-400",
							children: ["Logged in as ", user?.name || "Admin"]
						})]
					}),
					/* @__PURE__ */ jsx("nav", {
						className: "space-y-1.5",
						children: [
							{
								name: "Dashboard Overview",
								path: "/admin"
							},
							{
								name: "Users",
								path: "/admin/users"
							},
							{
								name: "Posts",
								path: "/admin/posts"
							},
							{
								name: "Settings",
								path: "/admin/settings"
							}
						].map((item) => /* @__PURE__ */ jsx(NavLink, {
							to: item.path,
							end: item.path === "/admin",
							className: ({ isActive }) => `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-primary-50 text-primary-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`,
							children: item.name
						}, item.path))
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mt-12 pt-6 border-t border-slate-200",
						children: /* @__PURE__ */ jsx(Link, {
							to: "/dashboard",
							className: "flex items-center px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors",
							children: "← Back to Dashboard"
						})
					})
				]
			}),
			/* @__PURE__ */ jsx("main", {
				className: "flex-1 p-8",
				children: /* @__PURE__ */ jsx(Outlet, {})
			})
		]
	});
}
//#endregion
export { AdminLayout as default };
