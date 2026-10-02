import { apiClient } from './client';

export interface UploadResponse {
  url: string;
  size: number;
}

export const uploadsApi = {
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post<UploadResponse>('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return data;
  },

  async uploadVideo(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post<UploadResponse>('/uploads/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    });
    return data;
  },
};