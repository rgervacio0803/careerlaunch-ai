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
  const [jobTitle, setJobTitle] = useState("Target Position");
  const [darkMode, setDarkMode] = useState(false);

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
      formData.append("jobDescription", jobDescription);

      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setResult(data);
      setJobTitle(data.jobTitle || "Target Position");
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
    setInterviewQuestions("");
    setJobTitle("Target Position");
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

    if (!jobDescription.trim()) {
      setError("Please paste the job description.");
      return;
    }

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

      const response = await fetch("http://localhost:5000/rewrite", {
        method: "POST",
        body: formData,
      });

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

      const response = await fetch("http://localhost:5000/interview", {
        method: "POST",
        body: formData,
      });

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

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <header className="hero">
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
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

      <main className="container">
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
              onChange={(e) => setResumeFile(e.target.files[0])}
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

        <section className="card">
          <label>Job Description</label>

          <textarea
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </section>

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

        {error && <div className="error-message">{error}</div>}

        {result && (
          <>
            <button className="download-btn" onClick={downloadReport}>
              Download PDF Report
            </button>
            <div className="results-grid">
              <div className="result-card">
                <h2>ATS Score</h2>

                <div className="score-row">
                  <p className="score">{result.atsScore}%</p>
                  <span className="score-label">
                    {result.atsScore >= 80
                      ? "Strong Match"
                      : result.atsScore >= 60
                        ? "Moderate Match"
                        : "Needs Improvement"}
                  </span>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${result.atsScore}%` }}
                  ></div>
                </div>

                <ul>
                  {result.scoreExplanation?.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="result-card">
                <h2>Missing Keywords</h2>
                <ul>
                  {result.missingKeywords?.map((keyword, index) => (
                    <li key={index}>{keyword}</li>
                  ))}
                </ul>
              </div>

              <div className="result-card">
                <div className="card-header">
                  <h2>Resume Suggestions</h2>

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

              <div className="result-card">
                <h2>Career Advice</h2>
                <ul>
                  {result.careerAdvice?.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="result-card">
                <h2>Interview Questions</h2>
                <ul>
                  {result.interviewQuestions?.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
        {rewrittenResume && (
          <section className="result-card rewritten-section">
            <button className="download-btn" onClick={downloadRewrittenResume}>
              Download Rewritten Resume
            </button>
            <h2>ATS Optimized Resume</h2>
            <pre>{rewrittenResume}</pre>
          </section>
        )}
        {interviewQuestions && (
          <section className="result-card rewritten-section">
            <h2>Interview Coach</h2>
            <button className="download-btn" onClick={downloadInterviewPrep}>
              Download Interview Prep
            </button>

            <div className="interview-section">
              <h3>Technical Questions</h3>

              {interviewQuestions.technicalQuestions?.map((item, index) => (
                <div key={index} className="question-card">
                  <p>
                    <strong>Question:</strong> {item.question}
                  </p>

                  <p>
                    <strong>Suggested Answer:</strong> {item.answer}
                  </p>
                </div>
              ))}
            </div>

            <div className="interview-section">
              <h3>Behavioral Questions</h3>

              {interviewQuestions.behavioralQuestions?.map((item, index) => (
                <div key={index} className="question-card">
                  <p>
                    <strong>Question:</strong> {item.question}
                  </p>

                  <p>
                    <strong>Suggested Answer:</strong> {item.answer}
                  </p>
                </div>
              ))}
            </div>

            <div className="interview-section">
              <h3>Career Switch Questions</h3>

              {interviewQuestions.careerSwitchQuestions?.map((item, index) => (
                <div key={index} className="question-card">
                  <p>
                    <strong>Question:</strong> {item.question}
                  </p>

                  <p>
                    <strong>Suggested Answer:</strong> {item.answer}
                  </p>
                </div>
              ))}
            </div>

            <div className="interview-section">
              <h3>Questions to Ask the Employer</h3>

              <ul>
                {interviewQuestions.employerQuestions?.map(
                  (question, index) => (
                    <li key={index}>{question}</li>
                  ),
                )}
              </ul>
            </div>
          </section>
        )}
      </main>
      {toastMessage && <div className="toast">{toastMessage}</div>}
    </div>
  );
}

export default App;
