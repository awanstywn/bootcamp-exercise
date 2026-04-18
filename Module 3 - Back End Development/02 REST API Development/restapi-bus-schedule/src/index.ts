/**
 * Entry point for the Express application.
 * Responsible for initializing the server, registering middleware configurations,
 * routing global endpoints, and finally listening on the specified port.
 */
import express from 'express';
import busRoutes from './routes/busRoutes.js';
import { globalErrorHandler, notFoundHandler } from './middlewares/errorHandlers.js';

const app = express();
const PORT = 3000;

// Built-in Express middleware to parse incoming JSON requests
app.use(express.json());

// Register the main route module for all URLs starting with '/routes'
app.use('/routes', busRoutes);

// Catch any unhandled or non-existent routes (e.g., URL typos)
app.use(notFoundHandler);

// The final global error-handling middleware safety net 
// to prevent the app from instantly crashing on internal bugs.
app.use(globalErrorHandler);

// Start listening for incoming client requests
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});