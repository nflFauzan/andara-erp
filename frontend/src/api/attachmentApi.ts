import api from '../lib/axios';
import { ApiResponse } from '../types/api';
import { Attachment } from '../types/attachment';

export const attachmentApi = {
  async getAttachments(referenceType: string, referenceId: number): Promise<Attachment[]> {
    const response = await api.get<ApiResponse<Attachment[]>>(
      `/attachments/reference/${referenceType}/${referenceId}`
    );
    return response.data.data || [];
  },

  async uploadAttachment(
    file: File,
    referenceType: string,
    referenceId: number
  ): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('referenceType', referenceType);
    formData.append('referenceId', referenceId.toString());

    const response = await api.post<ApiResponse<Attachment>>('/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data!;
  },

  async deleteAttachment(id: number): Promise<void> {
    await api.delete(`/attachments/${id}`);
  },

  getDownloadUrl(id: number): string {
    return `/api/attachments/${id}/download`;
  },
};
