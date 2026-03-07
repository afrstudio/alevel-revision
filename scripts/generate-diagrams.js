/**
 * Build script: Generate SVG diagrams from text descriptions using Gemini API.
 * Run once to populate diagram_svg fields in the data JSON files.
 *
 * Usage: node scripts/generate-diagrams.js
 * Requires: GEMINI_API_KEY in .env.local
 */

const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKey = envContent.match(/GEMINI_API_KEY=(.+)/)?.[1]?.trim();

if (!apiKey) {
  console.error('No GEMINI_API_KEY found in .env.local');
  process.exit(1);
}

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

async function generateSVG(diagramText, questionText, subject) {
  const prompt = `You are an expert at creating clean, educational SVG diagrams for A-Level ${subject} exam questions.

Given this diagram description, create a clean, clear SVG diagram suitable for an exam paper.

Question context: "${questionText.slice(0, 300)}"

Diagram description: "${diagramText}"

Requirements:
- Return ONLY valid SVG code, nothing else
- Use a viewBox of "0 0 400 300" (or adjust if needed for tables: "0 0 500 400")
- White background
- Use clean, readable fonts (font-family: system-ui, sans-serif)
- Use black/dark gray for lines and text
- Use light blue (#e3f2fd) or light gray (#f5f5f5) for fills where appropriate
- For tables: use proper grid lines, header row with light background
- For graphs: include labeled axes, grid lines, and clear curve/line rendering
- For physics diagrams: use clear arrows for forces, dashed lines for components
- Keep it simple and exam-style — no decorative elements
- All text must be readable at the rendered size
- Do NOT include any XML declaration or DOCTYPE — just the <svg> tag`;

  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 8000, thinkingConfig: { thinkingBudget: 0 } },
  };

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  // Gemini 2.5 Flash may return multiple parts (thinking + text)
  const parts = data.candidates?.[0]?.content?.parts || [];
  const allText = parts.map(p => p.text || '').join('\n');

  // Extract SVG from response (might be wrapped in markdown fences)
  const svgMatch = allText.match(/<svg[\s\S]*?<\/svg>/);
  if (!svgMatch) {
    console.warn('  No valid SVG found in response');
    return null;
  }

  return svgMatch[0];
}

async function processSubject(subjectName) {
  const filePath = path.join(__dirname, '..', 'public', 'data', `A-Level-${subjectName}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const oqs = data.original_questions || [];

  let updated = 0;

  for (let i = 0; i < oqs.length; i++) {
    const q = oqs[i];
    if (!q.diagram || q.diagram === 'Null' || q.diagram === 'null' || !q.diagram.trim()) continue;
    if (q.diagram_svg) {
      console.log(`  [${subjectName}] Skipping "${q.subtopic}" — already has SVG`);
      continue;
    }

    console.log(`  [${subjectName}] Generating SVG for "${q.subtopic}" (${q.difficulty}, ${q.marks}m)...`);

    try {
      const svg = await generateSVG(q.diagram, q.question_text, subjectName);
      if (svg) {
        oqs[i].diagram_svg = svg;
        updated++;
        console.log(`    Done (${svg.length} chars)`);
      }
    } catch (err) {
      console.error(`    Error: ${err.message}`);
    }

    // Rate limit: 200ms between calls
    await new Promise(r => setTimeout(r, 200));
  }

  if (updated > 0) {
    data.original_questions = oqs;
    fs.writeFileSync(filePath, JSON.stringify(data));
    console.log(`  [${subjectName}] Updated ${updated} questions with SVG diagrams`);
  } else {
    console.log(`  [${subjectName}] No updates needed`);
  }
}

async function main() {
  console.log('Generating SVG diagrams from text descriptions...\n');

  for (const subject of ['Maths', 'Biology', 'Chemistry']) {
    console.log(`Processing ${subject}...`);
    await processSubject(subject);
    console.log();
  }

  console.log('Done!');
}

main().catch(console.error);
