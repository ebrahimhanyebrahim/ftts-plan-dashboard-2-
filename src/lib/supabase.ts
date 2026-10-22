import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fzdmdvgmorzifysygkhp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_J-ecQDFtFrIXGPP3caANTw_lup9wJay';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
