import ModernResume from "../ResumeTemplates/ModernResume";
import ProfessionalResume from "../ResumeTemplates/ProfessionalResume";
import MinimalResume from "../ResumeTemplates/MinimalResume";
import ExecutiveResume from "../ResumeTemplates/ExecutiveResume";
import TechResume from "../ResumeTemplates/TechResume";
import ExecutiveEliteResume from "../ResumeTemplates/ExecutiveEliteResume";

const templateOptions = [
  {
    id: "executive-elite",
    name: "Executive Elite",
    description: "Leadership-focused premium layout",
    bestFor: "Management, healthcare, and senior professionals",
    component: ExecutiveEliteResume,
  },
  {
    id: "modern",
    name: "Modern",
    description: "Clean blue-accent layout",
    bestFor: "General professional roles",
    component: ModernResume,
  },
  {
    id: "professional",
    name: "Professional",
    description: "Classic corporate style",
    bestFor: "Business and corporate roles",
    component: ProfessionalResume,
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and elegant",
    bestFor: "ATS-friendly applications",
    component: MinimalResume,
  },
  {
    id: "executive",
    name: "Executive",
    description: "Leadership and executive style",
    bestFor: "Managers and directors",
    component: ExecutiveResume,
  },
  {
    id: "tech",
    name: "Tech",
    description: "Developer-focused skills layout",
    bestFor: "Software, IT, and engineering",
    component: TechResume,
  },
];

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
              {templateOptions.map((template) => {
                const TemplateComponent = template.component;
                const isSelected = selectedTemplate === template.id;

                const recommendedId = recommendation.template
                  .toLowerCase()
                  .replaceAll(" ", "-");

                const isRecommended = recommendedId === template.id;

                return (
                  <button
                    key={template.id}
                    className={
                      isSelected
                        ? "template-gallery-card active"
                        : "template-gallery-card"
                    }
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div
                      className={`template-thumbnail ${
                        template.id === "executive-elite"
                          ? "executive-elite-thumbnail"
                          : ""
                      }`}
                    >
                      <TemplateComponent resume={structuredResume} />
                    </div>

                    <strong>{template.name}</strong>

                    <div className="template-badges">
                      {isRecommended && (
                        <div className="ai-recommended-badge">
                          ⭐ AI Recommended
                        </div>
                      )}

                      {isSelected && (
                        <div className="selected-template-badge">
                          ✓ Selected
                        </div>
                      )}
                    </div>

                    <p>{template.description}</p>
                    <small className="template-best-for">
                      Best for: {template.bestFor}
                    </small>
                  </button>
                );
              })}
            </div>

            <h3>
              {templateOptions.find(
                (template) => template.id === selectedTemplate,
              )?.name || "Resume"}{" "}
              Preview
            </h3>
            <div ref={resumePreviewRef} className="pdf-capture-area">
              {(() => {
                const selectedOption = templateOptions.find(
                  (template) => template.id === selectedTemplate,
                );

                if (!selectedOption) return null;

                const SelectedTemplateComponent = selectedOption.component;

                return <SelectedTemplateComponent resume={structuredResume} />;
              })()}
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
