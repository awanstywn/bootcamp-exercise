/**
 * @fileoverview logger.ts
 * @module config/logger.ts
 * @description Handles logic for logger.ts
 */
import winston from 'winston';
import { env } from './env.js';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}] : ${message} `;
    if (metadata.requestId) {
      msg = `${timestamp} [${level}] [${metadata.requestId}] : ${message} `;
    }
    
    // Don't print empty objects
    const metaString = Object.keys(metadata).length > 0 && !metadata.requestId 
      ? JSON.stringify(metadata) 
      : '';
      
    return msg + metaString;
  })
);

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json() // JSON format is best for production log aggregators
  ),
  transports: [
    // Write all errors to error.log
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Write all logs to combined.log
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// If we're not in production, also log to the console with colors
if (env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      logFormat
    )
  }));
}
