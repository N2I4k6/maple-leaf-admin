import { apiClient } from './client';
import type { Cartoon, Paginated } from '@/types';

interface RawCartoon {
  _id: string;
  title: string;
  slug: string;
  description: string;
  rating: number;
  posterUrl: string;
  year: number;
  genres: string[];
  isPublished: boolean;
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

const normalize = (raw: RawCartoon): Cartoon => ({
  id: raw._id,
  title: raw.title,
  slug: raw.slug,
  description: raw.description,
  rating: raw.rating,
  posterUrl: raw.posterUrl,
  year: raw.year,
  genres: raw.genres ?? [],
  isPublished: raw.isPublished,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});

export interface CartoonFormData {
  title: string;
  description: string;
  rating: number;
  posterUrl: string;
  year: number;
  genres: string[];
  isPublished: boolean;
}

export const cartoonsApi = {
  async getAll(params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<Paginated<Cartoon>> {
    const { page = 1, limit = 20, search } = params;
    const { data } = await apiClient.get<PaginatedRaw<RawCartoon>>('/cartoons', {
      params: { page, limit, search: search ?? undefined },
    });
    return {
      items: data.items.map(normalize),
      total: data.total,
      page: data.page,
      limit: data.limit,
      totalPages: data.totalPages,
    };
  },

  async getById(id: string): Promise<Cartoon> {
    const { data } = await apiClient.get<RawCartoon>(`/cartoons/${id}`);
    return normalize(data);
  },

  async create(payload: CartoonFormData): Promise<Cartoon> {
    const { data } = await apiClient.post<RawCartoon>('/cartoons', payload);
    return normalize(data);
  },

  async update(id: string, payload: Partial<CartoonFormData>): Promise<Cartoon> {
    const { data } = await apiClient.patch<RawCartoon>(`/cartoons/${id}`, payload);
    return normalize(data);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/cartoons/${id}`);
  },
};