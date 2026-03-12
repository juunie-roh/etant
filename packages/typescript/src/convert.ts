import { createConvert } from "symbex/utils";

import { capture } from "./capture";
import abstractClassHandler from "./handlers/abstract-class";
import abstractMethodHandler from "./handlers/abstract-method";
import classHandler from "./handlers/class";
import functionHandler from "./handlers/function";
import importHandler from "./handlers/import";
import memberHandler from "./handlers/member";
import methodHandler from "./handlers/method";
import variableHandler from "./handlers/variable";
import type { ConvertConfig, Edge, Node, Query } from "./types";

const config: ConvertConfig = {
  abstract_class: abstractClassHandler,
  abstract_method: abstractMethodHandler,
  class: classHandler,
  function: functionHandler,
  import: importHandler,
  member: memberHandler,
  method: methodHandler,
  variable: variableHandler,
};

const convert = createConvert<Query, Node, Edge>(capture, config);

export { convert };
