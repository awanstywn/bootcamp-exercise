/**
 * @fileoverview Configures and builds the Express application.
 * 
 * Relations:
 * - Consumes: Route modules (`auth.routes`, `category.routes`, `product.routes`) and `errorHandler`.
 * - Used by: `index.ts` to boot the server, and potentially by test suites for integration testing.
 * 
 * Logic:
 * - Initializes Express, applies global middlewares (CORS, JSON body parser).
 * - Mounts API feature routes under the `/api` prefix.
 * - Attaches the global error handling middleware at the very end of the request pipeline.
 */
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import productRoutes from './routes/product.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Global Error Handler
app.use(errorHandler);

export default app;
