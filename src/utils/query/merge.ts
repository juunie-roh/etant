import { normalize } from "./normalize";

function merge(...queries: string[]): string {
  return queries.map((query) => normalize(query)).join("");
}

export { merge };
