import { Schema } from "effect";

// Todo data structure (matches TodoWrite tool format)
export class TodoItem extends Schema.Class<TodoItem>("TodoItem")({
  content: Schema.String,
  status: Schema.Literal("pending", "in_progress", "completed"),
  id: Schema.String,
}) {
  static create(
    content: string,
    status: "pending" | "in_progress" | "completed" = "pending",
    id: string,
  ) {
    return new TodoItem({ content, status, id });
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
