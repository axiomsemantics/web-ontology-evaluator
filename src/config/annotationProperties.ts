export const LABEL_PROPERTIES = [
  "http://www.w3.org/2000/01/rdf-schema#label",
  "http://www.w3.org/2004/02/skos/core#prefLabel",
  "http://www.w3.org/2004/02/skos/core#altLabel",
  "http://purl.org/dc/terms/title",
  "http://schema.org/name",
] as const;

export const DESCRIPTION_PROPERTIES = [
  "http://www.w3.org/2000/01/rdf-schema#comment",
  "http://www.w3.org/2004/02/skos/core#definition",
  "http://purl.org/dc/terms/description",
  "http://purl.obolibrary.org/obo/IAO_0000115",
] as const;
