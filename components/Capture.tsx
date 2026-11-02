'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { FILTER_EXAMPLES, type Filter, hex, parseFilter, printable, toPacket } from '@/lib/capture';
import { projects } from '@/lib/projects';

type Valid = Extract<Filter, { ok: true }>;

const ALL: Valid = { ok: true, test: () => true };

function useBytesPerRow() {
  const [n, setN] = useState(16);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const set = () => setN(mq.matches ? 8 : 16);
    set();
    mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, []);
  return n;
}

export default function Capture() {
  const router = useRouter();
  const [expr, setExpr] = useState('');
  const [selected, setSelected] = useState(projects[0].slug);
  const [hover, setHover] = useState<number | null>(null);
  const lastGood = useRef<Valid>(ALL);
  const hexBox = useRef<HTMLDivElement>(null);
  const perRow = useBytesPerRow();

  const parsed = useMemo(() => parseFilter(expr, projects), [expr]);
  if (parsed.ok) lastGood.current = parsed;
  const rows = projects.filter(lastGood.current.test);
  const current = rows.find((p) => p.slug === selected) ?? rows[0];
  const packet = useMemo(() => (current ? toPacket(current) : null), [current]);

  const fieldOf = useMemo(() => {
    if (!packet) return [];
    const map = new Array<number>(packet.bytes.length);
    packet.fields.forEach((f, i) => map.fill(i, f.start, f.end));
    return map;
  }, [packet]);

  // Keep the highlighted bytes in view inside the hex pane without scrolling the page.
  useEffect(() => {
    if (hover === null || !packet || !hexBox.current) return;
    const row = Math.floor(packet.fields[hover].start / perRow);
    const el = hexBox.current.querySelectorAll<HTMLElement>('.hex-row')[row];
    if (!el) return;
    const box = hexBox.current;
    if (el.offsetTop < box.scrollTop || el.offsetTop > box.scrollTop + box.clientHeight - el.offsetHeight) {
      box.scrollTo({ top: el.offsetTop - 8 });
    }
  }, [hover, packet, perRow]);

  const open = (slug: string) => router.push(`/work/${slug}/`);

  const onListKey = (e: React.KeyboardEvent) => {
    if (!current) return;
    const i = rows.indexOf(current);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = rows[Math.max(0, Math.min(rows.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))];
      setSelected(next.slug);
      document.getElementById(`pkt-${next.slug}`)?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      open(current.slug);
    }
  };

  const state = !expr.trim() ? 'empty' : parsed.ok ? 'ok' : 'bad';
  const hexRows: number[] = [];
  if (packet) for (let o = 0; o < packet.bytes.length; o += perRow) hexRows.push(o);

  return (
    <div className="pcap">
      <div className="pcap-filter" data-state={state}>
        <label htmlFor="dfilter">Display filter</label>
        <input
          id="dfilter"
          type="text"
          value={expr}
          spellCheck={false}
          autoComplete="off"
          placeholder="Apply a display filter, e.g. proto == HTTP"
          aria-invalid={state === 'bad'}
          aria-describedby="dfilter-msg"
          onChange={(e) => setExpr(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && setExpr('')}
        />
        <span className="pcap-count">
          Displayed {rows.length} of {projects.length}
        </span>
      </div>
      <p id="dfilter-msg" className="pcap-msg" role="status">
        {parsed.ok ? (
          <>
            Try{' '}
            {FILTER_EXAMPLES.map((ex) => (
              <button key={ex} type="button" onClick={() => setExpr(ex)}>
                {ex}
              </button>
            ))}
          </>
        ) : (
          <span className="pcap-error">{parsed.error}</span>
        )}
      </p>

      <div
        className="pcap-list"
        role="listbox"
        tabIndex={0}
        aria-label="Projects, as captured packets. Use the arrow keys to select and Enter to open."
        aria-activedescendant={current ? `pkt-${current.slug}` : undefined}
        onKeyDown={onListKey}
      >
        <div className="pcap-row pcap-headrow" aria-hidden="true">
          <span>No.</span>
          <span>Proto</span>
          <span>Source</span>
          <span>Length</span>
          <span>Info</span>
        </div>
        {rows.map((p) => (
          <div
            key={p.slug}
            id={`pkt-${p.slug}`}
            role="option"
            aria-selected={p === current}
            className="pcap-row"
            data-kind={p.kind}
            onClick={() => setSelected(p.slug)}
            onDoubleClick={() => open(p.slug)}
          >
            <span>{p.file}</span>
            <span className="pcap-proto">{p.proto}</span>
            <span>{p.role}</span>
            <span>{toPacket(p).bytes.length}</span>
            <span className="pcap-info">
              <b>{p.name}</b> {p.type}
              {p.demo && <em> runs live</em>}
            </span>
          </div>
        ))}
        {rows.length === 0 && <p className="pcap-empty">No packets match this filter. Press Escape to clear it.</p>}
      </div>

      {current && packet && (
        <div className="pcap-panes">
          <div className="pcap-tree">
            <details open>
              <summary>
                Frame {current.file}: {packet.bytes.length} bytes captured
              </summary>
              <ul>
                {packet.fields.map((f, i) => (
                  <li
                    key={f.key}
                    className={hover === i ? 'on' : undefined}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover(null)}
                    tabIndex={0}
                  >
                    <span className="pcap-key">{f.label}:</span> {f.value}
                  </li>
                ))}
              </ul>
            </details>
            {current.evidence && (
              <details open>
                <summary>Evidence ({current.evidence.length} items)</summary>
                <ul>
                  {current.evidence.map((e) => (
                    <li key={e.label}>
                      <span className="pcap-key">{e.value}</span> {e.label}
                    </li>
                  ))}
                </ul>
              </details>
            )}
            <Link className="btn btn-solid pcap-open" href={`/work/${current.slug}/`}>
              Open the {current.name} case file
            </Link>
          </div>

          <div className="pcap-hex" ref={hexBox} aria-hidden="true">
            {hexRows.map((o) => {
              const slice = Array.from(packet.bytes.slice(o, o + perRow));
              return (
                <div className="hex-row" key={o}>
                  <span className="hex-off">{hex(o, 4)}</span>
                  <span className="hex-bytes">
                    {slice.map((b, j) => {
                      const f = fieldOf[o + j];
                      return (
                        <span key={j} className={f === hover ? 'on' : undefined} onMouseEnter={() => setHover(f)} onMouseLeave={() => setHover(null)}>
                          {hex(b)}
                        </span>
                      );
                    })}
                  </span>
                  <span className="hex-ascii">
                    {slice.map((b, j) => {
                      const f = fieldOf[o + j];
                      return (
                        <span key={j} className={f === hover ? 'on' : undefined} onMouseEnter={() => setHover(f)} onMouseLeave={() => setHover(null)}>
                          {printable(b)}
                        </span>
                      );
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
