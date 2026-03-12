import { createCanonicalId, createConvertResult, getRange } from "symbex/utils";

import type { ConvertHandler, Edge, Node } from "@/types";

const variableHandler: ConvertHandler<"variable"> = (captures, parentId) => {
  const result = createConvertResult<Node, Edge>();
  const excludes = new Set([
    "arrow_function",
    "function_expression",
    "generator_function",
    "class",
  ]);

  for (const c of captures) {
    const { name, node, kind, type, key } = c;
    const id = createCanonicalId(parentId, name.text);

    const declarator = node.namedChildren.find(
      (c) => c.type === "variable_declarator",
    );

    if (
      declarator?.childForFieldName("value")?.type &&
      excludes.has(declarator.childForFieldName("value")!.type)
    ) {
      continue;
    }

    result.edges.push({
      from: parentId,
      to: id,
      kind: "defines",
      resolved: true,
    });
    result.nodes.push({
      id,
      kind: "variable",
      range: getRange(node),
      props: {
        kind: kind.text,
        type: type?.text,
        alias_of: key?.text,
      },
    });
  }

  return result;
};

export default variableHandler;
