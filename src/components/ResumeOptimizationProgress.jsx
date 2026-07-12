function ResumeOptimizationProgress({ currentStep }) {
  const steps = [
    "Understanding your career history",
    "Building your professional summary",
    "Optimizing your experience",
    "Improving ATS keywords and skills",
    "Performing a final quality review",
  ];

  return (
    <section className="optimization-progress-page">
      <div className="optimization-progress-card">
        <div className="optimization-progress-icon">✨</div>

        <p className="step-kicker">CareerLaunch AI</p>
        <h2>Optimizing your resume</h2>

        <p className="optimization-progress-description">
          Your rewrite strategy is being applied across each section of your
          resume.
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
          This usually takes a few moments. Please keep this page open.
        </p>
      </div>
    </section>
  );
}

export default ResumeOptimizationProgress;