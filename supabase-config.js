// Supabase browser configuration. Publishable key is designed to be public; database access is controlled by RLS.
window.KARASO_SUPABASE_URL = 'https://qgochicianbeexiubnub.supabase.co';
window.KARASO_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_TaOF4EO5eQFFb3MMpmCK4g_0xnhWhTP';

// Explicit persistent auth settings: keeps sessions across refreshes and browser restarts.
window.KARASO_SUPABASE_AUTH_OPTIONS = { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storage: window.localStorage } };
