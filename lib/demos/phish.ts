/**
 * A browser port of the phishing URL analyser from CyberSec Arsenal
 * (projects/02-beginner/phishing-url-analyzer). Signals, points and thresholds
 * are the same as the Python tool.
 */

export interface PhishVerdict {
  label: 'Phishing' | 'Suspicious' | 'Likely safe';
  score: number;
  reasons: { points: number; reason: string }[];
}

const BRANDS = [
  'paypal', 'apple', 'microsoft', 'google', 'amazon', 'netflix', 'facebook', 'instagram', 'linkedin', 'github', 'dropbox',
  'outlook', 'office365', 'chase', 'wellsfargo', 'bankofamerica', 'coinbase', 'binance', 'whatsapp', 'adobe', 'sbi',
  'hdfcbank', 'icicibank', 'paytm',
];
const SUSPICIOUS_TLDS = new Set(['xyz', 'top', 'zip', 'mov', 'tk', 'ml', 'ga', 'cf', 'gq', 'click', 'country', 'work', 'support', 'rest', 'fit', 'cam', 'icu', 'buzz', 'monster']);
const SHORTENERS = new Set(['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'ow.ly', 'cutt.ly', 'rb.gy', 'shorturl.at']);
const KEYWORDS = ['login', 'signin', 'verify', 'account', 'update', 'secure', 'banking', 'confirm', 'password', 'wallet', 'suspend', 'unlock', 'billing', 'invoice', 'webscr'];
const MULTI_SUFFIXES = new Set(['co.uk', 'co.in', 'com.au', 'co.jp', 'com.br', 'org.uk', 'gov.in', 'ac.in', 'net.in']);
const CONFUSABLES: Record<string, string> = {
  '0': 'o', '1': 'l', '3': 'e', '4': 'a', '5': 's', '8': 'b',
  'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'х': 'x', 'у': 'y',
  'і': 'i', 'ј': 'j', 'ӏ': 'l', 'ο': 'o', 'α': 'a', 'ρ': 'p',
};

export function levenshtein(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur.push(Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)));
    }
    prev = cur;
  }
  return prev[b.length];
}

function entropy(s: string): number {
  if (!s) return 0;
  const counts = new Map<string, number>();
  for (const ch of s) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  let h = 0;
  for (const c of counts.values()) h -= (c / s.length) * Math.log2(c / s.length);
  return h;
}

export function splitHost(host: string): [string[], string, string] {
  const labels = host.split('.');
  if (labels.length >= 3 && MULTI_SUFFIXES.has(labels.slice(-2).join('.'))) {
    return [labels.slice(0, -3), labels[labels.length - 3], labels.slice(-2).join('.')];
  }
  if (labels.length >= 2) return [labels.slice(0, -2), labels[labels.length - 2], labels[labels.length - 1]];
  return [[], host, ''];
}

/** RFC 3492 punycode decoding for one label (without the xn-- prefix). */
function punycodeDecode(input: string): string {
  const base = 36, tMin = 1, tMax = 26, skew = 38, damp = 700;
  const output: number[] = [];
  let n = 128, i = 0, bias = 72;
  const basic = input.lastIndexOf('-');
  for (let j = 0; j < Math.max(basic, 0); j++) output.push(input.charCodeAt(j));
  const adapt = (delta: number, numPoints: number, first: boolean) => {
    delta = first ? Math.floor(delta / damp) : delta >> 1;
    delta += Math.floor(delta / numPoints);
    let k = 0;
    while (delta > ((base - tMin) * tMax) >> 1) { delta = Math.floor(delta / (base - tMin)); k += base; }
    return k + Math.floor(((base - tMin + 1) * delta) / (delta + skew));
  };
  for (let idx = basic > 0 ? basic + 1 : 0; idx < input.length; ) {
    const oldi = i;
    for (let w = 1, k = base; ; k += base) {
      if (idx >= input.length) throw new RangeError('bad punycode');
      const c = input.charCodeAt(idx++);
      const digit = c - 48 < 10 ? c - 22 : c - 65 < 26 ? c - 65 : c - 97 < 26 ? c - 97 : base;
      if (digit >= base) throw new RangeError('bad punycode');
      i += digit * w;
      const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
      if (digit < t) break;
      w *= base - t;
    }
    bias = adapt(i - oldi, output.length + 1, oldi === 0);
    n += Math.floor(i / (output.length + 1));
    i %= output.length + 1;
    output.splice(i++, 0, n);
  }
  return String.fromCodePoint(...output);
}

export const toUnicodeHost = (host: string) =>
  host.split('.').map((l) => (l.startsWith('xn--') ? punycodeDecode(l.slice(4)) : l)).join('.');

const isIp = (host: string) => /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith('[');

export function analyze(input: string): PhishVerdict {
  const reasons: { points: number; reason: string }[] = [];
  const add = (points: number, reason: string) => reasons.push({ points, reason });
  const finish = (): PhishVerdict => {
    const score = reasons.reduce((s, r) => s + r.points, 0);
    return { label: score >= 60 ? 'Phishing' : score >= 30 ? 'Suspicious' : 'Likely safe', score, reasons };
  };

  let raw = input.trim();
  if (!raw.includes('://')) raw = 'http://' + raw;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    add(0, 'not a valid URL');
    return finish();
  }
  const host = url.hostname.toLowerCase().replace(/\.$/, '');

  if (url.protocol === 'http:') add(10, 'plain HTTP (no TLS)');
  if (url.username || url.password) add(30, "'@' in the address: the browser ignores everything before it");
  if (isIp(host)) {
    add(35, `raw IP address as host (${host})`);
    return finish();
  }
  if (url.port) add(10, `non-standard port ${url.port}`);
  if (SHORTENERS.has(host)) {
    add(20, 'URL shortener hides the real destination');
    return finish();
  }

  const [subs, initialName, tld] = splitHost(host);
  let name = initialName;
  if (host.includes('xn--')) {
    try {
      const decoded = toUnicodeHost(host);
      add(35, `punycode host: it renders as '${decoded}'`);
      name = splitHost(decoded)[1];
    } catch {
      add(35, 'malformed punycode host');
    }
  }
  if (SUSPICIOUS_TLDS.has(tld)) add(15, `high-abuse top-level domain .${tld}`);
  if (subs.length >= 3) add(10, `${subs.length} subdomain levels`);

  if (!BRANDS.includes(name)) {
    const subWords = subs.join('.').replace(/-/g, '.').split('.');
    const skeleton = [...name].map((ch) => CONFUSABLES[ch] ?? ch).join('');
    for (const brand of BRANDS) {
      if (subWords.includes(brand) || subs.join('-').includes(brand)) {
        add(35, `brand '${brand}' used in a subdomain of unrelated domain '${name}.${tld}'`);
        break;
      }
      if (name.split('-').includes(brand) || (brand.length >= 5 && name.includes(brand))) {
        add(30, `brand '${brand}' embedded in domain '${name}'`);
        break;
      }
      if (skeleton === brand && brand !== name) {
        add(40, `'${name}' uses lookalike characters to impersonate '${brand}'`);
        break;
      }
      const dist = levenshtein(name, brand);
      if (brand.length >= 5 && dist > 0 && dist <= 2) {
        add(40, `'${name}' is a typosquat of '${brand}' (edit distance ${dist})`);
        break;
      }
    }
  }

  const h = entropy(name);
  if (name.length >= 12 && h > 3.5) add(15, `random-looking domain (entropy ${h.toFixed(2)})`);
  if ((name.match(/-/g)?.length ?? 0) >= 2 && !host.includes('xn--')) add(10, 'multiple hyphens in domain');

  const pathQuery = (url.pathname + '?' + url.search.slice(1)).toLowerCase();
  const hits = KEYWORDS.filter((k) => pathQuery.includes(k) || subs.join('.').includes(k));
  if (hits.length) add(Math.min(25, 8 * hits.length), `credential-themed keywords: ${hits.slice(0, 4).join(', ')}`);
  if (input.length > 100) add(10, `very long URL (${input.length} characters)`);
  return finish();
}

export const PHISH_SAMPLES = [
  'https://www.paypal.com/signin',
  'http://paypa1.com/webscr?cmd=login',
  'https://xn--pple-43d.com/',
  'http://paypal.com.account-verify.xyz/login',
];
