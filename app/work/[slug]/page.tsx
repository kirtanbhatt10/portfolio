import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import HeaderHawkDemo from '@/components/demos/HeaderHawkDemo';
import PhishDemo from '@/components/demos/PhishDemo';
import PromptShieldDemo from '@/components/demos/PromptShieldDemo';
import Flow from '@/components/Flow';
import { type Demo, getProject, neighbours, projects } from '@/lib/projects';

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  return p ? { title: p.name, description: p.summary } : {};
}

const DEMOS: Record<Demo, () => React.JSX.Element> = {
  promptshield: PromptShieldDemo,
  headerhawk: HeaderHawkDemo,
  phish: PhishDemo,
};

export default async function CaseFile({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const { prev, next } = neighbours(p.slug);
  const DemoView = p.demo ? DEMOS[p.demo] : null;

  return (
    <div className="wrap">
      <p className="crumbs">
        <Link href="/work/">Case files</Link> / {p.name}
      </p>

      <header className="file-head">
        <p className="file-no">File {p.file}</p>
        <h1 className="file-title">{p.name}</h1>
        <p className="file-summary">{p.summary}</p>
      </header>

      <dl className="factsheet">
        <div>
          <dt>Role</dt>
          <dd>{p.role}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{p.status}</dd>
        </div>
        <div>
          <dt>Type</dt>
          <dd>{p.type}</dd>
        </div>
        {p.links.length > 0 && (
          <div>
            <dt>Links</dt>
            <dd>
              <ul>
                {p.links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} target="_blank" rel="noopener">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
        {p.evidence && (
          <div>
            <dt>Evidence</dt>
            <dd>
              <ul className="evidence">
                {p.evidence.map((e) => (
                  <li key={e.label}>
                    {e.value} {e.label}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
      </dl>

      <section className="section" aria-labelledby="flow">
        <h2 id="flow">How it fits together</h2>
        <Flow steps={p.flow} label={`How ${p.name} works, step by step`} />
      </section>

      {DemoView && (
        <section className="section" aria-labelledby="try">
          <div className="section-head">
            <h2 id="try">Try it</h2>
          </div>
          <DemoView />
        </section>
      )}

      <section className="section two-col">
        <div>
          <h2>What I did</h2>
          <ul className="did">
            {p.did.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Stack</h2>
          <ul className="stack">
            {p.stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </section>

      <nav className="section pager" aria-label="More case files">
        <Link href={`/work/${prev.slug}/`}>
          <span>Previous file</span>
          <strong>{prev.name}</strong>
        </Link>
        <Link href={`/work/${next.slug}/`}>
          <span>Next file</span>
          <strong>{next.name}</strong>
        </Link>
      </nav>
    </div>
  );
}
