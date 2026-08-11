import { t as SEOHead } from "./SEOHead-CJrGekG-.js";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/pages/TermsPage.tsx
/**
* @fileoverview [Brief description of the file's purpose]
* @objective Provide the necessary logic and structural foundation for this specific module/component.
* @risk Contains standard logic; ensure strict typing to prevent runtime errors.
* @relations Integrates with related features within the layer.
* @logic Follows the established architectural patterns and standard guidelines.
*/
function TermsPage() {
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-4xl mx-auto px-6 py-16 min-h-screen",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: "Terms of Service" }),
			/* @__PURE__ */ jsx("h1", {
				className: "text-4xl font-bold font-serif text-slate-900 mb-8",
				children: "Terms of Service"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "prose prose-slate max-w-none",
				children: [
					/* @__PURE__ */ jsxs("p", {
						className: "text-slate-600 text-lg mb-8",
						children: ["Last updated: ", (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
							month: "long",
							day: "numeric",
							year: "numeric"
						})]
					}),
					/* @__PURE__ */ jsxs("section", {
						className: "mb-10 space-y-4 text-slate-700",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2",
							children: "1. Acceptance of Terms"
						}), /* @__PURE__ */ jsx("p", { children: "By accessing and using BlogApp, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use our service." })]
					}),
					/* @__PURE__ */ jsxs("section", {
						className: "mb-10 space-y-4 text-slate-700",
						children: [
							/* @__PURE__ */ jsx("h2", {
								className: "text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2",
								children: "2. User Accounts"
							}),
							/* @__PURE__ */ jsx("p", { children: "When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service." }),
							/* @__PURE__ */ jsx("p", { children: "You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password." })
						]
					}),
					/* @__PURE__ */ jsxs("section", {
						className: "mb-10 space-y-4 text-slate-700",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2",
							children: "3. Content"
						}), /* @__PURE__ */ jsx("p", { children: "Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the content that you post on or through the Service, including its legality, reliability, and appropriateness." })]
					}),
					/* @__PURE__ */ jsxs("section", {
						className: "mb-10 space-y-4 text-slate-700",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2",
							children: "4. Intellectual Property"
						}), /* @__PURE__ */ jsx("p", { children: "The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of BlogApp and its licensors." })]
					})
				]
			})
		]
	});
}
//#endregion
export { TermsPage as default };
