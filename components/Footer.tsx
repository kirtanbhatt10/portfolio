import { person } from '@/lib/site';

import Integrity from './Integrity';

export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot-in">
        <Integrity />
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
        <p className="foot-note">
          {person.location}. Press <kbd>/</kbd> to search.
        </p>
      </div>
    </footer>
  );
}
