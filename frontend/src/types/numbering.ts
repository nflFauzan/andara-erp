export type DocumentType = 'PENAWARAN' | 'FAKTUR' | 'PEMBAYARAN' | 'KWITANSI';

export type ResetPeriod = 'NEVER' | 'YEARLY' | 'MONTHLY';

export interface NumberingConfiguration {
  id: number;
  documentType: DocumentType;
  prefix: string;
  suffix?: string;
  counterDigits: number;
  currentCounter: number;
  currentPeriod?: string;
  resetPeriod: ResetPeriod;
  formatPattern: string;
  previewNumber: string;
  updatedAt?: string;
}

export interface UpdateNumberingRequest {
  prefix: string;
  suffix?: string;
  counterDigits: number;
  resetPeriod: ResetPeriod;
  formatPattern: string;
}

export interface PreviewNumberingRequest {
  formatPattern: string;
  prefix: string;
  suffix?: string;
  counterDigits?: number;
}

export interface PreviewNumberingResponse {
  previewNumber: string;
  formatPattern: string;
  sampleCounter: number;
}
