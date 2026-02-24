import TypeScript from "tree-sitter-typescript";

// biome-ignore lint/suspicious/noCommonJs: esbuild text loader bundles this as a string at build time
const queryString: string = require("./queries/query.scm");

const language = TypeScript.typescript;

export { convert } from "./convert.js";
export { language, queryString };
