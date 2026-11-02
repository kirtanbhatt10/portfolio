import type { Metadata } from 'next';
import Link from 'next/link';

import { education, person, recognition, toolkit } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description: 'Education, leadership, recognition and the toolkit, as a whois record.',
};

const value = (label: string) => education.find((e) => e.label === label)?.value ?? '';

const WHOIS: [string, React.ReactNode][] = [
  ['Registrant Name', person.name],
  ['Registrant Location', person.location],
  ['Registrar', value('Institute')],
  ['Program', value('Degree')],
  ['Term', value('Semester')],
  ['CGPA', value('CGPA')],
  ['Domain Status', 'open to internships in security, backend and AI'],
  [
    'Name Server',
    <a key="gh" href={person.github} target="_blank" rel="noopener">
      {person.github.replace('https://', '')}
    </a>,
  ],
];

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

      <figure className="whois">
        <figcaption className="trace-cmd">
          <span aria-hidden="true">$ </span>whois kirtan.bhatt
        </figcaption>
        <dl>
          {WHOIS.map(([k, v]) => (
            <div key={k}>
              <dt>{k}:</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </figure>

      <section className="section" aria-labelledby="record">
        <div className="section-head">
          <h2 id="record">On the record</h2>
        </div>
        <ol className="record">
          {recognition.map((r) => (
            <li key={r.title}>
              <strong>{r.title}</strong>
              <span>{r.detail}</span>
            </li>
          ))}
        </ol>
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
        <p className="actions">
          <Link className="btn btn-solid" href="/work/">
            Open the packet capture
          </Link>
          <Link className="btn btn-line" href="/contact/">
            Start a handshake
          </Link>
        </p>
      </section>
    </div>
  );
}
