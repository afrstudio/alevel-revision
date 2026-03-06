import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, subject, questionContext } = body;

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Check for Supabase edge function URL in env
    const supabaseMarkUrl = process.env.SUPABASE_MARK_FUNCTION_URL;

    if (supabaseMarkUrl) {
      // Forward to Supabase edge function
      const response = await fetch(supabaseMarkUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY || ""}`,
        },
        body: JSON.stringify({ image, subject, questionContext }),
      });

      const data = await response.json();
      return NextResponse.json(data);
    }

    // Check for OpenAI API key for vision marking
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: `You are an A-Level ${subject} examiner. Mark the student's handwritten answer shown in the image.

Provide your response as JSON with this structure:
{
  "score": <number>,
  "totalMarks": <number>,
  "feedback": "<detailed feedback string>",
  "criteriaMatched": ["<criterion 1>", ...],
  "criteriaMissed": ["<criterion 1>", ...]
}

Be fair but rigorous. Use UK A-Level marking standards. If you can't read the handwriting clearly, mention which parts were unclear.`,
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: questionContext
                      ? `Mark this answer for the following question: ${questionContext}`
                      : `Mark this ${subject} answer. Identify what question it's answering and mark accordingly.`,
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: image.startsWith("data:")
                        ? image
                        : `data:image/jpeg;base64,${image}`,
                    },
                  },
                ],
              },
            ],
            max_tokens: 1000,
          }),
        }
      );

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      try {
        // Try to parse as JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          return NextResponse.json(result);
        }
      } catch {
        // If JSON parsing fails, return as feedback
      }

      return NextResponse.json({
        score: 0,
        totalMarks: 0,
        feedback: content,
        criteriaMatched: [],
        criteriaMissed: [],
      });
    }

    // No API configured - return helpful message
    return NextResponse.json(
      {
        error:
          "No marking API configured. Set OPENAI_API_KEY or SUPABASE_MARK_FUNCTION_URL in .env.local",
        score: 0,
        totalMarks: 0,
        feedback:
          "Marking API not configured. Add OPENAI_API_KEY to your .env.local file to enable AI marking, or set SUPABASE_MARK_FUNCTION_URL to use a Supabase edge function.",
        criteriaMatched: [],
        criteriaMissed: [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Marking error:", error);
    return NextResponse.json(
      { error: "Failed to process marking request" },
      { status: 500 }
    );
  }
}
