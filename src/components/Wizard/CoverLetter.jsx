import CoverLetterHeader from "../ResumeTemplates/CoverLetterHeader";
import CoverLetterThumbnail from "../ResumeTemplates/CoverLetterThumbnail";

function CoverLetter({
  coverLetter,
  jobTitle,
  selectedTemplate,
  structuredResume,
  coverLetterPreviewRef,

  copyToClipboard,
  downloadCoverLetter,
  handleInterviewCoach,
  handleCoverLetter,
  setCurrentStep,

  companyName,

  hiringManager,
  setHiringManager,

  lastGeneratedHiringManager,

  coverLetterDate,
}) {
  const needsRegeneration = hiringManager.trim() !== lastGeneratedHiringManager;

  return (
    <section className="wizard-step-page optimize-page">
      <div className="step-page-header">
        <p className="step-kicker">Step 5</p>

        <h2>Cover Letter Builder</h2>

        <p>
          Review your details and download a professional cover letter for{" "}
          <span>{jobTitle || "your target position"}</span>.
        </p>
      </div>

      <div className="cover-letter-builder">
        <div className="cover-letter-details-panel">
          <div className="cover-letter-panel-heading">
            <p className="cover-letter-panel-kicker">Step 1</p>

            <h3>Application Details</h3>

            <p>
              Review your application details before generating or updating your
              cover letter.
            </p>
          </div>

          <div className="cover-letter-info-grid">
            <div className="cover-letter-field">
              <label>Target Company</label>

              <input type="text" value={companyName} readOnly />
            </div>

            <div className="cover-letter-field">
              <label>
                Hiring Manager <span>(Optional)</span>
              </label>

              <input
                type="text"
                value={hiringManager}
                onChange={(event) => setHiringManager(event.target.value)}
                placeholder="Example: Jane Smith"
              />
            </div>

            <div className="cover-letter-field">
              <label>Date</label>

              <input type="text" value={coverLetterDate} readOnly />
            </div>
          </div>
          {needsRegeneration && (
            <div className="cover-letter-update-notice">
              {/* LEFT SIDE */}

              <div className="cover-letter-update-notice-content">
                <h4>🔄 Cover Letter Update Available</h4>

                <p>You've changed your application details.</p>

                <p>
                  Update your cover letter to include the latest information.
                </p>
              </div>

              {/* RIGHT SIDE */}

              <div className="cover-letter-update-action">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleCoverLetter}
                >
                  Update Cover Letter →
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="cover-letter-preview-panel">
          <div className="optimized-header cover-letter-preview-header">
            <div>
              <h3>Cover Letter Preview</h3>

              <p>Review your letter before copying or downloading it.</p>
            </div>

            <div className="optimized-actions-top cover-letter-actions">
              <button
                type="button"
                className="copy-btn"
                onClick={() => copyToClipboard(coverLetter)}
              >
                Copy Letter
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

          <>
            <div className="mobile-cover-letter-preview">
              <CoverLetterThumbnail>
                <div
                  className={`cover-letter-paper cover-letter-${selectedTemplate}`}
                >
                  <CoverLetterHeader
                    template={selectedTemplate}
                    structuredResume={structuredResume}
                  />

                  <div className="cover-letter-recipient">
                    <p>{coverLetterDate}</p>

                    {hiringManager && <p>{hiringManager}</p>}

                    {companyName && <p>{companyName}</p>}
                  </div>

                  <pre className="cover-letter-text">{coverLetter}</pre>
                </div>
              </CoverLetterThumbnail>
            </div>

            <div
              ref={coverLetterPreviewRef}
              className={`cover-letter-paper cover-letter-${selectedTemplate} desktop-cover-letter-preview`}
            >
              <CoverLetterHeader
                template={selectedTemplate}
                structuredResume={structuredResume}
              />

              <div className="cover-letter-recipient">
                <p>{coverLetterDate}</p>

                {hiringManager && <p>{hiringManager}</p>}

                {companyName && <p>{companyName}</p>}
              </div>

              <pre className="cover-letter-text">{coverLetter}</pre>
            </div>
          </>
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
