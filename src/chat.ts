import { AiChat } from "@effect/ai";
import { Prompt } from "@effect/cli";
import { Console, Effect } from "effect";
import { toolkit } from "./tool.js";
import { formatAssistantResponse } from "./ui.js";

const createChat = Effect.gen(function* () {
  return yield* AiChat.fromPrompt({
    prompt: [],
    system: [
      "You are a helpful AI assistant",
      `You live in my terminal at the cwd "${process.cwd()}"`,
      `User's current location is Kolkata, West Bengal, India`,
      `Always respond with keeping the current locale in mind`,
      "You have access to tools. Use them intelligently to answer the user's questions",
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

    let response = yield* chat.generateText({
      prompt: input.trim(),
      toolkit: toolkit,
    });

    if (response.toolCalls.length > 0) {
      response = yield* chat.generateText({
        prompt: [],
        toolkit: toolkit,
      });
    }

    yield* Console.info(formatAssistantResponse(response.text));
  }
});
