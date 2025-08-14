import { AiTool, AiToolkit } from "@effect/ai";
import { Effect, Schema } from "effect";

const getCurrentDateTool = AiTool.make("getCurrentDate", {
  description: "Get the current date and time",
  success: Schema.Struct({
    datetime: Schema.String,
  }),
});

export const toolkit = AiToolkit.make(getCurrentDateTool);

export const toolKitLayer = toolkit.toLayer({
  getCurrentDate: () => {
    return Effect.succeed({ datetime: new Date().toLocaleString() });
  },
});
