import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const SUPABASE_URL = 'https://kisqeeoxtfhtodjikkis.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_rIqgN1nmRySdtHh8SyIh0w_vkGKgkAO';
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
