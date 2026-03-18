# symbex

## 0.0.2

### Patch Changes

- ## New Features

  - **Query testing command**: Added a `query` subcommand to the CLI (`symbex query`) for testing tree-sitter queries directly against a source file. Supports loading any grammar package, specifying a language spec (e.g. `typescript` or `tsx` from `tree-sitter-typescript`), and providing a query either from a file (`--query`) or inline string (`--query-string`).
  - **Graph cursor**: Introduced an immutable graph cursor API for traversing and resolving nodes within a `Graph`. Exported from the core package.

  ## Improvements

  - **Cleaner error output**: CLI errors are now printed with a styled badge (e.g. `CORE_PLUGIN_LOAD_FAILED`) and a plain message instead of a raw Node.js stack trace. Pass `--verbose` to print the full stack when needed.
  - **Plugin module validation**: Relaxed the language plugin assertion to use duck-typing instead of `instanceof`, fixing a cross-bundle class identity issue that caused valid plugins to be rejected at load time.
  - **Encoding option**: Added a shared `--encoding` option (defaults to `utf-8`) available on both the root command and the `query` subcommand.

## 0.0.1

### Patch Changes

- Monorepo Changeset Version Bump Test
