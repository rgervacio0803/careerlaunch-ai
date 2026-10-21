import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Read before the client starts, because it removes the auth details from
// the address bar while it signs the user in from a reset link.
export const openedFromPasswordReset =
  new URLSearchParams(window.location.search).has("reset") ||
  window.location.hash.includes("type=recovery");

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
);
