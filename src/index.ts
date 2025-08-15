import { FetchHttpClient } from "@effect/platform";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Effect, Layer } from "effect";
import { runChatLoop } from "./chat.js";
import { ClientLayer, ModelLayer } from "./client.js";
import { toolKitLayer } from "./tools.js";
import { showWelcomeBox } from "./ui.js";

const main = Effect.gen(function* () {
  yield* showWelcomeBox;
  yield* runChatLoop;
});

// Close ClientLayer over its dependency (HttpClient)
const ClientLive = ClientLayer.pipe(
  Layer.provide(FetchHttpClient.layer) // now R = never for ClientLive
);

// ModelLayer depends on OpenAiClient, which ClientLive provides
const ModelLive = ModelLayer.pipe(
  Layer.provide(ClientLive) // R = never as well
);

// Build the full application layer graph
const AppLayer = Layer.mergeAll(
  toolKitLayer, // already self-contained (handlers closed over TodoStore)
  ModelLive, // provides Model service, no deps
  ClientLive, // provides OpenAiClient, no deps
  FetchHttpClient.layer, // still export HttpClient so others can use it
  BunContext.layer
);

// Supply the layer once and run the program
main.pipe(Effect.provide(AppLayer), BunRuntime.runMain);
