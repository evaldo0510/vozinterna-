
import { createClient } from '@supabase/supabase-js';

// Essas variáveis devem ser configuradas no ambiente do projeto
const supabaseUrl = (process.env as any).SUPABASE_URL || 'https://seu-projeto.supabase.co';
const supabaseAnonKey = (process.env as any).SUPABASE_ANON_KEY || 'sua-chave-anon';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
