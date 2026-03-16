# symbex: Language-Agnostic Scope Graph Provider

## Origin

This idea emerged from hands-on experience with the markdown processing pipeline in juun.vercel.app. The blog system's content pipeline is an AST transformation chain:

```text
Markdown String
  ↓ gray-matter (extract frontmatter)
Markdown AST (mdast)
  ↓ remark-gfm
Enhanced Markdown AST (tables, strikethrough, etc.)
  ↓ remark-rehype
HTML AST (hast)
  ↓ rehype-raw → rehype-unwrap-images
Processed HTML AST
  ↓ rehype-react (with custom component mappings)
React Elements (JSX)
```

This pipeline never treats markdown as text after the initial parse. Every transformation — mapping anchors to Next.js Links, images to optimized Next.js Image components with aspect ratio wrappers, code blocks to syntax-highlighted CodeBlocks — happens at the tree level. String matching couldn't perform these structural transformations.

Working with this daily produced the insight: if operating on ASTs is fundamentally more precise and efficient for content transformation, why does AI still retrieve code as text?

The idea was not derived from compiler theory or academic research. It was a cross-domain pattern transfer: a practical content pipeline problem → structural insight about ASTs → recognition that the same principle applies to code retrieval.

## The Problem

Current AI code assistants retrieve code through text-based search — semantic similarity on token sequences. This means:

- Search matches on lexical proximity, not computational structure
- The AI re-parses text into structural understanding on every retrieval
- Results include noise: code that *mentions* a concept vs. code that *performs* it

## The Proposal

Build a scope graph provider that extracts scope boundaries and name bindings from source code using tree-sitter, producing a queryable scope graph enriched with semantic relationships. The tool is consumer-agnostic — AI assistants, IDE navigation, documentation generators, refactoring tools, and dependency analysis are all valid consumers. The tool is the graph; what queries it is up to the consumer.

During development the goal evolved.

The initial motivation was improving AI context retrieval, but the resulting structure naturally forms a navigable symbol graph. Instead of treating the graph purely as an AI retrieval backend, it becomes a navigation surface for exploring program structure.

AI retrieval becomes just one consumer of this surface.

```text
Current:   AI → text search → fuzzy text matches → AI re-parses into understanding
Proposed:  AI → symbex → structural matches → AI uses results directly
```

Structural search removes invalid states from the generation space: if a function isn't in the index, it can't be referenced. This doesn't correct hallucinations after the fact — it prevents them.

## What This Actually Is: A Scope Graph

The unifying principle behind symbex is scope graph construction. Every query, handler, and bypass performs the same fundamental operation: identifying scope boundaries and extracting the names introduced within them.

A **scope** is a region of code where names are valid — a file, a function body, a class body, a block.

A **binding** is a name introduced into a scope — a variable declaration, a function name, a parameter, an import.

Some constructs are both: a function introduces a name into its parent scope (binding) and creates a new scope in which its own parameters and local declarations live (scope).

The `defines` edge is the scope-to-binding relationship. This is why in the output graph the node/edge count is nearly 1:1 — it's a scope containment tree. The graph visualization is literally a scope graph rendered spatially.

### Node Roles

Every node in the graph falls into one of three categories:

| Role | Description | Current `kind` values |
| ---- | ----------- | --------------------- |
| **Pure scope** | Introduces names, doesn't get introduced | `file`, `module` |
| **Scope + binding** | Introduces names AND is introduced into a parent scope | `function`, `class`, `method`, `abstract_class` |
| **Pure binding** | Gets introduced, doesn't introduce names | `variable`, `member`, `import`, `abstract_method` |

## Architecture

### Core Principle: AST as Entry Point, Not Container

The AST index does not hold full code content. Each AST node is a lightweight entry point that records structural metadata and points back to the source file and line range. Detailed code is accessed only when needed.

This means:

- Fast structural searches without loading all code into memory
- Memory-efficient: only load detailed code when the consumer actually needs it
- Fewer hallucinations: by constraining the view to an explicit structural index, non-existent functions can't be referenced and invalid dependencies can't be invented

### Three-Layer Plugin Architecture

The system is composed of three distinct layers with clear, narrow contracts:

```text
tree-sitter AST
    ↓
[language plugin]
        ↓
    capture()           → raw CaptureResult  (complete, minimal no opinions)
        ↓
    convert()           → shaped Node[] + Edge[]  (opinionated view)
    ↓
[core]                  → builds index, serves queries
```

Each layer has a single responsibility:

- **Language plugin**: faithfully converts what tree-sitter gives into the common schema. No filtering decisions, no abstraction judgments. Just be complete and honest.
- **Abstraction plugin**: decides what story to tell from the raw graph. What constructs are promoted to first-class nodes, what gets flattened, what gets excluded. Multiple abstraction plugins can produce different views over the same raw graph.
- **Core**: owns the schema, the index, and the query API. Operates on `Node[]` and `Edge[]` without knowing anything about the source language.

The three-way responsibility separation is:

```text
language plugin    →  what exists
abstraction plugin →  what matters
core               →  what's queryable
```

### Node Schema: A Human Vocabulary, a custom IR

The common `Node` schema is not a compiler intermediate representation. It is a formalization of the vocabulary developers already use when reasoning about code — concepts that are human-recognizable, cross-language, and aligned with how AI models represent code (having learned from human-written source and documentation).

The schema captures concepts that already have names: function, class, import, dependency, interface. These are stable across languages even when syntax varies wildly. Language-specific constructs that don't map to common vocabulary live in an optional `props` field that core passes through without interpreting.

This approach means the Node schema is discovered, not invented. The vocabulary already exists — symbex formalizes it.

Nodes must be recognizable to humans because:

- The target output is a navigable, mind map-style symbol graph
- AI models vectorize text based on human language — a human-legible schema is more aligned with model reasoning than a machine-optimized IR
- Contributors need to understand the schema to write plugins

### Data Model

All output is expressed as two types:

```ts
interface Node<K extends string = string> {
  signature: NodeSignature;   // unique, human-readable, colon-separated name
                              // e.g. "src/utils/parse.ts::parseDate"
                              //      "src/logger.ts::Logger::dispatch"
  kind: K;
  range?: Range;    // file location pointer
  props?: Record<string, unknown>;  // language-specific, core carries but does not interpret
}

interface Edge<K extends string = string> {
  from: NodeSignature;
  to: NodeSignature;       // may be a name (unresolved) or full Node ID (resolved)
  kind: K;
  resolved?: boolean;
  props?: Record<string, unknown>;
}
```

Node IDs use colon-separated scope hierarchy: `file::name` for top-level declarations, `file::class::method` for class members, `file::function::nested` for nested functions. The ID encodes scope, which the graph's edge resolver uses to walk upward when resolving unresolved names.

Language plugins declare their own `kind` vocabularies as constrained string unions:

```ts
type NodeKind = "module" | "function" | "class" | "method" | "member" | "variable";
type EdgeKind = "imports" | "implements" | "extends" | "defines" | "constrained";
```

Core operates on the `string` generic without knowing specific kinds.

### Semantic Declarations, Not Grammar Artifacts

symbex is a structure specifier over stabilized grammar expressions, not a grammar validator. Declarations are classified by what they semantically *are*, not how the parser internally represents them.

`const foo = () => {}` is a function declaration. The grammar sees a variable declarator with an arrow function value; symbex sees a function. The grammar detail is an implementation concern of the capture step, not something that leaks into the graph. This means:

- `function f() {}` and `const f = () => {}` both produce `kind: "function"` nodes
- `function f() {}` and `const f = function() {}` both produce `kind: "function"` nodes
- Assigned arrow functions in class bodies produce `kind: "method"` nodes

### Import Model: First-Class Bindings

Modules are represented as nodes. File-level `imports` edges point to module nodes representing the import source path. Imported identifiers are then introduced as bindings in the file scope. An import statement has two semantic meanings: it defines a name to be used in the file, and it references a source module. The graph captures both:

```text
file.ts —imports→ "source-module"     (file-level dependency)
file.ts —defines→ importedName        (scope-level binding)
```

The imported name node carries `props.source` for binding provenance. Aliased imports use the alias as the node name (the locally visible identifier) with `props.alias_of` pointing to the original name:

```ts
// import { foo as bar } from "module"
{ id: "file.ts::bar", kind: "variable", props: { alias_of: "foo", source: "module" } }
```

This makes import relationships queryable as graph structure rather than file metadata. You can ask "which file does this binding come from" or "which bindings reference a given module" through direct edge traversal.

File-level `imports` edges answer "what modules does this file depend on?" with a single adjacency lookup — no traversal of definition nodes required.

### Destructuring as Recursive Binding Extraction

Variable destructuring (`const { a, b: { c } } = obj`) introduces multiple flat bindings into the enclosing scope. A dedicated `pattern` query and handler recursively walks nested patterns — `object_pattern`, `array_pattern`, `rest_pattern`, `assignment_pattern` — bottoming out at `identifier` nodes that produce actual binding nodes.

The pattern handler is the recursive core. It dispatches on `node.type` and for compound patterns recurses via `convert(capture(pattern, "pattern"), parentId, "pattern")`. Leaf identifiers produce nodes; nested patterns produce more recursion. Default values and alias keys are captured at the pattern level via `@default` and `@key` captures. Declaration-level metadata (kind, type annotation) is attached by the variable handler via post-decoration after the pattern pipeline returns.

### Call Edges: Explicitly Deferred

Call edges are not stored in the graph.

Call relationships can be derived on demand by resolving the callee identifier through the scope graph. Since the scope graph already contains all bindings within each scope, call resolution is simply a scoped name lookup.

Storing call edges would duplicate information that can be reconstructed cheaply from the binding graph.

### Abstraction Plugin as Lens

The abstraction layer is where opinionated views are defined. The same raw graph can produce multiple views:

- **Mind map**: excludes anonymous functions, flattens callbacks into owner, surfaces named callables only
- **Full fidelity**: keeps everything the language plugin produces
- **Public API surface**: strips internal functions, surfaces only exported callables

The abstraction plugin is a lens, not a filter. Same underlying data, different perspectives. This makes getting the abstraction level wrong recoverable — replace just that layer without touching the parse pipeline or index.

The abstraction layer currently exists implicitly within the plugin's convert functions rather than as a distinct component. Formalizing it as a separate layer is planned but deferred until the plugin architecture settles.

## Plugin Architecture

### Capture / Convert Pipeline

The plugin architecture is built around a two-phase pipeline:

**`capture()`** — runs tree-sitter queries against AST nodes and returns typed match results. Faithful extraction — no filtering or semantic interpretation.

**`convert()`** — transforms captures into graph nodes and edges. This is where semantic decisions happen: what kind of node to produce, what edges to emit, whether to recurse into child scopes.

Both are created via core factory functions (`createCapture`, `createConvert`) that wire together configuration, type safety, and recursive composition.

### Depth-Gated Query Execution

Queries are executed with `maxStartDepth` control via tree-sitter's `QueryOptions`, which prevents the query engine from exploring children at a depth beyond the specified limit. The default depth is 1, meaning queries match only direct children of the target node.

- `maxStartDepth: 0` — destructure the target node itself (the pattern root must be the target node). Used when an extracted node is already the exact construct to match.
- `maxStartDepth: 1` — match direct children of the target node. The default for "what does this scope introduce?"
- `maxStartDepth: unlimited` — full subtree traversal (the old behavior, now opt-in).

This is set on `QueryMap.match()`, which passes it through to `query.matches(node, { maxStartDepth })`. The depth limit only constrains where a pattern's root node can begin matching — the pattern's own internal structure (field captures, child nodes) still resolves at whatever depth the pattern defines.

### Bypass Mechanism

Some syntactic wrappers (like `export_statement`) place declarations at a depth that `maxStartDepth: 1` misses. The bypass mechanism solves this: per-query-tag functions that use precompiled extraction queries to pierce wrappers and return the unwrapped nodes for matching.

```ts
// CaptureConfig — per-tag options
type CaptureConfigOptions = {
  bypass?: (node: TSParser.SyntaxNode) => TSParser.QueryMatch[];
  maxStartDepth?: number;
};
```

Bypass queries live in a separate `QueryMap` instance, compiled once at plugin initialization alongside the main queries. Each bypass function checks the node type, runs the extraction query, then calls back into the main `QueryMap.match()` with `maxStartDepth: 0` against the extracted nodes.

```ts
// Example: export class Foo {} — class is at depth 2 from program
class: {
  bypass(node) {
    if (node.type === "program") {
      const extracted = bypass.get("export_class")
        .captures(node, { maxStartDepth: 1 })
        .filter(c => c.name === "node")
        .map(c => c.node);
      return extracted.flatMap(c =>
        query.match("class", c, { maxStartDepth: 0 })
      );
    }
    return [];
  }
}
```

### Handler-Per-Tag Structure

Each query tag has a corresponding convert handler under `handlers/`. A `ConvertConfig` mapped type enforces every key in `QueryConfig` has a handler — omissions are compile errors.

Handlers receive typed captures, a parent scope ID, and a `ConvertContext` that provides `capture` and `convert` for recursive scope descent:

```ts
// class handler — captures class, recurses into body for methods/members
const classHandler: ConvertHandler<"class"> = (captures, parentId, { capture, convert }) => {
  for (const c of captures) {
    // emit class node + defines edge
    if (c.body) {
      result.push(convert(capture(c.body, "method"), id, "method"));
      result.push(convert(capture(c.body, "member"), id, "member"));
    }
  }
};
```

### Plugin File Structure

```text
packages/<lang>/
  src/
    queries/           ← .scm files, one per construct
      class.scm
      function.scm
      variable.scm
      pattern.scm
      bypass/          ← extraction queries for syntactic wrappers
        export_class.scm
        export_function.scm
    handlers/          ← convert handlers, one per query tag
      class.ts
      function.ts
      variable.ts
      pattern.ts
    types.ts           ← QueryConfig, BypassQueryConfig, Node, Edge type aliases
    query.ts           ← QueryMap instances (main + bypass)
    capture.ts         ← CaptureConfig with bypass wiring
    convert.ts         ← ConvertConfig with handler registration
    index.ts           ← plugin exports
```

### Core Infrastructure

- **`Parser`** — instantiated with a `Config`, maps file extensions to `Language` instances, dispatches `parse(filePath, source)` to the correct plugin.
- **`Language`** — wraps a tree-sitter parser for one plugin. `extract()` runs the plugin's `capture()` then `convert()` to produce `{ nodes, edges }`.
- **`Graph`** — built from `{ nodes, edges }`. The graph stores only declaration edges. Reference and call relationships are derived dynamically through scope-based name resolution. NodeIDs are colon-delimited; resolution walks up scopes until a matching suffix is found. Pre-resolved edges (definitions, imports) are added first; scope-walking resolution runs second using the pre-resolved edges as context.
- **`QueryMap`** — a typed `Map<K, TSParser.Query>` that compiles string query patterns into tree-sitter Query instances, enforces unique keys, provides type-safe lookup, and executes depth-gated matching via `match()`. Also exposes `create()` for ad-hoc query compilation.
- **`scmPlugin`** — an esbuild plugin that normalizes `.scm` query files at build time (stripping comments, collapsing whitespace) and emits them as JS default exports. Plugin packages reference this in their tsup config.
- **`createCapture`** — core factory that binds a `QueryMap` and `CaptureConfig` into a capture function with two overloads: full capture (all tags) and single-tag capture (for recursive use inside convert handlers).
- **`createConvert`** — core factory that binds a capture function and `ConvertConfig` into a convert function, threading `ConvertContext` into handlers.

### What Tree-sitter Actually Gives You

Verified through hands-on exploration. Parsing a TypeScript class produces a tree where each node already carries the metadata the index needs:

- **`node.type`**: the structural kind (`class_declaration`, `method_definition`, `public_field_definition`, etc.)
- **`node.startPosition` / `node.endPosition`**: exact row/column locations — the pointer back to source
- **`node.text`**: the full source text the node spans, accessible on demand
- **`node.namedChildren`**: semantically meaningful children (filters out syntax noise like braces and keywords)

Tree-sitter gives the structural parsing for free. symbex's job is the indexing and query layer on top.

### Why Tree-sitter

Tree-sitter already parses ~200 languages into consistent tree structures. It provides a uniform tree format across languages, so the tool has a consistent interface regardless of what language the codebase uses. Different languages produce different AST shapes, but the format is consistent, the parsing is fast and incremental, and the tooling ecosystem is mature.

## Key Design Decisions

### Index Stores Data, Not Live References

The index stores query results as plain, serializable data rather than maintaining live tree-sitter references. This eliminates complex memory management around tree-sitter's node lifecycle.

### References Are Not Indexed

symbex does not store reference edges.

Only declarations (bindings) are indexed. References are resolved dynamically by walking the scope graph and matching identifiers against bindings visible in that scope.

This keeps the graph minimal while preserving the ability to resolve references when needed.

### Export Statements Are Transparent Wrappers

Export statements don't introduce scopes or bindings themselves — they're syntactic wrappers. The bypass mechanism pierces them to extract the actual declaration. This means `export class Foo {}` and `class Foo {}` produce identical graph structures.

### Capture Tags as Authoritative Vocabulary

Query capture tags (e.g., `@function`, `@import`, `@class`) serve as the canonical vocabulary for node kinds. The `.scm` files define what constructs the plugin recognizes.

### Import Kind as Future Metadata

Discriminating import types (named/default/namespace) matters less for Phase 1 single-file graphs but is captured now as `props.type` for Phase 2 cross-file resolution. Namespace imports like `ns.foo()` should resolve as direct calls rather than opaque member access — but building logic around this is deferred.

### Edge Schema Captures All Relationships

Edges are first-class for all relationship types (implements, extends, aliases, defines, imports), not just function calls. Type relationships that text search cannot discover — like which class implements which interface — are structurally queryable in the graph.

### Scope Discipline

Complex cases (anonymous functions, cross-file resolution, static method disambiguation, call edges) are consistently excluded from Phase 1. Problems are named and noted for later phases rather than half-solved now.

### False Edges Are Worse Than Absent Ones

Call edges require compiler-level type resolution. Syntactic capture alone produces unreliable attribution and pollutes the graph. Edges that might be wrong degrade consumer trust more than edges that are missing.

## Current State of the Field (as of Mar 2026)

### What exists

- **Scope Graphs (Visser et al., TU Delft)** — The academic framework for modeling name binding. A scope graph represents declarations and references associated with scopes connected by edges; name resolution is path-finding from references to declarations. Implemented in the Spoofax language workbench via the Statix meta-language. Theoretical and tied to specific compiler frameworks.
- **Stack Graphs (GitHub)** — Practical extension of scope graphs powering GitHub's Precise Code Navigation. Built on tree-sitter with a graph construction DSL (`tree-sitter-graph`). File-incremental: each file's subgraph is constructed in isolation and merged at query time. Name resolution uses symbol stack path-finding with precedence-based shadowing. Open source in Rust. Language definitions exist for Python, TypeScript, JavaScript.
- **Sourcegraph**: Semantic indexing using compiler-like analysis, but primarily for code navigation (go-to-definition, find-references), not tool-call interfaces
- **ast-grep**: CLI tool that matches AST patterns instead of text. Builds ASTs in memory per query — no persistent offline index
- **Tree-sitter + RAG pipelines**: Some teams use AST-aware chunking (splitting code at structural boundaries rather than token counts) before embedding into vector databases. But the embeddings themselves flatten structure back into token space
- **Meta's Glean**: Open-source code indexer that collects structural facts about code, but designed for code navigation, not a general-purpose graph index

### How symbex differs

Scope graphs and stack graphs are **resolution machines** — their structure exists to answer "what does this name refer to?" They don't carry semantic metadata about what a declaration *is*. A stack graph definition node has a symbol name but no concept of `kind: "function"` vs `kind: "class"`.

symbex is a **semantic relationship graph** — it captures what things are, what they contain, how they relate. The `defines` edge is a scope-to-binding relationship, but `extends`, `implements`, and `constrained` are semantic relationships that scope/stack graphs don't model. Resolution is one capability, not the sole purpose.

Stack graphs are designed for one consumer (code navigation) with specific constraints (file-incremental, zero-config, sub-second queries at GitHub scale). symbex exposes the graph itself as a queryable artifact — consumers decide what to do with it.

No existing tool provides a general-purpose, language-agnostic scope graph with rich semantic metadata as a standalone queryable data structure.

## Scope: What Phase 1 Is Not

- Not structural similarity matching across unrelated codebases
- Not behavioral equivalence detection across languages
- Not advanced semantic inference from code
- Not natural-language-only querying (structural queries are the interface)
- Not cross-file call graph resolution
- Not anonymous function / callback / IIFE as first-class nodes
- Not static method call disambiguation
- Not call edge extraction (deferred — requires type resolution)

The initial question is narrower: can we extract, persist, traverse, and query a single-file scope graph reliably?

## Roadmap

### Phase 1: The Scope Graph

Build the single-file scope graph. Language plugin (raw extraction) → core index → query API. Definition graph with complete declaration coverage — every name introduced into every scope is captured faithfully. Plugin architecture settled with depth-gated query execution, bypass mechanism, and handler-per-tag structure.

**Implemented:** imports, functions (including arrow/generator/expression forms), classes (including heritage, generics, abstract), methods, members, variables, destructuring patterns (recursive extraction of all bound names from object/array/rest patterns).

**Remaining:** TypeScript type definitions (interfaces, type aliases, enums, namespaces), parameters as scope bindings.

### Phase 2: Cross-File Resolution

Cross-file edge resolution, where import kind metadata (named/default/namespace) becomes important — namespace imports like `ns.foo()` should resolve as direct calls. Node identity across re-parses. Persistent index format. Variable nodes from imports get upgraded to their real kinds (function, class) once the source module is resolved. This is where the scope graph becomes a scope graph with cross-scope references — the binding registry built in Phase 1 makes scope-walk resolution sound.

### Phase 3: Native Structural Representation

For the specific domain of code understanding, structural representation becomes first-class rather than reconstructed from text every time. ESLint-style local server architecture, rich abstraction plugin ecosystem. Opt-in structural telemetry as potential training data for structure-native AI models.

## Validation

TypeScript's `checker.ts` (the type checker implementation) serves as a stress test: ~54,000 lines, 6,624 nodes, 6,623 edges, dominated by a single ~52,700-line `createTypeChecker` function containing thousands of inner functions. symbex parses it in 2-3 seconds. If it handles `checker.ts` cleanly, most real-world TypeScript files are trivial by comparison.

## Future Considerations (Not Phase 1)

Recorded for later exploration:

- **ESLint-style local server architecture**: Persistent local server (`tool serve`) that owns the AST index, watches the filesystem, handles incremental re-parsing, and exposes a query API via HTTP or IPC.
- **Structural hashing**: Hash AST subtrees for O(1) structural matching. Hash-based change notification for consumers (hash as receipt, mismatch triggers re-fetch).
- **Pattern tags**: Structural properties attached to nodes, surfacing what code *does* rather than what it *says*.
- **Rich abstraction plugin ecosystem**: Domain-specific lenses — React component tree abstraction, NestJS decorator-aware abstraction, etc.
- **File-incremental graph construction**: Following stack graphs' approach — each file's subgraph constructed in isolation, merged at query time. Enables persistent storage and incremental updates.

## Open Questions

- What's the right persistent format for the scope graph? JSON is simple but may not be optimal for search performance at scale. Stack graphs use SQLite. FlatBuffers is another option.
- Query language design: how should consumers express structural queries? Pattern templates, natural language mapped to tree queries, or something else?
- Whether hybrid approaches (scope graph for structural queries + text search for intent/semantic queries) outperform pure structural search
- Benchmarking: how to measure precision/noise reduction against text-based retrieval
- Whether an explicit `role: "scope" | "binding" | "scope+binding"` field belongs in the core Node schema, or whether consumers can infer this from `kind` and edge structure
- How to handle TypeScript's type-level constructs (interfaces, type aliases, conditional types) — these introduce names but don't produce runtime scopes. Do they get `kind: "type"` with a scope role, or are they pure bindings?
