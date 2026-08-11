import { i as api, r as useAuthStore } from "../entry-server.js";
import { t as SEOHead } from "./SEOHead-CJrGekG-.js";
import { t as ConfirmModal } from "./ConfirmModal-BC5AV9Kg.js";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/pages/ManagePostsPage.tsx
/**
* @fileoverview [Brief description of the file's purpose]
* @objective Provide the necessary logic and structural foundation for this specific module/component.
* @risk Contains standard logic; ensure strict typing to prevent runtime errors.
* @relations Integrates with related features within the layer.
* @logic Follows the established architectural patterns and standard guidelines.
*/
function ManagePostsPage() {
	const { user } = useAuthStore();
	const [posts, setPosts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [postToDelete, setPostToDelete] = useState(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [reschedulePost, setReschedulePost] = useState(null);
	const [newScheduleTime, setNewScheduleTime] = useState("");
	const [isRescheduling, setIsRescheduling] = useState(false);
	useEffect(() => {
		if (user?.id) api.get(`/content/posts?authorId=${user.id}&status=ALL`).then((res) => setPosts(res.data.data)).catch(console.error).finally(() => setIsLoading(false));
	}, [user?.id]);
	const executeDelete = async () => {
		if (!postToDelete) return;
		setIsDeleting(true);
		try {
			await api.delete(`/content/posts/${postToDelete}`);
			setPosts(posts.filter((p) => p.id !== postToDelete));
			setPostToDelete(null);
		} catch (error) {
			console.error(error);
			alert("Failed to delete post");
		} finally {
			setIsDeleting(false);
		}
	};
	const executeReschedule = async () => {
		if (!reschedulePost || !newScheduleTime) return;
		setIsRescheduling(true);
		try {
			const scheduledAt = new Date(newScheduleTime).toISOString();
			await api.put(`/content/posts/${reschedulePost.id}`, {
				status: "SCHEDULED",
				scheduledAt
			});
			setPosts(posts.map((p) => p.id === reschedulePost.id ? {
				...p,
				scheduledAt
			} : p));
			setReschedulePost(null);
		} catch (error) {
			console.error(error);
			alert("Failed to reschedule post");
		} finally {
			setIsRescheduling(false);
		}
	};
	if (isLoading) return /* @__PURE__ */ jsx("div", {
		className: "text-center py-20",
		children: "Loading..."
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-5xl mx-auto px-6 py-12",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: "Manage Posts" }),
			/* @__PURE__ */ jsxs("div", {
				className: "flex justify-between items-center mb-8",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Link, {
					to: "/dashboard",
					className: "text-sm font-medium text-slate-500 hover:text-slate-900 mb-2 inline-block",
					children: "← Back to Dashboard"
				}), /* @__PURE__ */ jsx("h1", {
					className: "text-3xl font-bold font-serif m-0",
					children: "Manage Posts"
				})] }), /* @__PURE__ */ jsx(Link, {
					to: "/dashboard/posts/new",
					className: "bg-slate-900 text-white px-6 py-2.5 rounded-full font-medium hover:bg-slate-800 transition-colors",
					children: "Create New Post"
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm",
				children: posts.length === 0 ? /* @__PURE__ */ jsx("div", {
					className: "p-12 text-center text-slate-500",
					children: "You haven't written any posts yet."
				}) : /* @__PURE__ */ jsxs("table", {
					className: "w-full text-left border-collapse",
					children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
						className: "bg-slate-50 border-b border-slate-200 text-sm text-slate-500",
						children: [
							/* @__PURE__ */ jsx("th", {
								className: "py-4 px-6 font-medium",
								children: "Title"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-4 px-6 font-medium",
								children: "Status"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-4 px-6 font-medium",
								children: "Stats"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-4 px-6 font-medium",
								children: "Date"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-4 px-6 font-medium text-right",
								children: "Actions"
							})
						]
					}) }), /* @__PURE__ */ jsx("tbody", { children: posts.map((post) => /* @__PURE__ */ jsxs("tr", {
						className: "border-b border-slate-100 hover:bg-slate-50 transition-colors",
						children: [
							/* @__PURE__ */ jsxs("td", {
								className: "py-4 px-6",
								children: [/* @__PURE__ */ jsx("p", {
									className: "font-bold text-slate-900 line-clamp-1",
									children: post.title
								}), /* @__PURE__ */ jsx(Link, {
									to: `/posts/${post.slug}`,
									className: "text-sm text-primary-600 hover:underline",
									target: "_blank",
									rel: "noopener noreferrer",
									children: "View live"
								})]
							}),
							/* @__PURE__ */ jsxs("td", {
								className: "py-4 px-6",
								children: [/* @__PURE__ */ jsx("span", {
									className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${post.status === "PUBLISHED" ? "bg-green-100 text-green-800" : post.status === "SCHEDULED" ? "bg-blue-100 text-blue-800" : post.status === "DRAFT" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-800"}`,
									children: post.status
								}), post.status === "SCHEDULED" && post.scheduledAt && /* @__PURE__ */ jsx("div", {
									className: "text-xs text-slate-500 mt-2 font-medium",
									children: new Date(post.scheduledAt).toLocaleString(void 0, {
										dateStyle: "medium",
										timeStyle: "short"
									})
								})]
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-4 px-6",
								children: /* @__PURE__ */ jsxs("div", {
									className: "flex gap-4 text-sm text-slate-500",
									children: [/* @__PURE__ */ jsxs("span", {
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
											" ",
											post.viewCount
										]
									}), /* @__PURE__ */ jsxs("span", {
										className: "flex items-center gap-1",
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
													d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
												})
											}),
											" ",
											post._count?.likes || 0
										]
									})]
								})
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-4 px-6 text-sm text-slate-500",
								children: new Date(post.createdAt).toLocaleDateString()
							}),
							/* @__PURE__ */ jsxs("td", {
								className: "py-4 px-6 text-right space-x-3",
								children: [
									/* @__PURE__ */ jsx(Link, {
										to: `/dashboard/posts/edit/${post.id}`,
										className: "text-indigo-600 hover:text-indigo-900 font-medium text-sm inline-block",
										children: "Edit"
									}),
									post.status === "SCHEDULED" && /* @__PURE__ */ jsx("button", {
										onClick: () => {
											setReschedulePost(post);
											setNewScheduleTime(post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : "");
										},
										className: "text-blue-600 hover:text-blue-900 font-medium text-sm",
										children: "Reschedule"
									}),
									/* @__PURE__ */ jsx("button", {
										onClick: () => setPostToDelete(post.id),
										className: "text-red-600 hover:text-red-900 font-medium text-sm",
										children: "Delete"
									})
								]
							})
						]
					}, post.id)) })]
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
			}),
			reschedulePost && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50",
				children: /* @__PURE__ */ jsx("div", {
					className: "bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden",
					children: /* @__PURE__ */ jsxs("div", {
						className: "p-6",
						children: [
							/* @__PURE__ */ jsx("h3", {
								className: "text-xl font-bold font-serif mb-2 text-slate-900",
								children: "Reschedule Post"
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "text-slate-500 mb-6 text-sm",
								children: [
									"Choose a new date and time to publish \"",
									reschedulePost.title,
									"\"."
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mb-6",
								children: [/* @__PURE__ */ jsx("label", {
									className: "block text-sm font-bold text-slate-700 mb-1",
									children: "New Date & Time"
								}), /* @__PURE__ */ jsx("input", {
									type: "datetime-local",
									value: newScheduleTime,
									onChange: (e) => setNewScheduleTime(e.target.value),
									min: (/* @__PURE__ */ new Date()).toISOString().slice(0, 16),
									className: "w-full border border-slate-200 rounded px-3 py-2 outline-none focus:border-slate-900 bg-slate-50 text-sm"
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex justify-end gap-3",
								children: [/* @__PURE__ */ jsx("button", {
									onClick: () => setReschedulePost(null),
									disabled: isRescheduling,
									className: "px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors",
									children: "Cancel"
								}), /* @__PURE__ */ jsx("button", {
									onClick: executeReschedule,
									disabled: isRescheduling || !newScheduleTime,
									className: "px-4 py-2 text-sm font-bold text-white bg-slate-900 rounded hover:bg-slate-800 disabled:opacity-50 transition-colors",
									children: isRescheduling ? "Saving..." : "Update Time"
								})]
							})
						]
					})
				})
			})
		]
	});
}
//#endregion
export { ManagePostsPage as default };
