import type TSParser from "tree-sitter";

import { Capture } from "@/models";

import { getMatches, getNode, groupMatches } from "./utils";

/**
 * Parse a single import clause child node into its {@link Capture.Import} name entries.
 */
function parseNames(
  node: TSParser.SyntaxNode,
): NonNullable<Capture.Import["names"]> {
  if (node.type === "identifier") {
    return [{ type: "default", name: node.text }];
  }
  if (node.type === "named_imports") {
    return node.namedChildren
      .filter((c) => c.type === "import_specifier")
      .map((f) => ({
        type: "named_imports",
        name: f.childForFieldName("name")!.text,
        alias: f.childForFieldName("alias")?.text,
      }));
  }
  if (node.type === "namespace_import") {
    return [
      {
        type: "namespace_import",
        name: "*",
        alias: node.firstNamedChild?.text,
      },
    ];
  }
  return [];
}

function getImports(
  node: TSParser.SyntaxNode,
  query: TSParser.Query,
  filePath: string,
): Capture.Import[] {
  const matches = getMatches(query, node);

  return groupMatches("import", matches).map((match) => {
    const get = (name: string) => getNode(name, match);

    return {
      id: filePath,
      node: get("import")!,
      names: get("names")?.namedChildren.flatMap(parseNames),
      source: get("source")!.firstNamedChild!.text,
    } satisfies Capture.Import;
  });
}

export { getImports };
