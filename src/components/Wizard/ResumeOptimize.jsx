import ModernResume from "../ResumeTemplates/ModernResume";
import ProfessionalResume from "../ResumeTemplates/ProfessionalResume";
import MinimalResume from "../ResumeTemplates/MinimalResume";

function ResumeOptimize({
  rewrittenResume,
  structuredResume,
  recommendation,
  selectedTemplate,
  setSelectedTemplate,
  resumePreviewRef,
  jobTitle,
  copyToClipboard,
  downloadRewrittenResume,
  handleCoverLetter,
}) {
  return (
    <section className="wizard-step-page optimize-page">
      <div className="step-page-header">
        <p className="step-kicker">Step 4</p>
        <h2>Choose Your Resume Template</h2>
        <p>
          Your resume has been optimized. Choose a professional template before
          downloading.
        </p>
      </div>

      <div className="optimized-card">
        <div className="optimized-header">
          <div>
            <h3>Template Gallery</h3>
            <p>
              Select a design, preview it, then download your polished resume.
            </p>
          </div>

          <div className="optimized-actions-top">
            <button
              className="copy-btn"
              onClick={() => copyToClipboard(rewrittenResume)}
            >
              Copy Resume
            </button>

            <button
              className="download-btn"
              onClick={() => downloadRewrittenResume(selectedTemplate)}
            >
              Download PDF
            </button>
          </div>
        </div>

        {structuredResume && (
          <div className="resume-preview-section">
            <div className="ai-template-recommendation">
              <div className="ai-recommendation-icon">🤖</div>

              <div>
                <p className="recommendation-title">
                  CareerLaunch AI Recommendation
                </p>

                <h3>{recommendation.template} Template</h3>

                <p>{recommendation.reason}</p>
              </div>
            </div>
            <div className="template-gallery-grid">
              <button
                className={
                  selectedTemplate === "modern"
                    ? "template-gallery-card active"
                    : "template-gallery-card"
                }
                onClick={() => setSelectedTemplate("modern")}
              >
                <div className="template-thumbnail">
                  <ModernResume resume={structuredResume} />
                </div>

                <strong>Modern</strong>
                <p>Clean blue-accent layout</p>
              </button>

              <button
                className={
                  selectedTemplate === "professional"
                    ? "template-gallery-card active"
                    : "template-gallery-card"
                }
                onClick={() => setSelectedTemplate("professional")}
              >
                <div className="template-thumbnail">
                  <ProfessionalResume resume={structuredResume} />
                </div>

                <strong>Professional</strong>
                <p>Classic corporate style</p>
              </button>

              <button
                className={
                  selectedTemplate === "minimal"
                    ? "template-gallery-card active"
                    : "template-gallery-card"
                }
                onClick={() => setSelectedTemplate("minimal")}
              >
                <div className="template-thumbnail">
                  <MinimalResume resume={structuredResume} />
                </div>

                <strong>Minimal</strong>
                <p>Simple and elegant</p>
              </button>
            </div>

            <h3>
              {selectedTemplate === "modern" && "Modern Resume Preview"}
              {selectedTemplate === "professional" &&
                "Professional Resume Preview"}
              {selectedTemplate === "minimal" && "Minimal Resume Preview"}
            </h3>
            <div ref={resumePreviewRef} className="pdf-capture-area">
              {selectedTemplate === "modern" && (
                <ModernResume resume={structuredResume} />
              )}

              {selectedTemplate === "professional" && (
                <ProfessionalResume resume={structuredResume} />
              )}

              {selectedTemplate === "minimal" && (
                <MinimalResume resume={structuredResume} />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="analysis-actions">
        <button
          className="interview-button"
          onClick={() => {
            handleCoverLetter();
          }}
        >
          Continue to Cover Letter →
        </button>
      </div>
    </section>
  );
}

export default ResumeOptimize;
