import ModernResume from "../ResumeTemplates/ModernResume";
import ProfessionalResume from "../ResumeTemplates/ProfessionalResume";
import MinimalResume from "../ResumeTemplates/MinimalResume";

function ResumeOptimize({
  rewrittenResume,
  structuredResume,
  selectedTemplate,
  setSelectedTemplate,
  jobTitle,
  copyToClipboard,
  downloadRewrittenResume,
  handleCoverLetter,
}) {
  return (
    <section className="wizard-step-page optimize-page">
      <div className="step-page-header">
        <p className="step-kicker">Step 4</p>
        <h2>Optimized Resume</h2>
        <p>
          Tailored for: <span>{jobTitle || "Target Position"}</span>
        </p>
      </div>

      <div className="optimized-card">
        <div className="optimized-header">
          <div>
            <h3>ATS Optimized Resume</h3>
            <p>Review, copy, or download your rewritten resume.</p>
          </div>

          <div className="optimized-actions-top">
            <button
              className="copy-btn"
              onClick={() => copyToClipboard(rewrittenResume)}
            >
              Copy Resume
            </button>

            <button className="download-btn" onClick={downloadRewrittenResume}>
              Download PDF
            </button>
          </div>
        </div>

        <pre className="optimized-resume-text">{rewrittenResume}</pre>

        {structuredResume && (
          <div className="resume-preview-section">
            <div className="template-card-grid">
              <button
                className={
                  selectedTemplate === "modern"
                    ? "template-card active"
                    : "template-card"
                }
                onClick={() => setSelectedTemplate("modern")}
              >
                <div className="template-mini modern-mini">
                  <div></div>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <strong>Modern</strong>
                <p>Clean blue-accent layout</p>
              </button>

              <button
                className={
                  selectedTemplate === "professional"
                    ? "template-card active"
                    : "template-card"
                }
                onClick={() => setSelectedTemplate("professional")}
              >
                <div className="template-mini professional-mini">
                  <div></div>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <strong>Professional</strong>
                <p>Classic corporate style</p>
              </button>

              <button
                className={
                  selectedTemplate === "minimal"
                    ? "template-card active"
                    : "template-card"
                }
                onClick={() => setSelectedTemplate("minimal")}
              >
                <div className="template-mini minimal-mini">
                  <div></div>
                  <span></span>
                  <span></span>
                  <span></span>
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
        )}
      </div>

      <div className="analysis-actions">
        <button className="interview-button" onClick={handleCoverLetter}>
          Continue to Cover Letter →
        </button>
      </div>
    </section>
  );
}

export default ResumeOptimize;
