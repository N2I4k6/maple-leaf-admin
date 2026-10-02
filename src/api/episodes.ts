import { apiClient } from './client';
import type { Episode, Voiceover } from '@/types';

interface RawVoiceover {
  _id: string;
  name: string;
  language: string;
  studio?: string;
}

interface RawEpisode {
  _id: string;
  seasonId: string;
  cartoonId: string;
  number: number;
  title: string;
  description?: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  isPublished: boolean;
  voiceoverIds: RawVoiceover[] | string[];
}

const normalizeVoiceover = (raw: RawVoiceover): Voiceover => ({
  id: raw._id,
  name: raw.name,
  language: raw.language,
  studio: raw.studio,
});

const normalize = (raw: RawEpisode): Episode => ({
  id: raw._id,
  seasonId: raw.seasonId,
  cartoonId: raw.cartoonId,
  number: raw.number,
  title: raw.title,
  description: raw.description,
  thumbnailUrl: raw.thumbnailUrl,
  videoUrl: raw.videoUrl,
  duration: raw.duration,
  isPublished: raw.isPublished,
  voiceoverIds: (raw.voiceoverIds ?? []).map((v) =>
    typeof v === 'string' ? { id: v, name: v, language: 'ru' } : normalizeVoiceover(v),
  ),
});

export interface EpisodeFormData {
  seasonId: string;
  cartoonId: string;
  number: number;
  title: string;
  description?: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  isPublished: boolean;
  voiceoverIds: string[];
}

export const episodesApi = {
  async getBySeason(seasonId: string): Promise<Episode[]> {
    const { data } = await apiClient.get<RawEpisode[]>(`/episodes/by-season/${seasonId}`);
    return data.map(normalize);
  },

  async getById(id: string): Promise<Episode> {
    const { data } = await apiClient.get<RawEpisode>(`/episodes/${id}`);
    return normalize(data);
  },

  async create(payload: EpisodeFormData): Promise<Episode> {
    const { data } = await apiClient.post<RawEpisode>('/episodes', payload);
    return normalize(data);
  },

  async update(id: string, payload: Partial<EpisodeFormData>): Promise<Episode> {
    const { data } = await apiClient.patch<RawEpisode>(`/episodes/${id}`, payload);
    return normalize(data);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/episodes/${id}`);
  },
};