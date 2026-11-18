// Saved applications, stored per user in Supabase (see
// supabase/migrations/20261027_create_applications.sql). Row-level security
// means each user can only ever read or change their own rows.

import { supabase } from "../supabaseClient";

const TABLE = "applications";

// Today's date in the user's own time zone, as YYYY-MM-DD.
export function localToday() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function friendlyError(error) {
  console.error("Saved applications:", error);

  if (
    error?.code === "PGRST205" ||
    error?.code === "42P01" ||
    /could not find the table|relation .* does not exist/i.test(error?.message || "")
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

const BASE_COLUMNS =
  "id, job_title, company_name, ats_score, current_step, created_at, updated_at";
const TRACKER_COLUMNS = `${BASE_COLUMNS}, status, applied_on, job_url, notes`;

// Returns { rows, trackerReady }. trackerReady is false until the job tracker
// columns exist (supabase/migrations/20261117_add_job_tracker.sql), so the
// list keeps working before that setup step is done.
export async function listApplications() {
  const full = await supabase
    .from(TABLE)
    .select(TRACKER_COLUMNS)
    .order("updated_at", { ascending: false });

  if (!full.error) return { rows: full.data, trackerReady: true };

  const missingColumn =
    full.error.code === "42703" ||
    full.error.code === "PGRST204" ||
    /column .* does not exist/i.test(full.error.message || "");

  if (!missingColumn) throw friendlyError(full.error);

  const basic = await supabase
    .from(TABLE)
    .select(BASE_COLUMNS)
    .order("updated_at", { ascending: false });

  if (basic.error) throw friendlyError(basic.error);
  return { rows: basic.data, trackerReady: false };
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

// Adds a job to the tracker without running the analysis yet.
export async function createTrackedJob({
  jobTitle,
  companyName,
  jobUrl,
  status,
  details = {},
}) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      job_title: jobTitle.trim(),
      company_name: companyName.trim(),
      job_url: jobUrl.trim(),
      status,
      applied_on: status === "saved" ? null : localToday(),
      current_step: details.currentStep || 1,
      data: {
        ...details,
        jobTitle: jobTitle.trim(),
        companyName: companyName.trim(),
        jobUrl: jobUrl.trim(),
      },
    })
    .select(TRACKER_COLUMNS)
    .single();

  if (error) throw friendlyError(error);
  return data;
}

// Tracker fields only (status, applied_on, job_url, notes).
export async function updateTracking(id, fields) {
  const { error } = await supabase.from(TABLE).update(fields).eq("id", id);
  if (error) throw friendlyError(error);
}

export async function deleteApplication(id) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw friendlyError(error);
}
