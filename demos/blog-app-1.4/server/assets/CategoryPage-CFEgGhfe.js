import { i as api } from "../entry-server.js";
import { t as SEOHead } from "./SEOHead-CJrGekG-.js";
import { t as PostCard } from "./PostCard-C8Ketb0D.js";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/pages/CategoryPage.tsx
function CategoryPage() {
	const { category } = useParams();
	const [posts, setPosts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const formattedCategoryName = category?.replace(/-/g, " ").toUpperCase() || "CATEGORY";
	useEffect(() => {
		const controller = new AbortController();
		const fetchPosts = async () => {
			setIsLoading(true);
			try {
				setPosts((await api.get(`/content/posts?category=${category}&status=PUBLISHED`, { signal: controller.signal })).data.data);
			} catch (error) {
				if (error.name === "CanceledError" || error.name === "AbortError") return;
				console.error("Failed to fetch category posts:", error);
			} finally {
				setIsLoading(false);
			}
		};
		if (category) fetchPosts();
		return () => {
			controller.abort();
		};
	}, [category]);
	const navigate = useNavigate();
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-7xl mx-auto px-6 py-12 min-h-screen",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: `${formattedCategoryName} Posts` }),
			/* @__PURE__ */ jsxs("div", {
				className: "mb-12 pb-8 border-b border-slate-200",
				children: [/* @__PURE__ */ jsx("button", {
					onClick: () => navigate(-1),
					className: "text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4 flex items-center gap-1",
					children: "← Go Back"
				}), /* @__PURE__ */ jsxs("h1", {
					className: "text-4xl font-bold font-serif text-slate-900",
					children: ["Category: ", /* @__PURE__ */ jsx("span", {
						className: "text-slate-500",
						children: formattedCategoryName
					})]
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 lg:grid-cols-12 gap-12",
				children: /* @__PURE__ */ jsx("div", {
					className: "lg:col-span-8",
					children: isLoading ? /* @__PURE__ */ jsx("div", {
						className: "space-y-8",
						children: [
							1,
							2,
							3
						].map((n) => /* @__PURE__ */ jsx("div", { className: "animate-pulse bg-slate-50 h-48 rounded-lg border border-slate-100" }, n))
					}) : posts.length > 0 ? /* @__PURE__ */ jsx("div", {
						className: "space-y-8",
						children: posts.map((post) => /* @__PURE__ */ jsx(PostCard, {
							post,
							layout: "horizontal"
						}, post.id))
					}) : /* @__PURE__ */ jsxs("div", {
						className: "p-12 text-center bg-slate-50 rounded-xl border border-slate-100 text-slate-500",
						children: [/* @__PURE__ */ jsx("svg", {
							className: "w-12 h-12 mx-auto text-slate-300 mb-4",
							fill: "none",
							stroke: "currentColor",
							viewBox: "0 0 24 24",
							children: /* @__PURE__ */ jsx("path", {
								strokeLinecap: "round",
								strokeLinejoin: "round",
								strokeWidth: "2",
								d: "M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							})
						}), /* @__PURE__ */ jsx("p", { children: "No published articles found in this category yet." })]
					})
				})
			})
		]
	});
}
//#endregion
export { CategoryPage as default };
