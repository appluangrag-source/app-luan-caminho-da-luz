import React, { useState } from 'react';
import { supabase } from '../services/supabaseService';
import { Loader2 } from 'lucide-react';

const AppLogo: React.FC = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gold-600 dark:text-gold-400">
        <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="12" cy="7" r="1.5" fill="currentColor"/>
        <path d="M12 8.5 V 13 L 10 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 13 L 14.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7 18 C 9 16, 11 16, 13 18 S 15 20, 17 18" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
);

type AuthView = 'login' | 'signup' | 'forgotPassword';

const Auth: React.FC = () => {
    const [authView, setAuthView] = useState<AuthView>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (authView === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({ 
                    email, 
                    password,
                });
                if (error) throw error;
                setMessage('Verifique seu e-mail para confirmar o cadastro!');
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;
            setMessage('Verifique seu e-mail para redefinir sua senha.');
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro.');
        } finally {
            setLoading(false);
        }
    };

    const switchView = (view: AuthView) => {
        setAuthView(view);
        setError(null);
        setMessage(null);
        setPassword('');
    };

    return (
        <div className="bg-gradient-to-br from-lilac-50 to-sky-light-50 dark:from-stone-900 dark:to-slate-800 text-stone-800 dark:text-stone-200 font-sans min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto bg-white/60 dark:bg-stone-800/60 backdrop-blur-lg p-8 rounded-2xl shadow-2xl animate-fade-in-up">
                <div className="text-center mb-8">
                    <AppLogo />
                    <h1 className="text-3xl font-serif font-bold text-stone-700 dark:text-stone-300 mt-4">
                        Caminho da Luz
                    </h1>
                    <p className="text-md italic text-gold-700 dark:text-gold-500 font-serif">Caminhe na presença, viva na luz.</p>
                </div>

                {authView === 'forgotPassword' ? (
                     <div>
                        <h2 className="text-center text-xl font-serif font-semibold text-stone-700 dark:text-stone-300">Recuperar Senha</h2>
                        <p className="text-center text-sm text-stone-500 dark:text-stone-400 mt-1 mb-6">Insira seu e-mail para receber o link.</p>
                        <form onSubmit={handlePasswordReset} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="mt-1 block w-full px-3 py-2 bg-white/80 dark:bg-stone-900/50 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-gold-500 focus:border-gold-500"
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            {message && <p className="text-green-500 text-sm text-center">{message}</p>}
                             <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-sm font-bold text-white bg-gold-500 hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 disabled:bg-stone-400 transition-all transform hover:scale-105"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : 'Enviar Link de Recuperação'}
                                </button>
                            </div>
                        </form>
                        <div className="mt-6 text-center">
                            <button onClick={() => switchView('login')} className="text-sm font-medium text-gold-600 hover:text-gold-500 dark:text-gold-400 dark:hover:text-gold-300">
                                Voltar para o login
                            </button>
                        </div>
                     </div>
                ) : (
                    <>
                        <form onSubmit={handleAuth} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="mt-1 block w-full px-3 py-2 bg-white/80 dark:bg-stone-900/50 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-gold-500 focus:border-gold-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="password"  className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                                    Senha
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="mt-1 block w-full px-3 py-2 bg-white/80 dark:bg-stone-900/50 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-gold-500 focus:border-gold-500"
                                />
                            </div>

                            {authView === 'login' && (
                                <div className="text-right -mt-4">
                                    <button
                                        type="button"
                                        onClick={() => switchView('forgotPassword')}
                                        className="text-sm font-medium text-gold-600 hover:text-gold-500 dark:text-gold-400 dark:hover:text-gold-300"
                                    >
                                        Esqueci a senha?
                                    </button>
                                </div>
                            )}

                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            {message && <p className="text-green-500 text-sm text-center">{message}</p>}

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-sm font-bold text-white bg-gold-500 hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 disabled:bg-stone-400 transition-all transform hover:scale-105"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : (authView === 'login' ? 'Entrar' : 'Criar Conta')}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 text-center">
                            <button onClick={() => switchView(authView === 'login' ? 'signup' : 'login')} className="text-sm font-medium text-gold-600 hover:text-gold-500 dark:text-gold-400 dark:hover:text-gold-300">
                                {authView === 'login' ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Auth;