export interface ScriptSegment {
  id: number;
  cueNumber: number;
  timeRange: string;
  startSeconds: number;
  endSeconds: number;
  title: string;
  category: string;
  text: string;
  notes: string;
  audioBase64?: string;
  audioUrl?: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'female' | 'male';
  tone: string;
  description: string;
  isRecommended?: boolean;
}

export interface GenerationStatus {
  isGenerating: boolean;
  step: string;
  progress: number;
  error?: string | null;
}
