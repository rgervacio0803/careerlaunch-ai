import { useRef, useState } from "react";
import jsPDF from "jspdf";
import "./App.css";

function App() {
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [rewrittenResume, setRewrittenResume] = useState("");
  const [interviewQuestions, setInterviewQuestions] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [resumeProfile, setResumeProfile] = useState(null);
  const [resumeAnalyzing, setResumeAnalyzing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const fileInputRef = useRef(null);

  async function handleAnalyze() {
    if (!resumeText.trim() && !resumeFile) {
      alert("Please paste your resume text or upload a resume file.");
      return;
    }

    if (!jobDescription.trim()) {
      alert("Please paste the job description.");
      return;
    }

    setLoadingMessage(
      "Please wait while CareerLaunch AI reviews your resume and job description.",
    );
    setLoading(true);
    setResult(null);
    setError("");

    let finalResumeText = resumeText;

    if (resumeFile && resumeFile.type === "text/plain") {
      finalResumeText = await resumeFile.text();
    }

    try {
      const formData = new FormData();

      formData.append("resumeText", finalResumeText);
      formData.append(
        "jobDescription",
        `Job Title: ${jobTitle}\n\nResponsibilities and Duties:\n${jobDescription}`,
      );

      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Analyze response:", data);

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setResult(data);
      setJobTitle(data.jobTitle || "Target Position");
      setCurrentStep(3);
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please check your file or try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResumeText("");
    setResumeFile(null);
    setJobDescription("");
    setResult(null);
    setRewrittenResume("");
    setToastMessage("");
    setInterviewQuestions(null);
    setJobTitle("");
    setResumeProfile(null);
    setResumeAnalyzing(false);
    setCurrentStep(1);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);

    setToastMessage("✓ Copied");

    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  }

  function downloadReport() {
    if (!result) return;

    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let y = 20;

    function addSectionTitle(title) {
      if (y > pageHeight - 25) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(13);
      doc.setFont(undefined, "bold");
      doc.text(title, margin, y);
      y += 8;
    }

    function addBulletList(items = []) {
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");

      items.forEach((item) => {
        const lines = doc.splitTextToSize(`• ${item}`, maxWidth);

        if (y + lines.length * 6 > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }

        doc.text(lines, margin, y);
        y += lines.length * 6 + 3;
      });

      y += 5;
    }

    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("AI Career Switch Assistant Report", margin, y);
    y += 12;

    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    doc.text(`ATS Score: ${result.atsScore}%`, margin, y);
    y += 12;

    addSectionTitle("Score Explanation");
    addBulletList(result.scoreExplanation);

    addSectionTitle("Missing Keywords");
    addBulletList(result.missingKeywords);

    addSectionTitle("Resume Suggestions");
    addBulletList(result.resumeSuggestions);

    addSectionTitle("Career Advice");
    addBulletList(result.careerAdvice);

    addSectionTitle("Interview Questions");
    addBulletList(result.interviewQuestions);

    doc.save("career-report.pdf");
  }

  async function handleRewriteResume() {
    if (!resumeText.trim() && !resumeFile) {
      setError("Please paste your resume text or upload a resume file.");
      return;
    }

    if (!jobTitle.trim() || !jobDescription.trim()) {
      setError("Please enter both the job title and responsibilities/duties.");
      return;
    }

    setLoadingMessage(
      "Please wait while CareerLaunch AI optimizes your resume for the target role.",
    );
    setLoading(true);
    setError("");
    setRewrittenResume("");

    let finalResumeText = resumeText;

    if (resumeFile && resumeFile.type === "text/plain") {
      finalResumeText = await resumeFile.text();
    }

    try {
      const formData = new FormData();

      formData.append("resumeText", finalResumeText);
      formData.append("jobDescription", jobDescription);

      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const response = await fetch(
        "https://careerlaunch-ai-api.onrender.com/rewrite",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();
      setRewrittenResume(data.rewrittenResume);
    } catch (error) {
      console.error(error);
      setError("Unable to rewrite resume. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function downloadRewrittenResume() {
    if (!rewrittenResume) return;

    const doc = new jsPDF();

    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = 170;
    let y = 20;

    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text(`ATS Optimized Resume - ${jobTitle}`, margin, y);
    y += 12;

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");

    const lines = doc.splitTextToSize(rewrittenResume, maxWidth);

    lines.forEach((line) => {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }

      doc.text(line, margin, y);
      y += 6;
    });

    doc.save("rewritten-resume.pdf");
  }

  async function handleInterviewCoach() {
    if (!resumeText.trim() && !resumeFile) {
      setError("Please paste your resume text or upload a resume file.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please paste the job description.");
      return;
    }

    setLoadingMessage(
      "Please wait while CareerLaunch AI creates your interview prep questions and answers.",
    );
    setLoading(true);
    setError("");
    setInterviewQuestions("");

    let finalResumeText = resumeText;

    if (resumeFile && resumeFile.type === "text/plain") {
      finalResumeText = await resumeFile.text();
    }

    try {
      const formData = new FormData();

      formData.append("resumeText", finalResumeText);
      formData.append("jobDescription", jobDescription);

      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const response = await fetch(
        "https://careerlaunch-ai-api.onrender.com/interview",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      setInterviewQuestions(data);
    } catch (error) {
      console.error(error);
      setError("Unable to generate interview questions. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function downloadInterviewPrep() {
    if (!interviewQuestions) return;

    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = 170;
    let y = 20;

    function addTitle(text) {
      if (y > pageHeight - 25) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text(text, margin, y);
      y += 10;
    }

    function addQuestionAnswer(item) {
      doc.setFontSize(10);
      doc.setFont(undefined, "bold");

      const questionLines = doc.splitTextToSize(
        `Question: ${item.question}`,
        maxWidth,
      );

      if (y + questionLines.length * 6 > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }

      doc.text(questionLines, margin, y);
      y += questionLines.length * 6 + 4;

      doc.setFont(undefined, "normal");

      const answerLines = doc.splitTextToSize(
        `Suggested Answer: ${item.answer}`,
        maxWidth,
      );

      if (y + answerLines.length * 6 > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }

      doc.text(answerLines, margin, y);
      y += answerLines.length * 6 + 8;
    }

    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("Interview Prep Guide", margin, y);
    y += 14;

    addTitle("Technical Questions");
    interviewQuestions.technicalQuestions?.forEach(addQuestionAnswer);

    addTitle("Behavioral Questions");
    interviewQuestions.behavioralQuestions?.forEach(addQuestionAnswer);

    addTitle("Career Switch Questions");
    interviewQuestions.careerSwitchQuestions?.forEach(addQuestionAnswer);

    addTitle("Questions to Ask the Employer");
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");

    interviewQuestions.employerQuestions?.forEach((question) => {
      const lines = doc.splitTextToSize(`• ${question}`, maxWidth);

      if (y + lines.length * 6 > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }

      doc.text(lines, margin, y);
      y += lines.length * 6 + 4;
    });

    doc.save("interview-prep-guide.pdf");
  }

  async function handleResumeUpload(file) {
    if (!file) return;

    setResumeFile(file);
    setLoadingMessage(
      "Please wait while CareerLaunch AI analyzes your resume.",
    );
    setResumeAnalyzing(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch("http://localhost:5000/parse-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to analyze resume.");
        return;
      }

      setResumeProfile(data);
      setCurrentStep(2);
    } catch (error) {
      console.error(error);
      setError("Unable to analyze resume. Please try again.");
    } finally {
      setResumeAnalyzing(false);
    }
  }

  async function handleCoverLetter() {
    if (!resumeText.trim() && !resumeFile) {
      setError("Please paste your resume text or upload a resume file.");
      return;
    }

    if (!jobTitle.trim() || !jobDescription.trim()) {
      setError("Please enter both the job title and responsibilities/duties.");
      return;
    }

    setLoadingMessage(
      "Please wait while CareerLaunch AI writes your tailored cover letter.",
    );

    setLoading(true);
    setError("");
    setCoverLetter("");

    let finalResumeText = resumeText;

    if (resumeFile && resumeFile.type === "text/plain") {
      finalResumeText = await resumeFile.text();
    }

    try {
      const formData = new FormData();

      formData.append("resumeText", finalResumeText);
      formData.append(
        "jobDescription",
        `Job Title: ${jobTitle}\n\nResponsibilities and Duties:\n${jobDescription}`,
      );

      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const response = await fetch("http://localhost:5000/cover-letter", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to generate cover letter.");
        return;
      }

      setCoverLetter(data.coverLetter);
      setCurrentStep(5);
    } catch (error) {
      console.error(error);
      setError("Unable to generate cover letter. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="hero">
        <p className="eyebrow">Resume • Interview • Career Switch</p>
        <h1 className="eyebrow-1">CareerLaunch AI</h1>
        <p className="subtitle">
          Upload your resume and paste a job description to get ATS feedback, an
          optimized resume rewrite, and interview prep tailored to your target
          role.
        </p>

        <div className="hero-tags">
          <span>ATS Analysis</span>
          <span>Resume Rewrite</span>
          <span>Interview Coach</span>
        </div>
      </header>

      <section className="steps">
        <div className={currentStep === 1 ? "step active" : "step"}>
          <span>1</span>
          <p>Upload</p>
        </div>

        <div className={currentStep === 2 ? "step active" : "step"}>
          <span>2</span>
          <p>Job Match</p>
        </div>

        <div className={currentStep === 3 ? "step active" : "step"}>
          <span>3</span>
          <p>ATS Analysis</p>
        </div>

        <div className={currentStep === 4 ? "step active" : "step"}>
          <span>4</span>
          <p>Optimize</p>
        </div>

        <div className={currentStep === 5 ? "step active" : "step"}>
          <span>5</span>
          <p>Interview Prep</p>
        </div>
      </section>

      <div className="wizard-nav">
        {currentStep > 1 && (
          <button
            className="back-link"
            onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
          >
            ← Back
          </button>
        )}

        {currentStep > 1 && (
          <button className="start-over-link" onClick={handleReset}>
            <span className="start-over-icon">↻</span>
            Start Over
          </button>
        )}
      </div>

      <main className="container">
        {currentStep === 1 && (
          <section className="card">
            <label>Your Resume</label>

            <label className="upload-box">
              <span className="upload-icon">📄</span>
              <span className="upload-title">Upload Resume</span>
              <span className="upload-subtitle">PDF, DOCX, or TXT</span>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => handleResumeUpload(e.target.files[0])}
              />
            </label>

            {resumeFile && (
              <div className="file-selected">✅ {resumeFile.name}</div>
            )}

            <textarea
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </section>
        )}

        {currentStep === 2 && (
          <section className="card">
            <h2>Target Job Details</h2>

            <div className="form-group">
              <label>Job Title</label>

              <input
                className="job-title-input"
                type="text"
                placeholder="Example: Frontend Developer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Responsibilities and Duties</label>

              <textarea
                placeholder="Paste the job responsibilities, requirements, and duties here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <button onClick={handleAnalyze} disabled={loading}>
              {loading ? "Analyzing Match..." : "Analyze Match"}
            </button>
          </section>
        )}

        {false && (
          <div className="button-row">
            <button onClick={handleAnalyze} disabled={loading}>
              {loading ? "Analyzing..." : "Analyze Resume"}
            </button>

            <button
              className="rewrite-button"
              onClick={handleRewriteResume}
              disabled={loading}
            >
              Rewrite Resume
            </button>

            <button
              className="interview-button"
              onClick={handleInterviewCoach}
              disabled={loading}
            >
              Interview Coach
            </button>

            <button
              className="secondary-button"
              onClick={handleReset}
              disabled={loading}
            >
              Clear / Start Over
            </button>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {currentStep === 3 && result && (
          <section className="analysis-page">
            <div className="analysis-header">
              <h2>Analysis Results</h2>
              <p>
                For: <span>{jobTitle || "Target Position"}</span>
              </p>
            </div>

            <div className="ats-summary-card">
              <div className="ats-card-header">
                <div className="ats-icon">🏅</div>
                <div>
                  <h3>ATS Compatibility Score</h3>
                  <p>How well your resume matches the job</p>
                </div>
              </div>

              <div className="ats-score-layout">
                <div className="ats-score-bullets">
                  <h4>ATS Score Breakdown</h4>

                  <ul>
                    {result.scoreExplanation?.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="circle-score">
                  <div className="circle-inner">
                    <span>{result.atsScore}</span>
                  </div>
                  <p>OVERALL</p>
                </div>
              </div>
            </div>

            <div className="analysis-grid">
              <div className="analysis-card">
                <h3>✅ Resume Strengths</h3>

                <ul>
                  {result.resumeStrengths?.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="analysis-card">
                <h3>❌ Missing Keywords</h3>

                <div className="tag-list">
                  {result.missingKeywords?.map((keyword, index) => (
                    <span key={index} className="tag tag-red">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="analysis-card">
                <div className="card-header">
                  <h3>📝 Resume Suggestions</h3>

                  <button
                    className="copy-btn"
                    onClick={() =>
                      copyToClipboard(result.resumeSuggestions?.join("\n"))
                    }
                  >
                    Copy
                  </button>
                </div>

                <ul>
                  {result.resumeSuggestions?.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="analysis-card">
                <h3>💡 Career Advice</h3>

                <ul>
                  {result.careerAdvice?.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="analysis-actions">
              <button className="download-btn" onClick={downloadReport}>
                Download PDF Report
              </button>

              <button
                className="rewrite-button"
                onClick={() => {
                  handleRewriteResume();
                  setCurrentStep(4);
                }}
              >
                Continue to Optimize Resume →
              </button>
            </div>
          </section>
        )}
        {currentStep === 4 && rewrittenResume && (
          <section className="optimize-page">
            <div className="analysis-header">
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

                  <button
                    className="download-btn"
                    onClick={downloadRewrittenResume}
                  >
                    Download PDF
                  </button>
                </div>
              </div>

              <pre className="optimized-resume-text">{rewrittenResume}</pre>
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
        )}
        {currentStep === 5 && coverLetter && (
          <section className="optimize-page">
            <div className="analysis-header">
              <h2>Cover Letter</h2>
              <p>
                Tailored for: <span>{jobTitle || "Target Position"}</span>
              </p>
            </div>

            <div className="optimized-card">
              <div className="optimized-header">
                <div>
                  <h3>AI Generated Cover Letter</h3>
                  <p>Review, copy, or use this as a starting point.</p>
                </div>

                <div className="optimized-actions-top">
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(coverLetter)}
                  >
                    Copy Cover Letter
                  </button>
                </div>
              </div>

              <pre className="optimized-resume-text">{coverLetter}</pre>
            </div>

            <div className="analysis-actions">
              <button
                className="interview-button"
                onClick={() => {
                  handleInterviewCoach();
                  setCurrentStep(6);
                }}
              >
                Continue to Interview Prep →
              </button>
            </div>
          </section>
        )}
        {currentStep === 6 && interviewQuestions && (
          <section className="interview-page">
            <div className="analysis-header">
              <h2>Interview Prep</h2>
              <p>
                Practice answers tailored for:{" "}
                <span>{jobTitle || "Target Position"}</span>
              </p>
            </div>

            <div className="interview-top-actions">
              <button className="download-btn" onClick={downloadInterviewPrep}>
                Download Interview Prep
              </button>
            </div>

            <div className="interview-grid">
              <div className="interview-panel">
                <h3>💻 Technical Questions</h3>

                {interviewQuestions.technicalQuestions?.map((item, index) => (
                  <div key={index} className="interview-card">
                    <p className="question-label">Question</p>
                    <h4>{item.question}</h4>

                    <p className="answer-label">Suggested Answer</p>
                    <p>{item.answer}</p>
                  </div>
                ))}
              </div>

              <div className="interview-panel">
                <h3>🤝 Behavioral Questions</h3>

                {interviewQuestions.behavioralQuestions?.map((item, index) => (
                  <div key={index} className="interview-card">
                    <p className="question-label">Question</p>
                    <h4>{item.question}</h4>

                    <p className="answer-label">Suggested Answer</p>
                    <p>{item.answer}</p>
                  </div>
                ))}
              </div>

              <div className="interview-panel">
                <h3>🔄 Career Switch Questions</h3>

                {interviewQuestions.careerSwitchQuestions?.map(
                  (item, index) => (
                    <div key={index} className="interview-card">
                      <p className="question-label">Question</p>
                      <h4>{item.question}</h4>

                      <p className="answer-label">Suggested Answer</p>
                      <p>{item.answer}</p>
                    </div>
                  ),
                )}
              </div>

              <div className="interview-panel">
                <h3>🏢 Questions to Ask the Employer</h3>

                <div className="employer-question-list">
                  {interviewQuestions.employerQuestions?.map(
                    (question, index) => (
                      <div key={index} className="employer-question">
                        {question}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
            <div className="completion-card">
              <h2>✓ CareerLaunch AI Analysis Complete</h2>
              <p>
                Your resume analysis, optimized resume, and interview prep are
                ready.
              </p>

              <div className="completion-actions">
                <button className="download-btn" onClick={downloadReport}>
                  Download ATS Report
                </button>

                <button
                  className="download-btn"
                  onClick={downloadRewrittenResume}
                >
                  Download Optimized Resume
                </button>

                <button
                  className="download-btn"
                  onClick={downloadInterviewPrep}
                >
                  Download Interview Prep
                </button>

                <button className="secondary-button" onClick={handleReset}>
                  Start New Analysis
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
      {(loading || resumeAnalyzing) && (
        <div className="loading-overlay">
          <div className="loading-modal">
            <div className="spinner"></div>
            <h2>Working on it...</h2>
            <p>{loadingMessage}</p>
          </div>
        </div>
      )}
      {toastMessage && <div className="toast">{toastMessage}</div>}
    </div>
  );
}

export default App;
