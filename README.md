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

**Core** — owns the schema, the graph, and the query API. Receives `Node[]` and `Edge[]` from plugins without knowing anything about the source language. Builds the graph and exposes it for consumption. Name resolution by walking the scope chain is available as an on-demand operation rather than applied automatically at build time.

**Abstraction plugin** *(planned)* — a lens over the raw graph. Decides what story to tell from the plugin output: what constructs are promoted to first-class nodes, what gets flattened, what gets excluded. Multiple abstraction plugins can produce different views — a mind map, a full-fidelity graph, a public API surface — over the same underlying data.

### Data Model

All output is two types:

- **Node** — a code entity with a `path: NodePath` (an array of scope-chain segments, e.g. `["src/utils/parse.ts", "parseDate"]`), hashed to a compact `NodeId` inside the graph. A `kind` classifies the construct, a `type` role classifies its scope behavior, an optional `range` points back to the source location, and optional language-specific `props` are carried through opaquely.
- **Edge** — a directed relationship between two nodes (`from` → `to`, both `NodePath`) with a `kind` and optional `props`.

The graph encodes node paths as SHA-256-derived `NodeId` hashes via `HashRegistry`, enabling O(1) lookup in both directions without exposing the path structure to graph internals.

### Node Roles

Every node has a `type` field with one of three values:

| `type` | Description | Example `kind` values |
| ------ | ----------- | --------------------- |
| `"scope"` | A named scope — introduces names and is itself introduced into a parent scope | `function`, `class`, `method` |
| `"anonymous"` | An unnamed scope — introduces names but has no binding identity of its own | `if`, `switch`, `for`, `while` |
| `"binding"` | A pure binding — is introduced into a scope, does not introduce names | `variable`, `member`, `import` |

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
pnpm ts <script>   # --filter @symbex/typescript
pnpm tsx <script>  # --filter @juun-roh/symbex-tsx
```
