import React, { useState, useEffect } from 'react';
import { ConversationThread } from './types';
import useDiary from './hooks/useDiary';
import Dashboard from './components/Dashboard';
import NewEntry from './components/NewEntry';
import History from './components/History';
import EntryDetail from './components/EntryDetail';
import VerseOfTheDay from './components/VerseOfTheDay';
import Progress from './components/Progress';
import Subscription from './components/Subscription';
import { Sun, Moon, BookOpen, BarChart2, PlusCircle, Home, BookMarked, Plus, Gem } from 'lucide-react';

export type View = 'dashboard' | 'new-entry' | 'history' | 'entry-detail' | 'verse-of-the-day' | 'progress' | 'subscription';
export type Gender = 'male' | 'female' | 'other';

const AppLogo: React.FC = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gold-600 dark:text-gold-400 flex-shrink-0">
        <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="12" cy="7" r="1.5" fill="currentColor"/>
        <path d="M12 8.5 V 13 L 10 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 13 L 14.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7 18 C 9 16, 11 16, 13 18 S 15 20, 17 18" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
);


const App: React.FC = () => {
  const { threads, createConversation, isLoading, error, addOrUpdateVerseNote, deleteConversation } = useDiary();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedThread, setSelectedThread] = useState<ConversationThread | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    if (newIsDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };
  
  const handleNavigate = (view: View, thread: ConversationThread | null = null) => {
    setSelectedThread(thread);
    setCurrentView(view);
  };
  
  const handleEntryCreated = (thread: ConversationThread) => {
    handleNavigate('entry-detail', thread);
  };

  const handleDeleteEntry = (threadId: string) => {
    deleteConversation(threadId);
    handleNavigate('history');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard threads={threads} onNavigate={handleNavigate} />;
      case 'new-entry':
        return <NewEntry createConversation={createConversation} onEntryCreated={handleEntryCreated} isLoading={isLoading} error={error} />;
      case 'history':
        return <History threads={threads} onNavigate={handleNavigate} />;
      case 'entry-detail':
        return selectedThread ? <EntryDetail thread={selectedThread} onUpdateNote={addOrUpdateVerseNote} onDelete={handleDeleteEntry} /> : <Dashboard threads={threads} onNavigate={handleNavigate} />;
      case 'verse-of-the-day':
        return <VerseOfTheDay />;
      case 'progress':
        return <Progress threads={threads} onNavigate={handleNavigate} />;
      case 'subscription':
        return <Subscription onNavigate={handleNavigate} />;
      default:
        return <Dashboard threads={threads} onNavigate={handleNavigate} />;
    }
  };

  const MobileNavButton = ({ icon: Icon, label, view }: { icon: React.ElementType, label: string, view: View }) => (
    <button
      onClick={() => handleNavigate(view)}
      className={`flex flex-col items-center justify-center space-y-1 w-full transition-colors duration-200 ${currentView === view ? 'text-gold-600 dark:text-gold-400' : 'text-stone-500 dark:text-stone-400 hover:text-gold-600 dark:hover:text-gold-400'}`}
    >
      <Icon size={24} />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  const DesktopNavButton = ({ label, view }: { label: string, view: View }) => (
    <button
      onClick={() => handleNavigate(view)}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${currentView === view ? 'bg-gold-100 text-gold-700 dark:bg-gold-900/50 dark:text-gold-300' : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-gradient-to-br from-lilac-50 to-sky-light-50 dark:from-stone-900 dark:to-slate-800 text-stone-800 dark:text-stone-200 font-sans min-h-screen flex flex-col">
      <header className="sticky top-0 bg-white/60 dark:bg-stone-900/60 backdrop-blur-lg z-10 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
                <AppLogo />
                <div>
                    <h1 className="text-xl font-serif font-bold text-stone-700 dark:text-stone-300 whitespace-nowrap">
                        Caminho da Luz
                    </h1>
                    <p className="text-xs italic text-gold-700 dark:text-gold-500 font-serif -mt-1">Caminhe na presença, viva na luz.</p>
                </div>
            </div>
             {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
                <DesktopNavButton label="Início" view="dashboard" />
                <DesktopNavButton label="Meu Diário" view="history" />
                <DesktopNavButton label="Jornada Espiritual" view="progress" />
                <DesktopNavButton label="Versículo" view="verse-of-the-day" />
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {/* Desktop "New Entry" button */}
            <button 
                onClick={() => handleNavigate('new-entry')}
                className="hidden md:inline-flex items-center gap-2 bg-gold-500 text-white font-bold text-sm py-2 px-4 rounded-full shadow-md hover:bg-gold-600 transition-all transform hover:scale-105"
            >
                <Plus size={16}/>
                Novo Registro
            </button>
            <button onClick={() => handleNavigate('subscription')} className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors text-gold-600 dark:text-gold-400" aria-label="Ver planos de assinatura">
                <Gem size={20} />
            </button>
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors" aria-label="Alternar modo escuro">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8 mb-24 md:mb-8">
        <div key={currentView} className="animate-fade-in-up">
            {renderView()}
        </div>
      </main>

      {/* Mobile Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/60 dark:bg-stone-800/60 backdrop-blur-lg border-t border-stone-200 dark:border-stone-700 shadow-lg md:hidden">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-around">
          <MobileNavButton icon={Home} label="Início" view="dashboard" />
          <MobileNavButton icon={BookOpen} label="Meu Diário" view="history" />
          <div className="w-16"></div> {/* Spacer for the central button */}
          <MobileNavButton icon={BarChart2} label="Jornada Espiritual" view="progress" />
          <MobileNavButton icon={BookMarked} label="Versículo" view="verse-of-the-day" />
        </nav>
        <button
          onClick={() => handleNavigate('new-entry')}
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-16 h-16 bg-gold-500 rounded-full shadow-lg hover:bg-gold-600 transition-transform transform hover:scale-105"
          aria-label="Novo Registro"
        >
          <PlusCircle size={32} className="text-white" />
        </button>
      </footer>
    </div>
  );
};

export default App;