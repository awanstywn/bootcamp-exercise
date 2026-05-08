// packages/shared/src/index.ts
// Barrel export file for the shared package.
// It exposes all schemas and types so they can be easily imported by 
// both the frontend and backend apps.

// Schemas
export { registerSchema, loginSchema } from './schemas/auth.schema';
export type { RegisterInput, LoginInput } from './schemas/auth.schema';

export { createArticleSchema, updateArticleSchema } from './schemas/article.schema';
export type { CreateArticleInput, UpdateArticleInput } from './schemas/article.schema';

export { updateUserSchema } from './schemas/user.schema';
export type { UpdateUserInput } from './schemas/user.schema';

// Types
export type { User } from './types/user.types';
export type { Article, ArticleAuthor } from './types/article.types';
export type { AuthResponse } from './types/auth.types';
export type { ApiErrorResponse } from './types/api.types';
