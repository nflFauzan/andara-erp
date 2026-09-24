import api from '../lib/axios';
import { ApiResponse } from '../types/api';
import {
  DocumentType,
  NumberingConfiguration,
  UpdateNumberingRequest,
  PreviewNumberingRequest,
  PreviewNumberingResponse,
} from '../types/numbering';

export const numberingApi = {
  async getAllConfigurations(): Promise<NumberingConfiguration[]> {
    const response = await api.get<ApiResponse<NumberingConfiguration[]>>('/numbering');
    return response.data.data!;
  },

  async getConfiguration(documentType: DocumentType): Promise<NumberingConfiguration> {
    const response = await api.get<ApiResponse<NumberingConfiguration>>(`/numbering/${documentType}`);
    return response.data.data!;
  },

  async updateConfiguration(
    documentType: DocumentType,
    data: UpdateNumberingRequest
  ): Promise<NumberingConfiguration> {
    const response = await api.put<ApiResponse<NumberingConfiguration>>(`/numbering/${documentType}`, data);
    return response.data.data!;
  },

  async previewNumbering(data: PreviewNumberingRequest): Promise<PreviewNumberingResponse> {
    const response = await api.post<ApiResponse<PreviewNumberingResponse>>('/numbering/preview', data);
    return response.data.data!;
  },

  async generateNextNumber(documentType: DocumentType): Promise<string> {
    const response = await api.post<ApiResponse<string>>(`/numbering/generate/${documentType}`);
    return response.data.data!;
  },
};
