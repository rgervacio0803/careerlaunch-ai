import { useState } from "react";

function UploadStep({
  resumeText,
  setResumeText,
  resumeFileName,
  fileInputRef,
  onFileSelected,
  onContinue,
}) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <section className="wizard-step-page">
      <div className="step-page-header">
        <p className="step-kicker">Step 1</p>
        <h2>Upload Your Resume</h2>
        <p>
          Upload your resume or paste your resume text. CareerLaunch AI will
          extract your skills, experience, and keywords automatically.
        </p>
      </div>

      <div className="upload-workspace">
        <label
          className={`large-upload-box ${isDragging ? "dragging" : ""}`}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);

            const droppedFile = event.dataTransfer.files?.[0];

            if (droppedFile) {
              onFileSelected(droppedFile);
            }
          }}
        >
          <div className="large-upload-icon" aria-hidden="true">
            ⬆
          </div>

          <h3>Drop your resume here</h3>
          <p>PDF, DOCX, or TXT, up to 5 MB</p>

          <span className="browse-button">Browse Files</span>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            aria-label="Upload your resume file"
            onChange={(e) => onFileSelected(e.target.files?.[0])}
          />
        </label>

        {resumeFileName && (
          <div className="file-selected-modern">
            ✅ {resumeFileName} — the text we read from it is below. You can edit
            it before continuing.
          </div>
        )}

        <div className="paste-resume-box">
          <label htmlFor="resume-text">Or paste your resume text</label>

          <textarea
            id="resume-text"
            placeholder="Paste your resume text here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
        </div>
      </div>

      <div className="analysis-actions">
        <button
          type="button"
          className="interview-button"
          onClick={onContinue}
          disabled={!resumeText.trim()}
        >
          Continue →
        </button>
      </div>
    </section>
  );
}

export default UploadStep;
