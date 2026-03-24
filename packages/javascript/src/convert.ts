import ifHandler from "./handlers/anonymous/if";
import iifeHandler from "./handlers/anonymous/iife";
import importHandler from "./handlers/binding/import";
import memberHandler from "./handlers/binding/member";
import variableHandler from "./handlers/binding/variable";
import classHandler from "./handlers/scope/class";
import functionHandler from "./handlers/scope/function";
import methodHandler from "./handlers/scope/method";
import type { ConvertConfig } from "./types";

export const convertConfig = {
  if: ifHandler,
  iife: iifeHandler,
  import: importHandler,
  member: memberHandler,
  variable: variableHandler,
  class: classHandler,
  function: functionHandler,
  method: methodHandler,
} as const satisfies ConvertConfig;
