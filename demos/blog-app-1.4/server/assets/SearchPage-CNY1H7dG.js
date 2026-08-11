import { i as api } from "../entry-server.js";
import { t as SEOHead } from "./SEOHead-CJrGekG-.js";
import { t as PostCard } from "./PostCard-C8Ketb0D.js";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/pages/SearchPage.tsx
/**
* @fileoverview Search Page Component (Stub)
* @objective Provide a UI for users to query the blog for specific terms.
* @risk N/A - Currently a placeholder.
* @relations Route: `/search`.
* @logic
* - Renders a static placeholder indicating pending search functionality implementation.
*/
function SearchPage() {
	const [searchParams] = useSearchParams();
	const query = searchParams.get("q") || "";
	const [results, setResults] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	useEffect(() => {
		if (!query.trim()) {
			setResults([]);
			return;
		}
		const fetchResults = async () => {
			setIsLoading(true);
			setError(null);
			try {
				setResults((await api.get(`/content/posts?search=${encodeURIComponent(query)}`)).data.data);
			} catch (err) {
				console.error("Search error:", err);
				setError("Failed to fetch search results.");
			} finally {
				setIsLoading(false);
			}
		};
		fetchResults();
	}, [query]);
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-7xl mx-auto px-6 py-12",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: query ? `Search: ${query}` : "Search" }),
			/* @__PURE__ */ jsxs("h1", {
				className: "text-3xl font-bold mb-8",
				children: [
					"Search Results for \"",
					query,
					"\""
				]
			}),
			isLoading ? /* @__PURE__ */ jsx("div", {
				className: "text-center py-12 text-slate-500",
				children: "Searching..."
			}) : error ? /* @__PURE__ */ jsx("div", {
				className: "text-center py-12 text-red-500",
				children: error
			}) : results.length > 0 ? /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
				children: results.map((post) => /* @__PURE__ */ jsx(PostCard, { post }, post.id))
			}) : /* @__PURE__ */ jsxs("div", {
				className: "bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center",
				children: [
					/* @__PURE__ */ jsx("svg", {
						className: "w-12 h-12 text-slate-300 mx-auto mb-4",
						fill: "none",
						stroke: "currentColor",
						viewBox: "0 0 24 24",
						"aria-hidden": "true",
						children: /* @__PURE__ */ jsx("path", {
							strokeLinecap: "round",
							strokeLinejoin: "round",
							strokeWidth: 1.5,
							d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						})
					}),
					/* @__PURE__ */ jsx("h2", {
						className: "text-xl font-semibold text-slate-700 mb-2",
						children: "No results found"
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "text-slate-500",
						children: [
							"We couldn't find any articles matching \"",
							query,
							"\". Try adjusting your search terms."
						]
					})
				]
			})
		]
	});
}
//#endregion
export { SearchPage as default };
