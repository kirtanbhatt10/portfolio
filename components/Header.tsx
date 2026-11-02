'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/work/', label: 'Work' },
  { href: '/about/', label: 'About' },
  { href: '/lab/', label: 'Lab' },
  { href: '/contact/', label: 'Contact' },
];

export function openCommandMenu() {
  window.dispatchEvent(new Event('open-command-menu'));
}

export default function Header() {
  const pathname = usePathname() ?? '/';
  const current = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <header className="site-header">
      <div className="wrap">
        <Link className="wordmark" href="/" aria-label="Kirtan Bhatt, home">
          KB
        </Link>
        <nav className="nav" aria-label="Main">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} aria-current={current(item.href) ? 'page' : undefined}>
              {item.label}
            </Link>
          ))}
          <button type="button" className="search-btn" onClick={openCommandMenu} aria-label="Search the site">
            <span className="search-label">Search</span>
            <kbd>/</kbd>
          </button>
        </nav>
      </div>
    </header>
  );
}
