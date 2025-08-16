import { AiTool, AiToolkit } from "@effect/ai";
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
} from "@effect/platform";
import { Config, Effect, Schema } from "effect";
import { TodoStore } from "./stores.js";
import { TodoItem } from "./types.js";

const timeTool = AiTool.make("time", {
  description: `Get the current date and time in user's local timezone.
Use when you need current timestamp, scheduling, or time-based operations.
No parameters required.
Returns localized date/time string (e.g., "12/25/2024, 3:30:45 PM").`,
  parameters: {},
  success: Schema.Struct({
    datetime: Schema.String.annotations({
      description:
        "The current date and time formatted as a localized string (e.g., '12/25/2024, 3:30:45 PM')",
    }),
  }),
});

const writeTodoTool = AiTool.make("todos", {
  description: `Manage task planning and progress tracking.
Use for breaking down complex work, project planning, and tracking implementation progress.
Input: array of todos with {content: string, status: 'pending'|'in_progress'|'completed', id?: string}
Create new: omit 'id' (auto-generated). Update existing: include 'id' from previous response.
Status flow: pending → in_progress → completed. List auto-clears when all completed.
UI displays todos automatically - don't format in response.`,
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
        id: Schema.NullOr(Schema.String).annotations({
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
const searchUrl = (
  engine: string,
  query: string,
  cursor?: string | null,
): string => {
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

const searchTool = AiTool.make("search", {
  description: `Search the web using Google, Bing, or Yandex via BrightData proxy.
Returns search result links and snippets, NOT full page content.
Input: {query: string, engine?: 'google'|'bing'|'yandex', cursor?: string}
Engine defaults to 'google'. Use cursor for pagination.
Output: markdown formatted results with titles, URLs, and snippets.
IMPORTANT: Use 'fetch' tool with returned URLs to get actual page content.
Typical workflow: search for pages, then fetch specific URLs for full content.`,
  parameters: {
    query: Schema.String.annotations({
      description: "The search query to execute",
    }),
    engine: Schema.NullOr(
      Schema.Literal("google", "bing", "yandex"),
    ).annotations({
      description: "Search engine to use (default: google)",
    }),
    cursor: Schema.NullOr(Schema.String).annotations({
      description: "Pagination cursor for next page",
    }),
  },
  success: Schema.Struct({
    results: Schema.String.annotations({
      description: "Search results formatted as markdown",
    }),
  }),
});

const fetchTool = AiTool.make("fetch", {
  description: `Extract clean webpage content as markdown via BrightData proxy.
Bypasses paywalls, bot detection, and CAPTCHAs with enterprise proxy network.
Input: {url: string} - must be valid HTTP/HTTPS URL
Output: {content: string} - clean markdown with headings, links, images, tables
Automatically removes ads, navigation, and clutter - preserves main content only.
Supports dynamic content, SPAs, and JavaScript-rendered pages.
Use for content research, documentation extraction, and data collection.`,
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
  timeTool,
  writeTodoTool,
  searchTool,
  fetchTool,
);

export const toolKitLayer = toolkit.toLayer({
  time: () => {
    return Effect.succeed({ datetime: new Date().toLocaleString() });
  },

  todos: ({ todos }) =>
    Effect.gen(function* () {
      const todoStore = yield* TodoStore;
      // Filter out null IDs to match expected type
      const processedTodos = todos.map((todo) => ({
        content: todo.content,
        status: todo.status,
        ...(todo.id && { id: todo.id }),
      }));
      return yield* todoStore.writeTodos([...processedTodos]);
    }).pipe(Effect.provide(TodoStore.Default)),

  search: ({ query, engine, cursor }) =>
    Effect.gen(function* () {
      const httpClient = yield* HttpClient.HttpClient;
      const brightDataApiKey = yield* Config.string("BRIGHTDATA_API_KEY");
      const unlockerZone = yield* Config.string("BRIGHTDATA_UNLOCKER_ZONE");

      const safeEngine = engine ?? "google";
      const targetUrl = searchUrl(safeEngine, query, cursor);

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

  fetch: ({ url }) =>
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
