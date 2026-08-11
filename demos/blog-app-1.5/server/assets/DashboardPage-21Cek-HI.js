import { r as useAuthStore } from "../entry-server.js";
import { t as SEOHead } from "./SEOHead-CJrGekG-.js";
import { Link } from "react-router-dom";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/pages/DashboardPage.tsx
/**
* @fileoverview Dashboard Page Component
* @objective Serve as the central hub for authenticated users to manage their profile, posts, and settings.
* @risk Exposing admin links to non-admins. Mitigated by conditional rendering based on `user.role`.
* @relations Route: `/dashboard`. Protected by `<ProtectedRoute>`.
* @logic
* - Reads `user` object from `authStore`.
* - Displays personalized welcome message.
* - Conditionally renders the "Admin Settings" card only if `user.role === 'ADMIN'`.
*/
function DashboardPage() {
	const { user } = useAuthStore();
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-7xl mx-auto px-6 py-12",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: "Dashboard" }),
			/* @__PURE__ */ jsx("h1", {
				className: "text-3xl font-bold mb-8",
				children: "Dashboard"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "bg-white p-6 rounded-xl border border-slate-200 shadow-sm",
				children: [
					/* @__PURE__ */ jsxs("h2", {
						className: "text-xl font-bold mb-4",
						children: [
							"Welcome back, ",
							user?.name || "User",
							"!"
						]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-slate-600 mb-6",
						children: "Manage your posts, profile, and settings from here."
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 md:grid-cols-3 gap-6",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "p-6 bg-slate-50 rounded-lg border border-slate-100 flex flex-col",
								children: [
									/* @__PURE__ */ jsx("h3", {
										className: "font-bold text-lg mb-2",
										children: "My Posts"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-slate-500 mb-4 flex-1",
										children: "View, edit, and manage your published articles and drafts."
									}),
									/* @__PURE__ */ jsx("div", {
										className: "mt-auto flex gap-4",
										children: /* @__PURE__ */ jsx(Link, {
											to: "/dashboard/posts",
											className: "text-primary-600 font-medium hover:underline inline-block w-fit",
											children: "Manage Posts →"
										})
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "p-6 bg-slate-50 rounded-lg border border-slate-100 flex flex-col",
								children: [
									/* @__PURE__ */ jsx("h3", {
										className: "font-bold text-lg mb-2",
										children: "Profile Settings"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-slate-500 mb-4 flex-1",
										children: "Update your personal information and password."
									}),
									/* @__PURE__ */ jsx(Link, {
										to: "/profile",
										className: "text-primary-600 font-medium hover:underline mt-auto inline-block w-fit",
										children: "Edit Profile →"
									})
								]
							}),
							user?.role === "ADMIN" && /* @__PURE__ */ jsxs("div", {
								className: "p-6 bg-slate-50 rounded-lg border border-slate-100 flex flex-col",
								children: [
									/* @__PURE__ */ jsx("h3", {
										className: "font-bold text-lg mb-2",
										children: "Admin Settings"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-slate-500 mb-4 flex-1",
										children: "Manage users, roles, categories, and tags."
									}),
									/* @__PURE__ */ jsx(Link, {
										to: "/admin",
										className: "text-primary-600 font-medium hover:underline mt-auto inline-block w-fit",
										children: "Go to Admin →"
									})
								]
							})
						]
					})
				]
			})
		]
	});
}
//#endregion
export { DashboardPage as default };
