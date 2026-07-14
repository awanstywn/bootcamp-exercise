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
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

export default function SEOHead({
  title,
  description = 'A modern full-stack blog platform.',
  image = '/og-image.jpg', // Placeholder
  url,
  type = 'website',
}: SEOHeadProps) {
  const siteName = 'Execora';
  const fullTitle = `${title} | ${siteName}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {url && <link rel="canonical" href={url} />}

      {/* Open Graph / Facebook */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content={type} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {url && <meta name="twitter:url" content={url} />}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
