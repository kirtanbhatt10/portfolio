import Link from 'next/link';

import CaseTable from '@/components/CaseTable';
import { projects } from '@/lib/projects';
import { moreOnGithub, person, recognition } from '@/lib/site';

const live = projects.filter((p) => p.demo).length;

export default function Home() {
  return (
    <>
      <div className="wrap">
        <article className="dossier" aria-labelledby="subject-name">
          <div className="dossier-top">
            <span>Subject file KB-00</span>
            <span>Released for public review, November 2026</span>
          </div>
          <p className="stamp" aria-hidden="true">
            Declassified
            <small>open to internships</small>
          </p>
          <h1 id="subject-name" className="dossier-name">
            <span className="redact" style={{ '--i': 0 } as React.CSSProperties}>
              Kirtan
            </span>
            <br />
            <span className="redact" style={{ '--i': 1 } as React.CSSProperties}>
              Bhatt
            </span>
          </h1>
          <dl className="dossier-fields">
            <dt>Occupation</dt>
            <dd>
              <span className="redact" style={{ '--i': 2 } as React.CSSProperties}>
                {person.role}
              </span>
            </dd>
            <dt>Known for</dt>
            <dd>
              <span className="redact" style={{ '--i': 3 } as React.CSSProperties}>
                {person.lede}
              </span>
            </dd>
            <dt>Studying</dt>
            <dd>
              <span className="redact" style={{ '--i': 4 } as React.CSSProperties}>
                B.Tech CE, Cyber Security, IAR Gandhinagar, class of 2028
              </span>
            </dd>
            <dt>Last seen</dt>
            <dd>
              <span className="redact" style={{ '--i': 5 } as React.CSSProperties}>
                Shipping PromptShield 0.2.1 and HeaderHawk 0.2.0
              </span>
            </dd>
          </dl>
          <div className="dossier-actions">
            <Link className="btn btn-primary" href="/work/">
              Open the case files
            </Link>
            <Link className="btn" href="/contact/">
              Get in touch
            </Link>
          </div>
        </article>
      </div>

      <section className="section" aria-labelledby="cases">
        <div className="wrap">
          <div className="section-head">
            <h2 id="cases">Case files</h2>
            <p className="muted">
              {projects.length} projects, newest first. {live} of them run live on this site, so you can try the tool instead of
              reading about it.
            </p>
          </div>
          <CaseTable withFilters={false} />
        </div>
      </section>

      <section className="section" aria-labelledby="record">
        <div className="wrap">
          <div className="section-head">
            <h2 id="record">On the record</h2>
          </div>
          <ul className="record">
            {recognition.slice(0, 4).map((r) => (
              <li key={r.title}>
                <strong>{r.title}</strong>
                <span className="muted">{r.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="more">
        <div className="wrap">
          <div className="section-head">
            <h2 id="more">More on GitHub</h2>
            <p className="muted">Smaller security tools, each with its own README and tests.</p>
          </div>
          <ul className="repos">
            {moreOnGithub.map((r) => (
              <li key={r.name}>
                <a href={`${person.github}/${r.name}`} target="_blank" rel="noopener">
                  {r.name}
                </a>
                <p className="muted">{r.what}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
