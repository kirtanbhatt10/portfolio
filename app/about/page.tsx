import type { Metadata } from 'next';
import Link from 'next/link';

import { education, recognition, toolkit } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description: 'Education, leadership, recognition and the toolkit.',
};

export default function About() {
  return (
    <div className="wrap">
      <header className="page-head">
        <h1 className="page-title">Builder, breaker</h1>
        <p className="lede">
          I am a Computer Engineering (Cyber Security) student at the Institute of Advanced Research, Gandhinagar, with hands-on
          work across web security, API security, networking, AI applications and backend engineering.
        </p>
      </header>

      <dl className="factsheet" aria-label="Education">
        {education.map((e) => (
          <div key={e.label}>
            <dt>{e.label}</dt>
            <dd>{e.value}</dd>
          </div>
        ))}
      </dl>

      <section className="section" aria-labelledby="record">
        <div className="section-head">
          <h2 id="record">Leadership and recognition</h2>
        </div>
        <ul className="record">
          {recognition.map((r) => (
            <li key={r.title}>
              <strong>{r.title}</strong>
              <span className="muted">{r.detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="toolkit">
        <div className="section-head">
          <h2 id="toolkit">Toolkit</h2>
        </div>
        <div className="toolkit">
          {toolkit.map((group) => (
            <div key={group.area}>
              <h3>{group.area}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item.name}>
                    {item.name}
                    {item.level && <span>{item.level}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p style={{ marginTop: '2.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link className="btn btn-primary" href="/work/">
            Open the case files
          </Link>
          <Link className="btn" href="/contact/">
            Get in touch
          </Link>
        </p>
      </section>
    </div>
  );
}
