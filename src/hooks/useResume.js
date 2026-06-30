import { useRef, useState } from "react";

function useResume() {
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [result, setResult] = useState(null);
  const [rewrittenResume, setRewrittenResume] = useState("");
  const [structuredResume, setStructuredResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [interviewQuestions, setInterviewQuestions] = useState(null);
  const [resumeProfile, setResumeProfile] = useState(null);
  const [resumeAnalyzing, setResumeAnalyzing] = useState(false);

  const fileInputRef = useRef(null);

  function resetResumeState() {
    setResumeText("");
    setResumeFile(null);
    setJobDescription("");
    setJobTitle("");
    setResult(null);
    setRewrittenResume("");
    setStructuredResume(null);
    setCoverLetter("");
    setInterviewQuestions(null);
    setResumeProfile(null);
    setResumeAnalyzing(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return {
    resumeText,
    setResumeText,
    resumeFile,
    setResumeFile,
    jobDescription,
    setJobDescription,
    jobTitle,
    setJobTitle,
    result,
    setResult,
    rewrittenResume,
    setRewrittenResume,
    structuredResume,
    setStructuredResume,
    coverLetter,
    setCoverLetter,
    interviewQuestions,
    setInterviewQuestions,
    resumeProfile,
    setResumeProfile,
    resumeAnalyzing,
    setResumeAnalyzing,
    fileInputRef,
    resetResumeState,
  };
}

export default useResume;