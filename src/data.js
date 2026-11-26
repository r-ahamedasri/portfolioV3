// All personal content lives here.
// Sourced from ahamedasri.dev and the CV. Anything marked CONFIRM is a best guess
// or still missing; check it before you publish.

import hashCover from './assets/projects/hash-identifier.webp'
import originCover from './assets/projects/originai.webp'
import shulkerCover from './assets/projects/shulkerbox.webp'
import portrait from './assets/portrait.webp'

import cert01 from './assets/certs/certificate-01.webp'
import cert02 from './assets/certs/certificate-02.webp'
import cert03 from './assets/certs/certificate-03.webp'
import cert04 from './assets/certs/certificate-04.webp'
import cert05 from './assets/certs/certificate-05.webp'
import cert06 from './assets/certs/certificate-06.webp'

import badge01 from './assets/badges/badge-01.webp'
import badge02 from './assets/badges/badge-02.webp'
import badge03 from './assets/badges/badge-03.webp'
import badge04 from './assets/badges/badge-04.webp'
import badge05 from './assets/badges/badge-05.webp'
import badge06 from './assets/badges/badge-06.webp'
import badge07 from './assets/badges/badge-07.webp'
import badge08 from './assets/badges/badge-08.webp'

export const profile = {
  name: 'Ahamed Asri',
  short: 'Asri',
  role: 'AI & Cybersecurity',
  tagline:
    'I take systems apart to learn how they fail, then build AI-powered tools that make them harder to break.',
  university: 'University of Westminster · IIT Colombo',
  degree: 'BSc (Hons) Computer Science',
  gradYear: '2028',
  city: 'Colombo, Sri Lanka',
  timeZone: 'Asia/Colombo',
  available: 'Open to internships & collaborations',
  email: 'r.ahamedasri@gmail.com',
  github: 'https://github.com/r-ahamedasri',
  linkedin: 'https://www.linkedin.com/in/ahamedasri',
  resume: './AhamedAsri_Resume.pdf',
  portrait,
}

export const about =
  "I'm a Computer Science undergraduate at IIT Colombo, reading for a University of Westminster degree, and I work where cybersecurity meets artificial intelligence. I learned security the hands-on way: cracking open hashes, sniffing packets and poking at web apps to see how they break. Now I'm pairing that attacker's mindset with AI, from multi-agent pipelines to models that catch what people miss. I build in Python and Rust, I treat privacy as a default rather than a feature, and I want to help teams ship systems that are smart and secure at the same time."

export const focus = [
  { k: 'Studying', v: 'BSc (Hons) Computer Science, Class of 2028' },
  { k: 'Learning now', v: 'Web app security, network defense, LLM agents' },
  { k: 'Aiming for', v: 'Security engineering with AI at its core' },
]

export const stats = [
  { value: 3, suffix: '', label: 'Security & AI tools shipped' },
  { value: 8, suffix: '', label: 'Cisco verified badges' },
  { value: 6, suffix: '', label: 'Certificates earned' },
  { value: 2028, suffix: '', label: 'Expected graduation' },
]

export const marqueeA = ['Python', 'Rust', 'PyTorch', 'Burp Suite', 'Wireshark', 'Nmap', 'Google ADK', 'Gemini', 'Linux', 'Metasploit']
export const marqueeB = ['Threat Detection', 'Multi-Agent AI', 'Ethical Hacking', 'LLM Security', 'Network Defense', 'Applied Cryptography', 'Anomaly Detection', 'OWASP Top 10']

export const skills = [
  {
    key: 'offense',
    title: 'Offensive Security',
    blurb: 'Thinking like an attacker to find the weak spots first.',
    items: ['Burp Suite', 'OWASP Top 10', 'Nmap', 'Metasploit', 'Netcat', 'Privilege Escalation', 'TryHackMe CTFs'],
    span: 'wide',
  },
  {
    key: 'ml',
    title: 'AI & ML',
    blurb: 'Models, data and the maths in between.',
    items: ['PyTorch', 'TensorFlow', 'scikit-learn', 'NumPy', 'Pandas'],
  },
  {
    key: 'llm',
    title: 'LLMs & Agents',
    blurb: 'Agentic systems that reason, call tools and cooperate.',
    items: ['Google ADK', 'Gemini', 'Ollama', 'Hugging Face', 'Embeddings'],
  },
  {
    key: 'aisec',
    title: 'AI for Security',
    blurb: 'Letting machines watch the logs humans skim past.',
    items: ['Anomaly Detection', 'Phishing Detection', 'Log Analysis', 'Threat Detection'],
  },
  {
    key: 'network',
    title: 'Networks & Defense',
    blurb: 'Reading traffic and hardening what carries it.',
    items: ['TCP/IP', 'Wireshark', 'tcpdump', 'Firewalls & IDS', 'VPNs', 'SIEM'],
  },
  {
    key: 'cloud',
    title: 'Systems & Cloud',
    blurb: 'Where the code actually runs, locked down.',
    items: ['Linux', 'Bash', 'Docker', 'AWS', 'Cloud IAM'],
  },
  {
    key: 'build',
    title: 'Engineering',
    blurb: 'The languages and tools I ship with.',
    items: ['Python', 'Rust', 'Java', 'C / C++', 'TypeScript', 'React', 'FastAPI', 'Git'],
    span: 'wide',
  },
]

export const projects = [
  {
    title: 'OriginAI',
    kind: 'Multi-agent AI',
    status: 'Completed',
    description:
      'A digital product passport powered by a pipeline of cooperating AI agents. Give it a barcode, QR code or product name and it reports materials, supply chain, carbon footprint and how to repair or recycle it.',
    stack: ['Python', 'Google ADK', 'Gemini', 'AI Agents', 'Pytest'],
    links: { code: 'https://github.com/r-ahamedasri/originai' },
    image: originCover,
  },
  {
    title: 'Hash Identifier',
    kind: 'Threat analysis',
    status: 'Completed',
    description:
      'A Python CLI that fingerprints unknown hashes by length, prefix and pattern, ranks the likely algorithms by confidence and flags strings that are not hashes at all. Built to speed up early forensic and password-audit work.',
    stack: ['Python', 'CLI', 'Hash Analysis'],
    links: { code: 'https://github.com/r-ahamedasri/hash-identifier' },
    image: hashCover,
  },
  {
    title: 'Shulker Box',
    kind: 'Security tool',
    status: 'Completed',
    description:
      'A local-first password and recovery-key vault written in Rust. Everything is encrypted on your own machine, nothing touches a server, and a backup recovery phrase means you never lock yourself out.',
    stack: ['Rust', 'Cryptography', 'Encryption', 'CLI'],
    links: { code: 'https://github.com/r-ahamedasri/ShulkerBox' },
    image: shulkerCover,
  },
]

export const journey = [
  {
    when: 'Sep 2026',
    tag: 'Cybersecurity',
    title: 'Junior Cybersecurity Analyst path',
    org: 'Cisco Networking Academy',
    detail: 'Completed the career path and earned verified badges across cybersecurity, networking, endpoint security, network defense and threat management.',
  },
  {
    when: 'Jan 2026 — Now',
    tag: 'Degree',
    title: 'BSc (Hons) Computer Science',
    org: 'University of Westminster · IIT Colombo',
    detail: 'Focusing on AI and machine learning, cybersecurity and networking alongside core software engineering. Expected to graduate in 2028.',
  },
  {
    when: 'Jan 2026 — Now',
    tag: 'Community',
    title: 'Member, IEEE',
    org: 'IEEE Student Branch of IIT',
    detail: 'Part of the IEEE Computer Society and the Robotics & Automation Society, keeping close to new research and the people doing it.',
  },
  {
    when: 'May — Dec 2025',
    tag: 'Foundation',
    title: 'Foundation in Computing',
    org: 'Informatics Institute of Technology',
    detail: 'The bridge into higher education: programming, computing fundamentals and academic skills.',
  },
  {
    when: 'Feb — Jun 2025',
    tag: 'Certificate',
    title: 'Information Technology & English',
    org: 'BCAS Campus',
    detail: 'Built a grounding in computing fundamentals and technical communication.',
  },
  {
    when: '2023 — 2024',
    tag: 'School',
    title: 'G.C.E. Advanced Level',
    org: 'Zahira College, Kalmunai',
    detail: 'Physical Science stream, where the interest in how systems work began.',
  },
]

export const certificates = [
  {
    title: 'Python Developer',
    issuer: 'freeCodeCamp',
    date: 'Jun 2026',
    image: cert05,
    link: 'https://www.freecodecamp.org/certification/ahamedasri/python-v9',
  },
  {
    title: 'Learning Git and GitHub',
    issuer: 'LinkedIn Learning',
    date: 'Jul 2026',
    image: cert06,
    link: 'https://www.linkedin.com/learning/certificates/d077807610bb8275c9a6711b5983109e6933a465a9b3efdc85011c283ac2e7c0',
  },
  {
    title: 'English Communication Skills for IT',
    issuer: 'Informatics Institute of Technology',
    date: 'Jul 2026',
    image: cert04,
  },
  {
    title: 'Foundation Certificate in Higher Education',
    issuer: 'Informatics Institute of Technology',
    date: 'Jan 2026',
    image: cert03,
  },
  {
    title: 'Information Technology',
    issuer: 'BCAS Campus',
    date: 'Sep 2025',
    image: cert01,
    link: 'http://www.bcas.lk/bcvs/',
  },
  {
    title: 'English',
    issuer: 'BCAS Campus',
    date: 'Sep 2025',
    image: cert02,
    link: 'http://www.bcas.lk/bcvs/',
  },
]

// Cisco Networking Academy badges. CONFIRM: add each badge's Credly link as `link` if you have them.
export const badges = [
  { title: 'Junior Cybersecurity Analyst Career Path', image: badge08, featured: true },
  { title: 'Introduction to Cybersecurity', image: badge01 },
  { title: 'Cyber Threat Management', image: badge07 },
  { title: 'Network Defense', image: badge06 },
  { title: 'Endpoint Security', image: badge05 },
  { title: 'Networking Devices and Initial Configuration', image: badge04 },
  { title: 'Networking Basics', image: badge02 },
  { title: 'Operating Systems Basics', image: badge03 },
]
