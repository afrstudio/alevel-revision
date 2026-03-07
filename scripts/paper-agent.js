/**
 * Smart Paper Generation Agent
 *
 * Reads the real question bank, intelligently selects questions matching
 * real Edexcel paper structure, renders with LaTeX + SVG diagrams,
 * and outputs professional exam-style PDFs.
 */

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const DATA_DIR = path.join(__dirname, "..", "public", "data");
const OUT_DIR = path.join(__dirname, "..", "generated-papers");

// ── Paper Blueprints (matches real Edexcel structure) ────────────

const BLUEPRINTS = {
  Maths: [
    {
      title: "Paper 1: Pure Mathematics",
      totalMarks: 100,
      time: "2 hours",
      board: "Edexcel",
      materials: "You should have a calculator and a formula booklet.",
      instructions: [
        "Use black ink or ball-point pen.",
        "Answer <b>all</b> questions.",
        "Answer the questions in the spaces provided — there may be more space than you need.",
        "You must show all your working. Answers without justification may not gain full marks.",
        "If your calculator does not have a π button, take the value of π to be 3.14159 to 5 d.p.",
      ],
      // Topic categories for this paper (Pure only)
      topicFilter: (topic) => {
        const pure = [
          "proof", "algebra", "function", "quadratic", "polynomial", "simultaneous",
          "inequalit", "graph", "transform", "trigonometr", "exponential", "logarithm",
          "differentiat", "integrat", "numerical method", "vector", "coordinate",
          "sequence", "series", "binomial", "partial fraction", "parametric",
          "differential equation", "iteration", "recurrence",
        ];
        const t = topic.toLowerCase();
        return pure.some(k => t.includes(k));
      },
      // Target marks distribution (sum to ~100)
      markTargets: [
        { min: 2, max: 4, count: 6 },   // 6 short questions ~18 marks
        { min: 5, max: 6, count: 5 },   // 5 medium questions ~27 marks
        { min: 7, max: 8, count: 4 },   // 4 longer questions ~30 marks
        { min: 9, max: 10, count: 2 },  // 2 extended questions ~19 marks
      ],
    },
    {
      title: "Paper 2: Statistics and Mechanics",
      totalMarks: 100,
      time: "2 hours",
      board: "Edexcel",
      materials: "You should have a calculator, the formulae booklet, and statistical tables.",
      instructions: [
        "Use black ink or ball-point pen.",
        "Answer <b>all</b> questions.",
        "A calculator <b>may</b> be used.",
        "You must show all your working. Answers without justification may not gain full marks.",
      ],
      topicFilter: (topic) => {
        const statsMech = [
          "statist", "sampling", "data", "probability", "distribution", "binomial dist",
          "normal", "hypothesis", "correlation", "regression", "poisson",
          "kinematic", "force", "newton", "moment", "projectile", "friction",
          "impulse", "momentum", "work", "energy", "power", "statics",
          "acceleration", "velocity", "displacement", "suvat", "resolving",
        ];
        const t = topic.toLowerCase();
        return statsMech.some(k => t.includes(k));
      },
      markTargets: [
        { min: 2, max: 4, count: 6 },
        { min: 5, max: 6, count: 5 },
        { min: 7, max: 8, count: 4 },
        { min: 9, max: 10, count: 2 },
      ],
    },
  ],
  Biology: [
    {
      title: "Paper 1: The Natural Environment and Species Survival",
      totalMarks: 80,
      time: "1 hour 45 minutes",
      board: "Edexcel",
      materials: "You should have a calculator.",
      instructions: [
        "Use black ink or ball-point pen.",
        "Answer <b>all</b> questions.",
        "Write your answers in the spaces provided.",
        "You must show all your working where appropriate.",
      ],
      topicFilter: () => true, // use all biology topics
      markTargets: [
        { min: 1, max: 2, count: 6 },
        { min: 3, max: 4, count: 8 },
        { min: 5, max: 6, count: 4 },
      ],
    },
  ],
  Chemistry: [
    {
      title: "Paper 1: Advanced Inorganic and Physical Chemistry",
      totalMarks: 90,
      time: "1 hour 45 minutes",
      board: "Edexcel",
      materials: "You should have a calculator and a data booklet.",
      instructions: [
        "Use black ink or ball-point pen.",
        "Answer <b>all</b> questions.",
        "A calculator <b>may</b> be used.",
        "You must show all your working where calculations are required.",
      ],
      topicFilter: () => true, // use all chemistry topics
      markTargets: [
        { min: 1, max: 2, count: 5 },
        { min: 3, max: 4, count: 7 },
        { min: 5, max: 6, count: 5 },
        { min: 7, max: 8, count: 2 },
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
  // Filter to relevant topics
  let pool = allQuestions.filter(q =>
    blueprint.topicFilter(q.subtopic || "") && !usedIds.has(q.id)
  );

  if (pool.length < 10) {
    // If topic filter is too restrictive, widen to all
    console.log(`  Warning: Only ${pool.length} questions match topic filter, widening pool`);
    pool = allQuestions.filter(q => !usedIds.has(q.id));
  }

  const selected = [];
  let totalMarks = 0;
  const usedTopics = new Set();

  // For each mark target band, select questions
  for (const target of blueprint.markTargets) {
    const candidates = shuffle(pool.filter(q =>
      q.marks >= target.min && q.marks <= target.max && !usedIds.has(q.id)
    ));

    let count = 0;
    for (const q of candidates) {
      if (count >= target.count) break;
      // Prefer topic diversity
      if (usedTopics.has(q.subtopic) && count > 0 && candidates.length > target.count * 2) continue;

      selected.push(q);
      usedIds.add(q.id);
      usedTopics.add(q.subtopic);
      totalMarks += q.marks;
      count++;
    }
  }

  // If we're under target marks, add more questions
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

  // Sort: easier/shorter first, harder/longer last (like real papers)
  const diffOrder = { easy: 0, medium: 1, hard: 2 };
  selected.sort((a, b) => {
    const da = diffOrder[a.difficulty] ?? 1;
    const db = diffOrder[b.difficulty] ?? 1;
    if (da !== db) return da - db;
    return a.marks - b.marks;
  });

  console.log(`  Selected ${selected.length} questions, total ${totalMarks} marks`);
  console.log(`  Topics covered: ${usedTopics.size}`);
  console.log(`  Difficulty: easy=${selected.filter(q=>q.difficulty==='easy').length} med=${selected.filter(q=>q.difficulty==='medium').length} hard=${selected.filter(q=>q.difficulty==='hard').length}`);
  console.log(`  With diagrams: ${selected.filter(q=>q.diagram_svg).length}`);

  return { questions: selected, totalMarks };
}

// ── LaTeX-aware HTML rendering ───────────────────────────────────

function escapeHtml(s) {
  if (typeof s !== "string") return String(s || "");
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderQuestionText(text) {
  if (!text) return "";
  // Split on LaTeX delimiters and render appropriately
  // Display math: $$...$$
  // Inline math: $...$
  let html = escapeHtml(text);

  // Convert \n to <br>
  html = html.replace(/\n/g, "<br>");

  // Display math: $$...$$
  html = html.replace(/\$\$(.*?)\$\$/gs, (_, latex) => {
    return `<span class="katex-display" data-latex="${escapeAttr(latex)}"></span>`;
  });

  // Inline math: $...$
  html = html.replace(/\$(.*?)\$/g, (_, latex) => {
    return `<span class="katex-inline" data-latex="${escapeAttr(latex)}"></span>`;
  });

  return html;
}

function escapeAttr(s) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderAnswer(text) {
  if (!text) return "";
  let html = escapeHtml(text);
  html = html.replace(/\n/g, "<br>");
  html = html.replace(/\$\$(.*?)\$\$/gs, (_, latex) => {
    return `<span class="katex-display" data-latex="${escapeAttr(latex)}"></span>`;
  });
  html = html.replace(/\$(.*?)\$/g, (_, latex) => {
    return `<span class="katex-inline" data-latex="${escapeAttr(latex)}"></span>`;
  });
  return html;
}

// ── HTML Template with KaTeX ─────────────────────────────────────

function buildPaperHTML(blueprint, questions, totalMarks, setLabel) {
  const questionsHTML = questions.map((q, i) => {
    const num = i + 1;
    const diagram = q.diagram_svg ? `<div class="diagram">${q.diagram_svg}</div>` : "";
    const qText = renderQuestionText(q.question_text);
    return `
      <div class="question">
        <div class="q-num">${num}.</div>
        <div class="q-body">
          ${diagram}
          <div class="q-text">${qText}</div>
          <div class="marks">(${q.marks})</div>
        </div>
      </div>`;
  }).join("");

  const markSchemeHTML = questions.map((q, i) => {
    const num = i + 1;
    const criteria = (q.marking_criteria || []).map(c => {
      let html = escapeHtml(c);
      html = html.replace(/\$(.*?)\$/g, (_, latex) => {
        return `<span class="katex-inline" data-latex="${escapeAttr(latex)}"></span>`;
      });
      return `<div class="ms-point">${html}</div>`;
    }).join("");

    const answer = renderAnswer(q.answer);

    return `
      <div class="ms-question">
        <h3>Question ${num} [${q.marks} marks] — ${q.subtopic || "General"}</h3>
        <div class="ms-answer">${answer}</div>
        ${criteria ? `<div class="ms-criteria"><b>Marking Points:</b>${criteria}</div>` : ""}
      </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<style>
  @page { size: A4; margin: 2cm; }
  * { box-sizing: border-box; }
  body { font-family: 'Times New Roman', Georgia, serif; font-size: 11.5pt; color: #111; line-height: 1.55; }

  /* Cover page */
  .cover { text-align: center; padding-top: 50px; page-break-after: always; }
  .cover .board { font-size: 11pt; color: #555; text-transform: uppercase; letter-spacing: 3px; text-align: right; font-weight: 600; }
  .cover h1 { font-size: 13pt; color: #555; margin-top: 50px; font-weight: normal; letter-spacing: 1px; }
  .cover h2 { font-size: 26pt; margin: 8px 0; letter-spacing: 1px; }
  .cover h3 { font-size: 15pt; font-weight: normal; margin: 6px 0; }
  .cover .set-label { font-size: 12pt; color: #888; margin-top: 4px; }
  .cover .time { font-size: 12pt; color: #555; margin-top: 25px; }

  .info-box { border: 1.5px solid #888; padding: 16px 22px; margin-top: 35px; text-align: left; font-size: 10pt; }
  .info-box h4 { margin: 10px 0 4px; font-size: 10.5pt; text-transform: uppercase; letter-spacing: 0.5px; }
  .info-box ul { margin: 2px 0 8px; padding-left: 18px; }
  .info-box li { margin: 2px 0; line-height: 1.4; }

  /* Questions */
  .questions-section { page-break-before: always; }
  .section-note { font-size: 10.5pt; color: #555; font-style: italic; margin-bottom: 18px; }

  .question { display: flex; gap: 8px; margin-bottom: 24px; page-break-inside: avoid; }
  .q-num { font-weight: bold; min-width: 26px; font-size: 11.5pt; padding-top: 1px; }
  .q-body { flex: 1; }
  .q-text { margin-bottom: 4px; }
  .marks { color: #555; font-weight: bold; font-size: 10.5pt; margin-top: 4px; text-align: right; }

  .diagram { margin: 10px 0; max-width: 100%; }
  .diagram svg { max-width: 100%; height: auto; max-height: 250px; }

  .total { text-align: center; font-weight: bold; font-size: 13pt; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; }
  .end { text-align: center; color: #888; font-size: 10.5pt; margin-top: 8px; }

  /* Mark scheme */
  .ms-page { page-break-before: always; }
  .ms-page h2 { text-align: center; font-size: 20pt; margin-bottom: 4px; }
  .ms-page .subtitle { text-align: center; color: #555; font-size: 10.5pt; margin-bottom: 25px; }
  .ms-question { margin-bottom: 20px; page-break-inside: avoid; }
  .ms-question h3 { font-size: 11pt; margin: 0 0 6px; border-bottom: 1px solid #ddd; padding-bottom: 4px; color: #333; }
  .ms-answer { font-size: 10pt; margin: 4px 0 8px 12px; color: #222; line-height: 1.5; }
  .ms-criteria { margin: 4px 0 0 12px; }
  .ms-point { font-size: 9.5pt; margin: 3px 0; color: #444; padding-left: 8px; border-left: 2px solid #ddd; }

  /* KaTeX overrides */
  .katex { font-size: 1em !important; }
  .katex-display .katex { font-size: 1.1em !important; }
</style>
</head>
<body>

<div class="cover">
  <div class="board">${blueprint.board}</div>
  <h1>A-level</h1>
  <h2>${blueprint.board === "Edexcel" ? "MATHEMATICS" : blueprint.title.split(":")[0].toUpperCase()}</h2>
  <h3>${blueprint.title}</h3>
  <div class="set-label">${setLabel}</div>
  <div class="time">Time allowed: ${blueprint.time}</div>

  <div class="info-box">
    <h4>Materials</h4>
    <ul><li>${blueprint.materials}</li></ul>
    <h4>Instructions</h4>
    <ul>${blueprint.instructions.map(i => `<li>${i}</li>`).join("")}</ul>
    <h4>Information</h4>
    <ul>
      <li>The total mark for this paper is <b>${totalMarks}</b>.</li>
      <li>The marks for each question are shown in brackets.</li>
    </ul>
  </div>
</div>

<div class="questions-section">
  <p class="section-note">Answer ALL questions. Write your answers in the spaces provided.</p>
  ${questionsHTML}
  <div class="total">TOTAL FOR PAPER: ${totalMarks} MARKS</div>
  <div class="end">END OF QUESTIONS</div>
</div>

<div class="ms-page">
  <h2>MARK SCHEME</h2>
  <div class="subtitle">${blueprint.title} — ${setLabel}</div>
  ${markSchemeHTML}
</div>

<script>
  // Render all KaTeX elements
  document.querySelectorAll('.katex-inline').forEach(el => {
    try {
      katex.render(el.dataset.latex, el, { throwOnError: false, displayMode: false });
    } catch(e) { el.textContent = el.dataset.latex; }
  });
  document.querySelectorAll('.katex-display').forEach(el => {
    try {
      katex.render(el.dataset.latex, el, { throwOnError: false, displayMode: true });
    } catch(e) { el.textContent = el.dataset.latex; }
  });
</script>
</body>
</html>`;
}

// ── Main Agent ───────────────────────────────────────────────────

async function main() {
  const numSets = parseInt(process.argv[2]) || 3;
  const subjectArg = process.argv[3]; // optional: "Maths", "Biology", "Chemistry"

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`Paper Generation Agent`);
  console.log(`Generating ${numSets} sets per paper type\n`);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  let totalGenerated = 0;

  const subjects = subjectArg ? [subjectArg] : Object.keys(BLUEPRINTS);

  for (const subject of subjects) {
    console.log(`\n=== ${subject} ===`);

    // Load question bank
    const dataPath = path.join(DATA_DIR, `A-Level-${subject}.json`);
    if (!fs.existsSync(dataPath)) {
      console.log(`  No data file for ${subject}, skipping`);
      continue;
    }
    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    const allQuestions = data.original_questions || [];
    console.log(`  Loaded ${allQuestions.length} questions from bank`);

    const blueprints = BLUEPRINTS[subject] || [];

    for (const blueprint of blueprints) {
      const usedIds = new Set(); // Track used questions across sets for this paper type

      for (let set = 0; set < numSets; set++) {
        const setLabel = `Set ${String.fromCharCode(65 + set)}`;
        const safeTitle = blueprint.title.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-");
        const filename = `${blueprint.board}-${subject}-${safeTitle}-Set${String.fromCharCode(65 + set)}.pdf`;

        console.log(`\n  Generating: ${filename}`);

        // Smart selection
        const { questions, totalMarks } = selectQuestions(allQuestions, blueprint, usedIds);

        if (questions.length < 5) {
          console.log(`  Skipping — not enough questions (only ${questions.length})`);
          continue;
        }

        // Build HTML
        const html = buildPaperHTML(blueprint, questions, totalMarks, setLabel);

        // Save HTML for debugging
        const htmlPath = path.join(OUT_DIR, filename.replace(".pdf", ".html"));
        fs.writeFileSync(htmlPath, html);

        // Render PDF
        const page = await context.newPage();
        await page.setContent(html, { waitUntil: "networkidle" });

        // Wait for KaTeX to render
        await page.waitForTimeout(2000);

        await page.pdf({
          path: path.join(OUT_DIR, filename),
          format: "A4",
          margin: { top: "2cm", bottom: "2cm", left: "2cm", right: "2cm" },
          printBackground: true,
        });
        await page.close();

        console.log(`  Created: ${filename} (${questions.length} questions, ${totalMarks} marks)`);
        totalGenerated++;
      }
    }
  }

  await browser.close();

  // Generate manifest
  const pdfs = fs.readdirSync(OUT_DIR).filter(f => f.endsWith(".pdf"));
  const manifest = pdfs.map(f => {
    const parts = f.replace(".pdf", "").split("-");
    // Parse: Board-Subject-Title-parts-SetX
    const board = parts[0];
    const subject = parts[1];
    const setMatch = f.match(/Set([A-Z])\.pdf$/);
    const set = setMatch ? `Set ${setMatch[1]}` : "Set A";
    const titleParts = parts.slice(2, -1).join(" ").replace(/Set [A-Z]$/, "").trim();

    // Find matching blueprint for marks/time
    const bp = (BLUEPRINTS[subject] || []).find(b => {
      const safeT = b.title.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-");
      return f.includes(safeT);
    });

    return {
      filename: f,
      board,
      subject,
      title: bp?.title || titleParts,
      set,
      marks: bp?.totalMarks || 100,
      time: bp?.time || "2 hours",
      url: `https://loekgdvqcybzmtgphcra.supabase.co/storage/v1/object/public/papers/generated/${f}`,
    };
  });

  const manifestPath = path.join(DATA_DIR, "generated-papers.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`\nDone! Generated ${totalGenerated} papers.`);
  console.log(`Manifest: ${manifestPath}`);
  console.log(`\nRun: node scripts/upload-generated-papers.js to upload to Supabase`);
}

main().catch(console.error);
