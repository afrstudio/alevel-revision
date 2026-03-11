import { NextRequest, NextResponse } from "next/server";

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message?: string };
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
      temperature: config?.temperature ?? 0.3,
      maxOutputTokens: config?.maxOutputTokens ?? 1500,
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

  const parts = data.candidates?.[0]?.content?.parts || [];
  const text = parts.map((p: { text?: string }) => p.text || "").join("\n").trim();
  if (!text) throw new Error("Gemini returned an empty response");
  return text;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ explanation: "AI explanations require a Gemini API key. Check the existing explanation above." });
    }

    const body = await request.json();
    const { subject, question, selectedAnswer, correctAnswer, topic, existingExplanation } = body;

    if (!subject || !question) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const prompt = `You are a patient, encouraging A-Level ${subject} tutor helping a student who just got a question wrong. Your job is to help them truly understand WHY the correct answer is right and WHY their answer is wrong.

QUESTION: ${question}

STUDENT'S ANSWER: ${selectedAnswer || "Unknown"}
CORRECT ANSWER: ${correctAnswer || "Unknown"}
TOPIC: ${topic || "Unknown"}
${existingExplanation ? `EXISTING BRIEF EXPLANATION: ${existingExplanation}` : ""}

Give a clear, step-by-step explanation that:
1. Explains the underlying concept in simple terms (as if teaching it fresh)
2. Shows exactly why the correct answer follows from that concept
3. Explains the specific mistake in the student's thinking
4. Gives a memorable tip or analogy to avoid this mistake next time

Rules:
- Write for a 17-year-old A-Level student
- Use short paragraphs, not walls of text
- For Maths: show key working steps using LaTeX (wrap in $...$)
- For Biology/Chemistry: use precise scientific terminology but explain it
- Be encouraging but direct — don't waffle
- Maximum 250 words
- Do NOT use markdown headers or bullet points — use plain flowing paragraphs
- Separate paragraphs with blank lines`;

    const text = await callGemini(apiKey, [
      { role: "user", parts: [{ text: prompt }] },
    ], { temperature: 0.3, maxOutputTokens: 1500 });

    return NextResponse.json({ explanation: text });
  } catch (err) {
    console.error("Explain API error:", err);
    return NextResponse.json(
      { explanation: "Could not generate explanation right now. Review the existing explanation above." },
    );
  }
}
