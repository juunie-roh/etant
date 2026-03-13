import { QueryMap } from "symbex/query";
import type TSParser from "tree-sitter";
import TypeScript from "tree-sitter-typescript";

import abstractClassQueryString from "@/queries/abstract_class.scm";
import abstractMethodQueryString from "@/queries/abstract_method.scm";
import exportClassBypassString from "@/queries/bypass/export_class.scm";
import exportFunctionBypassString from "@/queries/bypass/export_function.scm";
import classQueryString from "@/queries/class.scm";
import functionQueryString from "@/queries/function.scm";
import importQueryString from "@/queries/import.scm";
import memberQueryString from "@/queries/member.scm";
import methodQueryString from "@/queries/method.scm";
import variableQueryString from "@/queries/variable.scm";

import type { BypassQueryConfig, QueryConfig } from "./types";

export const language = TypeScript.typescript as TSParser.Language;

export const query = new QueryMap<keyof QueryConfig>(language)
  .set("abstract_class", abstractClassQueryString)
  .set("abstract_method", abstractMethodQueryString)
  .set("class", classQueryString)
  .set("function", functionQueryString)
  .set("import", importQueryString)
  .set("member", memberQueryString)
  .set("method", methodQueryString)
  .set("variable", variableQueryString);

export const bypass = new QueryMap<BypassQueryConfig>(language)
  .set("export_class", exportClassBypassString)
  .set("export_function", exportFunctionBypassString);
