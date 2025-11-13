
import React, { useState, useEffect, useRef } from 'react';
import { ConversationThread } from '../types';
import { Loader2, Mic } from 'lucide-react';

// Fix: Add type definitions for the Web Speech API to resolve TypeScript errors.
interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionResult extends ArrayLike<SpeechRecognitionAlternative> {
  isFinal: boolean;
}

interface SpeechRecognitionResultList extends ArrayLike<SpeechRecognitionResult> {}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start(): void;
  stop(): void;
}

interface NewEntryProps {
  createConversation: (entryText: string, mood: number) => Promise<ConversationThread | null>;
  onEntryCreated: (thread: ConversationThread) => void;
  isLoading: boolean;
  error: string | null;
}

const moodEmojis = ['😔', '😕', '😐', '🙂', '😄'];

const NewEntry: React.FC<NewEntryProps> = ({ createConversation, onEntryCreated, isLoading, error }) => {
  const [entryText, setEntryText] = useState('');
  const [mood, setMood] = useState(5);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isApiSupported, setIsApiSupported] = useState(false);

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      setIsApiSupported(true);
      const recognition: SpeechRecognition = new SpeechRecognitionAPI();
      recognition.lang = 'pt-BR';
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        setEntryText((prevText) => (prevText ? `${prevText} \n${transcript}` : transcript));
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("Web Speech API is not supported by this browser.");
      setIsApiSupported(false);
    }
  }, []);

  const handleToggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error("Could not start recognition", e);
      }
    }
  };

  const submitEntry = async () => {
    if (entryText.trim() && !isLoading) {
      const newThread = await createConversation(entryText, mood);
      if (newThread) {
        onEntryCreated(newThread);
        setEntryText('');
        setMood(5);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitEntry();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitEntry();
    }
  };

  const getMoodEmoji = (value: number) => {
    if (value <= 2) return moodEmojis[0];
    if (value <= 4) return moodEmojis[1];
    if (value <= 6) return moodEmojis[2];
    if (value <= 8) return moodEmojis[3];
    return moodEmojis[4];
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="text-center">
          <h2 className="text-3xl font-serif font-bold text-stone-800 dark:text-stone-200">Novo Registro</h2>
          <p className="text-stone-600 dark:text-stone-400 mt-2">O que você gostaria de compartilhar hoje?</p>
        </div>

        <div className="relative bg-white/60 dark:bg-stone-800/50 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/50 dark:border-stone-700">
          <textarea
            value={entryText}
            onChange={(e) => setEntryText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Compartilhe aqui o que está em seu coração... ou use o microfone para falar livremente."
            className={`w-full h-48 p-4 bg-stone-50 dark:bg-stone-900/50 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors duration-200 placeholder-stone-400 font-sans ${
              isRecording
                ? 'border-red-400 dark:border-red-500 ring-1 ring-red-400/50 dark:ring-red-500/50'
                : 'border-stone-300 dark:border-stone-600'
            }`}
            required
            disabled={isLoading}
          />
          {isApiSupported && (
            <div className="absolute bottom-9 right-9 flex items-center gap-4">
              {isRecording && (
                  <span className="text-sm font-semibold text-red-500 animate-pulse">
                      Gravando...
                  </span>
              )}
              <button
                type="button"
                onClick={handleToggleRecording}
                className={`p-3 rounded-full transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 dark:focus:ring-offset-stone-800 ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse shadow-lg scale-110'
                    : 'bg-gold-500 text-white hover:bg-gold-600 shadow-md hover:scale-105'
                } disabled:bg-stone-300 dark:disabled:bg-stone-600 disabled:cursor-not-allowed disabled:scale-100`}
                aria-label={isRecording ? 'Parar gravação de voz' : 'Iniciar gravação de voz'}
                disabled={isLoading}
              >
                <Mic size={20} />
              </button>
            </div>
          )}
        </div>

        <div className="bg-white/60 dark:bg-stone-800/50 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/50 dark:border-stone-700">
            <label className="block text-lg font-serif font-semibold text-stone-700 dark:text-stone-300 mb-4 text-center">
                Como você está se sentindo? <span className="text-4xl ml-2">{getMoodEmoji(mood)}</span>
            </label>
            <div className="flex justify-center items-center gap-1 sm:gap-2 flex-wrap">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => setMood(value)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all duration-200 transform hover:scale-110 ${
                            mood === value
                                ? 'bg-gold-500 text-white shadow-lg scale-110'
                                : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-600'
                        }`}
                        disabled={isLoading}
                        aria-pressed={mood === value}
                        aria-label={`Sentimento nível ${value}`}
                    >
                        {value}
                    </button>
                ))}
            </div>
            <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400 mt-3 px-1">
                <span>Muito Triste</span>
                <span>Muito Feliz</span>
            </div>
        </div>

        {error && <p className="text-red-500 text-center bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">{error}</p>}

        <button
          type="submit"
          disabled={isLoading || !entryText.trim()}
          className="w-full flex justify-center items-center bg-gold-500 text-white font-bold py-4 px-6 rounded-full shadow-lg hover:bg-gold-600 transition-all transform hover:scale-105 disabled:bg-stone-300 dark:disabled:bg-stone-600 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={20} />
              Processando...
            </>
          ) : (
            'Buscar Luz na Palavra'
          )}
        </button>
      </form>
    </div>
  );
};

export default NewEntry;
