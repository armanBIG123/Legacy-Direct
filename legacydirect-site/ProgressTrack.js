export default function ProgressTrack({ total, current }) {
  // Echoes the homepage's dashed signature-line motif: each question is a
  // dash that fills in gold as it's completed, with a small x marking the
  // one in progress — rather than a plain filled bar.
  return (
    <div className="apply-progress" role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={total}>
      <div className="apply-progress-track">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`apply-progress-dash ${i < current ? 'is-done' : ''} ${i === current ? 'is-current' : ''}`}
          />
        ))}
      </div>
      <div className="apply-progress-count">
        {current + 1} of {total}
      </div>
    </div>
  );
}
