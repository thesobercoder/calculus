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
