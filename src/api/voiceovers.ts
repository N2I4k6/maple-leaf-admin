import { apiClient } from './client';
import type { Voiceover } from '@/types';

interface RawVoiceover {
  _id: string;
  name: string;
  language: string;
  studio?: string;
}

const normalize = (raw: RawVoiceover): Voiceover => ({
  id: raw._id,
  name: raw.name,
  language: raw.language,
  studio: raw.studio,
});

export interface VoiceoverFormData {
  name: string;
  language: string;
  studio?: string;
}

export const voiceoversApi = {
  async getAll(): Promise<Voiceover[]> {
    const { data } = await apiClient.get<RawVoiceover[]>('/voiceovers');
    return data.map(normalize);
  },

  async create(payload: VoiceoverFormData): Promise<Voiceover> {
    const { data } = await apiClient.post<RawVoiceover>('/voiceovers', payload);
    return normalize(data);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/voiceovers/${id}`);
  },
};