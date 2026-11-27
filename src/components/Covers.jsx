import { useRef } from 'react'
import { useInView } from 'framer-motion'

// Hand-built project covers, drawn in SVG from what each project actually does (taken from the
// READMEs), so every thumbnail is a real diagram or a real command, not stock art.
// Animations are plain CSS and only run once the cover is on screen.

function Frame({ name, label, children }) {
  const ref = useRef(null)
  const inView = useInView(ref, { margin: '0px 0px -15% 0px' })
  return (
    <div ref={ref} className={`cov cov-${name}${inView ? ' is-in' : ''}`} aria-hidden="true">
      <span className="cov-label">{label}</span>
      <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">{children}</svg>
    </div>
  )
}

/* ---------- OriginAI: the seven-agent pipeline building a product passport ---------- */
const AGENTS = ['product_identification', 'material_intelligence', 'supply_chain', 'sustainability', 'repairability', 'recycling', 'passport_report']
const FIELDS = [['Product', 0.62], ['Materials', 0.78], ['Supply chain', 0.54], ['Carbon footprint', 0.7], ['Repairability', 0.46], ['Recycling', 0.66]]

function OriginCover() {
  const top = 82
  const step = 56
  return (
    <Frame name="origin" label="~/originai · google adk">
      {/* input */}
      <g className="o-in">
        <rect x="34" y="208" width="168" height="84" rx="14" className="o-box" />
        <text x="54" y="236" className="t-k">INPUT</text>
        <text x="54" y="262" className="t-b">barcode · name</text>
        <text x="54" y="280" className="t-m">or image</text>
      </g>
      <path d={`M202 250 C232 250 232 ${top} 262 ${top}`} className="o-wire" />

      {/* agents */}
      <line x1="270" y1={top} x2="270" y2={top + step * 6} className="o-spine" />
      <line x1="270" y1={top} x2="270" y2={top + step * 6} className="o-spine-run" />
      {AGENTS.map((a, i) => (
        <g key={a} className="o-node" style={{ '--d': `${i * 0.7}s` }}>
          <circle cx="270" cy={top + i * step} r="11" className="o-dot" />
          <circle cx="270" cy={top + i * step} r="4" className="o-core" />
          <text x="296" y={top + i * step - 4} className="t-n">{String(i + 1).padStart(2, '0')}</text>
          <text x="296" y={top + i * step + 14} className="t-a">{a}</text>
        </g>
      ))}
      <path d={`M466 ${top + step * 6} C520 ${top + step * 6} 520 250 556 250`} className="o-wire" />

      {/* passport */}
      <g className="o-card">
        <rect x="556" y="96" width="214" height="308" rx="16" className="o-pass" />
        <text x="578" y="130" className="t-k">DIGITAL PRODUCT</text>
        <text x="578" y="148" className="t-k">PASSPORT</text>
        <line x1="578" y1="164" x2="748" y2="164" className="o-rule" />
        {FIELDS.map(([f, w], i) => (
          <g key={f} className="o-field" style={{ '--d': `${0.7 + i * 0.7}s` }}>
            <text x="578" y={194 + i * 34} className="t-f">{f}</text>
            <rect x="578" y={201 + i * 34} width="170" height="5" rx="2.5" className="o-track" />
            <rect x="578" y={201 + i * 34} width={170 * w} height="5" rx="2.5" className="o-fill" />
          </g>
        ))}
      </g>
    </Frame>
  )
}

/* ---------- Hash Identifier: the README's own example, ranked ---------- */
const ROWS = [
  ['MD5', 'MEDIUM', '32 hex chars · most common at this length', 0.72],
  ['NTLM', 'LOW', '32 hex chars · also matches NTLM output', 0.38],
  ['MD4', 'LOW', '32 hex chars · also matches MD4 output', 0.3],
]

function HashCover() {
  return (
    <Frame name="hash" label="~/hash-identifier · python">
      <rect x="56" y="62" width="688" height="376" rx="16" className="h-win" />
      <path d="M56 98h688" className="h-bar" />
      <circle cx="82" cy="80" r="5.5" className="h-l1" /><circle cx="101" cy="80" r="5.5" className="h-l2" /><circle cx="120" cy="80" r="5.5" className="h-l3" />
      <text x="400" y="85" textAnchor="middle" className="t-m">hash-identifier — pwsh</text>

      <defs><clipPath id="h-type"><rect x="80" y="122" width="650" height="30" className="h-type" /></clipPath></defs>
      <text x="82" y="142" className="t-c" clipPath="url(#h-type)">
        <tspan className="h-ps">PS&gt;</tspan> just scan <tspan className="h-str">'5f4dcc3b5aa765d61d8327deb882cf99'</tspan>
      </text>

      {ROWS.map(([alg, conf, why, w], i) => {
        const y = 196 + i * 70
        return (
          <g key={alg} className={`h-row${i === 0 ? ' is-top' : ''}`} style={{ '--d': `${1.5 + i * 0.25}s` }}>
            <text x="82" y={y} className="t-n">{String(i + 1).padStart(2, '0')}</text>
            <text x="118" y={y + 1} className="h-alg">{alg}</text>
            <rect x="226" y={y - 15} width={conf === 'MEDIUM' ? 74 : 46} height="22" rx="11" className="h-pill" />
            <text x={226 + (conf === 'MEDIUM' ? 37 : 23)} y={y} textAnchor="middle" className="h-conf">{conf}</text>
            <text x="324" y={y} className="t-m">{why}</text>
            <rect x="118" y={y + 18} width="600" height="3" rx="1.5" className="h-track" />
            <rect x="118" y={y + 18} width={600 * w} height="3" rx="1.5" className="h-fill" />
          </g>
        )
      })}
      <text x="82" y="414" className="t-c h-end"><tspan className="h-ps">PS&gt;</tspan> <tspan className="h-caret">▋</tspan></text>
    </Frame>
  )
}

/* ---------- Shulker Box: the vault's key hierarchy ---------- */
function Node({ x, y, w, title, sub, hot }) {
  return (
    <g className={`s-node${hot ? ' is-hot' : ''}`}>
      <rect x={x} y={y} width={w} height="58" rx="12" />
      <text x={x + 18} y={y + 25} className={hot ? 't-h' : 't-b'}>{title}</text>
      <text x={x + 18} y={y + 44} className="t-m">{sub}</text>
    </g>
  )
}

function ShulkerCover() {
  return (
    <Frame name="shulker" label="~/shulker-box · rust">
      <Node x={60} y={34} w={250} title="master password" sub="typed, never stored" />
      <Node x={490} y={34} w={250} title="recovery phrase" sub="24 words · BIP39" />
      <path d="M185 92v48" className="s-wire" /><text x="198" y="122" className="t-k">ARGON2ID</text>
      <path d="M615 92v48" className="s-wire" /><text x="628" y="122" className="t-k">HKDF</text>
      <Node x={60} y={140} w={250} title="master key" sub="memory only · wiped on drop" />
      <Node x={490} y={140} w={250} title="recovery key" sub="derived, never stored" />
      <path d="M185 198 C185 236 300 236 330 250" className="s-wire" />
      <path d="M615 198 C615 236 500 236 470 250" className="s-wire" />
      <text x="214" y="244" className="t-k">WRAPS</text><text x="540" y="244" className="t-k">WRAPS</text>
      <Node x={270} y={250} w={260} title="vault key · VEK" sub="random 256-bit" hot />
      <path d="M400 308v44" className="s-wire hot" />
      <text x="414" y="336" className="t-k">XCHACHA20-POLY1305</text>
      <g className="s-vault">
        <rect x="170" y="352" width="460" height="112" rx="14" />
        <text x="192" y="380" className="t-k">VAULT ENTRIES · ENCRYPTED</text>
        {[0, 1, 2].map((r) => (
          <g key={r} className="s-entry" style={{ '--d': `${r * 0.35}s` }}>
            <rect x="192" y={394 + r * 22} width="12" height="12" rx="3" />
            <text x="216" y={404 + r * 22} className="t-dots">{'•'.repeat([18, 13, 22][r])}</text>
            <text x="608" y={404 + r * 22} textAnchor="end" className="t-m">{['a1f3…9c', '7be0…14', 'c52d…e8'][r]}</text>
          </g>
        ))}
      </g>
    </Frame>
  )
}

const COVERS = { OriginAI: OriginCover, 'Hash Identifier': HashCover, 'Shulker Box': ShulkerCover }

export default function Cover({ title }) {
  const C = COVERS[title]
  return C ? <C /> : null
}
