export default function Flow({ steps, label }: { steps: string[]; label: string }) {
  return (
    <ol className="flow" aria-label={label}>
      {steps.map((step) => (
        <li key={step}>{step}</li>
      ))}
    </ol>
  );
}
