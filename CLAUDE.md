# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Build**: `bun run build` - Compiles TypeScript to minified bundle in dist/
- **Development**: `bun run dev` - Runs the application directly with Bun
- **Start**: `bun run start` - Builds and runs the compiled version
- **Lint**: `bun run lint` or `bun run lint:fix` - ESLint with Effect-specific rules
- **Format**: `bun run format` - Runs syncpack and prettier formatting
- **Type Check**: `bun run typecheck` - TypeScript type checking without emit
- **Test**: `bun test` - Runs Bun test runner

## Architecture

This is a CLI chatbot built with **EffectTS** and **Bun**. The application follows functional programming patterns with Effect's type-safe abstractions.

### Core Structure

- **Entry Point**: `src/index.ts` - Main application entry point
- **Chat Logic**: `src/chat.ts` - Chat functionality and conversation management
- **Client Setup**: `src/client.ts` - OpenAI client configuration and setup
- **UI Components**: `src/ui.ts` - Console UI components and formatting
- **Runtime**: Uses BunRuntime for Effect program execution
- **AI Integration**: Uses `@effect/ai` with OpenAI-compatible endpoints via `@effect/ai-openai`

### Key Patterns

- **Effect Composition**: Main logic uses `Effect.gen` for monadic composition
- **Layer Architecture**: HTTP client, AI model, and OpenAI client are provided as layers
- **Configuration**: Environment-based config using `Config.string` and `Config.redacted`
- **Console UI**: Custom ASCII box formatting with ANSI escape codes for styling

### Dependencies

- **Effect Ecosystem**: Core Effect libraries for functional programming
- **AI**: `@effect/ai` and `@effect/ai-openai` for language model integration
- **Platform**: `@effect/platform` and `@effect/platform-bun` for runtime abstractions
- **CLI**: `@effect/cli` for command-line interface

### Configuration

The app expects these environment variables:

- `OPENAI_BASE_URL` - API endpoint URL
- `OPENAI_API_KEY` - API authentication key

The default model is configured as "google/gemini-2.5-flash" with temperature 0.5.
