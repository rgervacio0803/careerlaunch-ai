function ATSResults({
  result,
  jobTitle,
  copyToClipboard,
  downloadReport,
  handleRewriteResume,
  setCurrentStep,
}) {
  return (
    <section className="wizard-step-page analysis-page">
      <div className="step-page-header">
        <p className="step-kicker">Step 3</p>
        <h2>ATS Analysis Results</h2>
        <p>
          Resume match for: <span>{jobTitle || "Target Position"}</span>
        </p>
      </div>

      <div className="ats-summary-card">
        <div className="ats-card-header">
          <div className="ats-icon">🏅</div>
          <div>
            <h3>ATS Compatibility Score</h3>
            <p>How well your resume matches the job</p>
          </div>
        </div>

        <div className="ats-score-layout">
          <div className="ats-score-bullets">
            <h4>ATS Score Breakdown</h4>

            <ul>
              {result.scoreExplanation?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="circle-score">
            <div className="circle-inner">
              <span>{result.atsScore}</span>
            </div>
            <p>OVERALL</p>
          </div>
        </div>
      </div>

      <div className="analysis-grid">
        <div className="analysis-card">
          <h3>✅ Resume Strengths</h3>

          <ul>
            {result.resumeStrengths?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="analysis-card">
          <h3>❌ Missing Keywords</h3>

          <div className="tag-list">
            {result.missingKeywords?.map((keyword, index) => (
              <span key={index} className="tag tag-red">
                {keyword}
              </span>
            ))}
          </div>
        </div>

        <div className="analysis-card">
          <div className="card-header">
            <h3>📝 Resume Suggestions</h3>

            <button
              className="copy-btn"
              onClick={() =>
                copyToClipboard(result.resumeSuggestions?.join("\n"))
              }
            >
              Copy
            </button>
          </div>

          <ul>
            {result.resumeSuggestions?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="analysis-card">
          <h3>💡 Career Advice</h3>

          <ul>
            {result.careerAdvice?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="analysis-actions">
        <button className="download-btn" onClick={downloadReport}>
          Download PDF Report
        </button>

        <button
          className="rewrite-button"
          onClick={() => {
            handleRewriteResume();
            setCurrentStep(4);
          }}
        >
          Continue to Optimize Resume →
        </button>
      </div>
    </section>
  );
}

export default ATSResults;