const labels = ["Objectives", "Files", "Results"];

export function Stepper({ current }: { current: number }) {
  return (
    <nav aria-label="Assessment progress" className="stepper">
      <ol>
        {labels.map((label, index) => (
          <li className={index + 1 <= current ? "active" : ""} aria-current={index + 1 === current ? "step" : undefined} key={label}>
            <span>{index + 1}</span><small>{label}</small>
          </li>
        ))}
      </ol>
    </nav>
  );
}
