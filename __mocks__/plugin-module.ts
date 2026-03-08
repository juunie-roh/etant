import type TSParser from "tree-sitter";
import { vi } from "vitest";

import type { Language } from "@/core/language";

const mockPlugin = vi.mockObject({
  language: vi.mockObject({} as TSParser.Language),
} satisfies Language.Module);

const mockPlugin_no_language = vi.mockObject({});
