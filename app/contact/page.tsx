import type { Metadata } from 'next';

import CopyEmail from '@/components/CopyEmail';
import { person } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Open to security, backend and AI internships.',
};

const STEPS = [
  { flag: 'SYN', dir: 'right', text: 'You send an email about a role or a project.' },
  { flag: 'SYN-ACK', dir: 'left', text: 'I write back with what I can bring to it.' },
  { flag: 'ACK', dir: 'right', text: 'We set up a call. Connection established.' },
];

export default function Contact() {
  return (
    <div className="wrap">
      <header className="page-head">
        <h1 className="page-title">Open to internships</h1>
        <p className="lede">Security, backend and AI roles. Based in Gandhinagar, Gujarat, and happy to work remotely.</p>
      </header>

      <section className="page-body contact" aria-label="Ways to reach me">
        <a className="contact-mail" href={`mailto:${person.email}`}>
          {person.email}
        </a>
        <p className="actions">
          <CopyEmail email={person.email} />
          <a className="btn btn-line" href={person.github} target="_blank" rel="noopener">
            GitHub
          </a>
          <a className="btn btn-line" href={person.linkedin} target="_blank" rel="noopener">
            LinkedIn
          </a>
        </p>

        <figure className="handshake">
          <figcaption>How this usually goes: a TCP three-way handshake.</figcaption>
          <div className="lanes" aria-hidden="true">
            <span>You</span>
            <span>Kirtan</span>
          </div>
          <ol>
            {STEPS.map((s) => (
              <li key={s.flag} className={`hs-${s.dir}`}>
                <span className="hs-flag">{s.flag}</span>
                <span className="hs-text">{s.text}</span>
              </li>
            ))}
          </ol>
        </figure>
      </section>
    </div>
  );
}
