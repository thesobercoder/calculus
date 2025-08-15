import { Console, Effect } from "effect";
import { TodoItem } from "./types.js";

const BOX_WIDTH = 62;

function stripAnsi(str: string): string {
  const esc = String.fromCharCode(27);
  const ansiRegex = new RegExp(esc + "\\[[0-9;]*m", "g");
  return str.replace(ansiRegex, "");
}

function boxLine(content: string): string {
  const visibleLen = stripAnsi(content).length;
  const padLen = BOX_WIDTH - 2 - visibleLen;
  return `\x1b[38;5;244m│\x1b[0m${content}${" ".repeat(Math.max(0, padLen))}\x1b[38;5;244m│\x1b[0m`;
}

export const showWelcomeBox = Effect.gen(function* () {
  yield* Console.info(
    "\x1b[38;5;244m╭" + "─".repeat(BOX_WIDTH - 2) + "╮\x1b[0m",
  );
  yield* Console.info(
    boxLine("  \x1b[38;5;183m*\x1b[0m \x1b[1mWelcome to Monadic!\x1b[0m"),
  );
  yield* Console.info(boxLine(""));
  yield* Console.info(boxLine("  \x1b[3mtype 'exit' or 'quit' to exit\x1b[0m"));
  yield* Console.info(boxLine(""));
  yield* Console.info(boxLine(`  cwd: \x1b[38;5;244m${process.cwd()}\x1b[0m`));
  yield* Console.info(
    "\x1b[38;5;244m╰" + "─".repeat(BOX_WIDTH - 2) + "╯\x1b[0m",
  );
  yield* Console.log("");
});

export const formatAssistantResponse = (text: string): string =>
  `\n\x1b[32m✔\x1b[0m Assistant: ${text.trim()}\n`;

export const displayTodoList = (todos: readonly TodoItem[], message?: string) =>
  Effect.gen(function* () {
    if (todos.length > 0) {
      yield* Console.info("\n\u001b[32m⏺\u001b[0m Update Todos:");
      for (let i = 0; i < todos.length; i++) {
        const todo = todos[i]!;
        const status = todo.status === "completed" ? "☒" : "☐";
        const prefix = i === 0 ? "  ⎿  " : "     ";
        yield* Console.info(`${prefix}${status} ${todo.content}`);
      }
      if (message) {
        yield* Console.info(`\n${message}`);
      }
    }
  });

const formatToolName = (toolName: string): string => {
  switch (toolName) {
    case "searchEngine":
      return "Search Engine";
    case "scrapeAsMarkdown":
      return "Scrape Page";
    case "getCurrentDate":
      return "Get Current Date";
    default:
      // Convert camelCase to Title Case
      return toolName
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
  }
};

export const displayToolCalls = (
  toolCalls: Array<{ name: string; args?: unknown }>,
) =>
  Effect.gen(function* () {
    for (let i = 0; i < toolCalls.length; i++) {
      const toolCall = toolCalls[i]!;
      const toolTitle = formatToolName(toolCall.name);

      yield* Console.info(`\n\u001b[32m⏺\u001b[0m ${toolTitle}:`);

      // Format and display inputs
      if (toolCall.args && typeof toolCall.args === "object") {
        const argsEntries = Object.entries(
          toolCall.args as Record<string, unknown>,
        );
        if (argsEntries.length > 0) {
          const formattedArgs = argsEntries
            .map(([key, value]) => {
              const displayValue =
                typeof value === "string"
                  ? value.length > 50
                    ? `${value.slice(0, 50)}...`
                    : value
                  : String(value);
              return `${key}: ${displayValue}`;
            })
            .join(", ");
          yield* Console.info(`  ⎿  \u001b[38;5;244m${formattedArgs}\u001b[0m`);
        }
      }
    }
  });
