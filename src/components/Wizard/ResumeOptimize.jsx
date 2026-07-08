import ModernResume from "../ResumeTemplates/ModernResume";
import ProfessionalResume from "../ResumeTemplates/ProfessionalResume";
import MinimalResume from "../ResumeTemplates/MinimalResume";
import ExecutiveResume from "../ResumeTemplates/ExecutiveResume";
import TechResume from "../ResumeTemplates/TechResume";

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

                <h3>⭐ Recommended for You</h3>

                <h2 className="recommended-template-name">
                  {recommendation.template}
                </h2>

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

                {recommendation.template.toLowerCase() === "modern" && (
                  <div className="ai-recommended-badge">⭐ AI Recommended</div>
                )}

                {selectedTemplate === "modern" && (
                  <div className="selected-template-badge">✓ Selected</div>
                )}

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

                {recommendation.template.toLowerCase() === "professional" && (
                  <div className="ai-recommended-badge">⭐ AI Recommended</div>
                )}

                {selectedTemplate === "professional" && (
                  <div className="selected-template-badge">✓ Selected</div>
                )}

                <p>Classic corporate style</p>
              </button>

              <button
                className={
                  selectedTemplate === "executive"
                    ? "template-gallery-card active"
                    : "template-gallery-card"
                }
                onClick={() => setSelectedTemplate("executive")}
              >
                <div className="template-thumbnail">
                  <ExecutiveResume resume={structuredResume} />
                </div>

                <strong>Executive</strong>

                {recommendation.template.toLowerCase() === "executive" && (
                  <div className="ai-recommended-badge">⭐ AI Recommended</div>
                )}

                {selectedTemplate === "executive" && (
                  <div className="selected-template-badge">✓ Selected</div>
                )}

                <p>Leadership and executive style</p>
              </button>

              <button
                className={
                  selectedTemplate === "tech"
                    ? "template-gallery-card active"
                    : "template-gallery-card"
                }
                onClick={() => setSelectedTemplate("tech")}
              >
                <div className="template-thumbnail">
                  <TechResume resume={structuredResume} />
                </div>

                <strong>Tech</strong>

                {recommendation.template.toLowerCase() === "tech" && (
                  <div className="ai-recommended-badge">⭐ AI Recommended</div>
                )}

                {selectedTemplate === "tech" && (
                  <div className="selected-template-badge">✓ Selected</div>
                )}

                <p>Developer-focused skills layout</p>
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

                {recommendation.template.toLowerCase() === "minimal" && (
                  <div className="ai-recommended-badge">⭐ AI Recommended</div>
                )}

                {selectedTemplate === "minimal" && (
                  <div className="selected-template-badge">✓ Selected</div>
                )}

                <p>Simple and elegant</p>
              </button>
            </div>

            <h3>
              {selectedTemplate.charAt(0).toUpperCase() +
                selectedTemplate.slice(1)}{" "}
              Resume Preview
            </h3>
            <div ref={resumePreviewRef} className="pdf-capture-area">
              {selectedTemplate === "modern" && (
                <ModernResume resume={structuredResume} />
              )}

              {selectedTemplate === "professional" && (
                <ProfessionalResume resume={structuredResume} />
              )}

              {selectedTemplate === "executive" && (
                <ExecutiveResume resume={structuredResume} />
              )}

              {selectedTemplate === "tech" && (
                <TechResume resume={structuredResume} />
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
