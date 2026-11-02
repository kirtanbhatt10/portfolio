'use client';

import { useEffect, useState } from 'react';

export async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default function Sha256() {
  const [text, setText] = useState('hello');
  const [hash, setHash] = useState('');

  useEffect(() => {
    let live = true;
    sha256(text).then((h) => live && setHash(h));
    return () => {
      live = false;
    };
  }, [text]);

  return (
    <div className="demo">
      <h3>Live SHA-256</h3>
      <p className="demo-note">The fingerprinting idea behind Sentinel: change one character and the whole hash changes.</p>
      <label className="skip" htmlFor="sha-in">
        Text to hash
      </label>
      <input id="sha-in" className="field" type="text" value={text} onChange={(e) => setText(e.target.value)} style={{ marginTop: '1rem' }} />
      <p style={{ marginTop: '1rem' }}>
        <span className="hash">{hash}</span>
      </p>
    </div>
  );
}
