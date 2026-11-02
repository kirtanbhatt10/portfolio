/**
 * A browser port of eight of HeaderHawk's twelve checks, used for the live demo.
 * Severities, messages, penalties (critical 40, high 20, medium 10, low 4) and
 * grade bands are copied from the Node.js package. The demo skips the deeper CSP
 * analysis, CORS, caching and cross-origin isolation checks, so a site can grade
 * higher here than with the real tool.
 */

export type Severity = 'high' | 'medium' | 'low';

export interface Finding {
  check: string;
  severity: Severity;
  title: string;
  fix: string;
}

export interface Audit {
  grade: string;
  score: number;
  findings: Finding[];
  headerCount: number;
}

const PENALTY: Record<Severity, number> = { high: 20, medium: 10, low: 4 };

type Headers = Map<string, string[]>;

/** Parse a `curl -sI` style dump. With several responses, the last one is used. */
export function parseRaw(text: string): Headers {
  const blocks = text.replace(/\r\n?/g, '\n').split(/\n\s*\n/).filter((b) => b.trim());
  const responses = blocks.filter((b) => /^HTTP\/[\d.]+\s+\d{3}/i.test(b.trimStart()));
  const block = (responses.length ? responses[responses.length - 1] : blocks[0]) ?? '';
  const headers: Headers = new Map();
  let last: string | null = null;
  for (const line of block.split('\n')) {
    if (/^HTTP\/[\d.]+\s+\d{3}/i.test(line)) continue;
    if (/^[ \t]/.test(line) && last) {
      const list = headers.get(last)!;
      list[list.length - 1] += ' ' + line.trim();
      continue;
    }
    const i = line.indexOf(':');
    if (i <= 0) continue;
    const name = line.slice(0, i).trim().toLowerCase();
    const list = headers.get(name) ?? [];
    list.push(line.slice(i + 1).trim());
    headers.set(name, list);
    last = name;
  }
  return headers;
}

const get = (h: Headers, name: string) => h.get(name)?.join(', ');

function hsts(h: Headers): Finding[] {
  const fix = 'Send `Strict-Transport-Security: max-age=31536000; includeSubDomains` on every HTTPS response.';
  const values = (h.get('strict-transport-security') ?? []).flatMap((v) => v.split(',')).map((v) => v.trim()).filter(Boolean);
  if (!values.length) return [{ check: 'hsts', severity: 'high', title: 'Strict-Transport-Security header missing', fix }];
  const out: Finding[] = [];
  if (new Set(values.map((v) => v.toLowerCase().replace(/\s+/g, ''))).size > 1) {
    out.push({ check: 'hsts', severity: 'medium', title: 'Conflicting Strict-Transport-Security headers', fix: 'Send HSTS from exactly one layer (app, proxy or CDN) and remove the others.' });
  }
  let maxAge: number | null = null;
  let sub = false;
  let preload = false;
  for (const part of values[0].split(';')) {
    const [rawKey, ...rest] = part.split('=');
    const key = rawKey.trim().toLowerCase();
    const val = rest.join('=').trim().replace(/^"|"$/g, '');
    if (key === 'max-age' && maxAge === null) maxAge = /^\d+$/.test(val) ? Number(val) : NaN;
    if (key === 'includesubdomains') sub = true;
    if (key === 'preload') preload = true;
  }
  if (maxAge === null || Number.isNaN(maxAge)) return [...out, { check: 'hsts', severity: 'high', title: 'HSTS max-age is missing or invalid', fix }];
  if (maxAge === 0) return [...out, { check: 'hsts', severity: 'high', title: 'HSTS is disabled with max-age=0', fix }];
  if (maxAge < 15552000) out.push({ check: 'hsts', severity: 'medium', title: 'HSTS max-age is shorter than 6 months', fix });
  if (!sub) out.push({ check: 'hsts', severity: 'low', title: 'HSTS does not cover subdomains', fix: 'Add `includeSubDomains` once all subdomains serve HTTPS.' });
  if (preload && (!sub || maxAge < 31536000)) out.push({ check: 'hsts', severity: 'low', title: 'HSTS preload requested but requirements are not met', fix: 'Preload needs max-age >= 31536000 and includeSubDomains.' });
  return out;
}

function csp(h: Headers): Finding[] {
  if (h.has('content-security-policy')) return [];
  if (h.has('content-security-policy-report-only')) {
    return [{ check: 'csp', severity: 'medium', title: 'CSP is only in report-only mode', fix: 'Promote the policy to Content-Security-Policy once reports are clean.' }];
  }
  return [{ check: 'csp', severity: 'high', title: 'Content-Security-Policy header missing', fix: "Start from `default-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'` and add sources as needed." }];
}

function framing(h: Headers): Finding[] {
  const fix = "Send `Content-Security-Policy: frame-ancestors 'none'` (or 'self'), plus `X-Frame-Options: DENY` for older browsers.";
  const ancestors = (h.get('content-security-policy') ?? [])
    .map((p) => p.split(';').map((d) => d.trim().split(/\s+/)).find((d) => d[0]?.toLowerCase() === 'frame-ancestors'))
    .find(Boolean);
  if (ancestors) {
    return ancestors.includes('*') ? [{ check: 'framing', severity: 'medium', title: 'frame-ancestors allows framing by any site', fix }] : [];
  }
  const xfo = get(h, 'x-frame-options')?.trim().toUpperCase();
  if (xfo === 'DENY' || xfo === 'SAMEORIGIN') return [];
  if (xfo?.startsWith('ALLOW-FROM')) return [{ check: 'framing', severity: 'medium', title: 'X-Frame-Options ALLOW-FROM is ignored by modern browsers', fix }];
  if (xfo) return [{ check: 'framing', severity: 'medium', title: 'X-Frame-Options has an invalid value', fix }];
  return [{ check: 'framing', severity: 'medium', title: 'Page can be framed by other sites (clickjacking)', fix }];
}

function contentTypeOptions(h: Headers): Finding[] {
  const value = get(h, 'x-content-type-options');
  if (value === undefined) return [{ check: 'content-type-options', severity: 'medium', title: 'X-Content-Type-Options header missing', fix: 'Send `X-Content-Type-Options: nosniff`.' }];
  if (value.trim().toLowerCase() !== 'nosniff') return [{ check: 'content-type-options', severity: 'medium', title: 'X-Content-Type-Options has an invalid value', fix: 'The only valid value is `nosniff`.' }];
  return [];
}

const REFERRER_VALID = new Set(['no-referrer', 'no-referrer-when-downgrade', 'origin', 'origin-when-cross-origin', 'same-origin', 'strict-origin', 'strict-origin-when-cross-origin', 'unsafe-url']);

function referrerPolicy(h: Headers): Finding[] {
  const fix = 'Send `Referrer-Policy: strict-origin-when-cross-origin` (or `no-referrer`).';
  const value = get(h, 'referrer-policy');
  if (value === undefined) return [{ check: 'referrer-policy', severity: 'low', title: 'Referrer-Policy header missing', fix }];
  const valid = value.split(',').map((v) => v.trim().toLowerCase()).filter((v) => REFERRER_VALID.has(v));
  const effective = valid[valid.length - 1];
  if (!effective) return [{ check: 'referrer-policy', severity: 'low', title: 'Referrer-Policy has no valid value', fix }];
  if (effective === 'unsafe-url' || effective === 'no-referrer-when-downgrade') {
    return [{ check: 'referrer-policy', severity: 'medium', title: `Referrer-Policy '${effective}' leaks full URLs to other sites`, fix }];
  }
  return [];
}

function permissionsPolicy(h: Headers): Finding[] {
  const fix = 'Send `Permissions-Policy: camera=(), microphone=(), geolocation=()` and enable only what you use.';
  const value = get(h, 'permissions-policy');
  if (value === undefined) {
    return [{ check: 'permissions-policy', severity: 'low', title: h.has('feature-policy') ? 'Only the deprecated Feature-Policy header is set' : 'Permissions-Policy header missing', fix }];
  }
  const policy = new Map<string, string>();
  for (const m of value.matchAll(/([a-z0-9-]+)\s*=\s*(\([^)]*\)|\*|[^,]+)/gi)) policy.set(m[1].toLowerCase(), m[2].trim());
  const open = ['camera', 'microphone', 'geolocation', 'payment', 'usb', 'display-capture'].filter(
    (f) => policy.get(f) === '*' || /\(\s*\*\s*\)/.test(policy.get(f) ?? ''),
  );
  return open.length ? [{ check: 'permissions-policy', severity: 'medium', title: 'Sensitive browser features are allowed for every origin', fix }] : [];
}

const SESSION_LIKE = /(sess|sid|token|auth|jwt|login|remember|csrf|xsrf)/i;

function cookies(h: Headers): Finding[] {
  const out: Finding[] = [];
  for (const raw of h.get('set-cookie') ?? []) {
    const [pair, ...attrs] = raw.split(';');
    const name = pair.split('=')[0].trim();
    const a = new Map<string, string>();
    for (const attr of attrs) {
      const [k, ...v] = attr.split('=');
      if (k.trim()) a.set(k.trim().toLowerCase(), v.join('=').trim());
    }
    const secure = a.has('secure');
    const sameSite = a.get('samesite')?.toLowerCase();
    const label = `cookie "${name}"`;
    const sev: Severity = SESSION_LIKE.test(name) ? 'medium' : 'low';
    if (name.startsWith('__Host-') && (!secure || a.get('path') !== '/' || a.has('domain'))) {
      out.push({ check: 'cookies', severity: 'high', title: `${label} breaks the __Host- prefix rules`, fix: '__Host- cookies need Secure, Path=/ and no Domain.' });
    } else if (name.startsWith('__Secure-') && !secure) {
      out.push({ check: 'cookies', severity: 'high', title: `${label} uses __Secure- without Secure`, fix: 'Add the Secure attribute.' });
    }
    if (sameSite === 'none' && !secure) out.push({ check: 'cookies', severity: 'high', title: `${label} has SameSite=None without Secure`, fix: 'Browsers reject this cookie; add Secure.' });
    if (!secure) out.push({ check: 'cookies', severity: sev, title: `${label} is missing Secure`, fix: 'Add Secure so it is never sent over plain HTTP.' });
    if (!a.has('httponly')) out.push({ check: 'cookies', severity: sev, title: `${label} is missing HttpOnly`, fix: 'Add HttpOnly unless JavaScript must read it.' });
    if (!sameSite) out.push({ check: 'cookies', severity: 'low', title: `${label} has no SameSite attribute`, fix: 'Set SameSite=Lax (or Strict) explicitly.' });
  }
  return out;
}

function disclosure(h: Headers): Finding[] {
  const out: Finding[] = [];
  const server = get(h, 'server');
  if (server && /\d+(\.\d+)+/.test(server)) {
    out.push({ check: 'disclosure', severity: 'low', title: 'Server header reveals a version number', fix: 'Strip version details (e.g. `server_tokens off;` in nginx).' });
  }
  for (const name of ['x-powered-by', 'x-aspnet-version', 'x-aspnetmvc-version', 'x-generator', 'x-drupal-cache', 'x-runtime']) {
    if (h.has(name)) out.push({ check: 'disclosure', severity: 'low', title: `${name} header reveals the technology stack`, fix: `Remove the ${name} header.` });
  }
  return out;
}

export function grade(score: number): string {
  if (score >= 100) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function audit(raw: string): Audit {
  const h = parseRaw(raw);
  const findings = [hsts, csp, framing, contentTypeOptions, referrerPolicy, permissionsPolicy, cookies, disclosure].flatMap((check) => check(h));
  const order: Severity[] = ['high', 'medium', 'low'];
  findings.sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity) || a.check.localeCompare(b.check));
  const score = Math.max(0, 100 - findings.reduce((sum, f) => sum + PENALTY[f.severity], 0));
  return { grade: grade(score), score, findings, headerCount: h.size };
}

export const HEADERHAWK_SAMPLES = [
  {
    label: 'A weak PHP site',
    text: 'HTTP/1.1 200 OK\nServer: nginx/1.18.0 (Ubuntu)\nX-Powered-By: PHP/7.4.3\nSet-Cookie: PHPSESSID=abc123; path=/\nContent-Type: text/html',
  },
  {
    label: 'A hardened site',
    text: "HTTP/2 200\nstrict-transport-security: max-age=63072000; includeSubDomains; preload\ncontent-security-policy: default-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'\nx-content-type-options: nosniff\nreferrer-policy: strict-origin-when-cross-origin\npermissions-policy: camera=(), microphone=(), geolocation=()\ncross-origin-opener-policy: same-origin\ncross-origin-resource-policy: same-origin\ncache-control: no-store\nset-cookie: __Host-sid=1; Path=/; Secure; HttpOnly; SameSite=Lax",
  },
  {
    label: 'A CDN undoing HSTS',
    text: "HTTP/2 200\nstrict-transport-security: max-age=63072000; includeSubDomains; preload\nstrict-transport-security: max-age=0\ncontent-security-policy: default-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'\nx-content-type-options: nosniff\nreferrer-policy: no-referrer\npermissions-policy: camera=(), microphone=(), geolocation=()\ncross-origin-opener-policy: same-origin\ncross-origin-resource-policy: same-origin",
  },
];
