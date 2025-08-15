import { Effect, Ref, Schema } from "effect";

// Todo data structure (matches TodoWrite tool format)
export class TodoItem extends Schema.Class<TodoItem>("TodoItem")({
  content: Schema.String,
  status: Schema.Literal("pending", "in_progress", "completed"),
  id: Schema.String,
}) {
  static create(
    content: string,
    status: "pending" | "in_progress" | "completed" = "pending",
    id?: string
  ) {
    return Effect.sync(() => {
      const generatedId = id ?? crypto.randomUUID();
      return new TodoItem({ content, status, id: generatedId });
    });
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

// Todo Store Service (Redux-like pattern)
export class TodoStore extends Effect.Service<TodoStore>()("TodoStore", {
  effect: Effect.gen(function* () {
    const batchRef = yield* Ref.make<TodoItem[]>([]);

    return {
      // Get current batch
      getCurrentBatch: Effect.flatMap(Ref.get(batchRef), (batch) =>
        Effect.succeed([...batch])
      ),

      // Replace entire batch with new todos
      replaceBatch: (
        inputs: Array<{
          readonly content: string;
          readonly status: "pending" | "in_progress" | "completed";
          readonly id?: string | undefined;
        }>
      ) =>
        Effect.gen(function* () {
          // Process todos and generate IDs for new items
          const processedTodos: TodoItem[] = [];
          for (const input of inputs) {
            const todo = yield* TodoItem.create(
              input.content,
              input.status,
              input.id
            );
            processedTodos.push(todo);
          }

          // Replace the entire batch
          yield* Ref.set(batchRef, processedTodos);

          // Check if all todos are completed
          const allCompleted = processedTodos.every((todo) =>
            todo.isCompleted()
          );

          // Store the current batch before potentially clearing it
          const todosToReturn = [...processedTodos];

          if (allCompleted && processedTodos.length > 0) {
            // Clear the batch if all todos are completed
            yield* Ref.set(batchRef, []);
            return {
              todos: todosToReturn,
            };
          }

          return {
            todos: todosToReturn,
          };
        }),

      // Clear all todos
      clearBatch: Effect.flatMap(Ref.set(batchRef, []), () =>
        Effect.succeed(undefined)
      ),

      // Add a single todo
      addTodo: (
        content: string,
        status: "pending" | "in_progress" | "completed" = "pending"
      ) =>
        Effect.gen(function* () {
          const newTodo = yield* TodoItem.create(content, status);
          yield* Ref.update(batchRef, (batch) => [...batch, newTodo]);
          return newTodo;
        }),

      // Update a specific todo by ID
      updateTodo: (
        id: string,
        updates: Partial<{
          content: string;
          status: "pending" | "in_progress" | "completed";
        }>
      ) =>
        Effect.gen(function* () {
          const updated = yield* Ref.modify(batchRef, (batch) => {
            const index = batch.findIndex((todo) => todo.id === id);
            if (index === -1) {
              return [false, batch];
            }

            const existingTodo = batch[index]!;
            const updatedTodo = new TodoItem({
              content: updates.content ?? existingTodo.content,
              status: updates.status ?? existingTodo.status,
              id: existingTodo.id,
            });

            const newBatch = [...batch];
            newBatch[index] = updatedTodo;
            return [true, newBatch];
          });

          return updated;
        }),

      // Remove a todo by ID
      removeTodo: (id: string) =>
        Effect.gen(function* () {
          const removed = yield* Ref.modify(batchRef, (batch) => {
            const index = batch.findIndex((todo) => todo.id === id);
            if (index === -1) {
              return [false, batch];
            }

            const newBatch = batch.filter((todo) => todo.id !== id);
            return [true, newBatch];
          });

          return removed;
        }),
    };
  }),
}) {}
