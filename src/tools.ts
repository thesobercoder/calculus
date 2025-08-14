import { AiTool, AiToolkit } from "@effect/ai";
import { Effect, Schema } from "effect";
import { randomUUID } from "crypto";
import { TodoItemInput, TodoItemOutput } from "./schemas.js";

// In-memory todo batch storage
let currentBatch: TodoItemOutput[] = [];

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
    todos: Schema.Array(TodoItemInput),
  },
  success: Schema.Struct({
    todos: Schema.Array(TodoItemOutput),
    message: Schema.optional(Schema.String),
  }),
});

export const toolkit = AiToolkit.make(getCurrentDateTool, writeTodoTool);

export const toolKitLayer = toolkit.toLayer({
  getCurrentDate: () => {
    return Effect.succeed({ datetime: new Date().toLocaleString() });
  },
  writeTodo: ({ todos }) => {
    // Process todos and generate IDs for new items
    const processedTodos: TodoItemOutput[] = todos.map((todo) => {
      if (todo.id) {
        // Existing todo with ID - keep the ID
        return TodoItemOutput.create(todo.content, todo.status, todo.id);
      } else {
        // New todo without ID - generate UUID
        const newId = randomUUID();
        return TodoItemOutput.create(todo.content, todo.status, newId);
      }
    });

    // Replace the entire batch with the processed todos
    currentBatch = processedTodos;

    // Check if all todos are completed
    const allCompleted = currentBatch.every((todo) => todo.isCompleted());
    let message: string | undefined;

    if (allCompleted && currentBatch.length > 0) {
      // Clear the batch if all todos are completed
      currentBatch = [];
      message = "All todos completed. Batch cleared.";
    }

    return Effect.succeed({
      todos: currentBatch,
      message,
    });
  },
});
