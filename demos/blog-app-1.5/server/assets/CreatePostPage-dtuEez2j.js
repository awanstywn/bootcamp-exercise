import { i as api } from "../entry-server.js";
import { t as SEOHead } from "./SEOHead-CJrGekG-.js";
import { t as ConfirmModal } from "./ConfirmModal-BC5AV9Kg.js";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/pages/CreatePostPage.tsx
/**
* @fileoverview Create Post Page Component (Stub)
* @objective Provide an interface for Authors/Editors to write and publish new blog posts.
* @risk N/A - Currently a placeholder. Future implementations must handle secure image uploads and HTML sanitation.
* @relations Route: `/dashboard/posts/new`. Protected by `<ProtectedRoute requireRole={['ADMIN', 'AUTHOR']}>`.
* @logic
* - Currently renders a static placeholder indicating pending editor integration (e.g. TipTap or Quill).
*/
function CreatePostPage() {
	const navigate = useNavigate();
	const fileInputRef = useRef(null);
	const [categories, setCategories] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const [formData, setFormData] = useState({
		title: "",
		content: "",
		excerpt: "",
		status: "DRAFT",
		metaTitle: "",
		metaDescription: "",
		coverImageUrl: "",
		categoryId: "",
		tagsString: "",
		scheduledAt: ""
	});
	useEffect(() => {
		api.get("/content/categories").then((res) => setCategories(res.data)).catch(console.error);
	}, []);
	const handleImageUpload = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		try {
			setIsUploadingImage(true);
			const fd = new FormData();
			fd.append("image", file);
			const res = await api.post("/upload/image", fd, { headers: { "Content-Type": "multipart/form-data" } });
			setFormData((prev) => ({
				...prev,
				coverImageUrl: res.data.url
			}));
		} catch (error) {
			console.error(error);
			alert(error.response?.data?.message || "Failed to upload image.");
		} finally {
			setIsUploadingImage(false);
		}
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!formData.title || !formData.content) {
			alert("Title and Content are required");
			return;
		}
		setShowConfirm(true);
	};
	const executeSubmit = async () => {
		setIsSubmitting(true);
		try {
			const payload = {
				...formData,
				tags: formData.tagsString.split(",").map((t) => t.trim()).filter(Boolean)
			};
			if (payload.status === "SCHEDULED" && payload.scheduledAt) payload.scheduledAt = new Date(payload.scheduledAt).toISOString();
			else delete payload.scheduledAt;
			if (!payload.categoryId) delete payload.categoryId;
			await api.post("/content/posts", payload);
			navigate("/dashboard/posts");
		} catch (error) {
			console.error(error);
			const errorMsg = error.response?.data?.message || "Failed to create post.";
			alert(`Error: ${errorMsg}`);
		} finally {
			setIsSubmitting(false);
			setShowConfirm(false);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-7xl mx-auto px-6 py-12",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: "Create Post" }),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-4 mb-8",
				children: [/* @__PURE__ */ jsx("button", {
					onClick: () => navigate(-1),
					className: "p-2 hover:bg-slate-100 rounded-full transition-colors border border-slate-200",
					children: /* @__PURE__ */ jsx("svg", {
						className: "w-5 h-5 text-slate-600",
						fill: "none",
						stroke: "currentColor",
						viewBox: "0 0 24 24",
						children: /* @__PURE__ */ jsx("path", {
							strokeLinecap: "round",
							strokeLinejoin: "round",
							strokeWidth: "2",
							d: "M10 19l-7-7m0 0l7-7m-7 7h18"
						})
					})
				}), /* @__PURE__ */ jsx("h1", {
					className: "text-3xl font-bold m-0 font-serif",
					children: "Create New Post"
				})]
			}),
			/* @__PURE__ */ jsxs("form", {
				onSubmit: handleSubmit,
				className: "flex flex-col lg:flex-row gap-8 items-start",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex-1 w-full space-y-6",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "w-full",
						children: [formData.coverImageUrl ? /* @__PURE__ */ jsxs("div", {
							className: "relative group w-full aspect-21/9 rounded-xl overflow-hidden border border-slate-200 bg-slate-50",
							children: [/* @__PURE__ */ jsx("img", {
								src: formData.coverImageUrl,
								alt: "Cover Preview",
								className: "w-full h-full object-cover"
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setFormData({
									...formData,
									coverImageUrl: ""
								}),
								className: "absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow hover:bg-white text-red-500 transition-colors opacity-0 group-hover:opacity-100",
								children: /* @__PURE__ */ jsx("svg", {
									className: "w-5 h-5",
									fill: "none",
									stroke: "currentColor",
									viewBox: "0 0 24 24",
									children: /* @__PURE__ */ jsx("path", {
										strokeLinecap: "round",
										strokeLinejoin: "round",
										strokeWidth: "2",
										d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
									})
								})
							})]
						}) : /* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => fileInputRef.current?.click(),
							disabled: isUploadingImage,
							className: "w-full aspect-21/9 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col items-center justify-center text-slate-500",
							children: [/* @__PURE__ */ jsx("svg", {
								className: "w-8 h-8 mb-2",
								fill: "none",
								stroke: "currentColor",
								viewBox: "0 0 24 24",
								children: /* @__PURE__ */ jsx("path", {
									strokeLinecap: "round",
									strokeLinejoin: "round",
									strokeWidth: "2",
									d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
								})
							}), /* @__PURE__ */ jsx("span", {
								className: "font-medium",
								children: isUploadingImage ? "Uploading..." : "Add a cover image"
							})]
						}), /* @__PURE__ */ jsx("input", {
							type: "file",
							ref: fileInputRef,
							onChange: handleImageUpload,
							accept: "image/*",
							className: "hidden"
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "bg-white p-8 rounded-xl border border-slate-200 space-y-6 shadow-sm",
						children: [/* @__PURE__ */ jsx("input", {
							type: "text",
							required: true,
							value: formData.title,
							onChange: (e) => setFormData({
								...formData,
								title: e.target.value
							}),
							className: "w-full text-4xl font-extrabold font-serif outline-none text-slate-900 placeholder:text-slate-300",
							placeholder: "Post Title..."
						}), /* @__PURE__ */ jsx("textarea", {
							required: true,
							rows: 18,
							value: formData.content,
							onChange: (e) => setFormData({
								...formData,
								content: e.target.value
							}),
							className: "w-full outline-none font-mono text-slate-700 text-sm md:text-base leading-relaxed placeholder:text-slate-300 resize-none",
							placeholder: "Write your amazing post here... (Markdown supported)"
						})]
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "w-full lg:w-80 shrink-0 space-y-6",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "bg-white p-6 rounded-xl border border-slate-200 space-y-6 shadow-sm",
						children: [
							/* @__PURE__ */ jsx("h3", {
								className: "font-bold text-slate-900 font-serif border-b border-slate-100 pb-3",
								children: "Publish Settings"
							}),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-sm font-bold text-slate-700 mb-1",
								children: "Category"
							}), /* @__PURE__ */ jsxs("select", {
								value: formData.categoryId,
								onChange: (e) => setFormData({
									...formData,
									categoryId: e.target.value
								}),
								className: "w-full border border-slate-200 rounded px-3 py-2 outline-none focus:border-slate-900 bg-slate-50 text-sm",
								children: [/* @__PURE__ */ jsx("option", {
									value: "",
									children: "Select a category"
								}), categories.map((cat) => /* @__PURE__ */ jsx("option", {
									value: cat.id,
									children: cat.name
								}, cat.id))]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [
								/* @__PURE__ */ jsx("label", {
									className: "block text-sm font-bold text-slate-700 mb-1",
									children: "Tags"
								}),
								/* @__PURE__ */ jsx("input", {
									type: "text",
									value: formData.tagsString,
									onChange: (e) => setFormData({
										...formData,
										tagsString: e.target.value
									}),
									className: "w-full border border-slate-200 rounded px-3 py-2 outline-none focus:border-slate-900 bg-slate-50 text-sm",
									placeholder: "react, javascript, tutorial"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-xs text-slate-400 mt-1",
									children: "Comma-separated"
								})
							] }),
							/* @__PURE__ */ jsxs("div", {
								className: "pt-4 border-t border-slate-100",
								children: [/* @__PURE__ */ jsx("label", {
									className: "block text-sm font-bold text-slate-700 mb-1",
									children: "Status"
								}), /* @__PURE__ */ jsxs("select", {
									value: formData.status,
									onChange: (e) => setFormData({
										...formData,
										status: e.target.value
									}),
									className: "w-full border border-slate-200 rounded px-3 py-2 outline-none focus:border-slate-900 bg-slate-50 text-sm font-medium",
									children: [
										/* @__PURE__ */ jsx("option", {
											value: "DRAFT",
											children: "Save as Draft"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "PUBLISHED",
											children: "Publish Now"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "SCHEDULED",
											children: "Schedule for Later"
										})
									]
								})]
							}),
							formData.status === "SCHEDULED" && /* @__PURE__ */ jsxs("div", {
								className: "pt-4 border-t border-slate-100",
								children: [/* @__PURE__ */ jsx("label", {
									className: "block text-sm font-bold text-slate-700 mb-1",
									children: "Schedule Date & Time"
								}), /* @__PURE__ */ jsx("input", {
									type: "datetime-local",
									value: formData.scheduledAt,
									onChange: (e) => setFormData({
										...formData,
										scheduledAt: e.target.value
									}),
									required: formData.status === "SCHEDULED",
									min: (/* @__PURE__ */ new Date()).toISOString().slice(0, 16),
									className: "w-full border border-slate-200 rounded px-3 py-2 outline-none focus:border-slate-900 bg-slate-50 text-sm"
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex gap-3 pt-4 border-t border-slate-100",
								children: [/* @__PURE__ */ jsx("button", {
									type: "submit",
									disabled: isSubmitting,
									className: "flex-1 bg-slate-900 text-white px-4 py-3 rounded-md font-bold hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm text-sm",
									children: isSubmitting ? "Saving..." : "Create Post"
								}), /* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => navigate(-1),
									disabled: isSubmitting,
									className: "flex-1 bg-white text-slate-700 border border-slate-300 px-4 py-3 rounded-md font-bold hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm text-sm",
									children: "Cancel"
								})]
							})
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "bg-white p-6 rounded-xl border border-slate-200 space-y-6 shadow-sm",
						children: [
							/* @__PURE__ */ jsx("h3", {
								className: "font-bold text-slate-900 font-serif border-b border-slate-100 pb-3",
								children: "SEO Details"
							}),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-sm font-bold text-slate-700 mb-1",
								children: "Excerpt"
							}), /* @__PURE__ */ jsx("textarea", {
								rows: 3,
								value: formData.excerpt,
								onChange: (e) => setFormData({
									...formData,
									excerpt: e.target.value
								}),
								className: "w-full border border-slate-200 rounded px-3 py-2 outline-none focus:border-slate-900 bg-slate-50 text-sm resize-none",
								placeholder: "A short summary of your post..."
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-sm font-bold text-slate-700 mb-1",
								children: "Meta Title"
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								value: formData.metaTitle,
								onChange: (e) => setFormData({
									...formData,
									metaTitle: e.target.value
								}),
								className: "w-full border border-slate-200 rounded px-3 py-2 outline-none focus:border-slate-900 bg-slate-50 text-sm",
								placeholder: "Leave blank to use post title"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-sm font-bold text-slate-700 mb-1",
								children: "Meta Description"
							}), /* @__PURE__ */ jsx("textarea", {
								rows: 3,
								value: formData.metaDescription,
								onChange: (e) => setFormData({
									...formData,
									metaDescription: e.target.value
								}),
								className: "w-full border border-slate-200 rounded px-3 py-2 outline-none focus:border-slate-900 bg-slate-50 text-sm resize-none",
								placeholder: "Leave blank to use excerpt"
							})] })
						]
					})]
				})]
			}),
			/* @__PURE__ */ jsx(ConfirmModal, {
				isOpen: showConfirm,
				title: formData.status === "PUBLISHED" ? "Publish Post" : formData.status === "SCHEDULED" ? "Schedule Post" : "Save Draft",
				message: `Are you sure you want to ${formData.status === "PUBLISHED" ? "publish" : formData.status === "SCHEDULED" ? "schedule" : "save"} "${formData.title || "this post"}"?`,
				confirmText: formData.status === "PUBLISHED" ? "Yes, Publish" : formData.status === "SCHEDULED" ? "Yes, Schedule" : "Yes, Save",
				onConfirm: executeSubmit,
				onCancel: () => setShowConfirm(false),
				isLoading: isSubmitting
			})
		]
	});
}
//#endregion
export { CreatePostPage as default };
