import { createCanonicalId } from "semdex/utils";

import type { Capture, Edge, Node } from "@/types";

function convertMember(
  members: Capture<"member">[],
  parentId: string,
): { edges: Edge[]; nodes: Node[] } {
  const edges: Edge[] = [];
  const nodes: Node[] = [];
  for (const member of members) {
    const id = createCanonicalId(parentId, member.name.text);

    edges.push({
      from: parentId,
      to: id,
      kind: "defines",
      resolved: true,
    } satisfies Edge);

    nodes.push({
      id,
      kind: "member",
      range: {
        startIndex: member.node.startIndex,
        endIndex: member.node.endIndex,
        startPosition: member.node.startPosition,
        endPosition: member.node.endPosition,
      },
      props: {
        name: member.name.text,
        modifier: member.modifier?.text,
        is_static: member.is_static ? true : false,
        type: member.type?.text,
      },
    } satisfies Node);
  }

  return { edges, nodes };
}

export { convertMember };
