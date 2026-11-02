/**
 * The project index is shown as a packet capture. Each project becomes a
 * "packet" whose payload is its own fact sheet, so the hex pane shows real bytes
 * and every byte belongs to exactly one field.
 */

import { KIND_LABEL, type Project } from './projects.ts';

export interface Field {
  key: string;
  label: string;
  value: string;
  /** Byte range [start, end) of this field inside the packet payload. */
  start: number;
  end: number;
}

export interface Packet {
  bytes: Uint8Array;
  fields: Field[];
}

const encoder = new TextEncoder();

/** Builds the payload: one field per line, so the ASCII column reads like the fact sheet. */
export function toPacket(p: Project): Packet {
  const rows: [string, string, string][] = [
    ['name', 'Project', p.name],
    ['type', 'Type', p.type],
    ['role', 'Role', p.role],
    ['status', 'Status', p.status],
    ['stack', 'Stack', p.stack.join(', ')],
    ['summary', 'Summary', p.summary],
  ];
  const fields: Field[] = [];
  const chunks: Uint8Array[] = [];
  let offset = 0;
  for (const [key, label, value] of rows) {
    const b = encoder.encode(value + '\n');
    fields.push({ key, label, value, start: offset, end: offset + b.length });
    chunks.push(b);
    offset += b.length;
  }
  const bytes = new Uint8Array(offset);
  let at = 0;
  for (const c of chunks) {
    bytes.set(c, at);
    at += c.length;
  }
  return { bytes, fields };
}

export const hex = (n: number, width = 2) => n.toString(16).padStart(width, '0');

/** A printable stand-in for the ASCII column, like Wireshark's dot for anything outside 0x20 to 0x7e. */
export const printable = (b: number) => (b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : '.');

/* ---------- display filter ---------- */

type Getter = (p: Project) => string | string[] | boolean;

const FIELDS: Record<string, Getter> = {
  proto: (p) => p.proto,
  kind: (p) => [p.kind, KIND_LABEL[p.kind]],
  name: (p) => p.name,
  role: (p) => p.role,
  status: (p) => p.status,
  type: (p) => p.type,
  stack: (p) => p.stack,
  summary: (p) => p.summary,
  file: (p) => p.file,
  demo: (p) => !!p.demo,
};

export const FILTER_FIELDS = Object.keys(FIELDS);

export const FILTER_EXAMPLES = ['proto == HTTP', 'stack contains Python', 'demo', 'kind == ai || role contains lead'];

export type Filter = { ok: true; test: (p: Project) => boolean } | { ok: false; error: string };

const OPS = ['==', '!=', 'contains', 'matches'] as const;
type Op = (typeof OPS)[number];

function unquote(v: string): string {
  const t = v.trim();
  return /^".*"$/.test(t) || /^'.*'$/.test(t) ? t.slice(1, -1) : t;
}

function clause(raw: string, protos: Set<string>): Filter {
  const text = raw.trim();
  if (!text) return { ok: false, error: 'Empty expression' };
  const negate = /^(!|not\s+)/i.test(text);
  const body = text.replace(/^(!|not\s+)/i, '').trim();

  const m = body.match(/^([a-z]+)\s*(==|!=|\bcontains\b|\bmatches\b)\s*(.+)$/i);
  if (m) {
    const field = m[1].toLowerCase();
    const op = m[2].toLowerCase() as Op;
    const value = unquote(m[3]);
    const get = FIELDS[field];
    if (!get) return { ok: false, error: `"${m[1]}" is not a valid field. Fields: ${FILTER_FIELDS.join(', ')}` };
    if (!value) return { ok: false, error: `"${m[1]} ${m[2]}" needs a value` };
    let rx: RegExp | null = null;
    if (op === 'matches') {
      try {
        rx = new RegExp(value, 'i');
      } catch {
        return { ok: false, error: `"${value}" is not a valid regular expression` };
      }
    }
    const needle = value.toLowerCase();
    const test = (p: Project) => {
      const got = get(p);
      const values = (Array.isArray(got) ? got : [String(got)]).map((v) => v.toLowerCase());
      let hit: boolean;
      if (op === '==') hit = values.some((v) => v === needle);
      else if (op === '!=') hit = values.every((v) => v !== needle);
      else if (op === 'contains') hit = values.some((v) => v.includes(needle));
      else hit = values.some((v) => rx!.test(v));
      return negate ? !hit : hit;
    };
    return { ok: true, test };
  }

  const word = body.toLowerCase();
  if (/^[a-z0-9-]+$/.test(word)) {
    // A bare field name tests that the field is present and true, as in Wireshark.
    if (FIELDS[word]) {
      const get = FIELDS[word];
      return { ok: true, test: (p) => (negate ? !get(p) : !!get(p)) };
    }
    // A bare protocol name filters by protocol, also as in Wireshark ("http").
    if (protos.has(word)) return { ok: true, test: (p) => (p.proto.toLowerCase() === word) !== negate };
  }
  return { ok: false, error: `"${body}" is neither a field nor a protocol` };
}

/** Parses a small Wireshark-style display filter: clauses joined by && / and, alternatives by || / or. */
export function parseFilter(expr: string, projects: Project[]): Filter {
  const trimmed = expr.trim();
  if (!trimmed) return { ok: true, test: () => true };
  const protos = new Set(projects.map((p) => p.proto.toLowerCase()));
  const alternatives = trimmed.split(/\s*(?:\|\||\bor\b)\s*/i);
  const groups: ((p: Project) => boolean)[][] = [];
  for (const alt of alternatives) {
    const parts = alt.split(/\s*(?:&&|\band\b)\s*/i);
    const tests: ((p: Project) => boolean)[] = [];
    for (const part of parts) {
      const f = clause(part, protos);
      if (!f.ok) return f;
      tests.push(f.test);
    }
    groups.push(tests);
  }
  return { ok: true, test: (p) => groups.some((g) => g.every((t) => t(p))) };
}
