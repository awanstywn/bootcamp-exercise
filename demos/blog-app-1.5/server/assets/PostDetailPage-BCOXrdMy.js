import { i as api, r as useAuthStore } from "../entry-server.js";
import { t as SEOHead } from "./SEOHead-CJrGekG-.js";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { jsx, jsxs } from "react/jsx-runtime";
import { format, formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
//#region src/components/comments/CommentForm.tsx
/**
* @fileoverview [Brief description of the file's purpose]
* @objective Provide the necessary logic and structural foundation for this specific module/component.
* @risk Contains standard logic; ensure strict typing to prevent runtime errors.
* @relations Integrates with related features within the layer.
* @logic Follows the established architectural patterns and standard guidelines.
*/
function CommentForm({ onSubmit, initialValue = "", placeholder = "Write a comment...", submitLabel = "Post" }) {
	const [content, setContent] = useState(initialValue);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const { isAuthenticated } = useAuthStore();
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!content.trim() || isSubmitting) return;
		setError(null);
		try {
			setIsSubmitting(true);
			await onSubmit(content);
			setContent("");
		} catch (err) {
			setError(err.message || "Failed to post comment. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};
	if (!isAuthenticated) return /* @__PURE__ */ jsxs("div", {
		className: "bg-slate-50 p-4 rounded-lg border border-slate-200 text-center text-sm text-slate-600",
		children: [
			"Please",
			" ",
			/* @__PURE__ */ jsx(Link, {
				to: "/login",
				className: "text-primary-600 font-medium hover:underline",
				children: "login"
			}),
			" ",
			"to leave a comment."
		]
	});
	return /* @__PURE__ */ jsxs("form", {
		onSubmit: handleSubmit,
		className: "mt-4",
		children: [
			error && /* @__PURE__ */ jsx("div", {
				className: "mb-3 text-sm text-red-600 bg-red-50 p-2 rounded",
				children: error
			}),
			/* @__PURE__ */ jsx("textarea", {
				value: content,
				onChange: (e) => setContent(e.target.value),
				className: "w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none",
				rows: 3,
				placeholder,
				"aria-label": placeholder,
				required: true
			}),
			/* @__PURE__ */ jsx("div", {
				className: "flex justify-end mt-2",
				children: /* @__PURE__ */ jsx("button", {
					type: "submit",
					disabled: isSubmitting || !content.trim(),
					className: "btn-primary py-1.5 px-4 text-sm",
					children: isSubmitting ? "Posting..." : submitLabel
				})
			})
		]
	});
}
//#endregion
//#region src/components/comments/CommentItem.tsx
/**
* @fileoverview [Brief description of the file's purpose]
* @objective Provide the necessary logic and structural foundation for this specific module/component.
* @risk Contains standard logic; ensure strict typing to prevent runtime errors.
* @relations Integrates with related features within the layer.
* @logic Follows the established architectural patterns and standard guidelines.
*/
function CommentItem({ comment, onReply }) {
	const [isReplying, setIsReplying] = useState(false);
	const handleReplySubmit = async (content) => {
		await onReply(comment.id, content);
		setIsReplying(false);
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "flex gap-3 mb-6",
		children: [/* @__PURE__ */ jsx("div", {
			className: "w-8 h-8 rounded-full bg-slate-200 shrink-0 overflow-hidden",
			children: comment.author?.avatarUrl ? /* @__PURE__ */ jsx("img", {
				src: comment.author.avatarUrl,
				alt: comment.author?.name || "User avatar",
				className: "w-full h-full object-cover"
			}) : /* @__PURE__ */ jsx("div", {
				className: "w-full h-full flex items-center justify-center text-slate-500 font-bold text-xs",
				children: comment.author?.name?.charAt(0)?.toUpperCase() || "?"
			})
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex-1",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "bg-slate-50 p-3 rounded-lg rounded-tl-none border border-slate-100",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between mb-1",
						children: [/* @__PURE__ */ jsx("span", {
							className: "font-bold text-sm text-slate-800",
							children: comment.author?.name || "Unknown User"
						}), /* @__PURE__ */ jsx("span", {
							className: "text-xs text-slate-500",
							children: comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : ""
						})]
					}), /* @__PURE__ */ jsx("p", {
						className: "text-slate-700 text-sm whitespace-pre-wrap",
						children: comment.content
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-1 ml-2",
					children: /* @__PURE__ */ jsx("button", {
						onClick: () => setIsReplying(!isReplying),
						className: "text-xs font-medium text-slate-500 hover:text-primary-600 transition-colors",
						"aria-expanded": isReplying,
						"aria-controls": `reply-form-${comment.id}`,
						children: isReplying ? "Cancel Reply" : "Reply"
					})
				}),
				isReplying && /* @__PURE__ */ jsx("div", {
					id: `reply-form-${comment.id}`,
					className: "mt-2 ml-4",
					children: /* @__PURE__ */ jsx(CommentForm, {
						onSubmit: handleReplySubmit,
						placeholder: "Write a reply...",
						submitLabel: "Reply"
					})
				}),
				comment.children && comment.children.length > 0 && /* @__PURE__ */ jsx("div", {
					className: "mt-4 ml-6 space-y-4 border-l-2 border-slate-100 pl-4",
					children: comment.children.map((child) => /* @__PURE__ */ jsx(CommentItem, {
						comment: child,
						onReply
					}, child.id))
				})
			]
		})]
	});
}
//#endregion
//#region src/components/comments/CommentList.tsx
/**
* @fileoverview [Brief description of the file's purpose]
* @objective Provide the necessary logic and structural foundation for this specific module/component.
* @risk Contains standard logic; ensure strict typing to prevent runtime errors.
* @relations Integrates with related features within the layer.
* @logic Follows the established architectural patterns and standard guidelines.
*/
function CommentList({ postId }) {
	const [comments, setComments] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const fetchComments = useCallback(async () => {
		try {
			setError(null);
			setComments((await api.get(`/content/posts/${postId}/comments`)).data);
		} catch (err) {
			console.error("Failed to load comments", err);
			setError("Failed to load comments. Please try again later.");
		} finally {
			setIsLoading(false);
		}
	}, [postId]);
	useEffect(() => {
		setTimeout(() => {
			setIsLoading(true);
			fetchComments();
		}, 0);
	}, [fetchComments]);
	const handleCreateComment = async (content) => {
		try {
			await api.post(`/content/posts/${postId}/comments`, { content });
			await fetchComments();
		} catch (error) {
			console.error("Failed to create comment", error);
			throw error;
		}
	};
	const handleReply = async (parentId, content) => {
		try {
			await api.post(`/content/posts/${postId}/comments`, {
				content,
				parentId
			});
			await fetchComments();
		} catch (error) {
			console.error("Failed to reply", error);
			throw error;
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "mt-12 pt-8 border-t border-slate-200",
		children: [
			/* @__PURE__ */ jsx("h3", {
				className: "text-2xl font-bold mb-6 text-slate-900",
				children: "Comments"
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mb-10",
				children: /* @__PURE__ */ jsx(CommentForm, { onSubmit: handleCreateComment })
			}),
			error ? /* @__PURE__ */ jsx("div", {
				className: "text-center text-red-600 py-4 bg-red-50 rounded-lg",
				children: error
			}) : isLoading ? /* @__PURE__ */ jsx("div", {
				className: "text-center text-slate-500 py-4",
				children: "Loading comments..."
			}) : comments.length > 0 ? /* @__PURE__ */ jsx("div", {
				className: "space-y-6",
				children: comments.map((comment) => /* @__PURE__ */ jsx(CommentItem, {
					comment,
					onReply: handleReply
				}, comment.id))
			}) : /* @__PURE__ */ jsx("div", {
				className: "text-center text-slate-500 py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200",
				children: "No comments yet. Be the first to share your thoughts!"
			})
		]
	});
}
//#endregion
//#region src/pages/PostDetailPage.tsx
/**
* @fileoverview Post Detail Page Component
* @objective Display a full blog post, its metadata, related posts, tags, and comments.
* @risk Rendering unescaped HTML from the post content can lead to XSS attacks (currently using a simple split/map, but warns to use react-markdown).
* @relations Route: `/posts/:slug`. Fetches data via `api.get('/content/posts/:slug')`. Renders `<CommentList />`.
* @logic
* - Reads `slug` from URL params.
* - Fetches post details, tags, and related posts concurrently.
* - If the user is authenticated, it checks if they have liked the post.
* - `handleLike`: Toggles the like status optimistically and updates the server.
* - Dynamically updates `<SEOHead>` with the post's specific metadata and image.
*/
function PostDetailPage() {
	const { slug } = useParams();
	const [post, setPost] = useState(null);
	const [related, setRelated] = useState([]);
	const [tags, setTags] = useState([]);
	const [categories, setCategories] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [hasLiked, setHasLiked] = useState(false);
	const { isAuthenticated } = useAuthStore();
	useEffect(() => {
		const controller = new AbortController();
		const fetchPost = async () => {
			if (!slug) return;
			try {
				setIsLoading(true);
				const { data } = await api.get(`/content/posts/${slug}`, { signal: controller.signal });
				setPost(data);
				const [relRes, tagsRes, catRes] = await Promise.all([
					api.get("/content/posts?limit=4&sort=popular", { signal: controller.signal }),
					api.get("/content/tags", { signal: controller.signal }),
					api.get("/content/categories", { signal: controller.signal })
				]);
				setRelated(relRes.data.data.filter((p) => p.id !== data.id).slice(0, 3));
				setTags(tagsRes.data);
				setCategories(catRes.data);
				if (isAuthenticated) setHasLiked((await api.get(`/content/posts/${data.id}/likes/status`, { signal: controller.signal })).data.liked);
			} catch (error) {
				if (error.name === "CanceledError" || error.name === "AbortError") return;
				console.error("Error fetching post:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchPost();
		return () => {
			controller.abort();
		};
	}, [slug, isAuthenticated]);
	const handleLike = async () => {
		if (!isAuthenticated) return alert("Please login to like");
		if (!post) return;
		try {
			const res = await api.post(`/content/posts/${post.id}/likes`);
			setHasLiked(res.data.liked);
			setPost((prev) => prev ? {
				...prev,
				_count: {
					...prev._count,
					likes: Math.max(0, prev._count.likes + (res.data.liked ? 1 : -1))
				}
			} : null);
		} catch (e) {
			console.error("Error liking post:", e);
		}
	};
	if (isLoading) return /* @__PURE__ */ jsx("div", {
		className: "max-w-7xl mx-auto px-6 py-12 text-center",
		children: "Loading..."
	});
	if (!post) return /* @__PURE__ */ jsx("div", {
		className: "max-w-7xl mx-auto px-6 py-12 text-center text-red-500",
		children: "Post not found"
	});
	const authorName = post.author?.name || "Unknown Author";
	const wordCount = (post.content || post.excerpt || "").trim().split(/\s+/).length;
	const readingTime = Math.max(1, Math.ceil(wordCount / 200));
	const authorProfileLink = `/authors/${authorName.replace(/\s+/g, "-")}`;
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-7xl mx-auto px-6 py-8",
		children: [
			/* @__PURE__ */ jsx(SEOHead, {
				title: post.metaTitle || post.title,
				description: post.metaDescription || post.excerpt,
				image: post.coverImageUrl,
				type: "article"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2 text-sm text-slate-500 mb-8 pb-4 border-b border-slate-200",
				children: [
					/* @__PURE__ */ jsx(Link, {
						to: "/",
						className: "hover:text-slate-900 transition-colors",
						children: "Home"
					}),
					/* @__PURE__ */ jsx("span", { children: "›" }),
					/* @__PURE__ */ jsx(Link, {
						to: "/categories",
						className: "hover:text-slate-900 transition-colors",
						children: "Categories"
					}),
					/* @__PURE__ */ jsx("span", { children: "›" }),
					/* @__PURE__ */ jsx("span", {
						className: "hover:text-slate-900 transition-colors cursor-pointer",
						children: post.category?.name || "General"
					}),
					/* @__PURE__ */ jsx("span", { children: "›" }),
					/* @__PURE__ */ jsx("span", {
						className: "text-slate-900 font-medium truncate max-w-[200px] md:max-w-xs",
						children: post.title
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-16",
				children: [/* @__PURE__ */ jsxs("article", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "mb-8",
							children: [/* @__PURE__ */ jsx("span", {
								className: "inline-block bg-slate-100 text-slate-600 uppercase tracking-widest text-[10px] font-bold px-3 py-1 rounded mb-4",
								children: post.category?.name?.toUpperCase() || "GENERAL"
							}), /* @__PURE__ */ jsx("h1", {
								className: "text-4xl md:text-5xl font-extrabold font-serif text-slate-900 leading-tight",
								children: post.title
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-sm text-slate-500 border-b border-slate-200 pb-6",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center flex-wrap gap-3",
								children: [
									post.author?.avatarUrl ? /* @__PURE__ */ jsx("img", {
										src: post.author.avatarUrl,
										alt: authorName,
										className: "w-8 h-8 rounded-full object-cover shrink-0"
									}) : /* @__PURE__ */ jsx("div", {
										className: "w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0",
										children: authorName.charAt(0).toUpperCase()
									}),
									/* @__PURE__ */ jsx("span", {
										className: "text-slate-900 font-medium",
										children: authorName
									}),
									/* @__PURE__ */ jsx("span", {
										className: "hidden sm:inline",
										children: "·"
									}),
									/* @__PURE__ */ jsx("span", { children: post.createdAt ? format(new Date(post.createdAt), "MMM dd, yyyy") : "" }),
									/* @__PURE__ */ jsx("span", {
										className: "hidden sm:inline",
										children: "·"
									}),
									/* @__PURE__ */ jsxs("span", { children: [readingTime, " min read"] }),
									/* @__PURE__ */ jsx("span", {
										className: "hidden sm:inline",
										children: "·"
									}),
									/* @__PURE__ */ jsxs("span", {
										className: "flex items-center gap-1",
										children: [
											/* @__PURE__ */ jsxs("svg", {
												className: "w-4 h-4",
												fill: "none",
												stroke: "currentColor",
												viewBox: "0 0 24 24",
												children: [/* @__PURE__ */ jsx("path", {
													strokeLinecap: "round",
													strokeLinejoin: "round",
													strokeWidth: "2",
													d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z"
												}), /* @__PURE__ */ jsx("path", {
													strokeLinecap: "round",
													strokeLinejoin: "round",
													strokeWidth: "2",
													d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
												})]
											}),
											post.viewCount || 0,
											" views"
										]
									})
								]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ jsxs("button", {
									onClick: handleLike,
									className: `flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors ${hasLiked ? "bg-red-50 border-red-200 text-red-500" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`,
									children: [/* @__PURE__ */ jsx("svg", {
										className: "w-4 h-4",
										fill: hasLiked ? "currentColor" : "none",
										stroke: "currentColor",
										viewBox: "0 0 24 24",
										children: /* @__PURE__ */ jsx("path", {
											strokeLinecap: "round",
											strokeLinejoin: "round",
											strokeWidth: hasLiked ? 0 : 2,
											d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
										})
									}), post._count?.likes || 0]
								}), /* @__PURE__ */ jsxs("button", {
									className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors",
									children: [/* @__PURE__ */ jsx("svg", {
										className: "w-4 h-4",
										fill: "none",
										stroke: "currentColor",
										viewBox: "0 0 24 24",
										children: /* @__PURE__ */ jsx("path", {
											strokeLinecap: "round",
											strokeLinejoin: "round",
											strokeWidth: "2",
											d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
										})
									}), post._count?.comments || 0]
								})]
							})]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "w-full aspect-21/9 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden mb-12",
							children: post.coverImageUrl ? /* @__PURE__ */ jsx("img", {
								src: post.coverImageUrl,
								alt: post.title,
								className: "w-full h-full object-cover"
							}) : /* @__PURE__ */ jsx("svg", {
								className: "w-16 h-16 text-slate-200",
								fill: "none",
								stroke: "currentColor",
								viewBox: "0 0 24 24",
								children: /* @__PURE__ */ jsx("path", {
									strokeLinecap: "round",
									strokeLinejoin: "round",
									strokeWidth: "1",
									d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
								})
							})
						}),
						/* @__PURE__ */ jsx("div", {
							className: "prose prose-lg prose-slate prose-headings:font-serif max-w-none prose-a:text-slate-900 mb-12 border-b border-slate-200 pb-12",
							children: post.content ? /* @__PURE__ */ jsx(ReactMarkdown, {
								rehypePlugins: [rehypeSanitize],
								children: post.content
							}) : /* @__PURE__ */ jsx("p", {
								className: "text-slate-500 italic",
								children: "No content available."
							})
						}),
						post.tags && post.tags.length > 0 && /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3 mb-10",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-sm font-medium text-slate-700",
								children: "Tags:"
							}), /* @__PURE__ */ jsx("div", {
								className: "flex flex-wrap gap-2",
								children: post.tags.map((tag) => /* @__PURE__ */ jsxs(Link, {
									to: `/tags/${tag.slug}`,
									className: "px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded transition-colors",
									children: ["#", tag.name]
								}, tag.id))
							})]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "bg-slate-50 border border-slate-100 rounded-lg p-6 mb-16",
							children: /* @__PURE__ */ jsxs("div", {
								className: "flex flex-col sm:flex-row gap-6",
								children: [post.author?.avatarUrl ? /* @__PURE__ */ jsx("img", {
									src: post.author.avatarUrl,
									alt: authorName,
									className: "w-20 h-20 rounded-full object-cover shrink-0"
								}) : /* @__PURE__ */ jsx("div", {
									className: "w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-2xl font-bold shrink-0",
									children: authorName.charAt(0).toUpperCase()
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex-1",
									children: [
										/* @__PURE__ */ jsx("h3", {
											className: "font-bold text-slate-900 mb-2",
											children: authorName
										}),
										/* @__PURE__ */ jsx("p", {
											className: "text-sm text-slate-600 mb-4 leading-relaxed",
											children: post.author?.bio || "This author has not provided a biography yet."
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ jsx("div", {}), /* @__PURE__ */ jsx(Link, {
												to: authorProfileLink,
												className: "px-4 py-1.5 border border-slate-200 bg-white rounded text-sm font-medium hover:bg-slate-50 transition-colors",
												children: "View all posts"
											})]
										})
									]
								})]
							})
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between border-b border-slate-200 pb-2 mb-6",
							children: [/* @__PURE__ */ jsxs("h3", {
								className: "font-bold text-slate-900 font-serif text-lg",
								children: [post._count?.comments || 0, " Comments"]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2 text-sm text-slate-600",
								children: ["Sort by: ", /* @__PURE__ */ jsxs("span", {
									className: "font-medium cursor-pointer flex items-center gap-1",
									children: ["Newest ", /* @__PURE__ */ jsx("svg", {
										className: "w-4 h-4",
										fill: "none",
										stroke: "currentColor",
										viewBox: "0 0 24 24",
										children: /* @__PURE__ */ jsx("path", {
											strokeLinecap: "round",
											strokeLinejoin: "round",
											strokeWidth: "2",
											d: "M19 9l-7 7-7-7"
										})
									})]
								})]
							})]
						}),
						/* @__PURE__ */ jsx(CommentList, { postId: post.id })
					]
				}), /* @__PURE__ */ jsxs("aside", {
					className: "space-y-10 pl-0 lg:pl-4",
					children: [
						/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx("h3", {
								className: "font-bold text-slate-900 mb-4 font-serif border-b border-slate-200 pb-2",
								children: "Categories"
							}),
							/* @__PURE__ */ jsx("ul", {
								className: "space-y-3 text-sm text-slate-600 mb-4",
								children: categories.map((cat) => /* @__PURE__ */ jsxs("li", {
									className: "flex justify-between items-center group",
									children: [/* @__PURE__ */ jsxs(Link, {
										to: `/categories/${cat.slug}`,
										className: "flex items-center gap-2 group-hover:text-slate-900 transition-colors",
										children: [/* @__PURE__ */ jsx("svg", {
											className: "w-4 h-4",
											fill: "none",
											stroke: "currentColor",
											viewBox: "0 0 24 24",
											children: /* @__PURE__ */ jsx("path", {
												strokeLinecap: "round",
												strokeLinejoin: "round",
												strokeWidth: "2",
												d: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
											})
										}), cat.name]
									}), /* @__PURE__ */ jsx("span", {
										className: "bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-xs font-medium",
										children: cat._count?.posts || 0
									})]
								}, cat.id))
							}),
							/* @__PURE__ */ jsx(Link, {
								to: "/categories",
								className: "text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors",
								children: "View all categories →"
							})
						] }),
						/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx("h3", {
								className: "font-bold text-slate-900 mb-4 font-serif border-b border-slate-200 pb-2",
								children: "Popular Posts"
							}),
							/* @__PURE__ */ jsx("div", {
								className: "space-y-4 mb-4",
								children: related.map((rel) => /* @__PURE__ */ jsxs(Link, {
									to: `/posts/${rel.slug}`,
									className: "flex gap-4 group cursor-pointer",
									children: [/* @__PURE__ */ jsx("div", {
										className: "w-16 h-16 bg-slate-50 border border-slate-100 rounded shrink-0 flex items-center justify-center text-slate-300 overflow-hidden",
										children: rel.coverImageUrl ? /* @__PURE__ */ jsx("img", {
											src: rel.coverImageUrl,
											alt: rel.title,
											className: "w-full h-full object-cover"
										}) : /* @__PURE__ */ jsx("svg", {
											className: "w-6 h-6",
											fill: "none",
											stroke: "currentColor",
											viewBox: "0 0 24 24",
											children: /* @__PURE__ */ jsx("path", {
												strokeLinecap: "round",
												strokeLinejoin: "round",
												strokeWidth: "2",
												d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
											})
										})
									}), /* @__PURE__ */ jsxs("div", {
										className: "flex flex-col justify-center",
										children: [/* @__PURE__ */ jsx("h4", {
											className: "font-bold font-serif text-xs line-clamp-2 group-hover:text-slate-600 transition-colors",
											children: rel.title
										}), /* @__PURE__ */ jsx("span", {
											className: "text-[10px] text-slate-500 mt-1",
											children: rel.createdAt ? format(new Date(rel.createdAt), "MMM dd, yyyy") : ""
										})]
									})]
								}, rel.id))
							}),
							/* @__PURE__ */ jsx(Link, {
								to: "/popular",
								className: "text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors",
								children: "View all popular posts →"
							})
						] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
							className: "font-bold text-slate-900 mb-4 font-serif border-b border-slate-200 pb-2",
							children: "Tags"
						}), /* @__PURE__ */ jsx("div", {
							className: "flex flex-wrap gap-2",
							children: tags.length > 0 ? tags.slice(0, 10).map((tag) => /* @__PURE__ */ jsx(Link, {
								to: `/tags/${tag.slug}`,
								className: "px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded transition-colors",
								children: tag.name
							}, tag.id)) : /* @__PURE__ */ jsx("span", {
								className: "text-slate-500 text-sm",
								children: "No tags available."
							})
						})] })
					]
				})]
			})
		]
	});
}
//#endregion
export { PostDetailPage as default };
