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
app.post("/rewrite", upload.single("resume"), async (req, res) => {
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
      return res.json({
        rewrittenResume:
          "No resume text was found. Please upload a PDF, DOCX, TXT file, or paste resume text.",
      });
    }


    const response = await openai.responses.create({
      model: "gpt-5.5",
      input: `
You are an expert resume writer and ATS optimization specialist.

Your job is to rewrite the resume so it better matches the target job description.

The resume has already been analyzed by an AI recruiter.

Use the Resume Insights below to guide your rewrite.

Your goal is to directly address the weaknesses and improvements identified while preserving the candidate's real experience.

Rules:

- Improve wording and readability.
- Use stronger action verbs.
- Improve ATS keyword matching.
- Address the Resume Insights recommendations.
- Fix the biggest weakness whenever possible.
- Apply the Top Improvements throughout the resume.
- Keep all information truthful.
- Never invent skills, experience, companies, or accomplishments.
- Preserve the candidate's overall career history.
- Return only the rewritten resume in plain text.

Resume:
${resumeText}

Job Description:
${jobDescription}

Resume Insights:
${resumeInsights || "No resume insights available."}
`,
    });

    res.json({
      rewrittenResume: response.output_text,
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
- Address the letter to "Dear Hiring Manager," unless another recipient is provided.
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
