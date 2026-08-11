import { i as api } from "../entry-server.js";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/pages/admin/AdminOverviewPage.tsx
function AdminOverviewPage() {
	const [stats, setStats] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	useEffect(() => {
		api.get("/admin/analytics").then((res) => setStats(res.data)).catch(console.error).finally(() => setIsLoading(false));
	}, []);
	if (isLoading) return /* @__PURE__ */ jsx("div", {
		className: "p-8 text-slate-500",
		children: "Loading overview..."
	});
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("h1", {
			className: "text-2xl font-bold mb-8",
			children: "Dashboard Overview"
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-12",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "text-slate-500 text-sm font-medium uppercase tracking-wider mb-2",
							children: "Total Users"
						}),
						/* @__PURE__ */ jsx("span", {
							className: "text-4xl font-bold font-serif text-slate-900",
							children: stats?.users || 0
						}),
						/* @__PURE__ */ jsx(Link, {
							to: "/admin/users",
							className: "mt-4 text-sm text-primary-600 hover:underline",
							children: "Manage Users →"
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "text-slate-500 text-sm font-medium uppercase tracking-wider mb-2",
							children: "Total Posts"
						}),
						/* @__PURE__ */ jsx("span", {
							className: "text-4xl font-bold font-serif text-slate-900",
							children: stats?.posts || 0
						}),
						/* @__PURE__ */ jsx(Link, {
							to: "/admin/posts",
							className: "mt-4 text-sm text-primary-600 hover:underline",
							children: "Manage Posts →"
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "text-slate-500 text-sm font-medium uppercase tracking-wider mb-2",
							children: "Total Comments"
						}),
						/* @__PURE__ */ jsx("span", {
							className: "text-4xl font-bold font-serif text-slate-900",
							children: stats?.comments || 0
						}),
						/* @__PURE__ */ jsx("span", {
							className: "mt-4 text-sm text-slate-400",
							children: "Moderation coming soon"
						})
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "bg-primary-50 rounded-xl p-8 border border-primary-100",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "text-xl font-bold text-primary-900 mb-2",
				children: "Welcome to the Admin Panel"
			}), /* @__PURE__ */ jsx("p", {
				className: "text-primary-700 max-w-2xl",
				children: "Use the sidebar to navigate through the administrative features. You can manage user roles, approve role requests, and moderate all content across the platform."
			})]
		})
	] });
}
//#endregion
export { AdminOverviewPage as default };
