import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT =
  "You are an expert OCR engine. Extract all readable text from the provided cropped image exactly as it appears. Do not add markdown commentary, headers, or pleasantries. Return only the raw text found.";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  let body: { image?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { image } = body;
  if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
    return NextResponse.json(
      { error: "Missing or invalid image" },
      { status: 400 },
    );
  }

  const base64Part = image.split(",")[1] ?? "";
  const approxBytes = (base64Part.length * 3) / 4;
  if (approxBytes > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "Image too large. Try a smaller focus area." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: image, detail: "high" },
              },
              {
                type: "text",
                text: "Extract all readable text from this image.",
              },
            ],
          },
        ],
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI API error:", err);
      return NextResponse.json(
        { error: "Could not read text. Please try again." },
        { status: 502 },
      );
    }

    const data = await response.json();
    const text: string = data.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({ text: text.trim() });
  } catch (error) {
    console.error("OCR route error:", error);
    return NextResponse.json(
      { error: "Could not read text. Please try again." },
      { status: 500 },
    );
  }
}
