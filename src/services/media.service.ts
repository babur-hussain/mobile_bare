import api from './api';
import { Asset } from 'react-native-image-picker';

export interface MediaItem {
  _id: string;
  s3Url: string;
  mimeType: string;
  sizeBytes: number;
  originalName: string;
}

export const mediaService = {
  async upload(
    asset: Asset,
    onUploadProgress?: (progressEvent: any) => void,
  ): Promise<MediaItem> {
    const formData = new FormData();

    const uri = asset.uri || '';
    const filename = asset.fileName || uri.split('/').pop() || 'upload';
    const type = asset.type || 'image/jpeg';

    formData.append('file', {
      uri,
      name: filename,
      type,
    } as any);

    try {
      const response = await api.post('/api/v1/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000, // 2 min for large files
        onUploadProgress,
      });
      return response.data.data;
    } catch (e: any) {
      const errMsg = e.response?.data?.message || e.message;
      console.error('[MediaService] Upload failed:', errMsg);
      throw e;
    }
  },

  async delete(mediaId: string): Promise<void> {
    await api.delete(`/api/v1/media/${mediaId}`);
  },
};
