import { i as api } from "../entry-server.js";
import { t as SEOHead } from "./SEOHead-CJrGekG-.js";
import { t as PostCard } from "./PostCard-C8Ketb0D.js";
import { useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/pages/PopularPostsPage.tsx
/**
* @fileoverview Popular Posts Page Component
* @objective Display the most popular posts across the blog.
* @relations Route: `/popular`.
*/
function PopularPostsPage() {
	const [results, setResults] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	useEffect(() => {
		const fetchResults = async () => {
			setIsLoading(true);
			setError(null);
			try {
				setResults((await api.get(`/content/posts?sort=popular&status=PUBLISHED`)).data.data);
			} catch (err) {
				console.error("Failed to fetch popular posts:", err);
				setError("Failed to fetch popular posts.");
			} finally {
				setIsLoading(false);
			}
		};
		fetchResults();
	}, []);
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-7xl mx-auto px-6 py-12",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: "Popular Posts" }),
			/* @__PURE__ */ jsx("h1", {
				className: "text-4xl font-bold font-serif mb-2 text-slate-900",
				children: "Popular Posts"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-slate-500 text-lg mb-12",
				children: "Trending articles and most-read stories from our community."
			}),
			isLoading ? /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
				children: [
					1,
					2,
					3,
					4,
					5,
					6
				].map((n) => /* @__PURE__ */ jsx("div", { className: "animate-pulse bg-slate-100 h-80 rounded-xl" }, n))
			}) : error ? /* @__PURE__ */ jsx("div", {
				className: "text-center py-12 text-red-500",
				children: error
			}) : results.length > 0 ? /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
				children: results.map((post) => /* @__PURE__ */ jsx(PostCard, { post }, post.id))
			}) : /* @__PURE__ */ jsx("div", {
				className: "bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center",
				children: /* @__PURE__ */ jsx("p", {
					className: "text-slate-500",
					children: "No popular posts available yet."
				})
			})
		]
	});
}
//#endregion
export { PopularPostsPage as default };
