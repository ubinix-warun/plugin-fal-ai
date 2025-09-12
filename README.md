# ElizaOS Plugin: fal-ai Text-to-Video

A backend-only ElizaOS plugin integrating [fal.ai](https://fal.ai/) for text-to-video generation. This template provides a minimal implementation for adding AI-powered video creation to your agent, with no frontend complexity.

## Overview

This plugin enables:

- Backend text-to-video generation via fal.ai API
- Simple API integration for video creation
- Agent actions for generating videos from prompts
- Contextual providers for video metadata
- Lightweight, fast development

## Structure

```
plugin-fal-ai/
├── src/
│   ├── __tests__/          # Test directory
│   │   ├── e2e/            # E2E tests
│   │   │   ├── plugin-fal-ai.e2e.ts
│   │   │   └── README.md
│   │   ├── plugin.test.ts  # Component tests
│   │   └── test-utils.ts   # Test utilities
│   ├── plugin.ts           # Main plugin implementation
│   └── index.ts            # Plugin export
├── scripts/
│   └── install-test-deps.js
├── tsup.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Getting Started

1. **Create your plugin:**

  ```bash
  elizaos create fal-ai-text-to-video
  # Select: Plugin
  # Select: Quick Plugin (Backend Only)
  ```

2. **Navigate to your plugin:**

  ```bash
  cd fal-ai-text-to-video
  ```

3. **Install dependencies:**

  ```bash
  bun install
  ```

4. **Start development:**
  ```bash
  bun run dev
  ```

## Key Features

- Minimal dependencies (`@elizaos/core`, `zod`, `node-fetch`)
- Backend-only, no frontend code
- Fast builds and test cycles
- Comprehensive unit and E2E tests

## Plugin Components

### Action: Generate Video

Implements agent capability to generate a video from a text prompt using fal.ai:

```
TBD
```

## Development Commands

```bash
bun run dev        # Development mode
bun run start      # Production mode
bun run build      # Build plugin
bun test           # Run tests
bun run format     # Format code
```

## Testing

- **Component Tests** (`src/__tests__/*.test.ts`): Use Bun test runner for unit logic.
- **E2E Tests** (`src/__tests__/e2e/*.e2e.ts`): Use ElizaOS test runner for integration.

### Example Component Test

```
TBD
```

## Publishing

1. Update `package.json` with plugin details
2. Build: `bun run build`
3. Publish: `elizaos publish`

## When to Use

Choose this plugin if you need:

- ✅ Backend text-to-video generation
- ✅ Simple API integration
- ✅ Lightweight, fast development

Not suitable for:

- ❌ Frontend UI components
- ❌ Complex user interactions

## License

This plugin is part of the ElizaOS project.
