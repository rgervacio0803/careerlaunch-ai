function InterviewPrep({
  interviewQuestions,
  jobTitle,
  downloadInterviewPrep,
  interviewPrepRef,
  handleReset,
}) {
  const renderQuestionSection = (title, questions = []) => {
    return (
      <div className="interview-panel">
        <h3>{title}</h3>

        <div className="interview-card-list">
          {questions.map((item, index) => (
            <div key={index} className="interview-card">
              <div className="interview-question-number">
                Question {index + 1}
              </div>

              <h4>{item.question}</h4>

              <div className="interview-answer">
                <p className="answer-label">Suggested Answer</p>
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

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
          onClick={downloadInterviewPrep}
        >
          Download Interview Prep PDF
        </button>
      </div>

      <div ref={interviewPrepRef} className="interview-grid">
        {renderQuestionSection(
          "💻 Technical Questions",
          interviewQuestions.technicalQuestions,
        )}

        {renderQuestionSection(
          "🤝 Behavioral Questions",
          interviewQuestions.behavioralQuestions,
        )}

        {renderQuestionSection(
          "🔄 Career Switch Questions",
          interviewQuestions.careerSwitchQuestions,
        )}

        <div className="interview-panel employer-panel">
          <h3>🏢 Questions to Ask the Employer</h3>

          <div className="employer-question-list">
            {interviewQuestions.employerQuestions?.map((question, index) => (
              <div key={index} className="employer-question">
                <span className="employer-question-number">{index + 1}</span>
                <p>{question}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="completion-card">
        <div className="completion-icon">✓</div>

        <h2>CareerLaunch AI Analysis Complete</h2>

        <p>
          Your resume analysis, optimized resume, cover letter, and interview
          preparation are complete.
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
