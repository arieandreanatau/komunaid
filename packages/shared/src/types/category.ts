export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: CategoryType;
  isActive: boolean;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CategoryType = 'COMMUNITY' | 'EVENT' | 'ORGANIZATION';

export interface CreateCategoryInput {
  name: string;
  description?: string;
  type: CategoryType;
  parentId?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  isActive?: boolean;
  parentId?: string;
}
