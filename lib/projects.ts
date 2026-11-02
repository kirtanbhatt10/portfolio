export type Kind = 'security' | 'ai' | 'other';

export type Demo = 'promptshield' | 'headerhawk' | 'phish';

export interface Project {
  slug: string;
  file: string;
  name: string;
  kind: Kind;
  summary: string;
  role: string;
  status: string;
  type: string;
  flow: string[];
  did: string[];
  stack: string[];
  links: { label: string; href: string }[];
  evidence?: { value: string; label: string }[];
  demo?: Demo;
}

export const KIND_LABEL: Record<Kind, string> = {
  security: 'Security tools',
  ai: 'AI products',
  other: 'Startup and ML',
};

const gh = (repo: string) => `https://github.com/kirtanbhatt10/${repo}`;

export const projects: Project[] = [
  {
    slug: 'promptshield',
    file: 'KB-09',
    name: 'PromptShield',
    kind: 'security',
    summary:
      'A zero-dependency guardrail for LLM apps: it catches prompt injection on the way in and leaked secrets, personal data and exfiltration links on the way out.',
    role: 'Solo build',
    status: 'v0.2.1 released',
    type: 'LLM security library, CLI and HTTP sidecar',
    flow: ['Untrusted input', 'Normalise', 'Injection detectors', 'Your model', 'Leak detectors', 'Allow, review or block'],
    did: [
      'Wrote thirteen detectors, from instruction overrides and role hijacks to invisible Unicode smuggling and markdown exfiltration.',
      'Built a firewall for agent tool calls with taint tracking, egress allowlists, path jails and call budgets.',
      'Added streaming, multi-turn and spotlighting defences, plus a zero-dependency HTTP sidecar shipped as a Docker image.',
      'Found and fixed a gap where short exfiltrated values, such as a 6-digit OTP in an image URL, slipped past the output scanner.',
    ],
    stack: ['Python', 'Docker', 'GitHub Actions', 'SARIF', 'GHCR'],
    links: [
      { label: 'Code', href: gh('promptshield') },
      { label: 'Release', href: `${gh('promptshield')}/releases/tag/v0.2.1` },
    ],
    evidence: [
      { value: '235', label: 'tests passing' },
      { value: '1.000', label: 'F1 on the labelled benchmark' },
      { value: '0', label: 'runtime dependencies' },
    ],
    demo: 'promptshield',
  },
  {
    slug: 'headerhawk',
    file: 'KB-08',
    name: 'HeaderHawk',
    kind: 'security',
    summary:
      'Audits the HTTP security headers and cookies of any site, grades it from A+ to F and gives a concrete fix for every finding.',
    role: 'Solo build',
    status: 'v0.2.0 released',
    type: 'Node.js CLI, library and GitHub Action',
    flow: ['URL or header dump', 'Parse headers', 'Twelve checks', 'Weighted score', 'Grade and fixes', 'CI gate'],
    did: [
      'Wrote twelve checks covering HSTS, CSP, clickjacking, cookies, CORS, caching, cross-origin isolation and information leaks.',
      'Shipped text, JSON, Markdown and SARIF reports and a --fail-under gate so a deploy can be blocked below a grade.',
      'Packaged it as a GitHub Action that writes the report to the job summary.',
      'Fixed a parsing bug where duplicate HSTS headers, merged by fetch, were misread on live audits.',
    ],
    stack: ['Node.js', 'GitHub Actions', 'SARIF', 'node:test'],
    links: [
      { label: 'Code', href: gh('headerhawk') },
      { label: 'Release', href: `${gh('headerhawk')}/releases/tag/v0.2.0` },
    ],
    evidence: [
      { value: '90', label: 'tests passing' },
      { value: '12', label: 'header and cookie checks' },
      { value: '0', label: 'runtime dependencies' },
    ],
    demo: 'headerhawk',
  },
  {
    slug: 'cybersec-arsenal',
    file: 'KB-07',
    name: 'CyberSec Arsenal',
    kind: 'security',
    summary:
      'Ten hands-on security tools in readable, dependency-free Python, from a cipher breaker to a web attack detector, each with tests and a write-up of how the attack works.',
    role: 'Solo build',
    status: 'Public, open to contributions',
    type: 'Open-source learning toolkit',
    flow: ['Read the write-up', 'Run on sample data', 'Read the source', 'Break the tests', 'Extend it'],
    did: [
      'Built ten tools across three tiers: password auditor, cipher breaker, file integrity monitor, async port scanner, SSH brute-force detector, phishing URL analyser, JWT inspector, secrets scanner, IOC extractor and web attack detector.',
      'Mapped each tool to real attacks with MITRE ATT&CK, the OWASP Top 10 and real CVEs.',
      'Set up CI that lints, tests on four Python versions and scans the repository for leaked secrets with its own scanner.',
    ],
    stack: ['Python', 'pytest', 'ruff', 'GitHub Actions', 'SARIF'],
    links: [{ label: 'Code', href: gh('CyberSec-Arsenal') }],
    evidence: [
      { value: '10', label: 'working tools' },
      { value: '53', label: 'tests passing' },
      { value: '4', label: 'Python versions in CI' },
    ],
    demo: 'phish',
  },
  {
    slug: 'undertone',
    file: 'KB-06',
    name: 'Undertone',
    kind: 'ai',
    summary:
      'A quiet, floating desktop AI assistant that stays beside your work and out of your screen share.',
    role: 'Solo build',
    status: 'v0.1.0 released',
    type: 'Desktop AI assistant',
    flow: ['Your context', 'Sandboxed renderer', 'Typed, validated IPC', 'Main process holds the keys', 'AI provider', 'Sanitised reply'],
    did: [
      'Built the app end to end: context-aware chat, quick actions, screen-region capture, meeting mode and a compact always-on-top window.',
      'Kept strict process boundaries: API keys, storage and every network call stay in the main process, and the renderer is sandboxed behind a strict CSP.',
      "Added Privacy Mode, which uses the operating system's documented window-protection API to leave the window out of supported screen capture, with a self-test and an honest list of limits.",
      'Shipped installers for Windows and Linux, with unit and end-to-end tests running in CI on both.',
    ],
    stack: ['Electron', 'React', 'TypeScript', 'esbuild', 'zod', 'DOMPurify', 'Playwright', 'GitHub Actions'],
    links: [
      { label: 'Code', href: gh('undertone-desktop') },
      { label: 'Download', href: `${gh('undertone-desktop')}/releases` },
    ],
  },
  {
    slug: 'sentinel',
    file: 'KB-05',
    name: 'Sentinel AI',
    kind: 'security',
    summary:
      'Detects unauthorised reuse, duplication, manipulation and potential IP misuse of digital assets.',
    role: 'Security',
    status: 'Built, live demo',
    type: 'AI-powered digital asset protection',
    flow: ['Digital asset', 'SHA-256 fingerprint', 'Perceptual hash', 'Similarity analysis', 'AI reasoning', 'Verdict'],
    did: [
      'Built the detection platform end to end.',
      'Combined cryptographic fingerprinting, perceptual hashing, similarity analysis and AI reasoning into one verdict.',
      'Wrote a local similarity engine alongside the Gemini and Cohere integrations.',
    ],
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Google Gemini API', 'Cohere API', 'Perceptual hashing'],
    links: [
      { label: 'Code', href: gh('sentinel') },
      { label: 'Live demo', href: 'https://google-solution-challange-iota.vercel.app' },
    ],
  },
  {
    slug: 'zenny',
    file: 'KB-04',
    name: 'Zenny AI Therapist',
    kind: 'ai',
    summary:
      'A platform that makes support more accessible, lowers the entry barrier and helps address the stigma around therapy.',
    role: 'Team lead',
    status: 'SIH 2025 national finalist',
    type: 'AI-enabled therapy-access platform',
    flow: ['Person seeking support', 'API pipelines', 'AI fusion engine', 'LLM', 'Response'],
    did: [
      'Led a six-member team through Smart India Hackathon 2025 to the national finals.',
      'Owned the entire backend, the AI fusion engine and the API pipelines.',
      'Drove the technical architecture and product integration.',
    ],
    stack: ['TypeScript', 'Node.js', 'LLM integration', 'REST APIs'],
    links: [{ label: 'Code', href: gh('zenny') }],
  },
  {
    slug: 'sugam',
    file: 'KB-03',
    name: 'Sugam',
    kind: 'other',
    summary:
      'A marketplace that closes the discovery gap between people seeking pandits and pandits seeking clients.',
    role: 'Founder',
    status: 'Pre-production, SSIP Gujarat funded',
    type: 'Two-sided spiritual-services marketplace',
    flow: ['People seeking pandits', 'Sugam marketplace', 'Pandits seeking clients'],
    did: [
      'Founded the startup; it is funded by SSIP Gujarat and currently in pre-production.',
      'Lead product direction and system architecture.',
      'Build the backend and APIs with security in mind, on AWS and DynamoDB.',
    ],
    stack: ['AWS', 'DynamoDB', 'REST APIs'],
    links: [],
  },
  {
    slug: 'solaris',
    file: 'KB-02',
    name: 'Solaris',
    kind: 'other',
    summary:
      'A backend API that predicts solar power generation from NASA POWER and Open-Meteo data, and finds the best panel orientation.',
    role: 'Machine learning',
    status: 'Built',
    type: 'Solar power generation prediction',
    flow: ['NASA POWER and Open-Meteo data', 'XGBoost model', 'Azimuth optimisation', 'Generation forecast'],
    did: [
      'Built the prediction API in Flask.',
      'Trained an XGBoost model on NASA POWER and Open-Meteo data.',
      'Added azimuth optimisation to find the best panel orientation.',
    ],
    stack: ['Flask', 'XGBoost', 'Python', 'TypeScript'],
    links: [{ label: 'Code', href: gh('solaris') }],
  },
  {
    slug: 'codesec',
    file: 'KB-01',
    name: 'AI Code Security Platform',
    kind: 'security',
    summary: 'An all-in-one AI platform concept for code-security reviews and developer-focused security analysis.',
    role: 'AppSec concept',
    status: 'Concept build',
    type: 'AI-assisted code-security reviews',
    flow: ['Code in', 'Automated review workflow', 'LLM analysis via API', 'Security findings'],
    did: [
      'Built the platform concept for developer-focused security analysis.',
      'Combined automated review workflows with API-driven AI and LLM capabilities.',
    ],
    stack: ['TypeScript', 'React', 'Node.js', 'REST APIs', 'AI/LLM integration'],
    links: [],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

/** Neighbours in list order, wrapping around, for previous / next links. */
export function neighbours(slug: string) {
  const i = projects.findIndex((p) => p.slug === slug);
  const n = projects.length;
  return { prev: projects[(i - 1 + n) % n], next: projects[(i + 1) % n] };
}
