/**
 * Validation Security Layer.
 * Dedicated to intercepting malicious/incorrect parameters sent by clients so they don't overburden the service layer.
 */
import type { Request, Response, NextFunction } from 'express';

/**
 * Specific Validation middleware to verify that URL limit/count parameters always manifest as valid positive integer numbers (>= 0).
 */
export const validateQueryParameters = (req: Request, res: Response, next: NextFunction): void => {
    const { count } = req.query;
    
    // Check if the client maliciously or intentionally supplied the `?count=` query in the URL path
    if (count !== undefined) {
        const countNum = Number(count);
        // If the supplied count is an invalid term (e.g., abcde) or negatively valued (<0), forcefully block the request.
        if (isNaN(countNum) || countNum < 0) {
            res.status(400).json({ error: "Invalid count parameter. Must be a positive number." });
            return;
        }
    }
    
    // Deemed safe and fully filtered. Grant the API permission to transition logic over to busController.
    next();
};
