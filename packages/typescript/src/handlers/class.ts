import { createCanonicalId, createConvertResult, getRange } from "symbex/utils";

import type { ConvertHandler, Edge, Node } from "@/types";

const classHandler: ConvertHandler<"class"> = (
  captures,
  parentId,
  { capture, convert },
) => {
  const result = createConvertResult<Node, Edge>();

  for (const c of captures) {
    const { name, node, type_params, extends: ext, implements: impl, body } = c;
    const id = createCanonicalId(parentId, name.text);
    result.edges.push({
      from: parentId,
      to: id,
      kind: "defines",
      resolved: true,
    });
    result.nodes.push({
      id,
      kind: "class",
      range: getRange(node),
      props: {
        type_params: type_params?.text,
        extends: ext?.text,
        implements: impl?.text,
      },
    });

    if (body) {
      result.push(convert(capture(body, "method"), id, "method"));
      result.push(convert(capture(body, "member"), id, "member"));
    }
  }

  return result;
};

export default classHandler;
