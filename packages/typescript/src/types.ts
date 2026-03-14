import type * as symbex from "symbex";

export type QueryConfig = {
  abstract_class: {
    required: "node" | "name" | "body";
    optional:
      | "heritage"
      | "extends"
      | "extends_body"
      | "implements"
      | "type_args"
      | "type_params";
  };
  abstract_method: {
    required: "node" | "name" | "params" | "return_type";
    optional: "modifier" | "type_params";
  };
  class: {
    required: "node" | "name" | "body";
    optional:
      | "heritage"
      | "extends"
      | "type_args"
      | "extends_body"
      | "implements"
      | "type_params";
  };
  function: {
    required: "node" | "name" | "params" | "body";
    optional: "is_async" | "type_params" | "return_type";
  };
  import: {
    required: "node" | "source";
    optional: "alias" | "name" | "is_type";
  };
  member: {
    required: "node" | "name";
    optional: "modifier" | "is_static" | "type";
  };
  method: {
    required: "node" | "name" | "body" | "params";
    optional:
      | "modifier"
      | "is_static"
      | "is_async"
      | "type_params"
      | "return_type";
  };
  pattern: {
    required: "node";
    optional: "pattern" | "name" | "default" | "key";
  };
  // type: {
  //   required: string;
  //   optional: string;
  // };
  variable: {
    required: "node" | "pattern" | "kind";
    optional: "name" | "type";
  };
};

export type BypassQueryConfig = "export_class" | "export_function";

// TODO: add other declaration kinds
export type NodeKind = keyof QueryConfig | "file" | "module" | "type";

export type Node = symbex.Node<NodeKind>;

// TODO: add other relationship kinds
export type EdgeKind =
  | "constrained"
  | "defines"
  | "inherits"
  | "implements"
  | "imports";

export type Edge = symbex.Edge<EdgeKind>;

export type Graph = symbex.Graph<Node, Edge>;

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
