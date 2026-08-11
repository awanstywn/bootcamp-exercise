import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/ConfirmModal.tsx
function ConfirmModal({ isOpen, title, message, confirmText = "Confirm", cancelText = "Cancel", isDangerous = false, onConfirm, onCancel, isLoading = false }) {
	if (!isOpen) return null;
	return /* @__PURE__ */ jsx("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm",
		children: /* @__PURE__ */ jsxs("div", {
			className: "bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200",
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": "modal-title",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "p-6",
				children: [/* @__PURE__ */ jsx("h3", {
					id: "modal-title",
					className: "text-xl font-bold text-slate-900 mb-2",
					children: title
				}), /* @__PURE__ */ jsx("div", {
					className: "text-slate-600 text-sm",
					children: message
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100",
				children: [/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: onCancel,
					disabled: isLoading,
					className: "px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50",
					children: cancelText
				}), /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: onConfirm,
					disabled: isLoading,
					className: `px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${isDangerous ? "bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2" : "bg-slate-900 hover:bg-slate-800 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"}`,
					children: [isLoading && /* @__PURE__ */ jsxs("svg", {
						className: "animate-spin h-4 w-4 text-current",
						xmlns: "http://www.w3.org/2000/svg",
						fill: "none",
						viewBox: "0 0 24 24",
						children: [/* @__PURE__ */ jsx("circle", {
							className: "opacity-25",
							cx: "12",
							cy: "12",
							r: "10",
							stroke: "currentColor",
							strokeWidth: "4"
						}), /* @__PURE__ */ jsx("path", {
							className: "opacity-75",
							fill: "currentColor",
							d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						})]
					}), confirmText]
				})]
			})]
		})
	});
}
//#endregion
export { ConfirmModal as t };
