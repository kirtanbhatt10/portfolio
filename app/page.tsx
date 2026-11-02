import Capture from '@/components/Capture';
import Intercept from '@/components/Intercept';
import { projects } from '@/lib/projects';
import { moreOnGithub, person, recognition } from '@/lib/site';

const live = projects.filter((p) => p.demo).length;

export default function Home() {
  return (
    <>
      <Intercept />

      <section className="section" aria-labelledby="capture">
        <div className="wrap">
          <div className="section-head">
            <h2 id="capture">{projects.length} packets captured</h2>
            <p>
              Every project, as a packet. Filter them like you would in Wireshark, pick one to read its fields and hover a field to
              find its bytes. {live} of them run live on their own page.
            </p>
          </div>
          <Capture />
        </div>
      </section>

      <section className="section" aria-labelledby="record">
        <div className="wrap">
          <div className="section-head">
            <h2 id="record">On the record</h2>
          </div>
          <ol className="record">
            {recognition.slice(0, 4).map((r) => (
              <li key={r.title}>
                <strong>{r.title}</strong>
                <span>{r.detail}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="more">
        <div className="wrap">
          <div className="section-head">
            <h2 id="more">More on GitHub</h2>
            <p>Smaller security tools, each with its own README and tests.</p>
          </div>
          <ul className="repos">
            {moreOnGithub.map((r) => (
              <li key={r.name}>
                <a href={`${person.github}/${r.name}`} target="_blank" rel="noopener">
                  {r.name}
                </a>
                <p>{r.what}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
