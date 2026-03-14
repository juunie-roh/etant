import { createCanonicalId, createConvertResult } from "symbex/utils";

import type { ConvertHandler, Edge, Node } from "@/types";

const importHandler: ConvertHandler<"import"> = (captures, parentId) => {
  const result = createConvertResult<Node, Edge>();
  const sources = new Set<string>();

  for (const c of captures) {
    const { source, name, alias, is_type } = c;
    if (!sources.has(source.text)) {
      sources.add(source.text);
    }

    const representative = alias?.text ?? name?.text ?? undefined;
    const isType = is_type ? true : false;

    if (representative) {
      const id = createCanonicalId(parentId, representative);
      result.edges.push({
        from: parentId,
        to: id,
        kind: "defines",
        resolved: true,
      });
      result.nodes.push({
        id,
        type: "binding",
        kind: isType ? "type" : "variable",
        props: alias
          ? {
              alias_of: name!.text,
              is_type: isType,
              source: source.text,
            }
          : undefined,
      });
    }
  }

  sources.forEach((source) => {
    result.edges.push({
      from: parentId,
      to: source,
      kind: "imports",
      resolved: true,
    });

    result.nodes.push({
      id: source,
      type: "scope",
      kind: "module",
    });
  });

  return result;
};

export default importHandler;
