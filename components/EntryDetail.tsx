import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ConversationThread, AIResponseData } from '../types';
import { Sparkles, HandHeart, HeartHandshake, Trash2, Play, Pause, Volume2, Loader2 } from 'lucide-react';
import { generateSpeech } from '../services/geminiService';

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

interface EntryDetailProps {
  thread: ConversationThread;
  onUpdateNote: (threadId: string, note: string) => void;
  onDelete: (threadId: string) => void;
}

const AIResponseCard = ({ response }: { response: AIResponseData }) => {
    const [selectedVoice, setSelectedVoice] = useState(availableVoices[0].id);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

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
            audioSourceRef.current.onended = null; // Prevent onended from firing on manual stop
            audioSourceRef.current.stop();
            audioSourceRef.current = null;
        }
        setIsPlaying(false);
    };

    const playAudio = async (voiceId: string) => {
        stopPlayback();
        setIsLoadingAudio(true);
        
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        const textToRead = `Reflexão: ${response.reflection}. Sugestão Prática: ${response.suggestion}. Oração: ${response.prayer}`;
        const base64Audio = await generateSpeech(textToRead, voiceId);
        
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
            playAudio(voiceId); // Automatically play with the new voice
        }
    };

    return (
      <div className="bg-white/60 dark:bg-stone-800/50 backdrop-blur-md p-6 rounded-xl shadow-lg shadow-gold-200/20 dark:shadow-black/20 border border-white/50 dark:border-stone-700 space-y-4 animate-fade-in-up">
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

        <div className="mt-6 pt-4 border-t border-gold-300/50 dark:border-stone-700 flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={handlePlayPause}
                    disabled={isLoadingAudio}
                    className="p-3 w-12 h-12 flex items-center justify-center bg-gold-500 text-white rounded-full shadow-md hover:bg-gold-600 transition-all transform hover:scale-105 disabled:bg-stone-400 disabled:scale-100"
                    aria-label={isPlaying ? 'Pausar leitura' : 'Ouvir reflexão'}
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
        </div>
      </div>
    );
};

const EntryDetail: React.FC<EntryDetailProps> = ({ thread, onUpdateNote, onDelete }) => {
    const firstUserMessage = thread.messages.find(m => m.role === 'user');
    const firstModelMessage = thread.messages.find(m => m.role === 'model');

    const aiResponseData = useMemo((): AIResponseData | null => {
        if (!firstModelMessage) return null;
        try {
            return JSON.parse(firstModelMessage.content);
        } catch (e) {
            console.error("Failed to parse AI response", e);
            return null;
        }
    }, [firstModelMessage]);
    
    const [note, setNote] = useState(thread.verse_note || '');
    const [isSaving, setIsSaving] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

    useEffect(() => {
        const originalTitle = document.title;
        document.title = `${thread.title} | Caminho da Luz`;

        return () => {
            document.title = originalTitle;
        };
    }, [thread.title]);

    const handleNoteSave = () => {
        setIsSaving(true);
        setHasSaved(false);
        onUpdateNote(thread.id, note);
        setTimeout(() => {
          setIsSaving(false);
          setHasSaved(true);
          setTimeout(() => setHasSaved(false), 2000);
        }, 500);
    };

    const handleDelete = () => {
        if (window.confirm('Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.')) {
            onDelete(thread.id);
        }
    };

    const isNoteChanged = note !== (thread.verse_note || '');

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
             <header className="text-center pb-4 border-b border-gold-400/50 dark:border-gold-500/30">
                <h2 className="text-3xl font-serif font-bold text-stone-800 dark:text-stone-200">
                  {thread.title}
                </h2>
                <p className="text-stone-500 dark:text-stone-400 mt-1 font-sans">
                  {new Date(thread.created_at).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                </p>
             </header>

            {firstUserMessage && (
                <div className="bg-gold-50/50 dark:bg-stone-800/30 p-6 rounded-xl border border-gold-200/50 dark:border-stone-700 animate-fade-in-up">
                    <h3 className="font-serif text-lg font-semibold text-stone-700 dark:text-stone-300 mb-3">Você compartilhou:</h3>
                    <p className="font-sans text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-wrap italic">
                        {firstUserMessage.content}
                    </p>
                </div>
            )}

            {aiResponseData ? (
                <>
                    <AIResponseCard response={aiResponseData} />
                    <div className="bg-white/60 dark:bg-stone-800/50 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/50 dark:border-stone-700 space-y-4 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                        <h3 className="font-serif text-lg font-semibold text-stone-700 dark:text-stone-300">Minhas Anotações sobre o Versículo</h3>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Escreva suas reflexões sobre este versículo..."
                            className="w-full h-24 p-3 bg-stone-50 dark:bg-stone-900/50 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors duration-200 placeholder-stone-400 font-sans"
                        />
                        <div className="flex justify-end items-center gap-4">
                            {hasSaved && <span className="text-green-600 dark:text-green-400 text-sm transition-opacity duration-300">Anotação salva!</span>}
                            <button
                                onClick={handleNoteSave}
                                disabled={!isNoteChanged || isSaving}
                                className="bg-gold-500 text-white font-bold py-2 px-5 rounded-full shadow-md hover:bg-gold-600 transition-all transform hover:scale-105 disabled:bg-stone-300 dark:disabled:bg-stone-600 disabled:cursor-not-allowed disabled:scale-100"
                            >
                                {isSaving ? 'Salvando...' : 'Salvar Anotação'}
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white/60 dark:bg-stone-800/50 p-6 rounded-xl shadow-lg border border-white/50 text-center text-stone-500">
                    <p>A orientação espiritual para este registro não pôde ser carregada.</p>
                </div>
            )}
             <div className="mt-4 pt-6 border-t border-stone-300/70 dark:border-stone-700/70 flex justify-center">
                <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 text-red-600 dark:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/10 rounded-full py-2 px-4 font-semibold transition-all duration-200"
                    aria-label="Excluir este registro"
                >
                    <Trash2 size={18} />
                    Excluir Registro
                </button>
            </div>
        </div>
    );
};

export default EntryDetail;