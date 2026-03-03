import type { Capture, Edge, Node } from "@/models";

function convertImports(
  imports: Capture.Import[],
  filePath: string,
): {
  edges: Edge[];
  nodes: Node[];
} {
  const edges: Edge[] = [];
  const nodes: Node[] = [];

  for (const imp of imports) {
    const range: Node["range"] = {
      startIndex: imp.node.startIndex,
      endIndex: imp.node.endIndex,
      startPosition: imp.node.startPosition,
      endPosition: imp.node.endPosition,
    };

    edges.push({
      from: filePath,
      to: imp.source,
      kind: "imports",
    } satisfies Edge);

    nodes.push({
      id: imp.source,
      kind: "module",
      range,
      meta: { names: imp.names },
    } satisfies Node);
  }

  return { edges, nodes };
}

export { convertImports };
