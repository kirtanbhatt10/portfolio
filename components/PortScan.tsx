'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { projects } from '@/lib/projects';

const OPEN = [
  { path: '/', service: 'home' },
  { path: '/work/', service: 'packet capture' },
  ...projects.slice(0, 3).map((p) => ({ path: `/work/${p.slug}/`, service: `${p.name}, live demo` })),
  { path: '/about/', service: 'whois' },
  { path: '/lab/', service: 'terminal' },
  { path: '/contact/', service: 'handshake' },
];

export default function PortScan() {
  const pathname = usePathname();
  const [asked, setAsked] = useState('');
  useEffect(() => setAsked(window.location.pathname.replace(/^\/portfolio/, '') || pathname || '/'), [pathname]);

  return (
    <figure className="scan">
      <figcaption className="trace-cmd">
        <span aria-hidden="true">$ </span>nmap kirtanbhatt10.github.io/portfolio
      </figcaption>
      <table>
        <thead>
          <tr>
            <th scope="col">Path</th>
            <th scope="col">State</th>
            <th scope="col">Service</th>
          </tr>
        </thead>
        <tbody>
          {asked && (
            <tr className="closed">
              <td>{asked}</td>
              <td>closed</td>
              <td>nothing listening here</td>
            </tr>
          )}
          {OPEN.map((o) => (
            <tr key={o.path}>
              <td>
                <Link href={o.path}>{o.path}</Link>
              </td>
              <td>open</td>
              <td>{o.service}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
