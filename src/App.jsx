import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import "./App.css";
import "./styles/base.css";
import "./styles/landing.css";
import "./styles/wizard.css";
import "./styles/ats.css";
import "./styles/optimize.css";
import "./styles/interview.css";
import "./styles/components.css";
import "./styles/resumeTemplates.css";

import Landing from "./components/Landing";
import WizardHeader from "./components/Wizard/WizardHeader";
import UploadStep from "./components/Wizard/UploadStep";
import JobMatchStep from "./components/Wizard/JobMatchStep";
import ATSResults from "./components/Wizard/ATSResults";
import ResumeOptimize from "./components/Wizard/ResumeOptimize";
import CoverLetter from "./components/Wizard/CoverLetter";
import InterviewPrep from "./components/Wizard/InterviewPrep";
import ResumeInsights from "./components/Wizard/ResumeInsights";
import AIRewritePlan from "./components/AIRewritePlan";
import useResume from "./hooks/useResume";
import ResumeOptimizationProgress from "./components/ResumeOptimizationProgress";
import RewritePlanProgress from "./components/RewritePlanProgress";
import ResumeOptimizationComplete from "./components/ResumeOptimizationComplete";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

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
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [companyName, setCompanyName] = useState("");
  const [hiringManager, setHiringManager] = useState("");
  const [lastGeneratedHiringManager, setLastGeneratedHiringManager] =
    useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [coverLetterDate, setCoverLetterDate] = useState(
    new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  );
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showLanding, setShowLanding] = useState(true);
  const [resumeInsights, setResumeInsights] = useState(null);
  const [rewritePlan, setRewritePlan] = useState(null);
  const [isOptimizingResume, setIsOptimizingResume] = useState(false);
  const [optimizationStep, setOptimizationStep] = useState(0);
  const [showOptimizationComplete, setShowOptimizationComplete] =
    useState(false);
  const [isBuildingRewritePlan, setIsBuildingRewritePlan] = useState(false);
  const [rewritePlanStep, setRewritePlanStep] = useState(0);
  const resumePreviewRef = useRef(null);
  const coverLetterPreviewRef = useRef(null);
  const [showResetModal, setShowResetModal] = useState(false);

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

      const response = await fetch(`${API_URL}/analyze`, {
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
      await handleResumeInsights();
      setJobTitle(data.jobTitle || "Target Position");
      setCurrentStep(3);
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please check your file or try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResumeInsights() {
    try {
      const formData = new FormData();

      formData.append("resumeText", resumeText);
      formData.append("jobDescription", jobDescription);

      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const response = await fetch(`${API_URL}/resume-insights`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      console.log("Resume Insights:", data);

      setResumeInsights(data);
    } catch (error) {
      console.error(error);
      setError("Unable to generate resume insights.");
    }
  }

  async function handleRewritePlan() {
    setIsBuildingRewritePlan(true);
    setRewritePlanStep(0);
    setError("");

    const progressTimer = setInterval(() => {
      setRewritePlanStep((current) => {
        if (current >= 2) return current;
        return current + 1;
      });
    }, 1800);

    try {
      const formData = new FormData();

      formData.append("resumeText", resumeText);
      formData.append("jobDescription", jobDescription);
      formData.append("resumeInsights", JSON.stringify(resumeInsights));

      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const response = await fetch(`${API_URL}/rewrite-plan`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to generate rewrite plan.");
        return;
      }

      setRewritePlan(data.rewritePlan);
      setRewritePlanStep(2);

      await new Promise((resolve) => setTimeout(resolve, 600));

      setCurrentStep(5);
    } catch (error) {
      console.error(error);
      setError("Unable to generate rewrite plan.");
    } finally {
      clearInterval(progressTimer);
      setIsBuildingRewritePlan(false);
    }
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

    setIsOptimizingResume(true);

    setOptimizationStep(0);

    const progressTimer = setInterval(() => {
      setOptimizationStep((current) => {
        if (current >= 4) return current;
        return current + 1;
      });
    }, 2500);

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
      formData.append("rewritePlan", JSON.stringify(rewritePlan));

      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const response = await fetch(`${API_URL}/rewrite`, {
        method: "POST",
        body: formData,
      });
      console.log("Rewrite response status:", response.status);
      const data = await response.json();
      console.log("Rewrite data:", data);

      setRewrittenResume(data.rewrittenResume);
      setStructuredResume(data.structuredResume);
     setSelectedTemplate(recommendation.templateId);

      setShowOptimizationComplete(true);

      await new Promise((resolve) => setTimeout(resolve, 1200));

      setShowOptimizationComplete(false);
      setCurrentStep(6);
    } catch (error) {
      console.error(error);
      setError("Unable to rewrite resume. Please try again.");
    } finally {
      clearInterval(progressTimer);
      setOptimizationStep(4);

      setLoading(false);
      setIsOptimizingResume(false);
    }
  }

  async function handleStructureResume() {
    try {
      const formData = new FormData();

      formData.append("resumeText", resumeText);

      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const response = await fetch(`${API_URL}/structure-resume`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      console.log("Structured Resume:", data);

      setStructuredResume(data.structuredResume);
    } catch (error) {
      console.error(error);
    }
  }

  async function downloadRewrittenResume() {
    if (!resumePreviewRef.current) return;

    const canvas = await html2canvas(resumePreviewRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = 10;
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight <= pageHeight - margin * 2) {
      pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
    } else {
      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;

        pdf.addPage();

        pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);

        heightLeft -= pageHeight - margin * 2;
      }
    }

    pdf.save(`${selectedTemplate}-resume.pdf`);
  }

  async function downloadThemedCoverLetter() {
    if (!coverLetterPreviewRef.current) return;

    const canvas = await html2canvas(coverLetterPreviewRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "letter");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = 10;
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight <= pageHeight - margin * 2) {
      pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
    } else {
      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;

        pdf.addPage();
        pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);

        heightLeft -= pageHeight - margin * 2;
      }
    }

    const safeCompanyName = companyName
      ? companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : "company";

    pdf.save(`${safeCompanyName}-cover-letter.pdf`);
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

      const response = await fetch(`${API_URL}/interview`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      setInterviewQuestions(data);
      setCurrentStep(8);
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

      const response = await fetch(`${API_URL}/parse-resume`, {
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

  async function handlePastedResume() {
    if (!resumeText.trim()) return;

    setLoadingMessage(
      "Please wait while CareerLaunch AI analyzes your resume.",
    );
    setResumeAnalyzing(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("resumeText", resumeText.trim());

      const response = await fetch(`${API_URL}/parse-resume`, {
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
        `Job Title: ${jobTitle}
Company Name: ${companyName || "Not provided"}
Hiring Manager: ${hiringManager || "Not provided"}

Responsibilities and Duties:
${jobDescription}`,
      );

      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const response = await fetch(`${API_URL}/cover-letter`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to generate cover letter.");
        return;
      }

      setCoverLetter(data.coverLetter);
      setLastGeneratedHiringManager(hiringManager.trim());
      setToastMessage("Cover letter updated successfully!");

      setTimeout(() => {
        setToastMessage("");
      }, 2500);
      setCurrentStep(7);
    } catch (error) {
      console.error(error);
      setError("Unable to generate cover letter. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function downloadCoverLetter() {
    if (!coverLetter) return;

    const doc = new jsPDF("p", "mm", "letter");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const leftMargin = 22;
    const rightMargin = 22;
    const maxWidth = pageWidth - leftMargin - rightMargin;

    let y = 22;

    const applicantName = structuredResume?.name?.trim() || "Candidate Name";

    const applicantContact = structuredResume?.contact?.trim() || "";

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "normal");

    // Applicant header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(applicantName, leftMargin, y);
    y += 8;

    if (applicantContact) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      const contactLines = doc.splitTextToSize(applicantContact, maxWidth);

      doc.text(contactLines, leftMargin, y);
      y += contactLines.length * 5 + 7;
    } else {
      y += 4;
    }

    // Date
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(coverLetterDate || "", leftMargin, y);
    y += 8;

    // Hiring manager
    if (hiringManager?.trim()) {
      doc.text(hiringManager.trim(), leftMargin, y);
      y += 7;
    }

    // Company
    if (companyName?.trim()) {
      doc.text(companyName.trim(), leftMargin, y);
      y += 10;
    } else {
      y += 3;
    }

    // Subject
    doc.setFont("helvetica", "bold");
    doc.text(`Re: ${jobTitle || "Target Position"}`, leftMargin, y);
    y += 12;

    // Cover-letter body
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const paragraphs = coverLetter
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    paragraphs.forEach((paragraph) => {
      const lines = doc.splitTextToSize(paragraph, maxWidth);
      const paragraphHeight = lines.length * 6;

      if (y + paragraphHeight > pageHeight - 22) {
        doc.addPage();
        y = 22;
      }

      doc.text(lines, leftMargin, y);
      y += paragraphHeight + 6;
    });

    const safeCompanyName = companyName
      ? companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : "company";

    doc.save(`${safeCompanyName}-cover-letter.pdf`);
  }

  function handleStartOver() {
    resetResumeState();

    setError("");
    setToastMessage("");
    setLoading(false);
    setLoadingMessage("");

    setCurrentStep(1);
    setSelectedTemplate("modern");

    setCompanyName("");
    setHiringManager("");
    setLastGeneratedHiringManager("");
    setCompanyAddress("");
    setCoverLetterDate(
      new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    );

    setResumeInsights(null);
    setRewritePlan(null);

    setIsOptimizingResume(false);
    setOptimizationStep(0);

    setIsBuildingRewritePlan(false);
    setRewritePlanStep(0);
  }

  async function copyToClipboard(text) {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);

      setToastMessage("Copied to clipboard!");

      setTimeout(() => {
        setToastMessage("");
      }, 2500);
    } catch (error) {
      console.error("Copy failed:", error);
      setError("Unable to copy to clipboard.");
    }
  }

  function downloadReport() {
    if (!result) return;

    const doc = new jsPDF();
    const margin = 20;
    const maxWidth = 170;
    let y = 20;

    function addText(text, fontSize = 10, spacing = 7) {
      doc.setFontSize(fontSize);

      const lines = doc.splitTextToSize(String(text), maxWidth);

      if (y + lines.length * spacing > 280) {
        doc.addPage();
        y = 20;
      }

      doc.text(lines, margin, y);
      y += lines.length * spacing;
    }

    doc.setFont(undefined, "bold");
    addText(`ATS Analysis — ${jobTitle || "Target Position"}`, 16, 8);

    doc.setFont(undefined, "normal");
    addText(`ATS Score: ${result.atsScore ?? "N/A"}`, 12, 8);

    if (result.scoreExplanation?.length) {
      doc.setFont(undefined, "bold");
      addText("Score Explanation", 13, 8);

      doc.setFont(undefined, "normal");
      result.scoreExplanation.forEach((item) => {
        addText(`• ${item}`);
      });
    }

    if (result.resumeStrengths?.length) {
      doc.setFont(undefined, "bold");
      addText("Resume Strengths", 13, 8);

      doc.setFont(undefined, "normal");
      result.resumeStrengths.forEach((item) => {
        addText(`• ${item}`);
      });
    }

    if (result.missingKeywords?.length) {
      doc.setFont(undefined, "bold");
      addText("Missing Keywords", 13, 8);

      doc.setFont(undefined, "normal");
      result.missingKeywords.forEach((item) => {
        addText(`• ${item}`);
      });
    }

    if (result.resumeSuggestions?.length) {
      doc.setFont(undefined, "bold");
      addText("Resume Suggestions", 13, 8);

      doc.setFont(undefined, "normal");
      result.resumeSuggestions.forEach((item) => {
        addText(`• ${item}`);
      });
    }

    doc.save("ats-analysis-report.pdf");
  }

  if (showLanding) {
    return <Landing onStart={() => setShowLanding(false)} />;
  }

function getRecommendedTemplate() {
  const applicationText = [
    jobTitle,
    jobDescription,
    resumeText,
    structuredResume ? JSON.stringify(structuredResume) : "",
  ]
    .join(" ")
    .toLowerCase();

  const healthcareKeywords = [
    "registered nurse",
    "licensed vocational nurse",
    "licensed practical nurse",
    "clinical laboratory scientist",
    "clinical lab scientist",
    "medical laboratory scientist",
    "medical technologist",
    "cytogenetics",
    "cytogenetic technologist",
    "fish technologist",
    "laboratory technician",
    "lab technician",
    "phlebotomist",
    "patient care",
    "patient assessment",
    "healthcare",
    "health care",
    "hospital",
    "clinical",
    "medical",
    "nursing",
    "nurse",
    "physician",
    "pharmacist",
    "radiology",
    "therapist",
    "specimen",
    "diagnostic testing",
    "laboratory testing",
    "quality control",
    "clia",
    "cap accreditation",
    "hipaa",
  ];

  const technologyKeywords = [
    "frontend",
    "front-end",
    "backend",
    "back-end",
    "full stack",
    "full-stack",
    "software developer",
    "software engineer",
    "web developer",
    "react",
    "javascript",
    "typescript",
    "node.js",
    "python",
    "java",
    "html",
    "css",
    "database",
    "cloud",
    "aws",
    "azure",
    "github",
    "api",
    "programming",
    "developer",
    "engineer",
  ];

  const leadershipKeywords = [
    "manager",
    "management",
    "director",
    "executive",
    "vice president",
    "department head",
    "team lead",
    "supervisor",
    "leadership",
    "strategic planning",
    "operations management",
    "budget management",
    "stakeholder",
    "cross-functional",
    "managed a team",
    "led a team",
    "oversaw",
  ];

  function calculateScore(keywords) {
    return keywords.reduce((score, keyword) => {
      return applicationText.includes(keyword) ? score + 1 : score;
    }, 0);
  }

  const healthcareScore = calculateScore(healthcareKeywords);
  const technologyScore = calculateScore(technologyKeywords);
  const leadershipScore = calculateScore(leadershipKeywords);

  if (
    healthcareScore >= technologyScore &&
    healthcareScore >= leadershipScore &&
    healthcareScore >= 2
  ) {
    return {
      template: "Healthcare Professional",
      templateId: "healthcare-professional",
      reason:
        "Healthcare Professional was selected based on your clinical background, healthcare terminology, certifications, and target role.",
    };
  }

  if (
    technologyScore >= healthcareScore &&
    technologyScore >= leadershipScore &&
    technologyScore >= 2
  ) {
    return {
      template: "Modern",
      templateId: "modern",
      reason:
        "Modern was selected based on your technical skills, tools, and target technology role.",
    };
  }

  if (
    leadershipScore >= healthcareScore &&
    leadershipScore >= technologyScore &&
    leadershipScore >= 2
  ) {
    return {
      template: "Professional",
      templateId: "professional",
      reason:
        "Professional was selected based on your leadership experience, management responsibilities, and business impact.",
    };
  }

  return {
    template: "Minimal",
    templateId: "minimal",
    reason:
      "Minimal was selected because it provides a clean, versatile format for your experience and target position.",
  };
} 

  const recommendation = getRecommendedTemplate();

  return (
    <div className="app">
      {isOptimizingResume && (
        <ResumeOptimizationProgress currentStep={optimizationStep} />
      )}
      {showOptimizationComplete && <ResumeOptimizationComplete />}
      {isBuildingRewritePlan && (
        <RewritePlanProgress currentStep={rewritePlanStep} />
      )}
      <WizardHeader
        currentStep={currentStep}
        onBack={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
        onReset={() => setShowResetModal(true)}
      />

      <main className="container">
        {currentStep === 1 && (
          <UploadStep
            resumeText={resumeText}
            setResumeText={setResumeText}
            resumeFile={resumeFile}
            fileInputRef={fileInputRef}
            handleResumeUpload={handleResumeUpload}
            handlePastedResume={handlePastedResume}
            setCurrentStep={setCurrentStep}
          />
        )}

        {currentStep === 2 && (
          <JobMatchStep
            jobTitle={jobTitle}
            setJobTitle={setJobTitle}
            companyName={companyName}
            setCompanyName={setCompanyName}
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
              onClick={() => setShowResetModal(true)}
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
        {currentStep === 4 && resumeInsights && (
          <ResumeInsights
            resumeInsights={resumeInsights}
            recommendation={recommendation}
            onContinue={handleRewritePlan}
          />
        )}

        {currentStep === 5 && rewritePlan && (
          <AIRewritePlan
            rewritePlan={rewritePlan}
            onContinue={async () => {
              setSelectedTemplate(recommendation.templateId);
              await handleRewriteResume();
            }}
          />
        )}
        {currentStep === 6 && rewrittenResume && (
          <ResumeOptimize
            rewrittenResume={rewrittenResume}
            structuredResume={structuredResume}
            recommendation={recommendation}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            resumePreviewRef={resumePreviewRef}
            jobTitle={jobTitle}
            copyToClipboard={copyToClipboard}
            downloadRewrittenResume={downloadRewrittenResume}
            handleCoverLetter={handleCoverLetter}
          />
        )}
        {currentStep === 7 && coverLetter && (
          <CoverLetter
            coverLetter={coverLetter}
            jobTitle={jobTitle}
            selectedTemplate={selectedTemplate}
            structuredResume={structuredResume}
            coverLetterPreviewRef={coverLetterPreviewRef}
            copyToClipboard={copyToClipboard}
            downloadCoverLetter={downloadThemedCoverLetter}
            handleInterviewCoach={handleInterviewCoach}
            handleCoverLetter={handleCoverLetter}
            setCurrentStep={setCurrentStep}
            companyName={companyName}
            hiringManager={hiringManager}
            setHiringManager={setHiringManager}
            lastGeneratedHiringManager={lastGeneratedHiringManager}
            coverLetterDate={coverLetterDate}
          />
        )}
        {currentStep === 8 && interviewQuestions && (
          <InterviewPrep
            interviewQuestions={interviewQuestions}
            jobTitle={jobTitle}
            downloadInterviewPrep={downloadInterviewPrep}
            handleReset={() => setShowResetModal(true)}
          />
        )}
      </main>
      {(loading || resumeAnalyzing) &&
        !isOptimizingResume &&
        !isBuildingRewritePlan && (
          <div className="loading-overlay">
            <div className="loading-modal">
              <div className="spinner"></div>
              <h2>Working on it...</h2>
              <p>{loadingMessage}</p>
            </div>
          </div>
        )}

      {showResetModal && (
        <div className="reset-modal-overlay">
          <div className="reset-modal">
            <h2>Start Over?</h2>

            <p>
              This will clear your uploaded resume, job description, analysis,
              and generated documents.
            </p>

            <div className="reset-modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowResetModal(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="reset-confirm-button"
                onClick={() => {
                  setShowResetModal(false);
                  handleStartOver();
                }}
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && <div className="toast">{toastMessage}</div>}
    </div>
  );
}

export default App;
