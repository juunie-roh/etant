import { captureConfig } from "./capture";
import { convertConfig } from "./convert";
import { language, query, queryConfig } from "./query";
import type { PluginDescriptor } from "./types";

export const descriptor = {
  language,
  query,
  queryConfig,
  captureConfig,
  convertConfig,
} satisfies PluginDescriptor;

export default descriptor;
