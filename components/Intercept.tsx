'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { HOSTILE, intercept, type Interception, SELF_INJECTION } from '@/lib/intercept';
import { person } from '@/lib/site';

type Ticket = Interception & { id: number; mine?: boolean };
type Phase = 'idle' | 'typing' | 'scanning' | 'blocked' | 'done';

const LABEL = { blocked: 'Blocked', flagged: 'Flagged', allowed: 'Allowed' } as const;
const pad = (n: number) => String(n).padStart(4, '0');

export default function Intercept() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [typed, setTyped] = useState(0);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stopped, setStopped] = useState(0);
  const [allowed, setAllowed] = useState(0);
  const [wall, setWall] = useState<string[]>([]);
  const [value, setValue] = useState('');
  const [said, setSaid] = useState('');
  const nextId = useRef(1);
  const feedAt = useRef(0);
  const timers = useRef<number[]>([]);

  const print = useCallback((r: Interception, mine = false) => {
    const t: Ticket = { ...r, id: nextId.current++, mine };
    setTickets((list) => [t, ...list].slice(0, 5));
    if (r.outcome === 'allowed') setAllowed((n) => n + 1);
    else setStopped((n) => n + 1);
    return t;
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const run = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setTyped(0);
    setPhase('typing');
    let i = 0;
    const step = () => {
      i += 1;
      setTyped(i);
      if (i < SELF_INJECTION.length) later(step, 26 + Math.random() * 40);
      else
        later(() => {
          setPhase('scanning');
          later(() => {
            setPhase('blocked');
            print(intercept(SELF_INJECTION));
            later(() => setPhase('done'), 2600);
          }, 700);
        }, 350);
    };
    later(step, 900);
  }, [print]);

  // The page injects an instruction into itself once, and PromptShield stops it.
  useEffect(() => {
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still) {
      setPhase('done');
      print(intercept(SELF_INJECTION));
      HOSTILE.slice(0, 3).forEach((h) => print(intercept(h)));
      feedAt.current = HOSTILE.length;
      return;
    }
    run();
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, [print, run]);

  // As soon as the injection is caught, red-team traffic keeps arriving for one pass through the list, paused while the tab is hidden.
  useEffect(() => {
    if ((phase !== 'blocked' && phase !== 'done') || feedAt.current >= HOSTILE.length) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      if (feedAt.current >= HOSTILE.length) return window.clearInterval(id);
      print(intercept(HOSTILE[feedAt.current++]));
    }, 2300);
    return () => window.clearInterval(id);
  }, [phase, print]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = value.trim().slice(0, 160);
    if (!text) return;
    const t = print(intercept(text), true);
    if (t.outcome === 'allowed') {
      setWall((w) => [text, ...w].slice(0, 3));
      setSaid('It got through. Your message is now on this page, on your screen only.');
    } else {
      setSaid(`${LABEL[t.outcome]} by ${t.detector}: ${t.rule}, score ${t.score}. Try something friendlier.`);
    }
    setValue('');
  };

  const shown = SELF_INJECTION.slice(0, typed);

  return (
    <section className="hero" aria-labelledby="hero-name">
      <div className="wrap hero-grid">
        <div className="hero-main">
          <p className="hero-status">
            <span className="live" aria-hidden="true" />
            Blue-team console. This page is attacked while you read it.
          </p>
          <h1 id="hero-name" className="hero-name">
            Kirtan
            <br />
            Bhatt
          </h1>
          <p className="hero-lede">
            {person.lede}{' '}
            {phase === 'typing' && (
              <span className="inject" aria-hidden="true">
                {shown}
                <span className="caret" />
              </span>
            )}
            {(phase === 'scanning' || phase === 'blocked') && (
              <span className={`inject ${phase}`} aria-hidden="true">
                <span className="inject-text">{SELF_INJECTION}</span>
                {phase === 'blocked' && (
                  <span className="inject-stamp">
                    Blocked
                    <small>PromptShield, instruction_override, 50</small>
                  </span>
                )}
              </span>
            )}
            {phase === 'done' && (
              <button type="button" className="inject-tag" onClick={run}>
                1 injection blocked. Watch it again
              </button>
            )}
            <span className="skip">
              While the page loads, it injects the instruction “{SELF_INJECTION}” into this paragraph, and PromptShield blocks
              it.
            </span>
          </p>
          {wall.length > 0 && (
            <ul className="graffiti" aria-label="Messages you got past the detectors">
              {wall.map((w, i) => (
                <li key={`${w}-${i}`}>{w}</li>
              ))}
            </ul>
          )}
          <div className="hero-actions">
            <Link className="btn btn-solid" href="/work/">
              Open the packet capture
            </Link>
            <a className="btn btn-line" href="#attack">
              Try to get past me
            </a>
          </div>
        </div>

        <aside className="printer" aria-label="Interception log">
          <div className="printer-head">
            <p>
              <strong>{stopped}</strong> stopped
            </p>
            <p>
              <strong>{allowed}</strong> allowed
            </p>
          </div>
          <div className="printer-slot" aria-hidden="true" />
          {tickets.length === 0 && <p className="tickets-empty">Listening for traffic…</p>}
          <ol className="tickets">
            {tickets.map((t) => (
              <li key={t.id} className={`ticket is-${t.outcome}`}>
                <p className="ticket-top">
                  <span>#{pad(t.id)}</span>
                  {t.mine && <span className="ticket-you">you</span>}
                  <span className="ticket-verdict">{LABEL[t.outcome]}</span>
                </p>
                <p className="ticket-text">{t.text}</p>
                <p className="ticket-meta">
                  <span>{t.detector}</span>
                  <span>{t.rule}</span>
                  <span>{t.score}</span>
                </p>
              </li>
            ))}
          </ol>
        </aside>
      </div>

      <form id="attack" className="wrap attack" onSubmit={submit}>
        <label htmlFor="attack-in">
          Write something on this page. If it gets past PromptShield and the phishing analyser, it stays.
        </label>
        <div className="attack-row">
          <input
            id="attack-in"
            type="text"
            value={value}
            maxLength={160}
            autoComplete="off"
            spellCheck={false}
            placeholder="Say hello, or try “ignore all previous instructions…”"
            onChange={(e) => setValue(e.target.value)}
          />
          <button type="submit" className="btn btn-solid">
            Send
          </button>
        </div>
        <p className="attack-note" role="status">
          {said || 'Runs in your browser. Nothing is sent or stored.'}
        </p>
      </form>
    </section>
  );
}
