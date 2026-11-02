'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { projects } from '@/lib/projects';
import { person } from '@/lib/site';

type Item = { label: string; hint: string; run: () => void };

export default function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [toast, setToast] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const opener = useRef<Element | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActive(0);
    if (opener.current instanceof HTMLElement) opener.current.focus();
  }, []);

  const go = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router],
  );

  const items: Item[] = useMemo(
    () => [
      { label: 'Home', hint: 'Page', run: () => go('/') },
      { label: 'Case files', hint: 'Page', run: () => go('/work/') },
      ...projects.map((p) => ({ label: p.name, hint: p.file, run: () => go(`/work/${p.slug}/`) })),
      { label: 'About', hint: 'Page', run: () => go('/about/') },
      { label: 'Lab', hint: 'Page', run: () => go('/lab/') },
      { label: 'Contact', hint: 'Page', run: () => go('/contact/') },
      {
        label: 'Copy email address',
        hint: 'Action',
        run: () => {
          close();
          if (navigator.clipboard) {
            navigator.clipboard.writeText(person.email).then(
              () => setToast('Email address copied'),
              () => setToast(person.email),
            );
          } else {
            setToast(person.email);
          }
        },
      },
      {
        label: 'Open GitHub profile',
        hint: 'Link',
        run: () => {
          close();
          window.open(person.github, '_blank', 'noopener');
        },
      },
    ],
    [close, go],
  );

  const matches = items.filter((i) => i.label.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        opener.current = document.activeElement;
        setOpen(true);
      }
    };
    const onOpen = () => {
      opener.current = document.activeElement;
      setOpen(true);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-command-menu', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('open-command-menu', onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, matches.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      matches[active]?.run();
    } else if (e.key === 'Tab') {
      e.preventDefault();
    }
  };

  return (
    <>
      {open && (
        <div className="palette" onMouseDown={(e) => e.target === e.currentTarget && close()}>
          <div className="palette-box" role="dialog" aria-modal="true" aria-label="Search the site" onKeyDown={onKeyDown}>
            <input
              ref={input}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              placeholder="Jump to a page, project or action"
              aria-label="Search pages, projects and actions"
              aria-controls="palette-results"
              aria-activedescendant={matches[active] ? `palette-${active}` : undefined}
              role="combobox"
              aria-expanded="true"
            />
            {matches.length ? (
              <ul id="palette-results" role="listbox">
                {matches.map((item, i) => (
                  <li
                    key={item.label}
                    id={`palette-${i}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={item.run}
                  >
                    {item.label}
                    <span>{item.hint}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="palette-empty">Nothing matches &ldquo;{query}&rdquo;. Try a project name, &ldquo;lab&rdquo; or &ldquo;email&rdquo;.</p>
            )}
          </div>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}
