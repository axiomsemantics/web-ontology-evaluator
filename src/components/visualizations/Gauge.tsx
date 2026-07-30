import type { Coverage } from "../../features/assessment/assessmentTypes";

export function Gauge({ label, coverage, explanation }: { label: string; coverage: Coverage; explanation: string }) {
  const progress = Math.min(100, Math.max(0, coverage.percent));
  return (
    <figure className="gauge">
      <div
        className="gaugeRing"
        style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties}
        role="img"
        aria-label={`${label}: ${coverage.percent} percent, ${coverage.classification}, ${coverage.numerator} of ${coverage.denominator}`}
      >
        <div><strong>{coverage.percent}%</strong><span>{coverage.classification}</span></div>
      </div>
      <figcaption>
        <strong>{label}</strong>
        <span>{coverage.numerator} of {coverage.denominator}</span>
        <small>{explanation}</small>
      </figcaption>
    </figure>
  );
}
