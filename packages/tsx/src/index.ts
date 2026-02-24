import TypeScript from "tree-sitter-typescript";

const queryString: string = require("./queries/query.scm");

const language = TypeScript.tsx;

export { convert } from "./convert.js";
export { language };
export { queryString };
