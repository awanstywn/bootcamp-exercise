import { i as api } from "../entry-server.js";
import { t as SEOHead } from "./SEOHead-CJrGekG-.js";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/pages/TagsIndexPage.tsx
/**
* @fileoverview [Brief description of the file's purpose]
* @objective Provide the necessary logic and structural foundation for this specific module/component.
* @risk Contains standard logic; ensure strict typing to prevent runtime errors.
* @relations Integrates with related features within the layer.
* @logic Follows the established architectural patterns and standard guidelines.
*/
function TagsIndexPage() {
	const [tags, setTags] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [search, setSearch] = useState("");
	useEffect(() => {
		const fetchTags = async () => {
			try {
				setTags((await api.get("/content/tags")).data);
			} catch (error) {
				console.error("Failed to fetch tags:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchTags();
	}, []);
	const sortedTags = [...tags].sort((a, b) => (b._count?.posts || 0) - (a._count?.posts || 0));
	const displayedTags = search.trim() ? sortedTags.filter((t) => t.name.toLowerCase().includes(search.toLowerCase())) : sortedTags.slice(0, 50);
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-7xl mx-auto px-6 py-12 min-h-screen",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: "Explore Tags" }),
			/* @__PURE__ */ jsxs("div", {
				className: "mb-12 pb-8 border-b border-slate-200 text-center max-w-3xl mx-auto",
				children: [/* @__PURE__ */ jsx("h1", {
					className: "text-4xl font-bold font-serif text-slate-900 mb-4",
					children: "Explore Tags"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-slate-500 text-lg",
					children: "Browse topics written by our authors. Find exactly what you're looking for."
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "max-w-2xl mx-auto mb-12 relative",
				children: [/* @__PURE__ */ jsx("input", {
					type: "text",
					placeholder: "Search tags...",
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
				className: "flex flex-wrap gap-4 justify-center",
				children: [...Array(12)].map((_, i) => /* @__PURE__ */ jsx("div", { className: "w-24 h-10 bg-slate-100 animate-pulse rounded-full" }, i))
			}) : displayedTags.length > 0 ? /* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap gap-4 justify-center",
				children: displayedTags.map((tag) => /* @__PURE__ */ jsxs(Link, {
					to: `/tags/${tag.slug}`,
					className: "px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-full font-medium hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm hover:shadow-md flex items-center gap-2",
					children: [/* @__PURE__ */ jsxs("span", { children: ["#", tag.name] }), /* @__PURE__ */ jsx("span", {
						className: "text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full",
						children: tag._count?.posts || 0
					})]
				}, tag.id))
			}) : /* @__PURE__ */ jsx("div", {
				className: "text-center text-slate-500 py-12",
				children: /* @__PURE__ */ jsxs("p", { children: [
					"No tags found matching \"",
					search,
					"\""
				] })
			})
		]
	});
}
//#endregion
export { TagsIndexPage as default };
