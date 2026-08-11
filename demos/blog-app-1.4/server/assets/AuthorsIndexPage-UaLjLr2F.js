import { i as api } from "../entry-server.js";
import { t as SEOHead } from "./SEOHead-CJrGekG-.js";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/pages/AuthorsIndexPage.tsx
function AuthorsIndexPage() {
	const [authors, setAuthors] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	useEffect(() => {
		const fetchAuthors = async () => {
			try {
				setAuthors((await api.get("/content/authors")).data);
			} catch (error) {
				console.error("Failed to fetch authors:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchAuthors();
	}, []);
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-7xl mx-auto px-6 py-12 min-h-screen",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: "Our Authors" }),
			/* @__PURE__ */ jsxs("div", {
				className: "mb-16 pb-8 border-b border-slate-200 text-center max-w-3xl mx-auto",
				children: [/* @__PURE__ */ jsx("h1", {
					className: "text-4xl font-bold font-serif text-slate-900 mb-4",
					children: "Our Authors"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-slate-500 text-lg",
					children: "Meet the brilliant minds sharing their knowledge on our platform."
				})]
			}),
			isLoading ? /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
				children: [...Array(6)].map((_, i) => /* @__PURE__ */ jsx("div", { className: "bg-slate-50 rounded-xl h-64 animate-pulse border border-slate-100" }, i))
			}) : authors.length > 0 ? /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
				children: authors.map((author) => /* @__PURE__ */ jsxs(Link, {
					to: `/authors/${encodeURIComponent(author.name.replace(/ /g, "-").toLowerCase())}`,
					className: "group bg-white border border-slate-200 rounded-xl p-8 hover:border-slate-400 hover:shadow-lg transition-all text-center flex flex-col items-center",
					children: [
						author.avatarUrl ? /* @__PURE__ */ jsx("img", {
							src: author.avatarUrl,
							alt: author.name,
							className: "w-24 h-24 rounded-full object-cover mb-4 ring-4 ring-slate-50 group-hover:ring-slate-100 transition-all"
						}) : /* @__PURE__ */ jsx("div", {
							className: "w-24 h-24 bg-slate-900 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-4 ring-4 ring-slate-50 group-hover:ring-slate-100 transition-all",
							children: author.name.charAt(0).toUpperCase()
						}),
						/* @__PURE__ */ jsx("h2", {
							className: "text-xl font-bold text-slate-900 mb-2",
							children: author.name
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-slate-500 text-sm mb-6 line-clamp-2",
							children: author.bio || "This author has not provided a bio yet."
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-auto inline-flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 px-4 py-1.5 rounded-full group-hover:bg-slate-900 group-hover:text-white transition-colors",
							children: [
								/* @__PURE__ */ jsx("svg", {
									className: "w-4 h-4",
									fill: "none",
									stroke: "currentColor",
									viewBox: "0 0 24 24",
									children: /* @__PURE__ */ jsx("path", {
										strokeLinecap: "round",
										strokeLinejoin: "round",
										strokeWidth: "2",
										d: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"
									})
								}),
								author._count.posts,
								" ",
								author._count.posts === 1 ? "Article" : "Articles"
							]
						})
					]
				}, author.id))
			}) : /* @__PURE__ */ jsx("div", {
				className: "text-center text-slate-500 py-12",
				children: /* @__PURE__ */ jsx("p", { children: "No authors found." })
			})
		]
	});
}
//#endregion
export { AuthorsIndexPage as default };
