export interface FoundationalPattern {
  id: "gufo" | "dolce" | "bfo" | "yamato" | "sumo";
  name: string;
  patterns: RegExp[];
}

export const FOUNDATIONAL_ONTOLOGIES: FoundationalPattern[] = [
  {
    id: "gufo",
    name: "gUFO",
    patterns: [/purl\.org\/nemo\/gufo/i, /gufo\.me/i, /ontouml.*gufo/i],
  },
  {
    id: "dolce",
    name: "DOLCE",
    patterns: [
      /ontologydesignpatterns\.org\/ont\/dul\/DUL/i,
      /loa-cnr\.it\/ontologies\/DOLCE/i,
      /dolce[-+_]?lite/i,
      /dolce.*dns.*ultralite/i,
    ],
  },
  {
    id: "bfo",
    name: "BFO",
    patterns: [
      /purl\.obolibrary\.org\/obo\/BFO/i,
      /ifomis\.org\/bfo/i,
      /basic-formal-ontology/i,
      /github\.com\/BFO-ontology\/BFO/i,
    ],
  },
  {
    id: "yamato",
    name: "YAMATO",
    patterns: [
      /hozo\.jp\/onto_library\/(?:upperOnto|YAMATO)/i,
      /(?:^|[/#._-])YAMATO(?:[/#._-]|$)/i,
      /yet[-_ ]?another[-_ ]?more[-_ ]?advanced[-_ ]?top[-_ ]?level[-_ ]?ontology/i,
    ],
  },
  {
    id: "sumo",
    name: "SUMO",
    patterns: [
      /ontologyportal\.org\/(?:SUMO|sumo|sigma)/i,
      /ontology\.teknowledge\.com\/(?:SUMO|SUO)/i,
      /github\.com\/ontologyportal\/sumo/i,
      /(?:^|[/#._-])SUMO(?:[/#._-]|$)/i,
    ],
  },
];

export function detectFoundationalIris(iris: string[]) {
  return FOUNDATIONAL_ONTOLOGIES.map((family) => {
    const matches = iris.filter((iri) => family.patterns.some((pattern) => pattern.test(iri)));
    return {
      id: family.id,
      name: family.name,
      detected: matches.length > 0,
      count: matches.length,
      namespaces: [...new Set(matches.map(compactNamespace))].slice(0, 5),
      examples: [...new Set(matches)].slice(0, 3),
    };
  });
}

function compactNamespace(iri: string) {
  const splitAt = Math.max(iri.lastIndexOf("#"), iri.lastIndexOf("/"));
  return splitAt > 8 ? iri.slice(0, splitAt + 1) : iri;
}
