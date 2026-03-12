import { createCapture } from "symbex/utils";

import { query } from "./query";
import { Query } from "./types";

const capture = createCapture<Query>(query, {
  abstract_class: { include: "export_statement" },
  class: { include: "export_statement" },
  function: { include: "export_statement" },
  variable: { include: "export_statement" },
});

export { capture };
