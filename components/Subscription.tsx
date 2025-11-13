
import React from 'react';
import { View } from '../App';
import { CheckCircle2, Star } from 'lucide-react';

interface SubscriptionProps {
    onNavigate: (view: View) => void;
}

const PlanFeature: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start gap-3">
        <CheckCircle2 size={18} className="text-green-500 mt-1 flex-shrink-0" />
        <span className="text-stone-600 dark:text-stone-300">{children}</span>
    </li>
);

const Subscription: React.FC<SubscriptionProps> = ({ onNavigate }) => {
    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-fade-in">
            <header className="text-center">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 dark:text-stone-200">
                    Desbloqueie sua Jornada Completa
                </h2>
                <p className="text-stone-600 dark:text-stone-400 mt-2 font-sans max-w-2xl mx-auto">
                    Escolha o plano que melhor ilumina seu caminho de fé, com recursos avançados para aprofundar sua reflexão e constância.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Free Plan */}
                <div className="bg-white/50 dark:bg-stone-800/40 p-6 rounded-2xl shadow-lg border border-white/50 dark:border-stone-700 flex flex-col">
                    <h3 className="text-2xl font-serif font-bold text-stone-700 dark:text-stone-300">Gratuito</h3>
                    <p className="mt-2 text-stone-600 dark:text-stone-400">O essencial para começar.</p>
                    <p className="my-6">
                        <span className="text-4xl font-bold text-stone-800 dark:text-stone-200">R$ 0</span>
                    </p>
                    <button 
                        onClick={() => onNavigate('dashboard')}
                        className="w-full py-3 px-4 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold transition-colors"
                    >
                        Seu Plano Atual
                    </button>
                    <ul className="space-y-4 mt-8 text-sm font-sans flex-grow">
                        <PlanFeature>Diário Espiritual (1 registro/dia)</PlanFeature>
                        <PlanFeature>Calendário Espiritual (básico)</PlanFeature>
                        <PlanFeature>Frase bíblica diária</PlanFeature>
                        <PlanFeature>1 trilha sonora de oração</PlanFeature>
                        <PlanFeature>Salva até 7 registros</PlanFeature>
                    </ul>
                </div>

                {/* Caminhante da Luz Plan (Most Popular) */}
                <div className="bg-gradient-to-br from-gold-50 to-lilac-100 dark:from-gold-900/30 dark:to-stone-800/50 p-6 rounded-2xl shadow-2xl shadow-gold-300/50 dark:shadow-black/40 border-2 border-gold-500 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-gold-500 text-white text-xs font-bold px-8 py-1 transform translate-x-1/4 rotate-45 translate-y-1/2">
                        Popular
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-gold-800 dark:text-gold-300">Caminhante da Luz</h3>
                    <p className="mt-2 text-gold-700 dark:text-gold-400">Aprofunde sua jornada de fé.</p>
                    <p className="my-6">
                        <span className="text-4xl font-bold text-stone-800 dark:text-stone-200">R$ 14,90</span>
                        <span className="text-stone-500 dark:text-stone-400">/mês</span>
                    </p>
                    <button className="w-full py-3 px-4 rounded-full bg-gold-500 text-white font-bold shadow-lg hover:bg-gold-600 transition-all transform hover:scale-105">
                        Assinar Agora
                    </button>
                    <ul className="space-y-4 mt-8 text-sm font-sans flex-grow">
                        <PlanFeature><strong>Tudo do plano gratuito, e mais:</strong></PlanFeature>
                        <PlanFeature>Registros ilimitados no diário</PlanFeature>
                        <PlanFeature>Busca e filtros por tema</PlanFeature>
                        <PlanFeature>Linha do tempo emocional</PlanFeature>
                        <PlanFeature>Luzes de Fé e Medalhas</PlanFeature>
                        <PlanFeature>Frases e bênçãos exclusivas</PlanFeature>
                        <PlanFeature>Fundo musical de meditação</PlanFeature>
                        <PlanFeature>Backup na nuvem</PlanFeature>
                    </ul>
                </div>
                
                {/* Guardião da Luz Plan */}
                <div className="bg-white/50 dark:bg-stone-800/40 p-6 rounded-2xl shadow-lg border border-white/50 dark:border-stone-700 flex flex-col">
                    <h3 className="text-2xl font-serif font-bold text-stone-700 dark:text-stone-300">Guardião da Luz</h3>
                    <p className="mt-2 text-stone-600 dark:text-stone-400">A experiência completa e guiada.</p>
                    <p className="my-6">
                        <span className="text-4xl font-bold text-stone-800 dark:text-stone-200">R$ 24,90</span>
                        <span className="text-stone-500 dark:text-stone-400">/mês</span>
                    </p>
                    <button className="w-full py-3 px-4 rounded-full bg-stone-800 dark:bg-lilac-100 text-white dark:text-stone-800 font-bold shadow-md hover:bg-stone-700 dark:hover:bg-lilac-200 transition-colors">
                        Escolher Plano
                    </button>
                    <ul className="space-y-4 mt-8 text-sm font-sans flex-grow">
                        <PlanFeature><strong>Tudo do plano Caminhante, e mais:</strong></PlanFeature>
                        <PlanFeature>Relatórios semanais automáticos</PlanFeature>
                        <PlanFeature>Oração guiada personalizada</PlanFeature>
                        <PlanFeature>Modo Noturno de Reflexão</PlanFeature>
                        <PlanFeature>Tema visual premium</PlanFeature>
                        <PlanFeature>Acesso antecipado a novidades</PlanFeature>
                    </ul>
                </div>
            </div>
            <p className="text-center text-xs text-stone-500 dark:text-stone-400">
                As assinaturas são renovadas automaticamente. Você pode cancelar a qualquer momento.
            </p>
        </div>
    );
};

export default Subscription;
