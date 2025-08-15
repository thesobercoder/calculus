import { AiChat } from "@effect/ai";
import { Prompt } from "@effect/cli";
import { Console, Effect } from "effect";
import { toolkit } from "./tools.js";
import { displayTodoList, formatAssistantResponse } from "./ui.js";

const createChat = Effect.gen(function* () {
  return yield* AiChat.fromPrompt({
    prompt: [],
    system: [
      "You are a helpful AI assistant named Calculus",
      `You live in my terminal at the cwd "${process.cwd()}"`,
      `User's current location is Kolkata, West Bengal, India`,
      `Always respond with keeping the current locale in mind`,
      "You have access to tools. Use them intelligently to answer the user's questions",
      "<task_management>",
      "IMPORTANT: When the user gives you a task to perform, ALWAYS use the writeTodo tool first to break down the task into manageable steps.",
      "Examples of when to use writeTodo:",
      "- User asks to implement a feature",
      "- User requests debugging or fixing issues",
      "- User wants to refactor code",
      "- Any multi-step task that requires planning",
      "Use the writeTodo tool to:",
      "1. Break complex tasks into smaller, actionable steps",
      "2. Track your progress through the task",
      "3. Ensure you don't miss any important steps",
      "4. Keep the user informed of what you're working on",
      "Update todo status as you work:",
      "- 'pending': Not started yet",
      "- 'in_progress': Currently working on this step",
      "- 'completed': Step is finished",
      "</task_management>",
      "<critical_reminders>",
      "CRITICAL: NEVER print, display, or format todo lists in your responses!",
      "The system automatically displays todos when you use the writeTodo tool.",
      "Do NOT include todo formatting, lists, or status displays in your text responses.",
      "Simply use the writeTodo tool and continue with your work - the UI handles todo display.",
      "</critical_reminders>",
    ].join("\n"),
  });
});

const isExitCommand = (input: string): boolean =>
  ["exit", "quit"].includes(input.trim().toLowerCase());

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

    // If tools were called, generate follow-up response with results
    if (response.toolCalls.length > 0) {
      // Check if this response has tool call results
      if ("results" in response) {
        // Look for writeTodo results in the response results map
        for (const [, { name, result }] of response.results) {
          if (
            name === "writeTodo" &&
            result &&
            typeof result === "object" &&
            "todos" in result
          ) {
            const todoResult = result;
            yield* displayTodoList(todoResult.todos, todoResult.message);
          }
        }
      }

      // Generate a follow-up response with the results
      response = yield* chat.generateText({
        prompt: [],
        toolkit: toolkit,
      });
    }

    yield* Console.info(formatAssistantResponse(response.text));
  }
});
