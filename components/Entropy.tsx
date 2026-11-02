'use client';

import { useState } from 'react';

export function entropyBits(value: string): number {
  let pool = 0;
  if (/[a-z]/.test(value)) pool += 26;
  if (/[A-Z]/.test(value)) pool += 26;
  if (/\d/.test(value)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(value)) pool += 33;
  return value.length && pool ? Math.round(value.length * Math.log2(pool)) : 0;
}

export function strengthLabel(bits: number): string {
  if (bits === 0) return 'Nothing typed';
  if (bits < 40) return 'Weak';
  if (bits < 60) return 'Fair';
  if (bits < 80) return 'Strong';
  return 'Very strong';
}

export default function Entropy() {
  const [value, setValue] = useState('');
  const bits = entropyBits(value);

  return (
    <div className="demo">
      <h3>Password entropy</h3>
      <p className="demo-note">
        A rough estimate from length and character variety. Type a made-up password, not a real one; nothing leaves your browser.
        For a check that also catches keyboard walks and leetspeak, see the password auditor in CyberSec Arsenal.
      </p>
      <label className="skip" htmlFor="pw-in">
        Made-up password
      </label>
      <input
        id="pw-in"
        className="field"
        type="text"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ marginTop: '1rem' }}
      />
      <div className="meter" aria-hidden="true">
        <span style={{ width: `${Math.min(100, bits)}%` }} />
      </div>
      <p style={{ marginTop: '0.6rem' }} aria-live="polite">
        <strong>{strengthLabel(bits)}</strong> <span className="muted">{bits} bits</span>
      </p>
    </div>
  );
}
