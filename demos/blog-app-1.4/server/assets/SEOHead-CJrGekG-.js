import { n as Helmet } from "../entry-server.js";
import { jsx, jsxs } from "react/jsx-runtime";
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
export { SEOHead as t };
