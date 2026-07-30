import { describe, expect, it } from "vitest";
import { calculateCoverage } from "../features/ontology/metrics";
import { classifyCoverage } from "../config/thresholds";

describe("coverage metrics", () => {
  it("calculates a ratio", () => expect(calculateCoverage(7, 10).percent).toBe(70));
  it("handles division by zero", () => expect(calculateCoverage(0, 0)).toMatchObject({ percent: 0, denominator: 0 }));
  it.each([[0, "Low"], [40, "Moderate"], [70, "Good"], [90, "Excellent"]])("classifies %i as %s", (value, label) => {
    expect(classifyCoverage(value as number)).toBe(label);
  });
});
