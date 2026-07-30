import init, { Store } from "oxigraph/web.js";
import { LABEL_PROPERTIES, DESCRIPTION_PROPERTIES } from "../../config/annotationProperties";
import { annotationQuery, QUERY_ALL_IRIS, QUERY_CLASSES, QUERY_NAMED_ENTITIES, QUERY_PROPERTIES } from "./queries";
import type { ParsedOntology } from "./types";

const MAX_ONTOLOGY_BYTES = 25 * 1024 * 1024;
let oxigraphReady: Promise<unknown> | undefined;

export const SUPPORTED_ONTOLOGY_EXTENSIONS = [".ttl", ".rdf", ".owl", ".nt", ".nq", ".trig"];

function ensureOxigraph() {
  oxigraphReady ??= init();
  return oxigraphReady;
}

export function detectRdfFormat(file: Pick<File, "name" | "type">, content: string): string {
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (/^\s*<\?xml|<rdf:RDF[\s>]/i.test(content)) return "application/rdf+xml";
  if (/^\s*(?:@prefix|PREFIX|BASE|@base)\b/im.test(content)) {
    return extension === ".trig" || /\}\s*$/m.test(content) ? "application/trig" : "text/turtle";
  }
  const byExtension: Record<string, string> = {
    ".ttl": "text/turtle",
    ".rdf": "application/rdf+xml",
    ".owl": "application/rdf+xml",
    ".nt": "application/n-triples",
    ".nq": "application/n-quads",
    ".trig": "application/trig",
  };
  return byExtension[extension ?? ""] ?? file.type ?? "text/turtle";
}

type Binding = Map<string, { value: string }>;
type QueryStore = { query(query: string): unknown };

function selectValues(store: QueryStore, query: string, variable: string): string[] {
  return [...(store.query(query) as Binding[])]
    .map((binding) => binding.get(variable)?.value)
    .filter((value): value is string => Boolean(value));
}

function selectAnnotations(store: QueryStore, query: string, variable: string) {
  const result = new Map<string, string[]>();
  for (const binding of store.query(query) as Binding[]) {
    const entity = binding.get("entity")?.value;
    const value = binding.get(variable)?.value;
    if (!entity || !value) continue;
    result.set(entity, [...(result.get(entity) ?? []), value]);
  }
  return result;
}

export async function parseOntologyFile(file: File): Promise<ParsedOntology> {
  if (!file.size) throw new Error("The ontology file is empty.");
  if (file.size > MAX_ONTOLOGY_BYTES) throw new Error("The ontology exceeds the 25 MB limit.");
  const content = await file.text();
  return parseOntologyText(content, file.name, detectRdfFormat(file, content));
}

export async function parseOntologyText(
  content: string,
  name = "ontology.ttl",
  format = "text/turtle",
): Promise<ParsedOntology> {
  await ensureOxigraph();
  const store = new Store();
  try {
    store.load(content, { format, base_iri: "https://assessment.local/base/" });
  } catch (error) {
    throw new Error(`The ontology could not be parsed as ${format}. ${error instanceof Error ? error.message : ""}`.trim());
  }
  const classes = new Set(selectValues(store, QUERY_CLASSES, "class"));
  const properties = new Set(selectValues(store, QUERY_PROPERTIES, "property"));
  const namedEntities = new Set(selectValues(store, QUERY_NAMED_ENTITIES, "entity"));
  const labels = selectAnnotations(store, annotationQuery(LABEL_PROPERTIES, "label"), "label");
  const descriptions = selectAnnotations(store, annotationQuery(DESCRIPTION_PROPERTIES, "description"), "description");
  const allIris = selectValues(store, QUERY_ALL_IRIS, "iri");

  // Operational definition: explicitly declared OWL/RDFS classes; named IRIs occurring
  // as subject or object, excluding RDF/RDFS/OWL/XSD structural vocabulary.
  return {
    name,
    tripleCount: store.size,
    classes,
    properties,
    namedEntities,
    labels,
    descriptions,
    allIris,
  };
}
