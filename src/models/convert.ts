import type { Capture } from "./capture";
import type { Edge, Node, QueryTag } from "./global";

type ConvertResult<N extends Node, E extends Edge> = {
  nodes: N[];
  edges: E[];
};

type ConvertHandler<T extends QueryTag, N extends Node, E extends Edge> = (
  captures: Capture<T>[],
  parentId: string,
) => ConvertResult<N, E>;

type Convert<
  Q extends Record<string, QueryTag>,
  N extends Node,
  E extends Edge,
> = {
  [K in keyof Q]: ConvertHandler<Q[K], N, E>;
};

export type { Convert, ConvertHandler, ConvertResult };
