import { Schema } from "effect";
import { randomUUID } from "crypto";

// Todo data structure (matches TodoWrite tool format)
export class TodoItem extends Schema.Class<TodoItem>("TodoItem")({
  content: Schema.String,
  status: Schema.Literal("pending", "in_progress", "completed"),
  id: Schema.String,
}) {
  // In-memory batch storage
  private static currentBatch: TodoItem[] = [];

  static create(
    content: string,
    status: "pending" | "in_progress" | "completed" = "pending",
    id?: string,
  ) {
    return new TodoItem({ content, status, id: id ?? randomUUID() });
  }

  static replaceBatch(
    inputs: Array<{
      readonly content: string;
      readonly status: "pending" | "in_progress" | "completed";
      readonly id?: string | undefined;
    }>,
  ): {
    todos: TodoItem[];
    message?: string;
  } {
    // Process todos and generate IDs for new items
    const processedTodos: TodoItem[] = inputs.map((input) => {
      if (input.id) {
        // Existing todo with ID - keep the ID
        return TodoItem.create(input.content, input.status, input.id);
      } else {
        // New todo without ID - generate UUID
        return TodoItem.create(input.content, input.status);
      }
    });

    // Replace the entire batch with the processed todos
    TodoItem.currentBatch = processedTodos;

    // Check if all todos are completed
    const allCompleted = TodoItem.currentBatch.every((todo) =>
      todo.isCompleted(),
    );
    // Store the current batch before potentially clearing it
    const todosToReturn = [...TodoItem.currentBatch];

    if (allCompleted && TodoItem.currentBatch.length > 0) {
      // Clear the batch if all todos are completed
      TodoItem.currentBatch = [];
    }

    return {
      todos: todosToReturn,
    };
  }

  static getCurrentBatch(): TodoItem[] {
    return TodoItem.currentBatch;
  }

  static clearBatch(): void {
    TodoItem.currentBatch = [];
  }

  isCompleted(): boolean {
    return this.status === "completed";
  }

  isPending(): boolean {
    return this.status === "pending";
  }

  isInProgress(): boolean {
    return this.status === "in_progress";
  }
}
