import type { Capture, Edge, Node } from "@/models";

import { convertFunctions } from "./function";
import { convertImports } from "./import";

function convert(
  captures: Capture.Result,
  filePath: string,
): { edges: Edge[]; nodes: Node[] } {
  const imports = convertImports(captures.imports, filePath);
  const functions = convertFunctions(captures.functions, filePath);

  return {
    edges: [...imports.edges, ...functions.edges],
    nodes: [...imports.nodes, ...functions.nodes],
  };
}

export { convert };
