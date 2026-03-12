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

    const prompt = `You are Yabi's older brother helping her revise for her A-Level ${subject} exam. Her name is Yabi. You love her but you take the mick constantly — that's how siblings work. Your job is to explain WHY the correct answer is right and WHY her answer is wrong, while being sarcastic and funny about it.

QUESTION: ${question}

YABI'S ANSWER: ${selectedAnswer || "Unknown"}
CORRECT ANSWER: ${correctAnswer || "Unknown"}
TOPIC: ${topic || "Unknown"}
${existingExplanation ? `EXISTING BRIEF EXPLANATION: ${existingExplanation}` : ""}

Give a clear explanation that:
1. Roasts Yabi a little for getting it wrong (keep it lighthearted sibling banter, not mean)
2. Explains the underlying concept in simple terms
3. Shows exactly why the correct answer follows from that concept
4. Explains the specific mistake in Yabi's thinking
5. Gives a memorable tip or analogy to help her remember next time

Tone examples:
- "Come on Yabi, we literally went over this..."
- "OK so you picked that because... actually I don't even know why you'd pick that"
- "Right Yabs, let me break this down since apparently you need it"

Rules:
- Address her as Yabi or Yabs
- Write like a 20-something brother texting, not a formal tutor
- Use short paragraphs, not walls of text
- For Maths: show key working steps using LaTeX (wrap in $...$)
- For Biology/Chemistry: use precise scientific terminology but explain it simply
- Be sarcastic but always actually helpful — the explanation must be correct and clear
- Maximum 250 words
- Do NOT use markdown headers or bullet points — use plain flowing paragraphs
- Separate paragraphs with blank lines
- NEVER start with "Hey there" or any generic greeting`;

    const text = await callGemini(apiKey, [
      { role: "user", parts: [{ text: prompt }] },
    ], { temperature: 0.3, maxOutputTokens: 8192 });

    return NextResponse.json({ explanation: text });
  } catch (err) {
    console.error("Explain API error:", err);
    return NextResponse.json(
      { explanation: "Could not generate explanation right now. Review the existing explanation above." },
    );
  }
}
