'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { sha256 } from './Sha256';

/** Hashes the text of the page as it loaded, in the visitor's browser. */
export default function Integrity() {
  const pathname = usePathname();
  const [hash, setHash] = useState('');

  useEffect(() => {
    const main = document.querySelector('main');
    if (!main || !crypto?.subtle) return;
    let live = true;
    sha256(main.innerText).then((h) => live && setHash(h));
    return () => {
      live = false;
    };
  }, [pathname]);

  return (
    <p className="integrity">
      <span>Integrity</span>
      <code title={hash || undefined}>{hash ? `${hash.slice(0, 16)}…${hash.slice(-8)}` : 'hashing…'}</code>
      <span className="integrity-note">SHA-256 of this page&rsquo;s text when it loaded, worked out in your browser.</span>
    </p>
  );
}
