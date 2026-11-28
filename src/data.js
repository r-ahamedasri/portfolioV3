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
    'I study how systems fail, building tools to automate security work and make systems more resilient.',
  university: 'University of Westminster · IIT Colombo',
  degree: 'BSc (Hons) Computer Science',
  gradYear: '2028',
  city: 'Colombo, Sri Lanka',
  timeZone: 'Asia/Colombo',
  available: 'Open to internships & collaborations',
  seeking: 'CS undergraduate · looking for a cybersecurity internship',
  whatsapp: 'https://wa.me/94740101153',
  email: 'r.ahamedasri@gmail.com',
  github: 'https://github.com/r-ahamedasri',
  linkedin: 'https://www.linkedin.com/in/ahamedasri',
  tryhackme: 'https://tryhackme.com/p/r.ahamedasri',
  resume: './AhamedAsri_Resume.pdf',
  portrait,
}

// Résumé card under the About photo. Taken from the CV PDF (public/AhamedAsri_Resume.pdf).
export const resumeBrief = {
  role: 'Aspiring Information Security Engineer',
  year: '2026',
}

export const about =
  "Computer Science undergraduate at the University of Westminster, studying at IIT Colombo. My interests span cybersecurity, software development and networking, especially how automation and AI can support security operations. Currently building hands-on experience with security tools, threat analysis and network defense, with the goal of making security work faster and systems more resilient."


// Two sides of the work: top row (solid) = AI & software development, bottom row (outline) = cybersecurity.
export const marqueeA = ['Python', 'Rust', 'PyTorch', 'TensorFlow', 'Google ADK', 'Gemini', 'Multi-Agent AI', 'Hugging Face', 'FastAPI', 'React']
export const marqueeB = ['Nmap', 'Metasploit', 'Burp Suite', 'Wireshark', 'OWASP Top 10', 'Threat Detection', 'Ethical Hacking', 'LLM Security', 'Network Defense', 'Applied Cryptography', 'Anomaly Detection', 'Linux']

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
    items: ['Linux', 'Bash', 'Docker'],
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
    built: 'A chain of Google ADK agents, each handling one step, from identifying the product to writing the final passport, with Pytest tests around it.',
    learned: 'How to split a job across agents, pass results between them, and test AI output that changes from run to run.',
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
    built: 'The matching rules (length, prefix, character set), the confidence ranking, and a check that flags input that is not a hash.',
    learned: 'How common hash formats differ, and why length alone is not enough: MD5 and NTLM are both 32 hex characters.',
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
    built: 'The vault itself: Argon2id key derivation, XChaCha20-Poly1305 encryption and a 24-word recovery phrase that can unlock it if the master password is lost.',
    learned: 'How key derivation and key wrapping work, and why keys should live only in memory and be wiped after use.',
    links: { code: 'https://github.com/r-ahamedasri/ShulkerBox' },
    image: shulkerCover,
  },
]

export const journey = [
  {
    when: '2023 — 2024',
    tag: 'School',
    title: 'G.C.E. Advanced Level',
    org: 'Zahira College, Kalmunai',
    detail: 'Physical Science stream, where the interest in how systems work began.',
  },
  {
    when: 'Feb — Jun 2025',
    tag: 'Certificate',
    title: 'Information Technology & English',
    org: 'BCAS Campus',
    detail: 'Built a grounding in computing fundamentals and technical communication.',
  },
  {
    when: 'May — Dec 2025',
    tag: 'Foundation',
    title: 'Foundation in Computing',
    org: 'Informatics Institute of Technology',
    detail: 'The bridge into higher education: programming, computing fundamentals and academic skills.',
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
    when: 'Sep 2026',
    tag: 'Cybersecurity',
    title: 'Junior Cybersecurity Analyst path',
    org: 'Cisco Networking Academy',
    detail: 'Completed the career path and earned verified badges across cybersecurity, networking, endpoint security, network defense and threat management.',
  },
  {
    when: 'Nov 2026 — Now',
    tag: 'Hands-on',
    title: 'Started on TryHackMe',
    org: 'TryHackMe · r.ahamedasri',
    detail: 'Began a hands-on journey on TryHackMe, gaining practical experience in guided labs and working through CTF rooms to turn theory into real skills.',
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

// Stats row in the About section. Projects and certifications count themselves from the lists above.
// Completed TryHackMe rooms: update this as the count grows.
const thmRoomsCompleted = 7

// Tools & technologies stat: every item in the Skills section that is a named tool, language or platform.
// Concepts and practices (listed here) are left out so the number only counts real tools.
const notTools = new Set([
  'OWASP Top 10', 'Privilege Escalation', 'TryHackMe CTFs', 'Embeddings',
  'Anomaly Detection', 'Phishing Detection', 'Log Analysis', 'Threat Detection',
  'TCP/IP', 'Firewalls & IDS', 'VPNs', 'SIEM', 'Cloud IAM',
])
const toolCount = new Set(skills.flatMap((g) => g.items).filter((i) => !notTools.has(i))).size

export const stats = [
  { value: projects.length, label: 'Projects shipped' },
  { value: toolCount, label: 'Tools & technologies used' },
  { value: thmRoomsCompleted, label: 'TryHackMe rooms completed' },
  { value: certificates.length + badges.length, label: 'Certifications & badges earned' },
]
