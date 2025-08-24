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

**Calculus** is a CLI chatbot built with **EffectTS** and **Bun** that provides AI conversation with web scraping capabilities. The application follows functional programming patterns with Effect's type-safe abstractions.

### Core Structure

- **Entry Point**: `src/index.ts` - Main application entry point and layer composition
- **Chat Logic**: `src/chat.ts` - Chat functionality and conversation management
- **Client Setup**: `src/client.ts` - OpenRouter client configuration and setup
- **AI Tools**: `src/tools.ts` - AI toolkit with web scraping and utility tools
- **Data Types**: `src/types.ts` - Schema.Class definitions for application data structures
- **State Management**: `src/stores.ts` - Effect services for state management and domain operations
- **UI Components**: `src/ui.ts` - Console UI components and formatting
- **Runtime**: Uses BunRuntime for Effect program execution
- **AI Integration**: Uses `@effect/ai` with OpenRouter endpoints via `@effect/ai-openai`

### Key Patterns

- **Effect Composition**: Main logic uses `Effect.gen` for monadic composition
- **Layer Architecture**: HTTP client, AI model, and OpenRouter client are provided as layers
- **Configuration**: Environment-based config using `Config.string` and `Config.redacted`
- **Console UI**: Custom ASCII box formatting with ANSI escape codes for styling
- **AI Tools**: Custom toolkit with web scraping, search, and utility functions

### Dependencies

- **Effect Ecosystem**: Core Effect libraries for functional programming
- **AI**: `@effect/ai` and `@effect/ai-openai` for language model integration
- **Platform**: `@effect/platform` and `@effect/platform-bun` for runtime abstractions
- **CLI**: `@effect/cli` for command-line interface

### AI Tools

The application includes these AI tools:

- **clock**: Returns current date and time with customizable formatting ('short', 'long', 'iso')
- **todos**: Manages task lists for progress tracking and project planning
- **search**: Web search via BrightData (Google, Bing, Yandex)
- **fetch**: Web page content extraction to markdown

### Configuration

The app expects these environment variables:

- `OPENROUTER_API_KEY` - OpenRouter API authentication key
- `BRIGHTDATA_API_KEY` - BrightData API key for web scraping
- `BRIGHTDATA_UNLOCKER_ZONE` - BrightData zone identifier

The OpenRouter endpoint is hardcoded to `https://openrouter.ai/api/v1` and the default model is configured as `anthropic/claude-sonnet-4` with temperature 0.5.

## Web Intelligence

The application integrates with BrightData for advanced web scraping capabilities:

- **Search Engine Access**: Query Google, Bing, and Yandex through proxy networks
- **Content Extraction**: Convert web pages to clean markdown format
- **Anti-Detection**: Bypass bot detection and access protected content
- **Global Network**: Enterprise-grade proxy infrastructure

## State Management

Uses Effect services with `Effect.Ref` for fiber-safe state management:

- **TodoStore**: Manages task lists with CRUD operations
- **Centralized Dependencies**: Layer-based dependency injection
- **Type Safety**: Schema validation for all data structures

## Feature Planning & Task Management

### Hierarchical Task Structure

When planning features and creating tasks, ALWAYS use hierarchical structure:

- **Parent Feature Task**: High-level business context with clear acceptance criteria
  - Example: "Implement Claude Tool Integration for AI Agent"
  - Captures business value, scope, and overall outcome
  - Acts as umbrella for all implementation work

- **Sub-tasks**: Atomic implementation work organized under parent
  - Example: "012.01 - Design Claude tool schema and interface"
  - Individual deliverables that roll up to the feature
  - Clear dependencies and logical sequence

### Task Management Guidelines

- **Use project-manager-backlog agent** for creating structured task breakdowns
- **Parent tasks** define scope boundaries and prevent scope creep
- **Sub-tasks** handle granular implementation details
- **Progress tracking** at both feature and implementation levels
- **Clear acceptance criteria** for objective success measurement

### Benefits of Hierarchical Structure

- Clear communication at appropriate levels (business vs technical)
- Better dependency management between features
- Improved progress visibility for stakeholders
- Consistent project organization across all features
