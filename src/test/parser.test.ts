import { describe, expect, it } from "vitest";
import { Store } from "oxigraph";
import fixture from "./fixtures/sample.ttl?raw";

describe("ontology parsing", () => {
  it("loads a small Turtle ontology and queries it", async () => {
    const store = new Store();
    store.load(fixture, { format: "text/turtle" });
    const classes = store.query(`
      PREFIX owl: <http://www.w3.org/2002/07/owl#>
      SELECT ?class WHERE { ?class a owl:Class }
    `);
    expect(store.size).toBe(8);
    expect(Array.isArray(classes) ? classes.length : 0).toBe(2);
  });
});
