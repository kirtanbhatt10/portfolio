import { person } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <p>{person.location}</p>
        <ul>
          <li>
            <a href={person.github} rel="noopener" target="_blank">
              GitHub
            </a>
          </li>
          <li>
            <a href={person.linkedin} rel="noopener" target="_blank">
              LinkedIn
            </a>
          </li>
          <li>
            <a href={`mailto:${person.email}`}>Email</a>
          </li>
        </ul>
        <p>
          Press <kbd>/</kbd> or <kbd>Ctrl K</kbd> to search
        </p>
      </div>
    </footer>
  );
}
