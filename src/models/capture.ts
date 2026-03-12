import type TSParser from "tree-sitter";

import type { QueryTag } from "./global";

type CaptureConfig<Q extends Record<string, QueryTag>> = {
  [K in keyof Q]?: { include?: string | string[] };
};

type Capture<T extends QueryTag> = {
  [K in T["required"]]: TSParser.SyntaxNode;
} & {
  [K in T["optional"]]?: TSParser.SyntaxNode;
};

type CaptureResult<Q extends Record<string, QueryTag>> = {
  [K in keyof Q]: Capture<Q[K]>[];
};

export type { Capture, CaptureConfig, CaptureResult };
