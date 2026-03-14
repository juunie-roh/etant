import { createCanonicalId, createConvertResult, getRange } from "symbex/utils";

import type { ConvertHandler, Edge, Node } from "@/types";

const methodHandler: ConvertHandler<"method"> = (
  captures,
  parentId,
  { capture, convert },
) => {
  const result = createConvertResult<Node, Edge>();
  for (const c of captures) {
    const {
      name,
      node,
      body,
      modifier,
      is_async,
      is_static,
      type_params,
      params,
      return_type,
    } = c;
    const id = createCanonicalId(parentId, name.text);

    result.edges.push({
      from: parentId,
      to: id,
      kind: "defines",
      resolved: true,
    });
    result.nodes.push({
      id: id,
      type: "scope",
      kind: "method",
      range: getRange(node),
      props: {
        name: name.text,
        modifier: modifier?.text ?? "public",
        is_static: is_static ? true : false,
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

export default methodHandler;
