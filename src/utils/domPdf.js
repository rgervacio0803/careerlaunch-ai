// Turns a rendered React element into a text-based PDF that looks like the
// on-screen preview.
//
// The element is rendered off-screen in an iframe at letter width (so the
// app's own CSS lays it out exactly like the desktop preview). Every box,
// border and line of text is then measured and redrawn with jsPDF: text
// stays real, selectable text, so ATS software can read the file.

import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";

const PX = 25.4 / 96; // millimetres per CSS pixel
const PAGE_WIDTH = 816; // US Letter at 96 dpi
const PAGE_HEIGHT = 1056;
const PAGE_MARGIN = 48; // top/bottom space on pages after the first

// ---------------------------------------------------------------------------
// Off-screen rendering
// ---------------------------------------------------------------------------

async function createFrame() {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.tabIndex = -1;
  Object.assign(iframe.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: `${PAGE_WIDTH}px`,
    height: `${PAGE_HEIGHT}px`,
    border: "0",
    opacity: "0",
    pointerEvents: "none",
  });
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  doc.open();
  doc.write(
    '<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>',
  );
  doc.close();

  // Bring the app's styles into the frame.
  const loads = [];
  document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
    const clone = doc.importNode(node, true);
    if (clone.tagName === "LINK") {
      clone.href = node.href;
      loads.push(
        new Promise((resolve) => {
          clone.onload = resolve;
          clone.onerror = resolve;
        }),
      );
    }
    doc.head.appendChild(clone);
  });

  // Page-sized layout: no preview-only minimum heights, shadows or animation.
  const style = doc.createElement("style");
  style.textContent = `
    html, body { margin: 0; padding: 0; background: #ffffff; }
    .pdf-export-root, .pdf-export-root * {
      min-height: 0 !important;
      box-shadow: none !important;
      transition: none !important;
      animation: none !important;
    }
    .pdf-export-root > * {
      width: 100% !important;
      min-width: 0 !important;
      margin: 0 !important;
      border-radius: 0 !important;
    }
  `;
  doc.head.appendChild(style);

  await Promise.all(loads);
  await doc.fonts?.ready;

  return { iframe, doc, win: iframe.contentWindow };
}

// ---------------------------------------------------------------------------
// Measuring
// ---------------------------------------------------------------------------

function parseColor(value) {
  if (!value || value === "transparent") return null;
  const parts = value.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return null;
  const [r, g, b] = parts.slice(0, 3).map(Number);
  const alpha = parts.length >= 4 ? Number(parts[3]) : 1;
  if (alpha < 0.05) return null;
  // Blend partly transparent colors onto white.
  return [r, g, b].map((c) => Math.round(c * alpha + 255 * (1 - alpha)));
}

function parseLength(value, basis) {
  if (!value) return 0;
  if (value.endsWith("%")) return (parseFloat(value) / 100) * basis;
  return parseFloat(value) || 0;
}

function gradientColors(backgroundImage) {
  if (!backgroundImage || !backgroundImage.includes("gradient")) return null;
  const colors = backgroundImage.match(/rgba?\([^)]+\)/g);
  if (!colors || colors.length < 2) return null;
  return [parseColor(colors[0]), parseColor(colors[colors.length - 1])];
}

function pdfFont(cs) {
  const family = cs.fontFamily.toLowerCase();
  const first = family.split(",")[0];
  const serif =
    /georgia|times|garamond|cambria|serif/.test(first) && !/sans/.test(first);
  const mono = /mono|courier|consolas/.test(first);
  const bold = Number(cs.fontWeight) >= 600 || cs.fontWeight === "bold";
  const italic = cs.fontStyle === "italic" || cs.fontStyle === "oblique";

  return {
    family: mono ? "courier" : serif ? "times" : "helvetica",
    style: bold && italic ? "bolditalic" : bold ? "bold" : italic ? "italic" : "normal",
  };
}

function transformText(text, transform) {
  if (transform === "uppercase") return text.toUpperCase();
  if (transform === "lowercase") return text.toLowerCase();
  if (transform === "capitalize") {
    return text.replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
  }
  return text;
}

// Standard PDF fonts only cover Western European characters; drop the rest
// (mainly emoji) instead of printing garbage.
function pdfSafe(text) {
  return text
    .replace(/[\u2010-\u2012]/g, "-")
    .replace(/[^\x20-\xFF\u0152\u0153\u0160\u0161\u0178\u017D\u017E\u0192\u02C6\u02DC\u2013\u2014\u2018-\u201A\u201C-\u201E\u2020-\u2022\u2026\u2030\u2039\u203A\u20AC\u2122]/gu, "");
}

function boxFromStyle(cs, rect) {
  const fill = parseColor(cs.backgroundColor);
  const gradient = gradientColors(cs.backgroundImage);
  const radius = parseLength(cs.borderTopLeftRadius, Math.min(rect.w, rect.h));

  const sides = ["Top", "Right", "Bottom", "Left"].map((side) => ({
    side,
    width: parseFloat(cs[`border${side}Width`]) || 0,
    style: cs[`border${side}Style`],
    color: parseColor(cs[`border${side}Color`]),
  }));
  const borders = sides.filter(
    (b) => b.width > 0 && b.color && b.style !== "none" && b.style !== "hidden",
  );

  if (!fill && !gradient && !borders.length) return null;

  return { ...rect, fill, gradient, radius, borders };
}

function measure(container, doc, win) {
  const base = container.getBoundingClientRect();
  const rel = (r) => ({
    x: r.left - base.left,
    y: r.top - base.top,
    w: r.width,
    h: r.height,
  });

  const boxes = [];
  const markers = [];
  const lines = [];
  const atomicBoxes = [];
  const bullets = [];
  const keepBlocks = [];
  const keepWithNext = [];

  const elements = [container, ...container.querySelectorAll("*")];

  elements.forEach((el) => {
    const cs = win.getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") return;

    const rect = rel(el.getBoundingClientRect());
    if (!rect.w || !rect.h) return;

    const box = boxFromStyle(cs, rect);
    if (box) {
      boxes.push(box);
      // Small decorated boxes (skill pills, tags) shouldn't be split by a page.
      if (el !== container && rect.h < 120) atomicBoxes.push(rect);
    }

    // Decorative dots drawn with ::before (Executive templates).
    const before = win.getComputedStyle(el, "::before");
    if (
      before.content &&
      before.content !== "none" &&
      before.position === "absolute"
    ) {
      const w = parseFloat(before.width) || 0;
      const h = parseFloat(before.height) || 0;
      const pseudo = {
        x: rect.x + parseLength(before.left, rect.w),
        y: rect.y + parseLength(before.top, rect.h),
        w,
        h,
      };
      const pseudoBox = w && h ? boxFromStyle(before, pseudo) : null;
      if (pseudoBox) boxes.push(pseudoBox);
    }

    // List bullets.
    if (el.tagName === "LI" && cs.listStyleType !== "none") {
      const fontSize = parseFloat(cs.fontSize);
      const lineHeight =
        cs.lineHeight === "normal" ? fontSize * 1.2 : parseFloat(cs.lineHeight);
      markers.push({
        x: rect.x,
        y: rect.y,
        fontSize,
        lineHeight,
        color: parseColor(cs.color) || [0, 0, 0],
        type: cs.listStyleType,
      });
      // Keep short bullets together on one page.
      if (rect.h <= lineHeight * 4.5) bullets.push(rect);
    }

    // Cards marked data-pdf-keep stay on one page when they fit.
    if (el.hasAttribute("data-pdf-keep") && rect.h < PAGE_HEIGHT * 0.8) {
      keepBlocks.push(rect);
    }

    // Headings and job headers stay with the line that follows them.
    if (/^H[1-4]$/.test(el.tagName) || /job-header/.test(el.className)) {
      keepWithNext.push(rect);
    }
  });

  // Text, one entry per rendered line.
  const walker = doc.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const range = doc.createRange();

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.nodeValue;
    if (!text || !text.trim()) continue;

    const parent = node.parentElement;
    const cs = win.getComputedStyle(parent);
    if (cs.visibility === "hidden" || cs.display === "none") continue;

    const style = {
      ...pdfFont(cs),
      size: parseFloat(cs.fontSize),
      color: parseColor(cs.color) || [0, 0, 0],
      spacing: parseFloat(cs.letterSpacing) || 0,
      transform: cs.textTransform,
    };

    let line = null;
    const flush = () => {
      if (!line) return;
      const lineText = pdfSafe(
        transformText(
          text.slice(line.start, line.end).replace(/\s+/g, " "),
          style.transform,
        ),
      ).trim();
      if (lineText) lines.push({ ...line, text: lineText, style });
      line = null;
    };

    // Words, with hyphenated words split after each hyphen because browsers
    // can wrap there ("cross-" / "training").
    for (const match of text.matchAll(/[^\s-]*-+|[^\s-]+/g)) {
      range.setStart(node, match.index);
      range.setEnd(node, match.index + match[0].length);
      if (!pdfSafe(match[0])) continue; // e.g. an emoji before a heading
      const rects = [...range.getClientRects()].filter((r) => r.width > 0);
      if (!rects.length) continue;

      const r = rel(rects[0]);
      const end = match.index + match[0].length;

      if (line && Math.abs(r.y - line.y) < 2) {
        line.end = end;
        line.right = r.x + r.w;
        line.h = Math.max(line.h, r.h);
      } else {
        flush();
        line = { start: match.index, end, x: r.x, y: r.y, right: r.x + r.w, h: r.h };
      }
    }

    flush();
  }

  return {
    height: base.height,
    boxes,
    markers,
    lines,
    atomicBoxes,
    bullets,
    keepBlocks,
    keepWithNext,
  };
}

// ---------------------------------------------------------------------------
// Page breaks
// ---------------------------------------------------------------------------

function pageBreaks(layout) {
  const { height, lines, atomicBoxes: boxSpans, bullets, keepBlocks, keepWithNext } =
    layout;

  const textSpans = lines.map((l) => [l.y - 1, l.y + l.h + 1]);
  const keepSpans = [];

  // A heading may not end a page: keep it with the first line below it.
  keepWithNext.forEach((r) => {
    const next = lines
      .filter((l) => l.y >= r.y + r.h - 1 && l.x < r.x + r.w && l.x + 1 > r.x - 1)
      .sort((a, b) => a.y - b.y)[0];
    if (next) keepSpans.push([r.y - 1, next.y + next.h + 1]);
  });

  const toSpans = (rects) => rects.map((r) => [r.y, r.y + r.h]);

  // From the nicest kind of break to the most forgiving. Each tier only looks
  // within part of the page, so pages don't end with large empty gaps.
  const tiers = [
    // Whole cards first, accepting a larger gap at the bottom of the page.
    ...(keepBlocks.length
      ? [{ floor: 0.55, spans: [...textSpans, ...keepSpans, ...toSpans(boxSpans), ...toSpans(keepBlocks)] }]
      : []),
    { floor: 0.85, spans: [...textSpans, ...keepSpans, ...toSpans(boxSpans), ...toSpans(bullets)] },
    { floor: 0.8, spans: [...textSpans, ...keepSpans, ...toSpans(boxSpans)] },
    { floor: 0.6, spans: [...textSpans, ...keepSpans] },
    { floor: 0.5, spans: textSpans },
  ];

  const blocked = (y, spans) => spans.some(([a, b]) => y > a && y < b);

  const pages = [];
  let start = 0;

  while (start < height - 1) {
    const top = pages.length === 0 ? 0 : PAGE_MARGIN;
    const capacity = PAGE_HEIGHT - top - PAGE_MARGIN;
    const ideal = Math.floor(start + capacity);

    if (ideal >= height) {
      pages.push([start, height]);
      break;
    }

    let end = null;

    for (const tier of tiers) {
      const floor = start + capacity * tier.floor;
      for (let y = ideal; y > floor; y -= 1) {
        if (!blocked(y, tier.spans)) {
          end = y;
          break;
        }
      }
      if (end !== null) break;
    }

    end = end ?? ideal;
    pages.push([start, end]);
    start = end;
  }

  return pages;
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

function clip(rect, from, to) {
  const y1 = Math.max(rect.y, from);
  const y2 = Math.min(rect.y + rect.h, to);
  return y2 > y1 ? { ...rect, y: y1, h: y2 - y1 } : null;
}

function drawBox(pdf, box, from, to, offset) {
  const part = clip(box, from, to);
  if (!part) return;

  const whole = part.y === box.y && part.h === box.h;
  const x = part.x * PX;
  const y = (part.y - from + offset) * PX;
  const w = part.w * PX;
  const h = part.h * PX;
  const r = whole ? Math.min(box.radius, part.w / 2, part.h / 2) * PX : 0;

  if (box.gradient) {
    const [a, b] = box.gradient;
    const strips = 100;
    for (let i = 0; i < strips; i += 1) {
      const t = i / (strips - 1);
      pdf.setFillColor(...a.map((c, k) => Math.round(c + (b[k] - c) * t)));
      pdf.rect(x + (w / strips) * i, y, w / strips + 0.15, h, "F");
    }
  } else if (box.fill) {
    pdf.setFillColor(...box.fill);
    if (r > 0.1) pdf.roundedRect(x, y, w, h, r, r, "F");
    else pdf.rect(x, y, w, h, "F");
  }

  // Uniform border on a rounded box: one rounded outline.
  const uniform =
    box.borders.length === 4 &&
    box.borders.every(
      (b) =>
        b.width === box.borders[0].width &&
        b.color.join() === box.borders[0].color.join(),
    );

  if (uniform && r > 0.1) {
    const bw = box.borders[0].width * PX;
    pdf.setDrawColor(...box.borders[0].color);
    pdf.setLineWidth(bw);
    pdf.roundedRect(x + bw / 2, y + bw / 2, w - bw, h - bw, r, r, "S");
    return;
  }

  box.borders.forEach((border) => {
    const bw = border.width;
    let side;

    if (border.side === "Top") {
      if (part.y !== box.y) return;
      side = { x: box.x, y: box.y, w: box.w, h: bw };
    } else if (border.side === "Bottom") {
      if (part.y + part.h !== box.y + box.h) return;
      side = { x: box.x, y: box.y + box.h - bw, w: box.w, h: bw };
    } else if (border.side === "Left") {
      side = { x: part.x, y: part.y, w: bw, h: part.h };
    } else {
      side = { x: part.x + part.w - bw, y: part.y, w: bw, h: part.h };
    }

    pdf.setFillColor(...border.color);
    const sx = side.x * PX;
    const sy = (side.y - from + offset) * PX;

    if (border.style === "double" && bw >= 3) {
      const third = (bw / 3) * PX;
      if (side.w > side.h) {
        pdf.rect(sx, sy, side.w * PX, third, "F");
        pdf.rect(sx, sy + third * 2, side.w * PX, third, "F");
      } else {
        pdf.rect(sx, sy, third, side.h * PX, "F");
        pdf.rect(sx + third * 2, sy, third, side.h * PX, "F");
      }
    } else {
      pdf.rect(sx, sy, side.w * PX, side.h * PX, "F");
    }
  });
}

function drawMarker(pdf, marker, from, offset) {
  const { fontSize: fs, lineHeight: lh } = marker;
  // Matches where browsers place an outside "disc" bullet.
  const centerY = marker.y + (lh - fs * 1.117) / 2 + fs * 0.905 - fs * 0.29;
  const centerX = marker.x - fs * 0.78;

  pdf.setFillColor(...marker.color);
  pdf.setDrawColor(...marker.color);

  if (marker.type === "circle") {
    pdf.setLineWidth(0.15);
    pdf.circle(centerX * PX, (centerY - from + offset) * PX, fs * 0.15 * PX, "S");
  } else if (marker.type === "square") {
    const s = fs * 0.3;
    pdf.rect((centerX - s / 2) * PX, (centerY - s / 2 - from + offset) * PX, s * PX, s * PX, "F");
  } else {
    pdf.circle(centerX * PX, (centerY - from + offset) * PX, fs * 0.165 * PX, "F");
  }
}

function drawLine(pdf, line, from, offset) {
  const { style } = line;
  pdf.setFont(style.family, style.style);
  pdf.setTextColor(...style.color);

  let fontPt = style.size * 0.75;
  const charSpace = style.spacing * PX;
  pdf.setFontSize(fontPt);
  pdf.setCharSpace(charSpace);

  // Standard PDF fonts are a little wider or narrower than web fonts. Shrink
  // a line slightly if it would run past where the browser ended it.
  const target = (line.right - line.x) * PX;
  const actual =
    pdf.getTextWidth(line.text) + charSpace * Math.max(line.text.length - 1, 0);
  if (actual > target * 1.01 && actual > 0) {
    fontPt *= Math.max(0.8, target / actual);
    pdf.setFontSize(fontPt);
  }

  const baseline = line.y + line.h * 0.81;
  pdf.text(line.text, line.x * PX, (baseline - from + offset) * PX);
  pdf.setCharSpace(0);
}

/**
 * Renders `element` off-screen, then saves it as a multi-page letter PDF.
 */
export async function downloadElementAsPdf(element, { fileName, title }) {
  const [{ jsPDF }, frame] = await Promise.all([import("jspdf"), createFrame()]);
  const { iframe, doc, win } = frame;

  const container = doc.createElement("div");
  container.className = "pdf-capture-area pdf-export-root";
  container.style.width = `${PAGE_WIDTH}px`;
  doc.body.appendChild(container);

  const root = createRoot(container);

  try {
    flushSync(() => root.render(element));
    await new Promise((resolve) => requestAnimationFrame(() => resolve()));
    await doc.fonts?.ready;

    const layout = measure(container, doc, win);
    const pages = pageBreaks(layout);
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "letter" });

    pages.forEach(([from, to], index) => {
      if (index > 0) pdf.addPage();
      const offset = index === 0 ? 0 : PAGE_MARGIN;

      layout.boxes.forEach((box) => drawBox(pdf, box, from, to, offset));

      layout.markers
        .filter((m) => m.y >= from - 1 && m.y < to - 1)
        .forEach((m) => drawMarker(pdf, m, from, offset));

      layout.lines
        .filter((l) => l.y + l.h / 2 >= from && l.y + l.h / 2 < to)
        .forEach((l) => drawLine(pdf, l, from, offset));
    });

    if (title) pdf.setProperties({ title });
    pdf.save(fileName);
  } finally {
    root.unmount();
    iframe.remove();
  }
}
