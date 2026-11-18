// Word (.docx) downloads for the resume and cover letter.
//
// Word files use a clean single-column layout, which is what applicant
// tracking systems read most reliably, styled with the selected template's
// colors and fonts so they still match the preview. The docx library is
// loaded only when someone clicks a Word download.

import { cleanResume } from "./resume";

// Per-template look: heading/name color, accent (title, company) color and
// font family, taken from the on-screen templates.
const THEMES = {
  modern: { heading: "0F172A", accent: "2563EB", rule: "CBD5E1", font: "Calibri" },
  professional: { heading: "111827", accent: "374151", rule: "111827", font: "Georgia", center: true },
  minimal: { heading: "111827", accent: "475569", rule: "E5E7EB", font: "Calibri" },
  executive: { heading: "12263F", accent: "8A6A2F", rule: "1E3A5F", font: "Georgia" },
  tech: { heading: "111827", accent: "0EA5E9", rule: "0EA5E9", font: "Calibri" },
  "executive-elite": { heading: "12263F", accent: "8A6A2F", rule: "1E3A5F", font: "Georgia", center: true },
  "executive-blue": { heading: "174A76", accent: "1F5F99", rule: "4F83B3", font: "Calibri" },
  "healthcare-professional": { heading: "0F6CBD", accent: "2CB1BC", rule: "2CB1BC", font: "Calibri" },
};

function getTheme(templateId) {
  return THEMES[templateId] || THEMES.modern;
}

function slug(text, fallback) {
  const value = (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return value || fallback;
}

function saveBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// US Letter with 0.75" margins (Word measures in twentieths of a point).
const PAGE = {
  size: { width: 12240, height: 15840 },
  margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
};

// Name, title and contact lines; shared by the resume and cover letter.
function headerParagraphs(d, person, theme) {
  const { Paragraph, TextRun, AlignmentType, BorderStyle } = d;
  const alignment = theme.center ? AlignmentType.CENTER : AlignmentType.LEFT;
  const lines = [];

  lines.push(
    new Paragraph({
      alignment,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: person.name || "Candidate Name",
          bold: true,
          size: 44,
          color: theme.heading,
        }),
      ],
    }),
  );

  if (person.title) {
    lines.push(
      new Paragraph({
        alignment,
        spacing: { after: 60 },
        children: [new TextRun({ text: person.title, bold: true, size: 24, color: theme.accent })],
      }),
    );
  }

  lines.push(
    new Paragraph({
      alignment,
      spacing: { after: 240 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 12, color: theme.rule, space: 6 },
      },
      children: person.contact
        ? [new TextRun({ text: person.contact, size: 19, color: "4B5563" })]
        : [],
    }),
  );

  return lines;
}

// ---------------------------------------------------------------------------
// Resume
// ---------------------------------------------------------------------------

export async function downloadResumeDocx(rawResume, templateId) {
  const resume = cleanResume(rawResume);
  if (!resume) return;

  const d = await import("docx");
  const { Document, Packer, Paragraph, TextRun, BorderStyle, TabStopType } = d;
  const theme = getTheme(templateId);

  const sectionHeading = (text) =>
    new Paragraph({
      spacing: { before: 240, after: 100 },
      keepNext: true,
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: theme.rule, space: 2 },
      },
      children: [
        new TextRun({ text: text.toUpperCase(), bold: true, size: 22, color: theme.heading }),
      ],
    });

  const bullet = (text) =>
    new Paragraph({
      bullet: { level: 0 },
      spacing: { after: 60 },
      children: [new TextRun({ text })],
    });

  const children = [...headerParagraphs(d, resume, theme)];

  if (resume.summary) {
    children.push(
      sectionHeading("Professional Summary"),
      new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: resume.summary })] }),
    );
  }

  if (resume.skills.length) {
    children.push(
      sectionHeading("Skills"),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({ text: resume.skills.join("  •  ") })],
      }),
    );
  }

  if (resume.experience.length) {
    children.push(sectionHeading("Professional Experience"));

    resume.experience.forEach((job) => {
      // Job title on the left, dates on the right.
      children.push(
        new Paragraph({
          keepNext: true,
          spacing: { before: 140, after: 20 },
          tabStops: [{ type: TabStopType.RIGHT, position: 10080 }],
          children: [
            new TextRun({ text: job.jobTitle || job.company, bold: true, size: 22 }),
            ...(job.dates
              ? [new TextRun({ text: `\t${job.dates}`, size: 20, color: "4B5563" })]
              : []),
          ],
        }),
      );

      if (job.jobTitle && job.company) {
        children.push(
          new Paragraph({
            keepNext: true,
            spacing: { after: 60 },
            children: [new TextRun({ text: job.company, italics: true, color: theme.accent })],
          }),
        );
      }

      job.bullets.forEach((text) => children.push(bullet(text)));
    });
  }

  if (resume.education.length) {
    children.push(sectionHeading("Education"));
    resume.education.forEach((text) => children.push(bullet(text)));
  }

  if (resume.certifications.length) {
    children.push(sectionHeading("Certifications"));
    resume.certifications.forEach((text) => children.push(bullet(text)));
  }

  const doc = new Document({
    creator: resume.name || "CareerLaunch AI",
    title: `${resume.name || "Resume"} — Resume`,
    styles: {
      default: {
        document: {
          run: { font: theme.font, size: 21, color: "1F2937" },
          paragraph: { spacing: { line: 264 } },
        },
      },
    },
    sections: [{ properties: { page: PAGE }, children }],
  });

  saveBlob(await Packer.toBlob(doc), `${slug(resume.name, "candidate")}-resume.docx`);
}

// ---------------------------------------------------------------------------
// Cover letter
// ---------------------------------------------------------------------------

export async function downloadCoverLetterDocx({
  structuredResume,
  templateId,
  coverLetter,
  coverLetterDate,
  hiringManager,
  companyName,
}) {
  if (!coverLetter) return;

  const d = await import("docx");
  const { Document, Packer, Paragraph, TextRun } = d;
  const theme = getTheme(templateId);
  const person = cleanResume(structuredResume) || {};

  const children = [...headerParagraphs(d, person, theme)];

  const recipient = [coverLetterDate, hiringManager?.trim(), companyName?.trim()].filter(
    Boolean,
  );
  recipient.forEach((line, index) => {
    children.push(
      new Paragraph({
        spacing: { after: index === recipient.length - 1 ? 320 : 40 },
        children: [new TextRun({ text: line, color: "334155" })],
      }),
    );
  });

  // One Word paragraph per paragraph of the letter, keeping single line
  // breaks (like "Sincerely," and the name) inside it.
  coverLetter
    .replace(/\r\n?/g, "\n")
    .trim()
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .forEach((paragraph) => {
      const lines = paragraph.split("\n");
      children.push(
        new Paragraph({
          spacing: { after: 220 },
          children: lines.map(
            (line, index) => new TextRun({ text: line, break: index > 0 ? 1 : 0 }),
          ),
        }),
      );
    });

  const doc = new Document({
    creator: person.name || "CareerLaunch AI",
    title: "Cover Letter",
    styles: {
      default: {
        document: {
          run: { font: "Georgia", size: 22, color: "172033" },
          paragraph: { spacing: { line: 300 } },
        },
      },
    },
    sections: [{ properties: { page: PAGE }, children }],
  });

  saveBlob(await Packer.toBlob(doc), `${slug(companyName, "company")}-cover-letter.docx`);
}
