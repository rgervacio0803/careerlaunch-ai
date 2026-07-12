function RewritePlanProgress({ currentStep }) {
  const steps = [
    "Reviewing recruiter insights",
    "Identifying the highest-impact improvements",
    "Building your rewrite strategy",
  ];

  return (
    <section className="optimization-progress-page">
      <div className="optimization-progress-card">
        <div className="optimization-progress-icon">🧠</div>

        <p className="step-kicker">CareerLaunch AI</p>
        <h2>Building your rewrite strategy</h2>

        <p className="optimization-progress-description">
          CareerLaunch AI is turning your recruiter feedback into a clear,
          personalized action plan.
        </p>

        <div className="optimization-progress-bar">
          <div className="optimization-progress-bar-fill"></div>
        </div>

        <div className="optimization-progress-steps">
          {steps.map((label, index) => {
            const status =
              index < currentStep
                ? "complete"
                : index === currentStep
                  ? "active"
                  : "pending";

            return (
              <div
                key={label}
                className={`optimization-progress-step ${status}`}
              >
                <span>{status === "complete" ? "✓" : ""}</span>
                <p>{label}</p>
              </div>
            );
          })}
        </div>

        <p className="optimization-progress-note">
          This usually takes only a few seconds.
        </p>
      </div>
    </section>
  );
}

export default RewritePlanProgress;