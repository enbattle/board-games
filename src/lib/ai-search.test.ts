import { describe, expect, it } from "vitest";
import { SearchTimeout, isDifficulty, runIterativeDeepening } from "./ai-search";

describe("isDifficulty", () => {
  it("accepts the three known difficulties", () => {
    expect(isDifficulty("easy")).toBe(true);
    expect(isDifficulty("medium")).toBe(true);
    expect(isDifficulty("hard")).toBe(true);
  });

  it("rejects anything else, including null", () => {
    expect(isDifficulty("expert")).toBe(false);
    expect(isDifficulty(null)).toBe(false);
    expect(isDifficulty("")).toBe(false);
  });
});

describe("runIterativeDeepening", () => {
  it("always returns depth 1's result when maxDepth is 1", () => {
    const result = runIterativeDeepening(1, Date.now() + 10_000, (depth) => `depth-${depth}`);
    expect(result).toBe("depth-1");
  });

  it("keeps deepening while every depth succeeds", () => {
    const result = runIterativeDeepening(3, Date.now() + 10_000, (depth) => `depth-${depth}`);
    expect(result).toBe("depth-3");
  });

  it("falls back to the last completed depth when a deeper pass times out", () => {
    const result = runIterativeDeepening(5, Date.now() + 10_000, (depth) => {
      if (depth >= 3) throw new SearchTimeout();
      return `depth-${depth}`;
    });
    // Depths 1 and 2 completed; depth 3 threw, so 2's result must survive.
    expect(result).toBe("depth-2");
  });

  it("re-throws errors that are not a SearchTimeout", () => {
    expect(() =>
      runIterativeDeepening(2, Date.now() + 10_000, (depth) => {
        if (depth === 2) throw new Error("boom");
        return depth;
      })
    ).toThrow("boom");
  });
});
