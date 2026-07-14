/**
 * @fileoverview Master Route Configuration
 * @objective Aggregate all feature-specific routers into a single master router to be mounted by the Express app.
 * @risk None structurally, but ensures clear prefixing for all API endpoints.
 * @relations Imported by `app.ts`. Imports all other routers (`auth.routes.ts`, `content.routes.ts`, etc.).
 * @logic
 * - Mounts feature routers under specific paths (`/auth`, `/content`, `/upload`, `/admin`).
 * - Exposes a simple `/health` endpoint for uptime monitoring and load balancer health checks.
 */
import { Router } from 'express';
import prisma from '../db/prisma.js';
import authRoutes from './auth.routes.js';
import contentRoutes from './content.routes.js';
import adminRoutes from './admin.routes.js';
import uploadRoutes from './upload.routes.js';
import userRoutes from './user.routes.js';
import settingRoutes from './setting.routes.js';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/content', contentRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);
router.use('/users', userRoutes);
router.use('/settings', settingRoutes);

router.get('/health', async (req, res) => {
  try {
    // Lightweight database connectivity check
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (_error) {
    res.status(503).json({ status: 'error', database: 'disconnected', timestamp: new Date().toISOString() });
  }
});

router.get('/sitemap.xml', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    });

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add static routes
    const staticRoutes = ['/', '/search', '/categories', '/tags', '/authors', '/popular'];
    for (const route of staticRoutes) {
      xml += `  <url>\n    <loc>${baseUrl}${route}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }

    // Add dynamic post routes
    for (const post of posts) {
      xml += `  <url>\n    <loc>${baseUrl}/posts/${post.slug}</loc>\n    <lastmod>${post.updatedAt.toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    }

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Sitemap generation error:', error);
    res.status(500).end();
  }
});

export default router;
