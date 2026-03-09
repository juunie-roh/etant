import { SEPARATOR } from "@/consts";
import { Node } from "@/models";

function createNodeId(parentID: string, name: string): Node["id"] {
  return `${parentID}${SEPARATOR}${name}`;
}

export { createNodeId };
