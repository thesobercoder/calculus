import { Schema } from "effect";

// Todo data structure (matches TodoWrite tool format)
export class TodoItemInput extends Schema.Class<TodoItemInput>("TodoItemInput")(
  {
    content: Schema.String,
    status: Schema.Literal("pending", "in_progress", "completed"),
    id: Schema.optional(Schema.String),
  },
) {
  static create(
    content: string,
    status: "pending" | "in_progress" | "completed" = "pending",
    id?: string,
  ) {
    return new TodoItemInput({ content, status, id });
  }
}

export class TodoItemOutput extends Schema.Class<TodoItemOutput>(
  "TodoItemOutput",
)({
  content: Schema.String,
  status: Schema.Literal("pending", "in_progress", "completed"),
  id: Schema.String,
}) {
  static create(
    content: string,
    status: "pending" | "in_progress" | "completed" = "pending",
    id: string,
  ) {
    return new TodoItemOutput({ content, status, id });
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
