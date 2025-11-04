---
title: 'CLI Architecture'
weight: 40
---

# CLI Architecture

## Overview

The AsyncAPI CLI is built with [oclif](https://oclif.io/) and provides both command-line operations and a REST API server for working with AsyncAPI specifications.

## Architecture

The CLI follows a **layered architecture**:

```
┌─────────────────────────────────────────────┐
│  Entry Points                                │
│  ┌──────────┐         ┌──────────┐          │
│  │   CLI    │         │   API    │          │
│  │  (oclif) │         │ (Express)│          │
│  └────┬─────┘         └────┬─────┘          │
└───────┼────────────────────┼────────────────┘
        └────────┬───────────┘
                 │
    ┌────────────▼─────────────┐
    │   Domain Services        │
    │  Validation, Generator,  │
    │  Convert, Config, etc.   │
    └────────────┬─────────────┘
                 │
    ┌────────────▼─────────────┐
    │   Domain Models          │
    │  Specification, Context  │
    └────────────┬─────────────┘
                 │
    ┌────────────▼─────────────┐
    │   Utilities              │
    │  Logger, Helpers         │
    └──────────────────────────┘
```

## Directory Structure

```
src/
├── apps/                    # Application Layer
│   ├── cli/                # CLI commands & internals
│   └── api/                # REST API (Express)
│
├── domains/                # Domain Layer
│   ├── models/            # Specification, Context
│   └── services/          # Business logic
│
├── errors/                 # Custom errors
├── interfaces/             # TypeScript types
└── utils/                  # Utilities
```

## Core Components

### CLI Application (`src/apps/cli/`)

**Entry Points:**
- `bin/run` - Development (NODE_ENV=development)
- `bin/run_bin` - Production (NODE_ENV=production)

**Base Command** (`internal/base.ts`):
- Metrics collection
- AsyncAPI parser integration
- Error handling
- Specification management

**Commands:**
- **Core**: `validate`, `convert`, `format`, `optimize`, `diff`, `bundle`
- **Generation**: `generate client`, `generate models`, `generate fromTemplate`
- **Config**: `config context`, `config analytics`, `config versions`
- **Utility**: `new file`, `new template`, `start api|studio|preview`, `pretty`

### API Server (`src/apps/api/`)

**Controllers:** `/v1/validate`, `/v1/parse`, `/v1/generate`, `/v1/convert`, `/v1/bundle`, `/v1/diff`, `/v1/docs`, `/v1/help`, `/v1/version`

**Features:**
- Express with security (Helmet), CORS, compression
- Problem middleware (RFC 7807) for errors
- Request/response logging

### Domain Services (`src/domains/services/`)

All services extend `BaseService` and return `ServiceResult<T>`:

```typescript
interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  diagnostics?: any[];
}
```

**Services:**
- `ValidationService` - Validates specs with Spectral, calculates scores
- `GeneratorService` - Generates code/models (v1 & v2 generators)
- `ConvertService` - Converts between AsyncAPI/OpenAPI formats
- `ConfigService` - Manages CLI config and contexts
- `ArchiverService` - Creates ZIP archives

### Domain Models (`src/domains/models/`)

**Specification** (`SpecificationFile.ts`):
- Loads from file, URL, or context
- Auto-detects `asyncapi.json|yml|yaml` in current directory
- Supports proxy configuration for URLs

**Context** (`Context.ts`):
- Manages multiple AsyncAPI contexts
- Stored in `~/.asyncapi/`
- Tracks current active context

### Error Handling (`src/errors/`)

Custom error classes:
- `ContextError` - Context-related errors
- `SpecificationFileError` - File loading errors
- `ValidationError` - Validation errors
- `GeneratorError` - Generator errors
- `DiffError` - Diff operation errors

## Execution Flow

### CLI Command

```
User Command → Entry Point → oclif → Base Command → Command.run()
                                                      ↓
                                              Domain Service
                                                      ↓
                                              ServiceResult
```

### API Request

```
HTTP Request → Express → Controller → Domain Service → ServiceResult → HTTP Response
```

## Build Process

1. Clean `lib/` directory
2. Generate types (languages, etc.)
3. Compile TypeScript
4. Resolve path aliases
5. Generate oclif manifest

## Technology Stack

**Core:**
- oclif (CLI framework)
- TypeScript
- Express (API server)

**AsyncAPI Tools:**
- @asyncapi/parser, @asyncapi/generator, @asyncapi/converter
- @asyncapi/bundler, @asyncapi/diff, @asyncapi/optimizer
- @stoplight/spectral-cli

**Supporting:**
- winston (logging), ajv (validation), chalk (colors)
- @clack/prompts (interactive prompts)

## Extension Points

### Add New Command
1. Create file in `src/apps/cli/commands/`
2. Extend base `Command` class
3. Define flags/args
4. Implement `run()` method
5. Use domain services

### Add New API Endpoint
1. Create controller in `src/apps/api/controllers/`
2. Implement `Controller` interface
3. Register in `src/apps/api/index.ts`
4. Use domain services

### Add New Service
1. Create file in `src/domains/services/`
2. Extend `BaseService`
3. Return `ServiceResult<T>`
4. Use in commands/controllers

## Configuration

**CLI Context:** `~/.asyncapi/contexts.json`, `~/.asyncapi/.current`

**Analytics:** `~/.asyncapi-analytics` (configurable via `asyncapi config analytics`)

**Environment Variables:**
- `NODE_ENV` - `development` | `production` | `test`
- `PORT` - API server port (default: 3000)
- `ASYNCAPI_METRICS_*` - Metrics configuration
