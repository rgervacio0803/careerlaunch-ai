function ResumeInsights({ resumeInsights, recommendation, onContinue }) {
  if (!resumeInsights) return null;

  return (
    <section className="wizard-step-page insights-page">
      <div className="step-page-header">
        <p className="step-kicker">AI Coach</p>
        <h2>Resume Insights</h2>
        <p>
          CareerLaunch AI reviewed your resume like a recruiter and identified
          what to improve first.
        </p>
      </div>

      <div className="insights-grid">
        <div className="insight-card wide">
          <p className="insight-label">Overall Impression</p>
          <h3>🧠 Overall Impression</h3>
          <p>{resumeInsights.overallImpression}</p>
        </div>

        <div className="insight-card">
          <p className="insight-label">Biggest Strength</p>
          <h3>💪 Biggest Strength</h3>
          <p>
            {typeof resumeInsights.biggestStrength === "string"
              ? resumeInsights.biggestStrength
              : resumeInsights.biggestStrength?.description}
          </p>
        </div>

        <div className="insight-card">
          <p className="insight-label">Biggest Weakness</p>
          <h3>⚠️ Biggest Weakness</h3>
          <p>
            {typeof resumeInsights.biggestWeakness === "string"
              ? resumeInsights.biggestWeakness
              : resumeInsights.biggestWeakness?.description}
          </p>
        </div>

        <div className="insight-card wide">
          <p className="insight-label">Recruiter First Impression</p>
          <h3>What a hiring manager might notice</h3>
          <p>{resumeInsights.recruiterFirstImpression}</p>
        </div>

        <div className="insight-card wide">
          <p className="insight-label">Top Improvements</p>
          <h3>🚀 Top Improvements</h3>

          <ol className="insight-list">
            {resumeInsights.topImprovements?.map((item, index) => (
              <li key={index}>
                {typeof item === "string"
                  ? item
                  : item.description || item.title}
              </li>
            ))}
          </ol>
        </div>
        <div className="insight-card recommendation-card wide">
          <p className="insight-label">CareerLaunch Recommendation</p>
          <h3>⭐ Recommended Next Step</h3>
          <p>{recommendation.reason}</p>

          <div className="recommendation-box">
            <strong>Recommended Template:</strong>
            <span>{recommendation.template}</span>
          </div>
        </div>
      </div>

      <div className="analysis-actions">
        <button className="rewrite-button" onClick={onContinue}>
          Continue to Optimize Resume →
        </button>
      </div>
    </section>
  );
}

export default ResumeInsights;
