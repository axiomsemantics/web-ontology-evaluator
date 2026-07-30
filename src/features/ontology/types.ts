export interface ParsedOntology {
  name: string;
  tripleCount: number;
  classes: Set<string>;
  properties: Set<string>;
  namedEntities: Set<string>;
  labels: Map<string, string[]>;
  descriptions: Map<string, string[]>;
  allIris: string[];
}
