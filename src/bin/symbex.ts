#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { createCommand } from "@commander-js/extra-typings";
import type { Tree } from "tree-sitter";

import { loadConfig } from "@/config";
import { Graph, PluginHandler } from "@/core";
import { printDotGraph } from "@/dot";
import { SymbexError } from "@/shared/error";

import pkg from "../../package.json";
import { fileArg, othersArg } from "./args";
import queryCommand from "./commands/query";
import { group } from "./groups";
import { configOption, encodingOption, verboseOption } from "./options";

const program = createCommand()
  .name(pkg.name)
  .version(
    pkg.version,
    "-v, --version",
    "Output the version of installed package",
  )
  .description(pkg.description)
  .addArgument(fileArg)
  .addArgument(othersArg)
  .addOption(configOption)
  .addOption(encodingOption)
  .addOption(verboseOption)
  .option("-d, --dot [name]", "print the graph in DOT format", false)
  .option("-o, --output <output>", "output file name", false)
  .option("-r, --references", "temp", false)
  .commandsGroup(group.command.dev)
  .addCommand(queryCommand)
  .action((file, others, options) => {
    const config = loadConfig(options.config);
    const handler = new PluginHandler(config);
    const { graph, tree, name } = handler.parse(
      file,
      readFileSync(file, options.encoding),
    );

    const map = new Map<Graph, Tree>();
    map.set(graph, tree);

    let data: any = graph.serialize();

    if (options.references) {
      const graphCursor = graph.walk();
      const names = handler.references(tree, graphCursor, name);
      console.log(names);
      for (const name of names) {
        const resolved = graphCursor.resolve(name);
        if (resolved) {
          console.log(
            resolved.path.join(" > "),
            "at:",
            "name" in resolved.node.at
              ? `${resolved.node.at.name}(${resolved.node.at.external ?? false})`
              : resolved.node.at.startIndex,
          );
        }
      }
    }

    if (options.dot) {
      data = printDotGraph(data, { indent: 2 });
    }

    if (options.output) {
      writeFileSync(
        resolve(process.cwd(), options.output),
        JSON.stringify(data),
      );
    } else {
      // console.log(data);
    }

    if (others.length > 0) {
      others.forEach((f: string) => {
        // console.log(parser.parse(f));
      });
    }
  });

const badge = (label: string, color: string) =>
  `\x1b[${color}m\x1b[97m ${label} \x1b[0m`;

try {
  program.parse();
} catch (e) {
  const verbose = program.opts().verbose;
  if (e instanceof SymbexError) {
    process.stderr.write(`${badge(e.code, "41")} ${e.message}\n`);
    if (verbose) console.error(e);
  } else {
    const msg = e instanceof Error ? e.message : String(e);
    process.stderr.write(`${badge("ERROR", "41")} ${msg}\n`);
    if (verbose) console.error(e);
  }
  process.exit();
}
