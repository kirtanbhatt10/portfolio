'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { projects } from '@/lib/projects';
import { person, recognition, toolkit } from '@/lib/site';
import { sha256 } from './Sha256';

type Line = { text: string; tone?: 'dim' | 'ok' | 'cmd' };

const HELP = 'whoami  projects  open <name>  skills  wins  contact  sha256 <text>  clear';

export default function Terminal() {
  const router = useRouter();
  const [lines, setLines] = useState<Line[]>([{ text: 'case-shell 2.0. Type "help" to see commands.', tone: 'dim' }]);
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(0);
  const out = useRef<HTMLDivElement>(null);

  useEffect(() => {
    out.current?.scrollTo({ top: out.current.scrollHeight });
  }, [lines]);

  const print = (text: string, tone?: Line['tone']) => setLines((l) => [...l, { text, tone }]);

  const run = async (raw: string) => {
    const [cmd = '', ...rest] = raw.split(/\s+/);
    const arg = rest.join(' ');
    switch (cmd.toLowerCase()) {
      case 'help':
        print(HELP, 'dim');
        break;
      case 'whoami':
        print(`${person.name}. B.Tech Computer Engineering (Cyber Security), IAR Gandhinagar.\n${person.lede}`);
        break;
      case 'ls':
      case 'projects':
        print(projects.map((p) => `  ${p.slug.padEnd(18)}${p.name}`).join('\n') + '\ntry: open promptshield', undefined);
        break;
      case 'open': {
        const q = arg.toLowerCase();
        const p = q ? projects.find((x) => x.slug.startsWith(q) || x.name.toLowerCase().startsWith(q)) : undefined;
        if (p) {
          print(`opening ${p.name}`, 'ok');
          setTimeout(() => router.push(`/work/${p.slug}/`), 300);
        } else {
          print(`not found: ${arg || '(nothing)'}. Run "projects" for the list.`);
        }
        break;
      }
      case 'skills':
        print(toolkit.map((t) => `${t.area.toLowerCase().padEnd(16)}${t.items.map((i) => i.name).join(', ')}`).join('\n'));
        break;
      case 'wins':
        print(recognition.map((r) => r.title).join('\n'));
        break;
      case 'contact':
        print(`${person.email}\n${person.github.replace('https://', '')}`);
        break;
      case 'sha256':
        print(arg ? await sha256(arg) : 'usage: sha256 <text>', arg ? 'ok' : undefined);
        break;
      case 'sudo':
        print('Nice try. This incident will be reported.');
        break;
      case 'clear':
        setLines([]);
        break;
      default:
        print(`command not found: ${cmd}. Try "help".`);
    }
  };

  const onKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault();
      const next = Math.max(0, cursor - 1);
      setCursor(next);
      setValue(history[next]);
      return;
    }
    if (e.key === 'ArrowDown' && history.length) {
      e.preventDefault();
      const next = Math.min(history.length, cursor + 1);
      setCursor(next);
      setValue(history[next] ?? '');
      return;
    }
    if (e.key !== 'Enter') return;
    const raw = value.trim();
    setValue('');
    if (!raw) return;
    setHistory((h) => [...h, raw]);
    setCursor(history.length + 1);
    print(raw, 'cmd');
    await run(raw);
  };

  return (
    <div className="terminal">
      <div className="terminal-bar">case-shell</div>
      <div className="terminal-out" ref={out} role="log" aria-live="polite">
        {lines.map((l, i) => (
          <div key={i} className={l.tone}>
            {l.text}
          </div>
        ))}
      </div>
      <div className="terminal-in">
        <span aria-hidden="true">$</span>
        <label className="skip" htmlFor="term-in">
          Terminal command
        </label>
        <input
          id="term-in"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
