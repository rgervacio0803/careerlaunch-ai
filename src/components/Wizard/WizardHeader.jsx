function WizardHeader({ currentStep, onBack, onReset }) {
  return (
    <>
      <header className="hero">
        <p className="eyebrow">Resume • Cover Letter • Interview Prep</p>

        <h1>CareerLaunch AI</h1>

        <p className="subtitle">
          Upload your resume and paste a job description to get ATS feedback, an
          optimized resume rewrite, a tailored cover letter, and interview prep.
        </p>
      </header>

      <section className="steps">
        <div className={currentStep === 1 ? "step active" : "step"}>
          <span>1</span>
          <p>Upload</p>
        </div>

        <div className={currentStep === 2 ? "step active" : "step"}>
          <span>2</span>
          <p>Job Match</p>
        </div>

        <div className={currentStep === 3 ? "step active" : "step"}>
          <span>3</span>
          <p>ATS Analysis</p>
        </div>

        <div
          className={
            currentStep === 4 || currentStep === 5 || currentStep === 6
              ? "step active"
              : "step"
          }
        >
          <span>4</span>
          <p>Optimize</p>
        </div>

        <div className={currentStep === 7 ? "step active" : "step"}>
          <span>5</span>
          <p>Cover Letter</p>
        </div>

        <div className={currentStep === 8 ? "step active" : "step"}>
          <span>6</span>
          <p>Interview Prep</p>
        </div>
      </section>

      <div className="wizard-nav">
        {currentStep > 1 && (
          <button className="back-link" onClick={onBack}>
            ← Back
          </button>
        )}

        {currentStep > 1 && (
          <button className="start-over-link" onClick={onReset}>
            <span className="start-over-icon">↻</span>
            Start Over
          </button>
        )}
      </div>
    </>
  );
}

export default WizardHeader;
