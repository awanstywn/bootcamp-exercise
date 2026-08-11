import React, { Component, Suspense, createContext, lazy, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import ReactDOMServer from "react-dom/server";
import { Link, NavLink, Navigate, Route, Routes, StaticRouter, useLocation, useNavigate } from "react-router-dom";
import { create } from "zustand";
import axios from "axios";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import fastCompare from "react-fast-compare";
import invariant from "invariant";
import shallowEqual from "shallowequal";
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
var AboutPage = lazy(() => import("./assets/AboutPage-PJLK_7lB.js"));
var AuthorProfilePage = lazy(() => import("./assets/AuthorProfilePage-fwIet-hW.js"));
var AuthorsIndexPage = lazy(() => import("./assets/AuthorsIndexPage-UaLjLr2F.js"));
var CategoriesIndexPage = lazy(() => import("./assets/CategoriesIndexPage-Boqx0PWq.js"));
var CategoryPage = lazy(() => import("./assets/CategoryPage-CFEgGhfe.js"));
var CreatePostPage = lazy(() => import("./assets/CreatePostPage-DeY9Jaf6.js"));
var DashboardPage = lazy(() => import("./assets/DashboardPage-21Cek-HI.js"));
var EditPostPage = lazy(() => import("./assets/EditPostPage-786PNMn2.js"));
var ForgotPasswordPage = lazy(() => import("./assets/ForgotPasswordPage-D9-Y46-d.js"));
var HomePage = lazy(() => import("./assets/HomePage-DTYIhHSn.js"));
var LoginPage = lazy(() => import("./assets/LoginPage-hyZ0FSxB.js"));
var ManagePostsPage = lazy(() => import("./assets/ManagePostsPage-DNknTotE.js"));
var PopularPostsPage = lazy(() => import("./assets/PopularPostsPage-6Z8aR8Gq.js"));
var PostDetailPage = lazy(() => import("./assets/PostDetailPage-BZXQREeG.js"));
var PrivacyPage = lazy(() => import("./assets/PrivacyPage-DAw3bNMt.js"));
var ProfilePage = lazy(() => import("./assets/ProfilePage-BO0HCRjT.js"));
var RegisterPage = lazy(() => import("./assets/RegisterPage-DAvnRZNc.js"));
var ResetPasswordPage = lazy(() => import("./assets/ResetPasswordPage-DAAi82k7.js"));
var SearchPage = lazy(() => import("./assets/SearchPage-CNY1H7dG.js"));
var TagPage = lazy(() => import("./assets/TagPage-D0YqJec5.js"));
var TagsIndexPage = lazy(() => import("./assets/TagsIndexPage-B81IY3in.js"));
var TermsPage = lazy(() => import("./assets/TermsPage-CpBCw0Nn.js"));
var VerifyEmailPage = lazy(() => import("./assets/VerifyEmailPage-CVSA_jtB.js"));
var AdminLayout = lazy(() => import("./assets/AdminLayout-BocZCtUU.js"));
var AdminOverviewPage = lazy(() => import("./assets/AdminOverviewPage-BBcUSvam.js"));
var AdminPostsPage = lazy(() => import("./assets/AdminPostsPage-CeOhnRK9.js"));
var AdminSettingsPage = lazy(() => import("./assets/AdminSettingsPage-N91AxbYP.js"));
var AdminUsersPage = lazy(() => import("./assets/AdminUsersPage-B0qf2D7D.js"));
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
				children: /* @__PURE__ */ jsx(Suspense, {
					fallback: /* @__PURE__ */ jsx("div", {
						className: "flex items-center justify-center min-h-[50vh]",
						children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600" })
					}),
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
				})
			}),
			/* @__PURE__ */ jsx(Footer, {})
		]
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
export { api as i, Helmet as n, useAuthStore as r, render, useGoogleLogin as t };
