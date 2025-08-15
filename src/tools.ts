import { AiTool, AiToolkit } from "@effect/ai";
import { Effect, Schema } from "effect";
import { TodoItem } from "./schemas.js";

const getCurrentDateTool = AiTool.make("getCurrentDate", {
  description: "Get the current date and time",
  success: Schema.Struct({
    datetime: Schema.String,
  }),
});

const writeTodoTool = AiTool.make("writeTodo", {
  description: `Manage a batch of todos. This tool replaces the entire todo batch with the provided array.

Usage:
- Create new todos: Provide objects with 'content' and 'status' (omit 'id')
- Update existing todos: Include the existing 'id' along with 'content' and 'status'
- Status values: "pending", "in_progress", "completed"

Behavior:
- Automatically generates unique IDs for new todos (when 'id' is omitted)
- Preserves existing IDs when updating todos (when 'id' is provided)
- Auto-clears: When ALL todos have status "completed", the entire batch is automatically cleared
- Returns: Complete batch with all generated IDs and optional status message

Always reference the returned todo IDs in your response to confirm successful creation/updates.`,
  parameters: {
    todos: Schema.Array(
      Schema.Struct({
        content: Schema.String,
        status: Schema.Literal("pending", "in_progress", "completed"),
        id: Schema.optional(Schema.String),
      }),
    ),
  },
  success: Schema.Struct({
    todos: Schema.Array(TodoItem),
    message: Schema.optional(Schema.String),
  }),
});

export const toolkit = AiToolkit.make(getCurrentDateTool, writeTodoTool);

export const toolKitLayer = toolkit.toLayer({
  getCurrentDate: () => {
    return Effect.succeed({ datetime: new Date().toLocaleString() });
  },
  writeTodo: ({ todos }) => {
    const result = TodoItem.replaceBatch([...todos]);
    return Effect.succeed(result);
  },
});
