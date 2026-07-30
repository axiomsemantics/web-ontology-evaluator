export type GoalId = "rag" | "maintenance" | "alignment";

export interface Coverage {
  numerator: number;
  denominator: number;
  percent: number;
  classification: string;
}

export interface FoundationalResult {
  id: string;
  name: string;
  detected: boolean;
  count: number;
  namespaces: string[];
  examples: string[];
}

export interface TermResult {
  term: string;
  frequency: number;
  matched: boolean;
  labels: string[];
}

export interface AssessmentResult {
  ontologyName: string;
  tripleCount: number;
  classCount: number;
  propertyCount: number;
  namedEntityCount: number;
  durationMs: number;
  classLabelCoverage: Coverage;
  classDescriptionCoverage: Coverage;
  namedEntityLabelCoverage: Coverage;
  classesWithoutLabel: string[];
  classesWithoutDescription: string[];
  foundational: FoundationalResult[];
  terms: TermResult[];
  terminologyCoverage: Coverage;
  weightedTerminologyPercent: number;
}
