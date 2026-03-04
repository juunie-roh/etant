import type TSParser from "tree-sitter";

import { Capture } from "@/models";

import { capture } from "./capture";
import { getMatches, getNode, groupMatches } from "./utils";

function getFunctions(
  node: TSParser.SyntaxNode,
  query: TSParser.Query,
  parentId: string,
): Capture.Function[] {
  const matches = getMatches(query, node);

  return groupMatches("function", matches).map((match) => {
    const get = (name: string) => getNode(name, match);

    const name = get("name")?.text;
    const id = `${parentId}:(function)${name}`;

    return {
      id,
      node: get("function")!,
      body: capture(get("body")!, query, id),
      name,

      type_params: get("type_params")?.namedChildren.map((c) => c.text) ?? [],
      params: get("params")?.namedChildren.map((c) => c.text) ?? [],
      return_type: get("return_type")?.text,
    } satisfies Capture.Function;
  });
}

export { getFunctions };
