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

- **Entry Point**: `src/index.ts` - Main application entry point
- **Chat Logic**: `src/chat.ts` - Chat functionality and conversation management
- **Client Setup**: `src/client.ts` - OpenAI client configuration and setup
- **AI Tools**: `src/tools.ts` - AI toolkit with custom tools for enhanced functionality
- **Data Schemas**: `src/schemas.ts` - Schema.Class definitions for application data structures
- **UI Components**: `src/ui.ts` - Console UI components and formatting
- **Runtime**: Uses BunRuntime for Effect program execution
- **AI Integration**: Built on `@effect/ai` with OpenAI-compatible endpoints

### Key Patterns

- **Effect Composition**: Main logic uses `Effect.gen` for monadic composition
- **Layer Architecture**: HTTP client, AI model, and OpenAI client provided as layers
- **Configuration**: Environment-based config using `Config.string` and `Config.redacted`
- **Console UI**: Custom ASCII box formatting with ANSI escape codes for styling

## Configuration

The application requires these environment variables:

- `OPENAI_BASE_URL` - API endpoint URL (e.g., `https://api.openai.com/v1`)
- `OPENAI_API_KEY` - API authentication key

**Default Model**: `google/gemini-2.5-flash` with temperature `0.5`

## AI Tools

The application includes a custom AI toolkit (`src/tools.ts`) that extends the chatbot's capabilities:

### Available Tools

- **getCurrentDate**: Retrieves the current date and time in localized format
  - Description: "Get the current date and time"
  - Returns: Current datetime as a formatted string

- **writeTodo**: Manage a batch of todos
  - Description: "Manage a batch of todos. Provide an array of todo items to replace the entire batch. IDs are auto-generated for new items or use existing ID to update"
  - Parameters: `todos` (array of todo items with `content`, `status`, `id` (optional))
  - Status values: `"pending"`, `"in_progress"`, `"completed"`
  - ID Generation: Automatically generates unique IDs for new todos; include existing ID to update specific todos
  - Returns: Current batch of todos with generated IDs and optional message
  - Auto-clears: When all todos in a batch are marked `"completed"`, the entire batch is automatically cleared

### Toolkit Architecture

The AI toolkit is built using `@effect/ai` abstractions:

- **AiTool**: Individual tool definitions with schemas and descriptions
- **AiToolkit**: Collection of tools that can be used by the AI model
- **toolKitLayer**: Effect layer that provides tool implementations

This allows the AI model to call specific functions during conversations, enabling more dynamic and contextual responses.

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
│   ├── index.ts          # Main application entry point
│   ├── schemas.ts        # Schema.Class definitions for application data structures
│   ├── tools.ts          # AI toolkit with custom tools and implementations
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
