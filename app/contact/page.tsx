import type { Metadata } from 'next';

import CopyEmail from '@/components/CopyEmail';
import { person } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Open to security, backend and AI internships.',
};

export default function Contact() {
  return (
    <div className="wrap">
      <header className="page-head">
        <h1 className="page-title">Open to internships</h1>
        <p className="lede">Security, backend and AI roles. Based in Gandhinagar, Gujarat, and happy to work remotely.</p>
      </header>
      <section style={{ paddingBottom: 'clamp(3rem, 8vw, 6rem)', display: 'grid', gap: '1.5rem' }} aria-label="Ways to reach me">
        <a className="contact-mail" href={`mailto:${person.email}`}>
          {person.email}
        </a>
        <p style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <CopyEmail email={person.email} />
          <a className="btn" href={person.github} target="_blank" rel="noopener">
            GitHub
          </a>
          <a className="btn" href={person.linkedin} target="_blank" rel="noopener">
            LinkedIn
          </a>
        </p>
      </section>
    </div>
  );
}
