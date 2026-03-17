import TSParser from "tree-sitter";

import type { Edge, Node, NodePath, QueryConfig } from "@/models";
import { createCapture, createConvert } from "@/utils";

import CoreError from "./error";

/**
 * Represents a loaded and initialized symbex language plugin.
 */
class LanguagePlugin {
  private _parser: TSParser;

  private _module: LanguagePlugin.Module;

  private _capture: ReturnType<typeof createCapture<QueryConfig>>;

  private _convert: ReturnType<typeof createConvert<QueryConfig, Node, Edge>>;

  constructor(name: string) {
    this._module = LanguagePlugin.load(name);

    type Q = typeof this._module.queryConfig;
    type N = (typeof this._module.nodeKind)[number];
    type E = (typeof this._module.edgeKind)[number];

    this._capture = createCapture<Q>(
      this._module.query,
      this._module.captureConfig,
    );

    this._convert = createConvert<Q, N, E>(
      this._capture,
      this._module.convertConfig,
    );

    this._parser = new TSParser();
    this._parser.setLanguage(this._module.language);
  }

  /**
   * The {@link TSParser.Language | tree-sitter `Language`} instance used by this plugin.
   */
  get language() {
    return this._module.language;
  }

  /**
   * Parses a source file to the {@link TSParser.Tree | tree-sitter `Tree`}.
   * @param filePath Path to the source file to parse.
   * @param source String source to parse.
   * @param oldTree Previous tree for incremental parsing.
   * @param options Parsing options passed to tree-sitter.
   * @throws If the language plugin fails to parse the file.
   */
  parse(
    filePath: string,
    source: string,
    oldTree?: TSParser.Tree | null,
    options?: TSParser.Options,
  ): TSParser.Tree {
    try {
      return this._parser.parse(source, oldTree, options);
    } catch (e) {
      throw new CoreError(
        "CORE_PLUGIN_PARSE_FAILED",
        `Failed to parse ${filePath}`,
        { cause: e },
      );
    }
  }

  extract(
    filePath: string,
    node: TSParser.SyntaxNode,
  ): { edges: Edge[]; nodes: Node[] } {
    const captures = this._capture(node);
    return this._convert(captures, [filePath] as NodePath);
  }
}

namespace LanguagePlugin {
  /**
   * Plugin package module interface.
   */
  export interface Module {
    language: TSParser.Language;
    /**
     * Temporary field.
     * @todo Specify fields.
     */
    [k: string]: any;
  }

  /**
   * Loads a language module with the name provided.
   * @param name The npm package name of the plugin.
   * @returns The resolved module containing language, query string, and converter.
   * @throws If the package cannot be found under `node_modules`.
   * @throws If the loaded module is incompatible with {@link LanguagePlugin.Module | language module}.
   */
  export function load(name: string): Module {
    let m: Module;

    try {
      require.resolve(name);
    } catch (e) {
      throw new CoreError(
        "CORE_PLUGIN_LOAD_FAILED",
        `Plugin "${name}" not found`,
        { cause: e },
      );
    }

    try {
      m = require(name).default;
    } catch (e) {
      throw new CoreError(
        "CORE_PLUGIN_LOAD_FAILED",
        `Plugin "${name}" threw during initialization`,
        { cause: e },
      );
    }

    assertModule(m, name);

    return m;
  }

  /**
   *
   * @param m A module to validate.
   */
  function assertModule(m: unknown, name: string): asserts m is Module {
    if (
      typeof m === "object" &&
      m !== null &&
      "language" in m &&
      typeof m.language === "object" &&
      m.language !== null &&
      isLanguage(m.language)
    )
      return;

    throw new CoreError(
      "CORE_PLUGIN_LOAD_FAILED",
      `Failed to load plugin "${name}": module is incompatible with plugin interface.`,
    );
  }

  /**
   * Returns whether.
   * @param language {@link TSParser.Language | Language} instance to validate.
   */
  function isLanguage(language: unknown): language is TSParser.Language {
    return (
      typeof language === "object" &&
      language !== null &&
      "name" in language &&
      language.name !== null &&
      typeof language.name === "string" &&
      "language" in language &&
      language.language !== null &&
      "nodeTypeInfo" in language &&
      language.nodeTypeInfo !== null &&
      Array.isArray(language.nodeTypeInfo)
    );
  }
}

export default LanguagePlugin;
