import { createClient } from "@supabase/supabase-js";

// The project URL and *publishable* key are public by design (they ship to the
// browser); data is protected by Row Level Security in the database.
// Override them with VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY if needed.
// ⚠️ Never put a service_role key or a personal access token (sbp_…) here.
const url = import.meta.env.VITE_SUPABASE_URL || "https://lffmnjyhrejidcmiglfi.supabase.co";
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_AfYmnkWOplxZUOK9YNdBfQ_aBgoRHQi";

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true },
});
