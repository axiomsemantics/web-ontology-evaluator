import { describe, expect, it } from "vitest";
import { tokenizeText } from "../features/documents/textNormalizer";

describe("text normalization", () => {
  it("normalizes Unicode, URLs, punctuation, numbers and stopwords", () => {
    expect(tokenizeText("A Ontologia, NÃO usa 123 https://example.org Café!")).toEqual(["ontologia", "usa", "cafe"]);
  });

  it("removes English and Portuguese stopwords", () => {
    expect(tokenizeText("the graph and a ontologia com os dados")).toEqual(["graph", "ontologia", "dados"]);
  });
});
