# Portfolio

**Personal site of Kirtan Bhatt: security tools, AI products and a startup, presented as case files.**

**Live:** <https://kirtanbhatt10.github.io/portfolio/>

## What is on it

- **Case files:** a page for each project, with how it fits together, what I did and the stack: PromptShield, HeaderHawk, CyberSec Arsenal, Undertone, Sentinel AI, Zenny AI Therapist, Sugam, Solaris and the AI Code Security Platform.
- **Live demos:** PromptShield, HeaderHawk and the CyberSec Arsenal phishing analyser run in the browser on their case-file pages. Each is a faithful port of part of the real tool, with unit tests that pin its results to the original.
- **Lab:** a working terminal, a live SHA-256 hasher and a password entropy meter.
- **Search:** press `/` or `Ctrl`/`⌘` + `K` to jump to any page, project or action.

## Built with

Next.js (App Router, static export), React and TypeScript, with no UI framework and no runtime dependencies beyond React. Fonts: Saira Stencil One and IBM Plex. Deployed to GitHub Pages by GitHub Actions.

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
components/       header, search menu, case-file table, pipeline, lab tools
components/demos/ the three live demos
lib/projects.ts   every project's content, in one place
lib/demos/        browser ports of PromptShield, HeaderHawk and the phishing analyser
public/           favicon and redirects from the old .html addresses
tests/            node:test suite for the demo logic
```

## Licence

The code is released under the [MIT licence](LICENSE). The written content and project descriptions are mine; please do not reuse them as your own.
