import { i as api } from "../entry-server.js";
import { useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/pages/admin/AdminSettingsPage.tsx
/**
* @fileoverview Admin Settings Page
* @objective Provide a UI for configuring global site settings (e.g. Site Name, Registration rules).
* @risk Currently a UI mock. In a real scenario, changing these settings affects the entire platform's behavior.
* @relations Route: `/admin/settings`.
* @logic
* - Initializes mock settings state on mount.
* - `handleSave`: Simulates an API delay before confirming a successful save via an alert.
*/
function AdminSettingsPage() {
	const [settings, setSettings] = useState({});
	const [isSaving, setIsSaving] = useState(false);
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
	const handleSave = async (e) => {
		e.preventDefault();
		setIsSaving(true);
		try {
			await api.patch("/settings", settings);
			alert("Settings saved!");
		} catch (_error) {
			alert("Failed to save settings");
		} finally {
			setIsSaving(false);
		}
	};
	const handleChange = (key, value) => {
		setSettings((prev) => ({
			...prev,
			[key]: value
		}));
	};
	if (isLoading) return /* @__PURE__ */ jsx("div", { children: "Loading settings..." });
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-4xl",
		children: [/* @__PURE__ */ jsx("h1", {
			className: "text-2xl font-bold mb-6",
			children: "Site Settings"
		}), /* @__PURE__ */ jsxs("form", {
			onSubmit: handleSave,
			className: "space-y-8",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "bg-white rounded-xl shadow-sm border border-slate-200 p-6",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "text-lg font-bold mb-4 font-serif",
						children: "About Page - Hero"
					}), /* @__PURE__ */ jsxs("div", {
						className: "space-y-4",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-sm font-medium text-slate-700 mb-1",
							children: "Hero Title"
						}), /* @__PURE__ */ jsx("input", {
							type: "text",
							value: settings.aboutHeroTitle || "",
							onChange: (e) => handleChange("aboutHeroTitle", e.target.value),
							className: "w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
						})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-sm font-medium text-slate-700 mb-1",
							children: "Hero Subtitle"
						}), /* @__PURE__ */ jsx("textarea", {
							value: settings.aboutHeroSubtitle || "",
							onChange: (e) => handleChange("aboutHeroSubtitle", e.target.value),
							className: "w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none",
							rows: 2
						})] })]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "bg-white rounded-xl shadow-sm border border-slate-200 p-6",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "text-lg font-bold mb-4 font-serif",
						children: "About Page - Mission"
					}), /* @__PURE__ */ jsxs("div", {
						className: "space-y-4",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-sm font-medium text-slate-700 mb-1",
							children: "Mission Paragraph 1"
						}), /* @__PURE__ */ jsx("textarea", {
							value: settings.aboutMissionText1 || "",
							onChange: (e) => handleChange("aboutMissionText1", e.target.value),
							className: "w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none",
							rows: 3
						})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-sm font-medium text-slate-700 mb-1",
							children: "Mission Paragraph 2"
						}), /* @__PURE__ */ jsx("textarea", {
							value: settings.aboutMissionText2 || "",
							onChange: (e) => handleChange("aboutMissionText2", e.target.value),
							className: "w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none",
							rows: 3
						})] })]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "bg-white rounded-xl shadow-sm border border-slate-200 p-6",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "text-lg font-bold mb-4 font-serif",
						children: "About Page - Statistics"
					}), /* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-3 gap-6",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-4",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "block text-sm font-medium text-slate-700 mb-1",
									children: "Stat 1 Value"
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									value: settings.aboutStat1Value || "",
									onChange: (e) => handleChange("aboutStat1Value", e.target.value),
									className: "w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
								})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "block text-sm font-medium text-slate-700 mb-1",
									children: "Stat 1 Label"
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									value: settings.aboutStat1Label || "",
									onChange: (e) => handleChange("aboutStat1Label", e.target.value),
									className: "w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
								})] })]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-4",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "block text-sm font-medium text-slate-700 mb-1",
									children: "Stat 2 Value"
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									value: settings.aboutStat2Value || "",
									onChange: (e) => handleChange("aboutStat2Value", e.target.value),
									className: "w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
								})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "block text-sm font-medium text-slate-700 mb-1",
									children: "Stat 2 Label"
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									value: settings.aboutStat2Label || "",
									onChange: (e) => handleChange("aboutStat2Label", e.target.value),
									className: "w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
								})] })]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-4",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "block text-sm font-medium text-slate-700 mb-1",
									children: "Stat 3 Value"
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									value: settings.aboutStat3Value || "",
									onChange: (e) => handleChange("aboutStat3Value", e.target.value),
									className: "w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
								})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "block text-sm font-medium text-slate-700 mb-1",
									children: "Stat 3 Label"
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									value: settings.aboutStat3Label || "",
									onChange: (e) => handleChange("aboutStat3Label", e.target.value),
									className: "w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
								})] })]
							})
						]
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "flex justify-end",
					children: /* @__PURE__ */ jsx("button", {
						type: "submit",
						disabled: isSaving,
						className: "px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium",
						children: isSaving ? "Saving..." : "Save All Settings"
					})
				})
			]
		})]
	});
}
//#endregion
export { AdminSettingsPage as default };
