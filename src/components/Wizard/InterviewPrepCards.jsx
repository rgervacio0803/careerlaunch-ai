// The interview question cards. Shared by the Interview Prep step and its PDF
// download, so the PDF always looks like the page.

function QuestionSection({ title, questions = [] }) {
  return (
    <div className="interview-panel">
      <h3>{title}</h3>

      <div className="interview-card-list">
        {questions.map((item, index) => (
          <div key={index} className="interview-card" data-pdf-keep>
            <div className="interview-question-number">Question {index + 1}</div>

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
}

export function InterviewPrepCards({ interviewQuestions, showIcons = true }) {
  // PDF fonts can't draw emoji, so the PDF leaves the icons out.
  const icon = (emoji) => (showIcons ? `${emoji} ` : "");

  return (
    <div className="interview-grid">
      <QuestionSection
        title={`${icon("💻")}Technical Questions`}
        questions={interviewQuestions.technicalQuestions}
      />

      <QuestionSection
        title={`${icon("🤝")}Behavioral Questions`}
        questions={interviewQuestions.behavioralQuestions}
      />

      <QuestionSection
        title={`${icon("🔄")}Motivation & Fit Questions`}
        questions={interviewQuestions.careerSwitchQuestions}
      />

      <div className="interview-panel employer-panel">
        <h3>{icon("🏢")}Questions to Ask the Employer</h3>

        <div className="employer-question-list">
          {interviewQuestions.employerQuestions?.map((question, index) => (
            <div key={index} className="employer-question" data-pdf-keep>
              <span className="employer-question-number">{index + 1}</span>
              <p>{question}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Printable page: a title, then the same cards as the Interview Prep step. */
export function InterviewPrepDocument({ interviewQuestions, jobTitle }) {
  return (
    <div className="interview-page interview-pdf-document">
      <header className="interview-pdf-header">
        <h1>Interview Preparation Guide</h1>
        <p>{jobTitle || "Target Position"}</p>
      </header>

      <InterviewPrepCards interviewQuestions={interviewQuestions} showIcons={false} />
    </div>
  );
}
