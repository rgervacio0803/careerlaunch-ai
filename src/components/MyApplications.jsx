import { useEffect, useState } from "react";
import { deleteApplication, listApplications } from "../utils/applications";

const STEP_LABELS = {
  1: "Resume uploaded",
  2: "Job details added",
  3: "ATS analysis ready",
  4: "Resume insights ready",
  5: "Rewrite plan ready",
  6: "Optimized resume ready",
  7: "Cover letter ready",
  8: "Interview prep ready",
};

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function MyApplications({ onOpen, onNew, canReuseResume, autoStartWhenEmpty }) {
  const [applications, setApplications] = useState(null);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    listApplications()
      .then((rows) => {
        if (cancelled) return;
        // Nothing saved and nothing in progress: go straight to a new one.
        if (rows.length === 0 && autoStartWhenEmpty) {
          onNew({ keepResume: false });
          return;
        }
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

  return (
    <section className="wizard-step-page applications-page">
      <div className="step-page-header">
        <p className="step-kicker">Your Account</p>
        <h2>My Applications</h2>
        <p>
          Every analysis is saved privately to your account. Open one to pick
          up where you left off.
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
      </div>

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
          analysis is ready.
        </p>
      )}

      {applications?.length > 0 && (
        <ul className="applications-list">
          {applications.map((application) => (
            <li key={application.id} className="application-card">
              <div className="application-card-main">
                <h3>{application.job_title || "Untitled application"}</h3>
                {application.company_name && (
                  <p className="application-company">
                    {application.company_name}
                  </p>
                )}
                <p className="application-meta">
                  {STEP_LABELS[application.current_step] || "In progress"} ·
                  Updated {formatDate(application.updated_at)}
                </p>
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

              <div className="application-card-actions">
                <button
                  type="button"
                  className="primary-action-button"
                  onClick={() => onOpen(application.id)}
                >
                  Open
                </button>
                <button
                  type="button"
                  className="application-delete"
                  onClick={() => handleDelete(application)}
                  disabled={deletingId === application.id}
                >
                  {deletingId === application.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default MyApplications;
