import { createCanonicalId } from "semdex/utils";

import { capture } from "@/capture";
import type { Capture, Edge, Node } from "@/types";

import { convert } from "./convert";

function convertMethod(
  methods: Capture<"method">[],
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
      kind: "method",
      range: {
        startIndex: method.node.startIndex,
        endIndex: method.node.endIndex,
        startPosition: method.node.startPosition,
        endPosition: method.node.endPosition,
      },

      props: {
        name: method.name.text,
        modifier: method.modifier?.text ?? "public",
        is_static: method.is_static ? true : false,
        is_async: method.is_async ? true : false,
        type_params: method.type_params?.text,
        params: method.params?.text,
        return_type: method.return_type?.text,
      },
    } satisfies Node);

    if (method.body) {
      const nested = convert(capture(method.body), id);
      edges.push(...nested.edges);
      nodes.push(...nested.nodes);
    }
  }

  return { edges, nodes };
}

export { convertMethod };
