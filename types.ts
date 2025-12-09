export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  isError?: boolean;
  timestamp: number;
}

export interface ChallengeCriteria {
  description: string;
  validationPrompt: string; // The system instruction used to check if the user passed
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  theory: string;
  challenge: {
    instruction: string;
    criteria: ChallengeCriteria;
    initialPrompt?: string; // Optional starter text for the user
  };
}

export interface EvaluationResult {
  passed: boolean;
  feedback: string;
  score: number; // 0-100
}

export enum AppState {
  LESSON = 'LESSON',
  FREE_PLAY = 'FREE_PLAY'
}
