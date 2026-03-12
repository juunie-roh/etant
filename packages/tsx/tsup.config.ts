import { scmPlugin } from "semdex/query";
import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: ["src/index.ts"],
  esbuildPlugins: [scmPlugin],
  format: "cjs",
  minify: true,
  target: ["node22", "node24", "node25"],
  external: ["semdex", "tree-sitter-typescript"],
  sourcemap: true,
});
