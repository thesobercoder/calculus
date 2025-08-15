import { AiChat } from "@effect/ai";
import { Prompt } from "@effect/cli";
import { Console, Effect } from "effect";
import { toolkit } from "./tools.js";
import { formatAssistantResponse } from "./ui.js";

const createChat = AiChat.fromPrompt({
  prompt: [],
  system: [
    "You are a helpful AI assistant named Calculus",
    `You live in the terminal at the cwd "${process.cwd()}"`,
    `User's current location is Kolkata, West Bengal, India`,
    `Always respond with keeping the current locale in mind`,
    "You have access to tools. Use them intelligently to answer the user's questions",
    "<task_management>",
    "CRITICAL: ALWAYS use the writeTodo tool FIRST before answering ANY user question or request.",
    "This includes:",
    "- Simple questions that require research or analysis",
    "- Complex tasks that need implementation",
    "- Debugging or troubleshooting requests",
    "- Code explanations or reviews",
    "- ANY user interaction that involves work",
    "IMPORTANT: When the user gives you a task to perform, ALWAYS use the writeTodo tool first to break down the task into manageable steps.",
    "Examples of when to use writeTodo:",
    "- User asks to implement a feature",
    "- User requests debugging or fixing issues",
    "- User wants to refactor code",
    "- User asks questions about code or systems",
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

    // Keep calling tools until the LLM stops requesting them (agentic loop)
    while (response.toolCalls.length > 0) {
      for (const call of response.toolCalls) {
        // Call the tool and wait for the result
        switch (call.name) {
          case "writeTodo": {
            yield* Console.info("\n\u001b[32m⏺\u001b[0m Update Todos");
            for (const [, { name, result }] of response.results) {
              if (name === "writeTodo" && result && "todos" in result) {
                for (let i = 0; i < result.todos.length; i++) {
                  const todo = result.todos[i]!;
                  const status = todo.status === "completed" ? "☒" : "☐";
                  const prefix = i === 0 ? "  ⎿  " : "     ";
                  yield* Console.info(`${prefix}${status} ${todo.content}`);
                }
              }
            }
            break;
          }
          case "getCurrentDate": {
            yield* Console.info("\n\u001b[32m⏺\u001b[0m Current Date");
            for (const [, { name, result }] of response.results) {
              if (name === "getCurrentDate" && result && "datetime" in result) {
                yield* Console.info(
                  `  ⎿  \u001b[2m${result.datetime}\u001b[0m`
                );
              }
            }
            break;
          }
          case "searchEngine": {
            const searchParams = call.params as { query: string };
            yield* Console.info(
              `\n\u001b[32m⏺\u001b[0m Search Engine (query: "${searchParams.query}")`
            );
            for (const [, { name, result }] of response.results) {
              if (name === "searchEngine" && result && "results" in result) {
                const firstLine = result.results.trim().split("\n")[0] ?? "";
                yield* Console.info(`  ⎿  \u001b[2m${firstLine}\u001b[0m`);
              }
            }
            break;
          }
          case "scrapeAsMarkdown": {
            const params = call.params as { url: string };
            yield* Console.info(
              `\n\u001b[32m⏺\u001b[0m Scrape as Markdown (url: "${params.url}")`
            );
            for (const [, { name, result }] of response.results) {
              if (
                name === "scrapeAsMarkdown" &&
                result &&
                "content" in result
              ) {
                const firstLine = result.content.trim().split("\n")[0] ?? "";
                yield* Console.info(`  ⎿  \u001b[2m${firstLine}\u001b[0m`);
              }
            }
            break;
          }
        }
      }

      response = yield* chat.generateText({
        prompt: [],
        toolkit: toolkit,
      });
    }

    yield* Console.info(formatAssistantResponse(response.text));
  }
});
