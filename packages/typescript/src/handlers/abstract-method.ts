import { createCanonicalId, createConvertResult, getRange } from "symbex/utils";

import type { ConvertHandler, Edge, Node } from "@/types";

const abstractMethodHandler: ConvertHandler<"abstract_method"> = (
  captures,
  parentId,
) => {
  const result = createConvertResult<Node, Edge>();

  for (const c of captures) {
    const { name, node, modifier, type_params, params, return_type } = c;
    const id = createCanonicalId(parentId, name.text);
    result.edges.push({
      from: parentId,
      to: id,
      kind: "defines",
      resolved: true,
    });
    result.nodes.push({
      id,
      type: "binding",
      kind: "abstract_method",
      range: getRange(node),

      props: {
        modifier: modifier?.text ?? "public",
        type_params: type_params?.text,
        params: params.text,
        return_type: return_type.text,
      },
    });
  }

  return result;
};

export default abstractMethodHandler;
