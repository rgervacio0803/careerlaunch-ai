function ResumeOptimize({
  rewrittenResume,
  jobTitle,
  copyToClipboard,
  downloadRewrittenResume,
  handleCoverLetter,
}) {
  return (
    <section className="wizard-step-page optimize-page">
      <div className="step-page-header">
        <p className="step-kicker">Step 4</p>
        <h2>Optimized Resume</h2>
        <p>
          Tailored for: <span>{jobTitle || "Target Position"}</span>
        </p>
      </div>

      <div className="optimized-card">
        <div className="optimized-header">
          <div>
            <h3>ATS Optimized Resume</h3>
            <p>Review, copy, or download your rewritten resume.</p>
          </div>

          <div className="optimized-actions-top">
            <button
              className="copy-btn"
              onClick={() => copyToClipboard(rewrittenResume)}
            >
              Copy Resume
            </button>

            <button className="download-btn" onClick={downloadRewrittenResume}>
              Download PDF
            </button>
          </div>
        </div>

        <pre className="optimized-resume-text">{rewrittenResume}</pre>
      </div>

      <div className="analysis-actions">
        <button className="interview-button" onClick={handleCoverLetter}>
          Continue to Cover Letter →
        </button>
      </div>
    </section>
  );
}

export default ResumeOptimize;