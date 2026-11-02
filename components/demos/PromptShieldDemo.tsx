'use client';

import { useMemo, useState } from 'react';

import { PROMPTSHIELD_SAMPLES, scan } from '@/lib/demos/promptshield';

const TONE = { allow: 'good', review: 'warn', block: 'bad' } as const;

export default function PromptShieldDemo() {
  const [text, setText] = useState(PROMPTSHIELD_SAMPLES[1].text);
  const result = useMemo(() => scan(text), [text]);

  return (
    <div className="demo">
      <h3>Scan a message</h3>
      <p className="demo-note">
        Runs in your browser with five of PromptShield&rsquo;s thirteen detectors ported from the Python package: same patterns,
        severities and scoring. Nothing you type is sent anywhere.
      </p>
      <div className="samples">
        {PROMPTSHIELD_SAMPLES.map((s) => (
          <button key={s.label} type="button" className="btn btn-small" onClick={() => setText(s.text)}>
            {s.label}
          </button>
        ))}
      </div>
      <label className="skip" htmlFor="ps-in">
        Message to scan
      </label>
      <textarea id="ps-in" rows={4} value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
      <div className="demo-result" aria-live="polite">
        <p className="verdict" data-tone={TONE[result.verdict]}>
          {result.verdict}
          <small>score {result.score} / 100</small>
        </p>
        {result.findings.length ? (
          <ul className="findings">
            {result.findings.map((f, i) => (
              <li key={i}>
                <span className="sev" data-sev={f.severity}>
                  {f.severity}
                </span>
                <span>
                  {f.message}
                  <span className="evid">{f.evidence}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No findings. This text would reach the model unchanged.</p>
        )}
      </div>
    </div>
  );
}
