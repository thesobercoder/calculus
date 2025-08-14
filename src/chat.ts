import { AiChat } from "@effect/ai";
import { Prompt } from "@effect/cli";
import { Console, Effect } from "effect";
import { formatAssistantResponse } from "./ui.js";

const createChat = Effect.gen(function* () {
  return yield* AiChat.fromPrompt({
    prompt: [],
    system: [
      "You are a helpful AI assistant",
      `You live in my terminal at the cwd "${process.cwd()}"`,
    ].join("\n"),
  });
});

const isExitCommand = (input: string): boolean => {
  const trimmed = input.trim().toLowerCase();
  return trimmed === "exit" || trimmed === "quit";
};

export const runChatLoop = Effect.gen(function* () {
  const chat = yield* createChat;

  while (true) {
    const input = yield* Prompt.text({
      message: "User:",
    });

    if (isExitCommand(input)) {
      break;
    }

    const response = yield* chat.generateText({
      prompt: input.trim(),
    });

    yield* Console.info(formatAssistantResponse(response.text));
  }
});
