import type { TermResult } from "../../features/assessment/assessmentTypes";

export function WordCloud({ terms }: { terms: TermResult[] }) {
  const max = Math.max(...terms.map((term) => term.frequency), 1);
  return (
    <div className="wordCloud" role="img" aria-label={`Word cloud of ${terms.length} relevant document terms`}>
      {terms.map((term, index) => (
        <span
          key={term.term}
          title={`${term.term}: ${term.frequency}`}
          className={term.matched ? "matched" : ""}
          style={{
            fontSize: `${0.85 + (term.frequency / max) * 1.6}rem`,
            transform: `rotate(${index % 7 === 0 ? -4 : index % 9 === 0 ? 4 : 0}deg)`,
          }}
        >
          {term.term}
        </span>
      ))}
    </div>
  );
}
