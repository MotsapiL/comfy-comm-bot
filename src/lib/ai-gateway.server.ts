import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Lovable AI Gateway provider helper.
 *
 * The gateway authenticates on the `Lovable-API-Key` header (not a bearer
 * token), so we send it explicitly on every request. `apiKey` is also passed
 * to satisfy the OpenAI-compatible SDK's expectations.
 */
export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable-ai-gateway",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
    supportsStructuredOutputs: true,
  });
}
