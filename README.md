# Portfolio

**Personal site of Kirtan Bhatt: security tools, AI products and a startup, presented as case files.**

**Live:** <https://kirtanbhatt10.github.io/portfolio/>

## What is on it

The site is a blue-team console that attacks itself while you read it.

- **Self-injection:** on load, a red-team prompt injection types itself into the intro. The PromptShield detectors catch it, strike it out and stamp it blocked.
- **Interception log:** hostile prompts and phishing links keep arriving and print out as receipts, each judged live by the PromptShield and phishing-analyser ports. Visitors can try to write their own message onto the page; anything that gets past the detectors stays (on their screen only).
- **Packet capture:** every project is a packet in a Wireshark-style capture. Filter with display filters (`proto == HTTP`, `stack contains Python`, `demo`, `kind == ai || role contains lead`), read the field tree and hover a field to light up its bytes in the hex pane, or the other way round.
- **Case files:** a page per project, with its pipeline drawn as `traceroute` hops, what I did, the stack and, for PromptShield, HeaderHawk and CyberSec Arsenal, a live demo.
- **About** is a `whois` record, **Contact** is a TCP handshake, the **404** page is a port scan, and the footer shows the SHA-256 of the page you are reading, computed in your browser.
- **Lab:** a working terminal, a live SHA-256 hasher and a password entropy meter. Press `/` or `Ctrl`/`⌘` + `K` anywhere to search.

## Built with

Next.js (App Router, static export), React and TypeScript, with no UI framework and no runtime dependencies beyond React. Fonts: Doto, a dot-matrix display face, and Atkinson Hyperlegible Next and Mono, which are designed to keep look-alike characters such as l, 1 and I apart. Deployed to GitHub Pages by GitHub Actions.

## Run it locally

```bash
git clone https://github.com/kirtanbhatt10/portfolio.git
cd portfolio
npm install
npm run dev        # http://localhost:3000/portfolio
npm test           # demo logic tests (Node 22.6+)
npm run build      # static site in out/
```

## Project layout

```
app/              pages: home, case files, one page per project, about, lab, contact, 404
components/       intercepting hero, packet capture, traceroute, port scan, integrity hash, lab tools
components/demos/ the three live demos
lib/projects.ts   every project's content, in one place
lib/capture.ts    packet model and the Wireshark-style display filter
lib/intercept.ts  routes payloads to the right detector for the live log
lib/demos/        browser ports of PromptShield, HeaderHawk and the phishing analyser
public/           favicon and redirects from the old .html addresses
tests/            node:test suites for the demos, the filter and the interception log
```

## Licence

The code is released under the [MIT licence](LICENSE). The written content and project descriptions are mine; please do not reuse them as your own.
