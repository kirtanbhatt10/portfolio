import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="wrap notfound">
      <p className="file-no">Error 404</p>
      <h1 className="page-title">File not found</h1>
      <p className="lede">There is no case file at this address. It may have moved when the site was rebuilt.</p>
      <p style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link className="btn btn-primary" href="/work/">
          Open the case files
        </Link>
        <Link className="btn" href="/">
          Go to the home page
        </Link>
      </p>
    </div>
  );
}
