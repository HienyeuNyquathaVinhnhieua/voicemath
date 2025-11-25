export enum AnalysisStatus {
  IDLE = 'IDLE',
  PREPARING = 'PREPARING', // Converting video to base64
  ANALYZING = 'ANALYZING', // Waiting for AI
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface AnalysisRequest {
  videoFiles: File[];
  additionalText: string;
}

export interface AnalysisResult {
  markdown: string;
}

export interface FeatureSection {
  title: string;
  items: string[];
}