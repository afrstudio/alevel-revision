import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string; thought?: boolean }>;
    };
  }>;
  error?: { message?: string };
}

// Grade boundaries for A-Level
const GRADE_BOUNDARIES = [
  { grade: "A*", min: 85 },
  { grade: "A", min: 70 },
  { grade: "B", min: 60 },
  { grade: "C", min: 50 },
  { grade: "D", min: 40 },
  { grade: "E", min: 30 },
  { grade: "U", min: 0 },
];

function getGrade(percentage: number): string {
  for (const b of GRADE_BOUNDARIES) {
    if (percentage >= b.min) return b.grade;
  }
  return "U";
}

// Load rubric examples from local data for context
interface RubricExample {
  question_text: string;
  marks: number;
  answer: string;
  marking_criteria: string[];
  subtopic: string;
}

let rubricCache: Record<string, RubricExample[]> = {};

function loadRubricExamples(subject: string): RubricExample[] {
  if (rubricCache[subject]) return rubricCache[subject];
  try {
    const filePath = join(process.cwd(), "public", "data", `A-Level-${subject}.json`);
    const raw = readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    const examples = (data.original_questions || []).map((q: Record<string, unknown>) => ({
      question_text: q.question_text as string,
      marks: q.marks as number,
      answer: q.answer as string,
      marking_criteria: q.marking_criteria as string[],
      subtopic: q.subtopic as string,
    }));
    rubricCache[subject] = examples;
    return examples;
  } catch {
    return [];
  }
}

function findRelevantRubric(subject: string, marks: number, questionContext?: string): string {
  const examples = loadRubricExamples(subject);
  if (examples.length === 0) return "";

  // Find questions with similar marks
  let relevant = examples.filter(
    (e) => e.marks >= Math.max(1, marks - 1) && e.marks <= marks + 1
  );

  // If question context provided, try to match topic keywords
  if (questionContext && relevant.length > 3) {
    const keywords = questionContext.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
    const scored = relevant.map((e) => {
      const text = `${e.question_text} ${e.subtopic}`.toLowerCase();
      const matchCount = keywords.filter((k) => text.includes(k)).length;
      return { example: e, score: matchCount };
    });
    scored.sort((a, b) => b.score - a.score);
    relevant = scored.slice(0, 3).map((s) => s.example);
  } else {
    relevant = relevant.slice(0, 3);
  }

  if (relevant.length === 0) return "";

  const sections = relevant.map((ex, i) => {
    const criteria = ex.marking_criteria.map((c) => `    - ${c}`).join("\n");
    return `  Example ${i + 1} (${ex.marks} marks, Topic: ${ex.subtopic}):
    Q: ${ex.question_text.slice(0, 250)}
    Model Answer: ${(ex.answer || "").slice(0, 350)}
    Marking Criteria:
${criteria}`;
  }).join("\n\n");

  return `
MARKING REFERENCES (from ${subject} past papers with similar marks):
${sections}`;
}

async function callGemini(
  apiKey: string,
  contents: Array<{ role?: string; parts: Array<Record<string, unknown>> }>,
  config?: { temperature?: number; maxOutputTokens?: number }
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: config?.temperature ?? 0.1,
      maxOutputTokens: config?.maxOutputTokens ?? 8192,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data: GeminiResponse = await response.json();

  if (data.error) {
    throw new Error(`Gemini API error: ${data.error.message || "Unknown error"}`);
  }

  // Gemini 2.5 Flash may return thinking parts — filter them out
  const parts = data.candidates?.[0]?.content?.parts || [];
  const text = parts
    .filter((p: { text?: string; thought?: boolean }) => !p.thought)
    .map((p: { text?: string }) => p.text || "")
    .join("\n")
    .trim();
  if (!text) throw new Error("Gemini returned an empty response");
  return text;
}

function extractBase64(image: string): { mimeType: string; data: string } {
  if (image.startsWith("data:")) {
    const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
    if (match) return { mimeType: match[1], data: match[2] };
    const commaIndex = image.indexOf(",");
    return {
      mimeType: "image/jpeg",
      data: commaIndex >= 0 ? image.slice(commaIndex + 1) : image,
    };
  }
  return { mimeType: "image/jpeg", data: image };
}

function parseJsonResponse(text: string): Record<string, unknown> {
  // Direct parse
  try { return JSON.parse(text); } catch { /* continue */ }

  // Extract from markdown fences or braces
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  let str = match ? match[1].trim() : text.trim();

  try { return JSON.parse(str); } catch { /* continue */ }

  // Fix trailing commas
  str = str.replace(/,\s*([\]}])/g, "$1");
  try { return JSON.parse(str); } catch { /* continue */ }

  // Fix newlines inside strings
  const out: string[] = [];
  let inString = false;
  let escaped = false;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (escaped) { out.push(ch); escaped = false; continue; }
    if (ch === "\\") { out.push(ch); escaped = true; continue; }
    if (ch === '"') { inString = !inString; out.push(ch); continue; }
    if (inString) {
      if (ch === "\n") { out.push("\\n"); continue; }
      if (ch === "\r") { out.push("\\r"); continue; }
      if (ch === "\t") { out.push("\\t"); continue; }
    }
    out.push(ch);
  }
  return JSON.parse(out.join(""));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, subject, questionContext, marks: requestedMarks } = body;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        error: "No marking API configured. Set GEMINI_API_KEY in .env.local",
        score: 0,
        totalMarks: 0,
        extracted_answer: "",
        feedback: "Marking API not configured. Add GEMINI_API_KEY to your .env.local file.",
        correct_answer: "",
        model_answer: "",
        grade: "U",
        criteriaMatched: [],
        criteriaMissed: [],
        improvements: [],
      }, { status: 200 });
    }

    const { mimeType, data } = extractBase64(image);
    const marks = requestedMarks || 5;

    // Step 1: OCR - Extract text from image (temperature 0 for accuracy)
    const ocrText = await callGemini(apiKey, [
      {
        role: "user",
        parts: [
          { text: "Read ALL text from this image, whether handwritten, printed, or typed. Return ONLY the text content exactly as written. Do not add any commentary, corrections, labels, or formatting." },
          { inline_data: { mime_type: mimeType, data } },
        ],
      },
    ], { temperature: 0, maxOutputTokens: 500 });

    if (!ocrText.trim()) {
      return NextResponse.json({
        error: "Could not read any text from the image. Please try a clearer photo.",
        score: 0,
        totalMarks: marks,
        extracted_answer: "",
        feedback: "No text could be extracted. Try taking a clearer photo with good lighting.",
        grade: "U",
        criteriaMatched: [],
        criteriaMissed: [],
        improvements: ["Take a clearer photo", "Ensure good lighting and contrast"],
      }, { status: 200 });
    }

    // Get rubric context from local exam data
    const rubricContext = findRelevantRubric(subject, marks, questionContext);

    // Step 2: Grade with rubric-aware prompt
    const questionInfo = questionContext
      ? `Question: "${questionContext}"`
      : "(Question not provided - infer from the student's answer)";

    const gradingPrompt = `You are a strict UK A-Level ${subject} examiner. Mark strictly and fairly according to real A-Level standards.

${questionInfo}

Student's answer (extracted from handwriting):
"${ocrText}"

Worth ${marks} marks.
${rubricContext}

Instructions:
- Award marks strictly according to UK A-Level ${subject} marking standards
- For Maths: check method marks (M), accuracy marks (A), and reasoning marks (R)
- For Biology/Chemistry: check required terminology, depth of explanation, and named examples
- Identify specific criteria met and missed
- Provide the correct answer and a model full-marks answer
- Give specific, actionable improvements

KEEP ALL RESPONSES CONCISE:
- feedback: MAX 3 sentences, focus on what was wrong and why
- correct_answer: MAX 60 words
- model_answer: MAX 100 words
- improvements: 2-3 tips, each under 20 words
- No markdown formatting. Plain text only.

Return ONLY valid JSON:
{
  "extracted_answer": "<the student's extracted text>",
  "score": <integer 0-${marks}>,
  "totalMarks": ${marks},
  "percentage": <integer 0-100>,
  "feedback": "<examiner feedback>",
  "correct_answer": "<the correct answer>",
  "model_answer": "<a full-marks model answer>",
  "what_went_wrong": ["<specific issue>"],
  "criteriaMatched": ["<criterion met>"],
  "criteriaMissed": ["<criterion missed>"],
  "improvements": ["<actionable tip>"]
}`;

    const gradingResponse = await callGemini(apiKey, [
      { role: "user", parts: [{ text: gradingPrompt }] },
    ], { temperature: 0.1, maxOutputTokens: 2000 });

    let parsed: Record<string, unknown>;
    try {
      parsed = parseJsonResponse(gradingResponse);
    } catch {
      // Retry: ask Gemini to fix its own broken JSON
      try {
        const fixedJson = await callGemini(apiKey, [
          { role: "user", parts: [{ text: `Fix this broken JSON. Return ONLY the corrected JSON object:\n\n${gradingResponse}` }] },
        ], { temperature: 0, maxOutputTokens: 2000 });
        parsed = parseJsonResponse(fixedJson);
      } catch {
        return NextResponse.json({
          extracted_answer: ocrText,
          score: 0,
          totalMarks: marks,
          feedback: gradingResponse,
          correct_answer: "",
          model_answer: "",
          grade: "U",
          criteriaMatched: [],
          criteriaMissed: [],
          improvements: [],
        });
      }
    }

    // Enforce valid score range and calculate grade
    const score = Math.min(Math.max(0, Number(parsed.score) || 0), marks);
    const percentage = marks > 0 ? Math.round((score / marks) * 100) : 0;
    const grade = getGrade(percentage);

    return NextResponse.json({
      extracted_answer: (parsed.extracted_answer as string) || ocrText,
      score,
      totalMarks: marks,
      percentage,
      grade,
      feedback: (parsed.feedback as string) || "",
      correct_answer: (parsed.correct_answer as string) || "",
      model_answer: (parsed.model_answer as string) || "",
      what_went_wrong: Array.isArray(parsed.what_went_wrong) ? parsed.what_went_wrong : [],
      criteriaMatched: Array.isArray(parsed.criteriaMatched) ? parsed.criteriaMatched : [],
      criteriaMissed: Array.isArray(parsed.criteriaMissed) ? parsed.criteriaMissed : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
    });
  } catch (error) {
    console.error("Marking error:", error);
    const message = error instanceof Error ? error.message : "Failed to process marking request";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
