import { useState } from "react";

function UploadStep({
  resumeText,
  setResumeText,
  resumeFile,
  fileInputRef,
  handleResumeUpload,
  handlePastedResume,
  setCurrentStep,
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
              handleResumeUpload(droppedFile);
            }
          }}
        >
          <div className="large-upload-icon">⬆</div>

          <h3>Drop your resume here</h3>
          <p>PDF, DOCX, or TXT — we’ll analyze it instantly</p>

          <span className="browse-button">Browse Files</span>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => handleResumeUpload(e.target.files[0])}
          />
        </label>

        {resumeFile && (
          <div className="file-selected-modern">✅ {resumeFile.name}</div>
        )}

        <div className="paste-resume-box">
          <label>Or paste your resume text</label>

          <textarea
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
          onClick={handlePastedResume}
          disabled={!resumeText.trim() && !resumeFile}
        >
          Continue →
        </button>
      </div>
    </section>
  );
}

export default UploadStep;
