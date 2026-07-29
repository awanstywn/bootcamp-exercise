# Blog App 1.3 — Step-by-Step Implementation Guide

This guide is designed to be **beginner-friendly**. It explains *why* we are making each change and provides exact commands and code snippets for you to copy and paste.

We will complete **Task 1 (Caching, Logging, Error Handling)** first. Only after you have tested and confirmed Task 1 works, we will move on to **Task 2 (Article Scheduling & Realtime)**.

---

# TASK 1: Performance, Caching & Error Handling

## Step 1.1: Install New Dependencies
We need `winston` for advanced logging, and `ioredis` to talk to our Redis cache.

Run this command in your terminal (make sure you are inside the `server` directory):
```bash
cd server
npm install winston ioredis
```

## Step 1.2: Environment Variables
We need to tell our app where Redis is, and how long to cache things.

1. Open `server/.env` and add these lines at the bottom:
```env
# ==========================================
# Redis & Caching
# ==========================================
REDIS_URL="redis://localhost:6379"
CACHE_TTL=300
```
*(Also add these to `server/.env.example` so other developers know they need them!)*

2. Open `server/src/config/env.ts` and update the `envSchema` to validate these new variables. Add them right below `PORT`:
```typescript
  // ... existing code ...
  PORT: z.coerce.number().default(3000),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  CACHE_TTL: z.coerce.number().default(300),
  // ... existing code ...
```

## Step 1.3: Setup Winston Logger
Winston is a powerful logger. Instead of just printing to the console, it can format logs nicely and save them to files.

1. Create a new file: `server/src/config/logger.ts`
2. Add the following code:
```typescript
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
```

## Step 1.4: Setup Redis Client
We need a robust way to connect to Redis. If Redis crashes, our app shouldn't crash!

1. Create a new file: `server/src/config/redis.ts`
2. Add the following code:
```typescript
import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

// Create a singleton Redis client
export const redisClient = new Redis(env.REDIS_URL, {
  // Retry strategy: if Redis disconnects, try to reconnect
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  // Don't crash if Redis is unavailable at startup
  maxRetriesPerRequest: 3, 
});

redisClient.on('connect', () => {
  logger.info('Redis connected successfully');
});

redisClient.on('error', (err) => {
  logger.error('Redis Connection Error:', err);
});
```

## Step 1.5: Build the Cache Service
This service makes it easy to save and retrieve JSON data from Redis.

1. Create a new file: `server/src/services/cache.service.ts`
2. Add the following code:
```typescript
import { redisClient } from '../config/redis.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export class CacheService {
  /**
   * Get data from cache
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redisClient.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      logger.error(`Cache GET Error for key ${key}:`, error);
      return null; // Fail-open: if cache fails, pretend it's a cache miss
    }
  }

  /**
   * Save data to cache
   */
  static async set(key: string, data: any, ttlSeconds: number = env.CACHE_TTL): Promise<void> {
    try {
      const stringData = JSON.stringify(data);
      await redisClient.setex(key, ttlSeconds, stringData);
    } catch (error) {
      logger.error(`Cache SET Error for key ${key}:`, error);
    }
  }

  /**
   * Delete a specific key
   */
  static async del(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      logger.error(`Cache DEL Error for key ${key}:`, error);
    }
  }

  /**
   * Delete all keys matching a pattern (e.g. "posts:*")
   */
  static async delByPattern(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (error) {
      logger.error(`Cache delByPattern Error for pattern ${pattern}:`, error);
    }
  }
}
```

## Step 1.6: Improve Error Classes
We need a robust error system so we know exactly *what* went wrong.

1. Open `server/src/utils/errors.ts`
2. **Replace** the entire contents with this:
```typescript
/**
 * Base Application Error
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errorCode: string = 'ERR_INTERNAL',
    public isOperational: boolean = true, // true = expected error (e.g. bad input). false = bug
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message, 'ERR_NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'ERR_UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message, 'ERR_FORBIDDEN');
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details?: any) {
    super(400, message, 'ERR_BAD_REQUEST', true, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(409, message, 'ERR_CONFLICT');
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details: any) {
    super(422, message, 'ERR_VALIDATION', true, details);
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', details?: any) {
    super(500, message, 'ERR_DATABASE', false, details);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = 'External service failed', details?: any) {
    super(502, message, 'ERR_EXTERNAL_SERVICE', false, details);
  }
}
```

## Step 1.7: Centralized Error Handler Middleware
Now we update our error middleware to catch errors from our database (Prisma) and validation (Zod) and translate them into our nice custom errors.

1. Open `server/src/middleware/error.middleware.ts`
2. **Replace** the entire contents with this:
```typescript
import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { 
  AppError, 
  ValidationError, 
  ConflictError, 
  DatabaseError, 
  NotFoundError 
} from '../utils/errors.js';

export const errorMiddleware = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  let error = err;

  // 1. Normalize errors from dependencies
  if (err instanceof ZodError) {
    error = new ValidationError('Invalid input data', err.issues);
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      error = new ConflictError('A record with this value already exists.');
    } else if (err.code === 'P2025') {
      error = new NotFoundError('Record not found.');
    } else {
      error = new DatabaseError(`Prisma Error: ${err.code}`);
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    error = new DatabaseError('Invalid database query.');
  }

  // 2. Format the response
  if (error instanceof AppError) {
    // Expected operational errors
    if (error.isOperational) {
       logger.warn(error.message, { requestId: req.id, code: error.errorCode });
    } else {
       // Programming bugs or external failures
       logger.error(error.message, { requestId: req.id, stack: error.stack, code: error.errorCode });
    }

    return res.status(error.statusCode).json({ 
      success: false,
      error: {
        code: error.errorCode,
        message: error.message,
        details: error.details || null,
        ...(env.NODE_ENV === 'development' && !error.isOperational && { stack: error.stack })
      }
    });
  }

  // 3. Fallback for completely unhandled generic errors
  logger.error('Unhandled Error:', { requestId: req.id, stack: err.stack });
  
  return res.status(500).json({ 
    success: false,
    error: {
      code: 'ERR_INTERNAL_SERVER',
      message: 'Internal Server Error',
      details: null,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }) 
    }
  });
};
```

## Step 1.8: Request ID & Performance Middlewares
These middlewares will measure how long requests take and attach a unique ID to every request.

1. First, we need to update Express types so it knows about our new variables. Open `server/src/types/express.d.ts` and update it:
```typescript
import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      id?: string; // NEW: Request ID
      user?: {
        id: string;
        email?: string;
        role: Role;
      };
    }
  }
}
```

2. Create `server/src/middleware/requestId.middleware.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const reqId = crypto.randomUUID();
  req.id = reqId; // Attach to request for logging
  res.setHeader('X-Request-Id', reqId); // Send back to client
  next();
};
```

3. Create `server/src/middleware/performance.middleware.ts`:
```typescript
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
```

4. Now wire these up in `server/src/app.ts`. Add them near the top, right after `app.use(express.json())`:
```typescript
// ... existing imports ...
import { requestIdMiddleware } from './middleware/requestId.middleware.js';
import { performanceMiddleware } from './middleware/performance.middleware.js';

// ... inside app.ts ...
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ADD THESE TWO LINES:
app.use(requestIdMiddleware);
app.use(performanceMiddleware);

app.use('/api', routes);
// ...
```

## Step 1.9: Build the `asyncHandler` (Bye bye Try-Catch!)
Writing `try { ... } catch (error) { next(error) }` in every single route is annoying. Let's make a utility to do it automatically.

1. Create `server/src/utils/asyncHandler.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

/**
 * Wraps an async route handler to automatically catch errors and pass them to next().
 * This eliminates the need for try-catch blocks in controllers.
 */
export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

## Step 1.10: Update Controllers to use `asyncHandler`
Now we get to clean up our code! I will show you how to do one, and then we'll do the rest via automated edits.

Example of what we are doing to `content.controller.ts`:
```typescript
// OLD WAY:
static async getPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const posts = await ContentService.getPosts(req.query, req.user?.id, req.user?.role);
    res.json(posts);
  } catch (error) {
    next(error);
  }
}

// NEW WAY:
static getPosts = asyncHandler(async (req: Request, res: Response) => {
  const result = await ContentService.getPosts(req.query, req.user?.id, req.user?.role);
  // Tell our performance middleware where the data came from
  res.locals.dataSource = result.source; 
  res.json(result.data);
});
```
*(I will perform these controller updates automatically for you when we start executing.)*

## Step 1.11: Implement Caching in ContentService
Here is where the magic happens. We intercept database calls and check the cache first.

Open `server/src/services/content.service.ts` and modify the methods as follows (I will perform these edits):

```typescript
// Inside getPosts:
const cacheKey = `posts:list:${JSON.stringify(query)}:${userId || 'anon'}`;
const cached = await CacheService.get(cacheKey);
if (cached) {
  logger.info('[Cache] Returning articles from cache');
  return { data: cached, source: 'CACHE' };
}

logger.info('[DB] Fetching articles from database');
// ... perform DB query ...

await CacheService.set(cacheKey, responseData);
return { data: responseData, source: 'DB' };
```
We also need to invalidate (delete) the cache when a post is created, updated, or deleted using `await CacheService.delByPattern('posts:*');`.

---

# TASK 2: Article Scheduling (Queue & Realtime)

*(This section will be executed after Task 1 is verified)*

To allow users to schedule articles, we need a background worker (BullMQ) to watch the clock and publish them. We'll use Socket.io to push a notification to the frontend when it happens.

## Step 2.1: Schema Changes
Run: `npx prisma db pull` and update `schema.prisma`:
```prisma
enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
  SCHEDULED // NEW!
}

model Post {
  // ... existing ...
  scheduledAt DateTime?
  publishedAt DateTime?
  // ...
}
```
Then run: `npx prisma migrate dev --name add_scheduling`

## Step 2.2: BullMQ Setup
BullMQ uses Redis to manage a reliable queue of jobs.

Create `server/src/config/queue.ts`:
```typescript
import { Queue, Worker } from 'bullmq';
import { redisClient } from './redis.js';
import { logger } from './logger.js';
import prisma from '../db/prisma.js';

export const publishQueue = new Queue('publish-article', { connection: redisClient });

// The Worker listens for jobs in the queue
export const publishWorker = new Worker('publish-article', async (job) => {
  const postId = job.data.postId;
  logger.info(`Processing scheduled publish for post: ${postId}`);

  await prisma.post.update({
    where: { id: postId },
    data: { 
      status: 'PUBLISHED',
      publishedAt: new Date(),
    }
  });

  // TODO: Trigger Socket.io event here!

}, { connection: redisClient });
```

## Step 2.3: Socket.io Setup
Create `server/src/config/socket.ts` and hook it up in `server.ts`. When the BullMQ worker finishes, it will call `io.emit('article:published', postData)` to notify all connected React clients.

## Step 2.4: Frontend Integration
In your React app (`client`), we will add:
```javascript
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL);

socket.on('article:published', (post) => {
  toast.success(`New article published: ${post.title}!`);
  // Automatically refresh the article list
});
```

---

# Next Steps
If you approve of this plan, I will begin writing the code for **Task 1** automatically. I will handle the tedious work (like refactoring all controllers to use `asyncHandler`).

Please reply with "Approve" to begin!
