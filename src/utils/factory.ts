import type TSParser from "tree-sitter";

import { SEPARATOR } from "@/consts";
import type {
  Capture,
  CaptureResult,
  QueryConfig,
  QueryTagSpec,
} from "@/models/capture";
import type { QueryMap } from "@/query";

function createCanonicalId(
  parentID: string,
  name: string,
): `${string}${typeof SEPARATOR}${string}` {
  return `${parentID}${SEPARATOR}${name}`;
}

/**
 * Creates a capture function bound to the given query map and configuration.
 *
 * The returned function has two overloads:
 * - `capture(node)` — runs all registered queries against `node` and returns a {@link CaptureResult}.
 * - `capture(node, tag)` — runs a single query by `tag` and returns `RawCapture[]` for that tag.
 *
 * The single-tag overload is intended for recursive capture inside convert functions,
 * where only a specific construct is expected within a body node.
 * @param query The query map containing compiled tree-sitter queries keyed by tag.
 * @param config Per-tag configuration declaring additional parent node types to include.
 * @returns A bound capture function.
 * @example
 * // plugin/src/index.ts
 * export const capture = createCapture<QueryTag>(query, queryConfig);
 */
function createCapture<Tag extends Record<string, QueryTagSpec>>(
  query: QueryMap<keyof Tag & string>,
  config: QueryConfig<Tag>,
) {
  /**
   * Converts a single query match into a raw capture object.
   */
  function toRawCapture<K extends keyof Tag>(
    match: TSParser.QueryMatch,
  ): Capture<Tag[K]> {
    return Object.fromEntries(
      match.captures.map((c) => [c.name, c.node]),
    ) as Capture<Tag[K]>;
  }

  /**
   * Captures all registered query tags against a node.
   */
  function capture(node: TSParser.SyntaxNode): CaptureResult<Tag>;
  /**
   * Captures all matches for a single query tag.
   */
  function capture<K extends keyof Tag>(
    node: TSParser.SyntaxNode,
    tag: K,
  ): Capture<Tag[K]>[];
  function capture<K extends keyof Tag>(
    node: TSParser.SyntaxNode,
    tag?: K,
  ): CaptureResult<Tag> | Capture<Tag[K]>[] {
    if (!tag) {
      const result = {} as CaptureResult<Tag>;
      for (const key of query.keys()) {
        result[key] = capture(node, key);
      }
      return result;
    }

    return query
      .match(tag as keyof Tag & string, node, config[tag]?.include)
      .map(toRawCapture);
  }

  return capture;
}

export { createCanonicalId, createCapture };
