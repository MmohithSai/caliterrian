import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Fail loud in dev so a missing .env is obvious, not a silent broken form.
  console.error("[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.");
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * POST a public form to an Edge Function (the only write path for leads/bookings).
 * Returns { ok, error } — never throws, so callers can toast cleanly.
 */
export async function submitForm(fn, payload) {
  try {
    const { data, error } = await supabase.functions.invoke(fn, { body: payload });
    if (error) {
      // Edge Function returned a non-2xx; try to surface its JSON message.
      let message = "Something went wrong. Please try again.";
      try {
        const body = await error.context?.json?.();
        if (body?.error) message = body.error;
      } catch { /* keep default */ }
      return { ok: false, error: message };
    }
    if (data?.error) return { ok: false, error: data.error };
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Network error. Please check your connection." };
  }
}
