import { useEffect, useState } from "react";
import {
  createTrackedJob,
  deleteApplication,
  listApplications,
  localToday,
  updateTracking,
} from "../utils/applications";

const STEP_LABELS = {
  1: "Not analyzed yet",
  2: "Job details added",
  3: "ATS analysis ready",
  4: "Resume insights ready",
  5: "Rewrite plan ready",
  6: "Optimized resume ready",
  7: "Cover letter ready",
  8: "Interview prep ready",
};

const STATUSES = [
  { id: "saved", label: "Not applied yet" },
  { id: "applied", label: "Applied" },
  { id: "interviewing", label: "Interviewing" },
  { id: "offer", label: "Offer" },
  { id: "rejected", label: "Not selected" },
];

const statusLabel = (id) => STATUSES.find((s) => s.id === id)?.label || "Not applied yet";


function formatDate(value) {
  // Plain dates (YYYY-MM-DD) are shown as-is, without time zone shifts.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00`)
    : new Date(value);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Only allow web links; add https:// when it's missing.
function safeUrl(value) {
  const url = (value || "").trim();
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function TrackJobForm({ onSaved, onCancel }) {
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [status, setStatus] = useState("saved");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const row = await createTrackedJob({
        jobTitle,
        companyName,
        jobUrl: safeUrl(jobUrl),
        status,
      });
      onSaved(row);
    } catch (saveError) {
      setError(saveError.message);
      setSaving(false);
    }
  }

  return (
    <form className="track-job-form" onSubmit={handleSubmit}>
      <h3>Track a Job</h3>
      <p>Add a job you found. You can tailor your resume for it any time.</p>

      <div className="track-job-grid">
        <label htmlFor="track-title">
          Job Title
          <input
            id="track-title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            required
            maxLength={200}
          />
        </label>

        <label htmlFor="track-company">
          Company
          <input
            id="track-company"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            maxLength={200}
          />
        </label>

        <label htmlFor="track-url">
          <span className="field-label">
            Job Posting Link <em>(optional)</em>
          </span>
          <input
            id="track-url"
            type="text"
            inputMode="url"
            placeholder="https://..."
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            maxLength={2000}
          />
        </label>

        <label htmlFor="track-status">
          Status
          <select
            id="track-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <div className="track-job-actions">
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="primary-action-button" disabled={saving}>
          {saving ? "Saving..." : "Add to Tracker"}
        </button>
      </div>
    </form>
  );
}

function ApplicationCard({ application, trackerReady, onOpen, onDelete, onChange, deleting }) {
  const [showDetails, setShowDetails] = useState(false);
  const [notes, setNotes] = useState(application.notes || "");
  const [jobUrl, setJobUrl] = useState(application.job_url || "");

  const analyzed = application.current_step >= 3 || application.ats_score !== null;
  const link = safeUrl(application.job_url);
  const status = application.status || "saved";

  function changeStatus(next) {
    const fields = { status: next };
    // First time it's marked applied (or later), record today as the date.
    if (next !== "saved" && !application.applied_on) fields.applied_on = localToday();
    onChange(application.id, fields);
  }

  return (
    <li className={`application-card status-${status}`}>
      <div className="application-card-row">
        <div className="application-card-main">
          <h3>{application.job_title || "Untitled application"}</h3>
          {application.company_name && (
            <p className="application-company">{application.company_name}</p>
          )}
          <p className="application-meta">
            {STEP_LABELS[application.current_step] || "In progress"} · Updated{" "}
            {formatDate(application.updated_at)}
            {application.applied_on && <> · Applied {formatDate(application.applied_on)}</>}
          </p>
          {link && (
            <a
              className="application-link"
              href={link}
              target="_blank"
              rel="noopener noreferrer"
            >
              View job posting ↗
            </a>
          )}
        </div>

        {application.ats_score !== null && (
          <div
            className="application-score"
            aria-label={`ATS score ${application.ats_score} out of 100`}
          >
            <strong>{application.ats_score}</strong>
            <span>ATS</span>
          </div>
        )}
      </div>

      <div className="application-card-actions">
        {trackerReady && (
          <label className="status-select">
            <span className="visually-hidden">Status</span>
            <select
              value={status}
              onChange={(e) => changeStatus(e.target.value)}
              aria-label={`Status for ${application.job_title || "application"}`}
            >
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        )}

        <button
          type="button"
          className="primary-action-button"
          onClick={() => onOpen(application.id)}
        >
          {analyzed ? "Open" : "Tailor Resume"}
        </button>

        {trackerReady && (
          <button
            type="button"
            className="application-details-toggle"
            aria-expanded={showDetails}
            onClick={() => setShowDetails((open) => !open)}
          >
            {showDetails ? "Hide Details" : application.notes ? "Notes ✎" : "Details"}
          </button>
        )}

        <button
          type="button"
          className="application-delete"
          onClick={() => onDelete(application)}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      {trackerReady && showDetails && (
        <div className="application-details">
          <label>
            Date Applied
            <input
              type="date"
              value={application.applied_on || ""}
              onChange={(e) =>
                onChange(application.id, { applied_on: e.target.value || null })
              }
            />
          </label>

          <label>
            Job Posting Link
            <input
              type="text"
              inputMode="url"
              placeholder="https://..."
              value={jobUrl}
              maxLength={2000}
              onChange={(e) => setJobUrl(e.target.value)}
              onBlur={() => {
                const next = safeUrl(jobUrl);
                setJobUrl(next);
                if (next !== (application.job_url || "")) {
                  onChange(application.id, { job_url: next });
                }
              }}
            />
          </label>

          <label className="application-notes">
            Notes
            <textarea
              placeholder="Recruiter name, interview date, follow-up reminders..."
              value={notes}
              maxLength={5000}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => {
                if (notes !== (application.notes || "")) {
                  onChange(application.id, { notes });
                }
              }}
            />
          </label>
        </div>
      )}
    </li>
  );
}

function MyApplications({ onOpen, onNew, onFindJobs, canReuseResume, autoStartWhenEmpty }) {
  const [applications, setApplications] = useState(null);
  const [trackerReady, setTrackerReady] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showTrackForm, setShowTrackForm] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    listApplications()
      .then(({ rows, trackerReady: ready }) => {
        if (cancelled) return;
        // Nothing saved and nothing in progress: go straight to a new one.
        if (rows.length === 0 && autoStartWhenEmpty) {
          onNew({ keepResume: false });
          return;
        }
        setTrackerReady(ready);
        setApplications(rows);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError.message);
          setApplications([]);
        }
      });

    return () => {
      cancelled = true;
    };
    // Load once when the page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleChange(id, fields) {
    const previous = applications;
    // Show the change right away; undo it if saving fails.
    setApplications((current) =>
      current.map((item) => (item.id === id ? { ...item, ...fields } : item)),
    );
    setError("");

    try {
      await updateTracking(id, fields);
    } catch (saveError) {
      setApplications(previous);
      setError(saveError.message);
    }
  }

  async function handleDelete(application) {
    const name = application.job_title || "this application";
    if (!window.confirm(`Delete ${name}? This can't be undone.`)) return;

    setDeletingId(application.id);
    setError("");

    try {
      await deleteApplication(application.id);
      setApplications((current) =>
        current.filter((item) => item.id !== application.id),
      );
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setDeletingId(null);
    }
  }

  const counts = (applications || []).reduce(
    (totals, item) => {
      const status = item.status || "saved";
      totals[status] = (totals[status] || 0) + 1;
      return totals;
    },
    { all: applications?.length || 0 },
  );

  const visible = (applications || []).filter(
    (item) => filter === "all" || (item.status || "saved") === filter,
  );

  return (
    <section className="wizard-step-page applications-page">
      <div className="step-page-header">
        <p className="step-kicker">Your Account</p>
        <h2>My Applications</h2>
        <p>
          Track every job you're applying to. Each analysis is saved privately
          to your account, so you can pick up where you left off.
        </p>
      </div>

      <div className="applications-actions">
        <button
          type="button"
          className="primary-action-button"
          onClick={() => onNew({ keepResume: false })}
        >
          + New Application
        </button>

        {canReuseResume && (
          <button
            type="button"
            className="secondary-button"
            onClick={() => onNew({ keepResume: true })}
          >
            New Application With My Current Resume
          </button>
        )}

        {onFindJobs && (
          <button type="button" className="secondary-button" onClick={onFindJobs}>
            🔍 Find Matching Jobs
          </button>
        )}

        {trackerReady && (
          <button
            type="button"
            className="secondary-button"
            onClick={() => setShowTrackForm(true)}
          >
            + Track a Job
          </button>
        )}
      </div>

      {showTrackForm && (
        <TrackJobForm
          onCancel={() => setShowTrackForm(false)}
          onSaved={(row) => {
            setApplications((current) => [row, ...(current || [])]);
            setShowTrackForm(false);
            setFilter("all");
          }}
        />
      )}

      {!trackerReady && (
        <p className="tracker-setup-note">
          Job tracking (status, dates and notes) will appear here once its
          database update is installed.
        </p>
      )}

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {applications === null && (
        <p className="applications-loading" role="status">
          Loading your applications...
        </p>
      )}

      {applications?.length === 0 && !error && (
        <p className="applications-loading">
          No saved applications yet. They're saved automatically once your ATS
          analysis is ready, or you can track a job you found.
        </p>
      )}

      {trackerReady && applications?.length > 0 && (
        <div className="tracker-filters" role="group" aria-label="Filter by status">
          {[{ id: "all", label: "All" }, ...STATUSES].map((option) => (
            <button
              key={option.id}
              type="button"
              className={filter === option.id ? "active" : ""}
              aria-pressed={filter === option.id}
              onClick={() => setFilter(option.id)}
            >
              {option.label} <span>{counts[option.id] || 0}</span>
            </button>
          ))}
        </div>
      )}

      {applications?.length > 0 && visible.length === 0 && (
        <p className="applications-loading">
          No applications marked “{statusLabel(filter)}”.
        </p>
      )}

      {visible.length > 0 && (
        <ul className="applications-list">
          {visible.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              trackerReady={trackerReady}
              onOpen={onOpen}
              onDelete={handleDelete}
              onChange={handleChange}
              deleting={deletingId === application.id}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export default MyApplications;
