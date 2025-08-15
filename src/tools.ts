import { AiTool, AiToolkit } from "@effect/ai";
import { Effect, Layer, Schema } from "effect";
import { TodoItem, TodoStore } from "./schemas.js";

// Centralized handler dependencies
const HandlerDependencies = Layer.mergeAll(
  TodoStore.Default
  // Future handler dependencies go here:
  // Logger.Default,
  // Analytics.Default,
  // EmailService.Default,
);

// Helper for handlers that need dependencies
const withDependencies =
  <I, O, R>(handler: (input: I) => Effect.Effect<O, never, R>) =>
  (input: I) =>
    handler(input).pipe(Effect.provide(HandlerDependencies));

const getCurrentDateTool = AiTool.make("getCurrentDate", {
  description:
    "Get the current date and time in the user's local timezone. Use this tool when you need to know what time/date it is right now for scheduling, logging, or time-based operations.",
  success: Schema.Struct({
    datetime: Schema.String.annotations({
      description:
        "The current date and time formatted as a localized string (e.g., '12/25/2024, 3:30:45 PM')",
    }),
  }),
});

const writeTodoTool = AiTool.make("writeTodo", {
  description: `Manage a batch of todos for task planning and progress tracking. This tool replaces the entire todo batch with the provided array.

🎯 WHEN TO USE:
- User requests implementing a feature
- Debugging or fixing issues
- Refactoring code
- Any multi-step task requiring planning
- Breaking down complex work into manageable steps

📝 USAGE PATTERNS:
- Create new todos: Provide objects with 'content' and 'status' (omit 'id')
- Update existing todos: Include the existing 'id' along with 'content' and 'status'
- Status progression: pending → in_progress → completed

⚡ BEHAVIOR:
- Automatically generates unique IDs for new todos (when 'id' is omitted)
- Preserves existing IDs when updating todos (when 'id' is provided)
- Auto-clears: When ALL todos have status "completed", the entire batch is automatically cleared
- Returns: Complete batch with all generated IDs and optional status message

🔍 The UI automatically displays the todo list - do NOT format todos in your response!`,
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
          "completed"
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
      })
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

export const toolkit = AiToolkit.make(getCurrentDateTool, writeTodoTool);

export const toolKitLayer = toolkit.toLayer({
  getCurrentDate: () => {
    return Effect.succeed({ datetime: new Date().toLocaleString() });
  },

  writeTodo: withDependencies(({ todos }) =>
    Effect.gen(function* () {
      const todoStore = yield* TodoStore;
      return yield* todoStore.replaceBatch([...todos]);
    })
  ),
});
