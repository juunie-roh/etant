import { createCanonicalId, createConvertResult, getRange } from "symbex/utils";

import type { ConvertHandler, Edge, Node } from "@/types";

const functionHandler: ConvertHandler<"function"> = (
  captures,
  parentId,
  { capture, convert },
) => {
  const result = createConvertResult<Node, Edge>();

  for (const c of captures) {
    const { name, node, type_params, params, body, return_type, is_async } = c;
    const id = createCanonicalId(parentId, name.text);

    result.edges.push({
      from: parentId,
      to: id,
      kind: "defines",
      resolved: true,
    });

    result.nodes.push({
      id,
      kind: "function",
      range: getRange(node),
      props: {
        is_async: is_async ? true : false,
        type_params: type_params?.text,
        params: params?.text,
        return_type: return_type?.text,
      },
    });

    if (body) {
      result.push(convert(capture(body), id));
    }
  }

  return result;
};

export default functionHandler;
