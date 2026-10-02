import { apiClient } from './client';
import type { NewsItem, Paginated } from '@/types';

interface RawNews {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverUrl: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedRaw<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const normalize = (raw: RawNews): NewsItem => ({
  id: raw._id,
  title: raw.title,
  slug: raw.slug,
  excerpt: raw.excerpt,
  content: raw.content,
  coverUrl: raw.coverUrl,
  isPublished: raw.isPublished,
  publishedAt: raw.publishedAt,
  createdAt: raw.createdAt,
});

export interface NewsFormData {
  title: string;
  excerpt: string;
  content: string;
  coverUrl: string;
  isPublished: boolean;
}

export const newsApi = {
  async getAll(params: { page?: number; limit?: number } = {}): Promise<Paginated<NewsItem>> {
    const { page = 1, limit = 20 } = params;
    const { data } = await apiClient.get<PaginatedRaw<RawNews>>('/news', {
      params: { page, limit },
    });
    return {
      items: data.items.map(normalize),
      total: data.total,
      page: data.page,
      limit: data.limit,
      totalPages: data.totalPages,
    };
  },

  async create(payload: NewsFormData): Promise<NewsItem> {
    const { data } = await apiClient.post<RawNews>('/news', payload);
    return normalize(data);
  },

  async update(id: string, payload: Partial<NewsFormData>): Promise<NewsItem> {
    const { data } = await apiClient.patch<RawNews>(`/news/${id}`, payload);
    return normalize(data);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/news/${id}`);
  },
};