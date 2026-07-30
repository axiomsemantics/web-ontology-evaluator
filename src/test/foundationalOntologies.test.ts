import { describe, expect, it } from "vitest";
import { detectFoundationalIris } from "../config/foundationalOntologies";

describe("foundational ontology detection", () => {
  it("recognizes the five configured foundational ontology families", () => {
    const result = detectFoundationalIris([
      "http://purl.org/nemo/gufo#Event",
      "http://www.ontologydesignpatterns.org/ont/dul/DUL.owl#Object",
      "http://www.ifomis.org/bfo/1.1/snap#Entity",
      "http://www.hozo.jp/onto_library/YAMATO.owl#entity",
      "https://www.ontologyportal.org/SUMO.owl#Object",
    ]);
    expect(result.find((item) => item.id === "gufo")?.detected).toBe(true);
    expect(result.find((item) => item.id === "dolce")?.detected).toBe(true);
    expect(result.find((item) => item.id === "bfo")?.detected).toBe(true);
    expect(result.find((item) => item.id === "yamato")?.detected).toBe(true);
    expect(result.find((item) => item.id === "sumo")?.detected).toBe(true);
    expect(result.map((item) => item.name)).toEqual(["gUFO", "DOLCE", "BFO", "YAMATO", "SUMO"]);
  });
});
