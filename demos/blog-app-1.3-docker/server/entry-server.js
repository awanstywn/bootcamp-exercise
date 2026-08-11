import React, { Component, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import ReactDOMServer from "react-dom/server";
import { Link, NavLink, Navigate, Outlet, Route, Routes, StaticRouter, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { create } from "zustand";
import axios, { isAxiosError } from "axios";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import fastCompare from "react-fast-compare";
import invariant from "invariant";
import shallowEqual from "shallowequal";
import { format, formatDistanceToNow } from "date-fns";
//#region src/lib/axios.ts
/**
* @fileoverview Axios HTTP Client Configuration
* @objective Configure the base Axios instance with default settings (baseURL, credentials) and response interceptors.
* @risk Infinite loops can occur if the interceptor constantly retries a failed refresh token request.
* @relations Used globally across the frontend to communicate with the Express backend.
* @logic
* - Sets `withCredentials: true` to ensure cookies (Access/Refresh tokens) are sent with every cross-origin request.
* - Intercepts `401 Unauthorized` responses.
* - If a 401 occurs, it attempts to call `/auth/refresh` once (`_retry` flag).
* - If refresh succeeds, it replays the original failed request.
* - If refresh fails, it dispatches a global `auth-unauthorized` event to forcefully log the user out.
*/
var api = axios.create({
	baseURL: "http://localhost:3000/api",
	withCredentials: true
});
var isRefreshing = false;
var failedQueue = [];
var processQueue = (error) => {
	failedQueue.forEach((prom) => {
		if (error) prom.reject(error);
		else prom.resolve();
	});
	failedQueue = [];
};
api.interceptors.response.use((response) => response, async (error) => {
	const originalRequest = error.config;
	if (error.response?.status === 401 && originalRequest && !originalRequest._retry && originalRequest.url !== "/auth/login" && originalRequest.url !== "/auth/refresh") {
		if (isRefreshing) return new Promise((resolve, reject) => {
			failedQueue.push({
				resolve,
				reject
			});
		}).then(() => api(originalRequest)).catch((err) => Promise.reject(err));
		originalRequest._retry = true;
		isRefreshing = true;
		try {
			await api.post("/auth/refresh");
			processQueue(null);
			return api(originalRequest);
		} catch (refreshError) {
			processQueue(refreshError);
			if (typeof window !== "undefined") window.dispatchEvent(new Event("auth-unauthorized"));
			return Promise.reject(refreshError);
		} finally {
			isRefreshing = false;
		}
	}
	return Promise.reject(error);
});
//#endregion
//#region src/store/authStore.ts
/**
* @fileoverview Authentication Global State (Zustand)
* @objective Manage the current user's session state and provide methods for logging in, logging out, and verifying sessions.
* @risk XSS vulnerabilities if sensitive data (like tokens) were stored here. However, this app stores tokens in HTTP-only cookies, so the store only holds safe UI data.
* @relations Used globally (App.tsx, ProtectedRoute.tsx, Navbar). Interacts with `axios.ts`.
* @logic
* - `checkAuth`: Hits `/auth/me` to verify if the server considers the session valid based on current cookies.
* - `logout`: Hits `/auth/logout` to clear server cookies, then nullifies the local user state.
* - Listens to the `auth-unauthorized` event emitted by the Axios interceptor to log out immediately if the refresh token expires.
*/
var useAuthStore = create((set) => ({
	user: null,
	isAuthenticated: false,
	isLoading: true,
	checkAuth: async () => {
		try {
			set({
				user: (await api.get("/auth/me")).data.user,
				isAuthenticated: true,
				isLoading: false
			});
		} catch (_error) {
			set({
				user: null,
				isAuthenticated: false,
				isLoading: false
			});
		}
	},
	logout: async () => {
		try {
			await api.post("/auth/logout");
		} catch (error) {
			console.error("Logout failed", error);
		} finally {
			set({
				user: null,
				isAuthenticated: false
			});
		}
	},
	setUser: (user) => set({
		user,
		isAuthenticated: true
	})
}));
if (typeof window !== "undefined") window.addEventListener("auth-unauthorized", () => {
	useAuthStore.setState({
		user: null,
		isAuthenticated: false
	});
});
//#endregion
//#region src/components/ProtectedRoute.tsx
function ProtectedRoute({ children, requireRole }) {
	const { isAuthenticated, user, isLoading } = useAuthStore();
	const location = useLocation();
	if (isLoading) return /* @__PURE__ */ jsx("div", {
		className: "p-8 text-center text-slate-500",
		children: "Loading..."
	});
	if (!isAuthenticated) return /* @__PURE__ */ jsx(Navigate, {
		to: "/login",
		state: { from: location },
		replace: true
	});
	if (requireRole && user && !requireRole.includes(user.role)) return /* @__PURE__ */ jsxs("div", {
		className: "max-w-md mx-auto mt-16 p-8 glass-panel rounded-xl text-center shadow-sm",
		children: [
			/* @__PURE__ */ jsx("h2", {
				className: "text-xl font-bold text-red-600 mb-2",
				children: "Access Denied"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-slate-600 mb-4",
				children: "You do not have permission to view this page."
			}),
			/* @__PURE__ */ jsx(Link, {
				to: "/",
				className: "btn-secondary inline-block",
				children: "Return Home"
			})
		]
	});
	return /* @__PURE__ */ jsx(Fragment, { children });
}
//#endregion
//#region src/components/layout/Header.tsx
var navLinkClass = ({ isActive }) => isActive ? "text-slate-900 border-b-2 border-slate-900 pb-1" : "hover:text-slate-900 pb-1 border-b-2 border-transparent";
function Header() {
	const { user, logout, isAuthenticated, isLoading } = useAuthStore();
	const navigate = useNavigate();
	const location = useLocation();
	const [categories, setCategories] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const hasFetchedCategories = useRef(false);
	useEffect(() => {
		if (!hasFetchedCategories.current) {
			hasFetchedCategories.current = true;
			api.get("/content/categories").then((res) => setCategories(res.data)).catch(console.error);
		}
	}, []);
	useEffect(() => {
		setSearchQuery("");
	}, [location.pathname]);
	const handleLogout = async () => {
		await logout();
		navigate("/");
	};
	return /* @__PURE__ */ jsxs("header", {
		className: "bg-white border-b border-surface-200 py-4 px-8 flex items-center justify-between",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ jsx("div", {
					className: "w-8 h-8 bg-slate-900 rounded text-white flex items-center justify-center font-bold",
					children: "B"
				}), /* @__PURE__ */ jsx(Link, {
					to: "/",
					className: "font-bold text-xl font-serif tracking-normal",
					children: "BlogApp"
				})]
			}),
			/* @__PURE__ */ jsxs("nav", {
				className: "hidden md:flex gap-8 text-sm font-medium text-slate-600 items-center",
				children: [
					/* @__PURE__ */ jsx(NavLink, {
						to: "/",
						className: navLinkClass,
						children: "Home"
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "relative group cursor-pointer py-4 -my-4",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-1 hover:text-slate-900 pb-1 border-b-2 border-transparent group-hover:border-slate-300",
							children: ["Categories", /* @__PURE__ */ jsx("svg", {
								className: "w-4 h-4 group-hover:rotate-180 transition-transform",
								fill: "none",
								stroke: "currentColor",
								viewBox: "0 0 24 24",
								children: /* @__PURE__ */ jsx("path", {
									strokeLinecap: "round",
									strokeLinejoin: "round",
									strokeWidth: "2",
									d: "M19 9l-7 7-7-7"
								})
							})]
						}), /* @__PURE__ */ jsx("div", {
							className: "absolute top-full left-0 mt-0 w-48 bg-white border border-slate-200 shadow-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col z-50 py-1",
							children: categories.map((cat) => /* @__PURE__ */ jsx(Link, {
								to: `/categories/${cat.slug}`,
								className: "px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors",
								children: cat.name
							}, cat.id))
						})]
					}),
					/* @__PURE__ */ jsx(NavLink, {
						to: "/tags",
						className: navLinkClass,
						children: "Tags"
					}),
					/* @__PURE__ */ jsx(NavLink, {
						to: "/authors",
						className: navLinkClass,
						children: "Authors"
					}),
					/* @__PURE__ */ jsx(NavLink, {
						to: "/about",
						className: navLinkClass,
						children: "About"
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex gap-4 items-center",
				children: [/* @__PURE__ */ jsxs("form", {
					onSubmit: (e) => {
						e.preventDefault();
						if (searchQuery.trim()) {
							navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
							setSearchQuery("");
						}
					},
					className: "hidden lg:flex relative",
					children: [/* @__PURE__ */ jsx("input", {
						name: "q",
						type: "text",
						placeholder: "Search posts...",
						value: searchQuery,
						onChange: (e) => setSearchQuery(e.target.value),
						className: "pl-4 pr-10 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-slate-400 focus:bg-white transition-colors w-48"
					}), /* @__PURE__ */ jsx("button", {
						type: "submit",
						className: "absolute right-3 top-2.5",
						children: /* @__PURE__ */ jsx("svg", {
							className: "w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors",
							fill: "none",
							stroke: "currentColor",
							viewBox: "0 0 24 24",
							children: /* @__PURE__ */ jsx("path", {
								strokeLinecap: "round",
								strokeLinejoin: "round",
								strokeWidth: "2",
								d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							})
						})
					})]
				}), isLoading ? /* @__PURE__ */ jsx("div", { className: "w-32 h-8 bg-slate-100 animate-pulse rounded-full hidden sm:block" }) : isAuthenticated ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs(Link, {
					to: "/dashboard",
					className: "text-sm font-medium hover:text-slate-900 hidden sm:block transition-colors",
					children: ["Hi, ", user?.name]
				}), /* @__PURE__ */ jsx("button", {
					onClick: handleLogout,
					className: "text-sm text-slate-500 hover:text-slate-800",
					children: "Logout"
				})] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Link, {
					to: "/login",
					className: "text-sm font-medium text-slate-700 hover:text-slate-900 hidden sm:block",
					children: "Login"
				}), /* @__PURE__ */ jsx(Link, {
					to: "/register",
					className: "bg-slate-900 text-white px-5 py-2 rounded text-sm font-medium hover:bg-slate-800 transition-colors",
					children: "Register"
				})] })]
			})
		]
	});
}
//#endregion
//#region src/components/layout/Footer.tsx
var footerNavLinkClass = ({ isActive }) => isActive ? "text-slate-900 font-bold" : "hover:text-slate-900 transition-colors";
function Footer() {
	return /* @__PURE__ */ jsxs("footer", {
		className: "bg-white border-t border-slate-200 py-12 px-8 mt-16",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col items-center md:items-start space-y-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx("div", {
						className: "w-8 h-8 border border-slate-200 rounded flex items-center justify-center",
						children: /* @__PURE__ */ jsx("svg", {
							className: "w-5 h-5 text-slate-700",
							fill: "none",
							stroke: "currentColor",
							viewBox: "0 0 24 24",
							children: /* @__PURE__ */ jsx("path", {
								strokeLinecap: "round",
								strokeLinejoin: "round",
								strokeWidth: "2",
								d: "M12 6v6m0 0v6m0-6h6m-6 0H6"
							})
						})
					}), /* @__PURE__ */ jsx("span", {
						className: "font-bold text-xl font-serif tracking-normal text-slate-900",
						children: "BlogApp"
					})]
				}), /* @__PURE__ */ jsx("p", {
					className: "text-slate-500 text-sm max-w-xs text-center md:text-left",
					children: "A platform for sharing knowledge and ideas. Read. Learn. Grow."
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex gap-6 text-sm text-slate-500 font-medium",
				children: [
					/* @__PURE__ */ jsx(NavLink, {
						to: "/",
						className: footerNavLinkClass,
						children: "Home"
					}),
					/* @__PURE__ */ jsx(NavLink, {
						to: "/categories",
						className: footerNavLinkClass,
						children: "Categories"
					}),
					/* @__PURE__ */ jsx(NavLink, {
						to: "/tags",
						className: footerNavLinkClass,
						children: "Tags"
					}),
					/* @__PURE__ */ jsx(NavLink, {
						to: "/authors",
						className: footerNavLinkClass,
						children: "Authors"
					}),
					/* @__PURE__ */ jsx(NavLink, {
						to: "/about",
						className: footerNavLinkClass,
						children: "About"
					})
				]
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500",
			children: [/* @__PURE__ */ jsxs("p", { children: [
				"© ",
				(/* @__PURE__ */ new Date()).getFullYear(),
				" BlogApp. All rights reserved."
			] }), /* @__PURE__ */ jsxs("div", {
				className: "flex gap-4",
				children: [/* @__PURE__ */ jsx(NavLink, {
					to: "/privacy",
					className: footerNavLinkClass,
					children: "Privacy Policy"
				}), /* @__PURE__ */ jsx(NavLink, {
					to: "/terms",
					className: footerNavLinkClass,
					children: "Terms of Service"
				})]
			})]
		})]
	});
}
//#endregion
//#region ../node_modules/react-helmet-async/lib/index.esm.js
var TAG_NAMES = /* @__PURE__ */ ((TAG_NAMES2) => {
	TAG_NAMES2["BASE"] = "base";
	TAG_NAMES2["BODY"] = "body";
	TAG_NAMES2["HEAD"] = "head";
	TAG_NAMES2["HTML"] = "html";
	TAG_NAMES2["LINK"] = "link";
	TAG_NAMES2["META"] = "meta";
	TAG_NAMES2["NOSCRIPT"] = "noscript";
	TAG_NAMES2["SCRIPT"] = "script";
	TAG_NAMES2["STYLE"] = "style";
	TAG_NAMES2["TITLE"] = "title";
	TAG_NAMES2["FRAGMENT"] = "Symbol(react.fragment)";
	return TAG_NAMES2;
})(TAG_NAMES || {});
var SEO_PRIORITY_TAGS = {
	link: { rel: [
		"amphtml",
		"canonical",
		"alternate"
	] },
	script: { type: ["application/ld+json"] },
	meta: {
		charset: "",
		name: [
			"generator",
			"robots",
			"description"
		],
		property: [
			"og:type",
			"og:title",
			"og:url",
			"og:image",
			"og:image:alt",
			"og:description",
			"twitter:url",
			"twitter:title",
			"twitter:description",
			"twitter:image",
			"twitter:image:alt",
			"twitter:card",
			"twitter:site"
		]
	}
};
var VALID_TAG_NAMES = Object.values(TAG_NAMES);
var REACT_TAG_MAP = {
	accesskey: "accessKey",
	charset: "charSet",
	class: "className",
	contenteditable: "contentEditable",
	contextmenu: "contextMenu",
	"http-equiv": "httpEquiv",
	itemprop: "itemProp",
	tabindex: "tabIndex"
};
var HTML_TAG_MAP = Object.entries(REACT_TAG_MAP).reduce((carry, [key, value]) => {
	carry[value] = key;
	return carry;
}, {});
var HELMET_ATTRIBUTE = "data-rh";
var HELMET_PROPS = {
	DEFAULT_TITLE: "defaultTitle",
	DEFER: "defer",
	ENCODE_SPECIAL_CHARACTERS: "encodeSpecialCharacters",
	ON_CHANGE_CLIENT_STATE: "onChangeClientState",
	TITLE_TEMPLATE: "titleTemplate",
	PRIORITIZE_SEO_TAGS: "prioritizeSeoTags"
};
var getInnermostProperty = (propsList, property) => {
	for (let i = propsList.length - 1; i >= 0; i -= 1) {
		const props = propsList[i];
		if (Object.prototype.hasOwnProperty.call(props, property)) return props[property];
	}
	return null;
};
var getTitleFromPropsList = (propsList) => {
	let innermostTitle = getInnermostProperty(propsList, "title");
	const innermostTemplate = getInnermostProperty(propsList, HELMET_PROPS.TITLE_TEMPLATE);
	if (Array.isArray(innermostTitle)) innermostTitle = innermostTitle.join("");
	if (innermostTemplate && innermostTitle) return innermostTemplate.replace(/%s/g, () => innermostTitle);
	const innermostDefaultTitle = getInnermostProperty(propsList, HELMET_PROPS.DEFAULT_TITLE);
	return innermostTitle || innermostDefaultTitle || void 0;
};
var getOnChangeClientState = (propsList) => getInnermostProperty(propsList, HELMET_PROPS.ON_CHANGE_CLIENT_STATE) || (() => {});
var getAttributesFromPropsList = (tagType, propsList) => propsList.filter((props) => typeof props[tagType] !== "undefined").map((props) => props[tagType]).reduce((tagAttrs, current) => ({
	...tagAttrs,
	...current
}), {});
var getBaseTagFromPropsList = (primaryAttributes, propsList) => propsList.filter((props) => typeof props["base"] !== "undefined").map((props) => props["base"]).reverse().reduce((innermostBaseTag, tag) => {
	if (!innermostBaseTag.length) {
		const keys = Object.keys(tag);
		for (let i = 0; i < keys.length; i += 1) {
			const lowerCaseAttributeKey = keys[i].toLowerCase();
			if (primaryAttributes.indexOf(lowerCaseAttributeKey) !== -1 && tag[lowerCaseAttributeKey]) return innermostBaseTag.concat(tag);
		}
	}
	return innermostBaseTag;
}, []);
var warn = (msg) => console && typeof console.warn === "function" && console.warn(msg);
var getTagsFromPropsList = (tagName, primaryAttributes, propsList) => {
	const approvedSeenTags = {};
	return propsList.filter((props) => {
		if (Array.isArray(props[tagName])) return true;
		if (typeof props[tagName] !== "undefined") warn(`Helmet: ${tagName} should be of type "Array". Instead found type "${typeof props[tagName]}"`);
		return false;
	}).map((props) => props[tagName]).reverse().reduce((approvedTags, instanceTags) => {
		const instanceSeenTags = {};
		instanceTags.filter((tag) => {
			let primaryAttributeKey;
			const keys2 = Object.keys(tag);
			for (let i = 0; i < keys2.length; i += 1) {
				const attributeKey = keys2[i];
				const lowerCaseAttributeKey = attributeKey.toLowerCase();
				if (primaryAttributes.indexOf(lowerCaseAttributeKey) !== -1 && !(primaryAttributeKey === "rel" && tag[primaryAttributeKey].toLowerCase() === "canonical") && !(lowerCaseAttributeKey === "rel" && tag[lowerCaseAttributeKey].toLowerCase() === "stylesheet")) primaryAttributeKey = lowerCaseAttributeKey;
				if (primaryAttributes.indexOf(attributeKey) !== -1 && (attributeKey === "innerHTML" || attributeKey === "cssText" || attributeKey === "itemprop")) primaryAttributeKey = attributeKey;
			}
			if (!primaryAttributeKey || !tag[primaryAttributeKey]) return false;
			const value = tag[primaryAttributeKey].toLowerCase();
			if (!approvedSeenTags[primaryAttributeKey]) approvedSeenTags[primaryAttributeKey] = {};
			if (!instanceSeenTags[primaryAttributeKey]) instanceSeenTags[primaryAttributeKey] = {};
			if (!approvedSeenTags[primaryAttributeKey][value]) {
				instanceSeenTags[primaryAttributeKey][value] = true;
				return true;
			}
			return false;
		}).reverse().forEach((tag) => approvedTags.push(tag));
		const keys = Object.keys(instanceSeenTags);
		for (let i = 0; i < keys.length; i += 1) {
			const attributeKey = keys[i];
			approvedSeenTags[attributeKey] = {
				...approvedSeenTags[attributeKey],
				...instanceSeenTags[attributeKey]
			};
		}
		return approvedTags;
	}, []).reverse();
};
var getAnyTrueFromPropsList = (propsList, checkedTag) => {
	if (Array.isArray(propsList) && propsList.length) {
		for (let index = 0; index < propsList.length; index += 1) if (propsList[index][checkedTag]) return true;
	}
	return false;
};
var reducePropsToState = (propsList) => ({
	baseTag: getBaseTagFromPropsList(["href"], propsList),
	bodyAttributes: getAttributesFromPropsList("bodyAttributes", propsList),
	defer: getInnermostProperty(propsList, HELMET_PROPS.DEFER),
	encode: getInnermostProperty(propsList, HELMET_PROPS.ENCODE_SPECIAL_CHARACTERS),
	htmlAttributes: getAttributesFromPropsList("htmlAttributes", propsList),
	linkTags: getTagsFromPropsList("link", ["rel", "href"], propsList),
	metaTags: getTagsFromPropsList("meta", [
		"name",
		"charset",
		"http-equiv",
		"property",
		"itemprop"
	], propsList),
	noscriptTags: getTagsFromPropsList("noscript", ["innerHTML"], propsList),
	onChangeClientState: getOnChangeClientState(propsList),
	scriptTags: getTagsFromPropsList("script", ["src", "innerHTML"], propsList),
	styleTags: getTagsFromPropsList("style", ["cssText"], propsList),
	title: getTitleFromPropsList(propsList),
	titleAttributes: getAttributesFromPropsList("titleAttributes", propsList),
	prioritizeSeoTags: getAnyTrueFromPropsList(propsList, HELMET_PROPS.PRIORITIZE_SEO_TAGS)
});
var flattenArray = (possibleArray) => Array.isArray(possibleArray) ? possibleArray.join("") : possibleArray;
var checkIfPropsMatch = (props, toMatch) => {
	const keys = Object.keys(props);
	for (let i = 0; i < keys.length; i += 1) if (toMatch[keys[i]] && toMatch[keys[i]].includes(props[keys[i]])) return true;
	return false;
};
var prioritizer = (elementsList, propsToMatch) => {
	if (Array.isArray(elementsList)) return elementsList.reduce((acc, elementAttrs) => {
		if (checkIfPropsMatch(elementAttrs, propsToMatch)) acc.priority.push(elementAttrs);
		else acc.default.push(elementAttrs);
		return acc;
	}, {
		priority: [],
		default: []
	});
	return {
		default: elementsList,
		priority: []
	};
};
var without = (obj, key) => {
	return {
		...obj,
		[key]: void 0
	};
};
var SELF_CLOSING_TAGS = [
	"noscript",
	"script",
	"style"
];
var encodeSpecialCharacters = (str, encode = true) => {
	if (encode === false) return String(str);
	return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
};
var generateElementAttributesAsString = (attributes) => Object.keys(attributes).reduce((str, key) => {
	const attr = typeof attributes[key] !== "undefined" ? `${key}="${attributes[key]}"` : `${key}`;
	return str ? `${str} ${attr}` : attr;
}, "");
var generateTitleAsString = (type, title, attributes, encode) => {
	const attributeString = generateElementAttributesAsString(attributes);
	const flattenedTitle = flattenArray(title);
	return attributeString ? `<${type} ${HELMET_ATTRIBUTE}="true" ${attributeString}>${encodeSpecialCharacters(flattenedTitle, encode)}</${type}>` : `<${type} ${HELMET_ATTRIBUTE}="true">${encodeSpecialCharacters(flattenedTitle, encode)}</${type}>`;
};
var generateTagsAsString = (type, tags, encode = true) => tags.reduce((str, t) => {
	const tag = t;
	const attributeHtml = Object.keys(tag).filter((attribute) => !(attribute === "innerHTML" || attribute === "cssText")).reduce((string, attribute) => {
		const attr = typeof tag[attribute] === "undefined" ? attribute : `${attribute}="${encodeSpecialCharacters(tag[attribute], encode)}"`;
		return string ? `${string} ${attr}` : attr;
	}, "");
	const tagContent = tag.innerHTML || tag.cssText || "";
	return `${str}<${type} ${HELMET_ATTRIBUTE}="true" ${attributeHtml}${SELF_CLOSING_TAGS.indexOf(type) === -1 ? `/>` : `>${tagContent}</${type}>`}`;
}, "");
var convertElementAttributesToReactProps = (attributes, initProps = {}) => Object.keys(attributes).reduce((obj, key) => {
	const mapped = REACT_TAG_MAP[key];
	obj[mapped || key] = attributes[key];
	return obj;
}, initProps);
var generateTitleAsReactComponent = (_type, title, attributes) => {
	const props = convertElementAttributesToReactProps(attributes, {
		key: title,
		[HELMET_ATTRIBUTE]: true
	});
	return [React.createElement("title", props, title)];
};
var generateTagsAsReactComponent = (type, tags) => tags.map((tag, i) => {
	const mappedTag = {
		key: i,
		[HELMET_ATTRIBUTE]: true
	};
	Object.keys(tag).forEach((attribute) => {
		const mappedAttribute = REACT_TAG_MAP[attribute] || attribute;
		if (mappedAttribute === "innerHTML" || mappedAttribute === "cssText") mappedTag.dangerouslySetInnerHTML = { __html: tag.innerHTML || tag.cssText };
		else mappedTag[mappedAttribute] = tag[attribute];
	});
	return React.createElement(type, mappedTag);
});
var getMethodsForTag = (type, tags, encode = true) => {
	switch (type) {
		case "title": return {
			toComponent: () => generateTitleAsReactComponent(type, tags.title, tags.titleAttributes),
			toString: () => generateTitleAsString(type, tags.title, tags.titleAttributes, encode)
		};
		case "bodyAttributes":
		case "htmlAttributes": return {
			toComponent: () => convertElementAttributesToReactProps(tags),
			toString: () => generateElementAttributesAsString(tags)
		};
		default: return {
			toComponent: () => generateTagsAsReactComponent(type, tags),
			toString: () => generateTagsAsString(type, tags, encode)
		};
	}
};
var getPriorityMethods = ({ metaTags, linkTags, scriptTags, encode }) => {
	const meta = prioritizer(metaTags, SEO_PRIORITY_TAGS.meta);
	const link = prioritizer(linkTags, SEO_PRIORITY_TAGS.link);
	const script = prioritizer(scriptTags, SEO_PRIORITY_TAGS.script);
	return {
		priorityMethods: {
			toComponent: () => [
				...generateTagsAsReactComponent("meta", meta.priority),
				...generateTagsAsReactComponent("link", link.priority),
				...generateTagsAsReactComponent("script", script.priority)
			],
			toString: () => `${getMethodsForTag("meta", meta.priority, encode)} ${getMethodsForTag("link", link.priority, encode)} ${getMethodsForTag("script", script.priority, encode)}`
		},
		metaTags: meta.default,
		linkTags: link.default,
		scriptTags: script.default
	};
};
var mapStateOnServer = (props) => {
	const { baseTag, bodyAttributes, encode = true, htmlAttributes, noscriptTags, styleTags, title = "", titleAttributes, prioritizeSeoTags } = props;
	let { linkTags, metaTags, scriptTags } = props;
	let priorityMethods = {
		toComponent: () => [],
		toString: () => ""
	};
	if (prioritizeSeoTags) ({priorityMethods, linkTags, metaTags, scriptTags} = getPriorityMethods(props));
	return {
		priority: priorityMethods,
		base: getMethodsForTag("base", baseTag, encode),
		bodyAttributes: getMethodsForTag("bodyAttributes", bodyAttributes, encode),
		htmlAttributes: getMethodsForTag("htmlAttributes", htmlAttributes, encode),
		link: getMethodsForTag("link", linkTags, encode),
		meta: getMethodsForTag("meta", metaTags, encode),
		noscript: getMethodsForTag("noscript", noscriptTags, encode),
		script: getMethodsForTag("script", scriptTags, encode),
		style: getMethodsForTag("style", styleTags, encode),
		title: getMethodsForTag("title", {
			title,
			titleAttributes
		}, encode)
	};
};
var server_default = mapStateOnServer;
var instances = [];
var isDocument = !!(typeof window !== "undefined" && window.document && window.document.createElement);
var HelmetData = class {
	instances = [];
	canUseDOM = isDocument;
	context;
	value = {
		setHelmet: (serverState) => {
			this.context.helmet = serverState;
		},
		helmetInstances: {
			get: () => this.canUseDOM ? instances : this.instances,
			add: (instance) => {
				(this.canUseDOM ? instances : this.instances).push(instance);
			},
			remove: (instance) => {
				const index = (this.canUseDOM ? instances : this.instances).indexOf(instance);
				(this.canUseDOM ? instances : this.instances).splice(index, 1);
			}
		}
	};
	constructor(context, canUseDOM) {
		this.context = context;
		this.canUseDOM = canUseDOM || false;
		if (!canUseDOM) context.helmet = server_default({
			baseTag: [],
			bodyAttributes: {},
			encodeSpecialCharacters: true,
			htmlAttributes: {},
			linkTags: [],
			metaTags: [],
			noscriptTags: [],
			scriptTags: [],
			styleTags: [],
			title: "",
			titleAttributes: {}
		});
	}
};
var isReact19 = parseInt(React.version.split(".")[0], 10) >= 19;
var Context = React.createContext({});
var HelmetProvider = class _HelmetProvider extends Component {
	static canUseDOM = isDocument;
	helmetData;
	constructor(props) {
		super(props);
		if (isReact19) this.helmetData = null;
		else this.helmetData = new HelmetData(this.props.context || {}, _HelmetProvider.canUseDOM);
	}
	render() {
		if (isReact19) return /* @__PURE__ */ React.createElement(React.Fragment, null, this.props.children);
		return /* @__PURE__ */ React.createElement(Context.Provider, { value: this.helmetData.value }, this.props.children);
	}
};
var updateTags = (type, tags) => {
	const headElement = document.head || document.querySelector("head");
	const tagNodes = headElement.querySelectorAll(`${type}[${HELMET_ATTRIBUTE}]`);
	const oldTags = [].slice.call(tagNodes);
	const newTags = [];
	let indexToDelete;
	if (tags && tags.length) tags.forEach((tag) => {
		const newElement = document.createElement(type);
		for (const attribute in tag) if (Object.prototype.hasOwnProperty.call(tag, attribute)) if (attribute === "innerHTML") newElement.innerHTML = tag.innerHTML;
		else if (attribute === "cssText") {
			const cssText = tag.cssText;
			newElement.appendChild(document.createTextNode(cssText));
		} else {
			const attr = attribute;
			const value = typeof tag[attr] === "undefined" ? "" : tag[attr];
			newElement.setAttribute(attribute, value);
		}
		newElement.setAttribute(HELMET_ATTRIBUTE, "true");
		if (oldTags.some((existingTag, index) => {
			indexToDelete = index;
			return newElement.isEqualNode(existingTag);
		})) oldTags.splice(indexToDelete, 1);
		else newTags.push(newElement);
	});
	oldTags.forEach((tag) => tag.parentNode?.removeChild(tag));
	newTags.forEach((tag) => headElement.appendChild(tag));
	return {
		oldTags,
		newTags
	};
};
var updateAttributes = (tagName, attributes) => {
	const elementTag = document.getElementsByTagName(tagName)[0];
	if (!elementTag) return;
	const helmetAttributeString = elementTag.getAttribute(HELMET_ATTRIBUTE);
	const helmetAttributes = helmetAttributeString ? helmetAttributeString.split(",") : [];
	const attributesToRemove = [...helmetAttributes];
	const attributeKeys = Object.keys(attributes);
	for (const attribute of attributeKeys) {
		const value = attributes[attribute] || "";
		if (elementTag.getAttribute(attribute) !== value) elementTag.setAttribute(attribute, value);
		if (helmetAttributes.indexOf(attribute) === -1) helmetAttributes.push(attribute);
		const indexToSave = attributesToRemove.indexOf(attribute);
		if (indexToSave !== -1) attributesToRemove.splice(indexToSave, 1);
	}
	for (let i = attributesToRemove.length - 1; i >= 0; i -= 1) elementTag.removeAttribute(attributesToRemove[i]);
	if (helmetAttributes.length === attributesToRemove.length) elementTag.removeAttribute(HELMET_ATTRIBUTE);
	else if (elementTag.getAttribute(HELMET_ATTRIBUTE) !== attributeKeys.join(",")) elementTag.setAttribute(HELMET_ATTRIBUTE, attributeKeys.join(","));
};
var updateTitle = (title, attributes) => {
	if (typeof title !== "undefined" && document.title !== title) document.title = flattenArray(title);
	updateAttributes("title", attributes);
};
var commitTagChanges = (newState, cb) => {
	const { baseTag, bodyAttributes, htmlAttributes, linkTags, metaTags, noscriptTags, onChangeClientState, scriptTags, styleTags, title, titleAttributes } = newState;
	updateAttributes("body", bodyAttributes);
	updateAttributes("html", htmlAttributes);
	updateTitle(title, titleAttributes);
	const tagUpdates = {
		baseTag: updateTags("base", baseTag),
		linkTags: updateTags("link", linkTags),
		metaTags: updateTags("meta", metaTags),
		noscriptTags: updateTags("noscript", noscriptTags),
		scriptTags: updateTags("script", scriptTags),
		styleTags: updateTags("style", styleTags)
	};
	const addedTags = {};
	const removedTags = {};
	Object.keys(tagUpdates).forEach((tagType) => {
		const { newTags, oldTags } = tagUpdates[tagType];
		if (newTags.length) addedTags[tagType] = newTags;
		if (oldTags.length) removedTags[tagType] = tagUpdates[tagType].oldTags;
	});
	if (cb) cb();
	onChangeClientState(newState, addedTags, removedTags);
};
var _helmetCallback = null;
var handleStateChangeOnClient = (newState) => {
	if (_helmetCallback) cancelAnimationFrame(_helmetCallback);
	if (newState.defer) _helmetCallback = requestAnimationFrame(() => {
		commitTagChanges(newState, () => {
			_helmetCallback = null;
		});
	});
	else {
		commitTagChanges(newState);
		_helmetCallback = null;
	}
};
var client_default = handleStateChangeOnClient;
var HelmetDispatcher = class extends Component {
	rendered = false;
	shouldComponentUpdate(nextProps) {
		return !shallowEqual(nextProps, this.props);
	}
	componentDidUpdate() {
		this.emitChange();
	}
	componentWillUnmount() {
		const { helmetInstances } = this.props.context;
		helmetInstances.remove(this);
		this.emitChange();
	}
	emitChange() {
		const { helmetInstances, setHelmet } = this.props.context;
		let serverState = null;
		const state = reducePropsToState(helmetInstances.get().map((instance) => {
			const { context: _context, ...props } = instance.props;
			return props;
		}));
		if (HelmetProvider.canUseDOM) client_default(state);
		else if (server_default) serverState = server_default(state);
		setHelmet(serverState);
	}
	init() {
		if (this.rendered) return;
		this.rendered = true;
		const { helmetInstances } = this.props.context;
		helmetInstances.add(this);
		this.emitChange();
	}
	render() {
		this.init();
		return null;
	}
};
var react19Instances = [];
var toHtmlAttributes = (props) => {
	const result = {};
	for (const key of Object.keys(props)) result[HTML_TAG_MAP[key] || key] = props[key];
	return result;
};
var toReactProps = (attrs) => {
	const result = {};
	for (const key of Object.keys(attrs)) {
		const mapped = REACT_TAG_MAP[key];
		result[mapped || key] = attrs[key];
	}
	return result;
};
var applyAttributes = (tagName, attributes) => {
	if (!isDocument) return;
	const el = document.getElementsByTagName(tagName)[0];
	if (!el) return;
	const managedAttr = "data-rh-managed";
	const prev = el.getAttribute(managedAttr);
	const prevKeys = prev ? prev.split(",") : [];
	const nextKeys = Object.keys(attributes);
	for (const key of prevKeys) if (!nextKeys.includes(key)) el.removeAttribute(key);
	for (const key of nextKeys) {
		const value = attributes[key];
		if (value === void 0 || value === null || value === false) el.removeAttribute(key);
		else if (value === true) el.setAttribute(key, "");
		else el.setAttribute(key, String(value));
	}
	if (nextKeys.length > 0) el.setAttribute(managedAttr, nextKeys.join(","));
	else el.removeAttribute(managedAttr);
};
var syncAllAttributes = () => {
	const htmlAttrs = {};
	const bodyAttrs = {};
	for (const instance of react19Instances) {
		const { htmlAttributes, bodyAttributes } = instance.props;
		if (htmlAttributes) Object.assign(htmlAttrs, toHtmlAttributes(htmlAttributes));
		if (bodyAttributes) Object.assign(bodyAttrs, toHtmlAttributes(bodyAttributes));
	}
	applyAttributes("html", htmlAttrs);
	applyAttributes("body", bodyAttrs);
};
var React19Dispatcher = class extends Component {
	componentDidMount() {
		react19Instances.push(this);
		syncAllAttributes();
	}
	componentDidUpdate() {
		syncAllAttributes();
	}
	componentWillUnmount() {
		const index = react19Instances.indexOf(this);
		if (index !== -1) react19Instances.splice(index, 1);
		syncAllAttributes();
	}
	resolveTitle() {
		const { title, titleTemplate, defaultTitle } = this.props;
		if (title && titleTemplate) return titleTemplate.replace(/%s/g, () => Array.isArray(title) ? title.join("") : title);
		return title || defaultTitle || void 0;
	}
	renderTitle() {
		const title = this.resolveTitle();
		if (title === void 0) return null;
		const titleAttributes = this.props.titleAttributes || {};
		return React.createElement("title", toReactProps(titleAttributes), title);
	}
	renderBase() {
		const { base } = this.props;
		if (!base) return null;
		return React.createElement("base", toReactProps(base));
	}
	renderMeta() {
		const { meta } = this.props;
		if (!meta || !Array.isArray(meta)) return null;
		return meta.map((attrs, i) => React.createElement("meta", {
			key: i,
			...toReactProps(attrs)
		}));
	}
	renderLink() {
		const { link } = this.props;
		if (!link || !Array.isArray(link)) return null;
		return link.map((attrs, i) => React.createElement("link", {
			key: i,
			...toReactProps(attrs)
		}));
	}
	renderScript() {
		const { script } = this.props;
		if (!script || !Array.isArray(script)) return null;
		return script.map((attrs, i) => {
			const { innerHTML, ...rest } = attrs;
			const props = toReactProps(rest);
			if (innerHTML) props.dangerouslySetInnerHTML = { __html: innerHTML };
			return React.createElement("script", {
				key: i,
				...props
			});
		});
	}
	renderStyle() {
		const { style } = this.props;
		if (!style || !Array.isArray(style)) return null;
		return style.map((attrs, i) => {
			const { cssText, ...rest } = attrs;
			const props = toReactProps(rest);
			if (cssText) props.dangerouslySetInnerHTML = { __html: cssText };
			return React.createElement("style", {
				key: i,
				...props
			});
		});
	}
	renderNoscript() {
		const { noscript } = this.props;
		if (!noscript || !Array.isArray(noscript)) return null;
		return noscript.map((attrs, i) => {
			const { innerHTML, ...rest } = attrs;
			const props = toReactProps(rest);
			if (innerHTML) props.dangerouslySetInnerHTML = { __html: innerHTML };
			return React.createElement("noscript", {
				key: i,
				...props
			});
		});
	}
	render() {
		return React.createElement(React.Fragment, null, this.renderTitle(), this.renderBase(), this.renderMeta(), this.renderLink(), this.renderScript(), this.renderStyle(), this.renderNoscript());
	}
};
var Helmet = class extends Component {
	static defaultProps = {
		defer: true,
		encodeSpecialCharacters: true,
		prioritizeSeoTags: false
	};
	shouldComponentUpdate(nextProps) {
		return !fastCompare(without(this.props, "helmetData"), without(nextProps, "helmetData"));
	}
	mapNestedChildrenToProps(child, nestedChildren) {
		if (!nestedChildren) return null;
		switch (child.type) {
			case "script":
			case "noscript": return { innerHTML: nestedChildren };
			case "style": return { cssText: nestedChildren };
			default: throw new Error(`<${child.type} /> elements are self-closing and can not contain children. Refer to our API for more information.`);
		}
	}
	flattenArrayTypeChildren(child, arrayTypeChildren, newChildProps, nestedChildren) {
		return {
			...arrayTypeChildren,
			[child.type]: [...arrayTypeChildren[child.type] || [], {
				...newChildProps,
				...this.mapNestedChildrenToProps(child, nestedChildren)
			}]
		};
	}
	mapObjectTypeChildren(child, newProps, newChildProps, nestedChildren) {
		switch (child.type) {
			case "title": return {
				...newProps,
				[child.type]: nestedChildren,
				titleAttributes: { ...newChildProps }
			};
			case "body": return {
				...newProps,
				bodyAttributes: { ...newChildProps }
			};
			case "html": return {
				...newProps,
				htmlAttributes: { ...newChildProps }
			};
			default: return {
				...newProps,
				[child.type]: { ...newChildProps }
			};
		}
	}
	mapArrayTypeChildrenToProps(arrayTypeChildren, newProps) {
		let newFlattenedProps = { ...newProps };
		Object.keys(arrayTypeChildren).forEach((arrayChildName) => {
			newFlattenedProps = {
				...newFlattenedProps,
				[arrayChildName]: arrayTypeChildren[arrayChildName]
			};
		});
		return newFlattenedProps;
	}
	warnOnInvalidChildren(child, nestedChildren) {
		invariant(VALID_TAG_NAMES.some((name) => child.type === name), typeof child.type === "function" ? `You may be attempting to nest <Helmet> components within each other, which is not allowed. Refer to our API for more information.` : `Only elements types ${VALID_TAG_NAMES.join(", ")} are allowed. Helmet does not support rendering <${child.type}> elements. Refer to our API for more information.`);
		invariant(!nestedChildren || typeof nestedChildren === "string" || Array.isArray(nestedChildren) && !nestedChildren.some((nestedChild) => typeof nestedChild !== "string"), `Helmet expects a string as a child of <${child.type}>. Did you forget to wrap your children in braces? ( <${child.type}>{\`\`}</${child.type}> ) Refer to our API for more information.`);
		return true;
	}
	mapChildrenToProps(children, newProps) {
		let arrayTypeChildren = {};
		React.Children.forEach(children, (child) => {
			if (!child || !child.props) return;
			const { children: nestedChildren, ...childProps } = child.props;
			const newChildProps = Object.keys(childProps).reduce((obj, key) => {
				obj[HTML_TAG_MAP[key] || key] = childProps[key];
				return obj;
			}, {});
			let { type } = child;
			if (typeof type === "symbol") type = type.toString();
			else this.warnOnInvalidChildren(child, nestedChildren);
			switch (type) {
				case "Symbol(react.fragment)":
					newProps = this.mapChildrenToProps(nestedChildren, newProps);
					break;
				case "link":
				case "meta":
				case "noscript":
				case "script":
				case "style":
					arrayTypeChildren = this.flattenArrayTypeChildren(child, arrayTypeChildren, newChildProps, nestedChildren);
					break;
				default:
					newProps = this.mapObjectTypeChildren(child, newProps, newChildProps, nestedChildren);
					break;
			}
		});
		return this.mapArrayTypeChildrenToProps(arrayTypeChildren, newProps);
	}
	render() {
		const { children, ...props } = this.props;
		let newProps = { ...props };
		let { helmetData } = props;
		if (children) newProps = this.mapChildrenToProps(children, newProps);
		if (helmetData && !(helmetData instanceof HelmetData)) {
			helmetData = new HelmetData(helmetData.context, true);
			delete newProps.helmetData;
		}
		if (isReact19) return /* @__PURE__ */ React.createElement(React19Dispatcher, { ...newProps });
		return helmetData ? /* @__PURE__ */ React.createElement(HelmetDispatcher, {
			...newProps,
			context: helmetData.value
		}) : /* @__PURE__ */ React.createElement(Context.Consumer, null, (context) => /* @__PURE__ */ React.createElement(HelmetDispatcher, {
			...newProps,
			context
		}));
	}
};
//#endregion
//#region src/components/SEOHead.tsx
/**
* @fileoverview SEO Head Component
* @objective Manage the document `<head>` dynamically to inject SEO meta tags, title, and OpenGraph/Twitter cards.
* @risk Failing to render this server-side negates its SEO benefits because crawlers don't always execute JS.
* @relations Uses `react-helmet-async`. Included in almost every Page component.
* @logic
* - Takes props for title, description, image, and url.
* - Formats the title suffix to include the site name.
* - Renders standard `<meta>` tags and specific `og:` and `twitter:` properties for rich social sharing previews.
*/
function SEOHead({ title, description = "A modern full-stack blog platform.", image = "/og-image.jpg", url, type = "website" }) {
	const siteName = "Execora";
	const fullTitle = `${title} | ${siteName}`;
	return /* @__PURE__ */ jsxs(Helmet, { children: [
		/* @__PURE__ */ jsx("title", { children: fullTitle }),
		/* @__PURE__ */ jsx("meta", {
			name: "description",
			content: description
		}),
		url && /* @__PURE__ */ jsx("link", {
			rel: "canonical",
			href: url
		}),
		/* @__PURE__ */ jsx("meta", {
			property: "og:site_name",
			content: siteName
		}),
		/* @__PURE__ */ jsx("meta", {
			property: "og:type",
			content: type
		}),
		url && /* @__PURE__ */ jsx("meta", {
			property: "og:url",
			content: url
		}),
		/* @__PURE__ */ jsx("meta", {
			property: "og:title",
			content: fullTitle
		}),
		/* @__PURE__ */ jsx("meta", {
			property: "og:description",
			content: description
		}),
		/* @__PURE__ */ jsx("meta", {
			property: "og:image",
			content: image
		}),
		/* @__PURE__ */ jsx("meta", {
			name: "twitter:card",
			content: "summary_large_image"
		}),
		url && /* @__PURE__ */ jsx("meta", {
			name: "twitter:url",
			content: url
		}),
		/* @__PURE__ */ jsx("meta", {
			name: "twitter:title",
			content: fullTitle
		}),
		/* @__PURE__ */ jsx("meta", {
			name: "twitter:description",
			content: description
		}),
		/* @__PURE__ */ jsx("meta", {
			name: "twitter:image",
			content: image
		})
	] });
}
//#endregion
//#region src/pages/AboutPage.tsx
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
//#region src/components/PostCard.tsx
/**
* @fileoverview PostCard Component
* @objective Render a summary of a blog post (thumbnail, title, excerpt, author) for listing pages.
* @risk Missing fallbacks for missing cover images or author avatars can lead to broken UI layouts.
* @relations Used in `HomePage.tsx`, `SearchPage.tsx`, and `AdminPostsPage.tsx`. Links to `PostDetailPage.tsx`.
* @logic
* - Receives a `post` object as a prop.
* - Displays a placeholder if `coverImageUrl` is null.
* - Formats the `createdAt` timestamp using `date-fns`.
* - Provides a fallback initial for the author's avatar if an image URL is missing.
*/
function PostCard({ post, layout = "vertical" }) {
	const authorName = post.author?.name || "Unknown Author";
	const wordCount = (post.content || post.excerpt || "").trim().split(/\s+/).length;
	const readingTime = Math.max(1, Math.ceil(wordCount / 200));
	if (layout === "horizontal") return /* @__PURE__ */ jsxs("div", {
		className: "bg-white rounded-lg overflow-hidden group flex flex-col md:flex-row gap-6 pb-8 border-b border-slate-100 last:border-0 mb-8",
		children: [/* @__PURE__ */ jsx(Link, {
			to: `/posts/${post.slug}`,
			className: "block relative aspect-video md:aspect-4/3 md:w-1/3 overflow-hidden bg-slate-100 shrink-0 rounded-lg",
			tabIndex: -1,
			"aria-hidden": "true",
			children: post.coverImageUrl ? /* @__PURE__ */ jsx("img", {
				src: post.coverImageUrl,
				alt: "",
				className: "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
			}) : /* @__PURE__ */ jsx("div", {
				className: "w-full h-full flex items-center justify-center text-slate-400",
				children: /* @__PURE__ */ jsx("svg", {
					className: "w-12 h-12 text-slate-300",
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
			})
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col flex-1",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "flex items-center gap-2 text-xs font-medium text-slate-500 mb-2",
					children: post.category?.name && /* @__PURE__ */ jsx("span", {
						className: "text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded uppercase tracking-wider font-semibold text-[10px]",
						children: post.category.name
					})
				}),
				/* @__PURE__ */ jsx(Link, {
					to: `/posts/${post.slug}`,
					className: "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 rounded",
					children: /* @__PURE__ */ jsx("h3", {
						className: "text-2xl font-bold font-serif mb-2 line-clamp-2 hover:text-slate-600 transition-colors",
						children: post.title
					})
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-slate-500 text-sm mb-4 line-clamp-3 leading-relaxed",
					children: post.excerpt || "No excerpt available for this post."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3 mt-auto text-sm text-slate-500",
					children: [
						post.author?.avatarUrl ? /* @__PURE__ */ jsx("img", {
							src: post.author.avatarUrl,
							alt: `${authorName}'s avatar`,
							className: "w-6 h-6 rounded-full object-cover shrink-0"
						}) : /* @__PURE__ */ jsx("div", {
							className: "w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0",
							children: authorName.charAt(0).toUpperCase()
						}),
						/* @__PURE__ */ jsx("span", {
							className: "font-medium text-slate-700",
							children: authorName
						}),
						/* @__PURE__ */ jsx("span", { children: "·" }),
						/* @__PURE__ */ jsx("span", { children: post.createdAt ? format(new Date(post.createdAt), "MMM dd, yyyy") : "" }),
						/* @__PURE__ */ jsx("span", { children: "·" }),
						/* @__PURE__ */ jsxs("span", { children: [readingTime, " min read"] })
					]
				})
			]
		})]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow group flex flex-col h-full",
		children: [/* @__PURE__ */ jsx(Link, {
			to: `/posts/${post.slug}`,
			className: "block relative aspect-video overflow-hidden bg-slate-100 shrink-0",
			tabIndex: -1,
			"aria-hidden": "true",
			children: post.coverImageUrl ? /* @__PURE__ */ jsx("img", {
				src: post.coverImageUrl,
				alt: "",
				className: "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
			}) : /* @__PURE__ */ jsx("div", {
				className: "w-full h-full flex items-center justify-center text-slate-400",
				children: /* @__PURE__ */ jsx("svg", {
					className: "w-8 h-8 text-slate-300",
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
			})
		}), /* @__PURE__ */ jsxs("div", {
			className: "p-5 flex flex-col flex-1",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2 text-xs font-medium text-slate-500 mb-3",
					children: [
						post.category?.name && /* @__PURE__ */ jsx("span", {
							className: "text-slate-600 bg-slate-100 px-2 py-1 rounded-full",
							children: post.category.name
						}),
						post.category?.name && /* @__PURE__ */ jsx("span", { children: "·" }),
						/* @__PURE__ */ jsx("span", { children: post.createdAt ? format(new Date(post.createdAt), "MMM dd, yyyy") : "" }),
						/* @__PURE__ */ jsx("span", { children: "·" }),
						/* @__PURE__ */ jsxs("span", { children: [readingTime, " min read"] })
					]
				}),
				/* @__PURE__ */ jsx(Link, {
					to: `/posts/${post.slug}`,
					className: "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 rounded",
					children: /* @__PURE__ */ jsx("h3", {
						className: "text-xl font-bold font-serif mb-2 line-clamp-2 hover:text-slate-600 transition-colors",
						children: post.title
					})
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-slate-600 text-sm mb-4 line-clamp-3",
					children: post.excerpt || "No excerpt available for this post."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2 mt-auto pt-4 border-t border-slate-50",
					children: [post.author?.avatarUrl ? /* @__PURE__ */ jsx("img", {
						src: post.author.avatarUrl,
						alt: `${authorName}'s avatar`,
						className: "w-8 h-8 rounded-full object-cover shrink-0"
					}) : /* @__PURE__ */ jsx("div", {
						className: "w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0",
						children: authorName.charAt(0).toUpperCase()
					}), /* @__PURE__ */ jsx("span", {
						className: "text-sm font-medium text-slate-700 truncate",
						children: authorName
					})]
				})
			]
		})]
	});
}
//#endregion
//#region src/pages/AuthorProfilePage.tsx
function AuthorProfilePage() {
	const { authorName } = useParams();
	const [posts, setPosts] = useState([]);
	const [categories, setCategories] = useState([]);
	const [authorProfile, setAuthorProfile] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [sort, setSort] = useState("newest");
	const formattedName = authorName?.replace(/-/g, " ") || "Author";
	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);
				const [postsRes, catRes, authorsRes] = await Promise.all([
					api.get(`/content/posts?authorName=${authorName}&status=PUBLISHED&sort=${sort}`),
					api.get("/content/categories"),
					api.get("/content/authors")
				]);
				setPosts(postsRes.data.data);
				setCategories(catRes.data);
				setAuthorProfile(authorsRes.data.find((a) => a.name.toLowerCase() === formattedName.toLowerCase()));
			} catch (error) {
				console.error("Failed to fetch author data", error);
			} finally {
				setIsLoading(false);
			}
		};
		if (authorName) fetchData();
	}, [
		authorName,
		formattedName,
		sort
	]);
	const authorData = authorProfile || {
		name: formattedName,
		bio: "",
		avatarUrl: void 0
	};
	const authorInitials = authorData.name?.charAt(0).toUpperCase() || "A";
	const displayBio = authorData.bio || "This author has not provided a biography yet.";
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-50 flex flex-col",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: `${authorData.name} - Profile` }),
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
						to: "/authors",
						className: "hover:text-slate-900 transition-colors",
						children: "Authors"
					}),
					/* @__PURE__ */ jsx("span", { children: "›" }),
					/* @__PURE__ */ jsx("span", {
						className: "text-slate-900",
						children: authorData.name
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "bg-slate-100/50 pt-16 pb-12 px-6",
				children: /* @__PURE__ */ jsxs("div", {
					className: "max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-10",
					children: [
						authorData.avatarUrl ? /* @__PURE__ */ jsx("img", {
							src: authorData.avatarUrl,
							alt: authorData.name,
							className: "w-40 h-40 rounded-full object-cover shrink-0 border-4 border-white shadow-sm"
						}) : /* @__PURE__ */ jsx("div", {
							className: "w-40 h-40 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 text-5xl font-bold shrink-0 border-4 border-white shadow-sm",
							children: authorInitials
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex-1 text-center md:text-left",
							children: [
								/* @__PURE__ */ jsx("h1", {
									className: "text-4xl font-bold font-serif text-slate-900 mb-2",
									children: authorData.name
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-sm font-medium text-slate-700 mb-4 tracking-wide uppercase",
									children: "Writer · Developer · Lifelong Learner"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-slate-600 max-w-xl mb-6 leading-relaxed text-sm md:text-base",
									children: displayBio
								})
							]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "flex flex-col items-center md:items-end mt-6 md:mt-0",
							children: /* @__PURE__ */ jsx("div", {
								className: "flex gap-8 text-center",
								children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
									className: "text-2xl font-bold text-slate-900",
									children: authorProfile?._count?.posts || posts.length
								}), /* @__PURE__ */ jsx("p", {
									className: "text-xs font-medium text-slate-500 uppercase tracking-wider",
									children: "Posts"
								})] })
							})
						})
					]
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "max-w-4xl mx-auto px-6 py-12 w-full",
				children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between mb-8 border-b border-slate-200 pb-4",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "text-lg font-bold font-serif text-slate-900",
						children: "Posts"
					}), /* @__PURE__ */ jsxs("select", {
						value: sort,
						onChange: (e) => setSort(e.target.value),
						className: "text-sm border border-slate-200 rounded px-3 py-1.5 outline-none focus:border-slate-900 bg-white",
						children: [
							/* @__PURE__ */ jsx("option", {
								value: "newest",
								children: "Date: Newest"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "oldest",
								children: "Date: Oldest"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "title_asc",
								children: "Title: A-Z (Ascending)"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "title_desc",
								children: "Title: Z-A (Descending)"
							})
						]
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "space-y-8",
					children: isLoading ? [
						1,
						2,
						3
					].map((n) => /* @__PURE__ */ jsx("div", { className: "animate-pulse bg-slate-50 h-48 rounded-lg border border-slate-100" }, n)) : posts.length > 0 ? posts.map((post) => /* @__PURE__ */ jsx(PostCard, {
						post,
						layout: "horizontal"
					}, post.id)) : /* @__PURE__ */ jsx("div", {
						className: "p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500",
						children: "This author has not published any posts yet."
					})
				})] })
			})
		]
	});
}
//#endregion
//#region src/pages/AuthorsIndexPage.tsx
function AuthorsIndexPage() {
	const [authors, setAuthors] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	useEffect(() => {
		const fetchAuthors = async () => {
			try {
				setAuthors((await api.get("/content/authors")).data);
			} catch (error) {
				console.error("Failed to fetch authors:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchAuthors();
	}, []);
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-7xl mx-auto px-6 py-12 min-h-screen",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: "Our Authors" }),
			/* @__PURE__ */ jsxs("div", {
				className: "mb-16 pb-8 border-b border-slate-200 text-center max-w-3xl mx-auto",
				children: [/* @__PURE__ */ jsx("h1", {
					className: "text-4xl font-bold font-serif text-slate-900 mb-4",
					children: "Our Authors"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-slate-500 text-lg",
					children: "Meet the brilliant minds sharing their knowledge on our platform."
				})]
			}),
			isLoading ? /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
				children: [...Array(6)].map((_, i) => /* @__PURE__ */ jsx("div", { className: "bg-slate-50 rounded-xl h-64 animate-pulse border border-slate-100" }, i))
			}) : authors.length > 0 ? /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
				children: authors.map((author) => /* @__PURE__ */ jsxs(Link, {
					to: `/authors/${encodeURIComponent(author.name.replace(/ /g, "-").toLowerCase())}`,
					className: "group bg-white border border-slate-200 rounded-xl p-8 hover:border-slate-400 hover:shadow-lg transition-all text-center flex flex-col items-center",
					children: [
						author.avatarUrl ? /* @__PURE__ */ jsx("img", {
							src: author.avatarUrl,
							alt: author.name,
							className: "w-24 h-24 rounded-full object-cover mb-4 ring-4 ring-slate-50 group-hover:ring-slate-100 transition-all"
						}) : /* @__PURE__ */ jsx("div", {
							className: "w-24 h-24 bg-slate-900 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-4 ring-4 ring-slate-50 group-hover:ring-slate-100 transition-all",
							children: author.name.charAt(0).toUpperCase()
						}),
						/* @__PURE__ */ jsx("h2", {
							className: "text-xl font-bold text-slate-900 mb-2",
							children: author.name
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-slate-500 text-sm mb-6 line-clamp-2",
							children: author.bio || "This author has not provided a bio yet."
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-auto inline-flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 px-4 py-1.5 rounded-full group-hover:bg-slate-900 group-hover:text-white transition-colors",
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
										d: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"
									})
								}),
								author._count.posts,
								" ",
								author._count.posts === 1 ? "Article" : "Articles"
							]
						})
					]
				}, author.id))
			}) : /* @__PURE__ */ jsx("div", {
				className: "text-center text-slate-500 py-12",
				children: /* @__PURE__ */ jsx("p", { children: "No authors found." })
			})
		]
	});
}
//#endregion
//#region src/pages/CategoriesIndexPage.tsx
function CategoriesIndexPage() {
	const [categories, setCategories] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [search, setSearch] = useState("");
	useEffect(() => {
		const fetchCategories = async () => {
			try {
				setCategories((await api.get("/content/categories")).data);
			} catch (error) {
				console.error("Failed to fetch categories:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchCategories();
	}, []);
	const sortedCategories = [...categories].sort((a, b) => (b._count?.posts || 0) - (a._count?.posts || 0));
	const displayedCategories = search.trim() ? sortedCategories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())) : sortedCategories;
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-7xl mx-auto px-6 py-12 min-h-screen",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: "Explore Categories" }),
			/* @__PURE__ */ jsxs("div", {
				className: "mb-12 pb-8 border-b border-slate-200 text-center max-w-3xl mx-auto",
				children: [/* @__PURE__ */ jsx("h1", {
					className: "text-4xl font-bold font-serif text-slate-900 mb-4",
					children: "Explore Categories"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-slate-500 text-lg",
					children: "Browse articles by category and discover topics that interest you."
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "max-w-2xl mx-auto mb-12 relative",
				children: [/* @__PURE__ */ jsx("input", {
					type: "text",
					placeholder: "Search categories...",
					value: search,
					onChange: (e) => setSearch(e.target.value),
					className: "w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-lg outline-none focus:border-slate-900 transition-colors shadow-sm"
				}), /* @__PURE__ */ jsx("svg", {
					className: "w-6 h-6 absolute left-4 top-4 text-slate-400",
					fill: "none",
					stroke: "currentColor",
					viewBox: "0 0 24 24",
					children: /* @__PURE__ */ jsx("path", {
						strokeLinecap: "round",
						strokeLinejoin: "round",
						strokeWidth: "2",
						d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					})
				})]
			}),
			isLoading ? /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
				children: [...Array(6)].map((_, i) => /* @__PURE__ */ jsx("div", { className: "h-32 bg-slate-100 animate-pulse rounded-xl" }, i))
			}) : displayedCategories.length > 0 ? /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
				children: displayedCategories.map((category) => /* @__PURE__ */ jsxs(Link, {
					to: `/categories/${category.slug}`,
					className: "p-6 bg-white border border-slate-200 rounded-xl hover:border-slate-900 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
						className: "text-xl font-bold font-serif text-slate-900 mb-2 group-hover:text-slate-700 transition-colors",
						children: category.name
					}), category.description && /* @__PURE__ */ jsx("p", {
						className: "text-slate-500 text-sm line-clamp-2",
						children: category.description
					})] }), /* @__PURE__ */ jsxs("div", {
						className: "mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "text-slate-500",
							children: [category._count?.posts || 0, " Articles"]
						}), /* @__PURE__ */ jsx("span", {
							className: "text-slate-900 font-medium group-hover:underline",
							children: "Explore →"
						})]
					})]
				}, category.id))
			}) : /* @__PURE__ */ jsx("div", {
				className: "text-center text-slate-500 py-12",
				children: /* @__PURE__ */ jsxs("p", { children: [
					"No categories found matching \"",
					search,
					"\""
				] })
			})
		]
	});
}
//#endregion
//#region src/pages/CategoryPage.tsx
function CategoryPage() {
	const { category } = useParams();
	const [posts, setPosts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const formattedCategoryName = category?.replace(/-/g, " ").toUpperCase() || "CATEGORY";
	useEffect(() => {
		const controller = new AbortController();
		const fetchPosts = async () => {
			setIsLoading(true);
			try {
				setPosts((await api.get(`/content/posts?category=${category}&status=PUBLISHED`, { signal: controller.signal })).data.data);
			} catch (error) {
				if (error.name === "CanceledError" || error.name === "AbortError") return;
				console.error("Failed to fetch category posts:", error);
			} finally {
				setIsLoading(false);
			}
		};
		if (category) fetchPosts();
		return () => {
			controller.abort();
		};
	}, [category]);
	const navigate = useNavigate();
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-7xl mx-auto px-6 py-12 min-h-screen",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: `${formattedCategoryName} Posts` }),
			/* @__PURE__ */ jsxs("div", {
				className: "mb-12 pb-8 border-b border-slate-200",
				children: [/* @__PURE__ */ jsx("button", {
					onClick: () => navigate(-1),
					className: "text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4 flex items-center gap-1",
					children: "← Go Back"
				}), /* @__PURE__ */ jsxs("h1", {
					className: "text-4xl font-bold font-serif text-slate-900",
					children: ["Category: ", /* @__PURE__ */ jsx("span", {
						className: "text-slate-500",
						children: formattedCategoryName
					})]
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 lg:grid-cols-12 gap-12",
				children: /* @__PURE__ */ jsx("div", {
					className: "lg:col-span-8",
					children: isLoading ? /* @__PURE__ */ jsx("div", {
						className: "space-y-8",
						children: [
							1,
							2,
							3
						].map((n) => /* @__PURE__ */ jsx("div", { className: "animate-pulse bg-slate-50 h-48 rounded-lg border border-slate-100" }, n))
					}) : posts.length > 0 ? /* @__PURE__ */ jsx("div", {
						className: "space-y-8",
						children: posts.map((post) => /* @__PURE__ */ jsx(PostCard, {
							post,
							layout: "horizontal"
						}, post.id))
					}) : /* @__PURE__ */ jsxs("div", {
						className: "p-12 text-center bg-slate-50 rounded-xl border border-slate-100 text-slate-500",
						children: [/* @__PURE__ */ jsx("svg", {
							className: "w-12 h-12 mx-auto text-slate-300 mb-4",
							fill: "none",
							stroke: "currentColor",
							viewBox: "0 0 24 24",
							children: /* @__PURE__ */ jsx("path", {
								strokeLinecap: "round",
								strokeLinejoin: "round",
								strokeWidth: "2",
								d: "M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							})
						}), /* @__PURE__ */ jsx("p", { children: "No published articles found in this category yet." })]
					})
				})
			})
		]
	});
}
//#endregion
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
		tagsString: ""
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
			await api.post("/content/posts", payload);
			navigate("/dashboard/posts");
		} catch (error) {
			console.error(error);
			alert("Failed to create post. Make sure you are an author.");
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
									children: [/* @__PURE__ */ jsx("option", {
										value: "DRAFT",
										children: "Save as Draft"
									}), /* @__PURE__ */ jsx("option", {
										value: "PUBLISHED",
										children: "Publish Now"
									})]
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
				title: formData.status === "PUBLISHED" ? "Publish Post" : "Save Draft",
				message: `Are you sure you want to ${formData.status === "PUBLISHED" ? "publish" : "save"} "${formData.title || "this post"}"?`,
				confirmText: formData.status === "PUBLISHED" ? "Yes, Publish" : "Yes, Save",
				onConfirm: executeSubmit,
				onCancel: () => setShowConfirm(false),
				isLoading: isSubmitting
			})
		]
	});
}
//#endregion
//#region src/pages/DashboardPage.tsx
/**
* @fileoverview Dashboard Page Component
* @objective Serve as the central hub for authenticated users to manage their profile, posts, and settings.
* @risk Exposing admin links to non-admins. Mitigated by conditional rendering based on `user.role`.
* @relations Route: `/dashboard`. Protected by `<ProtectedRoute>`.
* @logic
* - Reads `user` object from `authStore`.
* - Displays personalized welcome message.
* - Conditionally renders the "Admin Settings" card only if `user.role === 'ADMIN'`.
*/
function DashboardPage() {
	const { user } = useAuthStore();
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-7xl mx-auto px-6 py-12",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: "Dashboard" }),
			/* @__PURE__ */ jsx("h1", {
				className: "text-3xl font-bold mb-8",
				children: "Dashboard"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "bg-white p-6 rounded-xl border border-slate-200 shadow-sm",
				children: [
					/* @__PURE__ */ jsxs("h2", {
						className: "text-xl font-bold mb-4",
						children: [
							"Welcome back, ",
							user?.name || "User",
							"!"
						]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-slate-600 mb-6",
						children: "Manage your posts, profile, and settings from here."
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 md:grid-cols-3 gap-6",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "p-6 bg-slate-50 rounded-lg border border-slate-100 flex flex-col",
								children: [
									/* @__PURE__ */ jsx("h3", {
										className: "font-bold text-lg mb-2",
										children: "My Posts"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-slate-500 mb-4 flex-1",
										children: "View, edit, and manage your published articles and drafts."
									}),
									/* @__PURE__ */ jsx("div", {
										className: "mt-auto flex gap-4",
										children: /* @__PURE__ */ jsx(Link, {
											to: "/dashboard/posts",
											className: "text-primary-600 font-medium hover:underline inline-block w-fit",
											children: "Manage Posts →"
										})
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "p-6 bg-slate-50 rounded-lg border border-slate-100 flex flex-col",
								children: [
									/* @__PURE__ */ jsx("h3", {
										className: "font-bold text-lg mb-2",
										children: "Profile Settings"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-slate-500 mb-4 flex-1",
										children: "Update your personal information and password."
									}),
									/* @__PURE__ */ jsx(Link, {
										to: "/profile",
										className: "text-primary-600 font-medium hover:underline mt-auto inline-block w-fit",
										children: "Edit Profile →"
									})
								]
							}),
							user?.role === "ADMIN" && /* @__PURE__ */ jsxs("div", {
								className: "p-6 bg-slate-50 rounded-lg border border-slate-100 flex flex-col",
								children: [
									/* @__PURE__ */ jsx("h3", {
										className: "font-bold text-lg mb-2",
										children: "Admin Settings"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-slate-500 mb-4 flex-1",
										children: "Manage users, roles, categories, and tags."
									}),
									/* @__PURE__ */ jsx(Link, {
										to: "/admin",
										className: "text-primary-600 font-medium hover:underline mt-auto inline-block w-fit",
										children: "Go to Admin →"
									})
								]
							})
						]
					})
				]
			})
		]
	});
}
//#endregion
//#region src/pages/EditPostPage.tsx
/**
* @fileoverview Create Post Page Component (Stub)
* @objective Provide an interface for Authors/Editors to write and publish new blog posts.
* @risk N/A - Currently a placeholder. Future implementations must handle secure image uploads and HTML sanitation.
* @relations Route: `/dashboard/posts/new`. Protected by `<ProtectedRoute requireRole={['ADMIN', 'AUTHOR']}>`.
* @logic
* - Currently renders a static placeholder indicating pending editor integration (e.g. TipTap or Quill).
*/
function EditPostPage() {
	const { id } = useParams();
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
		tagsString: ""
	});
	useEffect(() => {
		api.get("/content/categories").then((res) => setCategories(res.data)).catch(console.error);
		if (id) api.get(`/content/posts?status=ALL`).then((res) => {
			const post = res.data.data.find((p) => p.id === id);
			if (post) setFormData({
				title: post.title,
				content: post.content,
				excerpt: post.excerpt || "",
				status: post.status,
				metaTitle: post.metaTitle || "",
				metaDescription: post.metaDescription || "",
				coverImageUrl: post.coverImageUrl || "",
				categoryId: post.categoryId || "",
				tagsString: post.tags?.map((t) => t.name).join(", ") || ""
			});
		}).catch(console.error);
	}, [id]);
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
			await api.put(`/content/posts/${id}`, payload);
			navigate("/dashboard/posts");
		} catch (error) {
			console.error(error);
			alert("Failed to update post.");
		} finally {
			setIsSubmitting(false);
			setShowConfirm(false);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-7xl mx-auto px-6 py-12",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: "Edit Post" }),
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
					children: "Edit Post"
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
									children: [/* @__PURE__ */ jsx("option", {
										value: "DRAFT",
										children: "Save as Draft"
									}), /* @__PURE__ */ jsx("option", {
										value: "PUBLISHED",
										children: "Publish Now"
									})]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex gap-3 pt-4 border-t border-slate-100",
								children: [/* @__PURE__ */ jsx("button", {
									type: "submit",
									disabled: isSubmitting,
									className: "flex-1 bg-slate-900 text-white px-4 py-3 rounded-md font-bold hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm text-sm",
									children: isSubmitting ? "Saving..." : "Update Post"
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
				title: "Update Post",
				message: `Are you sure you want to save changes to "${formData.title || "this post"}"?`,
				confirmText: "Yes, Update",
				onConfirm: executeSubmit,
				onCancel: () => setShowConfirm(false),
				isLoading: isSubmitting
			})
		]
	});
}
//#endregion
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
//#region src/pages/HomePage.tsx
/**
* @fileoverview Home Page Component
* @objective Serve as the landing page, displaying the latest published articles and popular tags.
* @risk High layout shift if loading states are not handled properly. Handled here via skeleton loaders (`animate-pulse`).
* @relations Route: `/`. Uses `api.get` to fetch from `/content/posts` and `/content/tags`.
* @logic
* - `useEffect` triggers concurrent API calls for posts and tags on mount.
* - Manages `isLoading` state to render skeleton placeholders before data arrives.
* - Displays posts using the `PostCard` component.
*/
function HomePage() {
	const [posts, setPosts] = useState([]);
	const [popularPosts, setPopularPosts] = useState([]);
	const [tags, setTags] = useState([]);
	const [categories, setCategories] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isPostsLoading, setIsPostsLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [sort, setSort] = useState("newest");
	const [meta, setMeta] = useState({
		totalPages: 1,
		hasNextPage: false,
		hasPrevPage: false
	});
	useEffect(() => {
		const controller = new AbortController();
		const fetchSidebarData = async () => {
			try {
				const [popularRes, tagsRes, categoriesRes] = await Promise.all([
					api.get("/content/posts?limit=4&status=PUBLISHED&sort=popular", { signal: controller.signal }),
					api.get("/content/tags", { signal: controller.signal }),
					api.get("/content/categories", { signal: controller.signal })
				]);
				setPopularPosts(popularRes.data.data);
				setTags(tagsRes.data);
				setCategories(categoriesRes.data);
			} catch (error) {
				if (error.name === "CanceledError" || error.name === "AbortError") return;
				console.error("Failed to fetch sidebar data:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchSidebarData();
		return () => controller.abort();
	}, []);
	useEffect(() => {
		const controller = new AbortController();
		setIsPostsLoading(true);
		const fetchPosts = async () => {
			try {
				const res = await api.get(`/content/posts?limit=6&status=PUBLISHED&page=${page}&sort=${sort}`, { signal: controller.signal });
				setPosts(res.data.data);
				setMeta(res.data.meta);
			} catch (error) {
				if (error.name === "CanceledError" || error.name === "AbortError") return;
				console.error("Failed to fetch posts:", error);
			} finally {
				setIsPostsLoading(false);
			}
		};
		fetchPosts();
		return () => controller.abort();
	}, [page, sort]);
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-7xl mx-auto px-6 py-12",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: "Home" }),
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col md:flex-row items-center gap-12 mb-16 pb-16 border-b border-slate-200",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex-1 space-y-6",
					children: [
						/* @__PURE__ */ jsx("h1", {
							className: "text-4xl md:text-6xl font-bold font-serif text-slate-900 leading-tight tracking-tight",
							children: "Welcome to BlogApp"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-xl text-slate-600 leading-relaxed max-w-xl",
							children: "Read articles on technology, design, development and more from our amazing authors."
						}),
						/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("button", {
							onClick: () => {
								setSort("newest");
								setPage(1);
								document.getElementById("latest-posts")?.scrollIntoView({ behavior: "smooth" });
							},
							className: "bg-slate-900 text-white px-6 py-3 rounded text-sm font-medium hover:bg-slate-800 transition-colors",
							children: "Explore Latest Posts"
						}) })
					]
				}), /* @__PURE__ */ jsx("div", {
					className: "flex-1 w-full relative aspect-4/3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center overflow-hidden shadow-sm",
					children: /* @__PURE__ */ jsx("img", {
						src: "/hero-image.png",
						alt: "Hero illustration",
						className: "w-full h-full object-cover",
						fetchPriority: "high"
					})
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 lg:grid-cols-12 gap-12",
				children: [/* @__PURE__ */ jsxs("div", {
					id: "latest-posts",
					className: "lg:col-span-8 pr-0 lg:pr-8 border-r-0 lg:border-r border-slate-200",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between mb-8 border-b border-slate-200 pb-2",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "text-xl font-bold font-serif text-slate-900",
							children: "Posts"
						}), /* @__PURE__ */ jsxs("select", {
							"aria-label": "Sort posts",
							value: sort,
							onChange: (e) => {
								setSort(e.target.value);
								setPage(1);
							},
							className: "text-sm border border-slate-200 rounded px-3 py-1.5 outline-none focus:border-slate-900 bg-white",
							children: [
								/* @__PURE__ */ jsx("option", {
									value: "newest",
									children: "Date: Newest"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "oldest",
									children: "Date: Oldest"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "title_asc",
									children: "Title: A-Z (Ascending)"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "title_desc",
									children: "Title: Z-A (Descending)"
								})
							]
						})]
					}), isPostsLoading ? /* @__PURE__ */ jsx("div", {
						className: "space-y-8",
						children: [
							1,
							2,
							3
						].map((n) => /* @__PURE__ */ jsx("div", { className: "animate-pulse bg-slate-50 h-48 rounded-lg border border-slate-100" }, n))
					}) : posts.length > 0 ? /* @__PURE__ */ jsxs("div", { children: [posts.map((post) => /* @__PURE__ */ jsx(PostCard, {
						post,
						layout: "horizontal"
					}, post.id)), meta.totalPages > 1 && /* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-center gap-2 mt-12 mb-8",
						children: [
							/* @__PURE__ */ jsx("button", {
								onClick: () => setPage((p) => Math.max(1, p - 1)),
								disabled: !meta.hasPrevPage,
								className: "w-8 h-8 flex items-center justify-center border border-slate-200 rounded text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
								children: "<"
							}),
							Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => /* @__PURE__ */ jsx("button", {
								onClick: () => setPage(p),
								className: `w-8 h-8 flex items-center justify-center rounded transition-colors ${page === p ? "bg-slate-900 text-white font-medium" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`,
								children: p
							}, p)),
							/* @__PURE__ */ jsx("button", {
								onClick: () => setPage((p) => Math.min(meta.totalPages, p + 1)),
								disabled: !meta.hasNextPage,
								className: "w-8 h-8 flex items-center justify-center border border-slate-200 rounded text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
								children: ">"
							})
						]
					})] }) : /* @__PURE__ */ jsx("div", {
						className: "p-8 text-center bg-slate-50 rounded-xl border border-slate-100 text-slate-500",
						children: "No articles published yet."
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "lg:col-span-4 space-y-10 pl-0 lg:pl-4",
					children: /* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx("h3", {
							className: "font-bold text-slate-900 mb-4 font-serif border-b border-slate-200 pb-2",
							children: "Popular Posts"
						}),
						/* @__PURE__ */ jsx("div", {
							className: "space-y-6 mb-6",
							children: popularPosts.map((post, index) => /* @__PURE__ */ jsxs(Link, {
								to: `/posts/${post.slug}`,
								className: "flex gap-4 group cursor-pointer items-start",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "text-3xl font-bold font-serif text-slate-200 group-hover:text-slate-300 transition-colors mt-1",
									"aria-hidden": "true",
									children: ["0", index + 1]
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex flex-col flex-1",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2 mb-1.5",
											children: [post.author?.avatarUrl ? /* @__PURE__ */ jsx("img", {
												src: post.author.avatarUrl,
												alt: "",
												className: "w-5 h-5 rounded-full object-cover shrink-0"
											}) : /* @__PURE__ */ jsx("div", {
												className: "w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-[10px] shrink-0",
												children: post.author?.name?.charAt(0).toUpperCase() || "U"
											}), /* @__PURE__ */ jsx("span", {
												className: "text-xs font-medium text-slate-600",
												children: post.author?.name || "Unknown Author"
											})]
										}),
										/* @__PURE__ */ jsx("h4", {
											className: "font-bold font-serif text-sm leading-snug line-clamp-2 group-hover:text-slate-900 transition-colors",
											children: post.title
										}),
										/* @__PURE__ */ jsxs("span", {
											className: "text-xs text-slate-500 mt-1",
											children: [new Date(post.createdAt).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric"
											}), " · 5 min read"]
										})
									]
								})]
							}, post.id))
						}),
						/* @__PURE__ */ jsx(Link, {
							to: "/popular",
							className: "text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors",
							children: "View all popular posts →"
						})
					] })
				})]
			})
		]
	});
}
//#endregion
//#region ../node_modules/@react-oauth/google/dist/index.esm.js
function useLoadGsiScript(options = {}) {
	const { nonce, locale, onScriptLoadSuccess, onScriptLoadError } = options;
	const [scriptLoadedSuccessfully, setScriptLoadedSuccessfully] = useState(false);
	const onScriptLoadSuccessRef = useRef(onScriptLoadSuccess);
	onScriptLoadSuccessRef.current = onScriptLoadSuccess;
	const onScriptLoadErrorRef = useRef(onScriptLoadError);
	onScriptLoadErrorRef.current = onScriptLoadError;
	useEffect(() => {
		const scriptTag = document.createElement("script");
		scriptTag.src = "https://accounts.google.com/gsi/client";
		if (locale) scriptTag.src += `?hl=${locale}`;
		scriptTag.async = true;
		scriptTag.defer = true;
		scriptTag.nonce = nonce;
		scriptTag.onload = () => {
			var _a;
			setScriptLoadedSuccessfully(true);
			(_a = onScriptLoadSuccessRef.current) === null || _a === void 0 || _a.call(onScriptLoadSuccessRef);
		};
		scriptTag.onerror = () => {
			var _a;
			setScriptLoadedSuccessfully(false);
			(_a = onScriptLoadErrorRef.current) === null || _a === void 0 || _a.call(onScriptLoadErrorRef);
		};
		document.body.appendChild(scriptTag);
		return () => {
			document.body.removeChild(scriptTag);
		};
	}, [nonce]);
	return scriptLoadedSuccessfully;
}
var GoogleOAuthContext = createContext(null);
function GoogleOAuthProvider({ clientId, nonce, locale, onScriptLoadSuccess, onScriptLoadError, children }) {
	const scriptLoadedSuccessfully = useLoadGsiScript({
		nonce,
		onScriptLoadSuccess,
		onScriptLoadError,
		locale
	});
	const contextValue = useMemo(() => ({
		locale,
		clientId,
		scriptLoadedSuccessfully
	}), [clientId, scriptLoadedSuccessfully]);
	return React.createElement(GoogleOAuthContext.Provider, { value: contextValue }, children);
}
function useGoogleOAuth() {
	const context = useContext(GoogleOAuthContext);
	if (!context) throw new Error("Google OAuth components must be used within GoogleOAuthProvider");
	return context;
}
function useGoogleLogin({ flow = "implicit", scope = "", onSuccess, onError, onNonOAuthError, overrideScope, state, ...props }) {
	const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth();
	const clientRef = useRef();
	const onSuccessRef = useRef(onSuccess);
	onSuccessRef.current = onSuccess;
	const onErrorRef = useRef(onError);
	onErrorRef.current = onError;
	const onNonOAuthErrorRef = useRef(onNonOAuthError);
	onNonOAuthErrorRef.current = onNonOAuthError;
	useEffect(() => {
		var _a, _b;
		if (!scriptLoadedSuccessfully) return;
		const clientMethod = flow === "implicit" ? "initTokenClient" : "initCodeClient";
		clientRef.current = (_b = (_a = window === null || window === void 0 ? void 0 : window.google) === null || _a === void 0 ? void 0 : _a.accounts) === null || _b === void 0 ? void 0 : _b.oauth2[clientMethod]({
			client_id: clientId,
			scope: overrideScope ? scope : `openid profile email ${scope}`,
			callback: (response) => {
				var _a, _b;
				if (response.error) return (_a = onErrorRef.current) === null || _a === void 0 ? void 0 : _a.call(onErrorRef, response);
				(_b = onSuccessRef.current) === null || _b === void 0 || _b.call(onSuccessRef, response);
			},
			error_callback: (nonOAuthError) => {
				var _a;
				(_a = onNonOAuthErrorRef.current) === null || _a === void 0 || _a.call(onNonOAuthErrorRef, nonOAuthError);
			},
			state,
			...props
		});
	}, [
		clientId,
		scriptLoadedSuccessfully,
		flow,
		scope,
		state
	]);
	const loginImplicitFlow = useCallback((overrideConfig) => {
		var _a;
		return (_a = clientRef.current) === null || _a === void 0 ? void 0 : _a.requestAccessToken(overrideConfig);
	}, []);
	const loginAuthCodeFlow = useCallback(() => {
		var _a;
		return (_a = clientRef.current) === null || _a === void 0 ? void 0 : _a.requestCode();
	}, []);
	return flow === "implicit" ? loginImplicitFlow : loginAuthCodeFlow;
}
//#endregion
//#region src/pages/LoginPage.tsx
/**
* @fileoverview Login Page Component
* @objective Provide a user interface for authenticating existing users via email/password.
* @risk Displaying detailed validation errors (like "User not found") can facilitate username enumeration. The server returns generic errors, displayed here.
* @relations Route: `/login`. Interacts with `authStore.ts` to set global user state.
* @logic
* - Manages form state (`email`, `password`) and submission loading states.
* - On submit, calls `api.post('/auth/login')`.
* - On success, updates Zustand store (`setUser`) and redirects to `/dashboard`.
* - On failure, catches the Axios error and displays the server's error message.
*/
function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const setUser = useAuthStore((state) => state.setUser);
	const googleLogin = useGoogleLogin({
		onSuccess: async (tokenResponse) => {
			setError("");
			setIsLoading(true);
			try {
				setUser((await api.post("/auth/google", { token: tokenResponse.access_token })).data.user);
				navigate("/dashboard");
			} catch (err) {
				if (isAxiosError(err)) setError(err.response?.data?.error || "Google login failed");
				else setError("An unexpected error occurred during Google login");
			} finally {
				setIsLoading(false);
			}
		},
		onError: () => {
			setError("Google login failed or was cancelled");
		}
	});
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);
		try {
			setUser((await api.post("/auth/login", {
				email,
				password,
				rememberMe
			})).data.user);
			navigate("/dashboard");
		} catch (err) {
			if (isAxiosError(err)) setError(err.response?.data?.error || "Login failed");
			else setError("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-50 flex flex-col",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: "Login" }),
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
					/* @__PURE__ */ jsx("span", {
						className: "text-slate-900",
						children: "Login"
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
									fill: "currentColor",
									viewBox: "0 0 24 24",
									children: /* @__PURE__ */ jsx("path", { d: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" })
								})
							})
						}),
						/* @__PURE__ */ jsx("h1", {
							className: "text-3xl font-bold font-serif text-center text-slate-900 mb-2",
							children: "Welcome Back"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-center text-slate-500 text-sm mb-8",
							children: "Login to your account to continue"
						}),
						error && /* @__PURE__ */ jsx("div", {
							"aria-live": "polite",
							className: "bg-red-50 border border-red-100 text-red-600 p-3 rounded mb-6 text-sm text-center",
							children: error
						}),
						/* @__PURE__ */ jsxs("form", {
							onSubmit: handleSubmit,
							className: "space-y-5",
							children: [
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									htmlFor: "email",
									className: "block text-sm font-bold text-slate-900 mb-1.5",
									children: "Email address"
								}), /* @__PURE__ */ jsxs("div", {
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
										className: "w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-slate-400 focus:border-slate-400 outline-none transition-colors",
										placeholder: "Enter your email"
									})]
								})] }),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									htmlFor: "password",
									className: "block text-sm font-bold text-slate-900 mb-1.5",
									children: "Password"
								}), /* @__PURE__ */ jsxs("div", {
									className: "relative",
									children: [
										/* @__PURE__ */ jsx("div", {
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
													d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
												})
											})
										}),
										/* @__PURE__ */ jsx("input", {
											id: "password",
											type: showPassword ? "text" : "password",
											required: true,
											value: password,
											onChange: (e) => setPassword(e.target.value),
											className: "w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-slate-400 focus:border-slate-400 outline-none transition-colors",
											placeholder: "Enter your password"
										}),
										/* @__PURE__ */ jsx("div", {
											className: "absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-slate-600 transition-colors",
											onClick: () => setShowPassword(!showPassword),
											children: showPassword ? /* @__PURE__ */ jsx("svg", {
												className: "h-5 w-5",
												fill: "none",
												stroke: "currentColor",
												viewBox: "0 0 24 24",
												children: /* @__PURE__ */ jsx("path", {
													strokeLinecap: "round",
													strokeLinejoin: "round",
													strokeWidth: "2",
													d: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
												})
											}) : /* @__PURE__ */ jsxs("svg", {
												className: "h-5 w-5",
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
											})
										})
									]
								})] }),
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ jsxs("label", {
										className: "flex items-center gap-2 cursor-pointer",
										children: [/* @__PURE__ */ jsx("input", {
											type: "checkbox",
											checked: rememberMe,
											onChange: (e) => setRememberMe(e.target.checked),
											className: "rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4 cursor-pointer"
										}), /* @__PURE__ */ jsx("span", {
											className: "text-sm text-slate-600",
											children: "Remember me"
										})]
									}), /* @__PURE__ */ jsx(Link, {
										to: "/forgot-password",
										className: "text-sm font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2",
										children: "Forgot password?"
									})]
								}),
								/* @__PURE__ */ jsx("button", {
									type: "submit",
									disabled: isLoading,
									className: "w-full bg-slate-900 text-white font-medium py-3 rounded hover:bg-slate-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed",
									children: isLoading ? "Logging in..." : "Login"
								})
							]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "my-6 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-slate-200 after:mt-0.5 after:flex-1 after:border-t after:border-slate-200",
							children: /* @__PURE__ */ jsx("p", {
								className: "mx-4 mb-0 text-center text-sm text-slate-400",
								children: "or"
							})
						}),
						/* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => googleLogin(),
							disabled: isLoading,
							className: "w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-medium py-2.5 rounded hover:bg-slate-50 transition-colors mb-6 disabled:opacity-70 disabled:cursor-not-allowed",
							children: [/* @__PURE__ */ jsxs("svg", {
								className: "w-5 h-5",
								viewBox: "0 0 24 24",
								children: [
									/* @__PURE__ */ jsx("path", {
										d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z",
										fill: "#4285F4"
									}),
									/* @__PURE__ */ jsx("path", {
										d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z",
										fill: "#34A853"
									}),
									/* @__PURE__ */ jsx("path", {
										d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z",
										fill: "#FBBC05"
									}),
									/* @__PURE__ */ jsx("path", {
										d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z",
										fill: "#EA4335"
									})
								]
							}), "Continue with Google"]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "text-center text-sm text-slate-600",
							children: [
								"Don't have an account?",
								" ",
								/* @__PURE__ */ jsx(Link, {
									to: "/register",
									className: "text-slate-900 font-bold hover:underline underline-offset-2",
									children: "Register"
								})
							]
						})
					]
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "bg-white border-t border-slate-200",
				children: /* @__PURE__ */ jsxs("div", {
					className: "max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-slate-200",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col md:flex-row items-center md:items-start gap-4 pt-8 md:pt-0 px-4",
							children: [/* @__PURE__ */ jsx("div", {
								className: "w-12 h-12 border border-slate-200 rounded flex items-center justify-center text-slate-500 shrink-0",
								children: /* @__PURE__ */ jsx("svg", {
									className: "w-6 h-6",
									fill: "none",
									stroke: "currentColor",
									viewBox: "0 0 24 24",
									children: /* @__PURE__ */ jsx("path", {
										strokeLinecap: "round",
										strokeLinejoin: "round",
										strokeWidth: "2",
										d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
									})
								})
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h4", {
								className: "font-bold text-slate-900 mb-1",
								children: "Secure & Private"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-sm text-slate-500 leading-relaxed",
								children: "Your data is protected with industry-standard security."
							})] })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col md:flex-row items-center md:items-start gap-4 pt-8 md:pt-0 px-4",
							children: [/* @__PURE__ */ jsx("div", {
								className: "w-12 h-12 border border-slate-200 rounded flex items-center justify-center text-slate-500 shrink-0",
								children: /* @__PURE__ */ jsx("svg", {
									className: "w-6 h-6",
									fill: "none",
									stroke: "currentColor",
									viewBox: "0 0 24 24",
									children: /* @__PURE__ */ jsx("path", {
										strokeLinecap: "round",
										strokeLinejoin: "round",
										strokeWidth: "2",
										d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
									})
								})
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h4", {
								className: "font-bold text-slate-900 mb-1",
								children: "Write & Share"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-sm text-slate-500 leading-relaxed",
								children: "Create amazing content and share your ideas with the world."
							})] })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col md:flex-row items-center md:items-start gap-4 pt-8 md:pt-0 px-4",
							children: [/* @__PURE__ */ jsx("div", {
								className: "w-12 h-12 border border-slate-200 rounded flex items-center justify-center text-slate-500 shrink-0",
								children: /* @__PURE__ */ jsx("svg", {
									className: "w-6 h-6",
									fill: "none",
									stroke: "currentColor",
									viewBox: "0 0 24 24",
									children: /* @__PURE__ */ jsx("path", {
										strokeLinecap: "round",
										strokeLinejoin: "round",
										strokeWidth: "2",
										d: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
									})
								})
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h4", {
								className: "font-bold text-slate-900 mb-1",
								children: "Join Community"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-sm text-slate-500 leading-relaxed",
								children: "Connect with authors and readers who share your interests."
							})] })]
						})
					]
				})
			})
		]
	});
}
//#endregion
//#region src/pages/ManagePostsPage.tsx
function ManagePostsPage() {
	const { user } = useAuthStore();
	const [posts, setPosts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [postToDelete, setPostToDelete] = useState(null);
	const [isDeleting, setIsDeleting] = useState(false);
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
							/* @__PURE__ */ jsx("td", {
								className: "py-4 px-6",
								children: /* @__PURE__ */ jsx("span", {
									className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${post.status === "PUBLISHED" ? "bg-green-100 text-green-800" : post.status === "DRAFT" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-800"}`,
									children: post.status
								})
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
								children: [/* @__PURE__ */ jsx(Link, {
									to: `/dashboard/posts/edit/${post.id}`,
									className: "text-indigo-600 hover:text-indigo-900 font-medium text-sm inline-block",
									children: "Edit"
								}), /* @__PURE__ */ jsx("button", {
									onClick: () => setPostToDelete(post.id),
									className: "text-red-600 hover:text-red-900 font-medium text-sm",
									children: "Delete"
								})]
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
			})
		]
	});
}
//#endregion
//#region src/pages/PopularPostsPage.tsx
/**
* @fileoverview Popular Posts Page Component
* @objective Display the most popular posts across the blog.
* @relations Route: `/popular`.
*/
function PopularPostsPage() {
	const [results, setResults] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	useEffect(() => {
		const fetchResults = async () => {
			setIsLoading(true);
			setError(null);
			try {
				setResults((await api.get(`/content/posts?sort=popular&status=PUBLISHED`)).data.data);
			} catch (err) {
				console.error("Failed to fetch popular posts:", err);
				setError("Failed to fetch popular posts.");
			} finally {
				setIsLoading(false);
			}
		};
		fetchResults();
	}, []);
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-7xl mx-auto px-6 py-12",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: "Popular Posts" }),
			/* @__PURE__ */ jsx("h1", {
				className: "text-4xl font-bold font-serif mb-2 text-slate-900",
				children: "Popular Posts"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-slate-500 text-lg mb-12",
				children: "Trending articles and most-read stories from our community."
			}),
			isLoading ? /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
				children: [
					1,
					2,
					3,
					4,
					5,
					6
				].map((n) => /* @__PURE__ */ jsx("div", { className: "animate-pulse bg-slate-100 h-80 rounded-xl" }, n))
			}) : error ? /* @__PURE__ */ jsx("div", {
				className: "text-center py-12 text-red-500",
				children: error
			}) : results.length > 0 ? /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
				children: results.map((post) => /* @__PURE__ */ jsx(PostCard, { post }, post.id))
			}) : /* @__PURE__ */ jsx("div", {
				className: "bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center",
				children: /* @__PURE__ */ jsx("p", {
					className: "text-slate-500",
					children: "No popular posts available yet."
				})
			})
		]
	});
}
//#endregion
//#region src/components/comments/CommentForm.tsx
function CommentForm({ onSubmit, initialValue = "", placeholder = "Write a comment...", submitLabel = "Post" }) {
	const [content, setContent] = useState(initialValue);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const { isAuthenticated } = useAuthStore();
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!content.trim() || isSubmitting) return;
		setError(null);
		try {
			setIsSubmitting(true);
			await onSubmit(content);
			setContent("");
		} catch (err) {
			setError(err.message || "Failed to post comment. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};
	if (!isAuthenticated) return /* @__PURE__ */ jsxs("div", {
		className: "bg-slate-50 p-4 rounded-lg border border-slate-200 text-center text-sm text-slate-600",
		children: [
			"Please",
			" ",
			/* @__PURE__ */ jsx(Link, {
				to: "/login",
				className: "text-primary-600 font-medium hover:underline",
				children: "login"
			}),
			" ",
			"to leave a comment."
		]
	});
	return /* @__PURE__ */ jsxs("form", {
		onSubmit: handleSubmit,
		className: "mt-4",
		children: [
			error && /* @__PURE__ */ jsx("div", {
				className: "mb-3 text-sm text-red-600 bg-red-50 p-2 rounded",
				children: error
			}),
			/* @__PURE__ */ jsx("textarea", {
				value: content,
				onChange: (e) => setContent(e.target.value),
				className: "w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none",
				rows: 3,
				placeholder,
				"aria-label": placeholder,
				required: true
			}),
			/* @__PURE__ */ jsx("div", {
				className: "flex justify-end mt-2",
				children: /* @__PURE__ */ jsx("button", {
					type: "submit",
					disabled: isSubmitting || !content.trim(),
					className: "btn-primary py-1.5 px-4 text-sm",
					children: isSubmitting ? "Posting..." : submitLabel
				})
			})
		]
	});
}
//#endregion
//#region src/components/comments/CommentItem.tsx
function CommentItem({ comment, onReply }) {
	const [isReplying, setIsReplying] = useState(false);
	const handleReplySubmit = async (content) => {
		await onReply(comment.id, content);
		setIsReplying(false);
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "flex gap-3 mb-6",
		children: [/* @__PURE__ */ jsx("div", {
			className: "w-8 h-8 rounded-full bg-slate-200 shrink-0 overflow-hidden",
			children: comment.author?.avatarUrl ? /* @__PURE__ */ jsx("img", {
				src: comment.author.avatarUrl,
				alt: comment.author?.name || "User avatar",
				className: "w-full h-full object-cover"
			}) : /* @__PURE__ */ jsx("div", {
				className: "w-full h-full flex items-center justify-center text-slate-500 font-bold text-xs",
				children: comment.author?.name?.charAt(0)?.toUpperCase() || "?"
			})
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex-1",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "bg-slate-50 p-3 rounded-lg rounded-tl-none border border-slate-100",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between mb-1",
						children: [/* @__PURE__ */ jsx("span", {
							className: "font-bold text-sm text-slate-800",
							children: comment.author?.name || "Unknown User"
						}), /* @__PURE__ */ jsx("span", {
							className: "text-xs text-slate-500",
							children: comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : ""
						})]
					}), /* @__PURE__ */ jsx("p", {
						className: "text-slate-700 text-sm whitespace-pre-wrap",
						children: comment.content
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-1 ml-2",
					children: /* @__PURE__ */ jsx("button", {
						onClick: () => setIsReplying(!isReplying),
						className: "text-xs font-medium text-slate-500 hover:text-primary-600 transition-colors",
						"aria-expanded": isReplying,
						"aria-controls": `reply-form-${comment.id}`,
						children: isReplying ? "Cancel Reply" : "Reply"
					})
				}),
				isReplying && /* @__PURE__ */ jsx("div", {
					id: `reply-form-${comment.id}`,
					className: "mt-2 ml-4",
					children: /* @__PURE__ */ jsx(CommentForm, {
						onSubmit: handleReplySubmit,
						placeholder: "Write a reply...",
						submitLabel: "Reply"
					})
				}),
				comment.children && comment.children.length > 0 && /* @__PURE__ */ jsx("div", {
					className: "mt-4 ml-6 space-y-4 border-l-2 border-slate-100 pl-4",
					children: comment.children.map((child) => /* @__PURE__ */ jsx(CommentItem, {
						comment: child,
						onReply
					}, child.id))
				})
			]
		})]
	});
}
//#endregion
//#region src/components/comments/CommentList.tsx
function CommentList({ postId }) {
	const [comments, setComments] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const fetchComments = useCallback(async () => {
		try {
			setError(null);
			setComments((await api.get(`/content/posts/${postId}/comments`)).data);
		} catch (err) {
			console.error("Failed to load comments", err);
			setError("Failed to load comments. Please try again later.");
		} finally {
			setIsLoading(false);
		}
	}, [postId]);
	useEffect(() => {
		setIsLoading(true);
		fetchComments();
	}, [fetchComments]);
	const handleCreateComment = async (content) => {
		try {
			await api.post(`/content/posts/${postId}/comments`, { content });
			await fetchComments();
		} catch (error) {
			console.error("Failed to create comment", error);
			throw error;
		}
	};
	const handleReply = async (parentId, content) => {
		try {
			await api.post(`/content/posts/${postId}/comments`, {
				content,
				parentId
			});
			await fetchComments();
		} catch (error) {
			console.error("Failed to reply", error);
			throw error;
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "mt-12 pt-8 border-t border-slate-200",
		children: [
			/* @__PURE__ */ jsx("h3", {
				className: "text-2xl font-bold mb-6 text-slate-900",
				children: "Comments"
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mb-10",
				children: /* @__PURE__ */ jsx(CommentForm, { onSubmit: handleCreateComment })
			}),
			error ? /* @__PURE__ */ jsx("div", {
				className: "text-center text-red-600 py-4 bg-red-50 rounded-lg",
				children: error
			}) : isLoading ? /* @__PURE__ */ jsx("div", {
				className: "text-center text-slate-500 py-4",
				children: "Loading comments..."
			}) : comments.length > 0 ? /* @__PURE__ */ jsx("div", {
				className: "space-y-6",
				children: comments.map((comment) => /* @__PURE__ */ jsx(CommentItem, {
					comment,
					onReply: handleReply
				}, comment.id))
			}) : /* @__PURE__ */ jsx("div", {
				className: "text-center text-slate-500 py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200",
				children: "No comments yet. Be the first to share your thoughts!"
			})
		]
	});
}
//#endregion
//#region src/pages/PostDetailPage.tsx
/**
* @fileoverview Post Detail Page Component
* @objective Display a full blog post, its metadata, related posts, tags, and comments.
* @risk Rendering unescaped HTML from the post content can lead to XSS attacks (currently using a simple split/map, but warns to use react-markdown).
* @relations Route: `/posts/:slug`. Fetches data via `api.get('/content/posts/:slug')`. Renders `<CommentList />`.
* @logic
* - Reads `slug` from URL params.
* - Fetches post details, tags, and related posts concurrently.
* - If the user is authenticated, it checks if they have liked the post.
* - `handleLike`: Toggles the like status optimistically and updates the server.
* - Dynamically updates `<SEOHead>` with the post's specific metadata and image.
*/
function PostDetailPage() {
	const { slug } = useParams();
	const [post, setPost] = useState(null);
	const [related, setRelated] = useState([]);
	const [tags, setTags] = useState([]);
	const [categories, setCategories] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [hasLiked, setHasLiked] = useState(false);
	const { isAuthenticated } = useAuthStore();
	useEffect(() => {
		const controller = new AbortController();
		const fetchPost = async () => {
			if (!slug) return;
			try {
				setIsLoading(true);
				const { data } = await api.get(`/content/posts/${slug}`, { signal: controller.signal });
				setPost(data);
				const [relRes, tagsRes, catRes] = await Promise.all([
					api.get("/content/posts?limit=4&sort=popular", { signal: controller.signal }),
					api.get("/content/tags", { signal: controller.signal }),
					api.get("/content/categories", { signal: controller.signal })
				]);
				setRelated(relRes.data.data.filter((p) => p.id !== data.id).slice(0, 3));
				setTags(tagsRes.data);
				setCategories(catRes.data);
				if (isAuthenticated) setHasLiked((await api.get(`/content/posts/${data.id}/likes/status`, { signal: controller.signal })).data.liked);
			} catch (error) {
				if (error.name === "CanceledError" || error.name === "AbortError") return;
				console.error("Error fetching post:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchPost();
		return () => {
			controller.abort();
		};
	}, [slug, isAuthenticated]);
	const handleLike = async () => {
		if (!isAuthenticated) return alert("Please login to like");
		if (!post) return;
		try {
			const res = await api.post(`/content/posts/${post.id}/likes`);
			setHasLiked(res.data.liked);
			setPost((prev) => prev ? {
				...prev,
				_count: {
					...prev._count,
					likes: Math.max(0, prev._count.likes + (res.data.liked ? 1 : -1))
				}
			} : null);
		} catch (e) {
			console.error("Error liking post:", e);
		}
	};
	if (isLoading) return /* @__PURE__ */ jsx("div", {
		className: "max-w-7xl mx-auto px-6 py-12 text-center",
		children: "Loading..."
	});
	if (!post) return /* @__PURE__ */ jsx("div", {
		className: "max-w-7xl mx-auto px-6 py-12 text-center text-red-500",
		children: "Post not found"
	});
	const authorName = post.author?.name || "Unknown Author";
	const wordCount = (post.content || post.excerpt || "").trim().split(/\s+/).length;
	const readingTime = Math.max(1, Math.ceil(wordCount / 200));
	const authorProfileLink = `/authors/${authorName.replace(/\s+/g, "-")}`;
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-7xl mx-auto px-6 py-8",
		children: [
			/* @__PURE__ */ jsx(SEOHead, {
				title: post.metaTitle || post.title,
				description: post.metaDescription || post.excerpt,
				image: post.coverImageUrl,
				type: "article"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2 text-sm text-slate-500 mb-8 pb-4 border-b border-slate-200",
				children: [
					/* @__PURE__ */ jsx(Link, {
						to: "/",
						className: "hover:text-slate-900 transition-colors",
						children: "Home"
					}),
					/* @__PURE__ */ jsx("span", { children: "›" }),
					/* @__PURE__ */ jsx(Link, {
						to: "/categories",
						className: "hover:text-slate-900 transition-colors",
						children: "Categories"
					}),
					/* @__PURE__ */ jsx("span", { children: "›" }),
					/* @__PURE__ */ jsx("span", {
						className: "hover:text-slate-900 transition-colors cursor-pointer",
						children: post.category?.name || "General"
					}),
					/* @__PURE__ */ jsx("span", { children: "›" }),
					/* @__PURE__ */ jsx("span", {
						className: "text-slate-900 font-medium truncate max-w-[200px] md:max-w-xs",
						children: post.title
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-16",
				children: [/* @__PURE__ */ jsxs("article", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "mb-8",
							children: [/* @__PURE__ */ jsx("span", {
								className: "inline-block bg-slate-100 text-slate-600 uppercase tracking-widest text-[10px] font-bold px-3 py-1 rounded mb-4",
								children: post.category?.name?.toUpperCase() || "GENERAL"
							}), /* @__PURE__ */ jsx("h1", {
								className: "text-4xl md:text-5xl font-extrabold font-serif text-slate-900 leading-tight",
								children: post.title
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-sm text-slate-500 border-b border-slate-200 pb-6",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center flex-wrap gap-3",
								children: [
									post.author?.avatarUrl ? /* @__PURE__ */ jsx("img", {
										src: post.author.avatarUrl,
										alt: authorName,
										className: "w-8 h-8 rounded-full object-cover shrink-0"
									}) : /* @__PURE__ */ jsx("div", {
										className: "w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0",
										children: authorName.charAt(0).toUpperCase()
									}),
									/* @__PURE__ */ jsx("span", {
										className: "text-slate-900 font-medium",
										children: authorName
									}),
									/* @__PURE__ */ jsx("span", {
										className: "hidden sm:inline",
										children: "·"
									}),
									/* @__PURE__ */ jsx("span", { children: post.createdAt ? format(new Date(post.createdAt), "MMM dd, yyyy") : "" }),
									/* @__PURE__ */ jsx("span", {
										className: "hidden sm:inline",
										children: "·"
									}),
									/* @__PURE__ */ jsxs("span", { children: [readingTime, " min read"] }),
									/* @__PURE__ */ jsx("span", {
										className: "hidden sm:inline",
										children: "·"
									}),
									/* @__PURE__ */ jsxs("span", {
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
											post.viewCount || 0,
											" views"
										]
									})
								]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ jsxs("button", {
									onClick: handleLike,
									className: `flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors ${hasLiked ? "bg-red-50 border-red-200 text-red-500" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`,
									children: [/* @__PURE__ */ jsx("svg", {
										className: "w-4 h-4",
										fill: hasLiked ? "currentColor" : "none",
										stroke: "currentColor",
										viewBox: "0 0 24 24",
										children: /* @__PURE__ */ jsx("path", {
											strokeLinecap: "round",
											strokeLinejoin: "round",
											strokeWidth: hasLiked ? 0 : 2,
											d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
										})
									}), post._count?.likes || 0]
								}), /* @__PURE__ */ jsxs("button", {
									className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors",
									children: [/* @__PURE__ */ jsx("svg", {
										className: "w-4 h-4",
										fill: "none",
										stroke: "currentColor",
										viewBox: "0 0 24 24",
										children: /* @__PURE__ */ jsx("path", {
											strokeLinecap: "round",
											strokeLinejoin: "round",
											strokeWidth: "2",
											d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
										})
									}), post._count?.comments || 0]
								})]
							})]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "w-full aspect-21/9 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden mb-12",
							children: post.coverImageUrl ? /* @__PURE__ */ jsx("img", {
								src: post.coverImageUrl,
								alt: post.title,
								className: "w-full h-full object-cover"
							}) : /* @__PURE__ */ jsx("svg", {
								className: "w-16 h-16 text-slate-200",
								fill: "none",
								stroke: "currentColor",
								viewBox: "0 0 24 24",
								children: /* @__PURE__ */ jsx("path", {
									strokeLinecap: "round",
									strokeLinejoin: "round",
									strokeWidth: "1",
									d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
								})
							})
						}),
						/* @__PURE__ */ jsx("div", {
							className: "prose prose-lg prose-slate prose-headings:font-serif max-w-none prose-a:text-slate-900 mb-12 border-b border-slate-200 pb-12",
							children: post.content ? post.content.split("\n\n").map((paragraph, i) => {
								if (paragraph.startsWith("# ")) return /* @__PURE__ */ jsx("h1", {
									className: "text-3xl mt-8 mb-4 font-bold",
									children: paragraph.replace("# ", "")
								}, i);
								if (paragraph.startsWith("## ")) return /* @__PURE__ */ jsx("h2", {
									className: "text-2xl mt-8 mb-4 font-bold",
									children: paragraph.replace("## ", "")
								}, i);
								if (paragraph.startsWith("### ")) return /* @__PURE__ */ jsx("h3", {
									className: "text-xl mt-6 mb-3 font-bold",
									children: paragraph.replace("### ", "")
								}, i);
								if (paragraph.startsWith("> ")) return /* @__PURE__ */ jsx("blockquote", {
									className: "border-l-4 border-slate-300 pl-4 italic text-slate-600 my-6 bg-slate-50 py-3 pr-4 rounded-r",
									children: paragraph.replace("> ", "")
								}, i);
								return /* @__PURE__ */ jsx("p", {
									className: "mb-6 text-slate-700 leading-relaxed",
									children: paragraph
								}, i);
							}) : /* @__PURE__ */ jsx("p", {
								className: "text-slate-500 italic",
								children: "No content available."
							})
						}),
						post.tags && post.tags.length > 0 && /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3 mb-10",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-sm font-medium text-slate-700",
								children: "Tags:"
							}), /* @__PURE__ */ jsx("div", {
								className: "flex flex-wrap gap-2",
								children: post.tags.map((tag) => /* @__PURE__ */ jsxs(Link, {
									to: `/tags/${tag.slug}`,
									className: "px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded transition-colors",
									children: ["#", tag.name]
								}, tag.id))
							})]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "bg-slate-50 border border-slate-100 rounded-lg p-6 mb-16",
							children: /* @__PURE__ */ jsxs("div", {
								className: "flex flex-col sm:flex-row gap-6",
								children: [post.author?.avatarUrl ? /* @__PURE__ */ jsx("img", {
									src: post.author.avatarUrl,
									alt: authorName,
									className: "w-20 h-20 rounded-full object-cover shrink-0"
								}) : /* @__PURE__ */ jsx("div", {
									className: "w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-2xl font-bold shrink-0",
									children: authorName.charAt(0).toUpperCase()
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex-1",
									children: [
										/* @__PURE__ */ jsx("h3", {
											className: "font-bold text-slate-900 mb-2",
											children: authorName
										}),
										/* @__PURE__ */ jsx("p", {
											className: "text-sm text-slate-600 mb-4 leading-relaxed",
											children: post.author?.bio || "This author has not provided a biography yet."
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ jsx("div", {}), /* @__PURE__ */ jsx(Link, {
												to: authorProfileLink,
												className: "px-4 py-1.5 border border-slate-200 bg-white rounded text-sm font-medium hover:bg-slate-50 transition-colors",
												children: "View all posts"
											})]
										})
									]
								})]
							})
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between border-b border-slate-200 pb-2 mb-6",
							children: [/* @__PURE__ */ jsxs("h3", {
								className: "font-bold text-slate-900 font-serif text-lg",
								children: [post._count?.comments || 0, " Comments"]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2 text-sm text-slate-600",
								children: ["Sort by: ", /* @__PURE__ */ jsxs("span", {
									className: "font-medium cursor-pointer flex items-center gap-1",
									children: ["Newest ", /* @__PURE__ */ jsx("svg", {
										className: "w-4 h-4",
										fill: "none",
										stroke: "currentColor",
										viewBox: "0 0 24 24",
										children: /* @__PURE__ */ jsx("path", {
											strokeLinecap: "round",
											strokeLinejoin: "round",
											strokeWidth: "2",
											d: "M19 9l-7 7-7-7"
										})
									})]
								})]
							})]
						}),
						/* @__PURE__ */ jsx(CommentList, { postId: post.id })
					]
				}), /* @__PURE__ */ jsxs("aside", {
					className: "space-y-10 pl-0 lg:pl-4",
					children: [
						/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx("h3", {
								className: "font-bold text-slate-900 mb-4 font-serif border-b border-slate-200 pb-2",
								children: "Categories"
							}),
							/* @__PURE__ */ jsx("ul", {
								className: "space-y-3 text-sm text-slate-600 mb-4",
								children: categories.map((cat) => /* @__PURE__ */ jsxs("li", {
									className: "flex justify-between items-center group",
									children: [/* @__PURE__ */ jsxs(Link, {
										to: `/categories/${cat.slug}`,
										className: "flex items-center gap-2 group-hover:text-slate-900 transition-colors",
										children: [/* @__PURE__ */ jsx("svg", {
											className: "w-4 h-4",
											fill: "none",
											stroke: "currentColor",
											viewBox: "0 0 24 24",
											children: /* @__PURE__ */ jsx("path", {
												strokeLinecap: "round",
												strokeLinejoin: "round",
												strokeWidth: "2",
												d: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
											})
										}), cat.name]
									}), /* @__PURE__ */ jsx("span", {
										className: "bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-xs font-medium",
										children: cat._count?.posts || 0
									})]
								}, cat.id))
							}),
							/* @__PURE__ */ jsx(Link, {
								to: "/categories",
								className: "text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors",
								children: "View all categories →"
							})
						] }),
						/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx("h3", {
								className: "font-bold text-slate-900 mb-4 font-serif border-b border-slate-200 pb-2",
								children: "Popular Posts"
							}),
							/* @__PURE__ */ jsx("div", {
								className: "space-y-4 mb-4",
								children: related.map((rel) => /* @__PURE__ */ jsxs(Link, {
									to: `/posts/${rel.slug}`,
									className: "flex gap-4 group cursor-pointer",
									children: [/* @__PURE__ */ jsx("div", {
										className: "w-16 h-16 bg-slate-50 border border-slate-100 rounded shrink-0 flex items-center justify-center text-slate-300 overflow-hidden",
										children: rel.coverImageUrl ? /* @__PURE__ */ jsx("img", {
											src: rel.coverImageUrl,
											alt: rel.title,
											className: "w-full h-full object-cover"
										}) : /* @__PURE__ */ jsx("svg", {
											className: "w-6 h-6",
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
										className: "flex flex-col justify-center",
										children: [/* @__PURE__ */ jsx("h4", {
											className: "font-bold font-serif text-xs line-clamp-2 group-hover:text-slate-600 transition-colors",
											children: rel.title
										}), /* @__PURE__ */ jsx("span", {
											className: "text-[10px] text-slate-500 mt-1",
											children: rel.createdAt ? format(new Date(rel.createdAt), "MMM dd, yyyy") : ""
										})]
									})]
								}, rel.id))
							}),
							/* @__PURE__ */ jsx(Link, {
								to: "/popular",
								className: "text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors",
								children: "View all popular posts →"
							})
						] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
							className: "font-bold text-slate-900 mb-4 font-serif border-b border-slate-200 pb-2",
							children: "Tags"
						}), /* @__PURE__ */ jsx("div", {
							className: "flex flex-wrap gap-2",
							children: tags.length > 0 ? tags.slice(0, 10).map((tag) => /* @__PURE__ */ jsx(Link, {
								to: `/tags/${tag.slug}`,
								className: "px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded transition-colors",
								children: tag.name
							}, tag.id)) : /* @__PURE__ */ jsx("span", {
								className: "text-slate-500 text-sm",
								children: "No tags available."
							})
						})] })
					]
				})]
			})
		]
	});
}
//#endregion
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
//#region src/pages/RegisterPage.tsx
/**
* @fileoverview Register Page Component
* @objective Provide a user interface for creating new accounts.
* @risk Password complexity rules must match the backend (Zod schema) to prevent frustrating user experiences where client allows what server rejects.
* @relations Route: `/register`. Interacts with `authStore.ts`.
* @logic
* - Collects `name`, `email`, and `password`.
* - On submit, calls `api.post('/auth/register')`.
* - Parses Zod validation errors from the server (e.g. `errorObj.response.data.details[0].message`) to show specific field errors.
* - On success, logs the user in immediately via `setUser` and redirects to `/dashboard`.
*/
function RegisterPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const setUser = useAuthStore((state) => state.setUser);
	const googleLogin = useGoogleLogin({
		onSuccess: async (tokenResponse) => {
			setError("");
			setIsLoading(true);
			try {
				setUser((await api.post("/auth/google", { token: tokenResponse.access_token })).data.user);
				navigate("/dashboard");
			} catch (err) {
				if (isAxiosError(err)) setError(err.response?.data?.error || "Google signup failed");
				else setError("An unexpected error occurred during Google signup");
			} finally {
				setIsLoading(false);
			}
		},
		onError: () => {
			setError("Google signup failed or was cancelled");
		}
	});
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}
		setIsLoading(true);
		try {
			await api.post("/auth/register", {
				name,
				email,
				password
			});
			setSuccess("Registration successful! Please check your email inbox for the verification link.");
		} catch (err) {
			if (isAxiosError(err)) if (err.response?.data?.details) setError(err.response.data.details[0].message);
			else setError(err.response?.data?.error || "Registration failed");
			else setError("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-50 flex flex-col",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: "Create Account" }),
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
					/* @__PURE__ */ jsx("span", {
						className: "text-slate-900",
						children: "Register"
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "flex-1 flex flex-col items-center justify-center p-6 my-8",
				children: /* @__PURE__ */ jsxs("div", {
					className: "w-full max-w-[480px] bg-white border border-slate-200 rounded-lg p-8 shadow-sm",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "flex justify-center mb-6",
							children: /* @__PURE__ */ jsx("div", {
								className: "w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-400",
								children: /* @__PURE__ */ jsx("svg", {
									className: "w-8 h-8",
									fill: "currentColor",
									viewBox: "0 0 24 24",
									children: /* @__PURE__ */ jsx("path", { d: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" })
								})
							})
						}),
						/* @__PURE__ */ jsx("h1", {
							className: "text-3xl font-bold font-serif text-center text-slate-900 mb-2",
							children: "Create Your Account"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-center text-slate-500 text-sm mb-8",
							children: "Join BlogApp and start your blogging journey"
						}),
						error && /* @__PURE__ */ jsx("div", {
							"aria-live": "polite",
							className: "bg-red-50 border border-red-100 text-red-600 p-3 rounded mb-6 text-sm text-center",
							children: error
						}),
						success ? /* @__PURE__ */ jsxs("div", {
							"aria-live": "polite",
							className: "bg-green-50 border border-green-100 text-green-700 p-6 rounded-lg text-center shadow-sm",
							children: [
								/* @__PURE__ */ jsx("svg", {
									className: "w-12 h-12 text-green-500 mx-auto mb-4",
									fill: "none",
									stroke: "currentColor",
									viewBox: "0 0 24 24",
									children: /* @__PURE__ */ jsx("path", {
										strokeLinecap: "round",
										strokeLinejoin: "round",
										strokeWidth: "2",
										d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									})
								}),
								/* @__PURE__ */ jsx("h3", {
									className: "font-bold text-lg mb-2",
									children: "Check Your Email"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-sm text-green-600",
									children: success
								})
							]
						}) : /* @__PURE__ */ jsxs(Fragment, { children: [
							/* @__PURE__ */ jsxs("form", {
								onSubmit: handleSubmit,
								className: "space-y-5",
								children: [
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
										htmlFor: "name",
										className: "block text-sm font-bold text-slate-900 mb-1.5",
										children: "Full name"
									}), /* @__PURE__ */ jsxs("div", {
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
													d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
												})
											})
										}), /* @__PURE__ */ jsx("input", {
											id: "name",
											type: "text",
											required: true,
											value: name,
											onChange: (e) => setName(e.target.value),
											className: "w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-slate-400 focus:border-slate-400 outline-none transition-colors",
											placeholder: "Enter your full name"
										})]
									})] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
										htmlFor: "email",
										className: "block text-sm font-bold text-slate-900 mb-1.5",
										children: "Email address"
									}), /* @__PURE__ */ jsxs("div", {
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
											className: "w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-slate-400 focus:border-slate-400 outline-none transition-colors",
											placeholder: "Enter your email"
										})]
									})] }),
									/* @__PURE__ */ jsxs("div", { children: [
										/* @__PURE__ */ jsx("label", {
											htmlFor: "password",
											className: "block text-sm font-bold text-slate-900 mb-1.5",
											children: "Password"
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "relative",
											children: [
												/* @__PURE__ */ jsx("div", {
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
															d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
														})
													})
												}),
												/* @__PURE__ */ jsx("input", {
													id: "password",
													type: showPassword ? "text" : "password",
													required: true,
													value: password,
													onChange: (e) => setPassword(e.target.value),
													className: "w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-slate-400 focus:border-slate-400 outline-none transition-colors",
													placeholder: "Create a password"
												}),
												/* @__PURE__ */ jsx("div", {
													className: "absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-slate-600 transition-colors",
													onClick: () => setShowPassword(!showPassword),
													children: showPassword ? /* @__PURE__ */ jsx("svg", {
														className: "h-5 w-5",
														fill: "none",
														stroke: "currentColor",
														viewBox: "0 0 24 24",
														children: /* @__PURE__ */ jsx("path", {
															strokeLinecap: "round",
															strokeLinejoin: "round",
															strokeWidth: "2",
															d: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
														})
													}) : /* @__PURE__ */ jsxs("svg", {
														className: "h-5 w-5",
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
													})
												})
											]
										}),
										/* @__PURE__ */ jsx("p", {
											className: "text-[11px] text-slate-500 mt-2 mb-3",
											children: "Password must be at least 8 characters long"
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "flex flex-wrap items-center gap-3 text-[10px]",
											children: [
												/* @__PURE__ */ jsxs("span", {
													className: `flex items-center gap-1 transition-colors ${password.length >= 8 ? "text-green-600" : "text-slate-500"}`,
													children: [/* @__PURE__ */ jsx("span", { className: `w-2 h-2 rounded-full transition-colors ${password.length >= 8 ? "bg-green-500" : "bg-slate-200"}` }), " 8+ characters"]
												}),
												/* @__PURE__ */ jsxs("span", {
													className: `flex items-center gap-1 transition-colors ${/[A-Z]/.test(password) ? "text-green-600" : "text-slate-500"}`,
													children: [/* @__PURE__ */ jsx("span", { className: `w-2 h-2 rounded-full transition-colors ${/[A-Z]/.test(password) ? "bg-green-500" : "bg-slate-200"}` }), " One uppercase"]
												}),
												/* @__PURE__ */ jsxs("span", {
													className: `flex items-center gap-1 transition-colors ${/[0-9]/.test(password) ? "text-green-600" : "text-slate-500"}`,
													children: [/* @__PURE__ */ jsx("span", { className: `w-2 h-2 rounded-full transition-colors ${/[0-9]/.test(password) ? "bg-green-500" : "bg-slate-200"}` }), " One number"]
												})
											]
										})
									] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
										htmlFor: "confirmPassword",
										className: "block text-sm font-bold text-slate-900 mb-1.5",
										children: "Confirm password"
									}), /* @__PURE__ */ jsxs("div", {
										className: "relative",
										children: [
											/* @__PURE__ */ jsx("div", {
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
														d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
													})
												})
											}),
											/* @__PURE__ */ jsx("input", {
												id: "confirmPassword",
												type: showConfirmPassword ? "text" : "password",
												required: true,
												value: confirmPassword,
												onChange: (e) => setConfirmPassword(e.target.value),
												className: "w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-slate-400 focus:border-slate-400 outline-none transition-colors",
												placeholder: "Confirm your password"
											}),
											/* @__PURE__ */ jsx("div", {
												className: "absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-slate-600 transition-colors",
												onClick: () => setShowConfirmPassword(!showConfirmPassword),
												children: showConfirmPassword ? /* @__PURE__ */ jsx("svg", {
													className: "h-5 w-5",
													fill: "none",
													stroke: "currentColor",
													viewBox: "0 0 24 24",
													children: /* @__PURE__ */ jsx("path", {
														strokeLinecap: "round",
														strokeLinejoin: "round",
														strokeWidth: "2",
														d: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
													})
												}) : /* @__PURE__ */ jsxs("svg", {
													className: "h-5 w-5",
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
												})
											})
										]
									})] }),
									/* @__PURE__ */ jsx("button", {
										type: "submit",
										disabled: isLoading,
										className: "w-full bg-slate-900 text-white font-medium py-3 rounded hover:bg-slate-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed",
										children: isLoading ? "Creating Account..." : "Create Account"
									})
								]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "my-6 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-slate-200 after:mt-0.5 after:flex-1 after:border-t after:border-slate-200",
								children: /* @__PURE__ */ jsx("p", {
									className: "mx-4 mb-0 text-center text-sm text-slate-400",
									children: "or"
								})
							}),
							/* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => googleLogin(),
								disabled: isLoading,
								className: "w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-medium py-2.5 rounded hover:bg-slate-50 transition-colors mb-6 disabled:opacity-70 disabled:cursor-not-allowed",
								children: [/* @__PURE__ */ jsxs("svg", {
									className: "w-5 h-5",
									viewBox: "0 0 24 24",
									children: [
										/* @__PURE__ */ jsx("path", {
											d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z",
											fill: "#4285F4"
										}),
										/* @__PURE__ */ jsx("path", {
											d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z",
											fill: "#34A853"
										}),
										/* @__PURE__ */ jsx("path", {
											d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z",
											fill: "#FBBC05"
										}),
										/* @__PURE__ */ jsx("path", {
											d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z",
											fill: "#EA4335"
										})
									]
								}), "Sign up with Google"]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "text-center text-sm text-slate-600",
								children: [
									"Already have an account?",
									" ",
									/* @__PURE__ */ jsx(Link, {
										to: "/login",
										className: "text-slate-900 font-bold hover:underline underline-offset-2",
										children: "Login"
									})
								]
							})
						] })
					]
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "bg-white border-t border-slate-200",
				children: /* @__PURE__ */ jsxs("div", {
					className: "max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-slate-200",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col md:flex-row items-center md:items-start gap-4 pt-8 md:pt-0 px-4",
							children: [/* @__PURE__ */ jsx("div", {
								className: "w-12 h-12 border border-slate-200 rounded flex items-center justify-center text-slate-500 shrink-0",
								children: /* @__PURE__ */ jsx("svg", {
									className: "w-6 h-6",
									fill: "none",
									stroke: "currentColor",
									viewBox: "0 0 24 24",
									children: /* @__PURE__ */ jsx("path", {
										strokeLinecap: "round",
										strokeLinejoin: "round",
										strokeWidth: "2",
										d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
									})
								})
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h4", {
								className: "font-bold text-slate-900 mb-1",
								children: "100% Secure"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-sm text-slate-500 leading-relaxed",
								children: "We keep your data safe and never share your information."
							})] })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col md:flex-row items-center md:items-start gap-4 pt-8 md:pt-0 px-4",
							children: [/* @__PURE__ */ jsx("div", {
								className: "w-12 h-12 border border-slate-200 rounded flex items-center justify-center text-slate-500 shrink-0",
								children: /* @__PURE__ */ jsx("svg", {
									className: "w-6 h-6",
									fill: "none",
									stroke: "currentColor",
									viewBox: "0 0 24 24",
									children: /* @__PURE__ */ jsx("path", {
										strokeLinecap: "round",
										strokeLinejoin: "round",
										strokeWidth: "2",
										d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
									})
								})
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h4", {
								className: "font-bold text-slate-900 mb-1",
								children: "Share Your Ideas"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-sm text-slate-500 leading-relaxed",
								children: "Write and publish your articles for a global audience."
							})] })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col md:flex-row items-center md:items-start gap-4 pt-8 md:pt-0 px-4",
							children: [/* @__PURE__ */ jsx("div", {
								className: "w-12 h-12 border border-slate-200 rounded flex items-center justify-center text-slate-500 shrink-0",
								children: /* @__PURE__ */ jsx("svg", {
									className: "w-6 h-6",
									fill: "none",
									stroke: "currentColor",
									viewBox: "0 0 24 24",
									children: /* @__PURE__ */ jsx("path", {
										strokeLinecap: "round",
										strokeLinejoin: "round",
										strokeWidth: "2",
										d: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
									})
								})
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h4", {
								className: "font-bold text-slate-900 mb-1",
								children: "Join Community"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-sm text-slate-500 leading-relaxed",
								children: "Connect with like-minded people and grow together."
							})] })]
						})
					]
				})
			})
		]
	});
}
//#endregion
//#region src/pages/ResetPasswordPage.tsx
function ResetPasswordPage() {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		if (!token) {
			setError("Invalid or missing reset token");
			return;
		}
		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}
		if (password.length < 8) {
			setError("Password must be at least 8 characters");
			return;
		}
		setIsLoading(true);
		try {
			setSuccess((await api.post("/auth/reset-password", {
				token,
				newPassword: password
			})).data.message);
			setTimeout(() => {
				navigate("/login");
			}, 3e3);
		} catch (err) {
			if (isAxiosError(err)) setError(err.response?.data?.error || "Failed to reset password");
			else setError("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-50 flex flex-col",
		children: [/* @__PURE__ */ jsx(SEOHead, { title: "Reset Password" }), /* @__PURE__ */ jsx("div", {
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
									d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								})
							})
						})
					}),
					/* @__PURE__ */ jsx("h1", {
						className: "text-3xl font-bold font-serif text-center text-slate-900 mb-2",
						children: "Reset Password"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-center text-slate-500 text-sm mb-8",
						children: "Enter your new password below."
					}),
					error && /* @__PURE__ */ jsx("div", {
						"aria-live": "polite",
						className: "bg-red-50 border border-red-100 text-red-600 p-3 rounded mb-6 text-sm text-center",
						children: error
					}),
					success && /* @__PURE__ */ jsxs("div", {
						"aria-live": "polite",
						className: "bg-green-50 border border-green-100 text-green-600 p-3 rounded mb-6 text-sm text-center",
						children: [
							success,
							" ",
							/* @__PURE__ */ jsx("br", {}),
							" Redirecting to login..."
						]
					}),
					/* @__PURE__ */ jsxs("form", {
						onSubmit: handleSubmit,
						className: "space-y-5",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								htmlFor: "password",
								className: "block text-sm font-bold text-slate-900 mb-1.5",
								children: "New Password"
							}), /* @__PURE__ */ jsxs("div", {
								className: "relative",
								children: [/* @__PURE__ */ jsx("input", {
									id: "password",
									type: showPassword ? "text" : "password",
									required: true,
									value: password,
									onChange: (e) => setPassword(e.target.value),
									className: "w-full px-4 py-2.5 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-slate-400 focus:border-slate-400 outline-none transition-colors",
									placeholder: "Enter new password"
								}), /* @__PURE__ */ jsx("div", {
									className: "absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-slate-600 transition-colors",
									onClick: () => setShowPassword(!showPassword),
									children: showPassword ? /* @__PURE__ */ jsx("svg", {
										className: "h-5 w-5",
										fill: "none",
										stroke: "currentColor",
										viewBox: "0 0 24 24",
										children: /* @__PURE__ */ jsx("path", {
											strokeLinecap: "round",
											strokeLinejoin: "round",
											strokeWidth: "2",
											d: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
										})
									}) : /* @__PURE__ */ jsxs("svg", {
										className: "h-5 w-5",
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
									})
								})]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								htmlFor: "confirmPassword",
								className: "block text-sm font-bold text-slate-900 mb-1.5",
								children: "Confirm Password"
							}), /* @__PURE__ */ jsx("div", {
								className: "relative",
								children: /* @__PURE__ */ jsx("input", {
									id: "confirmPassword",
									type: showPassword ? "text" : "password",
									required: true,
									value: confirmPassword,
									onChange: (e) => setConfirmPassword(e.target.value),
									className: "w-full px-4 py-2.5 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-slate-400 focus:border-slate-400 outline-none transition-colors",
									placeholder: "Confirm new password"
								})
							})] }),
							/* @__PURE__ */ jsx("button", {
								type: "submit",
								disabled: isLoading || !token,
								className: "w-full bg-slate-900 text-white font-medium py-3 rounded hover:bg-slate-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed",
								children: isLoading ? "Resetting..." : "Reset Password"
							})
						]
					})
				]
			})
		})]
	});
}
//#endregion
//#region src/pages/SearchPage.tsx
/**
* @fileoverview Search Page Component (Stub)
* @objective Provide a UI for users to query the blog for specific terms.
* @risk N/A - Currently a placeholder.
* @relations Route: `/search`.
* @logic
* - Renders a static placeholder indicating pending search functionality implementation.
*/
function SearchPage() {
	const [searchParams] = useSearchParams();
	const query = searchParams.get("q") || "";
	const [results, setResults] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	useEffect(() => {
		if (!query.trim()) {
			setResults([]);
			return;
		}
		const fetchResults = async () => {
			setIsLoading(true);
			setError(null);
			try {
				setResults((await api.get(`/content/posts?search=${encodeURIComponent(query)}`)).data.data);
			} catch (err) {
				console.error("Search error:", err);
				setError("Failed to fetch search results.");
			} finally {
				setIsLoading(false);
			}
		};
		fetchResults();
	}, [query]);
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-7xl mx-auto px-6 py-12",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: query ? `Search: ${query}` : "Search" }),
			/* @__PURE__ */ jsxs("h1", {
				className: "text-3xl font-bold mb-8",
				children: [
					"Search Results for \"",
					query,
					"\""
				]
			}),
			isLoading ? /* @__PURE__ */ jsx("div", {
				className: "text-center py-12 text-slate-500",
				children: "Searching..."
			}) : error ? /* @__PURE__ */ jsx("div", {
				className: "text-center py-12 text-red-500",
				children: error
			}) : results.length > 0 ? /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
				children: results.map((post) => /* @__PURE__ */ jsx(PostCard, { post }, post.id))
			}) : /* @__PURE__ */ jsxs("div", {
				className: "bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center",
				children: [
					/* @__PURE__ */ jsx("svg", {
						className: "w-12 h-12 text-slate-300 mx-auto mb-4",
						fill: "none",
						stroke: "currentColor",
						viewBox: "0 0 24 24",
						"aria-hidden": "true",
						children: /* @__PURE__ */ jsx("path", {
							strokeLinecap: "round",
							strokeLinejoin: "round",
							strokeWidth: 1.5,
							d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						})
					}),
					/* @__PURE__ */ jsx("h2", {
						className: "text-xl font-semibold text-slate-700 mb-2",
						children: "No results found"
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "text-slate-500",
						children: [
							"We couldn't find any articles matching \"",
							query,
							"\". Try adjusting your search terms."
						]
					})
				]
			})
		]
	});
}
//#endregion
//#region src/pages/TagPage.tsx
function TagPage() {
	const { tag } = useParams();
	const [posts, setPosts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const formattedTagName = tag?.replace(/-/g, " ").toUpperCase() || "TAG";
	useEffect(() => {
		const controller = new AbortController();
		const fetchPosts = async () => {
			setIsLoading(true);
			try {
				setPosts((await api.get(`/content/posts?tag=${tag}&status=PUBLISHED`, { signal: controller.signal })).data.data);
			} catch (error) {
				if (error.name === "CanceledError" || error.name === "AbortError") return;
				console.error("Failed to fetch tag posts:", error);
			} finally {
				setIsLoading(false);
			}
		};
		if (tag) fetchPosts();
		return () => {
			controller.abort();
		};
	}, [tag]);
	const navigate = useNavigate();
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-7xl mx-auto px-6 py-12 min-h-screen",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: `#${formattedTagName} Posts` }),
			/* @__PURE__ */ jsxs("div", {
				className: "mb-12 pb-8 border-b border-slate-200",
				children: [/* @__PURE__ */ jsx("button", {
					onClick: () => navigate(-1),
					className: "text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4 flex items-center gap-1",
					children: "← Go Back"
				}), /* @__PURE__ */ jsxs("h1", {
					className: "text-4xl font-bold font-serif text-slate-900",
					children: ["Tag: ", /* @__PURE__ */ jsxs("span", {
						className: "text-slate-500",
						children: ["#", formattedTagName]
					})]
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 lg:grid-cols-12 gap-12",
				children: /* @__PURE__ */ jsx("div", {
					className: "lg:col-span-8",
					children: isLoading ? /* @__PURE__ */ jsx("div", {
						className: "space-y-8",
						children: [
							1,
							2,
							3
						].map((n) => /* @__PURE__ */ jsx("div", { className: "animate-pulse bg-slate-50 h-48 rounded-lg border border-slate-100" }, n))
					}) : posts.length > 0 ? /* @__PURE__ */ jsx("div", {
						className: "space-y-8",
						children: posts.map((post) => /* @__PURE__ */ jsx(PostCard, {
							post,
							layout: "horizontal"
						}, post.id))
					}) : /* @__PURE__ */ jsxs("div", {
						className: "p-12 text-center bg-slate-50 rounded-xl border border-slate-100 text-slate-500",
						children: [/* @__PURE__ */ jsx("svg", {
							className: "w-12 h-12 mx-auto text-slate-300 mb-4",
							fill: "none",
							stroke: "currentColor",
							viewBox: "0 0 24 24",
							children: /* @__PURE__ */ jsx("path", {
								strokeLinecap: "round",
								strokeLinejoin: "round",
								strokeWidth: "2",
								d: "M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
							})
						}), /* @__PURE__ */ jsx("p", { children: "No published articles found for this tag yet." })]
					})
				})
			})
		]
	});
}
//#endregion
//#region src/pages/TagsIndexPage.tsx
function TagsIndexPage() {
	const [tags, setTags] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [search, setSearch] = useState("");
	useEffect(() => {
		const fetchTags = async () => {
			try {
				setTags((await api.get("/content/tags")).data);
			} catch (error) {
				console.error("Failed to fetch tags:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchTags();
	}, []);
	const sortedTags = [...tags].sort((a, b) => (b._count?.posts || 0) - (a._count?.posts || 0));
	const displayedTags = search.trim() ? sortedTags.filter((t) => t.name.toLowerCase().includes(search.toLowerCase())) : sortedTags.slice(0, 50);
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-7xl mx-auto px-6 py-12 min-h-screen",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: "Explore Tags" }),
			/* @__PURE__ */ jsxs("div", {
				className: "mb-12 pb-8 border-b border-slate-200 text-center max-w-3xl mx-auto",
				children: [/* @__PURE__ */ jsx("h1", {
					className: "text-4xl font-bold font-serif text-slate-900 mb-4",
					children: "Explore Tags"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-slate-500 text-lg",
					children: "Browse topics written by our authors. Find exactly what you're looking for."
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "max-w-2xl mx-auto mb-12 relative",
				children: [/* @__PURE__ */ jsx("input", {
					type: "text",
					placeholder: "Search tags...",
					value: search,
					onChange: (e) => setSearch(e.target.value),
					className: "w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-lg outline-none focus:border-slate-900 transition-colors shadow-sm"
				}), /* @__PURE__ */ jsx("svg", {
					className: "w-6 h-6 absolute left-4 top-4 text-slate-400",
					fill: "none",
					stroke: "currentColor",
					viewBox: "0 0 24 24",
					children: /* @__PURE__ */ jsx("path", {
						strokeLinecap: "round",
						strokeLinejoin: "round",
						strokeWidth: "2",
						d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					})
				})]
			}),
			isLoading ? /* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap gap-4 justify-center",
				children: [...Array(12)].map((_, i) => /* @__PURE__ */ jsx("div", { className: "w-24 h-10 bg-slate-100 animate-pulse rounded-full" }, i))
			}) : displayedTags.length > 0 ? /* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap gap-4 justify-center",
				children: displayedTags.map((tag) => /* @__PURE__ */ jsxs(Link, {
					to: `/tags/${tag.slug}`,
					className: "px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-full font-medium hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm hover:shadow-md flex items-center gap-2",
					children: [/* @__PURE__ */ jsxs("span", { children: ["#", tag.name] }), /* @__PURE__ */ jsx("span", {
						className: "text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full",
						children: tag._count?.posts || 0
					})]
				}, tag.id))
			}) : /* @__PURE__ */ jsx("div", {
				className: "text-center text-slate-500 py-12",
				children: /* @__PURE__ */ jsxs("p", { children: [
					"No tags found matching \"",
					search,
					"\""
				] })
			})
		]
	});
}
//#endregion
//#region src/pages/TermsPage.tsx
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
//#region src/pages/admin/AdminLayout.tsx
/**
* @fileoverview Admin Layout Component
* @objective Provide a persistent sidebar navigation wrapper for all Admin-related pages.
* @risk None inherently, but relies heavily on `ProtectedRoute` wrapping this component in `App.tsx` to prevent unauthorized access.
* @relations Route: `/admin/*`. Parent to `AdminUsersPage`, `AdminPostsPage`, etc., rendering them via `<Outlet />`.
* @logic
* - Defines a list of navigation items.
* - Highlights the active link based on `useLocation().pathname`.
* - Renders a sidebar (hidden on mobile) and a main content area.
*/
function AdminLayout() {
	const { user } = useAuthStore();
	return /* @__PURE__ */ jsxs("div", {
		className: "flex min-h-[calc(100vh-140px)] bg-slate-50",
		children: [
			/* @__PURE__ */ jsx(SEOHead, { title: "Admin Dashboard" }),
			/* @__PURE__ */ jsxs("aside", {
				className: "w-64 bg-white border-r border-slate-200 p-6 hidden md:block",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "mb-8",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "text-sm font-bold text-slate-500 uppercase tracking-wider mb-2",
							children: "Admin Panel"
						}), /* @__PURE__ */ jsxs("p", {
							className: "text-xs text-slate-400",
							children: ["Logged in as ", user?.name || "Admin"]
						})]
					}),
					/* @__PURE__ */ jsx("nav", {
						className: "space-y-1.5",
						children: [
							{
								name: "Dashboard Overview",
								path: "/admin"
							},
							{
								name: "Users",
								path: "/admin/users"
							},
							{
								name: "Posts",
								path: "/admin/posts"
							},
							{
								name: "Settings",
								path: "/admin/settings"
							}
						].map((item) => /* @__PURE__ */ jsx(NavLink, {
							to: item.path,
							end: item.path === "/admin",
							className: ({ isActive }) => `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-primary-50 text-primary-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`,
							children: item.name
						}, item.path))
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mt-12 pt-6 border-t border-slate-200",
						children: /* @__PURE__ */ jsx(Link, {
							to: "/dashboard",
							className: "flex items-center px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors",
							children: "← Back to Dashboard"
						})
					})
				]
			}),
			/* @__PURE__ */ jsx("main", {
				className: "flex-1 p-8",
				children: /* @__PURE__ */ jsx(Outlet, {})
			})
		]
	});
}
//#endregion
//#region src/pages/admin/AdminOverviewPage.tsx
function AdminOverviewPage() {
	const [stats, setStats] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	useEffect(() => {
		api.get("/admin/analytics").then((res) => setStats(res.data)).catch(console.error).finally(() => setIsLoading(false));
	}, []);
	if (isLoading) return /* @__PURE__ */ jsx("div", {
		className: "p-8 text-slate-500",
		children: "Loading overview..."
	});
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("h1", {
			className: "text-2xl font-bold mb-8",
			children: "Dashboard Overview"
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-12",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "text-slate-500 text-sm font-medium uppercase tracking-wider mb-2",
							children: "Total Users"
						}),
						/* @__PURE__ */ jsx("span", {
							className: "text-4xl font-bold font-serif text-slate-900",
							children: stats?.users || 0
						}),
						/* @__PURE__ */ jsx(Link, {
							to: "/admin/users",
							className: "mt-4 text-sm text-primary-600 hover:underline",
							children: "Manage Users →"
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "text-slate-500 text-sm font-medium uppercase tracking-wider mb-2",
							children: "Total Posts"
						}),
						/* @__PURE__ */ jsx("span", {
							className: "text-4xl font-bold font-serif text-slate-900",
							children: stats?.posts || 0
						}),
						/* @__PURE__ */ jsx(Link, {
							to: "/admin/posts",
							className: "mt-4 text-sm text-primary-600 hover:underline",
							children: "Manage Posts →"
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "text-slate-500 text-sm font-medium uppercase tracking-wider mb-2",
							children: "Total Comments"
						}),
						/* @__PURE__ */ jsx("span", {
							className: "text-4xl font-bold font-serif text-slate-900",
							children: stats?.comments || 0
						}),
						/* @__PURE__ */ jsx("span", {
							className: "mt-4 text-sm text-slate-400",
							children: "Moderation coming soon"
						})
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "bg-primary-50 rounded-xl p-8 border border-primary-100",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "text-xl font-bold text-primary-900 mb-2",
				children: "Welcome to the Admin Panel"
			}), /* @__PURE__ */ jsx("p", {
				className: "text-primary-700 max-w-2xl",
				children: "Use the sidebar to navigate through the administrative features. You can manage user roles, approve role requests, and moderate all content across the platform."
			})]
		})
	] });
}
//#endregion
//#region src/pages/admin/AdminPostsPage.tsx
/**
* @fileoverview Admin Posts Management Page
* @objective Allow administrators (and potentially editors) to view, edit, and update the status of all blog posts globally.
* @risk Changing post status (e.g., from DRAFT to PUBLISHED) without review could expose unfinished content.
* @relations Route: `/admin/posts`. Interacts with `api.get('/content/posts')` and `api.patch('/content/posts/:id')`.
* @logic
* - `fetchPosts`: Retrieves the latest posts regardless of author or status.
* - `handleUpdateStatus`: Triggers a PATCH request to update the publication status (DRAFT/PUBLISHED/etc).
* - Displays posts in a table format with quick actions for viewing and editing.
*/
function AdminPostsPage() {
	const [posts, setPosts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [postToDelete, setPostToDelete] = useState(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const fetchPosts = useCallback(async () => {
		try {
			setPosts((await api.get("/content/posts?limit=10")).data.data);
		} catch (error) {
			console.error("Failed to load posts:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);
	useEffect(() => {
		fetchPosts();
	}, [fetchPosts]);
	const handleUpdateStatus = async (id, status) => {
		try {
			await api.patch(`/content/posts/${id}`, { status });
			await fetchPosts();
		} catch (error) {
			console.error("Failed to update status:", error);
			alert("Failed to update status. Please try again.");
		}
	};
	const executeDelete = async () => {
		if (!postToDelete) return;
		setIsDeleting(true);
		try {
			await api.delete(`/content/posts/${postToDelete}`);
			setPosts(posts.filter((p) => p.id !== postToDelete));
			setPostToDelete(null);
		} catch (error) {
			console.error("Failed to delete post:", error);
			alert("Failed to delete post. Please try again.");
		} finally {
			setIsDeleting(false);
		}
	};
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "flex justify-between items-center mb-6",
			children: [/* @__PURE__ */ jsx("h1", {
				className: "text-2xl font-bold",
				children: "Manage Posts"
			}), /* @__PURE__ */ jsx(Link, {
				to: "/dashboard/posts/new",
				className: "btn-primary text-sm",
				children: "Create New Post"
			})]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden",
			children: /* @__PURE__ */ jsx("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full text-left text-sm",
					children: [/* @__PURE__ */ jsx("thead", {
						className: "bg-slate-50 border-b border-slate-200 text-slate-600",
						children: /* @__PURE__ */ jsxs("tr", { children: [
							/* @__PURE__ */ jsx("th", {
								className: "px-6 py-4 font-semibold",
								children: "Title"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-6 py-4 font-semibold",
								children: "Author"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-6 py-4 font-semibold",
								children: "Status"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-6 py-4 font-semibold",
								children: "Views"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-6 py-4 font-semibold text-right",
								children: "Actions"
							})
						] })
					}), /* @__PURE__ */ jsx("tbody", {
						className: "divide-y divide-slate-100",
						children: isLoading ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
							colSpan: 5,
							className: "px-6 py-8 text-center text-slate-500",
							children: "Loading posts..."
						}) }) : posts.map((post) => /* @__PURE__ */ jsxs("tr", {
							className: "hover:bg-slate-50 transition-colors",
							children: [
								/* @__PURE__ */ jsx("td", {
									className: "px-6 py-4 font-medium text-slate-900 max-w-xs truncate",
									title: post.title,
									children: post.title
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-6 py-4 text-slate-600",
									children: post.author?.name || "Unknown"
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-6 py-4",
									children: /* @__PURE__ */ jsxs("select", {
										value: post.status,
										onChange: (e) => handleUpdateStatus(post.id, e.target.value),
										className: `text-xs font-medium rounded-full px-2.5 py-1 border outline-none ${post.status === "PUBLISHED" ? "bg-green-50 text-green-700 border-green-200" : post.status === "DRAFT" ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-red-50 text-red-700 border-red-200"}`,
										children: [
											/* @__PURE__ */ jsx("option", {
												value: "DRAFT",
												children: "Draft"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "PENDING_REVIEW",
												children: "Pending"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "PUBLISHED",
												children: "Published"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "ARCHIVED",
												children: "Archived"
											})
										]
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-6 py-4 text-slate-600",
									children: post.viewCount || 0
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "px-6 py-4 text-right",
									children: [
										/* @__PURE__ */ jsx(Link, {
											to: `/posts/${post.slug}`,
											target: "_blank",
											rel: "noreferrer",
											className: "text-primary-600 hover:underline text-xs mr-3",
											children: "View"
										}),
										/* @__PURE__ */ jsx(Link, {
											to: `/dashboard/posts/edit/${post.id}`,
											className: "text-slate-500 hover:text-slate-800 text-xs mr-3",
											children: "Edit"
										}),
										/* @__PURE__ */ jsx("button", {
											onClick: () => setPostToDelete(post.id),
											className: "text-red-500 hover:text-red-700 text-xs font-medium",
											children: "Delete"
										})
									]
								})
							]
						}, post.id))
					})]
				})
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
		})
	] });
}
//#endregion
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
//#region src/pages/admin/AdminUsersPage.tsx
/**
* @fileoverview Admin Users Management Page
* @objective Allow administrators to view all registered users and modify their roles (e.g., promote to Editor).
* @risk Modifying roles without a proper backend audit log could lead to untraceable privilege escalation.
* @relations Route: `/admin/users`. Interacts with `api.patch('/admin/users/:id/role')`.
* @logic
* - `fetchUsers`: Mocks fetching a list of users by just loading the current user (placeholder for demo).
* - `handleChangeRole`: Triggers a PATCH request to update the user's role in the database.
* - Renders a table displaying users and a dropdown to select their role.
*/
function AdminUsersPage() {
	const [users, setUsers] = useState([]);
	const [roleRequests, setRoleRequests] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [pendingRoleChange, setPendingRoleChange] = useState(null);
	const [isChangingRole, setIsChangingRole] = useState(false);
	const fetchData = useCallback(async () => {
		try {
			setError(null);
			const [usersRes, requestsRes] = await Promise.all([api.get("/admin/users"), api.get("/admin/role-requests")]);
			setUsers(usersRes.data);
			setRoleRequests(requestsRes.data);
		} catch (err) {
			console.error("Failed to load data:", err);
			setError("Failed to load data. Please try again later.");
		} finally {
			setIsLoading(false);
		}
	}, []);
	useEffect(() => {
		fetchData();
	}, [fetchData]);
	const executeRoleChange = async () => {
		if (!pendingRoleChange) return;
		setIsChangingRole(true);
		try {
			await api.patch(`/admin/users/${pendingRoleChange.id}/role`, { role: pendingRoleChange.role });
			await fetchData();
			setPendingRoleChange(null);
		} catch (err) {
			console.error("Failed to update role:", err);
			alert("Failed to update role. Please try again.");
		} finally {
			setIsChangingRole(false);
		}
	};
	const handleRequestAction = async (requestId, status) => {
		try {
			await api.patch(`/admin/role-requests/${requestId}`, { status });
			await fetchData();
		} catch (err) {
			console.error("Failed to update request:", err);
			alert("Failed to update request. Please try again.");
		}
	};
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("h1", {
			className: "text-2xl font-bold mb-6",
			children: "Manage Users"
		}),
		error && /* @__PURE__ */ jsx("div", {
			className: "mb-6 p-4 bg-red-50 text-red-600 rounded-lg",
			children: error
		}),
		/* @__PURE__ */ jsx("h2", {
			className: "text-xl font-bold mb-4 font-serif",
			children: "Pending Role Requests"
		}),
		/* @__PURE__ */ jsx("div", {
			className: "bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-12",
			children: /* @__PURE__ */ jsx("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full text-left text-sm",
					children: [/* @__PURE__ */ jsx("thead", {
						className: "bg-slate-50 border-b border-slate-200 text-slate-600",
						children: /* @__PURE__ */ jsxs("tr", { children: [
							/* @__PURE__ */ jsx("th", {
								className: "px-6 py-4 font-semibold",
								children: "User"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-6 py-4 font-semibold",
								children: "Requested Role"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-6 py-4 font-semibold",
								children: "Reason"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-6 py-4 font-semibold text-right",
								children: "Actions"
							})
						] })
					}), /* @__PURE__ */ jsx("tbody", {
						className: "divide-y divide-slate-100",
						children: isLoading ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
							colSpan: 4,
							className: "px-6 py-8 text-center text-slate-500",
							children: "Loading requests..."
						}) }) : roleRequests.filter((r) => r.status === "PENDING").length > 0 ? roleRequests.filter((r) => r.status === "PENDING").map((request) => /* @__PURE__ */ jsxs("tr", {
							className: "hover:bg-slate-50 transition-colors",
							children: [
								/* @__PURE__ */ jsxs("td", {
									className: "px-6 py-4",
									children: [/* @__PURE__ */ jsx("div", {
										className: "font-medium text-slate-900",
										children: request.user?.name
									}), /* @__PURE__ */ jsx("div", {
										className: "text-slate-500 text-xs",
										children: request.user?.email
									})]
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-6 py-4 font-medium text-indigo-600",
									children: request.requestedRole
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-6 py-4 text-slate-600 italic max-w-xs truncate",
									title: request.reason,
									children: request.reason || "No reason provided"
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "px-6 py-4 text-right space-x-2",
									children: [/* @__PURE__ */ jsx("button", {
										onClick: () => handleRequestAction(request.id, "APPROVED"),
										className: "px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium",
										children: "Approve"
									}), /* @__PURE__ */ jsx("button", {
										onClick: () => handleRequestAction(request.id, "REJECTED"),
										className: "px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium",
										children: "Reject"
									})]
								})
							]
						}, request.id)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
							colSpan: 4,
							className: "px-6 py-8 text-center text-slate-500",
							children: "No pending role requests."
						}) })
					})]
				})
			})
		}),
		/* @__PURE__ */ jsx("h2", {
			className: "text-xl font-bold mb-4 font-serif",
			children: "All Users"
		}),
		/* @__PURE__ */ jsx("div", {
			className: "bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden",
			children: /* @__PURE__ */ jsx("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full text-left text-sm",
					children: [/* @__PURE__ */ jsx("thead", {
						className: "bg-slate-50 border-b border-slate-200 text-slate-600",
						children: /* @__PURE__ */ jsxs("tr", { children: [
							/* @__PURE__ */ jsx("th", {
								className: "px-6 py-4 font-semibold",
								children: "User"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-6 py-4 font-semibold",
								children: "Email"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-6 py-4 font-semibold",
								children: "Role"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-6 py-4 font-semibold text-right",
								children: "Actions"
							})
						] })
					}), /* @__PURE__ */ jsx("tbody", {
						className: "divide-y divide-slate-100",
						children: isLoading ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
							colSpan: 4,
							className: "px-6 py-8 text-center text-slate-500",
							children: "Loading users..."
						}) }) : users.length > 0 ? users.map((user) => /* @__PURE__ */ jsxs("tr", {
							className: "hover:bg-slate-50 transition-colors",
							children: [
								/* @__PURE__ */ jsx("td", {
									className: "px-6 py-4 font-medium text-slate-900",
									children: user.name
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-6 py-4 text-slate-600",
									children: user.email
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-6 py-4",
									children: /* @__PURE__ */ jsx("span", {
										className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === "ADMIN" ? "bg-purple-100 text-purple-800" : user.role === "AUTHOR" ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-800"}`,
										children: user.role
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "px-6 py-4 text-right",
									children: /* @__PURE__ */ jsxs("select", {
										className: "border border-slate-200 rounded px-2 py-1 text-sm mr-2 outline-none",
										value: user.role,
										onChange: (e) => setPendingRoleChange({
											id: user.id,
											name: user.name,
											oldRole: user.role,
											role: e.target.value
										}),
										"aria-label": `Change role for ${user.name}`,
										children: [
											/* @__PURE__ */ jsx("option", {
												value: "SUBSCRIBER",
												children: "Subscriber"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "AUTHOR",
												children: "Author"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "ADMIN",
												children: "Admin"
											})
										]
									})
								})
							]
						}, user.id)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
							colSpan: 4,
							className: "px-6 py-8 text-center text-slate-500",
							children: "No users found."
						}) })
					})]
				})
			})
		}),
		/* @__PURE__ */ jsx(ConfirmModal, {
			isOpen: !!pendingRoleChange,
			title: "Change User Role",
			message: /* @__PURE__ */ jsxs("p", { children: [
				"Are you sure you want to change ",
				/* @__PURE__ */ jsx("strong", { children: pendingRoleChange?.name }),
				"'s role from ",
				/* @__PURE__ */ jsx("span", {
					className: "font-semibold text-slate-500",
					children: pendingRoleChange?.oldRole
				}),
				" to ",
				/* @__PURE__ */ jsx("span", {
					className: "font-bold text-indigo-600",
					children: pendingRoleChange?.role
				}),
				"? This will immediately affect their access and permissions on the platform."
			] }),
			confirmText: "Change Role",
			onConfirm: executeRoleChange,
			onCancel: () => setPendingRoleChange(null),
			isLoading: isChangingRole
		})
	] });
}
//#endregion
//#region src/App.tsx
/**
* @fileoverview Main Application Component
* @objective Serve as the root React component, defining global layout (Header/Footer) and all application routing.
* @risk Improperly configured ProtectedRoutes can accidentally expose admin pages or user dashboards to unauthenticated users.
* @relations Rendered by `entry-client.tsx` and `entry-server.tsx`. Depends on `react-router-dom` and `authStore`.
* @logic
* - Initializes authentication state on mount via `checkAuth()`.
* - Renders the global navigation header (conditionally showing Login/Logout based on `isAuthenticated`).
* - Defines `Routes`, mapping URL paths to specific Page components.
* - Wraps sensitive pages with `<ProtectedRoute>`, passing role requirements for Admin areas.
*/
function App() {
	const { checkAuth } = useAuthStore();
	useEffect(() => {
		checkAuth();
	}, [checkAuth]);
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-surface-50 flex flex-col",
		children: [
			/* @__PURE__ */ jsx(Header, {}),
			/* @__PURE__ */ jsx("main", {
				className: "flex-1",
				children: /* @__PURE__ */ jsxs(Routes, { children: [
					/* @__PURE__ */ jsx(Route, {
						path: "/",
						element: /* @__PURE__ */ jsx(HomePage, {})
					}),
					/* @__PURE__ */ jsx(Route, {
						path: "/posts/:slug",
						element: /* @__PURE__ */ jsx(PostDetailPage, {})
					}),
					/* @__PURE__ */ jsx(Route, {
						path: "/login",
						element: /* @__PURE__ */ jsx(LoginPage, {})
					}),
					/* @__PURE__ */ jsx(Route, {
						path: "/register",
						element: /* @__PURE__ */ jsx(RegisterPage, {})
					}),
					/* @__PURE__ */ jsx(Route, {
						path: "/forgot-password",
						element: /* @__PURE__ */ jsx(ForgotPasswordPage, {})
					}),
					/* @__PURE__ */ jsx(Route, {
						path: "/reset-password",
						element: /* @__PURE__ */ jsx(ResetPasswordPage, {})
					}),
					/* @__PURE__ */ jsx(Route, {
						path: "/verify-email",
						element: /* @__PURE__ */ jsx(VerifyEmailPage, {})
					}),
					/* @__PURE__ */ jsx(Route, {
						path: "/search",
						element: /* @__PURE__ */ jsx(SearchPage, {})
					}),
					/* @__PURE__ */ jsx(Route, {
						path: "/authors/:authorName",
						element: /* @__PURE__ */ jsx(AuthorProfilePage, {})
					}),
					/* @__PURE__ */ jsx(Route, {
						path: "/categories",
						element: /* @__PURE__ */ jsx(CategoriesIndexPage, {})
					}),
					/* @__PURE__ */ jsx(Route, {
						path: "/categories/:category",
						element: /* @__PURE__ */ jsx(CategoryPage, {})
					}),
					/* @__PURE__ */ jsx(Route, {
						path: "/tags",
						element: /* @__PURE__ */ jsx(TagsIndexPage, {})
					}),
					/* @__PURE__ */ jsx(Route, {
						path: "/tags/:tag",
						element: /* @__PURE__ */ jsx(TagPage, {})
					}),
					/* @__PURE__ */ jsx(Route, {
						path: "/authors",
						element: /* @__PURE__ */ jsx(AuthorsIndexPage, {})
					}),
					/* @__PURE__ */ jsx(Route, {
						path: "/popular",
						element: /* @__PURE__ */ jsx(PopularPostsPage, {})
					}),
					/* @__PURE__ */ jsx(Route, {
						path: "/about",
						element: /* @__PURE__ */ jsx(AboutPage, {})
					}),
					/* @__PURE__ */ jsx(Route, {
						path: "/privacy",
						element: /* @__PURE__ */ jsx(PrivacyPage, {})
					}),
					/* @__PURE__ */ jsx(Route, {
						path: "/terms",
						element: /* @__PURE__ */ jsx(TermsPage, {})
					}),
					/* @__PURE__ */ jsx(Route, {
						path: "/dashboard",
						element: /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(DashboardPage, {}) })
					}),
					/* @__PURE__ */ jsx(Route, {
						path: "/dashboard/posts",
						element: /* @__PURE__ */ jsx(ProtectedRoute, {
							requireRole: ["ADMIN", "AUTHOR"],
							children: /* @__PURE__ */ jsx(ManagePostsPage, {})
						})
					}),
					/* @__PURE__ */ jsx(Route, {
						path: "/dashboard/posts/new",
						element: /* @__PURE__ */ jsx(ProtectedRoute, {
							requireRole: ["ADMIN", "AUTHOR"],
							children: /* @__PURE__ */ jsx(CreatePostPage, {})
						})
					}),
					/* @__PURE__ */ jsx(Route, {
						path: "/dashboard/posts/edit/:id",
						element: /* @__PURE__ */ jsx(ProtectedRoute, {
							requireRole: ["ADMIN", "AUTHOR"],
							children: /* @__PURE__ */ jsx(EditPostPage, {})
						})
					}),
					/* @__PURE__ */ jsx(Route, {
						path: "/profile",
						element: /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(ProfilePage, {}) })
					}),
					/* @__PURE__ */ jsxs(Route, {
						path: "/admin",
						element: /* @__PURE__ */ jsx(ProtectedRoute, {
							requireRole: ["ADMIN"],
							children: /* @__PURE__ */ jsx(AdminLayout, {})
						}),
						children: [
							/* @__PURE__ */ jsx(Route, {
								index: true,
								element: /* @__PURE__ */ jsx(AdminOverviewPage, {})
							}),
							/* @__PURE__ */ jsx(Route, {
								path: "users",
								element: /* @__PURE__ */ jsx(AdminUsersPage, {})
							}),
							/* @__PURE__ */ jsx(Route, {
								path: "posts",
								element: /* @__PURE__ */ jsx(AdminPostsPage, {})
							}),
							/* @__PURE__ */ jsx(Route, {
								path: "settings",
								element: /* @__PURE__ */ jsx(AdminSettingsPage, {})
							})
						]
					})
				] })
			}),
			/* @__PURE__ */ jsx(Footer, {})
		]
	});
}
//#endregion
//#region src/entry-server.tsx
/**
* @fileoverview Server-Side Rendering Entry Point
* @objective Export a render function that converts the React tree into an HTML string for Express to serve.
* @risk Memory leaks can occur if context objects (like HelmetContext) are not properly garbage collected per request.
* @relations Required by `client/server.ts` during SSR. Uses `StaticRouter` instead of `BrowserRouter`.
* @logic
* - Takes the incoming request `url` and passes it to `<StaticRouter>`.
* - Uses `ReactDOMServer.renderToString()` to render `<App />`.
* - Extracts SEO metadata from `react-helmet-async` context.
* - Returns both the HTML string and the Helmet tags to be injected into `index.html`.
*/
function render(url) {
	const helmetContext = {};
	const html = ReactDOMServer.renderToString(/* @__PURE__ */ jsx(React.StrictMode, { children: /* @__PURE__ */ jsx(HelmetProvider, {
		context: helmetContext,
		children: /* @__PURE__ */ jsx(GoogleOAuthProvider, {
			clientId: "801244898058-5sp0ib2a9cu41nf699mi2v8lbi2ndims.apps.googleusercontent.com",
			children: /* @__PURE__ */ jsx(StaticRouter, {
				location: url,
				children: /* @__PURE__ */ jsx(App, {})
			})
		})
	}) }));
	const { helmet } = helmetContext;
	return {
		html,
		helmet
	};
}
//#endregion
export { render };
