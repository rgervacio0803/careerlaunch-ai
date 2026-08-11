import { useState } from "react";
import ModernResume from "../ResumeTemplates/ModernResume";
import ProfessionalResume from "../ResumeTemplates/ProfessionalResume";
import MinimalResume from "../ResumeTemplates/MinimalResume";
import ExecutiveResume from "../ResumeTemplates/ExecutiveResume";
import TechResume from "../ResumeTemplates/TechResume";
import ExecutiveEliteResume from "../ResumeTemplates/ExecutiveEliteResume";
import ExecutiveBlueResume from "../ResumeTemplates/ExecutiveBlueResume";
import HealthcareProfessionalResume from "../ResumeTemplates/HealthcareProfessionalResume";
import ResumeThumbnail from "../ResumeTemplates/ResumeThumbnail";
import TemplateCard from "../ResumeTemplates/TemplateCard";

const templateOptions = [
  {
    id: "executive-elite",
    name: "Executive Elite",
    description: "Leadership-focused premium layout",
    bestFor: "Management, healthcare, and senior professionals",
    component: ExecutiveEliteResume,
  },
  {
    id: "executive-blue",
    name: "Executive Blue",
    description: "Modern blue sidebar layout",
    bestFor: "Corporate leadership and senior professionals",
    component: ExecutiveBlueResume,
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
  {
    id: "healthcare-professional",
    name: "Healthcare Professional",
    description: "Clean clinical and medical layout",
    bestFor: "Healthcare, laboratory, nursing, and medical roles",
    component: HealthcareProfessionalResume,
  },
];

function ResumeOptimize({
  rewrittenResume,
  structuredResume,
  setStructuredResume,
  recommendation,
  selectedTemplate,
  setSelectedTemplate,
  resumePreviewRef,
  jobTitle,
  copyToClipboard,
  downloadRewrittenResume,
  handleCoverLetter,
}) {
  const [isEditingResume, setIsEditingResume] = useState(false);
  const [skillsText, setSkillsText] = useState(
    (structuredResume?.skills || []).join(", "),
  );
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

          {isEditingResume && (
            <div className="resume-editor">
              <h3>Edit Resume</h3>
              <p>Make any final changes before downloading your resume.</p>

              <div className="resume-editor-basic-grid">
                <div className="resume-editor-field">
                  <label>Professional Title</label>

                  <input
                    type="text"
                    value={structuredResume?.title || ""}
                    onChange={(e) =>
                      setStructuredResume({
                        ...structuredResume,
                        title: e.target.value,
                      })
                    }
                    placeholder="Professional title"
                  />
                </div>
                <div className="resume-editor-field">
                  <label>Name</label>

                  <input
                    type="text"
                    value={structuredResume?.name || ""}
                    onChange={(e) =>
                      setStructuredResume({
                        ...structuredResume,
                        name: e.target.value,
                      })
                    }
                    placeholder="Your name"
                  />
                </div>

                <div className="resume-editor-field resume-editor-field-full">
                  <label>Contact</label>

                  <input
                    type="text"
                    value={structuredResume?.contact || ""}
                    onChange={(e) =>
                      setStructuredResume({
                        ...structuredResume,
                        contact: e.target.value,
                      })
                    }
                    placeholder="Email, phone, city, LinkedIn"
                  />
                </div>
              </div>
              <div className="resume-editor-field">
                <label>Professional Summary</label>

                <textarea
                  value={structuredResume?.summary || ""}
                  onChange={(e) =>
                    setStructuredResume({
                      ...structuredResume,
                      summary: e.target.value,
                    })
                  }
                  placeholder="Professional summary"
                  rows={6}
                />
              </div>

              <div className="resume-editor-field">
                <label>Skills</label>

                <textarea
                  value={skillsText}
                  onChange={(e) => {
                    const value = e.target.value;

                    setSkillsText(value);

                    setStructuredResume({
                      ...structuredResume,
                      skills: value
                        .split(",")
                        .map((skill) => skill.trim())
                        .filter(Boolean),
                    });
                  }}
                  placeholder="React, JavaScript, CSS, Redux"
                  rows={4}
                />

                <small>Separate each skill with a comma.</small>
              </div>
              <div className="resume-editor-section">
                <h4>Professional Experience</h4>

                {(structuredResume?.experience || []).map((job, jobIndex) => (
                  <div className="resume-editor-job" key={jobIndex}>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        const confirmed = window.confirm(
                          "Are you sure you want to remove this experience?",
                        );

                        if (!confirmed) return;

                        const updatedExperience =
                          structuredResume.experience.filter(
                            (_, index) => index !== jobIndex,
                          );

                        setStructuredResume({
                          ...structuredResume,
                          experience: updatedExperience,
                        });
                      }}
                    >
                      Remove Experience
                    </button>

                    <div className="resume-editor-job-row">
                      <div className="resume-editor-field">
                        <label>Job Title</label>

                        <input
                          type="text"
                          value={job.jobTitle || ""}
                          onChange={(e) => {
                            const updatedExperience = [
                              ...structuredResume.experience,
                            ];

                            updatedExperience[jobIndex] = {
                              ...job,
                              jobTitle: e.target.value,
                            };

                            setStructuredResume({
                              ...structuredResume,
                              experience: updatedExperience,
                            });
                          }}
                        />
                      </div>

                      <div className="resume-editor-field">
                        <label>Company</label>

                        <input
                          type="text"
                          value={job.company || ""}
                          onChange={(e) => {
                            const updatedExperience = [
                              ...structuredResume.experience,
                            ];

                            updatedExperience[jobIndex] = {
                              ...job,
                              company: e.target.value,
                            };

                            setStructuredResume({
                              ...structuredResume,
                              experience: updatedExperience,
                            });
                          }}
                        />
                      </div>

                      <div className="resume-editor-field">
                        <label>Dates</label>

                        <input
                          type="text"
                          value={job.dates || ""}
                          onChange={(e) => {
                            const updatedExperience = [
                              ...structuredResume.experience,
                            ];

                            updatedExperience[jobIndex] = {
                              ...job,
                              dates: e.target.value,
                            };

                            setStructuredResume({
                              ...structuredResume,
                              experience: updatedExperience,
                            });
                          }}
                        />
                      </div>
                    </div>
                    <div className="resume-editor-field">
                      <label>Bullet Points</label>

                      <textarea
                        value={(job.bullets || []).join("\n")}
                        onChange={(e) => {
                          const updatedExperience = [
                            ...structuredResume.experience,
                          ];

                          updatedExperience[jobIndex] = {
                            ...job,
                            bullets: e.target.value.split("\n"),
                          };

                          setStructuredResume({
                            ...structuredResume,
                            experience: updatedExperience,
                          });
                        }}
                        rows={6}
                        placeholder="One bullet point per line"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setStructuredResume({
                      ...structuredResume,
                      experience: [
                        {
                          jobTitle: "",
                          company: "",
                          dates: "",
                          bullets: [],
                        },
                        ...(structuredResume?.experience || []),
                      ],
                    })
                  }
                >
                  + Add Experience
                </button>
              </div>

              <div className="resume-editor-section">
                <h4>Education</h4>

                <div className="resume-editor-field">
                  <label>Education</label>

                  <textarea
                    value={(structuredResume?.education || []).join("\n")}
                    onChange={(e) =>
                      setStructuredResume({
                        ...structuredResume,
                        education: e.target.value.split("\n"),
                      })
                    }
                    rows={4}
                    placeholder="Enter one education item per line"
                  />

                  <small>Enter one education item per line.</small>
                </div>
              </div>
              <div className="resume-editor-section">
                <h4>Certifications</h4>

                <div className="resume-editor-field">
                  <label>Certifications</label>

                  <textarea
                    value={(structuredResume?.certifications || []).join("\n")}
                    onChange={(e) =>
                      setStructuredResume({
                        ...structuredResume,
                        certifications: e.target.value.split("\n"),
                      })
                    }
                    rows={4}
                    placeholder="Enter one certification per line"
                  />

                  <small>Enter one certification per line.</small>
                </div>
              </div>
            </div>
          )}

          <div className="optimized-actions-top">
            <button
              className="secondary-button"
              onClick={() => setIsEditingResume((current) => !current)}
            >
              {isEditingResume ? "Save Changes" : "Edit Resume"}
            </button>
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
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={isSelected}
                    isRecommended={isRecommended}
                    onSelect={() => setSelectedTemplate(template.id)}
                  >
                    <ResumeThumbnail>
                      <TemplateComponent resume={structuredResume} />
                    </ResumeThumbnail>
                  </TemplateCard>
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
