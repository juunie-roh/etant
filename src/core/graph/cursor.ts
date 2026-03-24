import type { NodeId, NodePath } from "@/models";
import { defined } from "@/shared/defined";

import GraphError from "./error";
import type Graph from "./graph";

/**
 * A lightweight immutable cursor instance.
 */
class GraphCursor {
  private readonly _graph: Graph;
  private readonly _id: NodeId;

  constructor(graph: Graph, id: NodeId) {
    this._graph = graph;
    this._id = id;
  }

  // IDE sync entry point
  static atPosition(graph: Graph, offset: number): GraphCursor | undefined {
    let deepestId: NodeId | undefined;
    let deepestDepth = -1;

    for (const [id, node] of graph.nodes) {
      if ("name" in node.at) continue;
      const { startIndex, endIndex } = node.at;
      if (offset < startIndex || offset > endIndex) continue;

      // path length is scope depth — longer path = deeper node
      const depth = graph.depth(id);
      if (depth > deepestDepth) {
        deepestDepth = depth;
        deepestId = id;
      }
    }

    return deepestId ? new GraphCursor(graph, deepestId) : undefined;
  }

  get node() {
    const n = this._graph.nodes.get(this._id);
    defined(
      n,
      new GraphError(
        "GRAPH_NO_NODE",
        `Failed to get node with id: ${this._id}`,
      ),
    );
    return n;
  }

  get path(): NodePath {
    return this._graph.path(this._id);
  }

  get depth(): number {
    return this._graph.depth(this._id);
  }

  get name(): string {
    return this.node.name;
  }

  parent(): GraphCursor | undefined {
    const parentId = this._graph.parent(this._id);
    return parentId ? new GraphCursor(this._graph, parentId) : undefined;
  }

  children(edgeKind?: string): GraphCursor[] {
    const cursors: GraphCursor[] = [];

    this._graph.adjacent(this._id)?.forEach((kinds, id) => {
      if (edgeKind && !kinds.has(edgeKind)) return;
      cursors.push(new GraphCursor(this._graph, id));
    });

    return cursors;
  }

  nearest(
    predicate: (cursor: GraphCursor) => boolean,
  ): GraphCursor | undefined {
    let c: GraphCursor | undefined = this;

    while (c) {
      if (predicate(c)) return c;
      c = c.parent();
    }

    return undefined;
  }

  resolve(symbol: string): GraphCursor | undefined {
    const scope = this.nearest((c) =>
      c.children().some((child) => child.name === symbol),
    );
    // scope is the parent — you probably want the child
    return scope?.children().find((child) => child.name === symbol);
  }
}

export default GraphCursor;
