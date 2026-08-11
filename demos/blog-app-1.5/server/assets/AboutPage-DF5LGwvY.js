import { i as api } from "../entry-server.js";
import { t as SEOHead } from "./SEOHead-CJrGekG-.js";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/pages/AboutPage.tsx
/**
* @fileoverview [Brief description of the file's purpose]
* @objective Provide the necessary logic and structural foundation for this specific module/component.
* @risk Contains standard logic; ensure strict typing to prevent runtime errors.
* @relations Integrates with related features within the layer.
* @logic Follows the established architectural patterns and standard guidelines.
*/
function AboutPage() {
	const [settings, setSettings] = useState({});
	const [isLoading, setIsLoading] = useState(true);
	useEffect(() => {
		api.get("/settings").then((res) => {
			setSettings(res.data);
			setIsLoading(false);
		}).catch((err) => {
			console.error(err);
			setIsLoading(false);
		});
	}, []);
	if (isLoading) return /* @__PURE__ */ jsx("div", {
		className: "min-h-screen bg-slate-50 flex items-center justify-center",
		children: /* @__PURE__ */ jsx("div", {
			className: "text-slate-500 font-medium",
			children: "Loading..."
		})
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-50",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: "About Us - Our Mission & Team" }),
			/* @__PURE__ */ jsx("section", {
				className: "bg-slate-900 text-white py-24 px-6",
				children: /* @__PURE__ */ jsxs("div", {
					className: "max-w-4xl mx-auto text-center space-y-6",
					children: [/* @__PURE__ */ jsx("h1", {
						className: "text-4xl md:text-5xl font-bold font-serif leading-tight",
						children: settings.aboutHeroTitle || "Empowering developers to build the future of the web."
					}), /* @__PURE__ */ jsx("p", {
						className: "text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed",
						children: settings.aboutHeroSubtitle || "We are a community-driven platform dedicated to sharing high-quality, actionable insights on software engineering, design, and technology."
					})]
				})
			}),
			/* @__PURE__ */ jsx("section", {
				className: "py-20 px-6 max-w-4xl mx-auto",
				children: /* @__PURE__ */ jsxs("div", {
					className: "grid md:grid-cols-2 gap-12 items-center",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "space-y-6",
						children: [
							/* @__PURE__ */ jsx("h2", {
								className: "text-3xl font-bold font-serif text-slate-900",
								children: "Our Mission"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-slate-600 leading-relaxed text-lg",
								children: settings.aboutMissionText1 || "Technology moves fast. Too fast for any single person to keep up with alone. Our mission is to cut through the noise and provide a curated space where experienced professionals and eager learners can exchange real-world knowledge."
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-slate-600 leading-relaxed text-lg",
								children: settings.aboutMissionText2 || "Whether you're debugging a complex microservices architecture or just starting your first React project, we believe that open knowledge sharing is the key to pushing the entire industry forward."
							})
						]
					}), /* @__PURE__ */ jsx("div", {
						className: "bg-white p-8 rounded-2xl shadow-sm border border-slate-200",
						children: /* @__PURE__ */ jsxs("div", {
							className: "space-y-8",
							children: [
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
									className: "text-4xl font-black text-indigo-600 mb-2",
									children: settings.aboutStat1Value || "1M+"
								}), /* @__PURE__ */ jsx("div", {
									className: "text-sm font-bold tracking-wider text-slate-500 uppercase",
									children: settings.aboutStat1Label || "Monthly Readers"
								})] }),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
									className: "text-4xl font-black text-indigo-600 mb-2",
									children: settings.aboutStat2Value || "500+"
								}), /* @__PURE__ */ jsx("div", {
									className: "text-sm font-bold tracking-wider text-slate-500 uppercase",
									children: settings.aboutStat2Label || "Expert Contributors"
								})] }),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
									className: "text-4xl font-black text-indigo-600 mb-2",
									children: settings.aboutStat3Value || "10k+"
								}), /* @__PURE__ */ jsx("div", {
									className: "text-sm font-bold tracking-wider text-slate-500 uppercase",
									children: settings.aboutStat3Label || "Articles Published"
								})] })
							]
						})
					})]
				})
			}),
			/* @__PURE__ */ jsx("section", {
				className: "py-24 px-6 bg-white border-t border-slate-200",
				children: /* @__PURE__ */ jsxs("div", {
					className: "max-w-3xl mx-auto text-center space-y-8",
					children: [
						/* @__PURE__ */ jsx("h2", {
							className: "text-3xl font-bold font-serif text-slate-900",
							children: settings.aboutCtaTitle || "Join Our Community of Writers"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-lg text-slate-600",
							children: settings.aboutCtaText || "Have a story to share? A technical deep-dive? We are always looking for passionate voices to join our growing roster of authors."
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex justify-center gap-4",
							children: [/* @__PURE__ */ jsx(Link, {
								to: "/authors",
								className: "px-6 py-3 border-2 border-slate-200 text-slate-900 font-medium rounded-lg hover:border-slate-900 transition-colors",
								children: "Meet Our Authors"
							}), /* @__PURE__ */ jsx(Link, {
								to: "/register",
								className: "px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors",
								children: "Become an Author"
							})]
						})
					]
				})
			})
		]
	});
}
//#endregion
export { AboutPage as default };
