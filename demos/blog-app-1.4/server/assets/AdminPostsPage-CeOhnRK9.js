import { i as api } from "../entry-server.js";
import { t as ConfirmModal } from "./ConfirmModal-BC5AV9Kg.js";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/pages/admin/AdminPostsPage.tsx
/**
* @fileoverview Admin Posts Management Page
* @objective Allow administrators (and potentially editors) to view, edit, and update the status of all blog posts globally.
* @risk Changing post status (e.g., from DRAFT to PUBLISHED) without review could expose unfinished content.
* @relations Route: `/admin/posts`. Interacts with `api.get('/content/posts')` and `api.patch('/content/posts/:id')`.
* @logic
* - `fetchPosts`: Retrieves the latest posts regardless of author or status.
* - `handleUpdateStatus`: Triggers a PATCH request to update the publication status (DRAFT/PUBLISHED/etc).
* - Displays posts in a table format with quick actions for viewing and editing.
*/
function AdminPostsPage() {
	const [posts, setPosts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [postToDelete, setPostToDelete] = useState(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const fetchPosts = useCallback(async () => {
		try {
			setPosts((await api.get("/content/posts?limit=10")).data.data);
		} catch (err) {
			console.error("Failed to load posts:", err);
		} finally {
			setIsLoading(false);
		}
	}, []);
	useEffect(() => {
		fetchPosts();
	}, [fetchPosts]);
	const handleUpdateStatus = async (id, status) => {
		try {
			await api.patch(`/content/posts/${id}`, { status });
			await fetchPosts();
		} catch (err) {
			console.error("Failed to update status:", err);
			alert("Failed to update status. Please try again.");
		}
	};
	const executeDelete = async () => {
		if (!postToDelete) return;
		setIsDeleting(true);
		try {
			await api.delete(`/content/posts/${postToDelete}`);
			setPosts(posts.filter((p) => p.id !== postToDelete));
			setPostToDelete(null);
		} catch (err) {
			console.error("Failed to delete post:", err);
			alert("Failed to delete post. Please try again.");
		} finally {
			setIsDeleting(false);
		}
	};
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "flex justify-between items-center mb-6",
			children: [/* @__PURE__ */ jsx("h1", {
				className: "text-2xl font-bold",
				children: "Manage Posts"
			}), /* @__PURE__ */ jsx(Link, {
				to: "/dashboard/posts/new",
				className: "btn-primary text-sm",
				children: "Create New Post"
			})]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden",
			children: /* @__PURE__ */ jsx("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full text-left text-sm",
					children: [/* @__PURE__ */ jsx("thead", {
						className: "bg-slate-50 border-b border-slate-200 text-slate-600",
						children: /* @__PURE__ */ jsxs("tr", { children: [
							/* @__PURE__ */ jsx("th", {
								className: "px-6 py-4 font-semibold",
								children: "Title"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-6 py-4 font-semibold",
								children: "Author"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-6 py-4 font-semibold",
								children: "Status"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-6 py-4 font-semibold",
								children: "Views"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-6 py-4 font-semibold text-right",
								children: "Actions"
							})
						] })
					}), /* @__PURE__ */ jsx("tbody", {
						className: "divide-y divide-slate-100",
						children: isLoading ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
							colSpan: 5,
							className: "px-6 py-8 text-center text-slate-500",
							children: "Loading posts..."
						}) }) : posts.map((post) => /* @__PURE__ */ jsxs("tr", {
							className: "hover:bg-slate-50 transition-colors",
							children: [
								/* @__PURE__ */ jsx("td", {
									className: "px-6 py-4 font-medium text-slate-900 max-w-xs truncate",
									title: post.title,
									children: post.title
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-6 py-4 text-slate-600",
									children: post.author?.name || "Unknown"
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-6 py-4",
									children: /* @__PURE__ */ jsxs("select", {
										value: post.status,
										onChange: (e) => handleUpdateStatus(post.id, e.target.value),
										className: `text-xs font-medium rounded-full px-2.5 py-1 border outline-none ${post.status === "PUBLISHED" ? "bg-green-50 text-green-700 border-green-200" : post.status === "DRAFT" ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-red-50 text-red-700 border-red-200"}`,
										children: [
											/* @__PURE__ */ jsx("option", {
												value: "DRAFT",
												children: "Draft"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "PENDING_REVIEW",
												children: "Pending"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "PUBLISHED",
												children: "Published"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "ARCHIVED",
												children: "Archived"
											})
										]
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-6 py-4 text-slate-600",
									children: post.viewCount || 0
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "px-6 py-4 text-right",
									children: [
										/* @__PURE__ */ jsx(Link, {
											to: `/posts/${post.slug}`,
											target: "_blank",
											rel: "noreferrer",
											className: "text-primary-600 hover:underline text-xs mr-3",
											children: "View"
										}),
										/* @__PURE__ */ jsx(Link, {
											to: `/dashboard/posts/edit/${post.id}`,
											className: "text-slate-500 hover:text-slate-800 text-xs mr-3",
											children: "Edit"
										}),
										/* @__PURE__ */ jsx("button", {
											onClick: () => setPostToDelete(post.id),
											className: "text-red-500 hover:text-red-700 text-xs font-medium",
											children: "Delete"
										})
									]
								})
							]
						}, post.id))
					})]
				})
			})
		}),
		/* @__PURE__ */ jsx(ConfirmModal, {
			isOpen: !!postToDelete,
			title: "Delete Post",
			message: "Are you sure you want to permanently delete this post? This action cannot be undone.",
			confirmText: "Delete Post",
			isDangerous: true,
			onConfirm: executeDelete,
			onCancel: () => setPostToDelete(null),
			isLoading: isDeleting
		})
	] });
}
//#endregion
export { AdminPostsPage as default };
