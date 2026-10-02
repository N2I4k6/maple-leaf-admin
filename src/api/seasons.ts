import { apiClient } from './client';
import type { Season } from '@/types';

interface RawSeason {
  _id: string;
  cartoonId: string;
  number: number;
  title: string;
  description?: string;
  posterUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const normalize = (raw: RawSeason): Season => ({
  id: raw._id,
  cartoonId: raw.cartoonId,
  number: raw.number,
  title: raw.title,
  description: raw.description ?? '',
  posterUrl: raw.posterUrl ?? '',
});

export interface SeasonFormData {
  cartoonId: string;
  number: number;
  title: string;
  description?: string;
  posterUrl?: string;
}

export const seasonsApi = {
  async getByCartoon(cartoonId: string): Promise<Season[]> {
    const { data } = await apiClient.get<RawSeason[]>(`/seasons/by-cartoon/${cartoonId}`);
    return data.map(normalize);
  },

  async getById(id: string): Promise<Season> {
    const { data } = await apiClient.get<RawSeason>(`/seasons/${id}`);
    return normalize(data);
  },

  async create(payload: SeasonFormData): Promise<Season> {
    const { data } = await apiClient.post<RawSeason>('/seasons', payload);
    return normalize(data);
  },

  async update(id: string, payload: Partial<SeasonFormData>): Promise<Season> {
    const { data } = await apiClient.patch<RawSeason>(`/seasons/${id}`, payload);
    return normalize(data);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/seasons/${id}`);
  },
};