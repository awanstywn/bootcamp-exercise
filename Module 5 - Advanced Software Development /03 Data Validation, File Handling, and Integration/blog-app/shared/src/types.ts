export interface UserDTO {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'SUBSCRIBER';
  bio?: string;
  avatarUrl?: string;
}

export interface PostDTO {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  authorId: string;
  categoryId?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}
