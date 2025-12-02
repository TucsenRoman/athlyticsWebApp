import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/* -------------------------------------------------------------------------- */
/* ENV VARS (Vite exposes ONLY VITE_*)                                        */
/* -------------------------------------------------------------------------- */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  throw new Error("VITE_SUPABASE_URL is missing.");
}

if (!SUPABASE_ANON_KEY) {
  throw new Error("VITE_SUPABASE_ANON_KEY is missing.");
}

/* -------------------------------------------------------------------------- */
/* CLIENT                                                                      */
/* -------------------------------------------------------------------------- */

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    global: {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    },
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
