function AIRewritePlan({ rewritePlan, onContinue }) {
  if (!rewritePlan) return null;

  return (
    <section className="wizard-step-page">
      <div className="step-page-header">
        <p className="step-kicker">AI Rewrite Plan</p>

        <h2>Here's how I'll improve your resume</h2>

        <p>
          Before rewriting your resume, CareerLaunch AI creates a plan based on
          the recruiter feedback.
        </p>
      </div>

      <div className="insights-grid">
        <div className="insight-card wide">
          <h3>🎯 Highest Priority</h3>

          <p>{rewritePlan.highestPriority}</p>
        </div>

        <div className="insight-card wide">
          <h3>🛠 Planned Improvements</h3>

          <ol className="insight-list">
            {rewritePlan.plannedImprovements?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ol>
        </div>

        <div className="insight-card wide">
          <h3>✅ What the AI will do</h3>

          <ul className="insight-list">
            {rewritePlan.aiActions?.map((action, index) => (
              <li key={index}>{action}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="analysis-actions">
        <button className="rewrite-button" onClick={onContinue}>
          Apply Rewrite Plan →
        </button>
      </div>
    </section>
  );
}

export default AIRewritePlan;
