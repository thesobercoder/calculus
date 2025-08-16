import { Console, Effect } from "effect";

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
    boxLine("  \x1b[38;5;183m*\x1b[0m \x1b[1mWelcome to Calculus!\x1b[0m"),
  );
  yield* Console.info(boxLine(""));
  yield* Console.info(boxLine("  \x1b[3mCommands: help, clear, quit\x1b[0m"));
  yield* Console.info(boxLine(""));
  yield* Console.info(boxLine(`  cwd: \x1b[38;5;244m${process.cwd()}\x1b[0m`));
  yield* Console.info(
    "\x1b[38;5;244m╰" + "─".repeat(BOX_WIDTH - 2) + "╯\x1b[0m",
  );
  yield* Console.log("");
});

export const truncateForDisplay = (
  text: string,
  maxLength: number = 80,
): string => {
  const trimmed = text.trim();
  const firstNewline = trimmed.indexOf("\n");

  if (firstNewline === -1) {
    // No newline found, truncate at maxLength
    return trimmed.length > maxLength
      ? trimmed.substring(0, maxLength) + "..."
      : trimmed;
  }

  const beforeNewline = trimmed.substring(0, firstNewline);
  return beforeNewline.length > maxLength
    ? beforeNewline.substring(0, maxLength) + "..."
    : beforeNewline;
};

export const formatAssistantResponse = (text: string): string =>
  `\n\x1b[32m✔\x1b[0m Assistant: ${text.trim()}\n`;
