import { Effect, Ref } from "effect";
import { TodoItem } from "./types.js";

// Simplified Todo Store Service - only exposes what's actually used
export class TodoStore extends Effect.Service<TodoStore>()("TodoStore", {
  effect: Effect.gen(function* () {
    const batchRef = yield* Ref.make<TodoItem[]>([]);

    return {
      // Write todos (replaces entire batch)
      writeTodos: (
        inputs: Array<{
          readonly content: string;
          readonly status: "pending" | "in_progress" | "completed";
          readonly id?: string | undefined;
        }>,
      ) =>
        Effect.gen(function* () {
          // Process todos and generate IDs for new items
          const processedTodos: TodoItem[] = [];
          for (const input of inputs) {
            const todo = yield* TodoItem.create(
              input.content,
              input.status,
              input.id,
            );
            processedTodos.push(todo);
          }

          // Replace the entire batch
          yield* Ref.set(batchRef, processedTodos);

          // Check if all todos are completed
          const allCompleted = processedTodos.every((todo) =>
            todo.isCompleted(),
          );

          // Store the current batch before potentially clearing it
          const todosToReturn = [...processedTodos];

          if (allCompleted && processedTodos.length > 0) {
            // Clear the batch if all todos are completed
            yield* Ref.set(batchRef, []);
          }

          return {
            todos: todosToReturn,
          };
        }),
    };
  }),
}) {}
