import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const HrCommInput = z.object({
  intent: z.string().min(1, "Intent is required"),
  recipientRole: z.string().min(1, "Recipient role is required"),
  keyDates: z.string().min(1, "Key dates are required"),
});

const HrCommOutput = z.object({
  subject: z.string(),
  body: z.string(),
});

export type HrCommResult = z.infer<typeof HrCommOutput>;

export const generateHrComm = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => HrCommInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);

    const system = [
      "You are an HR Communications Specialist.",
      "Generate clear, empathetic HR communications based on user inputs.",
      "The tone is always professional, warm, and human — never cold or bureaucratic.",
      "Address the recipient by their role generally; do not use placeholder tokens like [Name] or [Date].",
      "Incorporate the provided key dates naturally into the message.",
    ].join(" ");

    const prompt = [
      `Intent: ${data.intent}`,
      `Recipient role: ${data.recipientRole}`,
      `Key dates: ${data.keyDates}`,
      "",
      "Write a complete HR email/message. Return a concise subject line and a full body.",
      "The body should open with a warm greeting, state the purpose clearly, include the key dates, and close with empathy and next steps.",
    ].join("\n");

    const { output } = await generateText({
      model: gateway("google/gemini-3.7-flash"),
      output: Output.object({ schema: HrCommOutput }),
      system,
      prompt,
    });

    return output satisfies HrCommResult;
  });
