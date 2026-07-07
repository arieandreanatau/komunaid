export interface Post {
  id: string;
  communityId: string;
  authorId: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  status: PostStatus;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    username: string;
  };
}

export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'FLAGGED';

export interface CreatePostInput {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  status?: PostStatus;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  status?: PostStatus;
}
