/**
 * @module config/logger
 * @description Centralized Winston Logger setup.
 * @relations Used globally across the application for structured logging. Integrated closely with `error.middleware.ts` and `performance.middleware.ts`.
 * @logic
 * - Formats logs as JSON in production for log aggregators (Vercel captures console output).
 * - Formats logs dynamically with color for local development.
 * - In production/serverless, logs only to console (no file transport — serverless has no persistent filesystem).
 * - In development, also logs to files (`logs/error.log`, `logs/combined.log`).
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

const transports: winston.transport[] = [
  // Always log to console (Vercel captures this)
  new winston.transports.Console({
    format: env.NODE_ENV === 'production'
      ? winston.format.combine(winston.format.timestamp(), winston.format.json())
      : winston.format.combine(winston.format.colorize(), logFormat),
  }),
];

// In development, also log to files
if (env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  );
}

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports,
});
