import { createCanonicalId, createConvertResult, getRange } from "symbex/utils";

import type { ConvertHandler, Edge, Node } from "@/types";

const abstractClassHandler: ConvertHandler<"abstract_class"> = (
  captures,
  parentId,
  { capture, convert },
) => {
  const result = createConvertResult<Node, Edge>();

  for (const c of captures) {
    const { name, node, body, extends: ext, implements: impl, type_params } = c;
    const id = createCanonicalId(parentId, name.text);
    result.edges.push({
      from: parentId,
      to: id,
      kind: "defines",
      resolved: true,
    });
    result.nodes.push({
      id,
      kind: "abstract_class",
      range: getRange(node),
      props: {
        type_params: type_params?.text,
        extends: ext?.text,
        implements: impl?.text,
      },
    });

    if (body) {
      result.push(
        convert(capture(body, "abstract_method"), id, "abstract_method"),
      );
      result.push(convert(capture(body, "method"), id, "method"));
      result.push(convert(capture(body, "member"), id, "member"));
    }
  }

  return result;
};

export default abstractClassHandler;
