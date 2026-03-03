import type { Capture, Edge, Node } from "@/models";

function convertFunctions(
  functions: Capture.Function[],
  filePath: string,
): {
  edges: Edge[];
  nodes: Node[];
} {
  const edges: Edge[] = [];
  const nodes: Node[] = [];

  for (const func of functions) {
    const range: Node["range"] = {
      startIndex: func.node.startIndex,
      endIndex: func.node.endIndex,
      startPosition: func.node.startPosition,
      endPosition: func.node.endPosition,
    };

    edges.push({
      from: filePath,
      to: func.id,
      kind: "defines",
    } satisfies Edge);

    nodes.push({
      id: func.id,
      kind: "function",
      range,
      meta: {
        name: func.name,
        type_params: func.type_params,
        params: func.params,
        return_type: func.return_type,
      },
    } satisfies Node);
  }

  return { edges, nodes };
}

export { convertFunctions };
