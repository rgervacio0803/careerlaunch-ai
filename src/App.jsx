import { useRef, useState } from "react";
import jsPDF from "jspdf";

import "./App.css";
import "./styles/base.css";
import "./styles/landing.css";
import "./styles/wizard.css";
import "./styles/ats.css";
import "./styles/optimize.css";
import "./styles/interview.css";
import "./styles/components.css";

import Landing from "./components/Landing";
import WizardHeader from "./components/Wizard/WizardHeader";
import UploadStep from "./components/Wizard/UploadStep";
import JobMatchStep from "./components/Wizard/JobMatchStep";
import ATSResults from "./components/Wizard/ATSResults";
import ResumeOptimize from "./components/Wizard/ResumeOptimize";
import CoverLetter from "./components/Wizard/CoverLetter";
import InterviewPrep from "./components/Wizard/InterviewPrep";
import useResume from "./hooks/useResume";

function App() {
  const resume = useResume();

  const {
    resumeText,
    setResumeText,
    resumeFile,
    setResumeFile,
    jobDescription,
    setJobDescription,
    result,
    setResult,
    rewrittenResume,
    setRewrittenResume,
    structuredResume,
    setStructuredResume,
    interviewQuestions,
    setInterviewQuestions,
    jobTitle,
    setJobTitle,
    resumeProfile,
    setResumeProfile,
    resumeAnalyzing,
    setResumeAnalyzing,
    coverLetter,
    setCoverLetter,
    fileInputRef,
    resetResumeState,
  } = resume;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showLanding, setShowLanding] = useState(true);

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
    setStructuredResume(null);
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

      const response = await fetch("http://localhost:5000/rewrite", {
        method: "POST",
        body: formData,
      });
      console.log("Rewrite response status:", response.status);
      const data = await response.json();
      console.log("Rewrite data:", data);

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

  if (showLanding) {
    return <Landing onStart={() => setShowLanding(false)} />;
  }

  return (
    <div className="app">
      <WizardHeader
        currentStep={currentStep}
        onBack={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
        onReset={handleReset}
      />

      <main className="container">
        {currentStep === 1 && (
          <UploadStep
            resumeText={resumeText}
            setResumeText={setResumeText}
            resumeFile={resumeFile}
            fileInputRef={fileInputRef}
            handleResumeUpload={handleResumeUpload}
          />
        )}

        {currentStep === 2 && (
          <JobMatchStep
            jobTitle={jobTitle}
            setJobTitle={setJobTitle}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            loading={loading}
            handleAnalyze={handleAnalyze}
          />
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
          <ATSResults
            result={result}
            jobTitle={jobTitle}
            copyToClipboard={copyToClipboard}
            downloadReport={downloadReport}
            handleRewriteResume={handleRewriteResume}
            setCurrentStep={setCurrentStep}
          />
        )}
        {currentStep === 4 && rewrittenResume && (
          <ResumeOptimize
            rewrittenResume={rewrittenResume}
            jobTitle={jobTitle}
            copyToClipboard={copyToClipboard}
            downloadRewrittenResume={downloadRewrittenResume}
            handleCoverLetter={handleCoverLetter}
          />
        )}
        {currentStep === 5 && coverLetter && (
          <CoverLetter
            coverLetter={coverLetter}
            jobTitle={jobTitle}
            copyToClipboard={copyToClipboard}
            handleInterviewCoach={handleInterviewCoach}
            setCurrentStep={setCurrentStep}
          />
        )}
        {currentStep === 6 && interviewQuestions && (
          <InterviewPrep
            interviewQuestions={interviewQuestions}
            jobTitle={jobTitle}
            downloadInterviewPrep={downloadInterviewPrep}
            downloadReport={downloadReport}
            downloadRewrittenResume={downloadRewrittenResume}
            handleReset={handleReset}
          />
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
