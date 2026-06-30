function CoverLetter({
  coverLetter,
  jobTitle,
  copyToClipboard,
  handleInterviewCoach,
  setCurrentStep,
}) {
  return (
    <section className="wizard-step-page optimize-page">
      <div className="step-page-header">
        <p className="step-kicker">Step 5</p>
        <h2>Cover Letter</h2>
        <p>
          Tailored for: <span>{jobTitle || "Target Position"}</span>
        </p>
      </div>

      <div className="optimized-card">
        <div className="optimized-header">
          <div>
            <h3>AI Generated Cover Letter</h3>
            <p>Review, copy, or use this as a starting point.</p>
          </div>

          <div className="optimized-actions-top">
            <button
              className="copy-btn"
              onClick={() => copyToClipboard(coverLetter)}
            >
              Copy Cover Letter
            </button>
          </div>
        </div>

        <pre className="cover-letter-text">{coverLetter}</pre>
      </div>

      <div className="analysis-actions">
        <button
          className="interview-button"
          onClick={() => {
            handleInterviewCoach();
            setCurrentStep(6);
          }}
        >
          Continue to Interview Prep →
        </button>
      </div>
    </section>
  );
}

export default CoverLetter;