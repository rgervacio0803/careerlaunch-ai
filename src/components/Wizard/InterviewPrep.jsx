import { InterviewPrepCards } from "./InterviewPrepCards";

function InterviewPrep({
  interviewQuestions,
  jobTitle,
  onDownload,
  handleReset,
}) {
  return (
    <section className="wizard-step-page interview-page">
      <div className="step-page-header">
        <p className="step-kicker">Step 6</p>

        <h2>Interview Preparation</h2>

        <p>
          Personalized interview questions for:
          <span> {jobTitle || "Target Position"}</span>
        </p>
      </div>

      <div className="interview-top-actions">
        <button
          type="button"
          className="primary-action-button"
          onClick={onDownload}
        >
          Download Interview Prep PDF
        </button>
      </div>

      <InterviewPrepCards interviewQuestions={interviewQuestions} />

      <div className="completion-card">
        <div className="completion-icon" aria-hidden="true">
          ✓
        </div>

        <h2>Your Career Toolkit Is Ready</h2>
        <p>
          Your optimized resume, tailored cover letter, and personalized
          interview preparation are ready.
        </p>

        <div className="completion-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={handleReset}
          >
            Start New Analysis
          </button>
        </div>
      </div>
    </section>
  );
}

export default InterviewPrep;
