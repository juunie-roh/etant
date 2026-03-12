import { createCanonicalId } from "semdex/utils";

import { capture } from "@/capture";
import type { Capture, Edge, Node } from "@/types";

import { convertMember } from "./member";
import { convertMethod } from "./method";

function convertClasses(
  classes: Capture<"class">[],
  parentId: string,
): {
  edges: Edge[];
  nodes: Node[];
} {
  const edges: Edge[] = [];
  const nodes: Node[] = [];

  if (classes.length > 0) {
    for (const cls of classes) {
      const id = createCanonicalId(parentId, cls.name.text);

      edges.push({
        from: parentId,
        to: id,
        kind: "defines",
        resolved: true,
      } satisfies Edge);

      nodes.push({
        id,
        kind: "class",
        range: {
          startIndex: cls.node.startIndex,
          endIndex: cls.node.endIndex,
          startPosition: cls.node.startPosition,
          endPosition: cls.node.endPosition,
        },
        props: {
          name: cls.name.text,
          type_params: cls.type_params?.text,
          extends: cls.extends?.text,
          implements: cls.implements?.text,
        },
      } satisfies Node);

      if (cls.body) {
        const methods = convertMethod(capture(cls.body, "method"), id);
        const members = convertMember(capture(cls.body, "member"), id);
        edges.push(...methods.edges, ...members.edges);
        nodes.push(...methods.nodes, ...members.nodes);
      }
    }
  }

  return { edges, nodes };
}

export { convertClasses };
