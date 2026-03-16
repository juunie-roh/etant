# symbex

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?logo=opensourceinitiative&logoColor=fff)](https://opensource.org/licenses/MIT)

A language-agnostic scope graph provider. symbex parses source files using Tree-Sitter, extracts every name binding and scope boundary, and exposes the result as a queryable graph of nodes and edges.

The graph is the product. What queries it — an AI assistant, an IDE, a documentation generator, a refactoring tool — is up to the consumer.

## Purpose

Current code retrieval operates on text. Searches match on lexical proximity; results include code that *mentions* a concept rather than code that *performs* it; structural relationships like inheritance and containment are invisible.

symbex approaches this differently: parse once, index structurally, query structurally. The index stores every scope and every name introduced within it. A scope is a region where names are valid — a file, a function body, a class body. A binding is a name introduced into a scope — a declaration, a parameter, an import. Some constructs are both: a function is introduced into its parent scope and creates a new scope for its own locals.

The output is a **scope graph**: a directed graph where nodes are declarations and scopes, and edges are structural relationships — containment (`defines`), inheritance (`extends`, `implements`), and module dependencies (`imports`).

Reference and call edges are not stored; they can be derived on demand by walking the binding graph.

Structural indexing removes invalid states from the generation space. If a function is not in the index, it cannot be referenced. The graph does not correct hallucinations after the fact — it prevents them.

## Architecture

### Responsibilities

symbex separates concerns across three layers:

**Language plugin** — interprets the raw Tree-Sitter AST for a specific language. Faithfully extracts every construct the parser exposes and maps it to the common node/edge schema. Makes no decisions about what is important. Two phases:

- `capture` — runs tree-sitter queries against AST nodes and returns typed match results. Complete, no filtering.
- `convert` — transforms captures into graph nodes and edges. Semantic decisions happen here: what kind to assign, what edges to emit, when to recurse into child scopes.

**Core** — owns the schema, the graph, and the query API. Receives `Node[]` and `Edge[]` from plugins without knowing anything about the source language. Builds the graph, resolves unresolved edge targets by walking the scope chain, and exposes the result for consumption.

**Abstraction plugin** *(planned)* — a lens over the raw graph. Decides what story to tell from the plugin output: what constructs are promoted to first-class nodes, what gets flattened, what gets excluded. Multiple abstraction plugins can produce different views — a mind map, a full-fidelity graph, a public API surface — over the same underlying data.

### Data Model

All output is two types:

- **Node** — a code entity with a unique human-readable `signature` (e.g. `src/utils/parse.ts::parseDate`, `src/logger.ts::Logger::dispatch`), a `kind`, a `type` role (`scope`, `binding`, or `anonymous`), an optional source `range`, and optional language-specific `props`.
- **Edge** — a directed relationship between two nodes (`from` → `to`) with a `kind` and optional `props`. Edges may be unresolved (target referenced by name) or resolved (target is a full signature) at build time.

Node signatures use `::` as a scope delimiter. The delimiter encodes containment, which the graph's resolver uses to walk upward when resolving unresolved names.

### Node Roles

Every node falls into one of three categories:

| Role | Description | Example `kind` values |
| ---- | ----------- | --------------------- |
| **scope** | Introduces names, is not itself introduced | `file`, `module` |
| **scope + binding** | Introduces names and is introduced into a parent scope | `function`, `class`, `method` |
| **binding** | Is introduced, does not introduce names | `variable`, `member`, `import` |

### Plugin System

Each language lives in `packages/<lang>/` as a separate workspace package, loaded at runtime. A plugin exports `capture`, `convert`, `language` (the Tree-Sitter binding), and optionally `toDot` for Graphviz output.

Query patterns are written in `.scm` files (Tree-Sitter's query language), one file per construct. Core provides an esbuild plugin (`scmPlugin`) that normalizes and bundles them at build time. Plugins compose a `QueryMap` from these files and wire it into `capture` and `convert` via factory functions from core (`createCapture`, `createConvert`).

## Prerequisites

- **Node.js 22+** — Node 22 uses prebuilt Tree-Sitter binaries. Node 24 and 25 build from source and additionally require `python3`, `make`, and `g++` with C++20 support.
- **pnpm** — workspace manager.
- On Node 24/25, set `CXXFLAGS="-std=c++20"` before installing.

## Usage

```bash
# Install dependencies (Node 24/25: prefix with CXXFLAGS="-std=c++20")
pnpm install

# Build core
pnpm build

# Build all packages
pnpm build && pnpm -r build

# Type check everything
pnpm -r check-types && pnpm check-types

# Run CLI against mock data
pnpm run:dev

# Watch mode
pnpm dev

# Lint
pnpm lint

# Tests
pnpm test
```

To work on a specific language plugin:

```bash
pnpm ts <script>   # --filter @juun-roh/spine-typescript
pnpm tsx <script>  # --filter @juun-roh/spine-tsx
```
