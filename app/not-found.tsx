import Link from 'next/link';

import PortScan from '@/components/PortScan';

export default function NotFound() {
  return (
    <div className="wrap notfound">
      <h1 className="page-title">Connection refused</h1>
      <p className="lede">Nothing is listening at this address. It may have moved when the site was rebuilt. Here is what is open.</p>
      <PortScan />
      <p className="actions">
        <Link className="btn btn-solid" href="/work/">
          Open the packet capture
        </Link>
        <Link className="btn btn-line" href="/">
          Go to the home page
        </Link>
      </p>
    </div>
  );
}
