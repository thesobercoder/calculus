import { OpenAiClient } from "@effect/ai-openai";
import * as OpenAiLanguageModel from "@effect/ai-openai/OpenAiLanguageModel";
import { HttpClient, HttpClientRequest } from "@effect/platform";
import { Config } from "effect";

export const ClientLayer = OpenAiClient.layerConfig({
  apiUrl: Config.string("OPENAI_BASE_URL"),
  apiKey: Config.redacted("OPENAI_API_KEY"),
  transformClient: (client: HttpClient.HttpClient) =>
    client.pipe(
      HttpClient.mapRequest((request) =>
        request.pipe(
          HttpClientRequest.setHeader(
            "HTTP-Referer",
            "https://thesobercoder.in"
          ),
          HttpClientRequest.setHeader("X-Title", "Calculus")
        )
      )
    ),
});

export const ModelLayer = OpenAiLanguageModel.layer({
  model: "anthropic/claude-sonnet-4",
  config: {
    temperature: 0.5,
  },
});
