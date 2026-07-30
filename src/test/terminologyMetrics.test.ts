import { describe, expect, it } from "vitest";
import { calculateTerminology } from "../features/documents/terminologyMetrics";

describe("terminology matching", () => {
  it("matches exact normalized tokens and weights frequency", () => {
    const result = calculateTerminology(new Map([["vehicle", 3], ["route", 1]]), ["Fleet Vehicle"]);
    expect(result.coverage.percent).toBe(50);
    expect(result.weightedPercent).toBe(75);
    expect(result.terms[0].labels).toEqual(["Fleet Vehicle"]);
  });
});
