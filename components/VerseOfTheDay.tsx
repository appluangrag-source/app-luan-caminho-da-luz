import React, { useState, useEffect, useRef } from 'react';
import { DailyVerse } from '../types';
import { generateSpeech } from '../services/geminiService';
import { getVerseOfTheDay } from '../services/geminiService';
import { BookOpen, Share2, Play, Pause, Volume2, Loader2 } from 'lucide-react';


// --- Audio Helper Functions ---
function decodeBase64(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodePcmData(
    data: Uint8Array,
    ctx: AudioContext,
): Promise<AudioBuffer> {
    const sampleRate = 24000; // Gemini TTS sample rate
    const numChannels = 1;
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
}

const availableVoices = [
    { name: 'Voz Serena', id: 'Kore' },
    { name: 'Voz Acolhedora', id: 'Puck' },
];

const VerseOfTheDay: React.FC = () => {
    const [verse, setVerse] = useState<Omit<DailyVerse, 'date'> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedVoice, setSelectedVoice] = useState(availableVoices[0].id);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const isShareSupported = typeof navigator.share === 'function';

    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    useEffect(() => {
        const fetchVerse = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const verseData = await getVerseOfTheDay();
                setVerse(verseData);
            } catch (err) {
                console.error(err);
                setError("Não foi possível carregar o versículo do dia. Por favor, tente novamente mais tarde.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchVerse();
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioSourceRef.current) {
                audioSourceRef.current.stop();
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, []);

    const stopPlayback = () => {
        if (audioSourceRef.current) {
            audioSourceRef.current.onended = null;
            audioSourceRef.current.stop();
            audioSourceRef.current = null;
        }
        setIsPlaying(false);
    };

    const playAudio = async (voiceId: string) => {
        if (!verse) return;
        stopPlayback();
        setIsLoadingAudio(true);
        
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        const base64Audio = await generateSpeech(verse.text, voiceId);
        
        if (!base64Audio || !audioContextRef.current) {
            console.error("Failed to generate or decode audio.");
            setIsLoadingAudio(false);
            return;
        }
        
        try {
            const pcmData = decodeBase64(base64Audio);
            const audioBuffer = await decodePcmData(pcmData, audioContextRef.current);
            
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => {
                setIsPlaying(false);
                audioSourceRef.current = null;
            };
            source.start();
            
            audioSourceRef.current = source;
            setIsPlaying(true);
        } catch (error) {
            console.error("Error playing audio:", error);
        } finally {
            setIsLoadingAudio(false);
        }
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            stopPlayback();
        } else {
            playAudio(selectedVoice);
        }
    };

    const handleVoiceChange = (voiceId: string) => {
        setSelectedVoice(voiceId);
        if (isPlaying || isLoadingAudio) {
            playAudio(voiceId);
        }
    };

    const handleShare = async () => {
        if (!verse || !isShareSupported) return;
        try {
            await navigator.share({
                title: 'Versículo do Dia',
                text: `"${verse.text}" - ${verse.ref}\n\nEnviado por: Caminho da Luz`,
            });
        } catch (err) {
            console.error('Falha ao compartilhar:', err);
        }
    };
    
    const renderSkeleton = () => (
        <div className="bg-white/60 dark:bg-stone-800/50 backdrop-blur-md p-8 rounded-xl shadow-lg border border-white/50 dark:border-stone-700 animate-pulse">
            <div className="h-6 bg-stone-300 dark:bg-stone-700 rounded w-1/3 mx-auto mb-8"></div>
            <div className="space-y-4">
                <div className="h-5 bg-stone-300 dark:bg-stone-600 rounded w-full"></div>
                <div className="h-5 bg-stone-300 dark:bg-stone-600 rounded w-full"></div>
                <div className="h-5 bg-stone-300 dark:bg-stone-600 rounded w-3/4"></div>
            </div>
            <div className="h-5 bg-stone-300 dark:bg-stone-700 rounded w-1/4 mx-auto mt-8"></div>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <header className="text-center">
                <h2 className="text-3xl font-serif font-bold text-stone-800 dark:text-stone-200">
                  Versículo do Dia
                </h2>
                <p className="text-stone-500 dark:text-stone-400 mt-1 font-sans">
                  Uma palavra de inspiração para sua jornada.
                </p>
            </header>

            {isLoading ? (
                renderSkeleton()
            ) : error ? (
                <div className="text-center text-red-500 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg">{error}</div>
            ) : verse && (
                <div className="bg-gradient-to-tr from-lilac-50 to-white dark:from-stone-800 dark:to-stone-800/80 p-8 rounded-2xl shadow-2xl shadow-gold-200/50 dark:shadow-black/30 border border-white/80 dark:border-stone-700 text-center flex flex-col items-center">
                    <BookOpen size={32} className="text-gold-500 mb-4" />
                    
                    <blockquote className="max-w-prose">
                        <p className="text-2xl font-serif text-stone-800 dark:text-stone-200 leading-relaxed italic">
                            "{verse.text}"
                        </p>
                    </blockquote>
                    
                    <cite className="block font-sans font-bold text-gold-600 dark:text-gold-400 mt-6 text-lg">
                        {verse.ref}
                    </cite>

                    <div className="mt-8 pt-6 w-full border-t border-gold-300/50 dark:border-stone-700 flex flex-col sm:flex-row items-center justify-center gap-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handlePlayPause}
                                disabled={isLoadingAudio}
                                className="p-3 w-12 h-12 flex items-center justify-center bg-gold-500 text-white rounded-full shadow-md hover:bg-gold-600 transition-all transform hover:scale-105 disabled:bg-stone-400 disabled:scale-100"
                                aria-label={isPlaying ? 'Pausar leitura' : 'Ouvir versículo'}
                            >
                                {isLoadingAudio ? <Loader2 size={20} className="animate-spin" /> : (isPlaying ? <Pause size={20} /> : <Play size={20} />)}
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-stone-600 dark:text-stone-400"><Volume2 size={16}/></span>
                                {availableVoices.map((voice) => (
                                    <button
                                        key={voice.id}
                                        onClick={() => handleVoiceChange(voice.id)}
                                        className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedVoice === voice.id ? 'bg-gold-500 text-white font-bold' : 'bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600'}`}
                                    >
                                        {voice.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {isShareSupported && (
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 py-2 px-4 bg-white/80 dark:bg-stone-700/80 rounded-full shadow-md hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
                                aria-label="Compartilhar versículo"
                            >
                                <Share2 size={18} />
                                <span className="text-sm font-semibold">Compartilhar</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerseOfTheDay;