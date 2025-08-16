# Calculus

A CLI chatbot built with EffectTS and Bun that provides AI conversation with web scraping capabilities.

## Features

- Interactive CLI chatbot using OpenRouter AI models
- Web search across Google, Bing, and Yandex
- Web page content extraction and conversion to markdown
- Task management and progress tracking
- Built with functional programming patterns

## Requirements

- [Bun](https://bun.sh/) runtime
- [OpenRouter](https://openrouter.ai/) API account
- [BrightData](https://brightdata.com/) account for web scraping

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your API keys:
   ```bash
   OPENROUTER_API_KEY=your-openrouter-api-key
   BRIGHTDATA_API_KEY=your-brightdata-api-key
   BRIGHTDATA_UNLOCKER_ZONE=your-brightdata-zone
   ```

## Usage

### Development

```bash
bun run dev
```

### Production

```bash
bun run build
bun run start
```

## Available Commands

| Command             | Description             |
| ------------------- | ----------------------- |
| `bun run dev`       | Run in development mode |
| `bun run build`     | Build for production    |
| `bun run start`     | Run production build    |
| `bun run lint`      | Run linter              |
| `bun run format`    | Format code             |
| `bun run typecheck` | Type check              |
| `bun test`          | Run tests               |

## AI Tools

The chatbot includes these tools:

### clock

Returns current date and time with customizable formatting options:

- `short`: Localized format (e.g., "8/16/2025, 3:57:12 PM")
- `long`: Full format (e.g., "Friday, August 16, 2025 at 03:57:12 PM")
- `iso`: ISO 8601 format (e.g., "2025-08-16T20:57:12.345Z")

### todos

Manages task lists for tracking progress on multi-step work and project planning.

### search

Searches the web using Google, Bing, or Yandex via BrightData proxy network.

### fetch

Extracts content from web pages and converts to clean markdown format.

## Environment Variables

- `OPENROUTER_API_KEY` - Your OpenRouter API key
- `BRIGHTDATA_API_KEY` - Your BrightData API key
- `BRIGHTDATA_UNLOCKER_ZONE` - Your BrightData zone identifier

## Setup Instructions

### OpenRouter

1. Create account at [openrouter.ai](https://openrouter.ai/)
2. Add credits to your account
3. Generate API key from dashboard
4. Add key to `.env` file

### BrightData

1. Create account at [brightdata.com](https://brightdata.com/)
2. Create an Unlocker zone
3. Copy zone identifier and API key
4. Add credentials to `.env` file

## Project Structure

```
src/
├── index.ts     # Application entry point
├── chat.ts      # Chat functionality
├── client.ts    # OpenRouter client configuration
├── tools.ts     # AI tools implementation
├── types.ts     # Data type definitions
├── stores.ts    # State management
└── ui.ts        # Console interface
```

## License

MIT
