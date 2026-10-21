import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import { apiRequest } from "./api";
import useSessionState, { clearSessionState } from "./hooks/useSessionState";
import {
  cleanResume,
  getRecommendedTemplate,
  resumeToPlainText,
} from "./utils/resume";
import {
  downloadCoverLetterPdf,
  downloadInterviewPdf,
  downloadReportPdf,
  downloadResumePdf,
} from "./utils/pdf";

import "./App.css";
import "./styles/base.css";
import "./styles/landing.css";
import "./styles/wizard.css";
import "./styles/ats.css";
import "./styles/optimize.css";
import "./styles/interview.css";
import "./styles/components.css";
import "./styles/resumeTemplates.css";

import Auth from "./components/Auth";
import Landing from "./components/Landing";
import WizardHeader from "./components/Wizard/WizardHeader";
import UploadStep from "./components/Wizard/UploadStep";
import JobMatchStep from "./components/Wizard/JobMatchStep";
import ATSResults from "./components/Wizard/ATSResults";
import ResumeInsights from "./components/Wizard/ResumeInsights";
import AIRewritePlan from "./components/AIRewritePlan";
import ResumeOptimize from "./components/Wizard/ResumeOptimize";
import CoverLetter from "./components/Wizard/CoverLetter";
import InterviewPrep from "./components/Wizard/InterviewPrep";
import ResumeOptimizationProgress from "./components/ResumeOptimizationProgress";
import RewritePlanProgress from "./components/RewritePlanProgress";
import ResumeOptimizationComplete from "./components/ResumeOptimizationComplete";

function todayLabel() {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function App() {
  // Account
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showLanding, setShowLanding] = useSessionState("showLanding", true);

  // Wizard progress (kept across refreshes in this tab)
  const [currentStep, setCurrentStep] = useSessionState("step", 1);
  const [resumeText, setResumeText] = useSessionState("resumeText", "");
  const [parsedResumeText, setParsedResumeText] = useSessionState(
    "parsedResumeText",
    "",
  );
  const [resumeFileName, setResumeFileName] = useSessionState(
    "resumeFileName",
    "",
  );
  const [jobTitle, setJobTitle] = useSessionState("jobTitle", "");
  const [companyName, setCompanyName] = useSessionState("companyName", "");
  const [jobDescription, setJobDescription] = useSessionState(
    "jobDescription",
    "",
  );
  const [result, setResult] = useSessionState("result", null);
  const [resumeInsights, setResumeInsights] = useSessionState("insights", null);
  const [rewritePlan, setRewritePlan] = useSessionState("rewritePlan", null);
  const [structuredResume, setStructuredResume] = useSessionState(
    "structuredResume",
    null,
  );
  const [selectedTemplate, setSelectedTemplate] = useSessionState(
    "template",
    "modern",
  );
  const [coverLetter, setCoverLetter] = useSessionState("coverLetter", "");
  const [hiringManager, setHiringManager] = useSessionState("hiringManager", "");
  const [lastGeneratedHiringManager, setLastGeneratedHiringManager] =
    useSessionState("lastHiringManager", "");
  const [coverLetterDate, setCoverLetterDate] = useSessionState(
    "coverLetterDate",
    todayLabel(),
  );
  const [interviewQuestions, setInterviewQuestions] = useSessionState(
    "interview",
    null,
  );

  // Screen state
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [isOptimizingResume, setIsOptimizingResume] = useState(false);
  const [optimizationStep, setOptimizationStep] = useState(0);
  const [showOptimizationComplete, setShowOptimizationComplete] =
    useState(false);
  const [isBuildingRewritePlan, setIsBuildingRewritePlan] = useState(false);
  const [rewritePlanStep, setRewritePlanStep] = useState(0);
  const [showResetModal, setShowResetModal] = useState(false);
  const fileInputRef = useRef(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Each new step starts at the top of the page.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [currentStep, showLanding]);

  const recommendation = getRecommendedTemplate({
    jobTitle,
    jobDescription,
    resumeText,
    structuredResume,
  });

  // The optimized resume (with any edits) once it exists, else the original.
  const latestResumeText = structuredResume
    ? resumeToPlainText(structuredResume)
    : resumeText;

  function showToast(message) {
    clearTimeout(toastTimer.current);
    setToastMessage(message);
    toastTimer.current = setTimeout(() => setToastMessage(""), 2500);
  }

  function goToStep(step) {
    setError("");
    setCurrentStep(step);
  }

  // Clears every AI result that depends on the resume or job.
  function clearResults() {
    setResult(null);
    setResumeInsights(null);
    setRewritePlan(null);
    setStructuredResume(null);
    setCoverLetter("");
    setLastGeneratedHiringManager("");
    setInterviewQuestions(null);
  }

  function jobDetailsText() {
    return [
      jobTitle.trim() && `Job Title: ${jobTitle.trim()}`,
      companyName.trim() && `Company Name: ${companyName.trim()}`,
      `Responsibilities and Duties:\n${jobDescription.trim()}`,
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  async function parseResume({ file = null, text = "" }) {
    setLoadingMessage("Please wait while CareerLaunch AI analyzes your resume.");
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest(
        "/parse-resume",
        file ? {} : { resumeText: text },
        file,
      );

      setResumeText(data.resumeText);
      setParsedResumeText(data.resumeText);
      setResumeFileName(file ? file.name : "");
      clearResults();
      goToStep(2);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleResumeUpload(file) {
    if (file) {
      parseResume({ file });
    }
  }

  function handleUploadContinue() {
    const text = resumeText.trim();
    if (!text) return;

    if (text === parsedResumeText.trim()) {
      goToStep(2);
    } else {
      parseResume({ text });
    }
  }

  async function handleAnalyze() {
    if (!resumeText.trim()) {
      setError("Please upload or paste your resume first.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please paste the job description.");
      return;
    }

    setLoadingMessage(
      "Please wait while CareerLaunch AI reviews your resume and job description.",
    );
    setLoading(true);
    setError("");

    try {
      const fields = { resumeText, jobDescription: jobDetailsText() };

      const [analysis, insights] = await Promise.all([
        apiRequest("/analyze", fields),
        apiRequest("/resume-insights", fields),
      ]);

      clearResults();
      setResult(analysis);
      setResumeInsights(insights);

      if (!jobTitle.trim() && analysis.jobTitle) {
        setJobTitle(analysis.jobTitle);
      }

      goToStep(3);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRewritePlan() {
    if (rewritePlan) {
      goToStep(5);
      return;
    }

    setIsBuildingRewritePlan(true);
    setRewritePlanStep(0);
    setError("");

    const progressTimer = setInterval(() => {
      setRewritePlanStep((current) => Math.min(current + 1, 2));
    }, 1800);

    try {
      const data = await apiRequest("/rewrite-plan", {
        resumeText,
        jobDescription: jobDetailsText(),
        resumeInsights,
      });

      setRewritePlan(data.rewritePlan);
      setRewritePlanStep(2);
      await wait(600);
      goToStep(5);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      clearInterval(progressTimer);
      setIsBuildingRewritePlan(false);
    }
  }

  async function handleRewriteResume() {
    if (structuredResume) {
      goToStep(6);
      return;
    }

    setIsOptimizingResume(true);
    setOptimizationStep(0);
    setError("");

    const progressTimer = setInterval(() => {
      setOptimizationStep((current) => Math.min(current + 1, 4));
    }, 2500);

    try {
      const data = await apiRequest("/rewrite", {
        resumeText,
        jobDescription: jobDetailsText(),
        rewritePlan,
      });

      setStructuredResume({
        ...data.structuredResume,
        title: jobTitle.trim() || data.structuredResume.title || "",
      });
      setSelectedTemplate(recommendation.templateId);
      setCoverLetter("");
      setInterviewQuestions(null);

      clearInterval(progressTimer);
      setOptimizationStep(4);
      setIsOptimizingResume(false);
      setShowOptimizationComplete(true);
      await wait(1200);
      setShowOptimizationComplete(false);
      goToStep(6);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      clearInterval(progressTimer);
      setIsOptimizingResume(false);
    }
  }

  async function handleCoverLetter({ regenerate = false } = {}) {
    if (coverLetter && !regenerate) {
      goToStep(7);
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please paste the job description.");
      return;
    }

    setLoadingMessage(
      "Please wait while CareerLaunch AI writes your tailored cover letter.",
    );
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/cover-letter", {
        resumeText: latestResumeText,
        jobDescription: `${jobDetailsText()}\n\nHiring Manager: ${
          hiringManager.trim() || "Not provided"
        }`,
      });

      setCoverLetter(data.coverLetter);
      setLastGeneratedHiringManager(hiringManager.trim());
      setCoverLetterDate(todayLabel());
      showToast(regenerate ? "Cover letter updated!" : "Cover letter ready!");
      goToStep(7);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleInterviewCoach() {
    if (interviewQuestions) {
      goToStep(8);
      return;
    }

    setLoadingMessage(
      "Please wait while CareerLaunch AI creates your interview prep questions and answers.",
    );
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/interview", {
        resumeText: latestResumeText,
        jobDescription: jobDetailsText(),
      });

      setInterviewQuestions(data);
      goToStep(8);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function runDownload(download) {
    try {
      await download();
    } catch (downloadError) {
      console.error(downloadError);
      setError("Unable to create the PDF. Please try again.");
    }
  }

  async function copyToClipboard(text) {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard!");
    } catch {
      setError("Unable to copy to clipboard.");
    }
  }

  function resetWizard() {
    clearResults();
    setResumeText("");
    setParsedResumeText("");
    setResumeFileName("");
    setJobTitle("");
    setCompanyName("");
    setJobDescription("");
    setHiringManager("");
    setCoverLetterDate(todayLabel());
    setSelectedTemplate("modern");
    setError("");
    setCurrentStep(1);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleLogOut() {
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setError("Unable to log out. Please try again.");
      return;
    }

    resetWizard();
    clearSessionState();
    setShowLanding(true);
  }

  if (authLoading) {
    return (
      <div className="app" role="status">
        Loading CareerLaunch AI...
      </div>
    );
  }

  if (showLanding) {
    return <Landing onStart={() => setShowLanding(false)} />;
  }

  if (!user) {
    return <Auth onBack={() => setShowLanding(true)} />;
  }

  return (
    <div className="app">
      <div className="account-nav">
        <button
          type="button"
          className="back-home-btn"
          onClick={() => setShowLanding(true)}
        >
          ← Back to Home
        </button>
        <button type="button" className="logout-btn" onClick={handleLogOut}>
          Log Out
        </button>
      </div>

      {isOptimizingResume && (
        <ResumeOptimizationProgress currentStep={optimizationStep} />
      )}
      {showOptimizationComplete && <ResumeOptimizationComplete />}
      {isBuildingRewritePlan && (
        <RewritePlanProgress currentStep={rewritePlanStep} />
      )}

      <WizardHeader
        currentStep={currentStep}
        onBack={() => goToStep(Math.max(currentStep - 1, 1))}
        onReset={() => setShowResetModal(true)}
      />

      <main className="container">
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {currentStep === 1 && (
          <UploadStep
            resumeText={resumeText}
            setResumeText={setResumeText}
            resumeFileName={resumeFileName}
            fileInputRef={fileInputRef}
            onFileSelected={handleResumeUpload}
            onContinue={handleUploadContinue}
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

        {currentStep === 3 && result && (
          <ATSResults
            result={result}
            jobTitle={jobTitle}
            copyToClipboard={copyToClipboard}
            downloadReport={() =>
              runDownload(() => downloadReportPdf(result, jobTitle))
            }
            onContinue={() => goToStep(4)}
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
            alreadyApplied={Boolean(structuredResume)}
            onContinue={handleRewriteResume}
          />
        )}

        {currentStep === 6 && structuredResume && (
          <ResumeOptimize
            structuredResume={structuredResume}
            setStructuredResume={setStructuredResume}
            recommendation={recommendation}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            onCopy={() => copyToClipboard(resumeToPlainText(structuredResume))}
            onDownload={() =>
              runDownload(() =>
                downloadResumePdf(structuredResume, selectedTemplate),
              )
            }
            onContinue={() => handleCoverLetter()}
          />
        )}

        {currentStep === 7 && coverLetter && (
          <CoverLetter
            coverLetter={coverLetter}
            jobTitle={jobTitle}
            selectedTemplate={selectedTemplate}
            structuredResume={cleanResume(structuredResume)}
            companyName={companyName}
            hiringManager={hiringManager}
            setHiringManager={setHiringManager}
            lastGeneratedHiringManager={lastGeneratedHiringManager}
            coverLetterDate={coverLetterDate}
            onCopy={() => copyToClipboard(coverLetter)}
            onDownload={() =>
              runDownload(() =>
                downloadCoverLetterPdf({
                  structuredResume,
                  templateId: selectedTemplate,
                  coverLetter,
                  coverLetterDate,
                  hiringManager,
                  companyName,
                }),
              )
            }
            onRegenerate={() => handleCoverLetter({ regenerate: true })}
            onContinue={handleInterviewCoach}
          />
        )}

        {currentStep === 8 && interviewQuestions && (
          <InterviewPrep
            interviewQuestions={interviewQuestions}
            jobTitle={jobTitle}
            onDownload={() =>
              runDownload(() => downloadInterviewPdf(interviewQuestions, jobTitle))
            }
            handleReset={() => setShowResetModal(true)}
          />
        )}
      </main>

      {loading && (
        <div className="loading-overlay" role="status" aria-live="polite">
          <div className="loading-modal">
            <div className="spinner" aria-hidden="true"></div>
            <h2>Working on it...</h2>
            <p>{loadingMessage}</p>
          </div>
        </div>
      )}

      {showResetModal && (
        <div className="reset-modal-overlay">
          <div
            className="reset-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-modal-title"
          >
            <h2 id="reset-modal-title">Start Over?</h2>

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
                  resetWizard();
                }}
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="toast" role="status">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default App;
