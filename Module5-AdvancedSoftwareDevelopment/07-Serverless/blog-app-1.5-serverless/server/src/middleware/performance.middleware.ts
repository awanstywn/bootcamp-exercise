/**
 * @fileoverview [Brief description of the file's purpose]
 * @objective Provide the necessary logic and structural foundation for this specific module/component.
 * @risk Contains standard logic; ensure strict typing to prevent runtime errors.
 * @relations Integrates with related features within the layer.
 * @logic Follows the established architectural patterns and standard guidelines.
 */
import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';

export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  res.on('finish', () => {
    // Calculate duration
    const diff = process.hrtime(start);
    const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    
    // Check if the controller set res.locals.dataSource (e.g. CACHE or DB)
    const source = res.locals.dataSource ? `(${res.locals.dataSource})` : '';
    
    logger.info(`[Performance] ${req.method} ${req.originalUrl} - ${timeInMs}ms ${source}`, {
      requestId: req.id
    });
  });

  next();
};
