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
  // Box width (including borders)
  const BOX_WIDTH = 62;
  // Helper to strip ANSI codes for accurate length
  function stripAnsi(str: string) {
    const esc = String.fromCharCode(27);
    const ansiRegex = new RegExp(esc + "\\[[0-9;]*m", "g");
    return str.replace(ansiRegex, "");
  }
  // Helper to pad a line inside the box
  function boxLine(content: string) {
    const visibleLen = stripAnsi(content).length;
    const padLen = BOX_WIDTH - 2 - visibleLen;
    return `\x1b[38;5;244m│\x1b[0m${content}${" ".repeat(Math.max(0, padLen))}\x1b[38;5;244m│\x1b[0m`;
  }
  yield* Console.info(
    "\x1b[38;5;244m╭" + "─".repeat(BOX_WIDTH - 2) + "╮\x1b[0m"
  );
  yield* Console.info(
    boxLine("  \x1b[38;5;208m*\x1b[0m \x1b[1mWelcome to Effect Code!\x1b[0m")
  );
  yield* Console.info(boxLine(""));
  yield* Console.info(boxLine("  \x1b[3mtype 'exit' or 'quit' to exit\x1b[0m"));
  yield* Console.info(boxLine(""));
  yield* Console.info(boxLine(`  cwd: \x1b[38;5;244m${process.cwd()}\x1b[0m`));
  yield* Console.info(
    "\x1b[38;5;244m╰" + "─".repeat(BOX_WIDTH - 2) + "╯\x1b[0m"
  );
  yield* Console.log("");

  const chat = yield* AiChat.fromPrompt({
    prompt: [],
    system: [
      "You are a helpful AI assistant",
      `You live in my terminal at the cwd "${process.cwd()}"`,
    ].join("\n"),
  });
  while (true) {
    const input = yield* Prompt.text({
      message: "User:",
    });
    if (
      input.trim().toLowerCase() === "exit" ||
      input.trim().toLowerCase() === "quit"
    ) {
      break;
    }
    const response = yield* chat.generateText({
      prompt: input.trim(),
    });
    yield* Console.info("\x1b[32m✔\x1b[0m Assistant:", response.text.trim());
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
