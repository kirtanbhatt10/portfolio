import type { Metadata } from 'next';

import Capture from '@/components/Capture';
import { projects } from '@/lib/projects';

export const metadata: Metadata = {
  title: 'Packet capture',
  description: 'Security tools, AI products, a desktop app and a startup, captured as packets you can filter and inspect.',
};

export default function Work() {
  return (
    <div className="wrap">
      <header className="page-head">
        <p className="eyebrow-cmd" aria-hidden="true">
          $ tcpdump -r projects.pcap
        </p>
        <h1 className="page-title">Packet capture</h1>
        <p className="lede">
          {projects.length} projects, newest first. Filter with a Wireshark display filter, select a packet to read its fields, and
          double-click or press Enter to open its case file.
        </p>
      </header>
      <section className="page-body" aria-label="All projects">
        <Capture />
      </section>
    </div>
  );
}
