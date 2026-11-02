export const person = {
  name: 'Kirtan Bhatt',
  role: 'Security-minded backend and AI engineer',
  lede: 'Computer engineering student specialising in cyber security. I build backends and AI products, and I look at them the way an attacker would.',
  email: 'kirtan11bhatt@gmail.com',
  location: 'Gandhinagar, Gujarat, India',
  github: 'https://github.com/kirtanbhatt10',
  linkedin: 'https://www.linkedin.com/in/kirtan-bhatt-974422322',
};

export const education = [
  { label: 'Degree', value: 'B.Tech CE, Cyber Security' },
  { label: 'Institute', value: 'Institute of Advanced Research, Gandhinagar' },
  { label: 'Semester', value: '5th, class of 2028' },
  { label: 'CGPA', value: '7.98 / 10' },
];

export const recognition = [
  {
    title: 'Founder and lead developer, Sugam',
    detail:
      'A spiritual-services marketplace, funded by SSIP Gujarat and in pre-production. I lead product direction, system architecture and backend development.',
  },
  {
    title: 'National finalist, Smart India Hackathon 2025',
    detail: 'Led the six-member Zenny AI Therapist team and owned the backend, AI fusion engine and API layer.',
  },
  { title: '2nd place, CyberPeace × IAR Hackathon 2025', detail: 'Podium finish in a cybersecurity-focused hackathon.' },
  { title: '7th of 300 teams, LJ University Hackathon', detail: 'Roughly the top 2.3% of participating teams.' },
  {
    title: 'President, IAR STEM Club',
    detail:
      'I lead student STEM initiatives and coordinate technical and community activities. I also volunteered at the IAR Cancer Research / LJ Hackathon.',
  },
];

export const toolkit: { area: string; items: { name: string; level?: string }[] }[] = [
  {
    area: 'Security',
    items: [{ name: 'Web security' }, { name: 'API security' }, { name: 'Networking' }, { name: 'Secure coding' }, { name: 'Security reviews' }],
  },
  {
    area: 'Languages',
    items: [
      { name: 'Python', level: 'strong' },
      { name: 'JavaScript / TypeScript', level: 'strong' },
      { name: 'Java', level: 'intermediate' },
      { name: 'C / C++', level: 'intermediate' },
    ],
  },
  {
    area: 'Development',
    items: [{ name: 'React', level: 'intermediate' }, { name: 'Node.js', level: 'intermediate' }, { name: 'REST APIs' }, { name: 'AI / LLM integration' }],
  },
  {
    area: 'Cloud and tools',
    items: [{ name: 'AWS', level: 'intermediate' }, { name: 'DynamoDB', level: 'intermediate' }, { name: 'Git / GitHub' }, { name: 'Linux' }],
  },
];

/** Other public security repositories, described the way their READMEs describe them. */
export const moreOnGithub = [
  { name: 'mcp-warden', what: 'Security scanner for MCP server configs: leaked keys, unpinned servers, typosquats and tool poisoning.' },
  { name: 'a2a-fuzzer', what: 'Conformance and robustness fuzzing for A2A, MCP and JSON-RPC agent endpoints you own.' },
  { name: 'Injektor', what: 'LLM security testing CLI that probes AI apps with controlled prompt-injection and jailbreak attacks.' },
  { name: 'runnerguard', what: 'Static security linter for GitHub Actions workflows: script injection, pwn requests and unpinned actions.' },
  { name: 'specguard', what: 'Security linter for OpenAPI specs: unauthenticated operations, cleartext HTTP and weak auth schemes.' },
  { name: 'gadbad', what: 'Static analyser for Indian scam APKs that explains OTP theft and exfiltration in English and Hindi.' },
];
