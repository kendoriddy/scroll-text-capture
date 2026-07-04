import { NextRequest, NextResponse } from "next/server";

const ASK_MODEL = process.env.OPENAI_ASK_MODEL ?? "gpt-5.5";

const SYSTEM_PROMPT = `You answer based on the text the user provides. Follow these rules strictly:
- Be short and direct. No preamble, greetings, or filler.
- For multiple-choice questions: state the correct answer (letter/option) first, then one brief sentence explaining why.
- For explanation requests: respond in 1-3 sentences maximum.
- For factual questions: give the direct answer in as few words as possible.
- If the text is unclear or you cannot answer, say so in one sentence.`;

const MAX_TEXT_LENGTH = 8000;

function extractOutputText(data: {
  output_text?: string;
  output?: Array<{
    type: string;
    content?: Array<{ type: string; text?: string }>;
  }>;
}): string {
  if (data.output_text) return data.output_text;

  if (!data.output) return "";

  const parts: string[] = [];
  for (const item of data.output) {
    if (item.type === "message" && item.content) {
      for (const block of item.content) {
        if (block.type === "output_text" && block.text) {
          parts.push(block.text);
        }
      }
    }
  }
  return parts.join("\n");
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  let body: { text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { text } = body;
  if (!text || typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: "Text too long. Please shorten it." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: ASK_MODEL,
        reasoning: { effort: "low" },
        instructions: SYSTEM_PROMPT,
        input: text.trim(),
        max_output_tokens: 200,
        text: { verbosity: "low" },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI ask API error:", err);
      return NextResponse.json(
        { error: "Could not get an answer. Please try again." },
        { status: 502 },
      );
    }

    const data = await response.json();
    const answer = extractOutputText(data);

    return NextResponse.json({ answer: answer.trim() });
  } catch (error) {
    console.error("Ask route error:", error);
    return NextResponse.json(
      { error: "Could not get an answer. Please try again." },
      { status: 500 },
    );
  }
}
