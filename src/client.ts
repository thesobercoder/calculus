import { OpenAiClient, OpenAiLanguageModel } from "@effect/ai-openai";
import { HttpClient, HttpClientRequest } from "@effect/platform";
import { Config } from "effect";

export const ClientLayer = OpenAiClient.layerConfig({
  apiUrl: Config.succeed("https://openrouter.ai/api/v1"),
  apiKey: Config.redacted("OPENROUTER_API_KEY"),
  transformClient: (client: HttpClient.HttpClient) =>
    client.pipe(
      HttpClient.mapRequest((request) =>
        request.pipe(
          HttpClientRequest.setHeader(
            "HTTP-Referer",
            "https://thesobercoder.in",
          ),
          HttpClientRequest.setHeader("X-Title", "Calculus"),
        ),
      ),
    ),
});

export const ModelLayer = OpenAiLanguageModel.layer({
  model: "anthropic/claude-sonnet-4",
  config: {
    temperature: 0.3,
    reasoning_effort: "medium",
    top_p: 0.9,
  },
});
