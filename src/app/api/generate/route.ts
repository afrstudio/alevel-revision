import { NextRequest, NextResponse } from "next/server";

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string; thought?: boolean }>;
    };
  }>;
  error?: { message?: string };
}

async function callGemini(
  apiKey: string,
  prompt: string,
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 8192 },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data: GeminiResponse = await response.json();
  if (data.error) throw new Error(`Gemini: ${data.error.message}`);

  // Gemini 2.5 Flash may return thinking parts — filter them out
  const parts = data.candidates?.[0]?.content?.parts || [];
  const text = parts
    .filter((p) => !p.thought)
    .map((p) => p.text || "")
    .join("\n")
    .trim();
  if (!text) throw new Error("Gemini returned empty response");
  return text;
}

function parseJson(text: string): Record<string, unknown> {
  try { return JSON.parse(text); } catch { /* continue */ }
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  const str = match ? match[1].trim() : text.trim();
  try { return JSON.parse(str); } catch { /* continue */ }
  return JSON.parse(str.replace(/,\s*([\]}])/g, "$1"));
}

export async function POST(request: NextRequest) {
  try {
    const { subject, topic, board } = await request.json();

    if (!subject) {
      return NextResponse.json({ error: "Subject required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 },
      );
    }

    const boardContext = board && board !== "all" ? `for the ${board} exam board` : "";
    const topicContext = topic && topic !== "all" ? `on the topic "${topic}"` : "";

    const prompt = `You are an expert UK A-Level ${subject} examiner. Generate ONE challenging, exam-style written question ${topicContext} ${boardContext}.

Requirements:
- This must be a HARD question — the kind that separates A/A* students from the rest
- It should test deep understanding, application, and analysis — not just recall
- Use the style and language of real UK A-Level ${subject} exam papers
- For Maths: multi-step problems requiring linked reasoning, proofs, or modelling
- For Biology: questions requiring extended writing, linking concepts across topics, or evaluating experimental methods
- For Chemistry: questions requiring calculations with multiple steps, mechanism explanations, or synoptic links
- Worth 4-6 marks
- Include clear, specific marking criteria (one per mark)

Return ONLY valid JSON in this exact format:
{
  "question_text": "<the full question text, use LaTeX notation like \\frac{}{} for maths>",
  "marks": <integer 4-6>,
  "answer": "<a complete model answer>",
  "marking_criteria": ["<M1: criterion>", "<M2: criterion>", ...],
  "subtopic": "<the specific subtopic>",
  "difficulty": "hard"
}`;

    const response = await callGemini(apiKey, prompt);
    const parsed = parseJson(response);

    return NextResponse.json({
      id: `gen-${Date.now()}`,
      question_text: parsed.question_text as string || "",
      marks: Number(parsed.marks) || 5,
      answer: parsed.answer as string || "",
      marking_criteria: Array.isArray(parsed.marking_criteria) ? parsed.marking_criteria : [],
      subtopic: (parsed.subtopic as string) || topic || "Generated",
      difficulty: "hard",
      boards: board && board !== "all" ? [board] : ["AQA", "Edexcel", "OCR"],
      diagram: null,
      diagram_svg: null,
      diagram_type: null,
      generated: true,
    });
  } catch (error) {
    console.error("Generate error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate question";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
