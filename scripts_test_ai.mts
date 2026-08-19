import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText, Output } from "ai";
import { z } from "zod";

const key = process.env.LOVABLE_API_KEY!;
const gateway = createOpenAICompatible({
  name: "lovable-ai-gateway",
  baseURL: "https://ai.gateway.lovable.dev/v1",
  apiKey: key,
  headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  supportsStructuredOutputs: true,
});

const schema = z.object({ subject: z.string(), body: z.string() });

try {
  const { output, text, finishReason, usage } = await generateText({
    model: gateway("google/gemini-3.7-flash"),
    output: Output.object({ schema }),
    system: "You are an HR Communications Specialist.",
    prompt: "Write a short welcome email. Intent: welcome new hire. Recipient: new employee. Dates: starts Monday.",
  });
  console.log("OK finishReason:", finishReason, "usage:", JSON.stringify(usage));
  console.log("OUTPUT:", JSON.stringify(output));
  console.log("TEXT:", text?.slice(0, 200));
} catch (e) {
  console.error("CAUGHT:", e?.name, e?.message);
  console.error("cause:", JSON.stringify(e?.cause, null, 2)?.slice(0, 1500));
  if (e?.responseBody) console.error("responseBody:", String(e.responseBody).slice(0, 1500));
}
