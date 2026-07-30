export const COVERAGE_THRESHOLDS = [
  { min: 90, label: "Excellent" },
  { min: 70, label: "Good" },
  { min: 40, label: "Moderate" },
  { min: 0, label: "Low" },
] as const;

export function classifyCoverage(percent: number): string {
  return COVERAGE_THRESHOLDS.find((threshold) => percent >= threshold.min)!.label;
}
