import type * as symbex from "symbex";

import { queryConfig } from "./query";

export type QueryConfig = typeof queryConfig;

export type NodeKind = keyof QueryConfig | "module" | "type";

export type Node = symbex.Node<NodeKind>;

export type EdgeKind =
  | "constrained"
  | "defines"
  | "inherits"
  | "implements"
  | "imports";

export type Edge = symbex.Edge<EdgeKind>;

export type Graph = symbex.Graph<Node, Edge>;

export type CaptureConfig = symbex.CaptureConfig<QueryConfig>;

export type SingleCaptureResult<K extends keyof QueryConfig> =
  symbex.SingleCaptureResult<QueryConfig[K]>;

export type FullCaptureResult = symbex.FullCaptureResult<QueryConfig>;

export type ConvertConfig = symbex.ConvertConfig<QueryConfig, Node, Edge>;

export type ConvertContext = symbex.ConvertContext<QueryConfig, Node, Edge>;

export type ConvertResult = symbex.ConvertResult<Node, Edge>;

export type ConvertHandler<K extends keyof QueryConfig> = symbex.ConvertHandler<
  QueryConfig,
  QueryConfig[K],
  Node,
  Edge
>;

export type PluginDescriptor = symbex.PluginDescriptor<QueryConfig, Node, Edge>;
