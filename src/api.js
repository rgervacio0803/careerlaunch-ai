import { supabase } from "./supabaseClient";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
  /\/$/,
  "",
);

/**
 * POSTs form fields (and an optional file) to the API server as the
 * logged-in user. Resolves with the JSON body, or throws an Error whose
 * message is safe to show to the user.
 */
export async function apiRequest(path, fields = {}, file = null) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(
      key,
      typeof value === "string" ? value : JSON.stringify(value),
    );
  });

  if (file) {
    formData.append("resume", file);
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
      body: formData,
    });
  } catch {
    throw new Error(
      "We couldn't reach CareerLaunch AI. Check your connection and try again.",
    );
  }

  let data = {};

  try {
    data = await response.json();
  } catch {
    // Non-JSON error page from a proxy or host; fall through to the generic message.
  }

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }

  return data;
}
