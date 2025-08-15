import { AiTool, AiToolkit } from "@effect/ai";
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
} from "@effect/platform";
import { Config, Effect, Schema } from "effect";
import { TodoStore } from "./stores.js";
import { TodoItem } from "./types.js";

const getCurrentDateTool = AiTool.make("getCurrentDate", {
  description: `Get the current date and time in the user's local timezone.

🕒 Use this tool when you need to:
• Know the current date/time for timestamps or scheduling
• Create time-based file names or logs
• Determine business hours or time-sensitive operations
• Reference "today's date" in your responses

Returns a localized date/time string (e.g., "12/25/2024, 3:30:45 PM").`,
  parameters: {},
  success: Schema.Struct({
    datetime: Schema.String.annotations({
      description:
        "The current date and time formatted as a localized string (e.g., '12/25/2024, 3:30:45 PM')",
    }),
  }),
});

const writeTodoTool = AiTool.make("writeTodo", {
  description: `Manage task planning and progress tracking with an intelligent todo system.

📋 **PURPOSE**: Break down complex work into manageable, trackable steps

🎯 **WHEN TO USE**:
• User requests implementing a feature or fixing bugs
• Multi-step coding tasks (debugging, refactoring, testing)
• Project planning and task organization
• Breaking down complex requirements into actionable items

⚙️ **HOW IT WORKS**:
• **Create new**: Provide 'content' and 'status' (omit 'id' - auto-generated)
• **Update existing**: Include the existing 'id' with updated 'content'/'status'
• **Status flow**: pending → in_progress → completed
• **Auto-cleanup**: When all todos are completed, the list clears automatically

💡 **BEST PRACTICES**:
• Write specific, actionable tasks (not vague descriptions)
• Use status updates to show real progress
• Only mark tasks 'completed' when fully finished
• Break large tasks into smaller, manageable pieces

⚠️ **IMPORTANT**: The UI displays todos automatically - don't format them in your response!`,
  parameters: {
    todos: Schema.Array(
      Schema.Struct({
        content: Schema.String.annotations({
          description:
            "The task description - be specific and actionable (e.g., 'Create user authentication middleware' not 'Fix auth')",
        }),
        status: Schema.Literal(
          "pending",
          "in_progress",
          "completed",
        ).annotations({
          description:
            "Task status: 'pending' (not started), 'in_progress' (currently working), 'completed' (finished)",
        }),
        id: Schema.optional(Schema.String).annotations({
          description:
            "Unique identifier for existing todos. Omit for new todos - system will generate UUID automatically",
        }),
      }).annotations({
        description:
          "A single todo item with content, status, and optional ID for updates",
      }),
    ).annotations({
      description:
        "Array of todo items. This replaces the entire current batch - include all todos you want to keep",
    }),
  },
  success: Schema.Struct({
    todos: Schema.Array(TodoItem).annotations({
      description: "The complete updated todo batch with all generated IDs",
    }),
  }),
});

// Helper functions for BrightData API
const searchUrl = (engine: string, query: string, cursor?: string): string => {
  const encodedQuery = encodeURIComponent(query);
  const cursorParam = cursor ? `&cursor=${encodeURIComponent(cursor)}` : "";

  switch (engine) {
    case "google":
      return `https://www.google.com/search?q=${encodedQuery}${cursorParam}`;
    case "bing":
      return `https://www.bing.com/search?q=${encodedQuery}${cursorParam}`;
    case "yandex":
      return `https://yandex.com/search/?text=${encodedQuery}${cursorParam}`;
    default:
      return `https://www.google.com/search?q=${encodedQuery}${cursorParam}`;
  }
};

const searchEngineTool = AiTool.make("searchEngine", {
  description: `Search the web using Google, Bing, or Yandex to get search result links.

🔍 **PURPOSE**: Get search result links from major search engines (NOT full page content)

🌐 **SUPPORTED ENGINES**:
• **Google** (default) - Most comprehensive results
• **Bing** - Microsoft's search engine with unique results
• **Yandex** - Russian search engine, good for international content

📋 **OUTPUT FORMAT**: Returns search results with:
• Page titles as headers
• URLs for each result
• Short descriptive snippets from search results
• Structured markdown format

⚠️ **IMPORTANT**: This tool only provides search result links and snippets. To read the actual content of web pages, you MUST use the 'scrapeAsMarkdown' tool with the URLs returned by this search.

🔄 **TYPICAL WORKFLOW**:
1. Use searchEngine to find relevant pages
2. Use scrapeAsMarkdown to read the actual content from the URLs
3. Analyze the scraped content to answer user questions

🎯 **BEST FOR**: Finding relevant web pages for research, getting current search results, discovering content sources.`,
  parameters: {
    query: Schema.String.annotations({
      description: "The search query to execute",
    }),
    engine: Schema.optional(
      Schema.Literal("google", "bing", "yandex"),
    ).annotations({
      description: "Search engine to use (default: google)",
    }),
    cursor: Schema.optional(Schema.String).annotations({
      description: "Pagination cursor for next page",
    }),
  },
  success: Schema.Struct({
    results: Schema.String.annotations({
      description: "Search results formatted as markdown",
    }),
  }),
});

const scrapeAsMarkdownTool = AiTool.make("scrapeAsMarkdown", {
  description: `Extract clean, readable content from any webpage with advanced anti-detection capabilities.

📄 **PURPOSE**: Convert any webpage into clean, structured markdown text

🚀 **ADVANCED CAPABILITIES**:
• **Universal Access**: Bypasses paywalls, bot detection, and CAPTCHAs
• **Smart Extraction**: Automatically identifies main content vs ads/navigation
• **Clean Output**: Returns properly formatted markdown text
• **JavaScript Support**: Handles dynamic content and SPAs
• **Media Handling**: Preserves images, links, and formatting structure

📋 **OUTPUT FORMAT**: Clean markdown with:
• Proper heading hierarchy (H1, H2, H3...)
• Preserved links and image references
• Readable text formatting (bold, italic, lists)
• Structured tables and code blocks
• Removed ads, popups, and navigation clutter

🎯 **PERFECT FOR**:
• Content research and analysis
• Documentation extraction
• Article summarization
• Data collection from protected sites
• Converting web content for further processing

⚡ **TIP**: Works on any publicly accessible URL including news sites, blogs, documentation, and social media pages.`,
  parameters: {
    url: Schema.String.annotations({
      description: "The URL to scrape (must be a valid URL)",
    }),
  },
  success: Schema.Struct({
    content: Schema.String.annotations({
      description: "Scraped webpage content formatted as markdown",
    }),
  }),
});

export const toolkit = AiToolkit.make(
  getCurrentDateTool,
  writeTodoTool,
  searchEngineTool,
  scrapeAsMarkdownTool,
);

export const toolKitLayer = toolkit.toLayer({
  getCurrentDate: () => {
    return Effect.succeed({ datetime: new Date().toLocaleString() });
  },

  writeTodo: ({ todos }) =>
    Effect.gen(function* () {
      const todoStore = yield* TodoStore;
      return yield* todoStore.writeTodos([...todos]);
    }).pipe(Effect.provide(TodoStore.Default)),

  searchEngine: ({ query, engine = "google", cursor }) =>
    Effect.gen(function* () {
      const httpClient = yield* HttpClient.HttpClient;
      const brightDataApiKey = yield* Config.string("BRIGHTDATA_API_KEY");
      const unlockerZone = yield* Config.string("BRIGHTDATA_UNLOCKER_ZONE");

      const targetUrl = searchUrl(engine, query, cursor);

      const request = HttpClientRequest.post(
        "https://api.brightdata.com/request",
      ).pipe(
        HttpClientRequest.setHeader(
          "Authorization",
          `Bearer ${brightDataApiKey}`,
        ),
        HttpClientRequest.setHeader("Content-Type", "application/json"),
        HttpClientRequest.bodyUnsafeJson({
          url: targetUrl,
          zone: unlockerZone,
          format: "raw",
          data_format: "markdown",
        }),
      );

      const response = yield* httpClient.execute(request);
      const data = yield* response.text;
      return { results: data };
    }).pipe(Effect.provide(FetchHttpClient.layer), Effect.orDie),

  scrapeAsMarkdown: ({ url }) =>
    Effect.gen(function* () {
      const httpClient = yield* HttpClient.HttpClient;
      const brightDataApiKey = yield* Config.string("BRIGHTDATA_API_KEY");
      const unlockerZone = yield* Config.string("BRIGHTDATA_UNLOCKER_ZONE");

      const request = HttpClientRequest.post(
        "https://api.brightdata.com/request",
      ).pipe(
        HttpClientRequest.setHeader(
          "Authorization",
          `Bearer ${brightDataApiKey}`,
        ),
        HttpClientRequest.setHeader("Content-Type", "application/json"),
        HttpClientRequest.bodyUnsafeJson({
          url,
          zone: unlockerZone,
          format: "raw",
          data_format: "markdown",
        }),
      );

      const response = yield* httpClient.execute(request);
      const data = yield* response.text;
      return { content: data };
    }).pipe(Effect.provide(FetchHttpClient.layer), Effect.orDie),
});
