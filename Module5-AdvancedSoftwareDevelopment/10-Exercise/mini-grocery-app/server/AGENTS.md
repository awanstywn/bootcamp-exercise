# Agent Rules for Mini Grocery App

When working on this project, please adhere to the following guidelines:

## Architecture and Guidelines

1. **Backend-Only Focus**
   - This project is strictly a backend API (Express + TypeScript). Do not write frontend code (React, Vue, etc.) or add frontend dependencies unless specifically instructed to add a new frontend workspace.

2. **Standardized Responses**
   - All API endpoints must return a standardized JSON response using the `ApiResponse` type defined in `server/src/types/api.ts`:
     ```json
     {
       "success": boolean,
       "message": string,
       "data"?: any
     }
     ```
   - Do not use custom error formats in controllers. Let the global `errorMiddleware` handle error formatting by throwing subclasses of `AppError` (e.g., `BadRequestError`, `NotFoundError`).

3. **Validation**
   - Always use Zod schemas for request validation (`req.body`, `req.query`, `req.params`). Place new schemas in `server/src/validators/`.

4. **File Documentation (JSDoc)**
   - Every `.ts` file in `server/src/` should have a standardized JSDoc block at the top indicating the file's purpose:
     ```typescript
     /**
      * @fileoverview [File Name]
      * @module [Module Path]
      * @description [Brief description of logic]
      */
     ```

5. **Simplicity**
   - Avoid overengineering. Do not introduce Redis, BullMQ, Cloudinary, or complex cloud services unless strictly requested. 
   - File uploads should remain localized to the `server/uploads/` directory via Multer.
   - Rate limiting should use in-memory stores.

6. **Database (Prisma + PostgreSQL)**
   - Use Prisma transactions (`prisma.$transaction`) for operations that span multiple tables or require consistency (like checking out an order or cancelling an order).

7. **Workspace Commands**
   - When running scripts (e.g., `npm run dev`, `npx prisma generate`), either run them from the root via the provided npm scripts or navigate into the `server/` directory first. 
