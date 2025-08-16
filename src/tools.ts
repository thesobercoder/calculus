import { AiTool, AiToolkit } from "@effect/ai";
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
} from "@effect/platform";
import { Config, Effect, Schema } from "effect";
import { TodoStore } from "./stores.js";
import { TodoItem } from "./types.js";

const clockTool = AiTool.make("clock", {
  description: `Get the current date and time in user's local timezone with customizable formatting.
Use when you need current timestamp, scheduling, or time-based operations.
REQUIRED: Must specify format parameter ('short', 'long', or 'iso').
Format options:
- 'short': Localized format like "8/16/2025, 3:57:12 PM"
- 'long': Full format like "Friday, August 16, 2025 at 03:57:12 PM"
- 'iso': ISO 8601 format like "2025-08-16T20:57:12.345Z"`,
  parameters: {
    format: Schema.Literal("short", "long", "iso").annotations({
      description: "Time format: 'short', 'long', or 'iso'",
    }),
  },
  success: Schema.Struct({
    datetime: Schema.String.annotations({
      description:
        "The current date and time formatted as a localized string (e.g., '12/25/2024, 3:30:45 PM')",
    }),
  }),
});

const todoTool = AiTool.make("todos", {
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

const searchUrl = (
  engine: string,
  query: string,
  cursor: string | null,
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
  description:
    "Search the web using Google, Bing, or Yandex. Returns search result links and snippets.",
  parameters: {
    query: Schema.String.annotations({
      description: "The search query to execute",
    }),
    engine: Schema.Literal("google", "bing", "yandex").annotations({
      description: "Search engine to use (recommended: google)",
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
  description:
    "Extract webpage content as clean markdown. Input: valid URL. Output: markdown content.",
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
  clockTool,
  todoTool,
  searchTool,
  fetchTool,
);

export const toolKitLayer = toolkit.toLayer({
  clock: ({ format }) => {
    const now = new Date();
    let datetime: string;

    switch (format) {
      case "long":
        datetime = now.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        break;
      case "iso":
        datetime = now.toISOString();
        break;
      case "short":
      default:
        datetime = now.toLocaleString();
        break;
    }

    return Effect.succeed({ datetime });
  },

  todos: ({ todos }) =>
    Effect.gen(function* () {
      const todoStore = yield* TodoStore;
      const processedTodos = todos.map((todo) => ({
        content: todo.content,
        status: todo.status,
        ...(todo.id && todo.id.length > 0 && { id: todo.id }),
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
