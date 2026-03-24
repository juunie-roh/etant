import { captureConfig } from "./capture";
import { convertConfig } from "./convert";
import flatExpression from "./handlers/utility/expression";
import { language, query } from "./query";
import type { PluginDescriptor } from "./types";

export const descriptor = {
  language,
  query,
  captureConfig,
  convertConfig,
  references(node) {
    return node ? node.namedChildren.flatMap((c) => flatExpression(c)) : [];
  },
} satisfies PluginDescriptor;

export default descriptor;
