import React, { useState, useMemo, FC } from 'react';
import { ConversationThread, AIResponseData } from '../types';
import { View } from '../App';
import { ChevronRight, Search, List, Calendar, Clock, Filter, XCircle } from 'lucide-react';

interface HistoryProps {
  threads: ConversationThread[];
  onNavigate: (view: View, thread: ConversationThread) => void;
}

type ActiveView = 'list' | 'calendar' | 'timeline';

const moodEmojis: { [key: number]: string } = { 1: '😔', 2: '😔', 3: '😕', 4: '😕', 5: '😐', 6: '😐', 7: '🙂', 8: '🙂', 9: '😄', 10: '😄' };

const moodFilters = [
    { label: 'Feliz', moods: [9, 10], emoji: '😄' },
    { label: 'Bem', moods: [7, 8], emoji: '🙂' },
    { label: 'Neutro', moods: [5, 6], emoji: '😐' },
    { label: 'Desafiador', moods: [1, 2, 3, 4], emoji: '😕' },
];

const ListView: FC<{ threads: ConversationThread[], onNavigate: HistoryProps['onNavigate'] }> = ({ threads, onNavigate }) => (
    <div className="space-y-4">
        {threads.map((thread) => (
            <div
                key={thread.id}
                onClick={() => onNavigate('entry-detail', thread)}
                className="bg-white/60 dark:bg-stone-800/50 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50 dark:border-stone-700 cursor-pointer hover:shadow-xl hover:border-gold-400 dark:hover:border-gold-500 transition-all duration-300 flex items-center justify-between"
            >
                <div>
                    <div className="flex items-center gap-3">
                    <span className="text-2xl">{moodEmojis[thread.mood] || '😐'}</span>
                    <p className="font-serif font-semibold text-stone-700 dark:text-stone-300">
                        {thread.title}
                    </p>
                    </div>
                    <p className="text-stone-500 dark:text-stone-400 mt-2 text-sm">
                    {new Date(thread.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <ChevronRight className="text-stone-400 dark:text-stone-500" size={24} />
            </div>
        ))}
    </div>
);

const TimelineView: FC<{ threads: ConversationThread[], onNavigate: HistoryProps['onNavigate'] }> = ({ threads, onNavigate }) => (
    <div className="relative pl-8 border-l-2 border-gold-300/80 dark:border-stone-600/80 space-y-10">
        {threads.map((thread, index) => (
            <div key={thread.id} className="relative animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="absolute -left-[41px] top-1.5 h-6 w-6 rounded-full bg-gold-500 flex items-center justify-center text-white border-4 border-lilac-50 dark:border-stone-900">
                   <span className="text-sm">{moodEmojis[thread.mood] || '😐'}</span>
                </div>
                <div onClick={() => onNavigate('entry-detail', thread)} className="p-4 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-gold-50 dark:hover:bg-stone-800/60">
                    <p className="text-stone-500 dark:text-stone-400 text-sm">
                        {new Date(thread.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                    </p>
                    <p className="font-serif font-semibold text-stone-700 dark:text-stone-300 mt-1">
                        {thread.title}
                    </p>
                </div>
            </div>
        ))}
    </div>
);

const CalendarView: FC<{ threads: ConversationThread[], onNavigate: HistoryProps['onNavigate'] }> = ({ threads, onNavigate }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const entriesByDate = useMemo(() => {
        const map = new Map<string, { entries: ConversationThread[], moods: number[] }>();
        threads.forEach(thread => {
            const dateKey = new Date(thread.created_at).toISOString().split('T')[0];
            if (!map.has(dateKey)) {
                map.set(dateKey, { entries: [], moods: [] });
            }
            const dayData = map.get(dateKey)!;
            dayData.entries.push(thread);
            dayData.moods.push(thread.mood);
        });
        return map;
    }, [threads]);

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const today = new Date();

    return (
        <div className="bg-white/60 dark:bg-stone-800/50 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg border border-white/50 dark:border-stone-700">
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700">&lt;</button>
                <h3 className="text-lg font-serif font-semibold text-stone-700 dark:text-stone-300 capitalize">
                    {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700">&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-stone-500 dark:text-stone-400">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => <div key={i} className="py-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="h-12"></div>)}
                {Array.from({ length: daysInMonth }).map((_, day) => {
                    const dayNumber = day + 1;
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
                    const dateKey = date.toISOString().split('T')[0];
                    const dayData = entriesByDate.get(dateKey);
                    
                    const isToday = date.toDateString() === today.toDateString();

                    const avgMood = dayData ? Math.round(dayData.moods.reduce((a, b) => a + b, 0) / dayData.moods.length) : null;
                    const emoji = avgMood ? moodEmojis[avgMood] : null;

                    return (
                        <div
                            key={dayNumber}
                            className={`h-12 flex items-center justify-center rounded-full transition-colors duration-200 ${dayData ? 'cursor-pointer bg-gold-100/60 dark:bg-gold-900/40 hover:bg-gold-200 dark:hover:bg-gold-800' : ''} ${isToday ? 'border-2 border-gold-500' : ''}`}
                            onClick={() => dayData && dayData.entries[0] && onNavigate('entry-detail', dayData.entries[0])} // Navigate to first entry of the day
                        >
                           <div className="relative">
                                {dayNumber}
                                {emoji && <span className="absolute -top-3 -right-2 text-lg">{emoji}</span>}
                           </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const History: React.FC<HistoryProps> = ({ threads, onNavigate }) => {
  const [activeView, setActiveView] = useState<ActiveView>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMoodGroups, setSelectedMoodGroups] = useState<number[][]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const filteredThreads = useMemo(() => {
    const lowercasedTerm = searchTerm.toLowerCase().trim();
    const selectedMoods = selectedMoodGroups.flat();

    return threads.filter(thread => {
      // Mood filter
      if (selectedMoods.length > 0 && !selectedMoods.includes(thread.mood)) {
        return false;
      }
      // Search term filter
      if (lowercasedTerm) {
        const titleMatch = thread.title.toLowerCase().includes(lowercasedTerm);
        const dateMatch = new Date(thread.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }).toLowerCase().includes(lowercasedTerm);
        const userContentMatch = thread.messages.find(m => m.role === 'user')?.content.toLowerCase().includes(lowercasedTerm);
        let aiContentMatch = false;
        try {
            const aiData: AIResponseData = JSON.parse(thread.messages.find(m => m.role === 'model')?.content || '{}');
            aiContentMatch = Object.values(aiData).some(val => 
                typeof val === 'string' ? val.toLowerCase().includes(lowercasedTerm) :
                val.ref?.toLowerCase().includes(lowercasedTerm) || val.text?.toLowerCase().includes(lowercasedTerm)
            );
        } catch {}
        return titleMatch || dateMatch || userContentMatch || aiContentMatch;
      }
      return true;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [threads, searchTerm, selectedMoodGroups]);

  const toggleMoodFilter = (moodGroup: number[]) => {
    setSelectedMoodGroups(prev => 
        prev.some(group => group.join(',') === moodGroup.join(','))
        ? prev.filter(group => group.join(',') !== moodGroup.join(','))
        : [...prev, moodGroup]
    );
  };
  
  const renderView = () => {
    const viewProps = { threads: filteredThreads, onNavigate };
    if (filteredThreads.length === 0) {
        return (
            <div className="text-center text-stone-500 dark:text-stone-400 py-20">
              <p>Nenhum registro encontrado para os filtros selecionados.</p>
            </div>
        );
    }
    switch (activeView) {
        case 'list': return <ListView {...viewProps} />;
        case 'timeline': return <TimelineView {...viewProps} />;
        case 'calendar': return <CalendarView threads={filteredThreads} onNavigate={onNavigate} />;
        default: return null;
    }
  };
  
  if (threads.length === 0) {
    return (
      <div className="text-center text-stone-500 dark:text-stone-400 py-20">
        <p>Você ainda não tem nenhum registro no seu diário.</p>
        <button onClick={() => onNavigate('new-entry', null)} className="mt-4 text-gold-500 font-semibold hover:underline">
          Crie seu primeiro registro
        </button>
      </div>
    );
  }

  const ViewButton = ({ label, view, icon: Icon }: { label: string, view: ActiveView, icon: React.ElementType }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${activeView === view ? 'bg-gold-100 text-gold-700 dark:bg-gold-900/50 dark:text-gold-300' : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-serif font-bold text-stone-800 dark:text-stone-200">Meu Diário</h2>
      
      <div className="space-y-4 p-4 bg-white/50 dark:bg-stone-800/40 rounded-xl shadow-lg border border-white/50">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex items-center gap-2 p-1 bg-stone-200/50 dark:bg-stone-900/50 rounded-lg">
                <ViewButton label="Lista" view="list" icon={List} />
                <ViewButton label="Calendário" view="calendar" icon={Calendar} />
                <ViewButton label="Linha do Tempo" view="timeline" icon={Clock} />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
                <Filter size={16} />
                <span>Filtros</span>
            </button>
        </div>
        {showFilters && (
            <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-stone-700 animate-fade-in">
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                    <input type="text" placeholder="Buscar por termo, tema, sentimento..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white/80 dark:bg-stone-900/50 border border-stone-300 dark:border-stone-600 rounded-full focus:ring-2 focus:ring-gold-500 transition-colors" />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-stone-600 dark:text-stone-400">Sentimento:</span>
                    {moodFilters.map(({ label, moods, emoji }) => (
                         <button
                            key={label}
                            onClick={() => toggleMoodFilter(moods)}
                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-all duration-200 ${selectedMoodGroups.some(g => g.join(',') === moods.join(',')) ? 'bg-gold-500 text-white font-bold ring-2 ring-offset-2 ring-gold-500 dark:ring-offset-stone-800' : 'bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600'}`}
                         >
                             <span>{emoji}</span>
                             <span>{label}</span>
                         </button>
                    ))}
                    {selectedMoodGroups.length > 0 && <button onClick={() => setSelectedMoodGroups([])} className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"><XCircle className="text-red-500" size={20}/></button>}
                </div>
            </div>
        )}
      </div>
      
      {renderView()}
    </div>
  );
};

export default History;