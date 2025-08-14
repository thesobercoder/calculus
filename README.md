# Memory Manager

An intelligent memory management system **powered by Effect-TS** that automatically classifies and curates personal memories using multiple AI models and consensus-based decision making.

## Overview

Memory Manager is built from the ground up with **Effect-TS at its heart** - leveraging functional programming, type safety, and composable effects to create a robust and reliable memory curation system. It integrates with the OpenMemory API to fetch, classify, and automatically delete transient memories while preserving valuable long-term information using a sophisticated multi-model consensus approach with advanced prompt engineering.

**Effect-TS enables:**

- **Composable Effects**: Clean separation of concerns with dependency injection
- **Type-Safe Error Handling**: Comprehensive error recovery without exceptions
- **Resource Management**: Automatic cleanup and resource safety
- **Testability**: Pure functions and dependency injection make testing straightforward
- **Concurrency**: Safe parallel execution of AI model classifications

## Features

- **Effect-TS Foundation**: Built entirely on Effect-TS for functional programming, composable effects, and bulletproof error handling
- **Multi-Model Classification**: Uses 3 different AI models (google/gemini-2.5-flash, x-ai/grok-3, openai/gpt-4o) accessed through OpenRouter for robust memory classification
- **Consensus-Based Decision Making**: Combines results from multiple models using Effect's parallel execution capabilities
- **Intelligent Memory Curation**: Automatically deletes transient memories with high confidence while preserving long-term valuable information
- **Advanced Prompt Engineering**: Sophisticated system prompts with detailed examples and classification criteria
- **Type-Safe Architecture**: Full compile-time safety with Effect Schema validation and typed errors
- **Dependency Injection**: Clean, testable architecture with Effect's service pattern
- **Comprehensive Logging**: Structured logging throughout the Effect pipeline

## Architecture

**Effect-TS is the heart of this application**, providing the functional programming foundation that makes complex memory management safe, predictable, and maintainable.

### Effect-TS Core Concepts Used

- **Effect<A, E, R>**: All operations are modeled as Effects with explicit success types, error types, and requirements
- **Service Pattern**: Dependencies are injected through Effect's service system
- **Layer System**: Configuration and implementation layers for clean separation
- **Schema Validation**: Runtime type checking with Effect Schema
- **Error Management**: Typed errors with comprehensive recovery strategies
- **Resource Safety**: Automatic cleanup and resource management

### Core Services (Effect Services)

- **OpenMemory**: Effect service handling communication with the OpenMemory API
- **MemoryClassification**: Effect service for AI-powered memory classification with multiple model support
- **ConsensusService**: Effect service calculating consensus from multiple model classifications

### The Effect Pipeline

The entire application flow is modeled as composable Effects, from memory fetching through AI classification to consensus-based deletion. Each step is pure, testable, and safely composable with comprehensive error handling built into the type system.

### Memory Classification Categories

- **Transient**: Temporary information, reminders, time-sensitive data (automatically deleted when consensus is confident)
- **Long-term**: Important facts, insights, persistent references (always preserved)
- **Unclassified**: Ambiguous or unclear content (always preserved by default)
- **Uncertain**: When models disagree or confidence is low (always preserved for safety)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) runtime
- OpenMemory API access
- OpenRouter API key (provides access to multiple AI models through a single API)

### Installation

```bash
bun install
```

### Environment Variables

Create a `.env` file with your API credentials:

```bash
# OpenMemory API
OPENMEMORY_BASE_URL=https://api.openmemory.dev/api/v1
OPENMEMORY_BEARER_TOKEN=your_openmemory_bearer_token

# OpenRouter API (provides access to multiple AI models)
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_API_KEY=your_openrouter_api_key
```

### Running the Application

```bash
# Development mode
bun run dev

# Production build and run
bun run start
```

## Development

### Available Scripts

```bash
# Development
bun run dev              # Run in development mode

# Building
bun run build            # Build for production

# Code Quality
bun run lint             # Run ESLint
bun run lint:fix         # Fix ESLint issues
bun run typecheck        # Run TypeScript type checking
bun run format           # Format code with dprint

# Testing
bun test                 # Run tests
```

### Project Structure

```
src/
├── index.ts                    # Main application entry point
├── types.ts                    # Type definitions and schemas
└── services/
    ├── OpenMemory.ts           # OpenMemory API integration
    ├── MemoryClassification.ts # AI-powered memory classification
    └── ConsensusService.ts     # Multi-model consensus logic
```

## How It Works (The Effect-TS Way)

Effect-TS orchestrates the entire memory management pipeline through composable, type-safe effects:

1. **Memory Fetching Effect**: Creates an Effect that retrieves all memories from OpenMemory API with automatic pagination and error recovery
2. **Parallel Classification Effects**: Uses `Effect.all` to run 3 AI model classifications concurrently, each returning either success or typed failure
3. **Consensus Calculation Effect**: Combines classification results using sophisticated logic that handles partial failures and disagreements
4. **Conditional Deletion Effect**: Only deletes memories with confident transient consensus, preserving everything else
5. **Logging Effects**: Structured logging throughout the pipeline for full observability

### Effect Benefits in Action

- **No Exceptions**: All errors are typed and handled explicitly in the Effect type system
- **Resource Safety**: HTTP clients, API connections automatically managed by Effect
- **Composability**: Each step is a pure Effect that can be combined, tested, and reasoned about independently
- **Dependency Injection**: Services are provided through Effect's Layer system, making testing and configuration straightforward
- **Concurrent Safety**: Parallel AI model calls are safe and efficient using Effect's concurrency primitives

### Classification Logic

The system uses sophisticated prompt engineering with:

- **Expert persona establishment** for consistent classification
- **Detailed examples** for each memory category
- **Context completeness rules** with exceptions for stable personal facts
- **Structured analysis criteria** (6-point rubric)
- **Confidence scoring** based on model agreement

## Configuration

### Memory Classification Models

The application uses three models accessed through OpenRouter for robust classification:

- **Gemini 2.5 Flash**: Fast, efficient classification
- **Grok-3**: Advanced reasoning capabilities
- **GPT-4o**: Balanced performance and accuracy

**OpenRouter Benefits:**

- Single API key for multiple AI providers
- Simplified authentication and billing
- Automatic failover and load balancing
- Cost optimization across providers

### Consensus Decision Making

The system uses sophisticated consensus logic with multiple failure handling scenarios:

- **Confident Transient**: High agreement between successful models → **Deletion**
- **Long-term Classification**: Any model classifies as long-term → **Preservation**
- **Low Confidence/Disagreement**: Models disagree or low confidence → **Uncertain classification → Preservation**
- **Model Failures**: If models fail to classify → **Preservation**
- **Safety First**: When in doubt, always preserve the memory

## API Integration

### OpenMemory API

- **GET /memories**: Paginated memory retrieval
- **DELETE /memories**: Bulk memory deletion

### Response Handling

- Comprehensive error handling with typed errors
- Graceful degradation on API failures
- Detailed logging for debugging and monitoring

## Type Safety (Effect-TS Schema System)

**Effect Schema is central to our type safety**, providing runtime validation and compile-time types for all data structures and API interactions. Every service is modeled as an Effect Service with full dependency injection, and all operations return properly typed Effects with explicit error handling.

**Effect-TS provides:**

- **Runtime Type Checking**: All API responses validated against schemas
- **Compile-time Safety**: TypeScript integration with Effect types
- **Tagged Errors**: Custom error types with full type information
- **Schema Composition**: Reusable validation logic
- **Automatic Serialization**: Safe data transformation

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the existing code style
4. Run tests and linting: `bun run lint && bun run typecheck`
5. Commit your changes: `git commit -m 'feat: add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## Development Tools

- **Effect-TS**: The heart of the application - functional programming framework with type safety and composable effects
- **TypeScript**: Full compile-time type safety, enhanced by Effect's type system
- **Effect Schema**: Runtime validation and type generation
- **ESLint with Effect Plugin**: Code linting with Effect-specific rules and best practices
- **dprint**: Code formatting
- **Bun**: Fast JavaScript runtime and package manager optimized for Effect applications

## Author

**Soham Dasgupta**\
Email: soham@thesobercoder.in

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues and questions, please check the logs for detailed error information. The application provides comprehensive logging for debugging classification decisions and API interactions.
