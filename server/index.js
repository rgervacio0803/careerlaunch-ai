require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const multer = require("multer");
const mammoth = require("mammoth");
const PDFParser = require("pdf2json");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = 5000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.get("/", (req, res) => {
  res.json({ message: "Backend is working" });
});

function safeDecodeText(text = "") {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

function extractTextFromPdf(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (errData) => {
      reject(errData.parserError);
    });

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      const text = pdfData.Pages.map((page) =>
        page.Texts.map((textItem) =>
          safeDecodeText(textItem.R.map((r) => r.T).join("")),
        ).join(" "),
      ).join("\n");

      resolve(text);
    });

    pdfParser.parseBuffer(buffer);
  });
}

app.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    let { resumeText, jobDescription } = req.body;

    if (req.file) {
      if (req.file.originalname.endsWith(".docx")) {
        const extracted = await mammoth.extractRawText({
          buffer: req.file.buffer,
        });

        resumeText = extracted.value;
      } else if (req.file.originalname.endsWith(".pdf")) {
        resumeText = await extractTextFromPdf(req.file.buffer);
      } else if (req.file.mimetype === "text/plain") {
        resumeText = req.file.buffer.toString("utf8");
      }
    }

    if (
      !resumeText ||
      !resumeText.trim() ||
      !jobDescription ||
      !jobDescription.trim()
    ) {
      return res.status(400).json({
        error: "Please provide both resume text and job description.",
      });
    }

    const response = await openai.responses.create({
      model: "gpt-5.5",
      input: `
You are an ATS resume reviewer and career coach for career switchers into tech.

Analyze the resume against the job description.

Return ONLY valid JSON.

Format:

{
  "jobTitle": "Frontend Developer",
  "atsScore": 75,
  "scoreExplanation": [
    "reason1",
    "reason2",
    "reason3"
  ],
  "resumeStrengths": [
  "strength1",
  "strength2",
  "strength3"
],
  "missingKeywords": ["keyword1", "keyword2"],
  "resumeSuggestions": [
    "suggestion1",
    "suggestion2"
  ],
  "careerAdvice": [
    "advice1",
    "advice2"
  ],
  "interviewQuestions": [
    "question1",
    "question2"
  ]
}

The atsScore must be a realistic number from 0 to 100 based on keyword match, relevant experience, project alignment, and career switch positioning. The scoreExplanation should explain why that score was given.

Identify 3-5 resumeStrengths that show where the resume already matches the job description well.

Extract the most likely job title from the job description and return it as jobTitle. If no clear title exists, return "Target Position".

Resume:
${resumeText}

Job Description:
${jobDescription}
      `,
    });

    const analysis = JSON.parse(response.output_text);

    res.json(analysis);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      result: "Something went wrong with the AI analysis.",
    });
  }
});

async function parseResumeForRewrite(resumeText) {
  const response = await openai.responses.create({
    model: "gpt-5.5",
    text: {
      format: {
        type: "json_object",
      },
    },
    input: `
You are a resume data parser.

Convert the resume into structured JSON.

Return ONLY valid JSON in this exact format:

{
  "name": "",
  "title": "",
  "contact": "",
  "summary": "",
  "skills": [],
  "experience": [
    {
      "jobTitle": "",
      "company": "",
      "dates": "",
      "bullets": []
    }
  ],
  "education": [],
  "certifications": []
}

Rules:
- Preserve only information found in the resume.
- Do not rewrite or improve anything yet.
- Do not invent information.
- Keep every employer, job title, date, skill, education item, and certification truthful.
- If a section is missing, use an empty string or empty array.
- Return JSON only.

Resume:
${resumeText}
    `,
  });

  return JSON.parse(response.output_text);
}

async function rewriteSummary({
  originalSummary,
  resumeData,
  jobDescription,
  rewritePlan,
}) {
  const response = await openai.responses.create({
    model: "gpt-5.5",
    input: `
You are an expert resume writer.

Rewrite ONLY the professional summary for this candidate.

Approved Rewrite Plan:
Highest Priority:
${rewritePlan.highestPriority || "None"}

Planned Improvements:
${
  (rewritePlan.plannedImprovements || [])
    .map((item, index) => `${index + 1}. ${item}`)
    .join("\n") || "None"
}

Candidate Information:
Current Summary or Objective:
${originalSummary || "None"}

Skills:
${(resumeData.skills || []).join(", ") || "None"}

Experience:
${(resumeData.experience || [])
  .map(
    (job) =>
      `${job.jobTitle} at ${job.company}: ${(job.bullets || []).join(" ")}`,
  )
  .join("\n")}

Target Job Description:
${jobDescription}

Rules:
- Write a targeted professional summary, not an objective statement.
- Use only information supported by the candidate's resume.
- Follow the approved Rewrite Plan.
- Emphasize the most relevant experience, leadership, technical expertise, quality, validation, training, or other strengths when supported.
- Do not invent metrics, credentials, skills, or experience.
- Keep it concise: 3 to 5 sentences.
- Return only the summary text. Do not include a heading.
    `,
  });

  return response.output_text.trim();
}

async function rewriteExperience({ experience, jobDescription, rewritePlan }) {
  const response = await openai.responses.create({
    model: "gpt-5.5",
    text: {
      format: {
        type: "json_object",
      },
    },
    input: `
You are an expert resume writer.

Rewrite ONLY the professional experience section.

Return ONLY valid JSON in this exact format:

{
  "experience": [
    {
      "jobTitle": "",
      "company": "",
      "dates": "",
      "bullets": []
    }
  ]
}

Approved Rewrite Plan:

Highest Priority:
${rewritePlan.highestPriority || "None"}

Planned Improvements:
${
  (rewritePlan.plannedImprovements || [])
    .map((item, index) => `${index + 1}. ${item}`)
    .join("\n") || "None"
}

Candidate Experience (most recent first):

${(experience || [])
  .map((job, index) => {
    return `
Position ${index + 1}
Job Title: ${job.jobTitle}
Company: ${job.company}
Dates: ${job.dates}

Current Bullets:
${(job.bullets || []).map((b) => `- ${b}`).join("\n")}
`;
  })
  .join("\n-----------------------------\n")}

Target Job Description:
${jobDescription}

Rules:

GENERAL
- Preserve every employer, job title, and employment date exactly.
- Never invent accomplishments, metrics, certifications, tools, or responsibilities.
- Follow the Rewrite Plan wherever supported.

BULLETS
- Each bullet should contain one accomplishment or responsibility.
- Keep each bullet between 12 and 24 words whenever possible.
- Start every bullet with a strong action verb.
- Remove filler words.
- Remove repetitive wording.
- Focus on measurable responsibilities and impact whenever supported.

PRIORITIZATION
- Give the most attention to the three most recent jobs.
- Keep the most recent job between 5 and 7 bullets.
- Keep the second most recent job between 4 and 6 bullets.
- Keep the third most recent job between 3 and 5 bullets.
- Older jobs should generally have 2 to 3 bullets unless a unique accomplishment should be preserved.
- Reduce repetitive technical details from older positions.
- Eliminate duplicate responsibilities that appear across multiple jobs.
- Preserve unique accomplishments.

RELEVANCE
- Tailor emphasis to the target job without changing the candidate's actual history.
- Move the most job-relevant responsibilities to the top of each role.
- Preserve specific tools, systems, regulations, and methods when they strengthen the match.
- Do not force unsupported job-description keywords into the resume.
- Prefer concrete responsibilities over generic statements such as "performed duties" or "assisted as needed."

ATS
- Naturally incorporate supported ATS keywords from the Job Description.
- Improve readability for recruiters.
- Keep the resume ATS-friendly.

RETURN
Return JSON only.
    `,
  });

  const parsed = JSON.parse(response.output_text);

  return parsed.experience || [];
}

async function rewriteSkills({
  skills,
  experience,
  jobDescription,
  rewritePlan,
}) {
  const response = await openai.responses.create({
    model: "gpt-5.5",
    text: {
      format: {
        type: "json_object",
      },
    },
    input: `
You are an expert resume writer and ATS specialist.

Rewrite ONLY the skills section.

Return ONLY valid JSON in this exact format:

{
  "skills": []
}

Approved Rewrite Plan:

Highest Priority:
${rewritePlan.highestPriority || "None"}

Planned Improvements:
${
  (rewritePlan.plannedImprovements || [])
    .map((item, index) => `${index + 1}. ${item}`)
    .join("\n") || "None"
}

Original Skills:
${JSON.stringify(skills || [], null, 2)}

Candidate Experience:
${JSON.stringify(experience || [], null, 2)}

Target Job Description:
${jobDescription}

Rules:
- Use only skills supported by the original resume or candidate experience.
- Do not invent tools, certifications, systems, methods, or qualifications.
- Prioritize skills relevant to the target job.
- Include supported ATS keywords from the job description.
- Remove duplicates and vague filler.
- Keep skill names concise.
- Return 8 to 18 strong skills when enough supported skills exist.
- Return JSON only.
    `,
  });

  const parsed = JSON.parse(response.output_text);

  return parsed.skills || [];
}

function assembleStructuredResume({
  originalResume,
  rewrittenSummary,
  rewrittenExperience,
  rewrittenSkills,
}) {
  return {
    name: originalResume.name || "",
    title: originalResume.title || "",
    contact: originalResume.contact || "",
    summary: rewrittenSummary || "",
    skills: rewrittenSkills || [],
    experience: rewrittenExperience || [],
    education: originalResume.education || [],
    certifications: originalResume.certifications || [],
  };
}

function structuredResumeToPlainText(resume) {
  const sections = [];

  if (resume.name) {
    sections.push(resume.name);
  }

  if (resume.title) {
    sections.push(resume.title);
  }

  if (resume.contact) {
    sections.push(resume.contact);
  }

  if (resume.summary) {
    sections.push(`PROFESSIONAL SUMMARY\n${resume.summary}`);
  }

  if (resume.skills?.length) {
    sections.push(`SKILLS\n${resume.skills.join(" • ")}`);
  }

  if (resume.experience?.length) {
    const experienceText = resume.experience
      .map((job) => {
        const heading = [job.jobTitle, job.company, job.dates]
          .filter(Boolean)
          .join(" | ");

        const bullets = (job.bullets || [])
          .map((bullet) => `• ${bullet}`)
          .join("\n");

        return `${heading}\n${bullets}`.trim();
      })
      .join("\n\n");

    sections.push(`PROFESSIONAL EXPERIENCE\n${experienceText}`);
  }

  if (resume.education?.length) {
    sections.push(`EDUCATION\n${resume.education.join("\n")}`);
  }

  if (resume.certifications?.length) {
    sections.push(`CERTIFICATIONS\n${resume.certifications.join("\n")}`);
  }

  return sections.filter(Boolean).join("\n\n");
}

app.post("/rewrite", upload.single("resume"), async (req, res) => {
  try {
    let { resumeText, jobDescription, rewritePlan } = req.body;

    let plan = {};

    try {
      plan = JSON.parse(rewritePlan || "{}");
    } catch {
      plan = {};
    }

    if (req.file) {
      if (req.file.originalname.endsWith(".docx")) {
        const extracted = await mammoth.extractRawText({
          buffer: req.file.buffer,
        });

        resumeText = extracted.value;
      } else if (req.file.originalname.endsWith(".pdf")) {
        resumeText = await extractTextFromPdf(req.file.buffer);
      } else if (req.file.mimetype === "text/plain") {
        resumeText = req.file.buffer.toString("utf8");
      }
    }

    if (!resumeText || !resumeText.trim()) {
      return res.json({
        rewrittenResume:
          "No resume text was found. Please upload a PDF, DOCX, TXT file, or paste resume text.",
      });
    }

    const originalResume = await parseResumeForRewrite(resumeText);

    const rewrittenSummary = await rewriteSummary({
      originalSummary: originalResume.summary,
      resumeData: originalResume,
      jobDescription,
      rewritePlan: plan,
    });

    const rewrittenExperience = await rewriteExperience({
      experience: originalResume.experience,
      jobDescription,
      rewritePlan: plan,
    });

    const rewrittenSkills = await rewriteSkills({
      skills: originalResume.skills,
      experience: originalResume.experience,
      jobDescription,
      rewritePlan: plan,
    });

    const structuredResume = assembleStructuredResume({
      originalResume,
      rewrittenSummary,
      rewrittenExperience,
      rewrittenSkills,
    });

    const rewrittenResume = structuredResumeToPlainText(structuredResume);

    res.json({
      rewrittenResume,
      structuredResume,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      rewrittenResume: "Unable to rewrite resume.",
    });
  }
});

app.post("/structure-resume", upload.single("resume"), async (req, res) => {
  try {
    let { resumeText } = req.body;

    if (req.file) {
      if (req.file.originalname.endsWith(".docx")) {
        const extracted = await mammoth.extractRawText({
          buffer: req.file.buffer,
        });

        resumeText = extracted.value;
      } else if (req.file.originalname.endsWith(".pdf")) {
        resumeText = await extractTextFromPdf(req.file.buffer);
      } else if (req.file.mimetype === "text/plain") {
        resumeText = req.file.buffer.toString("utf8");
      }
    }

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({
        error: "Please provide resume text or upload a resume file.",
      });
    }

    const response = await openai.responses.create({
      model: "gpt-5.5",
      input: `
You are a resume data parser.

Convert this resume into structured JSON.

Return ONLY valid JSON in this exact structure:

{
  "name": "",
  "title": "",
  "contact": "",
  "summary": "",
  "skills": [],
  "experience": [
    {
      "jobTitle": "",
      "company": "",
      "dates": "",
      "bullets": []
    }
  ],
  "education": [],
  "certifications": []
}

Rules:
- Use ONLY information from the resume.
- Do not invent employers, titles, certifications, education, dates, skills, or achievements.
- If a detail is missing, use an empty string or empty array.
- Return JSON only. No markdown. No explanation.

Resume:
${resumeText}
      `,
    });

    const structuredResume = JSON.parse(response.output_text);

    res.json({
      structuredResume,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to structure resume.",
    });
  }
});

app.post("/resume-insights", upload.single("resume"), async (req, res) => {
  try {
    let { resumeText, jobDescription } = req.body;

    if (req.file) {
      if (req.file.originalname.endsWith(".docx")) {
        const extracted = await mammoth.extractRawText({
          buffer: req.file.buffer,
        });

        resumeText = extracted.value;
      } else if (req.file.originalname.endsWith(".pdf")) {
        resumeText = await extractTextFromPdf(req.file.buffer);
      } else if (req.file.mimetype === "text/plain") {
        resumeText = req.file.buffer.toString("utf8");
      }
    }

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({
        error: "Resume text is required.",
      });
    }

    const response = await openai.responses.create({
      model: "gpt-5.5",
      text: {
        format: {
          type: "json_object",
        },
      },
      input: `
You are an expert recruiter and career coach.

Analyze the resume against the job description.

Return ONLY valid JSON in this exact format:

{
  "overallImpression": "",
  "biggestStrength": {
    "title": "",
    "impact": 5,
    "description": ""
  },
  "biggestWeakness": {
    "title": "",
    "impact": 5,
    "description": ""
  },
  "recruiterFirstImpression": "",
  "topImprovements": [
    {
      "title": "",
      "impact": 5,
      "description": ""
    },
    {
      "title": "",
      "impact": 4,
      "description": ""
    },
    {
      "title": "",
      "impact": 3,
      "description": ""
    }
  ]
}

Rules:

- Be encouraging but honest.
- Base every observation only on the resume and job description provided.
- Do not invent experience or qualifications.
- Keep each description under 35 words.
- Impact must be a number from 1 to 5.
- Use impact 5 for the most important improvement or strongest issue.
- Return JSON only.

Resume:
${resumeText}

Job Description:
${jobDescription}
      `,
    });

    res.json(JSON.parse(response.output_text));
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to generate resume insights.",
    });
  }
});

app.post("/rewrite-plan", upload.single("resume"), async (req, res) => {
  try {
    let { resumeText, jobDescription, resumeInsights } = req.body;

    if (req.file) {
      if (req.file.originalname.endsWith(".docx")) {
        const extracted = await mammoth.extractRawText({
          buffer: req.file.buffer,
        });

        resumeText = extracted.value;
      } else if (req.file.originalname.endsWith(".pdf")) {
        resumeText = await extractTextFromPdf(req.file.buffer);
      } else if (req.file.mimetype === "text/plain") {
        resumeText = req.file.buffer.toString("utf8");
      }
    }

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({
        error: "Resume text is required.",
      });
    }

    let insights = {};

    try {
      insights = JSON.parse(resumeInsights || "{}");
    } catch {
      insights = {};
    }

    const response = await openai.responses.create({
      model: "gpt-5.5",
      text: {
        format: {
          type: "json_object",
        },
      },
      input: `
You are an expert resume strategist.

Create a concrete rewrite plan based on the resume, job description, and recruiter insights.

Return ONLY valid JSON in this exact format:

{
  "highestPriority": "",
  "plannedImprovements": [
    "",
    "",
    ""
  ],
  "aiActions": [
    "",
    "",
    "",
    ""
  ]
}

Rules:
- Make every item specific and actionable.
- Use only information supported by the resume.
- Never recommend inventing skills, experience, credentials, dates, employers, or achievements.
- The highestPriority must describe the most important issue to fix.
- plannedImprovements must describe the actual edits the rewrite should make.
- aiActions must describe what the rewrite engine will do.
- If the job asks for unsupported experience, do not claim it exists.
- Keep every item under 35 words.
- Return JSON only.

Resume:
${resumeText}

Job Description:
${jobDescription}

Overall Impression:
${insights.overallImpression || "None"}

Biggest Weakness:
${
  typeof insights.biggestWeakness === "string"
    ? insights.biggestWeakness
    : insights.biggestWeakness?.description || "None"
}

Top Improvements:
${(insights.topImprovements || [])
  .map((item, index) => {
    const text =
      typeof item === "string" ? item : item.description || item.title || "";

    return `${index + 1}. ${text}`;
  })
  .join("\n")}
      `,
    });

    const rewritePlan = JSON.parse(response.output_text);

    res.json({ rewritePlan });
  } catch (error) {
    console.error("Rewrite plan error:", error);

    res.status(500).json({
      error: "Unable to generate rewrite plan.",
    });
  }
});

app.post("/interview", upload.single("resume"), async (req, res) => {
  try {
    let { resumeText, jobDescription } = req.body;

    if (req.file) {
      if (req.file.originalname.endsWith(".docx")) {
        const extracted = await mammoth.extractRawText({
          buffer: req.file.buffer,
        });

        resumeText = extracted.value;
      } else if (req.file.originalname.endsWith(".pdf")) {
        resumeText = await extractTextFromPdf(req.file.buffer);
      } else if (req.file.mimetype === "text/plain") {
        resumeText = req.file.buffer.toString("utf8");
      }
    }

    if (!resumeText || !resumeText.trim()) {
      return res.json({
        interviewQuestions:
          "No resume text was found. Please upload a PDF, DOCX, TXT file, or paste resume text.",
      });
    }

    const response = await openai.responses.create({
      model: "gpt-5.5",
      input: `
You are a technical interviewer and career coach.

Create interview prep questions for this candidate based on their resume and the job description.

Return ONLY valid JSON.

Format:

{
  "technicalQuestions": [
    {
      "question": "Question text",
      "answer": "Suggested answer"
    }
  ],
  "behavioralQuestions": [
    {
      "question": "Question text",
      "answer": "Suggested answer"
    }
  ],
  "careerSwitchQuestions": [
    {
      "question": "Question text",
      "answer": "Suggested answer"
    }
  ],
  "employerQuestions": [
    "Question 1",
    "Question 2"
  ]
}

Rules:
- Keep questions realistic for the target job
- Include career-switch focused questions
- Do not invent experience
- Make the questions beginner-friendly but professional

For each Technical, Behavioral, and Career Switch question:

1. Provide the question.
2. Provide a strong suggested answer based on the candidate's resume.
3. Keep answers realistic and truthful.
4. Do not invent experience.

Suggested answers should be 3-6 sentences and sound professional, confident, and interview-ready.

Format exactly like:

Technical Questions

Question:
...

Suggested Answer:
...

Behavioral Questions

Question:
...

Suggested Answer:
...

Career Switch Questions

Question:
...

Suggested Answer:
...

Questions to Ask the Employer

1. ...
2. ...
3. ...

Resume:
${resumeText}

Job Description:
${jobDescription}
      `,
    });

    const interviewData = JSON.parse(response.output_text);

    res.json(interviewData);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      interviewQuestions: "Unable to generate interview questions.",
    });
  }
});

app.post("/parse-resume", upload.single("resume"), async (req, res) => {
  try {
    let { resumeText } = req.body;

    if (req.file) {
      if (req.file.originalname.endsWith(".docx")) {
        const extracted = await mammoth.extractRawText({
          buffer: req.file.buffer,
        });

        resumeText = extracted.value;
      } else if (req.file.originalname.endsWith(".pdf")) {
        resumeText = await extractTextFromPdf(req.file.buffer);
      } else if (req.file.mimetype === "text/plain") {
        resumeText = req.file.buffer.toString("utf8");
      }
    }

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({
        error: "Please upload a resume or paste resume text.",
      });
    }

    const response = await openai.responses.create({
      model: "gpt-5.5",
      input: `
You are a resume parser and career analyst.

Analyze this resume and extract the candidate's profile.

Return ONLY valid JSON.

Format:

{
  "candidateTitle": "Most likely professional title",
  "skills": ["skill1", "skill2"],
  "experienceSummary": [
    "summary point 1",
    "summary point 2"
  ],
  "resumeKeywords": ["keyword1", "keyword2"]
}

Rules:
- Keep it truthful
- Do not invent experience
- Extract only what is supported by the resume
- Limit skills to 10-15 strong skills
- Limit resumeKeywords to 10-20 important keywords

Resume:
${resumeText}
      `,
    });

    const parsedResume = JSON.parse(response.output_text);

    res.json(parsedResume);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to parse resume.",
    });
  }
});

app.post("/cover-letter", upload.single("resume"), async (req, res) => {
  try {
    let { resumeText, jobDescription } = req.body;

    if (req.file) {
      if (req.file.originalname.endsWith(".docx")) {
        const extracted = await mammoth.extractRawText({
          buffer: req.file.buffer,
        });

        resumeText = extracted.value;
      } else if (req.file.originalname.endsWith(".pdf")) {
        resumeText = await extractTextFromPdf(req.file.buffer);
      } else if (req.file.mimetype === "text/plain") {
        resumeText = req.file.buffer.toString("utf8");
      }
    }

    if (
      !resumeText ||
      !resumeText.trim() ||
      !jobDescription ||
      !jobDescription.trim()
    ) {
      return res.status(400).json({
        error: "Please provide both resume and job description.",
      });
    }

    const response = await openai.responses.create({
      model: "gpt-5.5",
      input: `
You are a professional cover letter writer.

Write a personalized cover letter based on the resume and job description.

Rules:
- Return plain text only.
- Use ONLY information that appears in the uploaded resume.
- If a detail is not explicitly stated in the resume, do not include it.
- Never invent employers, job titles, certifications, accomplishments, projects, technologies, education, years of experience, awards, or achievements.
- Tailor the writing to the job description using keywords only when they accurately reflect the candidate's existing skills and experience.
- Keep the cover letter professional, concise, and approximately one page.
- Use 3–5 well-structured paragraphs.
- The job details may include a line beginning with "Hiring Manager:".
- If the Hiring Manager value is present and is not "Not provided", begin the letter with:
  Dear <Hiring Manager>,
- If no hiring manager is provided, begin the letter with:
  Dear Hiring Manager,
- Do not invent a title such as Mr., Ms., Dr., or Mrs.
- Write in a confident but truthful tone.
- Do not exaggerate or fabricate qualifications.
- End the letter with a proper closing.

The cover letter MUST end exactly like this:

Sincerely,

<Candidate Name>

Use the candidate's actual name from the uploaded resume. If the name cannot be determined, use "Candidate".

The cover letter should sound personalized and natural, not generic. Connect the candidate's actual experience to the job requirements without repeating the resume word-for-word.

Resume:
${resumeText}

Job Description:
${jobDescription}
`,
    });

    res.json({
      coverLetter: response.output_text,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Unable to generate cover letter.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
