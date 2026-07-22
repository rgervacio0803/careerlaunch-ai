function CoverLetter({
  coverLetter,
  jobTitle,
  copyToClipboard,
  downloadCoverLetter,
  handleInterviewCoach,
  setCurrentStep,

  companyName,

  hiringManager,
  setHiringManager,

  coverLetterDate,
}) {
  return (
    <section className="wizard-step-page optimize-page">
      <div className="step-page-header">
        <p className="step-kicker">Step 7</p>

        <h2>Cover Letter Builder</h2>

        <p>
          Review your details and download a professional cover letter for{" "}
          <span>{jobTitle || "your target position"}</span>.
        </p>
      </div>

      <div className="cover-letter-builder">
        <div className="cover-letter-details-panel">
          <div className="cover-letter-panel-heading">
            <p className="cover-letter-panel-kicker">
              Application Details
            </p>

            <h3>Personalize Your Cover Letter</h3>

            <p>
              Confirm the company and add the hiring manager’s name when
              available.
            </p>
          </div>

          <div className="cover-letter-info-grid">
            <div className="cover-letter-field">
              <label>Company</label>

              <input
                type="text"
                value={companyName}
                readOnly
              />
            </div>

            <div className="cover-letter-field">
              <label>
                Hiring Manager <span>(Optional)</span>
              </label>

              <input
                type="text"
                value={hiringManager}
                onChange={(event) =>
                  setHiringManager(event.target.value)
                }
                placeholder="Example: Jane Smith"
              />
            </div>

            <div className="cover-letter-field">
              <label>Date</label>

              <input
                type="text"
                value={coverLetterDate}
                readOnly
              />
            </div>
          </div>
        </div>

        <div className="cover-letter-preview-panel">
          <div className="cover-letter-preview-header">
            <div>
              <p className="cover-letter-panel-kicker">
                Document Preview
              </p>

              <h3>AI-Generated Cover Letter</h3>

              <p>
                Review the letter before copying or downloading it.
              </p>
            </div>

            <div className="cover-letter-actions">
              <button
                type="button"
                className="copy-btn"
                onClick={() => copyToClipboard(coverLetter)}
              >
                Copy
              </button>

              <button
                type="button"
                className="download-btn"
                onClick={downloadCoverLetter}
              >
                Download PDF
              </button>
            </div>
          </div>

          <div className="cover-letter-paper">
            <div className="cover-letter-recipient">
              <p>{coverLetterDate}</p>

              {hiringManager && <p>{hiringManager}</p>}

              {companyName && <p>{companyName}</p>}
            </div>

            <pre className="cover-letter-text">
              {coverLetter}
            </pre>
          </div>
        </div>
      </div>

      <div className="analysis-actions">
        <button
          type="button"
          className="interview-button"
          onClick={() => {
            handleInterviewCoach();
            setCurrentStep(8);
          }}
        >
          Continue to Interview Prep →
        </button>
      </div>
    </section>
  );
}

export default CoverLetter;