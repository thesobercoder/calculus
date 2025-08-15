# Monadic

An intelligent CLI chatbot built with **EffectTS** and **Bun**, featuring functional programming patterns and type-safe AI integration.

## Features

- 🤖 **AI-Powered Chat**: Interactive CLI chatbot with OpenAI-compatible API support
- ⚡ **EffectTS**: Built with Effect's functional programming abstractions for type safety and composability
- 🚀 **Bun Runtime**: Fast JavaScript runtime for optimal performance
- 🎨 **Rich Console UI**: Custom ASCII box formatting with ANSI escape codes
- 🔧 **Environment Configuration**: Flexible API endpoint and authentication setup

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) runtime installed
- OpenAI-compatible API access (OpenAI, local models, etc.)

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   bun install
   ```

3. Set up environment variables:
   ```bash
   export OPENAI_BASE_URL="your-api-endpoint"
   export OPENAI_API_KEY="your-api-key"
   ```

### Usage

#### Development Mode

```bash
bun run dev
```

#### Production Build

```bash
bun run build
bun run start
```

## Scripts

| Command             | Description                                      |
| ------------------- | ------------------------------------------------ |
| `bun run dev`       | Run the application directly with Bun            |
| `bun run build`     | Compile TypeScript to minified bundle in `dist/` |
| `bun run start`     | Build and run the compiled version               |
| `bun run lint`      | Run ESLint with Effect-specific rules            |
| `bun run lint:fix`  | Run ESLint with automatic fixes                  |
| `bun run format`    | Format code with syncpack and prettier           |
| `bun run typecheck` | TypeScript type checking without emit            |
| `bun test`          | Run test suite with Bun test runner              |

## Architecture

### Core Structure

- **Entry Point**: `src/index.ts` - Main application entry and layer composition
- **Chat Logic**: `src/chat.ts` - Chat functionality and conversation management
- **Client Setup**: `src/client.ts` - OpenAI client configuration and setup
- **AI Tools**: `src/tools.ts` - AI toolkit with custom tools and centralized handler dependencies
- **Data Types**: `src/types.ts` - Schema.Class definitions for application data structures
- **Business Logic**: `src/stores.ts` - Effect services for state management and domain operations
- **UI Components**: `src/ui.ts` - Console UI components and formatting
- **Runtime**: Uses BunRuntime for Effect program execution
- **AI Integration**: Built on `@effect/ai` with OpenAI-compatible endpoints

### Effect Architecture Patterns

#### 1. Schema.Class Pattern

TodoItem uses `Schema.Class` for type-safe data structures with built-in methods:

```typescript
export class TodoItem extends Schema.Class<TodoItem>("TodoItem")({
  content: Schema.String,
  status: Schema.Literal("pending", "in_progress", "completed"),
  id: Schema.String,
}) {
  static create(content: string, status = "pending", id?: string) {
    return Effect.sync(() => {
      const generatedId = id ?? crypto.randomUUID();
      return new TodoItem({ content, status, id: generatedId });
    });
  }
}
```

#### 2. Effect Services for State Management

TodoStore implements a Redux-like pattern using `Effect.Service` with `Effect.Ref` for fiber-safe state:

```typescript
export class TodoStore extends Effect.Service<TodoStore>()("TodoStore", {
  effect: Effect.gen(function* () {
    const batchRef = yield* Ref.make<TodoItem[]>([]);
    return {
      replaceBatch: (inputs) => /* Effect-based implementation */,
      addTodo: (content, status) => /* Effect-based implementation */,
      // ... other CRUD operations
    };
  })
}) {}
```

#### 3. Layer Composition and Dependency Injection

The application uses proper layer composition to resolve dependencies:

```typescript
// Close layers over their dependencies
const ClientLive = ClientLayer.pipe(Layer.provide(FetchHttpClient.layer));
const ModelLive = ModelLayer.pipe(Layer.provide(ClientLive));

// Merge all layers and provide in single call
const AppLayer = Layer.mergeAll(
  toolKitLayer, // self-contained with handler dependencies
  ModelLive, // provides Model service
  ClientLive, // provides OpenAiClient
  FetchHttpClient.layer,
  BunContext.layer,
);
```

#### 4. AiTool Handler Dependencies

AI tool handlers require `R = never` and use centralized dependency resolution:

```typescript
const HandlerDependencies = Layer.mergeAll(
  TodoStore.Default,
  // Future dependencies go here
);

const toolKitLayer = toolkit.toLayer({
  writeTodo: ({ todos }) =>
    Effect.gen(function* () {
      const todoStore = yield* TodoStore;
      return yield* todoStore.replaceBatch([...todos]);
    }).pipe(Effect.provide(HandlerDependencies)),
});
```

### Key Patterns

- **Effect Composition**: Main logic uses `Effect.gen` for monadic composition
- **Fiber-Safe State**: `Effect.Ref` for concurrent state management
- **Dependency Injection**: Layer-based dependency resolution with single `Effect.provide` calls
- **Schema Validation**: Runtime type checking with Effect's Schema system
- **Functional Error Handling**: Type-safe error propagation through Effect chains

## Configuration

The application requires these environment variables:

- `OPENAI_BASE_URL` - API endpoint URL (e.g., `https://api.openai.com/v1`)
- `OPENAI_API_KEY` - API authentication key

**Default Model**: `google/gemini-2.5-flash` with temperature `0.5`

## AI Tools

The application includes a custom AI toolkit (`src/tools.ts`) that extends the chatbot's capabilities with centralized dependency management:

### Available Tools

- **getCurrentDate**: Retrieves the current date and time in localized format
  - Description: "Get the current date and time in the user's local timezone"
  - Returns: Current datetime as a formatted string
  - Implementation: Pure function returning `new Date().toLocaleString()`

- **writeTodo**: Advanced todo batch management with Redux-like operations
  - Description: "Manage a batch of todos for task planning and progress tracking"
  - Parameters: `todos` (array of todo items with `content`, `status`, `id` (optional))
  - Status values: `"pending"`, `"in_progress"`, `"completed"`
  - Features:
    - **Auto ID Generation**: Automatically generates UUIDs for new todos
    - **Batch Replacement**: Replaces entire todo batch with provided array
    - **Auto-Clear**: When all todos are marked `"completed"`, batch is automatically cleared
    - **Persistence**: Uses TodoStore service for fiber-safe state management
  - Returns: Complete updated batch with all generated IDs

### Toolkit Architecture

The AI toolkit leverages Effect's dependency injection system:

#### Tool Definition

```typescript
const writeTodoTool = AiTool.make("writeTodo", {
  description: "Manage a batch of todos for task planning...",
  parameters: { todos: Schema.Array(/* todo schema */) },
  success: Schema.Struct({ todos: Schema.Array(TodoItem) }),
});
```

#### Centralized Dependencies

```typescript
const HandlerDependencies = Layer.mergeAll(
  TodoStore.Default,
  // Future dependencies: Logger.Default, Analytics.Default, etc.
);
```

#### Handler Implementation

```typescript
const toolKitLayer = toolkit.toLayer({
  writeTodo: ({ todos }) =>
    Effect.gen(function* () {
      const todoStore = yield* TodoStore;
      return yield* todoStore.replaceBatch([...todos]);
    }).pipe(Effect.provide(HandlerDependencies)),
});
```

This architecture enables:

- **Type Safety**: Full TypeScript inference for tool parameters and return types
- **Dependency Injection**: Clean separation of concerns with Effect services
- **Extensibility**: Easy addition of new tools and services
- **Testing**: Mockable dependencies for unit testing

## Dependencies

### Core Effect Ecosystem

- `effect` - Core Effect library for functional programming
- `@effect/ai` - AI abstractions and utilities
- `@effect/ai-openai` - OpenAI provider integration
- `@effect/platform` - Platform abstractions
- `@effect/platform-bun` - Bun-specific platform implementations
- `@effect/cli` - Command-line interface utilities

### Development Tools

- `@effect/eslint-plugin` - Effect-specific ESLint rules
- `@effect/language-service` - TypeScript language service enhancements
- `typescript-eslint` - TypeScript ESLint integration
- `prettier` - Code formatting
- `syncpack` - Package.json dependency management

## Project Structure

```
root/
├── src/
│   ├── chat.ts           # Chat functionality and conversation logic
│   ├── client.ts         # OpenAI client configuration and setup
│   ├── index.ts          # Main application entry point and layer composition
│   ├── stores.ts         # Effect services for state management (TodoStore)
│   ├── tools.ts          # AI toolkit with centralized handler dependencies
│   ├── types.ts          # Schema.Class definitions (TodoItem)
│   └── ui.ts             # Console UI components and formatting
├── dist/                 # Compiled output (generated)
├── node_modules/         # Dependencies (generated)
├── CLAUDE.md            # Development guidelines for Claude Code
├── LICENSE              # Project license
├── README.md            # Project documentation
├── bun.lock             # Bun lockfile
├── eslint.config.mjs    # ESLint configuration
├── package.json         # Project configuration and dependencies
└── tsconfig.json        # TypeScript configuration
```

### File Organization

- **`types.ts`**: Schema.Class definitions and domain models
- **`stores.ts`**: Effect services implementing business logic and state management
- **`tools.ts`**: AI toolkit with handler implementations and dependency management
- **`index.ts`**: Application bootstrap with proper layer composition
- **`client.ts`**: External service configuration (OpenAI client)
- **`chat.ts`**: Core application logic and user interaction
- **`ui.ts`**: Presentation layer and console formatting
