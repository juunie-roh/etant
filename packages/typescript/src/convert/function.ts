import type { Capture, Edge, Node } from "@/models";

import { convert } from "./convert";

function convertFunctions(
  functions: Capture.Function[],
  parentId: string,
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
      from: parentId,
      to: func.id,
      kind: "defines",
      resolved: true,
    } satisfies Edge);

    nodes.push({
      id: func.id,
      kind: "function",
      range,
      props: {
        name: func.name,
        type_params: func.type_params,
        params: func.params,
        return_type: func.return_type,
      },
    } satisfies Node);

    if (func.body) {
      const nested = convert(func.body, func.id);
      edges.push(...nested.edges);
      nodes.push(...nested.nodes);
    }
  }

  return { edges, nodes };
}

export { convertFunctions };
