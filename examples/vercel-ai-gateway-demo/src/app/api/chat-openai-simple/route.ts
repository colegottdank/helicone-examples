import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.VERCEL_AI_GATEWAY_API_KEY,
  baseURL: "https://vercel.helicone.ai/v1",
  defaultHeaders: {
    "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
  },
});

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    const response = await openai.chat.completions.create({
      model: "anthropic/claude-3-5-sonnet",
      messages: messages || [
        {
          role: "user",
          content:
            "Tell me a brief story about the invention of the Mission-style burrito in San Francisco.",
        },
      ],
      max_tokens: 100,
    });

    return Response.json({
      message: response.choices[0].message.content,
      usage: response.usage,
      model: response.model,
    });
  } catch (error) {
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const response = await openai.chat.completions.create({
      model: "anthropic/claude-3-5-sonnet",
      messages: [
        {
          role: "user",
          content:
            "Tell me a brief story about the invention of the Mission-style burrito in San Francisco.",
        },
      ],
      max_tokens: 100,
    });

    return Response.json({
      message: response.choices[0].message.content,
      usage: response.usage,
      model: response.model,
    });
  } catch (error) {
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}