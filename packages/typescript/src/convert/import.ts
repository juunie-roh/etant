import { createCanonicalId } from "semdex/utils";

import type { Capture, Edge, Node } from "@/types";

function convertImports(
  captures: Capture<"import">[],
  parentId: string,
): {
  edges: Edge[];
  nodes: Node[];
} {
  const edges: Edge[] = [];
  const nodes: Node[] = [];
  const sources = new Set<string>();

  for (const captured of captures) {
    const { source, name, alias, is_type } = captured;
    if (!sources.has(source.text)) {
      sources.add(source.text);
    }

    const representative = alias?.text ?? name?.text ?? undefined;
    const isType = is_type ? true : false;

    if (representative) {
      // defines
      const defId = createCanonicalId(parentId, representative);

      edges.push({
        from: parentId,
        to: defId,
        kind: "defines",
        resolved: true,
      } satisfies Edge);

      nodes.push({
        id: defId,
        kind: isType ? "type" : "variable",
        props: alias
          ? {
              alias_of: name!.text,
              is_type: isType,
              source: source.text,
            }
          : undefined,
      } satisfies Node);
    }
  }

  // deduplicated source nodes
  sources.forEach((source) => {
    edges.push({
      from: parentId,
      to: source,
      kind: "imports",
      resolved: true,
    } satisfies Edge);

    nodes.push({
      id: source,
      kind: "module",
    } satisfies Node);
  });

  return { edges, nodes };
}

export { convertImports };
