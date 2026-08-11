import { i as api } from "../entry-server.js";
import { t as SEOHead } from "./SEOHead-CJrGekG-.js";
import { t as PostCard } from "./PostCard-C8Ketb0D.js";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/pages/TagPage.tsx
function TagPage() {
	const { tag } = useParams();
	const [posts, setPosts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const formattedTagName = tag?.replace(/-/g, " ").toUpperCase() || "TAG";
	useEffect(() => {
		const controller = new AbortController();
		const fetchPosts = async () => {
			setIsLoading(true);
			try {
				setPosts((await api.get(`/content/posts?tag=${tag}&status=PUBLISHED`, { signal: controller.signal })).data.data);
			} catch (error) {
				if (error.name === "CanceledError" || error.name === "AbortError") return;
				console.error("Failed to fetch tag posts:", error);
			} finally {
				setIsLoading(false);
			}
		};
		if (tag) fetchPosts();
		return () => {
			controller.abort();
		};
	}, [tag]);
	const navigate = useNavigate();
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-7xl mx-auto px-6 py-12 min-h-screen",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: `#${formattedTagName} Posts` }),
			/* @__PURE__ */ jsxs("div", {
				className: "mb-12 pb-8 border-b border-slate-200",
				children: [/* @__PURE__ */ jsx("button", {
					onClick: () => navigate(-1),
					className: "text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4 flex items-center gap-1",
					children: "← Go Back"
				}), /* @__PURE__ */ jsxs("h1", {
					className: "text-4xl font-bold font-serif text-slate-900",
					children: ["Tag: ", /* @__PURE__ */ jsxs("span", {
						className: "text-slate-500",
						children: ["#", formattedTagName]
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
								d: "M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
							})
						}), /* @__PURE__ */ jsx("p", { children: "No published articles found for this tag yet." })]
					})
				})
			})
		]
	});
}
//#endregion
export { TagPage as default };
