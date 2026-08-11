import { i as api, r as useAuthStore } from "../entry-server.js";
import { t as SEOHead } from "./SEOHead-CJrGekG-.js";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/pages/ProfilePage.tsx
function ProfilePage() {
	const { user, checkAuth } = useAuthStore();
	const navigate = useNavigate();
	const [requestStatus, setRequestStatus] = useState(null);
	const [reason, setReason] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const fileInputRef = useRef(null);
	const [isEditing, setIsEditing] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const [formData, setFormData] = useState({
		name: user?.name || "",
		bio: user?.bio || "",
		avatarUrl: user?.avatarUrl || ""
	});
	useEffect(() => {
		if (user) setFormData({
			name: user.name || "",
			bio: user.bio || "",
			avatarUrl: user.avatarUrl || ""
		});
	}, [user]);
	useEffect(() => {
		if (user?.role === "SUBSCRIBER") api.get("/users/role-request").then((res) => {
			setRequestStatus(res.data);
		}).catch(console.error);
	}, [user]);
	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			setIsSubmitting(true);
			setRequestStatus((await api.post("/users/role-request", {
				requestedRole: "AUTHOR",
				reason
			})).data);
		} catch (error) {
			console.error(error);
			alert("Failed to submit request");
		} finally {
			setIsSubmitting(false);
		}
	};
	const handleUpdateProfile = async (e) => {
		e.preventDefault();
		try {
			setIsUpdating(true);
			await api.patch("/users/me", formData);
			await checkAuth();
			setIsEditing(false);
		} catch (error) {
			console.error(error);
			alert("Failed to update profile");
		} finally {
			setIsUpdating(false);
		}
	};
	const handleImageUpload = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		try {
			setIsUploadingImage(true);
			const formData = new FormData();
			formData.append("image", file);
			const res = await api.post("/upload/image", formData, { headers: { "Content-Type": "multipart/form-data" } });
			setFormData((prev) => ({
				...prev,
				avatarUrl: res.data.url
			}));
		} catch (error) {
			console.error(error);
			alert(error.response?.data?.message || "Failed to upload image.");
		} finally {
			setIsUploadingImage(false);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-4xl mx-auto px-6 py-12",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: "My Profile" }),
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
					className: "text-3xl font-bold font-serif m-0",
					children: "My Profile"
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 md:grid-cols-3 gap-8",
				children: [/* @__PURE__ */ jsx("div", {
					className: "md:col-span-2 space-y-8",
					children: /* @__PURE__ */ jsxs("div", {
						className: "bg-white p-6 rounded-xl border border-slate-200 shadow-sm",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between mb-6 border-b border-slate-100 pb-4",
							children: [/* @__PURE__ */ jsx("h2", {
								className: "text-xl font-bold font-serif",
								children: "Personal Information"
							}), !isEditing && /* @__PURE__ */ jsxs("button", {
								onClick: () => setIsEditing(true),
								className: "text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1",
								children: [/* @__PURE__ */ jsx("svg", {
									className: "w-4 h-4",
									fill: "none",
									stroke: "currentColor",
									viewBox: "0 0 24 24",
									children: /* @__PURE__ */ jsx("path", {
										strokeLinecap: "round",
										strokeLinejoin: "round",
										strokeWidth: "2",
										d: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
									})
								}), "Edit Profile"]
							})]
						}), isEditing ? /* @__PURE__ */ jsxs("form", {
							onSubmit: handleUpdateProfile,
							className: "space-y-4",
							children: [
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "block text-sm font-medium text-slate-700 mb-1",
									children: "Full Name"
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									value: formData.name,
									onChange: (e) => setFormData({
										...formData,
										name: e.target.value
									}),
									className: "w-full border border-slate-200 rounded px-3 py-2 outline-none focus:border-slate-900",
									required: true
								})] }),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "block text-sm font-medium text-slate-700 mb-1",
									children: "Avatar Image"
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-4",
									children: [formData.avatarUrl ? /* @__PURE__ */ jsx("img", {
										src: formData.avatarUrl,
										alt: "Avatar Preview",
										className: "w-16 h-16 rounded-full object-cover border border-slate-200"
									}) : /* @__PURE__ */ jsx("div", {
										className: "w-16 h-16 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center",
										children: /* @__PURE__ */ jsx("svg", {
											className: "w-6 h-6 text-slate-400",
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
										className: "flex-1 space-y-2",
										children: [/* @__PURE__ */ jsx("input", {
											type: "url",
											value: formData.avatarUrl,
											onChange: (e) => setFormData({
												...formData,
												avatarUrl: e.target.value
											}),
											placeholder: "Or paste image URL here...",
											className: "w-full border border-slate-200 rounded px-3 py-2 outline-none focus:border-slate-900 text-sm"
										}), /* @__PURE__ */ jsxs("div", {
											className: "flex gap-2",
											children: [/* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: () => fileInputRef.current?.click(),
												disabled: isUploadingImage,
												className: "text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded font-medium transition-colors disabled:opacity-50",
												children: isUploadingImage ? "Uploading..." : "Upload File"
											}), /* @__PURE__ */ jsx("input", {
												type: "file",
												ref: fileInputRef,
												onChange: handleImageUpload,
												accept: "image/*",
												className: "hidden"
											})]
										})]
									})]
								})] }),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "block text-sm font-medium text-slate-700 mb-1",
									children: "Biography"
								}), /* @__PURE__ */ jsx("textarea", {
									value: formData.bio,
									onChange: (e) => setFormData({
										...formData,
										bio: e.target.value
									}),
									className: "w-full border border-slate-200 rounded px-3 py-2 outline-none focus:border-slate-900 h-24 resize-none",
									placeholder: "Tell us about yourself..."
								})] }),
								/* @__PURE__ */ jsxs("div", {
									className: "flex gap-3 pt-4",
									children: [/* @__PURE__ */ jsx("button", {
										type: "submit",
										disabled: isUpdating,
										className: "bg-slate-900 text-white px-6 py-2 rounded text-sm font-medium hover:bg-slate-800 disabled:opacity-50",
										children: isUpdating ? "Saving..." : "Save Changes"
									}), /* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => setIsEditing(false),
										className: "px-6 py-2 border border-slate-200 rounded text-sm font-medium hover:bg-slate-50",
										children: "Cancel"
									})]
								})
							]
						}) : /* @__PURE__ */ jsxs("dl", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
									className: "text-sm font-medium text-slate-500",
									children: "Avatar"
								}), /* @__PURE__ */ jsx("dd", {
									className: "mt-2",
									children: user?.avatarUrl ? /* @__PURE__ */ jsx("img", {
										src: user.avatarUrl,
										alt: user.name,
										className: "w-16 h-16 rounded-full object-cover"
									}) : /* @__PURE__ */ jsx("div", {
										className: "w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 text-xl font-bold",
										children: user?.name?.charAt(0).toUpperCase()
									})
								})] }),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
									className: "text-sm font-medium text-slate-500",
									children: "Name"
								}), /* @__PURE__ */ jsx("dd", {
									className: "mt-1 text-lg font-semibold text-slate-900",
									children: user?.name || "Unknown User"
								})] }),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
									className: "text-sm font-medium text-slate-500",
									children: "Email"
								}), /* @__PURE__ */ jsx("dd", {
									className: "mt-1 text-lg font-semibold text-slate-900",
									children: user?.email || "No email provided"
								})] }),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
									className: "text-sm font-medium text-slate-500",
									children: "Biography"
								}), /* @__PURE__ */ jsx("dd", {
									className: "mt-1 text-base text-slate-700 whitespace-pre-line",
									children: user?.bio || /* @__PURE__ */ jsx("span", {
										className: "text-slate-400 italic",
										children: "No biography provided."
									})
								})] })
							]
						})]
					})
				}), /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", {
					className: "bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-24",
					children: [
						/* @__PURE__ */ jsx("h2", {
							className: "text-xl font-bold mb-6 font-serif border-b border-slate-100 pb-4",
							children: "Account Status"
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mb-6",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-sm font-medium text-slate-500 block mb-1",
								children: "Current Role"
							}), /* @__PURE__ */ jsx("span", {
								className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800",
								children: user?.role
							})]
						}),
						user?.role === "SUBSCRIBER" && /* @__PURE__ */ jsxs("div", {
							className: "border-t border-slate-100 pt-6",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "text-sm font-bold text-slate-900 mb-2",
								children: "Want to write for us?"
							}), requestStatus ? /* @__PURE__ */ jsxs("div", {
								className: `p-4 rounded-lg text-sm border ${requestStatus.status === "PENDING" ? "bg-amber-50 border-amber-200 text-amber-800" : requestStatus.status === "REJECTED" ? "bg-red-50 border-red-200 text-red-800" : "bg-green-50 border-green-200 text-green-800"}`,
								children: [
									/* @__PURE__ */ jsxs("p", {
										className: "font-semibold mb-1",
										children: ["Request ", requestStatus.status]
									}),
									requestStatus.status === "PENDING" && /* @__PURE__ */ jsx("p", { children: "Your request to become an Author is currently under review by our moderation team." }),
									requestStatus.status === "REJECTED" && /* @__PURE__ */ jsx("p", { children: "Unfortunately, your request was not approved at this time." })
								]
							}) : /* @__PURE__ */ jsxs("form", {
								onSubmit: handleSubmit,
								className: "space-y-4",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "block text-xs font-medium text-slate-500 mb-1",
									children: "Why do you want to write? (Optional)"
								}), /* @__PURE__ */ jsx("textarea", {
									value: reason,
									onChange: (e) => setReason(e.target.value),
									placeholder: "Link to your portfolio or tell us what you'd write about...",
									className: "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-900 resize-none h-24"
								})] }), /* @__PURE__ */ jsx("button", {
									type: "submit",
									disabled: isSubmitting,
									className: "w-full bg-slate-900 text-white font-medium text-sm py-2 px-4 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50",
									children: isSubmitting ? "Submitting..." : "Request Author Access"
								})]
							})]
						})
					]
				}) })]
			})
		]
	});
}
//#endregion
export { ProfilePage as default };
