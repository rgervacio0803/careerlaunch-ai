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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
  const interviewPrepRef = useRef(null);
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
      const detectedJobTitle = data.jobTitle?.trim();

      if (
        !jobTitle.trim() &&
        detectedJobTitle &&
        detectedJobTitle !== "Target Position" &&
        detectedJobTitle !== "Target Role"
      ) {
        setJobTitle(detectedJobTitle);
      }
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
      setStructuredResume({
        ...data.structuredResume,
        title: jobTitle || data.jobTitle || data.structuredResume?.title || "",
      });
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

      setStructuredResume({
        ...data.structuredResume,
        title: jobTitle || data.jobTitle || data.structuredResume?.title || "",
      });
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

    const pdf = new jsPDF("p", "mm", "letter");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = 10;

    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;

    // This tells us how many canvas pixels fit on one PDF page.
    const pixelsPerMm = canvas.width / usableWidth;
    const pageHeightPixels = Math.floor(usableHeight * pixelsPerMm);

    const overflowAmount = canvas.height - pageHeightPixels;

    // If the resume is only slightly taller than one page,
    // scale the whole resume down so we don't create
    // an almost-empty second page.
    if (
      canvas.height > pageHeightPixels &&
      overflowAmount <= pageHeightPixels * 0.12
    ) {
      const imgData = canvas.toDataURL("image/png");

      const scale = Math.min(
        usableWidth / canvas.width,
        usableHeight / canvas.height,
      );

      const renderedWidth = canvas.width * scale;
      const renderedHeight = canvas.height * scale;

      const x = (pageWidth - renderedWidth) / 2;

      pdf.addImage(imgData, "PNG", x, margin, renderedWidth, renderedHeight);

      pdf.save(`${selectedTemplate}-resume.pdf`);
      return;
    }

    let sourceY = 0;
    let pageNumber = 0;

    function getJobBoundaries() {
      const previewRect = resumePreviewRef.current.getBoundingClientRect();

      const scaleY = canvas.height / resumePreviewRef.current.offsetHeight;

      return Array.from(
        resumePreviewRef.current.querySelectorAll(".resume-job-entry"),
      ).map((job) => {
        const rect = job.getBoundingClientRect();

        return {
          top: Math.round((rect.top - previewRect.top) * scaleY),
          bottom: Math.round((rect.bottom - previewRect.top) * scaleY),
        };
      });
    }

    const jobBoundaries = getJobBoundaries();

    function findSafeBreak(startY, idealEndY) {
      const ctx = canvas.getContext("2d");

      // Prefer keeping an entire job together when possible
      const crossingJob = jobBoundaries.find((job) => {
        const jobHeight = job.bottom - job.top;

        return (
          job.top > startY &&
          job.top < idealEndY &&
          job.bottom > idealEndY &&
          jobHeight <= pageHeightPixels
        );
      });

      if (crossingJob) {
        const spaceUsedBeforeJob = crossingJob.top - startY;

        // Only move the whole job if it won't leave most of the page empty
        if (spaceUsedBeforeJob >= pageHeightPixels * 0.45) {
          return crossingJob.top;
        }
      }

      const searchStart = Math.max(
        startY + Math.floor(pageHeightPixels * 0.75),
        idealEndY - 180,
      );

      const searchEnd = Math.min(idealEndY, canvas.height - 1);

      for (let y = searchEnd; y >= searchStart; y -= 2) {
        const row = ctx.getImageData(0, y, canvas.width, 1).data;

        let darkPixels = 0;

        for (let i = 0; i < row.length; i += 4) {
          const r = row[i];
          const g = row[i + 1];
          const b = row[i + 2];

          if (r < 245 || g < 245 || b < 245) {
            darkPixels += 1;
          }
        }

        const darkRatio = darkPixels / canvas.width;

        if (darkRatio < 0.01) {
          return y;
        }
      }

      return idealEndY;
    }

    while (sourceY < canvas.height) {
      const idealEndY = Math.min(sourceY + pageHeightPixels, canvas.height);

      const safeEndY =
        idealEndY < canvas.height
          ? findSafeBreak(sourceY, idealEndY)
          : idealEndY;

      const sliceHeight = safeEndY - sourceY;

      // Create a temporary canvas containing ONLY this page.
      const pageCanvas = document.createElement("canvas");

      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;

      const context = pageCanvas.getContext("2d");

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

      context.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight,
      );

      const pageImage = pageCanvas.toDataURL("image/png");

      const renderedHeight = sliceHeight / pixelsPerMm;

      if (pageNumber > 0) {
        pdf.addPage();
      }

      pdf.addImage(
        pageImage,
        "PNG",
        margin,
        margin,
        usableWidth,
        renderedHeight,
      );

      sourceY += sliceHeight;
      pageNumber += 1;
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

    const pdf = new jsPDF("p", "mm", "letter");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = 10;

    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;

    // Calculate how many canvas pixels fit on one PDF page.
    const pixelsPerMm = canvas.width / usableWidth;
    const pageHeightPixels = Math.floor(usableHeight * pixelsPerMm);

    let sourceY = 0;
    let pageNumber = 0;

    function findSafeBreak(startY, idealEndY) {
      const ctx = canvas.getContext("2d");

      const searchStart = Math.max(
        startY + Math.floor(pageHeightPixels * 0.75),
        idealEndY - 180,
      );

      const searchEnd = Math.min(idealEndY, canvas.height - 1);

      for (let y = searchEnd; y >= searchStart; y -= 2) {
        const row = ctx.getImageData(0, y, canvas.width, 1).data;

        let darkPixels = 0;

        for (let i = 0; i < row.length; i += 4) {
          const r = row[i];
          const g = row[i + 1];
          const b = row[i + 2];

          if (r < 245 || g < 245 || b < 245) {
            darkPixels += 1;
          }
        }

        const darkRatio = darkPixels / canvas.width;

        if (darkRatio < 0.01) {
          return y;
        }
      }

      return idealEndY;
    }

    const overflowAmount = canvas.height - pageHeightPixels;

    // If the letter only exceeds one page by a small amount,
    // scale the complete letter down to fit on one page.
    if (
      canvas.height > pageHeightPixels &&
      overflowAmount <= pageHeightPixels * 0.3
    ) {
      const imgData = canvas.toDataURL("image/png");

      const scale = Math.min(
        usableWidth / canvas.width,
        usableHeight / canvas.height,
      );

      const renderedWidth = canvas.width * scale;
      const renderedHeight = canvas.height * scale;

      const x = (pageWidth - renderedWidth) / 2;

      pdf.addImage(imgData, "PNG", x, margin, renderedWidth, renderedHeight);

      const safeCompanyName = companyName
        ? companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
        : "company";

      pdf.save(`${safeCompanyName}-cover-letter.pdf`);
      return;
    }

    while (sourceY < canvas.height) {
      const idealEndY = Math.min(sourceY + pageHeightPixels, canvas.height);

      const safeEndY =
        idealEndY < canvas.height
          ? findSafeBreak(sourceY, idealEndY)
          : idealEndY;

      const sliceHeight = safeEndY - sourceY;

      // Skip a final page that contains only a tiny leftover fragment.
      if (safeEndY === canvas.height && pageNumber > 0) {
        const ctx = canvas.getContext("2d");

        const sample = ctx.getImageData(
          0,
          sourceY,
          canvas.width,
          sliceHeight,
        ).data;

        let nonWhitePixels = 0;
        const totalPixels = sample.length / 4;

        for (let i = 0; i < sample.length; i += 4) {
          const r = sample[i];
          const g = sample[i + 1];
          const b = sample[i + 2];

          if (r < 245 || g < 245 || b < 245) {
            nonWhitePixels += 1;
          }
        }

        const contentRatio = nonWhitePixels / totalPixels;

        if (contentRatio < 0.01) {
          break;
        }
      }

      // Create a temporary canvas containing only this page.
      const pageCanvas = document.createElement("canvas");

      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;

      const context = pageCanvas.getContext("2d");

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

      context.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight,
      );

      const pageImage = pageCanvas.toDataURL("image/png");

      const renderedHeight = sliceHeight / pixelsPerMm;

      if (pageNumber > 0) {
        pdf.addPage();
      }

      pdf.addImage(
        pageImage,
        "PNG",
        margin,
        margin,
        usableWidth,
        renderedHeight,
      );

      sourceY += sliceHeight;
      pageNumber += 1;
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

  async function downloadInterviewPrep() {
    if (!interviewPrepRef.current) return;

    const preview = interviewPrepRef.current;

    preview.classList.add("interview-pdf-mode");

    try {
      // Give the browser a moment to apply the single-column PDF layout.
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const pdf = new jsPDF("p", "mm", "letter");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 10;
      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;

      let y = margin;
      let pageNumber = 0;

      const panels = Array.from(preview.querySelectorAll(".interview-panel"));

      async function captureElement(element) {
        return await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });
      }

      function addNewPage() {
        pdf.addPage();
        pageNumber += 1;
        y = margin;
      }

      async function addCanvasToPdf(canvas, extraGap = 5) {
        const imgData = canvas.toDataURL("image/png");

        const renderedHeight = (canvas.height * usableWidth) / canvas.width;

        // If the next complete item will not fit,
        // move the whole item to the next page.
        if (y + renderedHeight > pageHeight - margin && y > margin) {
          addNewPage();
        }

        // Safety fallback for an unusually tall single card.
        if (renderedHeight > usableHeight) {
          const scale = usableHeight / renderedHeight;

          const scaledWidth = usableWidth * scale;
          const scaledHeight = renderedHeight * scale;

          const x = (pageWidth - scaledWidth) / 2;

          pdf.addImage(imgData, "PNG", x, y, scaledWidth, scaledHeight);

          y += scaledHeight + extraGap;
          return;
        }

        pdf.addImage(imgData, "PNG", margin, y, usableWidth, renderedHeight);

        y += renderedHeight + extraGap;
      }

      for (const panel of panels) {
        const heading = panel.querySelector("h3");

        // Start each major section cleanly.
        if (y > margin + 10) {
          y += 4;
        }

        if (heading) {
          const headingCanvas = await captureElement(heading);

          const headingHeight =
            (headingCanvas.height * usableWidth) / headingCanvas.width;

          if (y + headingHeight + 25 > pageHeight - margin) {
            addNewPage();
          }

          await addCanvasToPdf(headingCanvas, 5);
        }

        // Regular Technical / Behavioral / Career Switch cards
        const cards = Array.from(panel.querySelectorAll(".interview-card"));

        for (const card of cards) {
          const cardCanvas = await captureElement(card);
          await addCanvasToPdf(cardCanvas, 6);
        }

        // Employer questions use a different card class
        const employerQuestions = Array.from(
          panel.querySelectorAll(".employer-question"),
        );

        for (const question of employerQuestions) {
          const questionCanvas = await captureElement(question);
          await addCanvasToPdf(questionCanvas, 3);
        }
      }

      pdf.save("interview-prep-guide.pdf");
    } catch (error) {
      console.error("Interview Prep PDF error:", error);
    } finally {
      // Always restore the normal two-column app layout.
      preview.classList.remove("interview-pdf-mode");
    }
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

    const doc = new jsPDF("p", "mm", "letter");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const margin = 12;
    const contentWidth = pageWidth - margin * 2;

    let y = 12;

    function drawCard(x, cardY, width, height) {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(220, 226, 235);

      doc.roundedRect(x, cardY, width, height, 3, 3, "FD");
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.setTextColor(15, 23, 42);

    doc.text("ATS Analysis Results", margin, y);

    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);

    const jobTitleLines = doc.splitTextToSize(
      `Resume match for: ${jobTitle || "Target Position"}`,
      contentWidth,
    );

    doc.text(jobTitleLines, margin, y);

    y += jobTitleLines.length * 5 + 7;

    const explanationWidth = contentWidth - 65;
    const explanationLineHeight = 4.2;

    const preparedExplanations = (result.scoreExplanation || []).map((item) => {
      const lines = doc.splitTextToSize(String(item), explanationWidth);

      return {
        lines,
        height: lines.length * explanationLineHeight + 2,
      };
    });

    const explanationTotalHeight = preparedExplanations.reduce(
      (total, item) => total + item.height,
      0,
    );

    const scoreCardHeight = Math.max(73, 39 + explanationTotalHeight);

    drawCard(margin, y, contentWidth, scoreCardHeight);

    const cardTop = y;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);

    doc.text("ATS Compatibility Score", margin + 10, cardTop + 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);

    doc.text("How well your resume matches the job", margin + 10, cardTop + 18);

    // ATS SCORE BREAKDOWN
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);

    doc.text("ATS Score Breakdown", margin + 10, cardTop + 29);

    let explanationY = cardTop + 37;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);

    preparedExplanations.forEach(({ lines, height }) => {
      doc.text("•", margin + 10, explanationY);

      doc.text(lines, margin + 15, explanationY);

      explanationY += height;
    });

    // ATS SCORE CIRCLE
    const scoreX = pageWidth - margin - 25;
    const scoreY = cardTop + 34;
    const scoreRadius = 14;

    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(2.5);

    doc.circle(scoreX, scoreY, scoreRadius, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(21);
    doc.setTextColor(34, 197, 94);

    doc.text(String(result.atsScore ?? "N/A"), scoreX, scoreY + 2.5, {
      align: "center",
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    doc.text("OVERALL", scoreX, scoreY + 22, {
      align: "center",
    });

    y += scoreCardHeight + 7;

    const cardGap = 6;
    const halfCardWidth = (contentWidth - cardGap) / 2;

    const strengths = result.resumeStrengths || [];
    const keywords = result.missingKeywords || [];

    // Prepare wrapped strength text so we can calculate card height
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);

    const strengthTextWidth = halfCardWidth - 18;

    const preparedStrengths = strengths.map((item) => {
      const lines = doc.splitTextToSize(String(item), strengthTextWidth);

      return {
        lines,
        height: lines.length * 4.2 + 3,
      };
    });

    const strengthsContentHeight = preparedStrengths.reduce(
      (total, item) => total + item.height,
      0,
    );

    // Estimate keyword pill rows
    // Calculate the exact number of keyword pill rows
    const keywordInnerWidth = halfCardWidth - 16;

    let keywordRowX = 0;
    let keywordRows = 1;

    const pillPadding = 4;
    const pillGap = 3;
    const pillHeight = 8;
    const pillRowGap = 3;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);

    keywords.forEach((keyword) => {
      const keywordText = String(keyword);

      const pillWidth = doc.getTextWidth(keywordText) + pillPadding * 2;

      if (keywordRowX > 0 && keywordRowX + pillWidth > keywordInnerWidth) {
        keywordRows += 1;
        keywordRowX = 0;
      }

      keywordRowX += pillWidth + pillGap;
    });

    const keywordsContentHeight =
      keywordRows * pillHeight + (keywordRows - 1) * pillRowGap;

    const secondRowCardHeight = Math.max(
      55,
      20 + strengthsContentHeight,
      28 + keywordsContentHeight,
    );

    // Move the entire Strengths / Missing Keywords row
    // to the next page if it will not fit.
    if (y + secondRowCardHeight > pageHeight - margin) {
      doc.addPage();
      y = 18;
    }

    drawCard(margin, y, halfCardWidth, secondRowCardHeight);

    drawCard(
      margin + halfCardWidth + cardGap,
      y,
      halfCardWidth,
      secondRowCardHeight,
    );

    const strengthsCardX = margin;
    const keywordsCardX = margin + halfCardWidth + cardGap;
    const rowTop = y;

    // Resume Strengths heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);

    // Resume Strengths icon
    doc.setFillColor(255, 244, 105);
    doc.circle(strengthsCardX + 9, rowTop + 10, 4.5, "F");

    // Draw green check mark
    doc.setDrawColor(132, 204, 22);
    doc.setLineWidth(1.2);

    doc.line(
      strengthsCardX + 6.8,
      rowTop + 10,
      strengthsCardX + 8.4,
      rowTop + 11.6,
    );

    doc.line(
      strengthsCardX + 8.4,
      rowTop + 11.6,
      strengthsCardX + 11.5,
      rowTop + 8.3,
    );

    // Resume Strengths heading

    // Draw green checkmark
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(1.2);

    doc.line(
      strengthsCardX + 8,
      rowTop + 10,
      strengthsCardX + 9.5,
      rowTop + 11.5,
    );

    doc.line(
      strengthsCardX + 9.5,
      rowTop + 11.5,
      strengthsCardX + 12.5,
      rowTop + 8,
    );

    // Write Resume Strengths
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);

    doc.text("Resume Strengths", strengthsCardX + 16, rowTop + 12);

    // Resume Strengths bullets
    let strengthsY = rowTop + 22;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);

    preparedStrengths.forEach(({ lines, height }) => {
      doc.text("•", strengthsCardX + 8, strengthsY);

      doc.text(lines, strengthsCardX + 13, strengthsY);

      strengthsY += height;
    });

    // Missing Keywords heading

    // Draw red X
    doc.setDrawColor(244, 63, 94);
    doc.setLineWidth(1.2);

    doc.line(keywordsCardX + 8, rowTop + 8, keywordsCardX + 12, rowTop + 12);

    doc.line(keywordsCardX + 12, rowTop + 8, keywordsCardX + 8, rowTop + 12);

    // Write Missing Keywords
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);

    doc.text("Missing Keywords", keywordsCardX + 16, rowTop + 12);

    // Missing Keywords pills
    let keywordPillX = keywordsCardX + 8;
    let keywordPillY = rowTop + 24;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);

    keywords.forEach((keyword) => {
      const keywordText = String(keyword);
      const pillPadding = 4;
      const pillHeight = 8;
      const pillGap = 3;

      const pillWidth = doc.getTextWidth(keywordText) + pillPadding * 2;

      const rightEdge = keywordsCardX + halfCardWidth - 8;

      if (keywordPillX + pillWidth > rightEdge) {
        keywordPillX = keywordsCardX + 8;
        keywordPillY += pillHeight + pillGap;
      }

      doc.setFillColor(255, 241, 242);
      doc.setDrawColor(254, 202, 202);

      doc.roundedRect(
        keywordPillX,
        keywordPillY - 5.5,
        pillWidth,
        pillHeight,
        2,
        2,
        "FD",
      );

      doc.setTextColor(220, 38, 38);

      doc.text(keywordText, keywordPillX + pillPadding, keywordPillY);

      keywordPillX += pillWidth + pillGap;
    });

    y += secondRowCardHeight + 7;

    // THIRD ROW: Resume Suggestions + Career Advice

    const suggestions = result.resumeSuggestions || [];
    const careerAdvice = result.careerAdvice || [];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);

    const thirdRowTextWidth = halfCardWidth - 18;

    // Prepare Resume Suggestions
    const preparedSuggestions = suggestions.map((item) => {
      const lines = doc.splitTextToSize(String(item), thirdRowTextWidth);

      return {
        lines,
        height: lines.length * 4.2 + 3,
      };
    });

    // Prepare Career Advice
    const preparedCareerAdvice = careerAdvice.map((item) => {
      const lines = doc.splitTextToSize(String(item), thirdRowTextWidth);

      return {
        lines,
        height: lines.length * 4.2 + 3,
      };
    });

    const suggestionsHeight = preparedSuggestions.reduce(
      (total, item) => total + item.height,
      0,
    );

    const careerAdviceHeight = preparedCareerAdvice.reduce(
      (total, item) => total + item.height,
      0,
    );

    const thirdRowCardHeight = Math.max(
      55,
      22 + suggestionsHeight,
      22 + careerAdviceHeight,
    );

    // Only start a new page if the bottom cards will not fit.
    if (y + thirdRowCardHeight > pageHeight - margin) {
      doc.addPage();
      y = 18;
    }

    const suggestionsCardX = margin;
    const careerAdviceCardX = margin + halfCardWidth + cardGap;

    const thirdRowTop = y;

    drawCard(suggestionsCardX, thirdRowTop, halfCardWidth, thirdRowCardHeight);

    drawCard(careerAdviceCardX, thirdRowTop, halfCardWidth, thirdRowCardHeight);

    // Resume Suggestions heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);

    doc.text("Resume Suggestions", suggestionsCardX + 8, thirdRowTop + 12);

    // Resume Suggestions bullets
    let suggestionsY = thirdRowTop + 22;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);

    preparedSuggestions.forEach(({ lines, height }) => {
      doc.text("•", suggestionsCardX + 8, suggestionsY);

      doc.text(lines, suggestionsCardX + 13, suggestionsY);

      suggestionsY += height;
    });

    // Career Advice heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);

    doc.text("Career Advice", careerAdviceCardX + 8, thirdRowTop + 12);

    // Career Advice bullets
    let careerAdviceY = thirdRowTop + 22;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);

    preparedCareerAdvice.forEach(({ lines, height }) => {
      doc.text("•", careerAdviceCardX + 8, careerAdviceY);

      doc.text(lines, careerAdviceCardX + 13, careerAdviceY);

      careerAdviceY += height;
    });

    y += thirdRowCardHeight + 7;

    doc.save("ats-analysis-report.pdf");
    return;

    function addHeader() {
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 28, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      doc.text("CareerLaunch AI", leftMargin, 12);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("ATS Resume Analysis Report", leftMargin, 20);

      doc.setTextColor(15, 23, 42);

      y = 38;
    }

    function addPage() {
      doc.addPage();
      addHeader();
    }

    function ensureSpace(requiredHeight) {
      if (y + requiredHeight > pageHeight - bottomMargin) {
        addPage();
      }
    }

    function addSectionHeading(title) {
      ensureSpace(16);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);

      doc.text(title, leftMargin, y);

      doc.setDrawColor(203, 213, 225);
      doc.line(leftMargin, y + 3, pageWidth - rightMargin, y + 3);

      y += 11;
    }

    function addBullet(item) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(51, 65, 85);

      const bulletIndent = 6;
      const textWidth = contentWidth - bulletIndent;

      const lines = doc.splitTextToSize(String(item), textWidth);
      const lineHeight = 5.5;
      const requiredHeight = lines.length * lineHeight + 3;

      ensureSpace(requiredHeight);

      doc.text("•", leftMargin, y);
      doc.text(lines, leftMargin + bulletIndent, y);

      y += requiredHeight;
    }

    function addKeywordPills(keywords) {
      let x = leftMargin;
      const pillHeight = 8;
      const horizontalPadding = 4;
      const gap = 3;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);

      keywords.forEach((keyword) => {
        const textWidth = doc.getTextWidth(keyword);
        const pillWidth = textWidth + horizontalPadding * 2;

        if (x + pillWidth > pageWidth - rightMargin) {
          x = leftMargin;
          y += pillHeight + gap;
        }

        ensureSpace(pillHeight + gap);

        doc.setFillColor(239, 246, 255);
        doc.setDrawColor(191, 219, 254);
        doc.roundedRect(x, y - 5.5, pillWidth, pillHeight, 2, 2, "FD");

        doc.setTextColor(30, 64, 175);
        doc.text(keyword, x + horizontalPadding, y);

        x += pillWidth + gap;
      });

      y += pillHeight + 6;
    }

    function addPageNumbers() {
      const totalPages = doc.getNumberOfPages();

      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        doc.setPage(pageNumber);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);

        doc.text(
          `Page ${pageNumber} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 9,
          { align: "center" },
        );
      }
    }

    addHeader();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);

    const titleLines = doc.splitTextToSize(
      jobTitle || "Target Position",
      contentWidth,
    );

    doc.text(titleLines, leftMargin, y);
    y += titleLines.length * 7 + 8;

    ensureSpace(34);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(leftMargin, y, contentWidth, 30, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text("ATS COMPATIBILITY SCORE", leftMargin + 8, y + 10);

    doc.setFontSize(24);
    doc.setTextColor(37, 99, 235);
    doc.text(
      `${result.atsScore ?? "N/A"}`,
      pageWidth - rightMargin - 18,
      y + 18,
      { align: "center" },
    );

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("out of 100", pageWidth - rightMargin - 18, y + 24, {
      align: "center",
    });

    y += 40;

    if (result.scoreExplanation?.length) {
      addSectionHeading("Score Explanation");

      result.scoreExplanation.forEach((item) => {
        addBullet(item);
      });

      y += 3;
    }

    if (result.resumeStrengths?.length) {
      addSectionHeading("Resume Strengths");

      result.resumeStrengths.forEach((item) => {
        addBullet(item);
      });

      y += 3;
    }

    if (result.missingKeywords?.length) {
      addSectionHeading("Missing Keywords");
      addKeywordPills(result.missingKeywords);
    }

    if (result.resumeSuggestions?.length) {
      addSectionHeading("Resume Suggestions");

      result.resumeSuggestions.forEach((item) => {
        addBullet(item);
      });
    }

    addPageNumbers();

    doc.save("ats-analysis-report.pdf");
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

  if (showLanding) {
    return <Landing onStart={() => setShowLanding(false)} />;
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
            setStructuredResume={setStructuredResume}
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
            interviewPrepRef={interviewPrepRef}
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
