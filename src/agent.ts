import { AiChat } from "@effect/ai";
import { OpenAiClient } from "@effect/ai-openai";
import * as OpenAiLanguageModel from "@effect/ai-openai/OpenAiLanguageModel";
import { Prompt } from "@effect/cli";
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
} from "@effect/platform";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Config, Console, Effect } from "effect";

const main = Effect.gen(function* () {
  const chat = yield* AiChat.fromPrompt({
    prompt: [],
    system: [
      "You are a helpful AI assistant",
      `You live in my terminal at the cws "${process.cwd()}"`,
    ].join("\n"),
  });
  while (true) {
    const input = yield* Prompt.text({
      message: "Enter a message (or type 'exit' to quit):",
    });
    // Uncomment below to allow exit
    // if (input.trim().toLowerCase() === "exit") {
    //   yield* Console.info("Exiting...");
    //   break;
    // }
    const response = yield* chat.generateText({
      prompt: input.trim(),
    });
    yield* Console.info("✔ Assistant: ", response.text);
  }
});

const ClientLayer = OpenAiClient.layerConfig({
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
          HttpClientRequest.setHeader("X-Title", "Memory Manager")
        )
      )
    ),
});

const ModelLayer = OpenAiLanguageModel.layer({
  model: "google/gemini-2.5-flash",
  config: {
    temperature: 0.5,
  },
});

main.pipe(
  Effect.provide(ModelLayer),
  Effect.provide(ClientLayer),
  Effect.provide(FetchHttpClient.layer),
  Effect.provide(BunContext.layer),
  BunRuntime.runMain
);
