import type { Metadata } from 'next';

import CaseTable from '@/components/CaseTable';
import { projects } from '@/lib/projects';

export const metadata: Metadata = {
  title: 'Case files',
  description: 'Security tools, AI products, a desktop app and a startup, each with its own case file.',
};

export default function Work() {
  return (
    <div className="wrap">
      <header className="page-head">
        <h1 className="page-title">Case files</h1>
        <p className="lede">
          {projects.length} projects, newest first. Open a file for how it fits together, what I did and, for the security tools,
          a version you can run in this page.
        </p>
      </header>
      <section style={{ paddingBottom: 'clamp(3rem, 8vw, 6rem)' }} aria-label="All case files">
        <CaseTable />
      </section>
    </div>
  );
}
