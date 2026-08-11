import { i as api } from "../entry-server.js";
import { t as SEOHead } from "./SEOHead-CJrGekG-.js";
import { useState } from "react";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/pages/ForgotPasswordPage.tsx
function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setIsLoading(true);
		try {
			setSuccess((await api.post("/auth/forgot-password", { email })).data.message);
		} catch (err) {
			if (isAxiosError(err)) setError(err.response?.data?.error || "Failed to send reset link");
			else setError("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-50 flex flex-col",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: "Forgot Password" }),
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
						to: "/login",
						className: "hover:text-slate-900 transition-colors",
						children: "Login"
					}),
					/* @__PURE__ */ jsx("span", { children: "›" }),
					/* @__PURE__ */ jsx("span", {
						className: "text-slate-900",
						children: "Forgot Password"
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "flex-1 flex flex-col items-center justify-center p-6",
				children: /* @__PURE__ */ jsxs("div", {
					className: "w-full max-w-[440px] bg-white border border-slate-200 rounded-lg p-8 shadow-sm",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "flex justify-center mb-6",
							children: /* @__PURE__ */ jsx("div", {
								className: "w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-400",
								children: /* @__PURE__ */ jsx("svg", {
									className: "w-8 h-8",
									fill: "none",
									stroke: "currentColor",
									viewBox: "0 0 24 24",
									children: /* @__PURE__ */ jsx("path", {
										strokeLinecap: "round",
										strokeLinejoin: "round",
										strokeWidth: "2",
										d: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
									})
								})
							})
						}),
						/* @__PURE__ */ jsx("h1", {
							className: "text-3xl font-bold font-serif text-center text-slate-900 mb-2",
							children: "Forgot Password"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-center text-slate-500 text-sm mb-8",
							children: "Enter your email and we will send you a reset link."
						}),
						success && /* @__PURE__ */ jsx("div", {
							"aria-live": "polite",
							className: "bg-green-50 border border-green-100 text-green-600 p-3 rounded mb-6 text-sm text-center",
							children: success
						}),
						/* @__PURE__ */ jsxs("form", {
							onSubmit: handleSubmit,
							className: "space-y-5",
							children: [/* @__PURE__ */ jsxs("div", { children: [
								/* @__PURE__ */ jsx("label", {
									htmlFor: "email",
									className: "block text-sm font-bold text-slate-900 mb-1.5",
									children: "Email address"
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "relative",
									children: [/* @__PURE__ */ jsx("div", {
										className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",
										children: /* @__PURE__ */ jsx("svg", {
											className: "h-5 w-5 text-slate-400",
											fill: "none",
											stroke: "currentColor",
											viewBox: "0 0 24 24",
											children: /* @__PURE__ */ jsx("path", {
												strokeLinecap: "round",
												strokeLinejoin: "round",
												strokeWidth: "2",
												d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
											})
										})
									}), /* @__PURE__ */ jsx("input", {
										id: "email",
										type: "email",
										required: true,
										value: email,
										onChange: (e) => setEmail(e.target.value),
										className: `w-full pl-10 pr-4 py-2.5 border rounded text-sm focus:outline-none focus:ring-1 transition-colors ${error ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-slate-400 focus:border-slate-400"}`,
										placeholder: "Enter your email"
									})]
								}),
								error && /* @__PURE__ */ jsx("p", {
									className: "mt-1.5 text-sm text-red-600",
									"aria-live": "polite",
									children: error
								})
							] }), /* @__PURE__ */ jsx("button", {
								type: "submit",
								disabled: isLoading,
								className: "w-full bg-slate-900 text-white font-medium py-3 rounded hover:bg-slate-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed",
								children: isLoading ? "Sending link..." : "Send reset link"
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "text-center text-sm text-slate-600 mt-6",
							children: [
								"Remember your password?",
								" ",
								/* @__PURE__ */ jsx(Link, {
									to: "/login",
									className: "text-slate-900 font-bold hover:underline underline-offset-2",
									children: "Login"
								})
							]
						})
					]
				})
			})
		]
	});
}
//#endregion
export { ForgotPasswordPage as default };
