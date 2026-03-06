import { merge, normalize } from "@juun-roh/spine/utils/query";

import classQuery from "./queries/class.scm";
import functionQuery from "./queries/function.scm";
import importQuery from "./queries/import.scm";

const queries: Record<string, string> = {
  class: normalize(classQuery),
  function: normalize(functionQuery),
  import: normalize(importQuery),
};

const queryString = merge(classQuery, functionQuery, importQuery);

export { queries, queryString };
