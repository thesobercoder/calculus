import { FetchHttpClient } from "@effect/platform";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Console, Effect, Layer } from "effect";
import { runChatLoop } from "./chat.js";
import { ClientLayer, ModelLayer } from "./client.js";
import { toolKitLayer } from "./tools.js";
import { showWelcomeBox } from "./ui.js";

const main = Effect.gen(function* () {
  yield* Console.clear;
  yield* showWelcomeBox;
  yield* runChatLoop;
});

const ClientLive = ClientLayer.pipe(Layer.provide(FetchHttpClient.layer));
const ModelLive = ModelLayer.pipe(Layer.provide(ClientLive));
const AppLayer = Layer.mergeAll(
  toolKitLayer,
  ModelLive,
  ClientLive,
  FetchHttpClient.layer,
  BunContext.layer,
);

main.pipe(Effect.provide(AppLayer), BunRuntime.runMain);
