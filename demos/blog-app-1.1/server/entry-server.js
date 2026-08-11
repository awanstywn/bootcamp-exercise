import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactDOMServer from "react-dom/server";
import { Link, NavLink, Navigate, Outlet, Route, Routes, StaticRouter, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { jsx, jsxs } from "react/jsx-runtime";
import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { format, formatDistanceToNow } from "date-fns";
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
//#endregion
//#region src/store/authStore.ts
var useAuthStore = create()(persist((set) => ({
	isAuthenticated: false,
	login: () => set({ isAuthenticated: true }),
	logout: () => set({ isAuthenticated: false })
}), { name: "auth-storage" }));
//#endregion
//#region src/components/layout/Header.tsx
var navLinkClass = ({ isActive }) => isActive ? "text-slate-900 border-b-2 border-slate-900 pb-1" : "hover:text-slate-900 pb-1 border-b-2 border-transparent";
function Header() {
	const navigate = useNavigate();
	const location = useLocation();
	const { isAuthenticated, logout } = useAuthStore();
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
						children: [/* @__PURE__ */ jsx(NavLink, {
							to: "/categories",
							className: navLinkClass,
							children: /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-1",
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
							})
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
				}), isAuthenticated ? /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ jsx(Link, {
						to: "/dashboard/posts",
						className: "text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors",
						children: "Dashboard"
					}), /* @__PURE__ */ jsx("button", {
						onClick: () => logout(),
						className: "bg-slate-100 text-slate-700 px-4 py-2 rounded text-sm font-medium hover:bg-slate-200 transition-colors",
						children: "Logout"
					})]
				}) : /* @__PURE__ */ jsx(Link, {
					to: "/login",
					className: "bg-slate-900 text-white px-5 py-2 rounded text-sm font-medium hover:bg-slate-800 transition-colors",
					children: "Login"
				})]
			})
		]
	});
}
//#endregion
//#region src/pages/LoginPage.tsx
function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const login = useAuthStore((state) => state.login);
	const navigate = useNavigate();
	const handleSubmit = (e) => {
		e.preventDefault();
		if (email === "admin@blog.com" && password === "admin123") {
			login();
			navigate("/dashboard/posts");
		} else setError("Invalid email or password. Use admin@blog.com / admin123");
	};
	return /* @__PURE__ */ jsx("div", {
		className: "min-h-screen flex items-center justify-center bg-surface-50 py-12 px-4 sm:px-6 lg:px-8",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow border border-slate-200",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
				className: "mt-2 text-center text-3xl font-extrabold text-slate-900 font-serif",
				children: "Admin Login"
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-2 text-center text-sm text-slate-600",
				children: "Sign in to manage the blog"
			})] }), /* @__PURE__ */ jsxs("form", {
				className: "mt-8 space-y-6",
				onSubmit: handleSubmit,
				children: [
					error && /* @__PURE__ */ jsx("div", {
						className: "bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200",
						children: error
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-4 rounded-md shadow-sm",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							htmlFor: "email-address",
							className: "sr-only",
							children: "Email address"
						}), /* @__PURE__ */ jsx("input", {
							id: "email-address",
							name: "email",
							type: "email",
							autoComplete: "email",
							required: true,
							className: "appearance-none rounded-md relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm",
							placeholder: "Email address",
							value: email,
							onChange: (e) => setEmail(e.target.value)
						})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							htmlFor: "password",
							className: "sr-only",
							children: "Password"
						}), /* @__PURE__ */ jsx("input", {
							id: "password",
							name: "password",
							type: "password",
							autoComplete: "current-password",
							required: true,
							className: "appearance-none rounded-md relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm",
							placeholder: "Password",
							value: password,
							onChange: (e) => setPassword(e.target.value)
						})] })]
					}),
					/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("button", {
						type: "submit",
						className: "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors",
						children: "Sign in"
					}) })
				]
			})]
		})
	});
}
//#endregion
//#region src/components/ProtectedRoute.tsx
function ProtectedRoute() {
	if (!useAuthStore((state) => state.isAuthenticated)) return /* @__PURE__ */ jsx(Navigate, {
		to: "/login",
		replace: true
	});
	return /* @__PURE__ */ jsx(Outlet, {});
}
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
		}).catch(() => {
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
					className: "flex items-center gap-2 mt-auto pt-4 border-t border-slate-50 text-xs font-medium text-slate-500",
					children: [/* @__PURE__ */ jsx("span", { children: "Read more" }), /* @__PURE__ */ jsx("span", { children: "→" })]
				})
			]
		})]
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
* @objective Provide an interface for Admin to write and publish new blog posts.
* @risk Missing form validation can lead to empty or malformed posts being created.
* @relations Route: `/dashboard/posts/new`. Protected by `<ProtectedRoute>`.
* @logic
* - Currently renders a static placeholder indicating pending editor integration (e.g. TipTap or Quill).
*/
function CreatePostPage() {
	const navigate = useNavigate();
	const [categories, setCategories] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
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
		api.get("/content/categories").then((res) => setCategories(res.data)).catch((err) => {
			console.error("Failed to fetch categories:", err);
		});
	}, []);
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
			alert("Failed to create post. Please try again.");
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
							className: "relative group w-full aspect-21/9 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 mb-4",
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
						}) : null, /* @__PURE__ */ jsx("input", {
							type: "url",
							value: formData.coverImageUrl,
							onChange: (e) => setFormData({
								...formData,
								coverImageUrl: e.target.value
							}),
							placeholder: "Paste cover image URL here...",
							className: "w-full border border-slate-200 rounded px-3 py-2 outline-none focus:border-slate-900 text-sm"
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
	const [categories, setCategories] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
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
							className: "relative group w-full aspect-21/9 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 mb-4",
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
						}) : null, /* @__PURE__ */ jsx("input", {
							type: "url",
							value: formData.coverImageUrl,
							onChange: (e) => setFormData({
								...formData,
								coverImageUrl: e.target.value
							}),
							placeholder: "Paste cover image URL here...",
							className: "w-full border border-slate-200 rounded px-3 py-2 outline-none focus:border-slate-900 text-sm"
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
				const [popularRes] = await Promise.all([
					api.get("/content/posts?limit=4&status=PUBLISHED&sort=popular", { signal: controller.signal }),
					api.get("/content/tags", { signal: controller.signal }),
					api.get("/content/categories", { signal: controller.signal })
				]);
				setPopularPosts(popularRes.data.data);
			} catch (error) {
				if (error.name === "CanceledError" || error.name === "AbortError") return;
				console.error("Failed to fetch sidebar data:", error);
			}
		};
		fetchSidebarData();
		return () => controller.abort();
	}, []);
	useEffect(() => {
		const controller = new AbortController();
		const fetchPosts = async () => {
			setIsPostsLoading(true);
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
							children: "Read articles on technology, design, development and more."
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
									children: [/* @__PURE__ */ jsx("h4", {
										className: "font-bold font-serif text-sm leading-snug line-clamp-2 group-hover:text-slate-900 transition-colors",
										children: post.title
									}), /* @__PURE__ */ jsxs("span", {
										className: "text-xs text-slate-500 mt-1",
										children: [
											new Date(post.createdAt).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric"
											}),
											" ",
											"· 5 min read"
										]
									})]
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
//#region src/pages/ManagePostsPage.tsx
function ManagePostsPage() {
	const [posts, setPosts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [postToDelete, setPostToDelete] = useState(null);
	const [isDeleting, setIsDeleting] = useState(false);
	useEffect(() => {
		api.get(`/content/posts?status=ALL`).then((res) => setPosts(res.data.data)).catch(console.error).finally(() => setIsLoading(false));
	}, []);
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
					to: "/",
					className: "text-sm font-medium text-slate-500 hover:text-slate-900 mb-2 inline-block",
					children: "← Back to Home"
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
		setIsLoading(true);
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
				try {
					setHasLiked((await api.get(`/content/posts/${data.id}/likes/status`, { signal: controller.signal })).data.liked);
				} catch (_err) {}
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
	}, [slug]);
	const handleLike = async () => {
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
		} catch (_err) {
			console.error("Error liking post:", _err);
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
	const wordCount = (post.content || post.excerpt || "").trim().split(/\s+/).length;
	const readingTime = Math.max(1, Math.ceil(wordCount / 200));
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
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between border-b border-slate-200 pb-2 mb-6",
							children: [/* @__PURE__ */ jsxs("h3", {
								className: "font-bold text-slate-900 font-serif text-lg",
								children: [post._count?.comments || 0, " Comments"]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2 text-sm text-slate-600",
								children: [
									"Sort by:",
									" ",
									/* @__PURE__ */ jsxs("span", {
										className: "font-medium cursor-pointer flex items-center gap-1",
										children: [
											"Newest",
											" ",
											/* @__PURE__ */ jsx("svg", {
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
											})
										]
									})
								]
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
						children: [
							"Last updated:",
							" ",
							(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
								month: "long",
								day: "numeric",
								year: "numeric"
							})
						]
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
					className: "text-lg text-slate-600 max-w-2xl mx-auto",
					children: "Browse topics to find exactly what you're looking for."
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
						children: [
							"Last updated:",
							" ",
							(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
								month: "long",
								day: "numeric",
								year: "numeric"
							})
						]
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
						path: "/search",
						element: /* @__PURE__ */ jsx(SearchPage, {})
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
						path: "/login",
						element: /* @__PURE__ */ jsx(LoginPage, {})
					}),
					/* @__PURE__ */ jsxs(Route, {
						element: /* @__PURE__ */ jsx(ProtectedRoute, {}),
						children: [
							/* @__PURE__ */ jsx(Route, {
								path: "/dashboard",
								element: /* @__PURE__ */ jsx(Navigate, {
									to: "/dashboard/posts",
									replace: true
								})
							}),
							/* @__PURE__ */ jsx(Route, {
								path: "/dashboard/posts",
								element: /* @__PURE__ */ jsx(ManagePostsPage, {})
							}),
							/* @__PURE__ */ jsx(Route, {
								path: "/dashboard/posts/new",
								element: /* @__PURE__ */ jsx(CreatePostPage, {})
							}),
							/* @__PURE__ */ jsx(Route, {
								path: "/dashboard/posts/edit/:id",
								element: /* @__PURE__ */ jsx(EditPostPage, {})
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
		children: /* @__PURE__ */ jsx(StaticRouter, {
			location: url,
			children: /* @__PURE__ */ jsx(App, {})
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
