const values = (iris: readonly string[]) => iris.map((iri) => `<${iri}>`).join(" ");

export const QUERY_CLASSES = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
SELECT DISTINCT ?class WHERE {
  { ?class a owl:Class } UNION { ?class a rdfs:Class }
  FILTER(isIRI(?class))
}`;

export const QUERY_PROPERTIES = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
SELECT DISTINCT ?property WHERE {
  VALUES ?kind { rdf:Property owl:ObjectProperty owl:DatatypeProperty owl:AnnotationProperty }
  ?property a ?kind . FILTER(isIRI(?property))
}`;

export const QUERY_NAMED_ENTITIES = `
SELECT DISTINCT ?entity WHERE {
  { ?entity ?p ?o } UNION { ?s ?p ?entity }
  FILTER(isIRI(?entity))
  FILTER(!STRSTARTS(STR(?entity), "http://www.w3.org/1999/02/22-rdf-syntax-ns#"))
  FILTER(!STRSTARTS(STR(?entity), "http://www.w3.org/2000/01/rdf-schema#"))
  FILTER(!STRSTARTS(STR(?entity), "http://www.w3.org/2002/07/owl#"))
  FILTER(!STRSTARTS(STR(?entity), "http://www.w3.org/2001/XMLSchema#"))
}`;

export function annotationQuery(properties: readonly string[], variable: string) {
  return `SELECT DISTINCT ?entity ?${variable} WHERE {
    VALUES ?annotation { ${values(properties)} }
    ?entity ?annotation ?${variable} .
    FILTER(isIRI(?entity) && isLiteral(?${variable}))
  }`;
}

export const QUERY_ALL_IRIS = `
SELECT ?iri WHERE {
  { ?iri ?p ?o FILTER(isIRI(?iri)) }
  UNION { ?s ?iri ?o FILTER(isIRI(?iri)) }
  UNION { ?s ?p ?iri FILTER(isIRI(?iri)) }
}`;
