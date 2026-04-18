/**
 * Isolated Catch/Validation Modules for API Fallbacks.
 * Dictates unified configurations for API responses when users query non-existent pages (404) or when unexpected application crashes happen (500).
 */
import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

/**
 * Global Interceptor for Internal Server Error (Code 500).
 * Triggered automatically worldwide if we execute the `next(error)` function in any catch() blocks.
 */
export const globalErrorHandler: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    // Chronicle detailed crash logs across the terminal uniquely meant for backend developers
    console.error("Global Error:", err);
    // While simultaneously softening frontend responses down to universally friendly JSON 
    res.status(500).json({
        error: "Internal Server Error"
    });
};

/**
 * Interceptor for the lack of specified Application routes (Code 404).
 * Activated explicitly if the client requests unregistered arbitrary url structures across routes/ (e.g., `/busruteroutes`)
 */
export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({ error: "Routes not found" });
};
