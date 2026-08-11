import { i as api, r as useAuthStore } from "../entry-server.js";
import { t as SEOHead } from "./SEOHead-CJrGekG-.js";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/pages/VerifyEmailPage.tsx
function VerifyEmailPage() {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");
	const [status, setStatus] = useState("loading");
	const [error, setError] = useState("");
	const navigate = useNavigate();
	const setUser = useAuthStore((state) => state.setUser);
	const hasAttempted = useRef(false);
	useEffect(() => {
		if (!token) {
			setStatus("error");
			setError("Invalid or missing verification token.");
			return;
		}
		if (hasAttempted.current) return;
		hasAttempted.current = true;
		const verifyEmail = async () => {
			try {
				setUser((await api.post("/auth/verify-email", { token })).data.user);
				setStatus("success");
				setTimeout(() => {
					navigate("/dashboard");
				}, 3e3);
			} catch (err) {
				setStatus("error");
				if (isAxiosError(err)) setError(err.response?.data?.error || "Failed to verify email");
				else setError("An unexpected error occurred");
			}
		};
		verifyEmail();
	}, [
		token,
		navigate,
		setUser
	]);
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-50 flex flex-col",
		children: [/* @__PURE__ */ jsx(SEOHead, { title: "Verify Email" }), /* @__PURE__ */ jsx("div", {
			className: "flex-1 flex flex-col items-center justify-center p-6",
			children: /* @__PURE__ */ jsxs("div", {
				className: "w-full max-w-[440px] bg-white border border-slate-200 rounded-lg p-8 shadow-sm text-center",
				children: [
					status === "loading" && /* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx("div", { className: "w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-6" }),
						/* @__PURE__ */ jsx("h1", {
							className: "text-2xl font-bold font-serif text-slate-900 mb-2",
							children: "Verifying your email..."
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-slate-500 text-sm",
							children: "Please wait while we confirm your account."
						})
					] }),
					status === "success" && /* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx("div", {
							className: "w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6",
							children: /* @__PURE__ */ jsx("svg", {
								className: "w-8 h-8",
								fill: "none",
								stroke: "currentColor",
								viewBox: "0 0 24 24",
								children: /* @__PURE__ */ jsx("path", {
									strokeLinecap: "round",
									strokeLinejoin: "round",
									strokeWidth: "2",
									d: "M5 13l4 4L19 7"
								})
							})
						}),
						/* @__PURE__ */ jsx("h1", {
							className: "text-2xl font-bold font-serif text-slate-900 mb-2",
							children: "Email Verified!"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-slate-500 text-sm mb-6",
							children: "Your account has been successfully created."
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-sm text-slate-600",
							children: "Redirecting you to dashboard..."
						})
					] }),
					status === "error" && /* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx("div", {
							className: "w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6",
							children: /* @__PURE__ */ jsx("svg", {
								className: "w-8 h-8",
								fill: "none",
								stroke: "currentColor",
								viewBox: "0 0 24 24",
								children: /* @__PURE__ */ jsx("path", {
									strokeLinecap: "round",
									strokeLinejoin: "round",
									strokeWidth: "2",
									d: "M6 18L18 6M6 6l12 12"
								})
							})
						}),
						/* @__PURE__ */ jsx("h1", {
							className: "text-2xl font-bold font-serif text-slate-900 mb-2",
							children: "Verification Failed"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-red-600 text-sm mb-8",
							children: error
						}),
						/* @__PURE__ */ jsx(Link, {
							to: "/register",
							className: "inline-block bg-slate-900 text-white font-medium px-6 py-3 rounded hover:bg-slate-800 transition-colors",
							children: "Return to Registration"
						})
					] })
				]
			})
		})]
	});
}
//#endregion
export { VerifyEmailPage as default };
