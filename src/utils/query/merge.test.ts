import { describe, expect, it } from "vitest";

import { merge } from "./merge";

describe("build", () => {
  it("normalizes and returns a single query", () => {
    expect(merge("; comment\n(identifier)")).toBe("(identifier)");
  });

  it("joins multiple queries with a space", () => {
    expect(merge("(identifier)", "(call_expression)")).toBe(
      "(identifier)(call_expression)",
    );
  });

  it("normalizes each query before joining", () => {
    expect(
      merge("; comment\n(identifier)", "(call_expression) ;; inline comment"),
    ).toBe("(identifier)(call_expression)");
  });

  it("returns an empty string for no arguments", () => {
    expect(merge()).toBe("");
  });

  it("returns an empty string when all queries are only comments", () => {
    expect(merge("; a", ";; b")).toBe("");
  });
});
