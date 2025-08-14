import { FetchHttpClient } from "@effect/platform";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Effect } from "effect";
import { runChatLoop } from "./chat.js";
import { ClientLayer, ModelLayer } from "./client.js";
import { toolKitLayer } from "./tools.js";
import { showWelcomeBox } from "./ui.js";

const main = Effect.gen(function* () {
  yield* showWelcomeBox;
  yield* runChatLoop;
});

main.pipe(
  Effect.provide(toolKitLayer),
  Effect.provide(ModelLayer),
  Effect.provide(ClientLayer),
  Effect.provide(FetchHttpClient.layer),
  Effect.provide(BunContext.layer),
  BunRuntime.runMain,
);
