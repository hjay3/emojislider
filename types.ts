export interface LogEntry {
  id: string;
  timestamp: string;
  source: 'SYSTEM' | 'USER' | 'GEMINI';
  message: string;
  data?: any;
}

export interface MorphState {
  value: number; // 1.0 to 10.0
  label: string;
  active: boolean;
}

export interface GeminiResponse {
  value: number;
  reasoning: string;
  mood_vector: string;
}
