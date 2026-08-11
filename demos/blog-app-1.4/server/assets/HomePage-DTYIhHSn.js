import { i as api } from "../entry-server.js";
import { t as SEOHead } from "./SEOHead-CJrGekG-.js";
import { t as PostCard } from "./PostCard-C8Ketb0D.js";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/pages/HomePage.tsx
/**
* @fileoverview Home Page Component
* @objective Serve as the landing page, displaying the latest published articles and popular tags.
* @risk High layout shift if loading states are not handled properly. Handled here via skeleton loaders (`animate-pulse`).
* @relations Route: `/`. Uses `api.get` to fetch from `/content/posts` and `/content/tags`.
* @logic
* - `useEffect` triggers concurrent API calls for posts and tags on mount.
* - Manages `isLoading` state to render skeleton placeholders before data arrives.
* - Displays posts using the `PostCard` component.
*/
function HomePage() {
	const [posts, setPosts] = useState([]);
	const [popularPosts, setPopularPosts] = useState([]);
	const [isPostsLoading, setIsPostsLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [sort, setSort] = useState("newest");
	const [meta, setMeta] = useState({
		totalPages: 1,
		hasNextPage: false,
		hasPrevPage: false
	});
	useEffect(() => {
		const controller = new AbortController();
		const fetchSidebarData = async () => {
			try {
				const [popularRes] = await Promise.all([api.get("/content/posts?limit=4&status=PUBLISHED&sort=popular", { signal: controller.signal })]);
				setPopularPosts(popularRes.data.data);
			} catch (error) {
				if (error.name === "CanceledError" || error.name === "AbortError") return;
				console.error("Failed to fetch sidebar data:", error);
			}
		};
		fetchSidebarData();
		return () => controller.abort();
	}, []);
	useEffect(() => {
		const controller = new AbortController();
		setIsPostsLoading(true);
		const fetchPosts = async () => {
			try {
				const res = await api.get(`/content/posts?limit=6&status=PUBLISHED&page=${page}&sort=${sort}`, { signal: controller.signal });
				setPosts(res.data.data);
				setMeta(res.data.meta);
			} catch (error) {
				if (error.name === "CanceledError" || error.name === "AbortError") return;
				console.error("Failed to fetch posts:", error);
			} finally {
				setIsPostsLoading(false);
			}
		};
		fetchPosts();
		return () => controller.abort();
	}, [page, sort]);
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-7xl mx-auto px-6 py-12",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: "Home" }),
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col md:flex-row items-center gap-12 mb-16 pb-16 border-b border-slate-200",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex-1 space-y-6",
					children: [
						/* @__PURE__ */ jsx("h1", {
							className: "text-4xl md:text-6xl font-bold font-serif text-slate-900 leading-tight tracking-tight",
							children: "Welcome to BlogApp"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-xl text-slate-600 leading-relaxed max-w-xl",
							children: "Read articles on technology, design, development and more from our amazing authors."
						}),
						/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("button", {
							onClick: () => {
								setSort("newest");
								setPage(1);
								document.getElementById("latest-posts")?.scrollIntoView({ behavior: "smooth" });
							},
							className: "bg-slate-900 text-white px-6 py-3 rounded text-sm font-medium hover:bg-slate-800 transition-colors",
							children: "Explore Latest Posts"
						}) })
					]
				}), /* @__PURE__ */ jsx("div", {
					className: "flex-1 w-full relative aspect-4/3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center overflow-hidden shadow-sm",
					children: /* @__PURE__ */ jsx("img", {
						src: "/hero-image.png",
						alt: "Hero illustration",
						className: "w-full h-full object-cover",
						fetchPriority: "high"
					})
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 lg:grid-cols-12 gap-12",
				children: [/* @__PURE__ */ jsxs("div", {
					id: "latest-posts",
					className: "lg:col-span-8 pr-0 lg:pr-8 border-r-0 lg:border-r border-slate-200",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between mb-8 border-b border-slate-200 pb-2",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "text-xl font-bold font-serif text-slate-900",
							children: "Posts"
						}), /* @__PURE__ */ jsxs("select", {
							"aria-label": "Sort posts",
							value: sort,
							onChange: (e) => {
								setSort(e.target.value);
								setPage(1);
							},
							className: "text-sm border border-slate-200 rounded px-3 py-1.5 outline-none focus:border-slate-900 bg-white",
							children: [
								/* @__PURE__ */ jsx("option", {
									value: "newest",
									children: "Date: Newest"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "oldest",
									children: "Date: Oldest"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "title_asc",
									children: "Title: A-Z (Ascending)"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "title_desc",
									children: "Title: Z-A (Descending)"
								})
							]
						})]
					}), isPostsLoading ? /* @__PURE__ */ jsx("div", {
						className: "space-y-8",
						children: [
							1,
							2,
							3
						].map((n) => /* @__PURE__ */ jsx("div", { className: "animate-pulse bg-slate-50 h-48 rounded-lg border border-slate-100" }, n))
					}) : posts.length > 0 ? /* @__PURE__ */ jsxs("div", { children: [posts.map((post) => /* @__PURE__ */ jsx(PostCard, {
						post,
						layout: "horizontal"
					}, post.id)), meta.totalPages > 1 && /* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-center gap-2 mt-12 mb-8",
						children: [
							/* @__PURE__ */ jsx("button", {
								onClick: () => setPage((p) => Math.max(1, p - 1)),
								disabled: !meta.hasPrevPage,
								className: "w-8 h-8 flex items-center justify-center border border-slate-200 rounded text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
								children: "<"
							}),
							Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => /* @__PURE__ */ jsx("button", {
								onClick: () => setPage(p),
								className: `w-8 h-8 flex items-center justify-center rounded transition-colors ${page === p ? "bg-slate-900 text-white font-medium" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`,
								children: p
							}, p)),
							/* @__PURE__ */ jsx("button", {
								onClick: () => setPage((p) => Math.min(meta.totalPages, p + 1)),
								disabled: !meta.hasNextPage,
								className: "w-8 h-8 flex items-center justify-center border border-slate-200 rounded text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
								children: ">"
							})
						]
					})] }) : /* @__PURE__ */ jsx("div", {
						className: "p-8 text-center bg-slate-50 rounded-xl border border-slate-100 text-slate-500",
						children: "No articles published yet."
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "lg:col-span-4 space-y-10 pl-0 lg:pl-4",
					children: /* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx("h3", {
							className: "font-bold text-slate-900 mb-4 font-serif border-b border-slate-200 pb-2",
							children: "Popular Posts"
						}),
						/* @__PURE__ */ jsx("div", {
							className: "space-y-6 mb-6",
							children: popularPosts.map((post, index) => /* @__PURE__ */ jsxs(Link, {
								to: `/posts/${post.slug}`,
								className: "flex gap-4 group cursor-pointer items-start",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "text-3xl font-bold font-serif text-slate-200 group-hover:text-slate-300 transition-colors mt-1",
									"aria-hidden": "true",
									children: ["0", index + 1]
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex flex-col flex-1",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2 mb-1.5",
											children: [post.author?.avatarUrl ? /* @__PURE__ */ jsx("img", {
												src: post.author.avatarUrl,
												alt: "",
												className: "w-5 h-5 rounded-full object-cover shrink-0"
											}) : /* @__PURE__ */ jsx("div", {
												className: "w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-[10px] shrink-0",
												children: post.author?.name?.charAt(0).toUpperCase() || "U"
											}), /* @__PURE__ */ jsx("span", {
												className: "text-xs font-medium text-slate-600",
												children: post.author?.name || "Unknown Author"
											})]
										}),
										/* @__PURE__ */ jsx("h4", {
											className: "font-bold font-serif text-sm leading-snug line-clamp-2 group-hover:text-slate-900 transition-colors",
											children: post.title
										}),
										/* @__PURE__ */ jsxs("span", {
											className: "text-xs text-slate-500 mt-1",
											children: [new Date(post.createdAt).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric"
											}), " · 5 min read"]
										})
									]
								})]
							}, post.id))
						}),
						/* @__PURE__ */ jsx(Link, {
							to: "/popular",
							className: "text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors",
							children: "View all popular posts →"
						})
					] })
				})]
			})
		]
	});
}
//#endregion
export { HomePage as default };
