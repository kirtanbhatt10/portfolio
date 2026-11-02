'use client';

import { useMemo, useState } from 'react';

import { analyze, PHISH_SAMPLES } from '@/lib/demos/phish';

const TONE = { Phishing: 'bad', Suspicious: 'warn', 'Likely safe': 'good' } as const;

export default function PhishDemo() {
  const [url, setUrl] = useState(PHISH_SAMPLES[1]);
  const result = useMemo(() => analyze(url), [url]);

  return (
    <div className="demo">
      <h3>Check a link</h3>
      <p className="demo-note">
        The phishing URL analyser from the toolkit, ported to run in your browser with the same signals and points. It only reads
        the text of the link; nothing is fetched.
      </p>
      <div className="samples">
        {PHISH_SAMPLES.map((s) => (
          <button key={s} type="button" className="btn btn-small" onClick={() => setUrl(s)}>
            {s.replace(/^https?:\/\//, '').slice(0, 32)}
          </button>
        ))}
      </div>
      <label className="skip" htmlFor="ph-in">
        Link to check
      </label>
      <input id="ph-in" type="text" value={url} onChange={(e) => setUrl(e.target.value)} spellCheck={false} />
      <div className="demo-result" aria-live="polite">
        <p className="verdict" data-tone={TONE[result.label]}>
          {result.label}
          <small>score {result.score}</small>
        </p>
        {result.reasons.length ? (
          <ul className="findings">
            {result.reasons.map((r, i) => (
              <li key={i}>
                <span className="sev" data-sev={r.points >= 30 ? 'high' : r.points >= 15 ? 'medium' : 'low'}>
                  +{r.points}
                </span>
                <span>{r.reason}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No phishing signals in this link.</p>
        )}
      </div>
    </div>
  );
}
