import type TSParser from "tree-sitter";

function getRange(node: TSParser.SyntaxNode): TSParser.Range {
  return {
    startIndex: node.startIndex,
    endIndex: node.endIndex,
    startPosition: node.startPosition,
    endPosition: node.endPosition,
  } satisfies TSParser.Range;
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

export { getInnerMostParent, getRange };
