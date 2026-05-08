/**
 * @fileoverview Main application entry point.
 * @objective To bootstrap the Express server, configure middleware, set up routing, and handle global errors.
 * @logic 
 * 1. Initializes the Express application.
 * 2. Applies global middleware (CORS, JSON body parsing, URL-encoded parsing).
 * 3. Mounts route handlers for authentication (`/api/auth`) and tasks (`/api/tasks`).
 * 4. Provides a `/health` endpoint for server health checks.
 * 5. Registers a global error handler to format unhandled exceptions consistently.
 * 6. Starts the server listening on the specified PORT.
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
