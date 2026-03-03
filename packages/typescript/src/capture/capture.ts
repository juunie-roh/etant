import type TSParser from "tree-sitter";

import { Capture } from "@/models";

import { getFunctions } from "./function";
import { getImports } from "./import";

function capture(
  node: TSParser.SyntaxNode,
  query: TSParser.Query,
  filePath: string,
): Capture.Result {
  return {
    imports: getImports(node, query, filePath),
    functions: getFunctions(node, query, filePath),
  };
}

export { capture };
