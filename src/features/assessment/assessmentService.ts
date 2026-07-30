import { detectFoundationalIris } from "../../config/foundationalOntologies";
import { countTerms } from "../documents/textNormalizer";
import { calculateTerminology } from "../documents/terminologyMetrics";
import { calculateCoverage } from "../ontology/metrics";
import { parseOntologyFile } from "../ontology/parser";
import type { AssessmentResult } from "./assessmentTypes";

export async function runAssessment(ontology: File, documentTexts: string[]): Promise<AssessmentResult> {
  const started = performance.now();
  const parsed = await parseOntologyFile(ontology);
  const classList = [...parsed.classes];
  const entityList = [...parsed.namedEntities];
  const labels = [...parsed.labels.values()].flat();
  const classLabels = classList.filter((iri) => parsed.labels.has(iri));
  const classDescriptions = classList.filter((iri) => parsed.descriptions.has(iri));
  const entityLabels = entityList.filter((iri) => parsed.labels.has(iri));
  const terminology = calculateTerminology(countTerms(documentTexts.join("\n")), labels);

  return {
    ontologyName: parsed.name,
    tripleCount: parsed.tripleCount,
    classCount: parsed.classes.size,
    propertyCount: parsed.properties.size,
    namedEntityCount: parsed.namedEntities.size,
    durationMs: Math.round(performance.now() - started),
    classLabelCoverage: calculateCoverage(classLabels.length, classList.length),
    classDescriptionCoverage: calculateCoverage(classDescriptions.length, classList.length),
    namedEntityLabelCoverage: calculateCoverage(entityLabels.length, entityList.length),
    classesWithoutLabel: classList.filter((iri) => !parsed.labels.has(iri)).slice(0, 10),
    classesWithoutDescription: classList.filter((iri) => !parsed.descriptions.has(iri)).slice(0, 10),
    foundational: detectFoundationalIris(parsed.allIris),
    terms: terminology.terms,
    terminologyCoverage: terminology.coverage,
    weightedTerminologyPercent: terminology.weightedPercent,
  };
}
