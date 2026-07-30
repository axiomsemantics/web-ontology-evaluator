import { calculateCoverage } from "../ontology/metrics";
import { tokenizeText } from "./textNormalizer";
import type { TermResult } from "../assessment/assessmentTypes";

export function calculateTerminology(
  frequencies: Map<string, number>,
  labels: string[],
  limit = 50,
) {
  const labelIndex = new Map<string, Set<string>>();
  for (const label of labels) {
    for (const token of tokenizeText(label)) {
      const values = labelIndex.get(token) ?? new Set<string>();
      values.add(label);
      labelIndex.set(token, values);
    }
  }

  const terms: TermResult[] = [...frequencies]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([term, frequency]) => ({
      term,
      frequency,
      matched: labelIndex.has(term),
      labels: [...(labelIndex.get(term) ?? [])].slice(0, 6),
    }));

  const matched = terms.filter((term) => term.matched);
  const allFrequency = terms.reduce((sum, term) => sum + term.frequency, 0);
  const matchedFrequency = matched.reduce((sum, term) => sum + term.frequency, 0);
  return {
    terms,
    coverage: calculateCoverage(matched.length, terms.length),
    weightedPercent: allFrequency ? Math.round((matchedFrequency / allFrequency) * 100) : 0,
  };
}
