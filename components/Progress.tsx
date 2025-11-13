

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ConversationThread, FaithChallenge, WeeklyInsight, ChallengeCompletion } from '../types';
import { View } from '../App';
import { generateFaithChallenge, generateWeeklyInsight } from '../services/geminiService';
import ProgressChart from './ProgressChart';
import { Loader2, Zap, BrainCircuit, Sun, CloudRain, Rainbow, Leaf, Moon, CheckCircle2, Award, Sparkles } from 'lucide-react';

interface ProgressProps {
  threads: ConversationThread[];
  onNavigate: (view: View, thread?: ConversationThread) => void;
}

const getToday = () => new Date().toISOString().split('T')[0];

const FaithChallengeComponent: React.FC<{
    challenge: FaithChallenge | null;
    completion: ChallengeCompletion | null;
    onComplete: (reflection: string) => void;
    lightPoints: number;
}> = ({ challenge, completion, onComplete, lightPoints }) => {
    const [isReflecting, setIsReflecting] = useState(false);
    const [reflectionText, setReflectionText] = useState('');

    if (!challenge) return null;

    const handleStartReflection = () => {
        setIsReflecting(true);
    };

    const handleSaveReflection = () => {
        if (reflectionText.trim()) {
            onComplete(reflectionText);
            setIsReflecting(false);
        }
    };

    return (
        <div className="bg-gradient-to-tr from-gold-50 to-lilac-50 dark:from-stone-800 dark:to-stone-800/80 p-6 rounded-2xl shadow-xl shadow-gold-200/40 dark:shadow-black/30 border border-white/80 dark:border-stone-700">
            <div className="flex items-start gap-4">
                <Zap className="text-gold-500 flex-shrink-0 mt-1" size={24} />
                <div>
                    <h3 className="font-serif font-bold text-lg text-stone-800 dark:text-stone-200">Desafio de Fé do Dia</h3>
                    <p className="text-stone-600 dark:text-stone-400 mt-2 font-sans">{challenge.text}</p>
                    
                    {completion ? (
                        <div className="mt-4 p-4 bg-green-100/50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                            <div className="flex items-center gap-2 font-bold text-green-700 dark:text-green-400">
                                <CheckCircle2 size={18}/>
                                <span>Desafio Concluído!</span>
                            </div>
                            <p className="mt-2 text-stone-600 dark:text-stone-300 italic">Sua reflexão: "{completion.reflection}"</p>
                        </div>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {!isReflecting ? (
                                <button 
                                    onClick={handleStartReflection}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gold-500 text-white font-bold py-2 px-5 rounded-full shadow-md hover:bg-gold-600 transition-all transform hover:scale-105"
                                >
                                    Registrar Progresso
                                </button>
                            ) : (
                                <div className="space-y-3 animate-fade-in">
                                    <textarea
                                        value={reflectionText}
                                        onChange={(e) => setReflectionText(e.target.value)}
                                        placeholder="Como foi realizar este desafio? Escreva uma breve reflexão."
                                        className="w-full h-24 p-3 bg-stone-50 dark:bg-stone-900/50 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-gold-500 transition-colors"
                                    />
                                    <button
                                        onClick={handleSaveReflection}
                                        disabled={!reflectionText.trim()}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-2 px-5 rounded-full shadow-md hover:bg-green-700 transition-all transform hover:scale-105 disabled:bg-stone-400 disabled:scale-100"
                                    >
                                        Salvar Reflexão
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="mt-4 flex items-center gap-2 text-yellow-500 dark:text-yellow-400 font-bold text-lg animate-pulse">
                        <Sparkles size={20} />
                        <span>{lightPoints} Luz de Fé ✨</span>
                    </div>
                </div>
            </div>
        </div>
    );
};


const SpiritualTimelineComponent: React.FC<{threads: ConversationThread[], onNavigate: (view: View, thread: ConversationThread) => void}> = ({ threads, onNavigate }) => {
    const getMoodIcon = (mood: number) => {
        if (mood >= 9) return { Icon: Sun, color: "text-yellow-500", label: "Gratidão" };
        if (mood >= 7) return { Icon: Rainbow, color: "text-pink-500", label: "Fé" };
        if (mood >= 5) return { Icon: Leaf, color: "text-green-500", label: "Esperança" };
        if (mood >= 3) return { Icon: Moon, color: "text-indigo-500", label: "Descanso" };
        return { Icon: CloudRain, color: "text-sky-600", label: "Luta" };
    };

    return (
        <div className="space-y-4">
            <h3 className="text-2xl font-serif font-semibold text-stone-700 dark:text-stone-300">Linha do Tempo Espiritual</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto p-1 pr-3">
                 {threads.length > 0 ? threads.map(thread => {
                    const { Icon, color, label } = getMoodIcon(thread.mood);
                    return (
                        <div key={thread.id} onClick={() => onNavigate('entry-detail', thread)} className="flex items-center gap-4 p-3 bg-white/60 dark:bg-stone-800/50 rounded-lg cursor-pointer hover:bg-gold-50 dark:hover:bg-stone-700/70 transition-colors duration-200">
                            <div className={`p-2 rounded-full bg-white dark:bg-stone-700 ${color}`}>
                                <Icon size={24}/>
                            </div>
                            <div className="flex-grow">
                                <p className="font-sans font-semibold text-stone-700 dark:text-stone-300">{thread.title}</p>
                                <p className="text-xs text-stone-500 dark:text-stone-400">{new Date(thread.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })} - Sentimento: {label}</p>
                            </div>
                        </div>
                    );
                }) : (
                    <p className="text-center text-stone-500 dark:text-stone-400 py-8">Sua linha do tempo aparecerá aqui quando começar a fazer registros.</p>
                )}
            </div>
        </div>
    );
};


const Progress: React.FC<ProgressProps> = ({ threads, onNavigate }) => {
    const [insight, setInsight] = useState<WeeklyInsight | null>(null);
    const [challenge, setChallenge] = useState<FaithChallenge | null>(null);
    // Note: Completions and points would need to be moved to the database in a real scenario
    const [completions, setCompletions] = useState<ChallengeCompletion[]>([]); 
    const [lightPoints, setLightPoints] = useState(0);
    const [isLoading, setIsLoading] = useState({insight: false, challenge: false});
    
    const todaysCompletion = useMemo(() => {
        return completions.find(c => c.date === getToday()) || null;
    }, [completions]);

    const handleChallengeCompleted = useCallback((reflection: string) => {
        const newCompletion: ChallengeCompletion = { date: getToday(), reflection };
        const wasAlreadyCompletedToday = !!todaysCompletion;
        const updatedCompletions = [...completions.filter(c => c.date !== getToday()), newCompletion];
        setCompletions(updatedCompletions);
        
        if (!wasAlreadyCompletedToday) {
            setLightPoints(prev => prev + 1);
        }
    }, [completions, todaysCompletion]);


    useEffect(() => {
        const fetchInsight = async () => {
            setIsLoading(prev => ({...prev, insight: true}));
            const today = new Date();
            const oneWeekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
            
            const weeklyEntries = threads.filter(t => new Date(t.created_at) >= oneWeekAgo);
            if (weeklyEntries.length > 0) {
                const weeklyText = weeklyEntries.map(t => t.messages[0].content).join('\n---\n');
                const newInsightText = await generateWeeklyInsight(weeklyText);
                const newInsight = { text: newInsightText, weekStartDate: oneWeekAgo.toISOString().split('T')[0] };
                setInsight(newInsight);
            }
             setIsLoading(prev => ({...prev, insight: false}));
        };

        const fetchChallenge = async () => {
             setIsLoading(prev => ({...prev, challenge: true}));
             if (threads.length > 0) {
                const lastEntryText = threads[0].messages[0].content;
                const newChallengeText = await generateFaithChallenge(lastEntryText);
                const newChallenge = { text: newChallengeText, date: getToday() };
                setChallenge(newChallenge);
             }
             setIsLoading(prev => ({...prev, challenge: false}));
        };
        
        fetchInsight();
        fetchChallenge();

    }, [threads]);

    const renderLoader = (text: string) => (
        <div className="flex items-center justify-center gap-2 text-stone-500 dark:text-stone-400 p-4">
            <Loader2 className="animate-spin" size={16} />
            <span>{text}</span>
        </div>
    );

    return (
        <div className="space-y-10 animate-fade-in">
            <header className="text-center">
                <h2 className="text-3xl font-serif font-bold text-stone-800 dark:text-stone-200">Minha Jornada Espiritual</h2>
                <p className="text-stone-600 dark:text-stone-400 mt-2 font-sans">Acompanhe seu crescimento, desafios e as bênçãos de cada dia.</p>
            </header>
            
            <div className="bg-white/60 dark:bg-stone-800/50 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/50 dark:border-stone-700">
                {isLoading.insight ? renderLoader("Gerando insight semanal...") : (
                    insight ? (
                        <div className="flex items-center gap-4 text-center">
                            <BrainCircuit className="text-violet-500" size={40} />
                            <p className="font-sans italic text-stone-700 dark:text-stone-300">"{insight.text}"</p>
                        </div>
                    ) : <p className="text-center text-stone-500">Faça registros para receber seu insight semanal.</p>
                )}
            </div>

            {isLoading.challenge ? renderLoader("Preparando seu desafio de fé...") : (
                threads.length > 0 && <FaithChallengeComponent challenge={challenge} completion={todaysCompletion} onComplete={handleChallengeCompleted} lightPoints={lightPoints} />
            )}

            <div className="bg-white/60 dark:bg-stone-800/50 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/50 dark:border-stone-700">
                <SpiritualTimelineComponent threads={threads} onNavigate={onNavigate} />
            </div>

            <div className="bg-white/60 dark:bg-stone-800/50 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50 dark:border-stone-700">
                 <h3 className="text-2xl font-serif font-semibold text-stone-700 dark:text-stone-300 text-center mb-4">Gráfico Emocional Espiritual</h3>
                 {threads.length > 1 ? (
                    <ProgressChart entries={threads} />
                 ) : (
                    <div className="text-center py-10 text-stone-500 dark:text-stone-400">
                    <p>Faça mais registros para ver seu progresso ao longo do tempo.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Progress;