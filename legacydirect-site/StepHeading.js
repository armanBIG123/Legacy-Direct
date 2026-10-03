export default function StepHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="apply-step-heading">
      {eyebrow && <div className="apply-eyebrow">{eyebrow}</div>}
      <h1>{title}</h1>
      {subtitle && <p className="apply-subtitle">{subtitle}</p>}
    </div>
  );
}
