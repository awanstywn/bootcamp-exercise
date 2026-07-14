/**
 * @fileoverview Shared TypeScript Interfaces
 * @objective Provide common Data Transfer Objects (DTOs) and types used by both the Client and Server codebases.
 * @risk Desynchronization between Prisma DB schema and these types can cause silent UI bugs or build failures.
 * @relations Imported by React components (client) and Express controllers (server).
 * @logic
 * - `UserDTO`: Represents a sanitized user object (no passwords).
 * - `PostDTO`: Represents a blog post object for frontend consumption.
 */

export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface UserDTO {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly bio?: string;
  readonly avatarUrl?: string;
}

export interface PostDTO {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly excerpt?: string;
  readonly content: string;
  readonly status: PostStatus;
  readonly authorId: string;
  readonly author?: Pick<UserDTO, 'id' | 'name' | 'avatarUrl' | 'bio'>;
  readonly categoryId?: string;
  readonly metaTitle?: string;
  readonly metaDescription?: string;
  readonly coverImageUrl?: string;
  readonly viewCount: number;
  readonly category?: { id: string; name: string; slug: string };
  readonly tags?: Array<{ id: string; name: string; slug: string }>;
  readonly _count?: { comments: number; likes: number };
  /** @description ISO-8601 formatted string */
  readonly createdAt: string;
  /** @description ISO-8601 formatted string */
  readonly updatedAt: string;
}
