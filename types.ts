export interface AIResponseData {
  empathy: string;
  reflection: string;
  verse: {
    ref: string;
    text: string;
  };
  suggestion: string;
  prayer: string;
}

export interface Message {
  role: 'user' | 'model';
  content: string; // The first model message will have a JSON string of AIResponseData
}

export interface ConversationThread {
  id: string; // UUID from crypto.randomUUID()
  title: string;
  created_at: string;
  mood: number;
  messages: Message[];
  verse_note?: string;
  user_id?: string; // No longer used, but kept for type safety
}

export interface DailyVerse {
  ref: string;
  text: string;
  date: string;
}

export interface FaithChallenge {
  text: string;
  date: string; // YYYY-MM-DD
}

export interface WeeklyInsight {
    text: string;
    weekStartDate: string; // YYYY-MM-DD
}

export interface ChallengeCompletion {
  date: string; // YYYY-MM-DD
  reflection: string;
}

export interface UserProfile {
    id: string;
    username: string;
    gender: 'male' | 'female' | 'other' | null;
}