'use client';

import { useMemo, useState } from 'react';

import { audit, HEADERHAWK_SAMPLES } from '@/lib/demos/headerhawk';

const toneFor = (grade: string) => (grade.startsWith('A') ? 'good' : grade === 'B' || grade === 'C' ? 'warn' : 'bad');

export default function HeaderHawkDemo() {
  const [text, setText] = useState(HEADERHAWK_SAMPLES[0].text);
  const result = useMemo(() => audit(text), [text]);

  return (
    <div className="demo">
      <h3>Grade a header dump</h3>
      <p className="demo-note">
        Paste the output of <code>curl -sI https://your-site</code>. Eight of HeaderHawk&rsquo;s twelve checks run here in your
        browser with the same penalties and grade bands; the full CLI also inspects CSP directives, CORS, caching and
        cross-origin isolation.
      </p>
      <div className="samples">
        {HEADERHAWK_SAMPLES.map((s) => (
          <button key={s.label} type="button" className="btn btn-small" onClick={() => setText(s.text)}>
            {s.label}
          </button>
        ))}
      </div>
      <label className="skip" htmlFor="hh-in">
        Response headers
      </label>
      <textarea id="hh-in" rows={7} value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
      <div className="demo-result" aria-live="polite">
        <p className="verdict" data-tone={toneFor(result.grade)}>
          {result.grade}
          <small>{result.score} / 100</small>
        </p>
        {result.headerCount === 0 ? (
          <p className="muted">No headers found. Paste lines like <code>strict-transport-security: max-age=31536000</code>.</p>
        ) : result.findings.length ? (
          <ul className="findings">
            {result.findings.map((f, i) => (
              <li key={i}>
                <span className="sev" data-sev={f.severity}>
                  {f.severity}
                </span>
                <span>
                  {f.title}
                  <span className="evid">fix: {f.fix}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Every check in this demo passed.</p>
        )}
      </div>
    </div>
  );
}
