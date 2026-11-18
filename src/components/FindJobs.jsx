import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { getApplication, listApplications } from "../utils/applications";

function postedLabel(job) {
  if (job.postedText) return job.postedText;
  if (!job.postedAt) return "";
  const days = Math.floor((Date.now() - new Date(job.postedAt).getTime()) / 86400000);
  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  return `Posted ${days} days ago`;
}

function scoreClass(score) {
  if (score >= 75) return "high";
  if (score >= 50) return "medium";
  return "low";
}

/**
 * Suggests current job openings that match the user's resume.
 * `search` holds the last search and its results (kept by App so going to
 * another screen and back doesn't lose them).
 */
function FindJobs({ resumeText, search, setSearch, onTailor, onTrack, onUploadResume }) {
  const [resume, setResume] = useState(resumeText);
  const [checkingResume, setCheckingResume] = useState(!resumeText);
  const [jobTitle, setJobTitle] = useState(search?.jobTitle || "");
  const [location, setLocation] = useState(search?.location || "");
  const [remote, setRemote] = useState(Boolean(search?.remote));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tracked, setTracked] = useState({});

  // No resume in this session: use the one from the latest saved application.
  useEffect(() => {
    if (resumeText) return;
    let cancelled = false;

    listApplications()
      .then(async ({ rows }) => {
        for (const row of rows.slice(0, 5)) {
          const { data } = await getApplication(row.id);
          if (data?.resumeText) {
            if (!cancelled) setResume(data.resumeText);
            return;
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setCheckingResume(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resumeText]);

  async function runSearch({ page = 1 } = {}) {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/job-matches", {
        resumeText: resume,
        jobTitle,
        location,
        remote: remote ? "true" : "false",
        page: String(page),
      });

      setSearch((current) => {
        const previous = page > 1 && current ? current.jobs : [];
        const seen = new Set(previous.map((job) => job.id));
        const fresh = data.jobs.filter((job) => !seen.has(job.id));
        return {
          jobTitle,
          location,
          remote,
          searchTitle: data.searchTitle,
          page,
          hasMore: fresh.length > 0,
          jobs: [...previous, ...fresh],
        };
      });
    } catch (searchError) {
      setError(searchError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleTrack(job) {
    setTracked((current) => ({ ...current, [job.id]: "saving" }));
    try {
      await onTrack(job, resume);
      setTracked((current) => ({ ...current, [job.id]: "done" }));
    } catch (trackError) {
      setTracked((current) => ({ ...current, [job.id]: undefined }));
      setError(trackError.message);
    }
  }

  if (checkingResume) {
    return (
      <p className="applications-loading" role="status">
        Getting your resume...
      </p>
    );
  }

  if (!resume) {
    return (
      <section className="wizard-step-page find-jobs-page">
        <div className="step-page-header">
          <p className="step-kicker">Find Jobs</p>
          <h2>Upload Your Resume First</h2>
          <p>We use your resume to find openings that match your experience.</p>
        </div>
        <div className="applications-actions">
          <button type="button" className="primary-action-button" onClick={onUploadResume}>
            Upload Resume
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="wizard-step-page find-jobs-page">
      <div className="step-page-header">
        <p className="step-kicker">Find Jobs</p>
        <h2>Jobs That Match Your Resume</h2>
        <p>
          Tell us where to look. We'll search current openings and rank them
          by how well they fit your experience.
        </p>
      </div>

      <form
        className="find-jobs-form"
        onSubmit={(e) => {
          e.preventDefault();
          runSearch();
        }}
      >
        <label htmlFor="find-location">
          <span className="field-label">Location</span>
          <input
            id="find-location"
            placeholder="City, state (e.g. Chino Hills, CA)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            maxLength={120}
            disabled={remote}
          />
        </label>

        <label htmlFor="find-title">
          <span className="field-label">
            Job Title <em>(optional)</em>
          </span>
          <input
            id="find-title"
            placeholder={search?.searchTitle || "We'll use the title from your resume"}
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            maxLength={120}
          />
        </label>

        <label className="find-jobs-remote">
          <input
            type="checkbox"
            checked={remote}
            onChange={(e) => setRemote(e.target.checked)}
          />
          Remote jobs only
        </label>

        <button
          type="submit"
          className="primary-action-button"
          disabled={loading || (!remote && !location.trim())}
        >
          {loading && !search?.jobs?.length ? "Searching..." : "Find Matching Jobs"}
        </button>
      </form>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {loading && !search?.jobs?.length && (
        <p className="applications-loading" role="status">
          Searching current openings and ranking them against your resume.
          This can take up to a minute...
        </p>
      )}

      {search && (
        <>
          <p className="find-jobs-summary">
            {search.jobs.length
              ? `Showing ${search.jobs.length} ${search.searchTitle} jobs ${
                  search.remote ? "that are remote" : `near ${search.location}`
                }, best matches first.`
              : `No ${search.searchTitle} jobs found ${
                  search.remote ? "that are remote" : `near ${search.location}`
                }. Try a nearby city, a different job title, or Remote.`}
          </p>

          <ul className="job-match-list">
            {search.jobs.map((job) => (
              <li key={job.id} className="job-match-card">
                <div className="job-match-top">
                  <div className="job-match-main">
                    <h3>{job.title}</h3>
                    <p className="application-company">{job.company}</p>
                    <p className="application-meta">
                      {[job.remote ? "Remote" : job.location, postedLabel(job), job.salary]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>

                  {job.score !== null && (
                    <div
                      className={`job-match-score ${scoreClass(job.score)}`}
                      aria-label={`${job.score}% match`}
                    >
                      <strong>{job.score}%</strong>
                      <span>match</span>
                    </div>
                  )}
                </div>

                {job.reason && <p className="job-match-reason">✓ {job.reason}</p>}
                {job.gap && <p className="job-match-gap">Missing: {job.gap}</p>}

                <div className="application-card-actions">
                  <button
                    type="button"
                    className="primary-action-button"
                    onClick={() => onTailor(job, resume)}
                    disabled={!job.description}
                  >
                    Tailor Resume
                  </button>

                  <button
                    type="button"
                    className="application-details-toggle"
                    onClick={() => handleTrack(job)}
                    disabled={Boolean(tracked[job.id])}
                  >
                    {tracked[job.id] === "done"
                      ? "✓ Tracked"
                      : tracked[job.id] === "saving"
                        ? "Saving..."
                        : "Track for Later"}
                  </button>

                  {job.applyLink && (
                    <a
                      className="application-link"
                      href={job.applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View posting ↗
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {search.jobs.length > 0 && search.hasMore && (
            <div className="applications-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => runSearch({ page: (search.page || 1) + 1 })}
                disabled={loading}
              >
                {loading ? "Loading..." : "Show More Jobs"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default FindJobs;
