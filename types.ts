
export enum Language {
  ENGLISH = 'English',
  TAMIL = 'Tamil',
  HINDI = 'Hindi',
  MALAYALAM = 'Malayalam',
  TELUGU = 'Telugu'
}

export type Classification = 'AI_GENERATED' | 'HUMAN_GENERATED';

export interface AnalysisResult {
  status: 'success' | 'error';
  language: string;
  classification: Classification;
  confidenceScore: number;
  explanation: string;
  artifacts?: string[];
}

export interface AudioFile {
  name: string;
  base64: string;
  mimeType: string;
  size: number;
}
