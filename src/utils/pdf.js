// Text-based PDF exports. Everything here writes real text with jsPDF (no
// screenshots), so the files are searchable and readable by ATS software.
// jsPDF is loaded on demand to keep it out of the main bundle.

import { cleanResume } from "./resume";

async function createDoc() {
  const { jsPDF } = await import("jspdf");
  return new jsPDF({ orientation: "p", unit: "mm", format: "letter" });
}

function hex(color) {
  const value = color.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16));
}

function slug(text, fallback) {
  const value = (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return value || fallback;
}

/**
 * Small layout helper: tracks the cursor, wraps text and adds pages.
 */
function createWriter(doc, { margin = 18, top = 18, bottom = 18 } = {}) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const writer = {
    doc,
    margin,
    pageWidth,
    pageHeight,
    width: pageWidth - margin * 2,
    y: top,

    ensure(height) {
      if (writer.y + height > pageHeight - bottom) {
        doc.addPage();
        writer.y = top;
        return true;
      }
      return false;
    },

    font(style = "normal", size = 10, color = "#1f2937") {
      doc.setFont("helvetica", style);
      doc.setFontSize(size);
      doc.setTextColor(...hex(color));
    },

    lineHeight(size) {
      return size * 0.45;
    },

    split(text, width = writer.width) {
      return doc.splitTextToSize(String(text ?? ""), width);
    },

    // Writes wrapped text at x, moving to a new page between lines if needed.
    paragraph(text, { x = margin, width, size = 10, after = 0 } = {}) {
      const lines = writer.split(text, width ?? pageWidth - margin - x);
      const lh = writer.lineHeight(size);

      lines.forEach((line) => {
        writer.ensure(lh);
        doc.text(line, x, writer.y + lh * 0.8);
        writer.y += lh;
      });

      writer.y += after;
      return lines.length;
    },
  };

  return writer;
}

// ---------------------------------------------------------------------------
// Resume
// ---------------------------------------------------------------------------

const RESUME_THEMES = {
  modern: { heading: "#111827", rule: "#d1d5db", accent: "#2563eb" },
  professional: {
    heading: "#111827",
    rule: "#9ca3af",
    accent: "#374151",
    center: true,
  },
  minimal: { heading: "#111827", rule: "#e5e7eb", accent: "#64748b" },
  executive: { heading: "#1e3a5f", rule: "#cbd5e1", accent: "#1e3a5f" },
  tech: { heading: "#0f766e", rule: "#99f6e4", accent: "#0f766e" },
  "executive-elite": {
    heading: "#1e3a5f",
    rule: "#cbd5e1",
    accent: "#b08d57",
    center: true,
  },
  "executive-blue": {
    heading: "#174a76",
    rule: "#4f83b3",
    accent: "#174a76",
    band: "#174a76",
  },
  "healthcare-professional": {
    heading: "#0f6cbd",
    rule: "#2cb1bc",
    accent: "#0f6cbd",
  },
};

function getTheme(templateId) {
  return RESUME_THEMES[templateId] || RESUME_THEMES.modern;
}

// Name, title and contact line. Shared by the resume and the cover letter.
function writeHeader(writer, person, theme) {
  const { doc, margin, pageWidth } = writer;
  const name = person.name || "Candidate Name";
  const x = theme.center ? pageWidth / 2 : margin;
  const align = theme.center ? "center" : "left";

  if (theme.band) {
    const lines =
      1 + (person.title ? 1 : 0) + (person.contact ? writer.split(person.contact).length : 0);
    const bandHeight = 14 + lines * 5.5;

    doc.setFillColor(...hex(theme.band));
    doc.rect(0, 0, pageWidth, bandHeight, "F");
    writer.y = 14;

    writer.font("bold", 20, "#ffffff");
    doc.text(name, x, writer.y, { align });
    writer.y += 7;

    if (person.title) {
      writer.font("normal", 11.5, "#dbeafe");
      doc.text(person.title, x, writer.y, { align });
      writer.y += 6;
    }

    if (person.contact) {
      writer.font("normal", 9.5, "#e5edf5");
      writer.split(person.contact).forEach((line) => {
        doc.text(line, x, writer.y, { align });
        writer.y += 4.5;
      });
    }

    writer.y = bandHeight + 8;
    return;
  }

  writer.font("bold", 20, "#111827");
  doc.text(name, x, writer.y + 6, { align });
  writer.y += 9;

  if (person.title) {
    writer.font("normal", 11.5, theme.accent);
    doc.text(person.title, x, writer.y + 4, { align });
    writer.y += 6;
  }

  if (person.contact) {
    writer.font("normal", 9.5, "#4b5563");
    writer.split(person.contact).forEach((line) => {
      doc.text(line, x, writer.y + 4, { align });
      writer.y += 4.5;
    });
  }

  writer.y += 3;
  doc.setDrawColor(...hex(theme.rule));
  doc.setLineWidth(0.5);
  doc.line(writer.margin, writer.y, pageWidth - writer.margin, writer.y);
  writer.y += 6;
}

function writeSectionHeading(writer, title, theme, minFollowing = 12) {
  const { doc, margin, pageWidth } = writer;

  writer.ensure(10 + minFollowing);
  writer.font("bold", 11, theme.heading);
  doc.text(title.toUpperCase(), margin, writer.y + 4);
  writer.y += 6;

  doc.setDrawColor(...hex(theme.rule));
  doc.setLineWidth(0.3);
  doc.line(margin, writer.y, pageWidth - margin, writer.y);
  writer.y += 3;
}

function writeBullets(writer, items, { size = 10, indent = 5 } = {}) {
  const { doc, margin } = writer;
  const lh = writer.lineHeight(size);

  items.forEach((item) => {
    writer.font("normal", size, "#1f2937");
    const lines = writer.split(item, writer.width - indent);
    // Keep short bullets on one page; long ones may split.
    writer.ensure(lines.length <= 4 ? lines.length * lh : lh);
    doc.text("•", margin + 1, writer.y + lh * 0.8);

    lines.forEach((line, index) => {
      if (index > 0) writer.ensure(lh);
      doc.text(line, margin + indent, writer.y + lh * 0.8);
      writer.y += lh;
    });

    writer.y += 0.8;
  });
}

export async function downloadResumePdf(rawResume, templateId) {
  const resume = cleanResume(rawResume);
  if (!resume) return;

  const doc = await createDoc();
  const writer = createWriter(doc);
  const theme = getTheme(templateId);
  const { margin, pageWidth } = writer;

  writeHeader(writer, resume, theme);

  if (resume.summary) {
    writeSectionHeading(writer, "Professional Summary", theme);
    writer.font("normal", 10, "#1f2937");
    writer.paragraph(resume.summary, { after: 4 });
  }

  if (resume.skills.length) {
    writeSectionHeading(writer, "Skills", theme);
    writer.font("normal", 10, "#1f2937");
    writer.paragraph(resume.skills.join("  •  "), { after: 4 });
  }

  if (resume.experience.length) {
    writeSectionHeading(writer, "Professional Experience", theme, 20);

    resume.experience.forEach((job) => {
      // Keep the job heading together with its first bullet.
      const firstBulletLines = job.bullets[0]
        ? writer.split(job.bullets[0], writer.width - 5).length
        : 0;
      writer.ensure(12 + firstBulletLines * writer.lineHeight(10));

      writer.font("normal", 9.5, "#4b5563");
      const datesWidth = job.dates ? doc.getTextWidth(job.dates) + 4 : 0;
      const headingTop = writer.y;

      if (job.dates) {
        doc.text(job.dates, pageWidth - margin, headingTop + writer.lineHeight(10.5) * 0.8, {
          align: "right",
        });
      }

      writer.font("bold", 10.5, "#111827");
      writer.paragraph(job.jobTitle || job.company, {
        width: writer.width - datesWidth - 2,
        size: 10.5,
      });

      if (job.jobTitle && job.company) {
        writer.font("italic", 10, theme.accent);
        writer.paragraph(job.company, { size: 10 });
      }

      writer.y += 1.2;
      writeBullets(writer, job.bullets);
      writer.y += 2.5;
    });

    writer.y += 1.5;
  }

  if (resume.education.length) {
    writeSectionHeading(writer, "Education", theme);
    writeBullets(writer, resume.education);
    writer.y += 3;
  }

  if (resume.certifications.length) {
    writeSectionHeading(writer, "Certifications", theme);
    writeBullets(writer, resume.certifications);
  }

  doc.setProperties({ title: `${resume.name || "Resume"} — Resume` });
  doc.save(`${slug(resume.name, "candidate")}-resume.pdf`);
}

// ---------------------------------------------------------------------------
// Cover letter
//
// Mirrors the on-screen preview (.cover-letter-paper in optimize.css and
// CoverLetterHeader.jsx). Sizes below are the CSS pixel values from those
// files, converted to PDF units, so the download matches what users see.
// Georgia isn't built into PDFs, so the closest standard serif (Times) is used.
// ---------------------------------------------------------------------------

const PX = 25.4 / 96; // millimetres per CSS pixel (a letter page is 816px wide)

const PAGE = { top: 72, side: 76, bottom: 72 };

const BODY_FONT = { family: "times", size: 15 };

const COVER_HEADERS = {
  modern: {
    layout: "center",
    name: { family: "helvetica", size: 30, color: "#0f172a", spacing: 2 },
    title: { family: "helvetica", style: "bold", size: 14, color: "#0f172a", gap: 6 },
    contact: { family: "helvetica", size: 11, color: "#64748b", lineHeight: 1.5, gap: 12 },
    paddingBottom: 18,
    rule: { color: "#0f172a", width: 1 },
    marginBottom: 34,
  },
  professional: {
    layout: "center",
    name: { family: "times", style: "bold", size: 32, color: "#111827", spacing: 2.56, uppercase: true },
    title: { family: "times", style: "bold", size: 16, color: "#374151", gap: 8 },
    contact: { family: "times", size: 13, color: "#374151", lineHeight: 1.6, gap: 8 },
    paddingBottom: 18,
    rule: { color: "#111827", width: 3, double: true },
    marginBottom: 34,
  },
  executive: {
    layout: "split",
    gap: 30,
    contactMax: 250,
    name: { family: "times", style: "bold", size: 34, color: "#12263f", lineHeight: 1.1 },
    title: { family: "times", style: "bold", size: 16, color: "#8a6a2f", spacing: 1.28, uppercase: true, gap: 8 },
    contact: { family: "times", size: 12, color: "#52606d", lineHeight: 1.6 },
    paddingBottom: 22,
    rule: { color: "#1e3a5f", width: 3 },
    marginBottom: 34,
  },
  "executive-elite": {
    layout: "split",
    gap: 28,
    contactMax: 230,
    name: { family: "times", style: "bold", size: 30, color: "#12263f", lineHeight: 1.15, spacing: 0.6 },
    title: { family: "helvetica", style: "bold", size: 17, color: "#8a6a2f", spacing: 1.36, uppercase: true, gap: 9 },
    contact: { family: "times", size: 12, color: "#52606d", lineHeight: 1.6 },
    paddingBottom: 24,
    rule: { color: "#1e3a5f", width: 3 },
    marginBottom: 34,
  },
  "executive-blue": {
    layout: "band",
    padding: { top: 42, side: 48, bottom: 34 },
    band: ["#0f3d66", "#1f5f99"],
    name: { family: "helvetica", style: "bold", size: 34, color: "#ffffff", lineHeight: 1.15 },
    title: { family: "helvetica", style: "bold", size: 16, color: "#dbeafe", spacing: 1.28, uppercase: true, gap: 10 },
    contact: { family: "helvetica", size: 13, color: "#eff6ff", lineHeight: 1.6, gap: 16 },
    marginBottom: 34,
  },
  minimal: {
    layout: "left",
    name: { family: "helvetica", style: "bold", size: 34, color: "#111827", spacing: -1.36 },
    title: { family: "helvetica", style: "bold", size: 16, color: "#374151", gap: 8 },
    contact: { family: "helvetica", size: 14, color: "#64748b", gap: 8 },
    marginBottom: 34,
  },
  tech: {
    layout: "split",
    gap: 28,
    contactMax: 250,
    defaultTitle: "Technology Professional",
    name: { family: "helvetica", style: "bold", size: 32, color: "#111827", spacing: -1.28 },
    title: { family: "helvetica", style: "bold", size: 15, color: "#0ea5e9", gap: 8 },
    contact: { family: "helvetica", size: 13, color: "#64748b", lineHeight: 1.6 },
    paddingBottom: 18,
    rule: { color: "#0ea5e9", width: 2 },
    marginBottom: 32,
  },
  "healthcare-professional": {
    layout: "split",
    gap: 28,
    contactMax: 245,
    box: {
      padding: { y: 20, x: 22 },
      fill: "#eef8fc",
      left: { color: "#0f6cbd", width: 6 },
      bottom: { color: "#2cb1bc", width: 2 },
    },
    name: { family: "helvetica", style: "bold", size: 32, color: "#0f6cbd" },
    title: { family: "helvetica", style: "bold", size: 16, color: "#2cb1bc", gap: 8 },
    contact: { family: "helvetica", size: 12, color: "#64748b", lineHeight: 1.6, gap: 2 },
    marginBottom: 34,
  },
};

function applyFont(doc, spec) {
  doc.setFont(spec.family, spec.style || "normal");
  doc.setFontSize(spec.size * 0.75);
  doc.setTextColor(...hex(spec.color || "#172033"));
  doc.setCharSpace((spec.spacing || 0) * PX);
}

/**
 * Lays out one run of text (all sizes in CSS px) and returns its wrapped
 * lines, measured size in mm, and a draw() function.
 */
function textBlock(doc, rawText, spec, maxWidthPx) {
  const text = spec.uppercase ? rawText.toUpperCase() : rawText;
  const maxWidth = maxWidthPx * PX;
  const charSpace = (spec.spacing || 0) * PX;
  const lineHeight = spec.size * (spec.lineHeight || 1.2) * PX;
  const em = spec.size * PX;

  applyFont(doc, spec);

  const measure = (str) =>
    doc.getTextWidth(str) + charSpace * Math.max(str.length - 1, 0);

  const lines = [];
  let current = "";

  text.split(/\s+/).filter(Boolean).forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (current && measure(candidate) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  });

  if (current) lines.push(current);

  doc.setCharSpace(0);

  return {
    lines,
    width: lines.length ? Math.max(...lines.map(measure)) : 0,
    height: lines.length * lineHeight,
    draw(x, top, { align = "left", boxWidth = maxWidth } = {}) {
      applyFont(doc, spec);
      lines.forEach((line, index) => {
        const width = measure(line);
        const lineX =
          align === "center"
            ? x + (boxWidth - width) / 2
            : align === "right"
              ? x + boxWidth - width
              : x;
        const baseline = top + index * lineHeight + (lineHeight - em) / 2 + em * 0.78;
        doc.text(line, lineX, baseline);
      });
      doc.setCharSpace(0);
    },
  };
}

// A column of name, title and contact, stacked with their CSS margins.
function stackBlocks(blocks) {
  let height = 0;
  const placed = blocks.filter(Boolean).map((block, index) => {
    const offset = height + (index > 0 ? (block.gap || 0) * PX : 0);
    height = offset + block.height;
    return { block, offset };
  });
  return { placed, height };
}

function drawRule(doc, x, y, width, rule) {
  doc.setFillColor(...hex(rule.color));

  if (rule.double) {
    const line = (rule.width / 3) * PX;
    doc.rect(x, y, width, line, "F");
    doc.rect(x, y + line * 2, width, line, "F");
  } else {
    doc.rect(x, y, width, rule.width * PX, "F");
  }

  return rule.width * PX;
}

// Draws the template's header and returns the y (mm) where the letter starts.
function drawCoverLetterHeader(doc, person, templateId) {
  const theme = COVER_HEADERS[templateId] || COVER_HEADERS.modern;
  const pageWidthPx = 816;
  const contentLeft = PAGE.side * PX;
  const contentWidthPx = pageWidthPx - PAGE.side * 2;

  const name = person.name || "Candidate Name";
  const title = person.title || theme.defaultTitle || "";
  const contact = person.contact || "";

  const block = (text, spec, widthPx) =>
    text ? Object.assign(textBlock(doc, text, spec, widthPx), { gap: spec.gap }) : null;

  // Executive Blue: full-width colored band across the top of the page.
  if (theme.layout === "band") {
    const pad = theme.padding;
    const innerPx = pageWidthPx - pad.side * 2;
    const stack = stackBlocks([
      block(name, theme.name, innerPx),
      block(title, theme.title, innerPx),
      block(contact, theme.contact, innerPx),
    ]);
    const bandHeight = (pad.top + pad.bottom) * PX + stack.height;
    const pageWidth = pageWidthPx * PX;

    // 135deg gradient, approximated with thin vertical strips.
    const [from, to] = theme.band.map(hex);
    const strips = 120;
    for (let i = 0; i < strips; i += 1) {
      const t = i / (strips - 1);
      doc.setFillColor(...from.map((c, k) => Math.round(c + (to[k] - c) * t)));
      doc.rect((pageWidth / strips) * i, 0, pageWidth / strips + 0.2, bandHeight, "F");
    }

    stack.placed.forEach(({ block: b, offset }) =>
      b.draw(pad.side * PX, pad.top * PX + offset),
    );

    return bandHeight + theme.marginBottom * PX;
  }

  const top = PAGE.top * PX;
  const box = theme.box;
  const insetLeftPx = box ? box.left.width + box.padding.x : 0;
  const insetRightPx = box ? box.padding.x : 0;
  const innerLeft = contentLeft + insetLeftPx * PX;
  const innerWidthPx = contentWidthPx - insetLeftPx - insetRightPx;
  const contentTop = top + (box ? box.padding.y * PX : 0);

  // 1. Measure.
  const drawCalls = [];
  let height;

  if (theme.layout === "split") {
    const contactBlock = block(contact, theme.contact, theme.contactMax);
    const contactWidthPx = contactBlock ? contactBlock.width / PX : 0;
    const leftWidthPx = innerWidthPx - (contactBlock ? contactWidthPx + theme.gap : 0);
    const left = stackBlocks([
      block(name, theme.name, leftWidthPx),
      block(title, theme.title, leftWidthPx),
    ]);

    left.placed.forEach(({ block: b, offset }) =>
      drawCalls.push(() => b.draw(innerLeft, contentTop + offset)),
    );

    let contactBottom = 0;
    if (contactBlock) {
      const contactTop = (theme.contact.gap || 0) * PX;
      const x = innerLeft + (innerWidthPx - contactWidthPx) * PX;
      drawCalls.push(() =>
        contactBlock.draw(x, contentTop + contactTop, {
          align: "right",
          boxWidth: contactBlock.width,
        }),
      );
      contactBottom = contactTop + contactBlock.height;
    }

    height = Math.max(left.height, contactBottom);
  } else {
    const align = theme.layout === "center" ? "center" : "left";
    const stack = stackBlocks([
      block(name, theme.name, innerWidthPx),
      block(title, theme.title, innerWidthPx),
      block(contact, theme.contact, innerWidthPx),
    ]);

    stack.placed.forEach(({ block: b, offset }) =>
      drawCalls.push(() =>
        b.draw(innerLeft, contentTop + offset, { align, boxWidth: innerWidthPx * PX }),
      ),
    );

    height = stack.height;
  }

  // 2. Background box (Healthcare), drawn before the text.
  let y = contentTop + height;

  if (box) {
    y += box.padding.y * PX;
    const bottomWidth = box.bottom.width * PX;
    const boxHeight = y - top + bottomWidth;
    const width = contentWidthPx * PX;

    doc.setFillColor(...hex(box.fill));
    doc.rect(contentLeft, top, width, boxHeight, "F");
    doc.setFillColor(...hex(box.bottom.color));
    doc.rect(contentLeft, y, width, bottomWidth, "F");
    doc.setFillColor(...hex(box.left.color));
    doc.rect(contentLeft, top, box.left.width * PX, boxHeight, "F");

    y += bottomWidth;
  }

  // 3. Text.
  drawCalls.forEach((draw) => draw());

  if (!box) {
    y += (theme.paddingBottom || 0) * PX;
    if (theme.rule) {
      y += drawRule(doc, contentLeft, y, contentWidthPx * PX, theme.rule);
    }
  }

  return y + theme.marginBottom * PX;
}

export async function downloadCoverLetterPdf({
  structuredResume,
  templateId,
  coverLetter,
  coverLetterDate,
  hiringManager,
  companyName,
}) {
  if (!coverLetter) return;

  const doc = await createDoc();
  const person = cleanResume(structuredResume) || {};
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = PAGE.side * PX;
  const widthPx = 816 - PAGE.side * 2;
  const bottomLimit = pageHeight - PAGE.bottom * PX;

  let y = drawCoverLetterHeader(doc, person, templateId);

  const recipientLines = [
    coverLetterDate,
    hiringManager?.trim(),
    companyName?.trim(),
  ].filter(Boolean);

  const bodyLines = coverLetter.replace(/\r\n?/g, "\n").trim().split("\n");

  // The preview's spacing first; if the letter would spill onto a second
  // page, tighten the spacing (then the size) a step at a time so it fits.
  const sizes = [
    [15, 1.8], [15, 1.7], [15, 1.6], [15, 1.5], [15, 1.4],
    [14.5, 1.4], [14, 1.4], [13.5, 1.35], [13, 1.35],
  ].map(([size, body]) => ({ size, body, recipient: Math.min(1.65, body) }));

  function layout({ size, recipient, body }) {
    const recipientSpec = { ...BODY_FONT, size, color: "#334155", lineHeight: recipient };
    const bodySpec = { ...BODY_FONT, size, color: "#172033", lineHeight: body };
    const steps = [];

    recipientLines.forEach((line, index) => {
      steps.push({ text: line, spec: recipientSpec });
      if (index < recipientLines.length - 1) steps.push({ space: 4 * PX });
    });

    if (recipientLines.length) steps.push({ space: 28 * PX });

    // Keep the letter's own line breaks and blank lines (white-space: pre-wrap).
    bodyLines.forEach((line) => {
      if (line.trim()) {
        steps.push({ text: line, spec: bodySpec });
      } else {
        steps.push({ space: size * body * PX });
      }
    });

    const height = steps.reduce(
      (total, step) =>
        total +
        (step.space ??
          textBlock(doc, step.text, step.spec, widthPx).lines.length *
            step.spec.size *
            step.spec.lineHeight *
            PX),
      0,
    );

    return { steps, height };
  }

  const available = bottomLimit - y;
  const chosen =
    sizes.map(layout).find((option) => option.height <= available) ||
    layout(sizes[0]);

  chosen.steps.forEach((step) => {
    if (step.space) {
      y += step.space;
      return;
    }

    const lineHeight = step.spec.size * step.spec.lineHeight * PX;

    textBlock(doc, step.text, step.spec, widthPx).lines.forEach((line) => {
      if (y + lineHeight > bottomLimit) {
        doc.addPage();
        y = PAGE.top * PX;
      }
      textBlock(doc, line, step.spec, 100000).draw(left, y);
      y += lineHeight;
    });
  });

  doc.setProperties({ title: `${person.name || "Cover Letter"} — Cover Letter` });
  doc.save(`${slug(companyName, "company")}-cover-letter.pdf`);
}

// ---------------------------------------------------------------------------
// Interview prep
// ---------------------------------------------------------------------------

export async function downloadInterviewPdf(interviewQuestions, jobTitle) {
  if (!interviewQuestions) return;

  const doc = await createDoc();
  const writer = createWriter(doc);
  const { margin } = writer;
  const accent = "#2563eb";

  writer.font("bold", 18, "#111827");
  writer.paragraph("Interview Preparation Guide", { size: 18, after: 1 });
  writer.font("normal", 11, "#4b5563");
  writer.paragraph(jobTitle || "Target Position", { size: 11, after: 6 });

  const sections = [
    ["Technical Questions", interviewQuestions.technicalQuestions],
    ["Behavioral Questions", interviewQuestions.behavioralQuestions],
    ["Motivation & Fit Questions", interviewQuestions.careerSwitchQuestions],
  ];

  sections.forEach(([title, items = []]) => {
    if (!items.length) return;

    writeSectionHeading(writer, title, { heading: accent, rule: "#bfdbfe" }, 25);

    items.forEach((item, index) => {
      const questionLines = writer.split(
        `${index + 1}. ${item.question}`,
        writer.width,
      ).length;
      writer.ensure(questionLines * writer.lineHeight(10.5) + 12);

      writer.font("bold", 10.5, "#111827");
      writer.paragraph(`${index + 1}. ${item.question}`, { size: 10.5, after: 1.5 });

      writer.font("bold", 8.5, "#64748b");
      writer.paragraph("SUGGESTED ANSWER", { x: margin + 5, size: 8.5, after: 0.5 });

      writer.font("normal", 10, "#1f2937");
      writer.paragraph(item.answer, { x: margin + 5, size: 10, after: 5 });
    });

    writer.y += 2;
  });

  const employerQuestions = interviewQuestions.employerQuestions || [];

  if (employerQuestions.length) {
    writeSectionHeading(
      writer,
      "Questions to Ask the Employer",
      { heading: accent, rule: "#bfdbfe" },
    );

    employerQuestions.forEach((question, index) => {
      writer.font("normal", 10, "#1f2937");
      writer.paragraph(`${index + 1}. ${question}`, { after: 2 });
    });
  }

  doc.setProperties({ title: "Interview Preparation Guide" });
  doc.save("interview-prep-guide.pdf");
}

// ---------------------------------------------------------------------------
// ATS report
// ---------------------------------------------------------------------------

export async function downloadReportPdf(result, jobTitle) {
  if (!result) return;

  const doc = await createDoc();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  const cardGap = 6;
  const halfCardWidth = (contentWidth - cardGap) / 2;

  let y = 12;

  function drawCard(x, cardY, width, height) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 226, 235);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, cardY, width, height, 3, 3, "FD");
  }

  function prepare(items, width) {
    return (items || []).map((item) => {
      const lines = doc.splitTextToSize(String(item), width);
      return { lines, height: lines.length * 4.2 + 3 };
    });
  }

  function total(prepared) {
    return prepared.reduce((sum, item) => sum + item.height, 0);
  }

  function writeList(prepared, x, startY) {
    let listY = startY;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);

    prepared.forEach(({ lines, height }) => {
      doc.text("•", x, listY);
      doc.text(lines, x + 5, listY);
      listY += height;
    });
  }

  function cardTitle(text, x, cardY) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(text, x, cardY + 12);
  }

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(15, 23, 42);
  doc.text("ATS Analysis Results", margin, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  const titleLines = doc.splitTextToSize(
    `Resume match for: ${jobTitle || "Target Position"}`,
    contentWidth,
  );
  doc.text(titleLines, margin, y);
  y += titleLines.length * 5 + 7;

  // Score card
  doc.setFontSize(8.5);
  const explanations = prepare(result.scoreExplanation, contentWidth - 65);
  const scoreCardHeight = Math.max(73, 39 + total(explanations));
  drawCard(margin, y, contentWidth, scoreCardHeight);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("ATS Compatibility Score", margin + 10, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text("How well your resume matches the job", margin + 10, y + 18);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("ATS Score Breakdown", margin + 10, y + 29);

  writeList(explanations, margin + 10, y + 37);

  const scoreX = pageWidth - margin - 25;
  const scoreY = y + 34;
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(2.5);
  doc.circle(scoreX, scoreY, 14, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  doc.setTextColor(34, 197, 94);
  doc.text(String(result.atsScore ?? "N/A"), scoreX, scoreY + 2.5, {
    align: "center",
  });
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text("OVERALL", scoreX, scoreY + 22, { align: "center" });

  y += scoreCardHeight + 7;

  // Strengths + missing keywords
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const strengths = prepare(result.resumeStrengths, halfCardWidth - 18);
  const keywords = (result.missingKeywords || []).map(String);

  const pillPadding = 4;
  const pillGap = 3;
  const pillHeight = 8;
  const keywordInnerWidth = halfCardWidth - 16;

  doc.setFontSize(7.5);
  let rowX = 0;
  let keywordRows = 1;
  keywords.forEach((keyword) => {
    const pillWidth = doc.getTextWidth(keyword) + pillPadding * 2;
    if (rowX > 0 && rowX + pillWidth > keywordInnerWidth) {
      keywordRows += 1;
      rowX = 0;
    }
    rowX += pillWidth + pillGap;
  });

  const secondRowHeight = Math.max(
    55,
    20 + total(strengths),
    28 + keywordRows * pillHeight + (keywordRows - 1) * pillGap,
  );

  if (y + secondRowHeight > pageHeight - margin) {
    doc.addPage();
    y = 18;
  }

  const strengthsX = margin;
  const keywordsX = margin + halfCardWidth + cardGap;

  drawCard(strengthsX, y, halfCardWidth, secondRowHeight);
  drawCard(keywordsX, y, halfCardWidth, secondRowHeight);

  // Green check icon
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(1.2);
  doc.line(strengthsX + 8, y + 10, strengthsX + 9.5, y + 11.5);
  doc.line(strengthsX + 9.5, y + 11.5, strengthsX + 12.5, y + 8);
  cardTitle("Resume Strengths", strengthsX + 16, y);
  writeList(strengths, strengthsX + 8, y + 22);

  // Red X icon
  doc.setDrawColor(244, 63, 94);
  doc.setLineWidth(1.2);
  doc.line(keywordsX + 8, y + 8, keywordsX + 12, y + 12);
  doc.line(keywordsX + 12, y + 8, keywordsX + 8, y + 12);
  cardTitle("Missing Keywords", keywordsX + 16, y);

  let pillX = keywordsX + 8;
  let pillY = y + 24;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setLineWidth(0.3);

  keywords.forEach((keyword) => {
    const pillWidth = doc.getTextWidth(keyword) + pillPadding * 2;

    if (pillX + pillWidth > keywordsX + halfCardWidth - 8) {
      pillX = keywordsX + 8;
      pillY += pillHeight + pillGap;
    }

    doc.setFillColor(255, 241, 242);
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(pillX, pillY - 5.5, pillWidth, pillHeight, 2, 2, "FD");
    doc.setTextColor(220, 38, 38);
    doc.text(keyword, pillX + pillPadding, pillY);
    pillX += pillWidth + pillGap;
  });

  y += secondRowHeight + 7;

  // Suggestions + career advice
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const suggestions = prepare(result.resumeSuggestions, halfCardWidth - 18);
  const advice = prepare(result.careerAdvice, halfCardWidth - 18);
  const thirdRowHeight = Math.max(55, 22 + total(suggestions), 22 + total(advice));

  if (y + thirdRowHeight > pageHeight - margin) {
    doc.addPage();
    y = 18;
  }

  drawCard(margin, y, halfCardWidth, thirdRowHeight);
  drawCard(keywordsX, y, halfCardWidth, thirdRowHeight);
  cardTitle("Resume Suggestions", margin + 8, y);
  writeList(suggestions, margin + 8, y + 22);
  cardTitle("Career Advice", keywordsX + 8, y);
  writeList(advice, keywordsX + 8, y + 22);

  doc.setProperties({ title: "ATS Analysis Report" });
  doc.save("ats-analysis-report.pdf");
}
