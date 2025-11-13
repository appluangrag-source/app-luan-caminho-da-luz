import React, { useMemo } from 'react';
import { ConversationThread, AIResponseData } from '../types';
import { View } from '../App';
import ProgressChart from './ProgressChart';
import { BookText, Sparkles, HandHeart, HeartHandshake } from 'lucide-react';

interface DashboardProps {
  threads: ConversationThread[];
  onNavigate: (view: View, thread?: ConversationThread) => void;
}

const AIResponseCard = ({ response }: { response: AIResponseData }) => (
  <div className="bg-white/60 dark:bg-stone-800/50 backdrop-blur-md p-6 rounded-xl shadow-lg shadow-gold-200/20 dark:shadow-black/20 border border-white/50 dark:border-stone-700 space-y-4">
    <div className="flex items-center gap-3 text-gold-600 dark:text-gold-400">
      <HeartHandshake size={20} />
      <p className="font-sans italic text-stone-600 dark:text-stone-300">"{response.empathy}"</p>
    </div>
    <div className="space-y-3">
        <p className="text-stone-700 dark:text-stone-300 font-sans leading-relaxed">{response.reflection}</p>
        <div className="bg-gold-100/50 dark:bg-gold-900/20 p-4 rounded-lg border-l-4 border-gold-500">
            <p className="font-serif font-bold text-stone-800 dark:text-stone-200">{response.verse.ref}</p>
            <p className="italic text-stone-600 dark:text-stone-400 mt-1">"{response.verse.text}"</p>
        </div>
        <div className="flex items-start gap-3 text-stone-700 dark:text-stone-300 pt-2">
            <Sparkles size={20} className="text-gold-600 dark:text-gold-400 mt-1 flex-shrink-0" />
            <div>
                <h4 className="font-bold font-sans">Sugestão Prática</h4>
                <p>{response.suggestion}</p>
            </div>
        </div>
         <div className="flex items-start gap-3 text-stone-700 dark:text-stone-300">
            <HandHeart size={20} className="text-gold-600 dark:text-gold-400 mt-1 flex-shrink-0" />
            <div>
                <h4 className="font-bold font-sans">Oração</h4>
                <p className="italic">{response.prayer}</p>
            </div>
        </div>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ threads, onNavigate }) => {
  const latestThread = threads.length > 0 ? threads[0] : null;

  const latestAIResponse = useMemo((): AIResponseData | null => {
      if (!latestThread || latestThread.messages.length < 2) return null;
      try {
          return JSON.parse(latestThread.messages[1].content);
      } catch (e) {
          console.error("Failed to parse latest AI response on dashboard", e);
          return null;
      }
  }, [latestThread]);


  return (
    <div className="space-y-12 animate-fade-in">
      <div className="text-center p-6 bg-white/50 dark:bg-stone-800/40 rounded-xl shadow-lg border border-white/50">
        <h2 className="text-3xl font-serif font-bold text-stone-800 dark:text-stone-200">Seja bem-vindo(a)</h2>
        <p className="text-stone-600 dark:text-stone-400 mt-2 font-sans max-w-xl mx-auto">Este é seu espaço sagrado de reflexão e conexão com o divino. Compartilhe o que está em seu coração e receba palavras de conforto, sabedoria e versículos que iluminarão seu caminho.</p>
        <button
          onClick={() => onNavigate('new-entry')}
          className="mt-6 inline-block bg-gold-500 text-white font-bold py-3 px-8 rounded-full shadow-md hover:bg-gold-600 transition-all transform hover:scale-105"
        >
          Novo Registro
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-serif font-semibold text-stone-700 dark:text-stone-300">Seu Progresso Espiritual</h3>
        <div className="bg-white/60 dark:bg-stone-800/50 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50 dark:border-stone-700">
          {threads.length > 1 ? (
            <ProgressChart entries={threads} />
          ) : (
            <div className="text-center py-10 text-stone-500 dark:text-stone-400">
              <p>Faça mais registros para ver seu progresso ao longo do tempo.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-xl font-serif font-semibold text-stone-700 dark:text-stone-300">Último Devocional</h3>
        {latestThread && latestAIResponse ? (
            <div onClick={() => onNavigate('entry-detail', latestThread)} className="cursor-pointer">
                <AIResponseCard response={latestAIResponse} />
            </div>
        ) : (
          <div className="text-center py-10 text-stone-500 dark:text-stone-400 bg-white/60 dark:bg-stone-800/50 backdrop-blur-md rounded-xl shadow-lg border border-white/50 dark:border-stone-700">
            <BookText className="mx-auto mb-2" size={32} />
            <p>Seu primeiro devocional aparecerá aqui.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;