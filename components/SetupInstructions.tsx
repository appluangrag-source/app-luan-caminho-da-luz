import React from 'react';

const AppLogo: React.FC = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gold-600 dark:text-gold-400 mx-auto">
        <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="12" cy="7" r="1.5" fill="currentColor"/>
        <path d="M12 8.5 V 13 L 10 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 13 L 14.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7 18 C 9 16, 11 16, 13 18 S 15 20, 17 18" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
);

const SetupInstructions: React.FC = () => {
    return (
        <div className="bg-gradient-to-br from-lilac-50 to-sky-light-50 dark:from-stone-900 dark:to-slate-800 text-stone-800 dark:text-stone-200 font-sans min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-2xl mx-auto bg-white/60 dark:bg-stone-800/60 backdrop-blur-lg p-8 rounded-2xl shadow-2xl animate-fade-in-up">
                <div className="text-center mb-6">
                    <AppLogo />
                    <h1 className="text-3xl font-serif font-bold text-stone-700 dark:text-stone-300 mt-4">
                        Configuração Necessária
                    </h1>
                    <p className="text-md text-stone-600 dark:text-stone-400 mt-2">
                        Para iniciar sua jornada com o "Caminho da Luz", você precisa conectar o aplicativo ao seu projeto Supabase.
                    </p>
                </div>

                <div className="space-y-4 text-left font-sans">
                    <p><strong>Passo 1:</strong> Abra o arquivo <code className="bg-stone-200 dark:bg-stone-700 px-2 py-1 rounded-md text-sm font-semibold">services/supabaseService.ts</code> no seu editor de código.</p>
                    
                    <p><strong>Passo 2:</strong> Encontre as seguintes linhas de código no topo do arquivo:</p>
                    <pre className="bg-stone-900 text-white p-4 rounded-lg overflow-x-auto text-sm my-2">
                        <code>
                            const supabaseUrl = 'https://example.supabase.co';<br/>
                            const supabaseAnonKey = 'example-key';
                        </code>
                    </pre>

                    <p><strong>Passo 3:</strong> Substitua os valores de exemplo pela sua <strong>URL</strong> e <strong>Chave Anônima (anon key)</strong> do seu projeto Supabase.</p>
                    
                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 p-3 bg-gold-50 dark:bg-stone-900/40 rounded-lg border-l-4 border-gold-500">
                        Você pode encontrar essas informações no painel do seu projeto no <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer" className="text-gold-600 dark:text-gold-400 font-semibold underline">site do Supabase</a>, na seção <strong>Project Settings &gt; API</strong>.
                    </p>
                    
                    <div className="mt-6 pt-4 border-t border-stone-300 dark:border-stone-700 text-center text-gold-600 dark:text-gold-400 font-semibold">
                        Após atualizar o arquivo, esta página será recarregada automaticamente.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SetupInstructions;
