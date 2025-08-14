# Memory Manager

**Project Type**: Production-ready Effect-TS application for intelligent memory management
**Purpose**: Auto-classifies and curates long-term vs transient memories using AI models
**Architecture**: Functional programming with Effect-TS services, pure effects, and composable pipelines

## 🧠 Core Purpose

Memory Manager is a sophisticated memory management system that:

- **Retrieves memories** via OpenMemory API
- **Classifies content** using 3 distinct AI models (Gemini, Grok-3, GPT-4o)
- **Calculates consensus** across model results
- **Automatically deletes** transient memories with high confidence
- **Preserves long-term** and uncertain memories

## 🏗️ Architecture Overview

### Effect-TS Foundation

- **Service Pattern**: All functionality isolated in composable Effect services
- **Pure Functions**: No side effects, comprehensive error handling
- **Dependency Injection**: Layer system for clean separation
- **Type Safety**: Full Effect Schema validation and compile-time types

### Core Services

1. **OpenMemory** (`src/services/OpenMemory.ts`): API integration for memory CRUD
2. **MemoryClassification** (`src/services/MemoryClassification.ts`): AI-powered content analysis
3. **ConsensusService** (`src/services/ConsensusService.ts`): Multi-model consensus calculation

## 📊 Tech Stack

### Production Dependencies

- `@effect/ai` (0.21.15) - AI integration framework
- `@effect/ai-openai` (0.24.15) - OpenAI and OpenRouter integration
- `@effect/platform` (0.87.11) - Platform services and HTTP client
- `@effect/platform-bun` (0.72.15) - Bun runtime support
- `effect` (3.16.12) - Core Effect-TS library

### Dev Tools

- **Testing**: Bun test (no tests currently implemented)
- **Linting**: ESLint + @effect/eslint-plugin + typescript-eslint
- **Formatting**: dprint with Effect-TS configuration
- **Type Checking**: TypeScript with strict settings
- **Build**: Bun native compilation (`bun build`)

## 🔧 Development Commands

```bash
# Development
bun run dev              # Run in dev mode with hot reload
bun run build            # Build production bundle
bun run start            # Build + run production

# Code Quality
bun run test             # Run tests (none present)
bun run lint             # ESLint check
bun run lint:fix         # Auto-fix lint issues
bun run typecheck        # TypeScript validation
bun run format           # Code formatting with dprint
```

## 🔑 Environment Configuration

Create `.env` file for API credentials:

```bash
# OpenMemory API
OPENMEMORY_BASE_URL=https://api.openmemory.dev/api/v1
OPENMEMORY_BEARER_TOKEN=your_openmemory_bearer_token

# OpenRouter (multi-model AI access)
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_API_KEY=your_openrouter_api_key
```

## 🎯 Memory Classification Categories

### Transient (Auto-delete candidates)

- Temporary reminders, time-sensitive tasks
- Context-deficient activity logs
- Incomplete financial data
- Short-term status updates

### Long-term (Always preserve)

- Core knowledge and insights
- Personal facts (location, demographics, preferences)
- Valuable references and procedures
- Significant events and discoveries

### Uncertain/Safety (Preserve when unsure)

- Model disagreements
- Low confidence classifications
- Failed model responses

## 🤖 AI Models Used

Via OpenRouter single API:

- **Gemini 2.5 Flash** (google/gemini-2.5-flash) - Fast classification
- **Grok-3** (x-ai/grok-3) - Advanced reasoning
- **GPT-4o** (openai/gpt-4o) - Balanced performance

## 🔄 Operational Flow

1. **Fetch**: Paginated retrieval of all memories
2. **Classify**: Parallel AI analysis across 3 models
3. **Consensus**: Majority voting with confidence scoring
4. **Decide**: Auto-delete transient with ≥70% confidence
5. **Act**: Safe deletion via API, preserve all others

## 📁 Project Structure

```
src/
├── index.ts                    # Main Effect pipeline
├── types.ts                    # Effect Schema validation
└── services/
    ├── OpenMemory.ts           # API service layer
    ├── MemoryClassification.ts # AI classification
    └── ConsensusService.ts     # Multi-model consensus
```

## 🛡️ Security & Safety

- **API Credentials**: Stored in .env, never committed
- **Validation**: Runtime schema validation for all API responses
- **Error Handling**: Comprehensive typed errors throughout
- **Fail-over**: Low confidence/uncertain cases default to preservation
- **No test data**: Clean repository with no sensitive data

## ⚡ Bun-Specific Optimizations Used

- `Bun.serve()` - Native HTTP server instead of express
- `bun:sqlite` - Although not used (OpenMemory API preferred)
- `bun build` - Native bundling with minification
- `bun run` - Streamlined development commands
- Auto-loading .env (dotenv not imported)

## 🔍 Key Findings from Review

### Strengths ✅

- **Exceptional architecture**: Pure functional approach with Effect-TS
- **Robust error handling**: Typed errors with recovery strategies
- **Clean separation**: Services isolated via dependency injection
- **Excellent documentation**: README accurately describes implementation
- **Production-ready**: Proper schema validation and API handling

### Development Opportunities 🔧

- **Missing tests**: No unit tests currently implemented
- **No monitoring**: Could benefit from telemetry/logging service
- **Config validation**: Environment variable validation could be enhanced
- **Batch processing**: Current per-memory processing could be batched

### Security Status ✅

- **Clean codebase**: No malicious content detected
- **Proper credential handling**: Environment variables for sensitive data
- **No exposed secrets**: API keys in environment variables only

---

# Bun Development Standards

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";

// import .css files directly and it works
import './index.css';

import { createRoot } from "react-dom/client";

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.md`.
