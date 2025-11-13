import { createClient } from '@supabase/supabase-js';

// TODO: Substitua com as suas próprias credenciais do Supabase
// Você pode encontrá-las em seu painel do Supabase, em Configurações > API.
const supabaseUrl = 'https://znukrvfogjxvrpprtraj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudWtydmZvZ2p4dnJwcHJ0cmFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODMyNjQsImV4cCI6MjA3ODU1OTI2NH0.Ot1_lFg4BStynJ_ld9-RXJj5eP2WsD_Ae05-LMVBWN4';

// Export a flag to check if credentials are the default ones
export const isSupabaseConfigured =
    !supabaseUrl.includes('example.supabase.co') &&
    !supabaseAnonKey.includes('example-key');

if (!isSupabaseConfigured) {
    console.warn("As credenciais do Supabase não foram definidas. O aplicativo não funcionará corretamente. Por favor, atualize o arquivo services/supabaseService.ts");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);