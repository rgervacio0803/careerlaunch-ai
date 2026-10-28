// Saved applications, stored per user in Supabase (see
// supabase/migrations/20261027_create_applications.sql). Row-level security
// means each user can only ever read or change their own rows.

import { supabase } from "../supabaseClient";

const TABLE = "applications";

function friendlyError(error) {
  console.error("Saved applications:", error);

  if (
    error?.code === "PGRST205" ||
    error?.code === "42P01" ||
    /could not find the table|does not exist/i.test(error?.message || "")
  ) {
    return new Error(
      "Saving isn't set up yet: the applications table is missing in Supabase.",
    );
  }

  return new Error(
    "We couldn't reach your saved applications. Please try again.",
  );
}

function toRow(snapshot) {
  return {
    job_title: (snapshot.jobTitle || "").trim(),
    company_name: (snapshot.companyName || "").trim(),
    ats_score: Number.isFinite(snapshot.result?.atsScore)
      ? snapshot.result.atsScore
      : null,
    current_step: snapshot.currentStep || 1,
    data: snapshot,
  };
}

export async function listApplications() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, job_title, company_name, ats_score, current_step, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) throw friendlyError(error);
  return data;
}

export async function getApplication(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, data")
    .eq("id", id)
    .single();

  if (error) throw friendlyError(error);
  return data;
}

export async function createApplication(snapshot) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(toRow(snapshot))
    .select("id")
    .single();

  if (error) throw friendlyError(error);
  return data.id;
}

export async function updateApplication(id, snapshot) {
  const { error } = await supabase.from(TABLE).update(toRow(snapshot)).eq("id", id);
  if (error) throw friendlyError(error);
}

export async function deleteApplication(id) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw friendlyError(error);
}
