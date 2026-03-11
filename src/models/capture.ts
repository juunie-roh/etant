import type TSParser from "tree-sitter";

type QueryTagSpec = {
  required: string;
  optional: string;
};

type QueryConfig<Tag extends Record<string, QueryTagSpec>> = {
  [K in keyof Tag]?: { include?: string | string[] };
};

type Capture<Spec extends QueryTagSpec> = {
  [K in Spec["required"]]: TSParser.SyntaxNode;
} & {
  [K in Spec["optional"]]?: TSParser.SyntaxNode;
};

type CaptureResult<Tag extends Record<string, QueryTagSpec>> = {
  [K in keyof Tag]: Capture<Tag[K]>[];
};

export type { Capture, CaptureResult, QueryConfig, QueryTagSpec };
