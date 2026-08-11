import { i as api } from "../entry-server.js";
import { t as SEOHead } from "./SEOHead-CJrGekG-.js";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/pages/CategoriesIndexPage.tsx
/**
* @fileoverview [Brief description of the file's purpose]
* @objective Provide the necessary logic and structural foundation for this specific module/component.
* @risk Contains standard logic; ensure strict typing to prevent runtime errors.
* @relations Integrates with related features within the layer.
* @logic Follows the established architectural patterns and standard guidelines.
*/
function CategoriesIndexPage() {
	const [categories, setCategories] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [search, setSearch] = useState("");
	useEffect(() => {
		const controller = new AbortController();
		const fetchCategories = async () => {
			setIsLoading(true);
			try {
				setCategories((await api.get("/content/categories", { signal: controller.signal })).data);
			} catch (error) {
				console.error("Failed to fetch categories:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchCategories();
	}, []);
	const sortedCategories = [...categories].sort((a, b) => (b._count?.posts || 0) - (a._count?.posts || 0));
	const displayedCategories = search.trim() ? sortedCategories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())) : sortedCategories;
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-7xl mx-auto px-6 py-12 min-h-screen",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: "Explore Categories" }),
			/* @__PURE__ */ jsxs("div", {
				className: "mb-12 pb-8 border-b border-slate-200 text-center max-w-3xl mx-auto",
				children: [/* @__PURE__ */ jsx("h1", {
					className: "text-4xl font-bold font-serif text-slate-900 mb-4",
					children: "Explore Categories"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-slate-500 text-lg",
					children: "Browse articles by category and discover topics that interest you."
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "max-w-2xl mx-auto mb-12 relative",
				children: [/* @__PURE__ */ jsx("input", {
					type: "text",
					placeholder: "Search categories...",
					value: search,
					onChange: (e) => setSearch(e.target.value),
					className: "w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-lg outline-none focus:border-slate-900 transition-colors shadow-sm"
				}), /* @__PURE__ */ jsx("svg", {
					className: "w-6 h-6 absolute left-4 top-4 text-slate-400",
					fill: "none",
					stroke: "currentColor",
					viewBox: "0 0 24 24",
					children: /* @__PURE__ */ jsx("path", {
						strokeLinecap: "round",
						strokeLinejoin: "round",
						strokeWidth: "2",
						d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					})
				})]
			}),
			isLoading ? /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
				children: [...Array(6)].map((_, i) => /* @__PURE__ */ jsx("div", { className: "h-32 bg-slate-100 animate-pulse rounded-xl" }, i))
			}) : displayedCategories.length > 0 ? /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
				children: displayedCategories.map((category) => /* @__PURE__ */ jsxs(Link, {
					to: `/categories/${category.slug}`,
					className: "p-6 bg-white border border-slate-200 rounded-xl hover:border-slate-900 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
						className: "text-xl font-bold font-serif text-slate-900 mb-2 group-hover:text-slate-700 transition-colors",
						children: category.name
					}), category.description && /* @__PURE__ */ jsx("p", {
						className: "text-slate-500 text-sm line-clamp-2",
						children: category.description
					})] }), /* @__PURE__ */ jsxs("div", {
						className: "mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "text-slate-500",
							children: [category._count?.posts || 0, " Articles"]
						}), /* @__PURE__ */ jsx("span", {
							className: "text-slate-900 font-medium group-hover:underline",
							children: "Explore →"
						})]
					})]
				}, category.id))
			}) : /* @__PURE__ */ jsx("div", {
				className: "text-center text-slate-500 py-12",
				children: /* @__PURE__ */ jsxs("p", { children: [
					"No categories found matching \"",
					search,
					"\""
				] })
			})
		]
	});
}
//#endregion
export { CategoriesIndexPage as default };
