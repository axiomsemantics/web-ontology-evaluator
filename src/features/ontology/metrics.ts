import { classifyCoverage } from "../../config/thresholds";
import type { Coverage } from "../assessment/assessmentTypes";

export function calculateCoverage(numerator: number, denominator: number): Coverage {
  const safeNumerator = Math.max(0, numerator);
  const percent = denominator > 0 ? Math.round((safeNumerator / denominator) * 100) : 0;
  return {
    numerator: safeNumerator,
    denominator: Math.max(0, denominator),
    percent,
    classification: classifyCoverage(percent),
  };
}
