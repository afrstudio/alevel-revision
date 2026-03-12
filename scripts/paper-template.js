/**
 * Shared HTML template and PDF generator for A-Level papers.
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const OUT_DIR = path.join(__dirname, "..", "generated-papers");

function buildHTML(paper) {
  const questionsHTML = paper.questions.map((q, qi) => {
    const num = qi + 1;
    if (q.parts) {
      const partsHTML = q.parts.map((p, pi) => {
        const letter = String.fromCharCode(97 + pi);
        return `<div class="part"><span class="part-label">(${letter})</span><span class="part-text">${p.text}</span><span class="marks">(${p.marks})</span></div>`;
      }).join("");
      return `<div class="question"><div class="q-num">${num}.</div><div class="q-body">${q.intro ? `<p class="intro">${q.intro}</p>` : ""}${partsHTML}</div></div>`;
    } else {
      return `<div class="question"><div class="q-num">${num}.</div><div class="q-body"><p>${q.text}</p><span class="marks">(${q.marks})</span></div></div>`;
    }
  }).join("");

  const msHTML = paper.questions.map((q, qi) => {
    const num = qi + 1;
    let content = "";
    if (q.ms) {
      content = q.ms.map(m => `<div class="ms-point">${m}</div>`).join("");
    }
    if (q.parts) {
      content += q.parts.map((p, pi) => {
        const letter = String.fromCharCode(97 + pi);
        const points = (p.ms || []).map(m => `<div class="ms-point">${m}</div>`).join("");
        return `<div class="ms-part"><b>(${letter})</b> [${p.marks} marks]${points}</div>`;
      }).join("");
    }
    return `<div class="ms-question"><h3>Question ${num}${q.marks ? ` [${q.marks} marks]` : ""}</h3>${content}</div>`;
  }).join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { size: A4; margin: 2cm; }
  * { box-sizing: border-box; }
  body { font-family: 'Times New Roman', Georgia, serif; font-size: 12pt; color: #111; line-height: 1.5; }

  .cover { text-align: center; padding-top: 60px; page-break-after: always; }
  .cover .board { font-size: 11pt; color: #666; text-transform: uppercase; letter-spacing: 2px; text-align: right; }
  .cover h1 { font-size: 14pt; color: #555; margin-top: 60px; font-weight: normal; }
  .cover h2 { font-size: 28pt; margin: 5px 0; }
  .cover h3 { font-size: 16pt; font-weight: normal; }
  .cover .time { font-size: 12pt; color: #555; margin-top: 30px; }

  .info-box { border: 1px solid #999; padding: 15px 20px; margin-top: 40px; text-align: left; font-size: 10.5pt; }
  .info-box h4 { margin: 10px 0 5px; font-size: 11pt; }
  .info-box ul { margin: 3px 0; padding-left: 20px; }
  .info-box li { margin: 2px 0; }

  .questions { page-break-before: always; }
  .section-note { font-size: 11pt; color: #555; font-style: italic; margin-bottom: 20px; }

  .question { display: flex; gap: 8px; margin-bottom: 22px; page-break-inside: avoid; }
  .q-num { font-weight: bold; min-width: 24px; font-size: 12pt; }
  .q-body { flex: 1; }
  .q-body p { margin: 0 0 6px; }
  .intro { margin-bottom: 10px !important; }

  .part { display: flex; gap: 6px; margin: 8px 0; align-items: flex-start; }
  .part-label { font-weight: normal; min-width: 28px; }
  .part-text { flex: 1; }
  .marks { color: #555; font-weight: bold; font-size: 11pt; white-space: nowrap; margin-left: 10px; }

  table { border-collapse: collapse; margin: 8px 0; }
  th, td { border: 1px solid #999; padding: 4px 12px; text-align: center; font-size: 11pt; }
  th { background: #f0f0f0; }

  .ms-page { page-break-before: always; }
  .ms-page h2 { text-align: center; font-size: 22pt; margin-bottom: 5px; }
  .ms-page .subtitle { text-align: center; color: #555; margin-bottom: 30px; }
  .ms-question { margin-bottom: 18px; page-break-inside: avoid; }
  .ms-question h3 { font-size: 12pt; margin: 0 0 4px; border-bottom: 1px solid #ddd; padding-bottom: 3px; }
  .ms-point { font-size: 10.5pt; margin: 2px 0 2px 15px; color: #333; }
  .ms-part { margin: 6px 0 6px 10px; }

  .total { text-align: center; font-weight: bold; font-size: 14pt; margin-top: 40px; }
  .end { text-align: center; color: #999; font-size: 11pt; margin-top: 10px; }
</style>
</head>
<body>

<div class="cover">
  <div class="board">${paper.board}</div>
  <h1>A-level</h1>
  <h2>${paper.subject.toUpperCase()}</h2>
  <h3>${paper.title} &mdash; ${paper.set}</h3>
  <div class="time">Time allowed: ${paper.time}</div>

  <div class="info-box">
    <h4>Materials</h4>
    <ul><li>${paper.materials || "You should have a calculator and a formula booklet."}</li></ul>
    <h4>Instructions</h4>
    <ul>${paper.instructions.map(i => `<li>${i}</li>`).join("")}</ul>
    <h4>Information</h4>
    <ul>
      <li>The total mark for this paper is <b>${paper.totalMarks}</b>.</li>
      <li>The marks for each question are shown in brackets.</li>
    </ul>
  </div>
</div>

<div class="questions">
  <p class="section-note">Answer ALL questions.</p>
  ${questionsHTML}
  <div class="total">TOTAL FOR PAPER: ${paper.totalMarks} MARKS</div>
  <div class="end">END OF QUESTIONS</div>
</div>

<div class="ms-page">
  <h2>MARK SCHEME</h2>
  <div class="subtitle">${paper.subject} &mdash; ${paper.title} &mdash; ${paper.set}</div>
  ${msHTML}
</div>

</body>
</html>`;
}

async function generatePapers(papers) {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext();

  for (const paper of papers) {
    console.log(`Generating ${paper.filename}...`);
    const html = buildHTML(paper);
    fs.writeFileSync(path.join(OUT_DIR, paper.filename.replace(".pdf", ".html")), html);

    const page = await context.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.pdf({
      path: path.join(OUT_DIR, paper.filename),
      format: "A4",
      margin: { top: "2cm", bottom: "2cm", left: "2cm", right: "2cm" },
      printBackground: true,
    });
    await page.close();
    console.log(`  Created: ${paper.filename}`);
  }

  await browser.close();
  console.log(`\nDone! ${papers.length} papers saved in generated-papers/`);
}

module.exports = { buildHTML, generatePapers, OUT_DIR };
