import { createCanonicalId } from "semdex/utils";

import type { Capture, Edge, Node } from "@/types";

function convertAbstractMethods(
  methods: Capture<"abstract_method">[],
  parentId: string,
): { edges: Edge[]; nodes: Node[] } {
  const edges: Edge[] = [];
  const nodes: Node[] = [];

  for (const method of methods) {
    const id = createCanonicalId(parentId, method.name.text);
    edges.push({
      from: parentId,
      to: id,
      kind: "defines",
      resolved: true,
    } satisfies Edge);

    nodes.push({
      id: id,
      kind: "abstract_method",
      range: {
        startIndex: method.node.startIndex,
        endIndex: method.node.endIndex,
        startPosition: method.node.startPosition,
        endPosition: method.node.endPosition,
      },

      props: {
        name: method.name.text,
        modifier: method.modifier?.text ?? "public",
        type_params: method.type_params?.text,
        params: method.params.text,
        return_type: method.return_type.text,
      },
    } satisfies Node);
  }

  return { edges, nodes };
}

export { convertAbstractMethods };
