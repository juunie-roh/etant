import type TSParser from "tree-sitter";

import { SEPARATOR } from "@/consts";
import { Node } from "@/models";

function createCanonicalId(parentID: string, name: string): Node["id"] {
  return `${parentID}${SEPARATOR}${name}`;
}

/**
 *
 * @param type A node-type string.
 * @param node A node to start searching for.
 */
function getInnerMostParent(
  type: string,
  node: TSParser.SyntaxNode,
): TSParser.SyntaxNode | undefined {
  let cur = node.parent;

  while (cur) {
    if (cur.type === type) return cur;
    cur = cur.parent;
  }

  return;
}

export { createCanonicalId, getInnerMostParent };
