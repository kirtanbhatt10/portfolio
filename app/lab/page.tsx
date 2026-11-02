import type { Metadata } from 'next';

import Entropy from '@/components/Entropy';
import Sha256 from '@/components/Sha256';
import Terminal from '@/components/Terminal';

export const metadata: Metadata = {
  title: 'Lab',
  description: 'A working terminal, a live SHA-256 hasher and a password entropy meter. Everything runs in your browser.',
};

export default function Lab() {
  return (
    <div className="wrap">
      <header className="page-head">
        <h1 className="page-title">Lab</h1>
        <p className="lede">Small working things. Everything here runs in your browser; nothing you type is sent anywhere.</p>
      </header>
      <section style={{ paddingBottom: '2rem' }} aria-label="Terminal">
        <Terminal />
      </section>
      <section className="lab-grid" style={{ paddingBottom: 'clamp(3rem, 8vw, 6rem)' }} aria-label="Security toys">
        <Sha256 />
        <Entropy />
      </section>
    </div>
  );
}
