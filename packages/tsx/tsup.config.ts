import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: ["src/index.ts"],
  format: "cjs",
  loader: { ".scm": "text" },
  minify: true,
  target: ["node22", "node24", "node25"],
  external: ["@juun-roh/spine", "tree-sitter-typescript"],
  sourcemap: true,
});
