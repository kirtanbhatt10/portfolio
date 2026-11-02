export default function Traceroute({ target, file, steps }: { target: string; file: string; steps: string[] }) {
  return (
    <figure className="trace">
      <figcaption className="trace-cmd">
        <span aria-hidden="true">$ </span>traceroute {target}
        <span className="trace-sub">
          to {target} ({file}), {steps.length} hops
        </span>
      </figcaption>
      <ol className="trace-hops">
        {steps.map((step, i) => (
          <li key={step} className={i === steps.length - 1 ? 'dest' : undefined}>
            <span className="hop" aria-hidden="true">
              {i + 1}
            </span>
            <span className="hop-name">{step}</span>
            {i === steps.length - 1 && <span className="hop-dest">destination reached</span>}
          </li>
        ))}
      </ol>
    </figure>
  );
}
