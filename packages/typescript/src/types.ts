import type * as semdex from "semdex";

type Query = {
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
  params: {
    required: string;
    optional: string;
  };
  // type: {
  //   required: string;
  //   optional: string;
  // };
  variable: {
    required: "node" | "name" | "kind";
    optional: "key" | "type";
  };
};

// TODO: add other declaration kinds
type NodeKind = keyof Query | "file" | "module" | "type";

/**
 * Specify generic types of {@link semdex.Node | `Node`} with language specific {@link NodeKind | kinds of node}.
 */
type Node = semdex.Node<NodeKind>;

// TODO: add other relationship kinds
type EdgeKind =
  | "constrained"
  | "defines"
  | "extends"
  | "implements"
  | "imports";

/**
 * Specify generic types of {@link semdex.Edge | `Edge`} with language specific {@link EdgeKind | kinds of edge}.
 */
type Edge = semdex.Edge<EdgeKind>;
/**
 * Specify generic types of {@link semdex.Graph | `Graph`} with {@link Node} and {@link Edge}.
 */
type Graph = semdex.Graph<Node, Edge>;
/**
 * Specify generic types of {@link semdex.Capture | `Capture`} with plugin-defined {@link Query | query tags}.
 */
type Capture<K extends keyof Query> = semdex.Capture<Query[K]>;
/**
 * Specify generic types of {@link semdex.CaptureResult | `CaptureResult`} with plugin-defined {@link Query | query tags}.
 */
type CaptureResult = semdex.CaptureResult<Query>;

type Convert = semdex.Convert<Query, Node, Edge>;
type ConvertResult = semdex.ConvertResult<Node, Edge>;
type ConvertHandler<K extends keyof Query> = semdex.ConvertHandler<
  Query[K],
  Node,
  Edge
>;

export type {
  Capture,
  CaptureResult,
  Convert,
  ConvertHandler,
  ConvertResult,
  Edge,
  EdgeKind,
  Graph,
  Node,
  NodeKind,
  Query,
};
