// Shared helpers for the structured resume ({ name, title, contact, summary,
// skills, experience: [{ jobTitle, company, dates, bullets }], education,
// certifications }).

function cleanList(list) {
  return (Array.isArray(list) ? list : [])
    .map((item) => String(item ?? "").trim())
    .filter(Boolean);
}

/** Drops blank lines and empty entries left behind by the editor. */
export function cleanResume(resume) {
  if (!resume) return null;

  return {
    ...resume,
    name: (resume.name || "").trim(),
    title: (resume.title || "").trim(),
    contact: (resume.contact || "").trim(),
    summary: (resume.summary || "").trim(),
    skills: cleanList(resume.skills),
    experience: (resume.experience || [])
      .map((job) => ({
        jobTitle: (job.jobTitle || "").trim(),
        company: (job.company || "").trim(),
        dates: (job.dates || "").trim(),
        bullets: cleanList(job.bullets),
      }))
      .filter(
        (job) => job.jobTitle || job.company || job.dates || job.bullets.length,
      ),
    education: cleanList(resume.education),
    certifications: cleanList(resume.certifications),
  };
}

/** Plain-text version used for copying and for later AI steps. */
export function resumeToPlainText(rawResume) {
  const resume = cleanResume(rawResume);
  if (!resume) return "";

  const sections = [resume.name, resume.title, resume.contact].filter(Boolean);

  if (resume.summary) {
    sections.push(`PROFESSIONAL SUMMARY\n${resume.summary}`);
  }

  if (resume.skills.length) {
    sections.push(`SKILLS\n${resume.skills.join(" • ")}`);
  }

  if (resume.experience.length) {
    const experience = resume.experience
      .map((job) => {
        const heading = [job.jobTitle, job.company, job.dates]
          .filter(Boolean)
          .join(" | ");
        const bullets = job.bullets.map((bullet) => `• ${bullet}`).join("\n");
        return `${heading}\n${bullets}`.trim();
      })
      .join("\n\n");

    sections.push(`PROFESSIONAL EXPERIENCE\n${experience}`);
  }

  if (resume.education.length) {
    sections.push(`EDUCATION\n${resume.education.join("\n")}`);
  }

  if (resume.certifications.length) {
    sections.push(`CERTIFICATIONS\n${resume.certifications.join("\n")}`);
  }

  return sections.join("\n\n");
}

const HEALTHCARE_KEYWORDS = [
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

const TECHNOLOGY_KEYWORDS = [
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

const LEADERSHIP_KEYWORDS = [
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

/** Picks a resume template from keywords in the job and resume. */
export function getRecommendedTemplate({
  jobTitle,
  jobDescription,
  resumeText,
  structuredResume,
}) {
  const text = [
    jobTitle,
    jobDescription,
    resumeText,
    structuredResume ? JSON.stringify(structuredResume) : "",
  ]
    .join(" ")
    .toLowerCase();

  const score = (keywords) =>
    keywords.reduce((total, keyword) => total + (text.includes(keyword) ? 1 : 0), 0);

  const healthcare = score(HEALTHCARE_KEYWORDS);
  const technology = score(TECHNOLOGY_KEYWORDS);
  const leadership = score(LEADERSHIP_KEYWORDS);

  if (healthcare >= technology && healthcare >= leadership && healthcare >= 2) {
    return {
      template: "Healthcare Professional",
      templateId: "healthcare-professional",
      reason:
        "Healthcare Professional was selected based on your clinical background, healthcare terminology, certifications, and target role.",
    };
  }

  if (technology >= healthcare && technology >= leadership && technology >= 2) {
    return {
      template: "Modern",
      templateId: "modern",
      reason:
        "Modern was selected based on your technical skills, tools, and target technology role.",
    };
  }

  if (leadership >= healthcare && leadership >= technology && leadership >= 2) {
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
