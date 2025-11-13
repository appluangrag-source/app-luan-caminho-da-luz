import React, { useState } from 'react';
import { Clipboard, Check } from 'lucide-react';

const AppLogo: React.FC = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gold-600 dark:text-gold-400 mx-auto">
        <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="12" cy="7" r="1.5" fill="currentColor"/>
        <path d="M12 8.5 V 13 L 10 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 13 L 14.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7 18 C 9 16, 11 16, 13 18 S 15 20, 17 18" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
);

const sqlScript = `-- 1. Crie a tabela 'profiles' para armazenar dados do usuário
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  username TEXT,
  gender TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id)
);
COMMENT ON TABLE public.profiles IS 'Armazena informações públicas de perfil para cada usuário.';

-- 2. Crie a tabela 'threads' para os registros do diário
CREATE TABLE public.threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  mood INT NOT NULL,
  messages JSONB NOT NULL,
  verse_note TEXT
);
COMMENT ON TABLE public.threads IS 'Armazena as entradas do diário de cada usuário e as reflexões da IA.';

-- 3. Habilite a Segurança em Nível de Linha (RLS) para as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;

-- 4. Crie as políticas de segurança para a tabela 'profiles'
CREATE POLICY "Usuários podem ver seu próprio perfil." ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuários podem inserir seu próprio perfil." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Usuários podem atualizar seu próprio perfil." ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 5. Crie as políticas de segurança para a tabela 'threads'
CREATE POLICY "Usuários podem gerenciar seus próprios registros do diário." ON public.threads
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. (Opcional, mas recomendado) Crie um gatilho para criar perfis automaticamente no cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, 'Amado(a) Fiel');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
`;

const DatabaseSetupInstructions: React.FC = () => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(sqlScript.trim());
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <div className="bg-gradient-to-br from-lilac-50 to-sky-light-50 dark:from-stone-900 dark:to-slate-800 text-stone-800 dark:text-stone-200 font-sans min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-3xl mx-auto bg-white/60 dark:bg-stone-800/60 backdrop-blur-lg p-8 rounded-2xl shadow-2xl animate-fade-in-up">
                <div className="text-center mb-6">
                    <AppLogo />
                    <h1 className="text-3xl font-serif font-bold text-stone-700 dark:text-stone-300 mt-4">
                        Configuração do Banco de Dados
                    </h1>
                    <p className="text-md text-stone-600 dark:text-stone-400 mt-2">
                        O aplicativo detectou que as tabelas do banco de dados ainda não foram criadas. Siga os passos abaixo para configurá-lo.
                    </p>
                </div>

                <div className="space-y-4 text-left font-sans">
                    <p><strong>Passo 1:</strong> Vá para o seu projeto no <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-gold-600 dark:text-gold-400 font-semibold underline">Dashboard do Supabase</a>.</p>
                    
                    <p><strong>Passo 2:</strong> No menu lateral, clique no ícone de banco de dados e selecione <strong>"SQL Editor"</strong>.</p>

                    <p><strong>Passo 3:</strong> Clique em <strong>"+ New query"</strong> para abrir uma nova aba de consulta.</p>

                    <p><strong>Passo 4:</strong> Copie todo o script SQL abaixo e cole-o no editor de SQL.</p>
                    
                    <div className="relative my-2">
                        <pre className="bg-stone-900 text-white p-4 rounded-lg overflow-x-auto text-sm max-h-60">
                            <code>{sqlScript.trim()}</code>
                        </pre>
                        <button 
                            onClick={handleCopy}
                            className="absolute top-3 right-3 p-2 bg-stone-700 hover:bg-stone-600 rounded-md text-white transition-colors"
                            aria-label="Copiar script SQL"
                        >
                            {copied ? <Check size={16} className="text-green-400" /> : <Clipboard size={16} />}
                        </button>
                    </div>

                    <p><strong>Passo 5:</strong> Clique no botão <strong>"RUN"</strong> (ou use o atalho Cmd+Enter / Ctrl+Enter) para executar o script.</p>
                    
                    <div className="mt-6 pt-4 border-t border-stone-300 dark:border-stone-700 text-center text-gold-600 dark:text-gold-400 font-semibold">
                        Após executar o script com sucesso, atualize esta página.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DatabaseSetupInstructions;
