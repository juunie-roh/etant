import type * as etant from "etant";

export type QueryConfig = {
  if: {
    required: "node" | "body" | "condition";
    optional: "else" | "else_body";
  };
  iife: {
    required: "node" | "body";
    optional: never;
  };
  member: {
    required: "node" | "name";
    optional: "is_static" | "decorator";
  };
  esm: {
    required: "source";
    optional: "alias" | "name";
  };
  iife_import: {
    required: "kind" | "name" | "body";
    optional: never;
  };
  variable: {
    required: "node" | "name" | "kind";
    optional: never;
  };
  class: {
    required: "node" | "name" | "body";
    optional: "extends" | "decorator";
  };
  function: {
    required: "node" | "name" | "params" | "body";
    optional: "is_async";
  };
  method: {
    required: "node" | "name" | "body" | "params";
    optional: "is_static" | "is_async" | "decorator";
  };
};

export type BypassQueryKey = "export";

export type NodeKind = keyof QueryConfig | "parameter" | "component" | "else";

export type Node = etant.Node<NodeKind>;

export type EdgeKind = "defines" | "extends" | "contains" | "imports";

export type Edge = etant.Edge<EdgeKind>;

export type CaptureConfig = etant.CaptureConfig<QueryConfig>;

export type SingleCaptureResult<K extends keyof QueryConfig> =
  etant.SingleCaptureResult<QueryConfig[K]>;

export type FullCaptureResult = etant.FullCaptureResult<QueryConfig>;

export type ConvertConfig = etant.ConvertConfig<QueryConfig, Node, Edge>;

export type ConvertContext = etant.ConvertContext<QueryConfig, Node, Edge>;

export type ConvertResult = etant.ConvertResult<Node, Edge>;

export type ConvertHandler<K extends keyof QueryConfig> = etant.ConvertHandler<
  QueryConfig,
  QueryConfig[K],
  Node,
  Edge
>;

export type Descriptor = etant.Plugin.Descriptor<QueryConfig, Node, Edge>;
