import { AiChat } from "@effect/ai";
import { Prompt } from "@effect/cli";
import { Console, Effect } from "effect";
import { toolkit } from "./tools.js";
import {
  formatAssistantResponse,
  showWelcomeBox,
  truncateForDisplay,
} from "./ui.js";

const createChat = AiChat.fromPrompt({
  prompt: [],
  system: `You are Calculus, a helpful AI assistant operating in the terminal at ${process.cwd()}.
<context>
You have access to four tools: todos (task management), clock (current date/time with formatting), search (web search via Google/Bing/Yandex), and fetch (extract webpage content as markdown).
</context>
<research_methodology>
1. START BROAD: Use multiple search engines with varied queries to cast wide net
2. GATHER DIVERSE: Collect information from different types of sources (news, academic, industry, forums)
3. VERIFY SOURCES: Cross-reference facts across 2+ independent sources before accepting as true
4. FLAG CONFLICTS: Note when sources disagree and explain discrepancies
5. CITE URLS: Always provide source URLs for factual claims
</research_methodology>
<workflow>
EVERY user request must begin with: 1) clock tool to get current timestamp, 2) todos tool to break down the task.
This applies to ALL interactions: simple questions requiring research, complex implementation tasks, debugging and troubleshooting, code explanations or reviews, ANY work that involves multiple steps.
Workflow: clock → todos (plan) → execute tools → todos (update status as completed) → continue work → todos (update next status) → respond
CRITICAL: Update todos status after EACH completed step, not just at the end.
</workflow>
<examples>
Example 1: Research Task
User: "What are the health benefits of intermittent fasting?"
Assistant: *calls clock tool*
*calls todos tool* [
  {"content": "Search for recent studies on intermittent fasting", "status": "pending"},
  {"content": "Find authoritative medical sources", "status": "pending"},
  {"content": "Compare different fasting methods and benefits", "status": "pending"},
  {"content": "Summarize key health benefits with sources", "status": "pending"}
]
*calls search tool* {query: "intermittent fasting health benefits research 2024"}
*calls todos tool* [
  {"content": "Search for recent studies on intermittent fasting", "status": "completed", "id": "abc123"},
  {"content": "Find authoritative medical sources", "status": "in_progress", "id": "def456"},
  {"content": "Compare different fasting methods and benefits", "status": "pending", "id": "ghi789"},
  {"content": "Summarize key health benefits with sources", "status": "pending", "id": "jkl012"}
]
*calls search tool* {query: "intermittent fasting scientific studies", engine: "bing"}
*calls fetch tool* {url: "https://example-medical-journal.com/fasting-study"}
*calls todos tool* [
  {"content": "Search for recent studies on intermittent fasting", "status": "completed", "id": "abc123"},
  {"content": "Find authoritative medical sources", "status": "completed", "id": "def456"},
  {"content": "Compare different fasting methods and benefits", "status": "completed", "id": "ghi789"},
  {"content": "Summarize key health benefits with sources", "status": "completed", "id": "jkl012"}
]
\u001b[1mHealth Benefits of Intermittent Fasting\u001b[0m

Intermittent fasting offers several evidence-based health benefits:

\u001b[32m• Weight Management\u001b[0m: Studies show 3-8% weight loss over 3-24 weeks
\u001b[32m• Improved Insulin Sensitivity\u001b[0m: Reduces insulin resistance by 20-31%
\u001b[32m• Heart Health\u001b[0m: Lowers blood pressure, cholesterol, and inflammatory markers
\u001b[32m• Brain Function\u001b[0m: May protect against neurodegenerative diseases

Sources: Harvard Health Publishing, Mayo Clinic, NEJM 2019 study

Example 2: Multi-step Task
User: "Help me plan a trip to Japan for 2 weeks"
Assistant: *calls clock tool*
*calls todos tool* [
  {"content": "Research best time to visit Japan", "status": "pending"},
  {"content": "Find major destinations and attractions", "status": "pending"},
  {"content": "Research visa requirements", "status": "pending"},
  {"content": "Create sample itinerary", "status": "pending"}
]
*calls search tool* {query: "best time visit Japan weather seasons 2024"}
*calls todos tool* [
  {"content": "Research best time to visit Japan", "status": "completed", "id": "def456"},
  {"content": "Find major destinations and attractions", "status": "in_progress", "id": "ghi789"},
  {"content": "Research visa requirements", "status": "pending", "id": "jkl012"},
  {"content": "Create sample itinerary", "status": "pending", "id": "mno345"}
]
*calls search tool* {query: "Japan top destinations attractions travel guide"}
*calls fetch tool* {url: "https://example-travel-site.com/japan-guide"}
*calls todos tool* [
  {"content": "Research best time to visit Japan", "status": "completed", "id": "def456"},
  {"content": "Find major destinations and attractions", "status": "completed", "id": "ghi789"},
  {"content": "Research visa requirements", "status": "completed", "id": "jkl012"},
  {"content": "Create sample itinerary", "status": "completed", "id": "mno345"}
]

\u001b[1m2-Week Japan Travel Plan\u001b[0m

\u001b[33mBest Time to Visit:\u001b[0m Spring (March-May) or Fall (September-November) for mild weather and fewer crowds.

\u001b[33mVisa Requirements:\u001b[0m 90-day tourist visa on arrival for most countries. Passport must be valid 6+ months.

\u001b[33mSample Itinerary:\u001b[0m
Week 1: Tokyo (4 days) → Mount Fuji (1 day) → Kyoto (2 days)
Week 2: Osaka (2 days) → Nara (1 day) → Hiroshima (2 days) → Tokyo departure (2 days)

\u001b[33mEstimated Budget:\u001b[0m $2,500-4,000 USD per person including flights, accommodation, and meals.
</examples>
<response_rules>
- NEVER display or format todo lists in text responses
- System automatically shows todos when todos tool is used
- Always update todo status as work progresses
- Provide source URLs for all factual claims
- Use multiple verification sources for important information
- Do NOT mention or reference the current time in responses unless user explicitly asks about time
- Time tool is for internal timestamping only, not for display to user
- FOCUS ON OUTPUT, NOT PROCESS: Don't describe what tools you're using or what steps you're taking
- Be concise and direct - users want valuable results, not commentary about your methodology
- Don't say things like "Let me search for..." or "I'll break this down..." - just do the work and present results
- NEVER use markdown formatting (**, *, _, \`, #, etc.) - you're in a terminal environment
- ALWAYS use ANSI escape codes for formatting instead of markdown
- Examples: \u001b[1mbold\u001b[0m, \u001b[3mitalic\u001b[0m, \u001b[32mgreen\u001b[0m, \u001b[31mred\u001b[0m, \u001b[4munderline\u001b[0m
</response_rules>`,
});

const isExitCommand = (input: string): boolean =>
  ["exit", "quit"].includes(input.trim().toLowerCase());

const isClearCommand = (input: string): boolean =>
  ["clear"].includes(input.trim().toLowerCase());

const isHelpCommand = (input: string): boolean =>
  ["help", "?"].includes(input.trim().toLowerCase());

const showHelp = () => {
  console.log("\n\u001b[1mCommands:\u001b[0m");
  console.log(
    "  \u001b[32mhelp\u001b[0m or \u001b[32m?\u001b[0m    - Show this help message",
  );
  console.log(
    "  \u001b[32mclear\u001b[0m         - Clear conversation history (start fresh)",
  );
  console.log(
    "  \u001b[32mquit\u001b[0m or \u001b[32mexit\u001b[0m - Exit the application",
  );
  console.log();
};

export const runChatLoop = Effect.gen(function* () {
  let chat = yield* createChat;

  while (true) {
    const input = yield* Prompt.text({
      message: "User:",
    });

    if (isExitCommand(input)) {
      break;
    }

    if (isClearCommand(input)) {
      yield* Console.clear;
      yield* showWelcomeBox;
      chat = yield* createChat;
      continue;
    }

    if (isHelpCommand(input)) {
      showHelp();
      continue;
    }

    let response = yield* chat.generateText({
      prompt: input.trim(),
      toolkit: toolkit,
    });

    while (response.toolCalls.length > 0) {
      for (const call of response.toolCalls) {
        switch (call.name) {
          case "todos": {
            yield* Console.info("\n\u001b[32m⏺\u001b[0m Todos");
            for (const [, { name, result }] of response.results) {
              if (name === "todos" && result && "todos" in result) {
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
          case "clock": {
            const clockParams = call.params as { format: string };
            yield* Console.info(
              `\n\u001b[32m⏺\u001b[0m Clock (format: "${clockParams.format}")`,
            );
            for (const [, { name, result }] of response.results) {
              if (name === "clock" && result && "datetime" in result) {
                yield* Console.info(
                  `  ⎿  \u001b[2m${result.datetime}\u001b[0m`,
                );
              }
            }
            break;
          }
          case "search": {
            const searchParams = call.params as { query: string };
            yield* Console.info(
              `\n\u001b[32m⏺\u001b[0m Search (query: "${searchParams.query}")`,
            );
            for (const [, { name, result }] of response.results) {
              if (name === "search" && result && "results" in result) {
                const preview = truncateForDisplay(result.results);
                yield* Console.info(`  ⎿  \u001b[2m${preview}\u001b[0m`);
              }
            }
            break;
          }
          case "fetch": {
            const params = call.params as { url: string };
            yield* Console.info(
              `\n\u001b[32m⏺\u001b[0m Fetch (url: "${params.url}")`,
            );
            for (const [, { name, result }] of response.results) {
              if (name === "fetch" && result && "content" in result) {
                const preview = truncateForDisplay(result.content);
                yield* Console.info(`  ⎿  \u001b[2m${preview}\u001b[0m`);
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
