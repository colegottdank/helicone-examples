import { streamText } from "ai";
import { createGateway } from "@ai-sdk/gateway";

const gateway = createGateway({
  apiKey: process.env.VERCEL_AI_GATEWAY_API_KEY,
  baseURL: "https://vercel.helicone.ai/v1/ai",
  headers: {
    "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
  },
});

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    const result = streamText({
      model: gateway("anthropic/claude-3-5-sonnet"),
      prompt: messages[0]?.content || "Hello",
      maxOutputTokens: 100,
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            const data = {
              type: "text",
              text: chunk,
              timestamp: Date.now(),
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          }

          const finalData = {
            type: "metadata",
            usage: await result.usage,
            finishReason: await result.finishReason,
            fullText: await result.text,
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalData)}\n\n`));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}