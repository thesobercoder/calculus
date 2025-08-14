import { readFileSync } from "node:fs";

const VALIDATION_RULES = [
  {
    command: "npm",
    message: "Use 'bun' instead of 'npm' for this project",
  },
  {
    command: "npx",
    message: "Use 'bunx' instead of 'npx' for this project",
  },
  {
    command: "pnpm",
    message: "Use 'bun' instead of 'pnpm' for this project",
  },
  {
    command: "pnpx",
    message: "Use 'bunx' instead of 'pnpx' for this project",
  },
  {
    command: "yarn",
    message: "Use 'bun' instead of 'yarn' for this project",
  },
];

function validateCommand(command) {
  const issues = [];

  for (const rule of VALIDATION_RULES) {
    const pattern = new RegExp(`\\b${rule.command}\\s+`);
    if (pattern.test(command)) {
      issues.push(rule.message);
    }
  }

  return issues;
}

function main() {
  try {
    const input = readFileSync(0, "utf8");
    const inputData = JSON.parse(input);
    const toolName = inputData.tool_name ?? "";

    if (toolName !== "Bash") {
      process.exit(0);
    }

    const toolInput = inputData.tool_input ?? {};
    const command = toolInput.command ?? "";

    if (!command) {
      process.exit(0);
    }

    const issues = validateCommand(command);
    if (issues.length > 0) {
      for (const message of issues) {
        console.error(`• ${message}`);
      }
      process.exit(2);
    }

    process.exit(0);
  } catch (error) {
    console.error(`Error: Invalid JSON input: ${error.message}`);
    process.exit(1);
  }
}

main();
