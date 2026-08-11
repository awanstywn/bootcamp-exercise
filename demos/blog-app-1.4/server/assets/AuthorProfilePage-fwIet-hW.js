import { i as api } from "../entry-server.js";
import { t as SEOHead } from "./SEOHead-CJrGekG-.js";
import { t as PostCard } from "./PostCard-C8Ketb0D.js";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/pages/AuthorProfilePage.tsx
function AuthorProfilePage() {
	const { authorName } = useParams();
	const [posts, setPosts] = useState([]);
	const [authorProfile, setAuthorProfile] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [sort, setSort] = useState("newest");
	const formattedName = authorName?.replace(/-/g, " ") || "Author";
	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);
				const [postsRes, authorsRes] = await Promise.all([api.get(`/content/posts?authorName=${authorName}&status=PUBLISHED&sort=${sort}`), api.get("/content/authors")]);
				setPosts(postsRes.data.data);
				setAuthorProfile(authorsRes.data.find((a) => a.name.toLowerCase() === formattedName.toLowerCase()));
			} catch (error) {
				console.error("Failed to fetch author data", error);
			} finally {
				setIsLoading(false);
			}
		};
		if (authorName) fetchData();
	}, [
		authorName,
		formattedName,
		sort
	]);
	const authorData = authorProfile || {
		name: formattedName,
		bio: "",
		avatarUrl: void 0
	};
	const authorInitials = authorData.name?.charAt(0).toUpperCase() || "A";
	const displayBio = authorData.bio || "This author has not provided a biography yet.";
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-50 flex flex-col",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: `${authorData.name} - Profile` }),
			/* @__PURE__ */ jsxs("div", {
				className: "bg-white border-b border-slate-200 px-8 py-3 flex items-center gap-2 text-sm text-slate-500",
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
							d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
						})
					}),
					/* @__PURE__ */ jsx(Link, {
						to: "/",
						className: "hover:text-slate-900 transition-colors",
						children: "Home"
					}),
					/* @__PURE__ */ jsx("span", { children: "›" }),
					/* @__PURE__ */ jsx(Link, {
						to: "/authors",
						className: "hover:text-slate-900 transition-colors",
						children: "Authors"
					}),
					/* @__PURE__ */ jsx("span", { children: "›" }),
					/* @__PURE__ */ jsx("span", {
						className: "text-slate-900",
						children: authorData.name
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "bg-slate-100/50 pt-16 pb-12 px-6",
				children: /* @__PURE__ */ jsxs("div", {
					className: "max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-10",
					children: [
						authorData.avatarUrl ? /* @__PURE__ */ jsx("img", {
							src: authorData.avatarUrl,
							alt: authorData.name,
							className: "w-40 h-40 rounded-full object-cover shrink-0 border-4 border-white shadow-sm"
						}) : /* @__PURE__ */ jsx("div", {
							className: "w-40 h-40 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 text-5xl font-bold shrink-0 border-4 border-white shadow-sm",
							children: authorInitials
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex-1 text-center md:text-left",
							children: [
								/* @__PURE__ */ jsx("h1", {
									className: "text-4xl font-bold font-serif text-slate-900 mb-2",
									children: authorData.name
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-sm font-medium text-slate-700 mb-4 tracking-wide uppercase",
									children: "Writer · Developer · Lifelong Learner"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-slate-600 max-w-xl mb-6 leading-relaxed text-sm md:text-base",
									children: displayBio
								})
							]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "flex flex-col items-center md:items-end mt-6 md:mt-0",
							children: /* @__PURE__ */ jsx("div", {
								className: "flex gap-8 text-center",
								children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
									className: "text-2xl font-bold text-slate-900",
									children: authorProfile?._count?.posts || posts.length
								}), /* @__PURE__ */ jsx("p", {
									className: "text-xs font-medium text-slate-500 uppercase tracking-wider",
									children: "Posts"
								})] })
							})
						})
					]
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "max-w-4xl mx-auto px-6 py-12 w-full",
				children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between mb-8 border-b border-slate-200 pb-4",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "text-lg font-bold font-serif text-slate-900",
						children: "Posts"
					}), /* @__PURE__ */ jsxs("select", {
						value: sort,
						onChange: (e) => setSort(e.target.value),
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
				}), /* @__PURE__ */ jsx("div", {
					className: "space-y-8",
					children: isLoading ? [
						1,
						2,
						3
					].map((n) => /* @__PURE__ */ jsx("div", { className: "animate-pulse bg-slate-50 h-48 rounded-lg border border-slate-100" }, n)) : posts.length > 0 ? posts.map((post) => /* @__PURE__ */ jsx(PostCard, {
						post,
						layout: "horizontal"
					}, post.id)) : /* @__PURE__ */ jsx("div", {
						className: "p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500",
						children: "This author has not published any posts yet."
					})
				})] })
			})
		]
	});
}
//#endregion
export { AuthorProfilePage as default };
