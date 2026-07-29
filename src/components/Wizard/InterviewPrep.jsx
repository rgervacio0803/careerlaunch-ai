function InterviewPrep({
  interviewQuestions,
  jobTitle,
  downloadInterviewPrep,
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
        <button className="primary-action-button" onClick={downloadInterviewPrep}>
          Download Interview Prep PDF
        </button>
      </div>

      <div className="interview-grid">
        <div className="interview-panel">
          <h3>💻 Technical Questions</h3>
          {interviewQuestions.technicalQuestions?.map((item, index) => (
            <div key={index} className="interview-card">
              <p className="question-label">Question</p>
              <h4>{item.question}</h4>
              <p className="answer-label">Suggested Answer</p>
              <p>{item.answer}</p>
            </div>
          ))}
        </div>

        <div className="interview-panel">
          <h3>🤝 Behavioral Questions</h3>
          {interviewQuestions.behavioralQuestions?.map((item, index) => (
            <div key={index} className="interview-card">
              <p className="question-label">Question</p>
              <h4>{item.question}</h4>
              <p className="answer-label">Suggested Answer</p>
              <p>{item.answer}</p>
            </div>
          ))}
        </div>

        <div className="interview-panel">
          <h3>🔄 Career Switch Questions</h3>
          {interviewQuestions.careerSwitchQuestions?.map((item, index) => (
            <div key={index} className="interview-card">
              <p className="question-label">Question</p>
              <h4>{item.question}</h4>
              <p className="answer-label">Suggested Answer</p>
              <p>{item.answer}</p>
            </div>
          ))}
        </div>

        <div className="interview-panel">
          <h3>🏢 Questions to Ask the Employer</h3>
          <div className="employer-question-list">
            {interviewQuestions.employerQuestions?.map((question, index) => (
              <div key={index} className="employer-question">
                {question}
              </div>
            ))}
          </div>
        </div>
      </div>

<div className="completion-card">
  <h2>✓ CareerLaunch AI Analysis Complete</h2>

  <p>
    Your resume analysis, optimized resume, cover letter, and interview prep
    are complete.
  </p>

  <div className="completion-actions">
    <button className="secondary-button" onClick={handleReset}>
      Start New Analysis
    </button>
  </div>
</div>
    </section>
  );
}

export default InterviewPrep;