/**
 * Smart Paper Generation Agent v2
 *
 * Boards: Maths → Edexcel, Biology → Edexcel, Chemistry → OCR-A
 *
 * Generates exam-style PDFs matching real paper formatting:
 * - Edexcel: Pearson cover page, candidate boxes, paper ref, (marks) in round brackets
 * - OCR: OCR cover page, candidate boxes, [marks] in square brackets
 * - One question per page with answer lines and proper spacing
 * - Sub-parts (a)(b)(i)(ii) properly formatted and indented
 * - Separate Question Paper + Mark Scheme PDFs per paper
 * - LaTeX rendered via KaTeX, SVG diagrams embedded
 */

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const DATA_DIR = path.join(__dirname, "..", "public", "data");
const OUT_DIR = path.join(__dirname, "..", "generated-papers");

// ── Paper Blueprints ─────────────────────────────────────────────

const BLUEPRINTS = {
  Maths: [
    {
      title: "Paper 1: Pure Mathematics 1",
      subject: "Mathematics",
      code: "9MA0/01",
      totalMarks: 100,
      time: "2 hours",
      board: "Edexcel",
      boardStyle: "edexcel",
      materials: "Mathematical Formulae and Statistical Tables (Green), calculator",
      calculatorWarning: "Candidates may use any calculator allowed by Pearson regulations. Calculators must not have the facility for symbolic algebra manipulation, differentiation and integration, or have retrievable mathematical formulae stored in them.",
      instructions: [
        "Use <b>black</b> ink or ball-point pen.",
        "If pencil is used for diagrams/sketches/graphs it must be dark (HB or B).",
        "<b>Fill in the boxes</b> at the top of this page with your name, centre number and candidate number.",
        "Answer <b>all</b> questions and ensure that your answers to parts of questions are clearly labelled.",
        "Answer the questions in the spaces provided – <i>there may be more space than you need.</i>",
        "You should show sufficient working to make your methods clear. Answers without working may not gain full credit.",
        "Inexact answers should be given to three significant figures unless otherwise stated.",
      ],
      information: [
        "A booklet 'Mathematical Formulae and Statistical Tables' is provided.",
        "The marks for <b>each</b> question are shown in brackets – <i>use this as a guide as to how much time to spend on each question.</i>",
      ],
      advice: [
        "Read each question carefully before you start to answer it.",
        "Try to answer every question.",
        "Check your answers if you have time at the end.",
      ],
      topicFilter: (topic) => {
        const pure = [
          "proof", "algebra", "function", "quadratic", "polynomial", "simultaneous",
          "inequalit", "graph", "transform", "trigonometr", "exponential", "logarithm",
          "differentiat", "integrat", "numerical method", "vector", "coordinate",
          "sequence", "series", "binomial", "partial fraction", "parametric",
          "differential equation", "iteration", "recurrence",
        ];
        return pure.some(k => topic.toLowerCase().includes(k));
      },
      markTargets: [
        { min: 2, max: 4, count: 5 },
        { min: 5, max: 7, count: 5 },
        { min: 8, max: 10, count: 4 },
        { min: 11, max: 15, count: 1 },
      ],
    },
    {
      title: "Paper 2: Statistics and Mechanics",
      subject: "Mathematics",
      code: "9MA0/02",
      totalMarks: 100,
      time: "2 hours",
      board: "Edexcel",
      boardStyle: "edexcel",
      materials: "Mathematical Formulae and Statistical Tables (Green), calculator",
      calculatorWarning: "Candidates may use any calculator allowed by Pearson regulations. Calculators must not have the facility for symbolic algebra manipulation, differentiation and integration, or have retrievable mathematical formulae stored in them.",
      instructions: [
        "Use <b>black</b> ink or ball-point pen.",
        "If pencil is used for diagrams/sketches/graphs it must be dark (HB or B).",
        "<b>Fill in the boxes</b> at the top of this page with your name, centre number and candidate number.",
        "Answer <b>all</b> questions and ensure that your answers to parts of questions are clearly labelled.",
        "Answer the questions in the spaces provided – <i>there may be more space than you need.</i>",
        "You should show sufficient working to make your methods clear. Answers without working may not gain full credit.",
        "Inexact answers should be given to three significant figures unless otherwise stated.",
      ],
      information: [
        "A booklet 'Mathematical Formulae and Statistical Tables' is provided.",
        "The marks for <b>each</b> question are shown in brackets – <i>use this as a guide as to how much time to spend on each question.</i>",
      ],
      advice: [
        "Read each question carefully before you start to answer it.",
        "Try to answer every question.",
        "Check your answers if you have time at the end.",
      ],
      topicFilter: (topic) => {
        const statsMech = [
          "statist", "sampling", "data", "probability", "distribution", "binomial dist",
          "normal", "hypothesis", "correlation", "regression", "poisson",
          "kinematic", "force", "newton", "moment", "projectile", "friction",
          "impulse", "momentum", "work", "energy", "power", "statics",
          "acceleration", "velocity", "displacement", "suvat", "resolving",
        ];
        return statsMech.some(k => topic.toLowerCase().includes(k));
      },
      markTargets: [
        { min: 2, max: 4, count: 5 },
        { min: 5, max: 7, count: 5 },
        { min: 8, max: 10, count: 4 },
        { min: 11, max: 15, count: 1 },
      ],
    },
  ],
  Biology: [
    {
      title: "Paper 1: The Natural Environment and Species Survival",
      subject: "Biology",
      code: "9BN0/01",
      totalMarks: 80,
      time: "1 hour 45 minutes",
      board: "Edexcel",
      boardStyle: "edexcel",
      materials: "Scientific calculator, ruler",
      calculatorWarning: null,
      instructions: [
        "Use <b>black</b> ink or ball-point pen.",
        "If pencil is used for diagrams/sketches/graphs it must be dark (HB or B).",
        "<b>Fill in the boxes</b> at the top of this page with your name, centre number and candidate number.",
        "Answer <b>all</b> questions.",
        "Answer the questions in the spaces provided – <i>there may be more space than you need.</i>",
      ],
      information: [
        "The marks for <b>each</b> question are shown in brackets – <i>use this as a guide as to how much time to spend on each question.</i>",
      ],
      advice: [
        "Read each question carefully before you start to answer it.",
        "Try to answer every question.",
        "Check your answers if you have time at the end.",
      ],
      topicFilter: () => true,
      markTargets: [
        { min: 1, max: 3, count: 8 },
        { min: 4, max: 6, count: 6 },
        { min: 7, max: 9, count: 2 },
      ],
    },
  ],
  Chemistry: [
    {
      title: "Periodic table, elements and physical chemistry",
      subject: "Chemistry A",
      code: "H432/01",
      totalMarks: 100,
      time: "2 hours 15 minutes",
      board: "OCR",
      boardStyle: "ocr",
      materials: null,
      mustHave: "the Data Sheet for Chemistry A",
      canUse: ["a scientific or graphical calculator", "an HB pencil"],
      instructions: [
        "Use black ink. You can use an HB pencil, but only for graphs and diagrams.",
        "Write your answer to each question in the space provided. If you need extra space use the lined pages at the end of this booklet. The question numbers must be clearly shown.",
        "Answer <b>all</b> the questions.",
        "Where appropriate, your answer should be supported with working. Marks might be given for using a correct method, even if your answer is wrong.",
      ],
      information: [
        "The marks for each question are shown in brackets <b>[ ]</b>.",
        "Quality of extended response will be assessed in questions marked with an asterisk (*).",
      ],
      advice: [
        "Read each question carefully before you start your answer.",
      ],
      topicFilter: () => true,
      markTargets: [
        { min: 1, max: 3, count: 7 },
        { min: 4, max: 6, count: 6 },
        { min: 7, max: 10, count: 2 },
      ],
    },
  ],
};

// ── Smart Question Selection ─────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function selectQuestions(allQuestions, blueprint, usedIds = new Set()) {
  let pool = allQuestions.filter(q =>
    blueprint.topicFilter(q.subtopic || "") && !usedIds.has(q.id)
  );

  if (pool.length < 10) {
    console.log(`  Warning: Only ${pool.length} match topic filter, widening pool`);
    pool = allQuestions.filter(q => !usedIds.has(q.id));
  }

  const selected = [];
  let totalMarks = 0;
  const usedTopics = new Set();

  for (const target of blueprint.markTargets) {
    const candidates = shuffle(pool.filter(q =>
      q.marks >= target.min && q.marks <= target.max && !usedIds.has(q.id)
    ));

    let count = 0;
    for (const q of candidates) {
      if (count >= target.count) break;
      if (usedTopics.has(q.subtopic) && count > 0 && candidates.length > target.count * 2) continue;
      selected.push(q);
      usedIds.add(q.id);
      usedTopics.add(q.subtopic);
      totalMarks += q.marks;
      count++;
    }
  }

  // Fill deficit
  const deficit = blueprint.totalMarks - totalMarks;
  if (deficit > 3) {
    const remaining = shuffle(pool.filter(q => !usedIds.has(q.id)));
    for (const q of remaining) {
      if (totalMarks >= blueprint.totalMarks - 3) break;
      selected.push(q);
      usedIds.add(q.id);
      totalMarks += q.marks;
    }
  }

  // Sort: easier/shorter first, harder/longer last
  const diffOrder = { easy: 0, medium: 1, hard: 2 };
  selected.sort((a, b) => {
    const da = diffOrder[a.difficulty] ?? 1;
    const db = diffOrder[b.difficulty] ?? 1;
    if (da !== db) return da - db;
    return a.marks - b.marks;
  });

  console.log(`  Selected ${selected.length} questions, total ${totalMarks} marks`);
  console.log(`  Topics: ${usedTopics.size} | easy=${selected.filter(q=>q.difficulty==='easy').length} med=${selected.filter(q=>q.difficulty==='medium').length} hard=${selected.filter(q=>q.difficulty==='hard').length}`);
  console.log(`  Diagrams: ${selected.filter(q=>q.diagram_svg).length}`);

  return { questions: selected, totalMarks };
}

// ── LaTeX-aware HTML rendering ───────────────────────────────────

function escapeHtml(s) {
  if (typeof s !== "string") return String(s || "");
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(s) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderLatex(text) {
  if (!text) return "";

  // First extract LaTeX regions to protect them
  const tokens = [];
  let result = text;

  // Display math $$...$$
  result = result.replace(/\$\$(.*?)\$\$/gs, (m, l) => {
    const idx = tokens.length;
    tokens.push(`<span class="katex-display" data-latex="${escapeAttr(l)}"></span>`);
    return `%%TOKEN_${idx}%%`;
  });

  // Inline math $...$
  result = result.replace(/\$(.*?)\$/g, (m, l) => {
    const idx = tokens.length;
    tokens.push(`<span class="katex-inline" data-latex="${escapeAttr(l)}"></span>`);
    return `%%TOKEN_${idx}%%`;
  });

  // Now HTML-escape the non-LaTeX text
  result = escapeHtml(result);

  // Restore math symbols that were escaped
  result = result.replace(/&lt;/g, "<").replace(/&gt;/g, ">"); // < > in question text are math symbols
  result = result.replace(/&amp;/g, "&"); // & rarely appears, but preserve

  // Restore LaTeX tokens
  for (let i = 0; i < tokens.length; i++) {
    result = result.replace(`%%TOKEN_${i}%%`, tokens[i]);
  }

  result = result.replace(/\n/g, "<br>");
  return result;
}

// Parse question text into stem + sub-parts (a)(b)(i)(ii)
function parseQuestionParts(text) {
  if (!text) return { stem: "", parts: [] };
  const matches = [...text.matchAll(/(?:^|\n)\s*\(([a-z])\)\s*/g)];
  if (matches.length === 0) return { stem: text, parts: [] };

  const stem = text.substring(0, matches[0].index).trim();
  const parts = [];

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const partText = text.substring(start, end).trim();
    const label = matches[i][1];

    const subMatches = [...partText.matchAll(/(?:^|\n)\s*\(([ivx]+)\)\s*/g)];
    if (subMatches.length > 0) {
      const partStem = partText.substring(0, subMatches[0].index).trim();
      const subParts = [];
      for (let j = 0; j < subMatches.length; j++) {
        const subStart = subMatches[j].index + subMatches[j][0].length;
        const subEnd = j + 1 < subMatches.length ? subMatches[j + 1].index : partText.length;
        subParts.push({ label: subMatches[j][1], text: partText.substring(subStart, subEnd).trim() });
      }
      parts.push({ label, text: partStem, subParts });
    } else {
      parts.push({ label, text: partText, subParts: [] });
    }
  }
  return { stem, parts };
}

// ── Shared CSS ──────────────────────────────────────────────────

const SHARED_CSS = `
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11pt;
    color: #000;
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Question pages */
  .question-page {
    width: 210mm;
    min-height: 297mm;
    padding: 15mm 22mm 22mm 25mm;
    page-break-after: always;
    position: relative;
  }
  .page-num {
    text-align: center;
    font-size: 10pt;
    font-weight: 700;
    margin-bottom: 6mm;
  }
  .question {
    display: flex;
    gap: 3mm;
  }
  .q-num {
    min-width: 10mm;
    font-size: 11pt;
    font-weight: 700;
    padding-top: 0.5mm;
  }
  .q-body { flex: 1; }
  .q-stem {
    font-size: 11pt;
    line-height: 1.6;
    margin-bottom: 3mm;
  }

  .diagram { margin: 5mm 0; text-align: center; }
  .diagram svg { max-width: 80%; height: auto; max-height: 180px; }

  .q-marks { text-align: right; font-size: 11pt; margin: 2mm 0 1mm; }

  .q-part {
    display: flex;
    gap: 2mm;
    margin: 5mm 0 2mm 2mm;
  }
  .part-label { min-width: 10mm; font-size: 11pt; padding-top: 0.5mm; }
  .part-body { flex: 1; }
  .part-text { font-size: 11pt; line-height: 1.6; margin-bottom: 2mm; }
  .part-marks { text-align: right; font-size: 11pt; margin: 1mm 0; }

  .q-subpart {
    display: flex;
    gap: 2mm;
    margin: 4mm 0 2mm 5mm;
  }
  .subpart-label { min-width: 14mm; font-size: 11pt; padding-top: 0.5mm; }
  .subpart-body { flex: 1; }
  .subpart-text { font-size: 11pt; line-height: 1.6; margin-bottom: 2mm; }

  .answer-lines { margin: 3mm 0 2mm; }
  .answer-line { border-bottom: 0.5pt solid #aaa; height: 8.5mm; width: 100%; }

  .q-total {
    text-align: right;
    font-size: 10pt;
    font-weight: 700;
    margin-top: 6mm;
    padding-top: 3mm;
    border-top: 0.5pt solid #000;
  }

  .page-footer {
    position: absolute;
    bottom: 12mm;
    left: 25mm;
    right: 22mm;
    display: flex;
    justify-content: space-between;
    font-size: 8.5pt;
  }
  .page-footer .copyright { color: #555; }
  .page-footer .turn-over { font-weight: 700; font-style: italic; }

  .end-page {
    width: 210mm;
    min-height: 297mm;
    padding: 15mm 20mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    page-break-after: always;
  }
  .end-total { font-size: 14pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5mm; }
  .end-text { font-size: 11pt; color: #333; text-transform: uppercase; letter-spacing: 2px; }

  .katex { font-size: 1.05em !important; }
  .katex-display .katex { font-size: 1.15em !important; }
`;

// ── Edexcel Cover Page ──────────────────────────────────────────

function edexcelCover(bp, questions, totalMarks, setLabel) {
  return `
  <div class="cover edexcel-cover">
    <div class="cover-inner">
      <div class="candidate-section">
        <div class="cand-note">Please check the examination details below before entering your candidate information</div>
        <div class="cand-row">
          <div class="cand-field"><span class="cand-label">Candidate surname</span></div>
          <div class="cand-field"><span class="cand-label">Other names</span></div>
        </div>
        <div class="cand-row">
          <div><span class="cand-label">Centre Number</span><div class="num-boxes">${Array(5).fill('<div class="num-box"></div>').join("")}</div></div>
          <div><span class="cand-label">Candidate Number</span><div class="num-boxes">${Array(4).fill('<div class="num-box"></div>').join("")}</div></div>
        </div>
      </div>

      <div class="board-title">Pearson Edexcel Level 3 GCE</div>
      <div class="time-badge">Time: ${bp.time}</div>

      <div class="paper-ref">
        <span class="ref-label">Paper<br>reference</span>
        <span class="ref-code">${bp.code}</span>
      </div>

      <div class="subject-name">${bp.subject}</div>
      <div class="level-tag">Advanced</div>
      <div class="paper-name"><b>PAPER ${bp.code.split("/")[1]}:</b> ${bp.title.split(":")[1]?.trim() || bp.title}</div>

      <div class="must-have-row">
        <div class="must-have-left">
          <b>You must have:</b><br>
          <span>${bp.materials}</span>
        </div>
        <div class="total-marks-box">Total Marks</div>
      </div>

      ${bp.calculatorWarning ? `<div class="calc-warning">${bp.calculatorWarning}</div>` : ""}

      <div class="cover-section">
        <h3>Instructions</h3>
        <ul>${bp.instructions.map(i => `<li>${i}</li>`).join("")}</ul>
      </div>
      <div class="cover-section">
        <h3>Information</h3>
        <ul>
          ${bp.information.map(i => `<li>${i}</li>`).join("")}
          <li>There are <b>${questions.length}</b> questions in this question paper. The total mark for this paper is <b>${totalMarks}</b>.</li>
        </ul>
      </div>
      <div class="cover-section">
        <h3>Advice</h3>
        <ul>${bp.advice.map(i => `<li>${i}</li>`).join("")}</ul>
      </div>

      <div class="set-note">Practice Paper &mdash; ${setLabel}</div>
      <div class="cover-turn-over"><i>Turn over</i>&ensp;&#9654;</div>
    </div>
  </div>`;
}

const EDEXCEL_CSS = `
  .edexcel-cover {
    width: 210mm; min-height: 297mm;
    padding: 10mm 15mm 12mm;
    page-break-after: always;
    position: relative;
  }
  .cover-inner {
    border: 1.5pt solid #000;
    padding: 6mm 10mm 10mm;
    min-height: 273mm;
    position: relative;
  }
  .candidate-section {
    border: 0.8pt solid #aaa;
    padding: 3mm 4mm;
    margin-bottom: 5mm;
    font-size: 8pt;
  }
  .cand-note { text-align: center; color: #666; font-size: 7.5pt; margin-bottom: 2mm; }
  .cand-row { display: flex; gap: 8mm; margin-bottom: 2mm; }
  .cand-field { flex: 1; border-bottom: 0.5pt solid #ccc; padding-bottom: 5mm; min-height: 8mm; }
  .cand-label { font-size: 8pt; color: #333; }
  .num-boxes { display: flex; gap: 1mm; margin-top: 2mm; }
  .num-box { width: 7.5mm; height: 9.5mm; border: 0.8pt solid #aaa; background: #f5f5f5; }

  .board-title { font-size: 16pt; font-weight: 700; margin: 5mm 0 2mm; }
  .time-badge { font-size: 10pt; color: #333; margin-bottom: 4mm; }

  .paper-ref {
    position: absolute; right: 10mm; top: 58mm;
    border: 1.5pt solid #000; padding: 2mm 4mm;
    display: flex; align-items: center; gap: 3mm;
  }
  .ref-label { font-size: 7.5pt; font-weight: 700; color: #333; line-height: 1.2; }
  .ref-code { font-size: 22pt; font-weight: 700; letter-spacing: 1px; }

  .subject-name { font-size: 26pt; font-weight: 700; margin: 2mm 0 1mm; }
  .level-tag { font-size: 12pt; font-weight: 700; color: #333; }
  .paper-name { font-size: 12pt; margin-bottom: 4mm; }

  .must-have-row {
    border: 0.8pt solid #aaa; padding: 3mm 5mm; margin: 4mm 0;
    display: flex; justify-content: space-between; align-items: flex-start;
    font-size: 9.5pt;
  }
  .must-have-left { flex: 1; }
  .total-marks-box {
    border: 0.8pt solid #aaa; padding: 2mm 4mm;
    text-align: center; font-size: 8pt; color: #333; min-width: 18mm;
  }

  .calc-warning { font-size: 9pt; font-weight: 700; margin: 3mm 0; line-height: 1.4; }

  .cover-section h3 { font-size: 10.5pt; font-weight: 700; margin: 3mm 0 1mm; }
  .cover-section ul { list-style: disc; padding-left: 5mm; font-size: 9pt; line-height: 1.45; }
  .cover-section li { margin: 0.8mm 0; }

  .set-note { font-size: 9pt; color: #666; text-align: center; margin-top: 4mm; font-style: italic; }
  .cover-turn-over { position: absolute; bottom: 8mm; right: 10mm; font-size: 9pt; font-weight: 700; }
`;

// ── OCR Cover Page ──────────────────────────────────────────────

function ocrCover(bp, questions, totalMarks, setLabel) {
  return `
  <div class="cover ocr-cover">
    <div class="ocr-logo">
      <div class="ocr-logo-text">OCR</div>
      <div class="ocr-logo-sub">Oxford Cambridge and RSA</div>
    </div>

    <div class="ocr-title-block">
      <div class="ocr-level">A Level ${bp.subject}</div>
      <div class="ocr-code"><b>${bp.code}</b>&ensp;${bp.title}</div>
      <div class="ocr-time"><b>Time allowed: ${bp.time}</b></div>
    </div>

    <div class="ocr-materials-box">
      <b>You must have:</b><br>
      &bull; ${bp.mustHave}<br>
      <b>You can use:</b><br>
      ${bp.canUse.map(c => `&bull; ${c}`).join("<br>")}
    </div>

    <div class="ocr-candidate-box">
      <div class="ocr-cand-note">Please write clearly in black ink. <b>Do not write in the barcodes.</b></div>
      <div class="ocr-cand-row">
        <div>Centre number <div class="num-boxes">${Array(5).fill('<div class="num-box"></div>').join("")}</div></div>
        <div>Candidate number <div class="num-boxes">${Array(4).fill('<div class="num-box"></div>').join("")}</div></div>
      </div>
      <div class="ocr-cand-field">First name(s)</div>
      <div class="ocr-cand-field">Last name</div>
    </div>

    <div class="cover-section">
      <h3>INSTRUCTIONS</h3>
      <ul>${bp.instructions.map(i => `<li>${i}</li>`).join("")}</ul>
    </div>
    <div class="cover-section">
      <h3>INFORMATION</h3>
      <ul>
        <li>The total mark for this paper is <b>${totalMarks}</b>.</li>
        ${bp.information.map(i => `<li>${i}</li>`).join("")}
        <li>This document has <b>${questions.length + 4}</b> pages.</li>
      </ul>
    </div>
    <div class="cover-section">
      <h3>ADVICE</h3>
      <ul>${bp.advice.map(i => `<li>${i}</li>`).join("")}</ul>
    </div>

    <div class="set-note">Practice Paper &mdash; ${setLabel}</div>
    <div class="ocr-footer">
      <span class="copyright">&copy; OCR Practice Paper</span>
      <span class="turn-over"><b>Turn over</b></span>
    </div>
  </div>`;
}

const OCR_CSS = `
  .ocr-cover {
    width: 210mm; min-height: 297mm;
    padding: 15mm 20mm 15mm;
    page-break-after: always;
    position: relative;
  }
  .ocr-logo { text-align: center; margin-bottom: 6mm; }
  .ocr-logo-text { font-size: 36pt; font-weight: 700; letter-spacing: 3px; }
  .ocr-logo-sub { font-size: 9pt; color: #555; }

  .ocr-title-block { margin: 6mm 0; }
  .ocr-level { font-size: 14pt; font-weight: 700; margin-bottom: 2mm; }
  .ocr-code { font-size: 11pt; margin-bottom: 2mm; }
  .ocr-time { font-size: 10pt; margin-bottom: 4mm; }

  .ocr-materials-box {
    border: 0.8pt solid #aaa; padding: 4mm 5mm;
    font-size: 9.5pt; margin-bottom: 5mm; line-height: 1.5;
  }

  .ocr-candidate-box {
    border: 0.8pt solid #aaa; padding: 4mm 5mm;
    font-size: 9pt; margin-bottom: 5mm;
  }
  .ocr-cand-note { margin-bottom: 3mm; }
  .ocr-cand-row { display: flex; gap: 12mm; margin-bottom: 3mm; }
  .ocr-cand-field { border-bottom: 0.5pt solid #ccc; padding: 1mm 0 4mm; margin-bottom: 2mm; font-size: 9pt; }

  .ocr-cover .cover-section h3 { font-size: 10.5pt; font-weight: 700; margin: 3mm 0 1mm; letter-spacing: 0.5px; }
  .ocr-cover .cover-section ul { list-style: disc; padding-left: 5mm; font-size: 9pt; line-height: 1.5; }
  .ocr-cover .cover-section li { margin: 0.8mm 0; }
  .ocr-cover .set-note { font-size: 9pt; color: #666; text-align: center; margin-top: 5mm; font-style: italic; }

  .ocr-footer {
    position: absolute; bottom: 12mm; left: 20mm; right: 20mm;
    display: flex; justify-content: space-between; font-size: 8.5pt;
  }
`;

// ── Answer lines & marks formatting ─────────────────────────────

function answerLines(count) {
  return '<div class="answer-lines">' +
    Array(count).fill('<div class="answer-line"></div>').join("") +
    '</div>';
}

function linesForMarks(marks) {
  if (marks <= 1) return 4;
  if (marks <= 2) return 7;
  if (marks <= 4) return 12;
  if (marks <= 6) return 18;
  if (marks <= 8) return 24;
  return 30;
}

function fmtMarks(marks, style) {
  return style === "ocr" ? `<b>[${marks}]</b>` : `<b>(${marks})</b>`;
}

function fmtTotalMarks(qNum, marks, style) {
  return style === "ocr"
    ? `[Total: ${marks}]`
    : `(Total for Question ${qNum} is ${marks} marks)`;
}

// ── Build Question Paper HTML ───────────────────────────────────

function buildQuestionPaperHTML(bp, questions, totalMarks, setLabel) {
  const style = bp.boardStyle;
  const coverHTML = style === "ocr"
    ? ocrCover(bp, questions, totalMarks, setLabel)
    : edexcelCover(bp, questions, totalMarks, setLabel);

  const questionPages = questions.map((q, i) => {
    const num = i + 1;
    const pageNum = num + 1; // page 1 is cover
    const parsed = parseQuestionParts(q.question_text);
    const diagram = q.diagram_svg ? `<div class="diagram">${q.diagram_svg}</div>` : "";
    const isLast = i === questions.length - 1;

    let bodyHTML = "";

    if (parsed.parts.length > 0) {
      bodyHTML += `<div class="q-stem">${renderLatex(parsed.stem)}</div>`;
      bodyHTML += diagram;
      for (const part of parsed.parts) {
        bodyHTML += `<div class="q-part"><div class="part-label">(${part.label})</div><div class="part-body">`;
        bodyHTML += `<div class="part-text">${renderLatex(part.text)}</div>`;
        if (part.subParts.length > 0) {
          for (const sub of part.subParts) {
            bodyHTML += `<div class="q-subpart"><div class="subpart-label">(${sub.label})</div><div class="subpart-body">`;
            bodyHTML += `<div class="subpart-text">${renderLatex(sub.text)}</div>`;
            bodyHTML += answerLines(linesForMarks(3));
            bodyHTML += `</div></div>`;
          }
        } else {
          bodyHTML += answerLines(linesForMarks(q.marks / Math.max(parsed.parts.length, 1)));
        }
        bodyHTML += `</div></div>`;
      }
    } else {
      bodyHTML += `<div class="q-stem">${renderLatex(parsed.stem)}</div>`;
      bodyHTML += diagram;
      bodyHTML += `<div class="q-marks">${fmtMarks(q.marks, style)}</div>`;
      bodyHTML += answerLines(linesForMarks(q.marks));
    }

    bodyHTML += `<div class="q-total">${fmtTotalMarks(num, q.marks, style)}</div>`;

    const copyright = style === "ocr" ? `&copy; OCR Practice` : `&copy; Pearson Education Ltd.`;
    const turnover = isLast ? "" : `<span class="turn-over">Turn over</span>`;

    return `
      <div class="question-page">
        <div class="page-num">${pageNum}</div>
        <div class="question">
          <div class="q-num"><b>${num}</b></div>
          <div class="q-body">${bodyHTML}</div>
        </div>
        <div class="page-footer">
          <span class="copyright">${copyright}</span>
          ${turnover}
        </div>
      </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<style>
  ${SHARED_CSS}
  ${EDEXCEL_CSS}
  ${OCR_CSS}
  .num-boxes { display: flex; gap: 1mm; margin-top: 2mm; }
  .num-box { width: 7.5mm; height: 9.5mm; border: 0.8pt solid #aaa; background: #f5f5f5; }
</style>
</head>
<body>
${coverHTML}
${questionPages}
<div class="end-page">
  <div class="end-total">TOTAL FOR PAPER: ${totalMarks} MARKS</div>
  <div class="end-text">END OF QUESTIONS</div>
</div>
<script>
  document.querySelectorAll('.katex-inline').forEach(el => {
    try { katex.render(el.dataset.latex, el, { throwOnError: false, displayMode: false }); }
    catch(e) { el.textContent = el.dataset.latex; }
  });
  document.querySelectorAll('.katex-display').forEach(el => {
    try { katex.render(el.dataset.latex, el, { throwOnError: false, displayMode: true }); }
    catch(e) { el.textContent = el.dataset.latex; }
  });
</script>
</body>
</html>`;
}

// ── Build Mark Scheme HTML ──────────────────────────────────────

function buildMarkSchemeHTML(bp, questions, totalMarks, setLabel) {
  const msPages = questions.map((q, i) => {
    const num = i + 1;
    const answer = renderLatex(q.answer || "");
    const criteria = (q.marking_criteria || []).map(c => {
      let html = escapeHtml(c);
      html = html.replace(/\$\$(.*?)\$\$/gs, (_, l) =>
        `<span class="katex-display" data-latex="${escapeAttr(l)}"></span>`);
      html = html.replace(/\$(.*?)\$/g, (_, l) =>
        `<span class="katex-inline" data-latex="${escapeAttr(l)}"></span>`);
      return html;
    });

    return `
      <div class="ms-q">
        <div class="ms-header">
          <span class="ms-qnum">Q${num}</span>
          <span class="ms-topic">${q.subtopic || ""}</span>
          <span class="ms-qmarks">${q.marks} marks</span>
        </div>
        <div class="ms-body">
          <div class="ms-answer">${answer}</div>
          ${criteria.length > 0 ? `<div class="ms-criteria">${criteria.map(c => `<div class="ms-point">${c}</div>`).join("")}</div>` : ""}
        </div>
      </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; color: #000; line-height: 1.5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  .ms-cover {
    width: 210mm; min-height: 297mm;
    padding: 35mm 25mm;
    page-break-after: always;
    display: flex; flex-direction: column; align-items: center;
  }
  .ms-cover .board { font-size: 15pt; font-weight: 700; margin-bottom: 6mm; color: #333; }
  .ms-cover .subject { font-size: 22pt; font-weight: 700; margin-bottom: 3mm; }
  .ms-cover .level { font-size: 12pt; color: #555; margin-bottom: 2mm; }
  .ms-cover .paper { font-size: 13pt; font-weight: 700; margin-bottom: 2mm; }
  .ms-cover .set { font-size: 10pt; color: #666; margin-bottom: 10mm; }
  .ms-cover .badge {
    font-size: 18pt; font-weight: 700; color: #fff; background: #222;
    padding: 4mm 14mm; letter-spacing: 2px; margin: 6mm 0;
  }
  .ms-cover .info { font-size: 10pt; color: #555; text-align: center; margin-top: 8mm; max-width: 140mm; line-height: 1.6; }

  .ms-content { padding: 12mm 18mm; }

  .ms-q { margin-bottom: 5mm; page-break-inside: avoid; border: 0.5pt solid #ddd; overflow: hidden; }
  .ms-header {
    display: flex; align-items: center; gap: 3mm;
    padding: 2.5mm 5mm; background: #f2f2f2; border-bottom: 0.5pt solid #ddd;
  }
  .ms-qnum { font-size: 11pt; font-weight: 700; min-width: 12mm; }
  .ms-topic { flex: 1; font-size: 8.5pt; color: #666; }
  .ms-qmarks { font-size: 10pt; font-weight: 700; }

  .ms-body { padding: 3mm 5mm; }
  .ms-answer {
    font-size: 9.5pt; line-height: 1.6; padding: 2mm 4mm;
    background: #fafafa; border-left: 2pt solid #4a90d9; margin-bottom: 2mm;
  }
  .ms-criteria { margin-top: 1mm; }
  .ms-point {
    font-size: 9pt; padding: 1.5mm 4mm; line-height: 1.5; color: #222;
    border-bottom: 0.3pt solid #eee;
  }

  .katex { font-size: 1em !important; }
</style>
</head>
<body>
<div class="ms-cover">
  <div class="board">${bp.board === "OCR" ? "OCR" : "Pearson Edexcel"} &mdash; A Level</div>
  <div class="subject">${bp.subject}</div>
  <div class="paper">${bp.title}</div>
  <div class="set">${setLabel} &mdash; Practice Paper</div>
  <div class="badge">MARK SCHEME</div>
  <div class="info">Total marks: <b>${totalMarks}</b></div>
</div>
<div class="ms-content">
${msPages}
</div>
<script>
  document.querySelectorAll('.katex-inline').forEach(el => {
    try { katex.render(el.dataset.latex, el, { throwOnError: false, displayMode: false }); }
    catch(e) { el.textContent = el.dataset.latex; }
  });
  document.querySelectorAll('.katex-display').forEach(el => {
    try { katex.render(el.dataset.latex, el, { throwOnError: false, displayMode: true }); }
    catch(e) { el.textContent = el.dataset.latex; }
  });
</script>
</body>
</html>`;
}

// ── Main Agent ───────────────────────────────────────────────────

async function renderPDF(context, html, outPath) {
  const page = await context.newPage();
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await page.pdf({
    path: outPath,
    format: "A4",
    margin: { top: "0", bottom: "0", left: "0", right: "0" },
    printBackground: true,
  });
  await page.close();
}

async function main() {
  const numSets = parseInt(process.argv[2]) || 3;
  const subjectArg = process.argv[3];

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  // Clean old files
  for (const f of fs.readdirSync(OUT_DIR)) {
    fs.unlinkSync(path.join(OUT_DIR, f));
  }

  console.log("Paper Generation Agent v2");
  console.log(`Generating ${numSets} sets per paper type\n`);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  let totalGenerated = 0;
  const manifest = [];

  const subjects = subjectArg ? [subjectArg] : Object.keys(BLUEPRINTS);

  for (const subject of subjects) {
    console.log(`\n=== ${subject} ===`);

    const dataPath = path.join(DATA_DIR, `A-Level-${subject}.json`);
    if (!fs.existsSync(dataPath)) {
      console.log(`  No data file for ${subject}, skipping`);
      continue;
    }
    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    const allQuestions = data.original_questions || [];
    console.log(`  Loaded ${allQuestions.length} questions`);

    for (const bp of (BLUEPRINTS[subject] || [])) {
      const usedIds = new Set();

      for (let set = 0; set < numSets; set++) {
        const setLabel = `Set ${String.fromCharCode(65 + set)}`;
        const safeTitle = bp.title.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-");
        const baseName = `${bp.board}-${subject}-${safeTitle}-Set${String.fromCharCode(65 + set)}`;
        const qpFile = `${baseName}-QP.pdf`;
        const msFile = `${baseName}-MS.pdf`;

        console.log(`\n  >> ${baseName}`);

        const { questions, totalMarks } = selectQuestions(allQuestions, bp, usedIds);
        if (questions.length < 5) {
          console.log(`  Skipping — only ${questions.length} questions`);
          continue;
        }

        // Question Paper
        const qpHTML = buildQuestionPaperHTML(bp, questions, totalMarks, setLabel);
        fs.writeFileSync(path.join(OUT_DIR, baseName + "-QP.html"), qpHTML);
        await renderPDF(context, qpHTML, path.join(OUT_DIR, qpFile));

        // Mark Scheme
        const msHTML = buildMarkSchemeHTML(bp, questions, totalMarks, setLabel);
        fs.writeFileSync(path.join(OUT_DIR, baseName + "-MS.html"), msHTML);
        await renderPDF(context, msHTML, path.join(OUT_DIR, msFile));

        console.log(`  Created: ${qpFile} + ${msFile} (${questions.length}Q, ${totalMarks}M)`);

        manifest.push({
          filename: qpFile,
          msFilename: msFile,
          board: bp.board,
          subject,
          title: bp.title,
          set: setLabel,
          marks: totalMarks,
          time: bp.time,
          url: `https://loekgdvqcybzmtgphcra.supabase.co/storage/v1/object/public/papers/generated/${qpFile}`,
          msUrl: `https://loekgdvqcybzmtgphcra.supabase.co/storage/v1/object/public/papers/generated/${msFile}`,
        });
        totalGenerated++;
      }
    }
  }

  await browser.close();

  const manifestPath = path.join(DATA_DIR, "generated-papers.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`\nDone! ${totalGenerated} paper packs generated.`);
  console.log(`Manifest: ${manifestPath}`);
  console.log(`\nUpload: node scripts/upload-generated-papers.js`);
}

main().catch(console.error);
