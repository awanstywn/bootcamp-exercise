import { t as SEOHead } from "./SEOHead-CJrGekG-.js";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/pages/PrivacyPage.tsx
function PrivacyPage() {
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-4xl mx-auto px-6 py-16 min-h-screen",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: "Privacy Policy" }),
			/* @__PURE__ */ jsx("h1", {
				className: "text-4xl font-bold font-serif text-slate-900 mb-8",
				children: "Privacy Policy"
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
							children: "1. Information We Collect"
						}), /* @__PURE__ */ jsx("p", { children: "When you use BlogApp, we collect certain information to provide and improve our services. This includes your name, email address when you register, and any content you choose to publish on the platform. We also collect basic analytics such as page views to determine popular posts." })]
					}),
					/* @__PURE__ */ jsxs("section", {
						className: "mb-10 space-y-4 text-slate-700",
						children: [
							/* @__PURE__ */ jsx("h2", {
								className: "text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2",
								children: "2. How We Use Your Information"
							}),
							/* @__PURE__ */ jsx("p", { children: "We use the information we collect to:" }),
							/* @__PURE__ */ jsxs("ul", {
								className: "list-disc pl-6 space-y-2",
								children: [
									/* @__PURE__ */ jsx("li", { children: "Provide, maintain, and improve our services" }),
									/* @__PURE__ */ jsx("li", { children: "Process your registration and manage your account" }),
									/* @__PURE__ */ jsx("li", { children: "Respond to your comments and questions" }),
									/* @__PURE__ */ jsx("li", { children: "Send you technical notices and support messages" })
								]
							})
						]
					}),
					/* @__PURE__ */ jsxs("section", {
						className: "mb-10 space-y-4 text-slate-700",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2",
							children: "3. Data Security"
						}), /* @__PURE__ */ jsx("p", { children: "We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. Your passwords are cryptographically hashed and we use secure cookies for authentication." })]
					}),
					/* @__PURE__ */ jsxs("section", {
						className: "mb-10 space-y-4 text-slate-700",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2",
							children: "4. Contact Us"
						}), /* @__PURE__ */ jsx("p", { children: "If you have any questions about this Privacy Policy, please contact us at privacy@blogapp.com." })]
					})
				]
			})
		]
	});
}
//#endregion
export { PrivacyPage as default };
