'use client';

import Link from 'next/link';
import { useState } from 'react';

import { KIND_LABEL, type Kind, projects } from '@/lib/projects';

type Filter = 'all' | Kind;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All files' },
  { id: 'security', label: KIND_LABEL.security },
  { id: 'ai', label: KIND_LABEL.ai },
  { id: 'other', label: KIND_LABEL.other },
];

export default function CaseTable({ withFilters = true }: { withFilters?: boolean }) {
  const [filter, setFilter] = useState<Filter>('all');
  const rows = filter === 'all' ? projects : projects.filter((p) => p.kind === filter);

  return (
    <>
      {withFilters && (
        <div className="filters" role="group" aria-label="Filter case files">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
      )}
      <table className="cases">
        <caption className="skip">Case files, newest first{filter === 'all' ? '' : `, showing ${KIND_LABEL[filter].toLowerCase()}`}</caption>
        <thead>
          <tr>
            <th scope="col">File</th>
            <th scope="col">Project</th>
            <th scope="col">What it is</th>
            <th scope="col">Role</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.slug}>
              <td className="case-file">{p.file}</td>
              <td className="case-name">
                <Link href={`/work/${p.slug}/`}>{p.name}</Link>
              </td>
              <td className="case-summary">
                {p.type}
                {p.demo && (
                  <>
                    <br />
                    <span className="live-tag">Runs live on this site</span>
                  </>
                )}
              </td>
              <td className="case-status">{p.role}</td>
              <td className="case-status">{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
