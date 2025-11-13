import { useState, useEffect, useCallback } from 'react';
import { ConversationThread } from '../types';
import { getSpiritualGuidance, generateTitleForEntry } from '../services/geminiService';

// Key for storing diary entries in localStorage
const DIARY_STORAGE_KEY = 'caminhoDaLuzDiary';

const useDiary = () => {
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load threads from localStorage on initial render
  useEffect(() => {
    try {
      const storedThreads = localStorage.getItem(DIARY_STORAGE_KEY);
      if (storedThreads) {
        setThreads(JSON.parse(storedThreads));
      }
    } catch (err) {
      console.error("Failed to load threads from localStorage:", err);
    }
  }, []);

  // Save threads to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(threads));
    } catch (err) {
      console.error("Failed to save threads to localStorage:", err);
    }
  }, [threads]);


  const createConversation = useCallback(async (entryText: string, mood: number): Promise<ConversationThread | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const [aiResponseJson, title] = await Promise.all([
        getSpiritualGuidance(entryText),
        generateTitleForEntry(entryText)
      ]);

      if (!aiResponseJson) {
        throw new Error("A resposta da IA está vazia.");
      }
      
      const newThread: ConversationThread = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        title: title || "Nova Reflexão",
        mood,
        messages: [
          { role: 'user', content: entryText },
          { role: 'model', content: aiResponseJson },
        ],
      };

      setThreads(prev => [newThread, ...prev]);
      return newThread;

    } catch (err: any) {
      console.error('Error creating new conversation:', err.message || err);
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido ao contatar a IA.";
      setError(`Falha ao obter orientação espiritual: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addOrUpdateVerseNote = useCallback(async (threadId: string, note: string) => {
    setThreads(prevThreads => 
        prevThreads.map(thread => 
            thread.id === threadId ? { ...thread, verse_note: note } : thread
        )
    );
  }, []);

  const deleteConversation = useCallback(async (threadId: string) => {
    setThreads(prevThreads => prevThreads.filter(thread => thread.id !== threadId));
  }, []);

  return { threads, createConversation, isLoading, error, addOrUpdateVerseNote, deleteConversation };
};

export default useDiary;