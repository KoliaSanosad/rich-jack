// Символы слота «Дикий Запад». Вся графика своя — SVG, рисуется кодом.
// Стиль по эталону: золотая чеканная рамка-медальон, внутри — рисованный сюжет Дикого Запада.
// Ключи совпадают с id символов в WESTERN (src/config.js).

// Общая золотая рамка-медальон. inner — внутренний рисунок, bg — фон внутри кольца.
const ring = (inner, bg = '#2b1a10') => `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="gold" cx="50%" cy="34%"><stop offset="0" stop-color="#ffe9a8"/><stop offset=".5" stop-color="#f1c04a"/><stop offset="1" stop-color="#9c6a1e"/></radialGradient>
    <linearGradient id="goldsh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2c8"/><stop offset=".5" stop-color="#e3ad38"/><stop offset="1" stop-color="#7d4e16"/></linearGradient>
  </defs>
  <circle cx="50" cy="50" r="47" fill="url(#goldsh)"/>
  <circle cx="50" cy="50" r="47" fill="none" stroke="#5a3410" stroke-width="2"/>
  <circle cx="50" cy="50" r="40" fill="url(#gold)"/>
  <circle cx="50" cy="50" r="35" fill="${bg}" stroke="#3a2410" stroke-width="1.5"/>
  ${Array.from({ length: 16 }).map((_, i) => { const a = i * Math.PI / 8; return `<circle cx="${50 + 43 * Math.cos(a)}" cy="${50 + 43 * Math.sin(a)}" r="1.6" fill="#8a5a1e"/>`; }).join('')}
  <path d="M26 22 A35 35 0 0 1 74 22" fill="none" stroke="#fff6d8" stroke-width="2" opacity=".5" stroke-linecap="round"/>
  <clipPath id="inner"><circle cx="50" cy="50" r="35"/></clipPath>
  <g clip-path="url(#inner)">${inner}</g>
</svg>`;

// Пустынный фон внутри медальона
const desert = `<rect x="0" y="0" width="100" height="100" fill="#3c6b86"/>
  <rect x="0" y="52" width="100" height="48" fill="#caa36a"/>
  <rect x="0" y="66" width="100" height="34" fill="#a9763f"/>
  <circle cx="72" cy="30" r="10" fill="#ffdf8a" opacity=".9"/>`;

export const WESTERN_SYMBOLS = {
  sheriff: ring(`${desert}
    <ellipse cx="50" cy="60" rx="18" ry="20" fill="#e7b98c"/>
    <path d="M34 54 q16 -6 32 0" stroke="#b9834f" stroke-width="2" fill="none"/>
    <rect x="42" y="52" width="5" height="4" rx="2" fill="#3a2410"/><rect x="53" y="52" width="5" height="4" rx="2" fill="#3a2410"/>
    <path d="M40 64 q10 7 20 0 q-10 11 -20 0z" fill="#8a5a34"/>
    <path d="M24 46 q-2 -20 26 -22 t26 22 q-8 -9 -26 -9 t-26 9z" fill="#6b4423"/>
    <path d="M36 44 h28 l-5 -10 h-18z" fill="#4a2c14"/>
    <g transform="translate(50 82) scale(.62)"><path d="M0 -15 3.4 -4.6 14.3 -4.6 5.4 2.9 8.8 13.4 0 7 -8.8 13.4 -5.4 2.9 -14.3 -4.6 -3.4 -4.6z" fill="#f1c04a" stroke="#8a5a1e" stroke-width="1.4"/></g>`),

  bandit: ring(`${desert}
    <ellipse cx="50" cy="58" rx="18" ry="20" fill="#d8a473"/>
    <path d="M30 40 q-4 -18 20 -20 t20 20 l-7 4 q-13 -8 -26 0z" fill="#3a2a1a"/>
    <path d="M34 36 h32 l-5 -8 h-22z" fill="#241810"/>
    <path d="M30 42 q20 -8 40 0 l-2 6 q-18 -7 -36 0z" fill="#1a120b"/>
    <rect x="41" y="48" width="6" height="5" rx="2" fill="#241810"/><rect x="53" y="48" width="6" height="5" rx="2" fill="#241810"/>
    <path d="M30 60 q20 10 40 0 l0 22 q-20 11 -40 0z" fill="#b5362a"/>
    <path d="M30 60 q20 9 40 0" stroke="#7d2018" stroke-width="2" fill="none"/>
    <path d="M48 70 l6 0 l-3 7z" fill="#7d2018"/>`),

  hat: ring(`${desert}
    <ellipse cx="50" cy="66" rx="34" ry="11" fill="#d7c49a"/>
    <ellipse cx="50" cy="66" rx="34" ry="11" fill="none" stroke="#9a8256" stroke-width="1.5"/>
    <path d="M30 64 q-3 -30 20 -30 t20 30" fill="#e7d6ad" stroke="#9a8256" stroke-width="1.5"/>
    <path d="M30 60 q20 9 40 0 l0 5 q-20 9 -40 0z" fill="#5a3a1c"/>
    <path d="M31 60 q19 8 38 0" stroke="#3a2410" stroke-width="1.5" fill="none"/>
    <rect x="58" y="58" width="6" height="5" rx="1" fill="#caa14a"/>`),

  cactus: ring(`${desert}
    <rect x="44" y="34" width="13" height="48" rx="6" fill="#3f7a35" stroke="#1f4019" stroke-width="2"/>
    <path d="M44 56 q-14 0 -14 -12 v-4 q0 -6 5 -6 t5 6 v6 q0 4 4 4z" fill="#3f7a35" stroke="#1f4019" stroke-width="2"/>
    <path d="M57 50 q14 0 14 -12 v-6 q0 -6 5 -6 t5 6 v8 q0 10 -9 12 q-7 2 -15 2z" fill="#3f7a35" stroke="#1f4019" stroke-width="2"/>
    <line x1="50" y1="40" x2="50" y2="78" stroke="#2c5a26" stroke-width="1.5"/>
    <ellipse cx="50" cy="84" rx="16" ry="4" fill="#6b3f20" opacity=".5"/>`),

  revolver: ring(`${desert}
    <path d="M20 46 h44 v9 h-7 l-3 6 h-5 v-6 H20z" fill="#d7dde2" stroke="#2b3238" stroke-width="2"/>
    <rect x="60" y="44" width="16" height="7" rx="2" fill="#c3ccd3" stroke="#2b3238" stroke-width="2"/>
    <circle cx="40" cy="51" r="9" fill="#aeb8c0" stroke="#2b3238" stroke-width="2"/><circle cx="40" cy="51" r="2.5" fill="#5a646d"/>
    <path d="M44 60 q9 2 9 15 l-10 2 q-5 0 -7 -6z" fill="#7a4a24" stroke="#3a230f" stroke-width="2"/>
    <path d="M30 60 q-4 9 2 15" stroke="#2b3238" stroke-width="3" fill="none"/>`),

  wheel: ring(`${desert}
    <circle cx="50" cy="52" r="30" fill="none" stroke="#5a3418" stroke-width="7"/>
    <circle cx="50" cy="52" r="30" fill="none" stroke="#2b1708" stroke-width="2"/>
    <circle cx="50" cy="52" r="8" fill="#6b4423" stroke="#2b1708" stroke-width="2"/>
    ${Array.from({ length: 8 }).map((_, i) => { const a = i * Math.PI / 4; return `<line x1="${50 + 8 * Math.cos(a)}" y1="${52 + 8 * Math.sin(a)}" x2="${50 + 26 * Math.cos(a)}" y2="${52 + 26 * Math.sin(a)}" stroke="#6b4423" stroke-width="4"/>`; }).join('')}`),

  // WILD — связка динамита (взрывается в эффектах)
  dynamite: ring(`<rect x="0" y="0" width="100" height="100" fill="#241008"/>
    <g transform="rotate(-10 50 54)">
    <rect x="30" y="40" width="14" height="34" rx="3" fill="#c0392b" stroke="#6e1b14" stroke-width="2"/>
    <rect x="44" y="38" width="14" height="36" rx="3" fill="#d0493b" stroke="#6e1b14" stroke-width="2"/>
    <rect x="58" y="40" width="14" height="34" rx="3" fill="#c0392b" stroke="#6e1b14" stroke-width="2"/>
    <rect x="28" y="52" width="46" height="8" fill="#7a2018" opacity=".65"/>
    </g>
    <path d="M58 40 q8 -12 2 -20" stroke="#caa14a" stroke-width="2.5" fill="none"/>
    <circle cx="59" cy="19" r="5" fill="#ffd34a"/><circle cx="59" cy="19" r="9" fill="#ff8a1e" opacity=".45"/>
    <text x="50" y="86" text-anchor="middle" font-family="Rye, Georgia, serif" font-size="17" fill="#ffd666" stroke="#5a2d12" stroke-width="1" paint-order="stroke">WILD</text>`),

  // SCATTER — звезда шерифа (бесплатные вращения)
  star: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs>
    <radialGradient id="stg" cx="50%" cy="36%"><stop offset="0" stop-color="#fff2c8"/><stop offset=".5" stop-color="#f1c04a"/><stop offset="1" stop-color="#9c6a1e"/></radialGradient></defs>
    <circle cx="50" cy="50" r="44" fill="url(#stg)" stroke="#7d4e16" stroke-width="2"/>
    <g transform="translate(50 50)">${Array.from({ length: 5 }).map((_, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; return `<circle cx="${36 * Math.cos(a)}" cy="${36 * Math.sin(a)}" r="4.5" fill="#fff6d8"/>`; }).join('')}
    <path d="M0 -32 7.5 -10 31 -10 12 4.6 19 27 0 14 -19 27 -12 4.6 -31 -10 -7.5 -10z" fill="#b5362a" stroke="#7d2018" stroke-width="1.6"/>
    <path d="M0 -20 4.7 -6 19 -6 7.5 2.9 12 17 0 9 -12 17 -7.5 2.9 -19 -6 -4.7 -6z" fill="#8f251c" opacity=".5"/></g>`,

  // Монета-подкова (бонус «Собери монеты»)
  coin: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs>
    <radialGradient id="cog" cx="50%" cy="36%"><stop offset="0" stop-color="#ffe9a8"/><stop offset=".55" stop-color="#efb33c"/><stop offset="1" stop-color="#9a6a1e"/></radialGradient></defs>
    <circle cx="50" cy="50" r="45" fill="url(#cog)" stroke="#7a4e14" stroke-width="3"/>
    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1"/>
    <circle cx="50" cy="50" r="36" fill="none" stroke="#9a6a1e" stroke-width="2" stroke-dasharray="2 3"/>
    <path d="M34 68 q-6 -28 1 -37 q7 -9 15 -9 t15 9 q7 9 1 37" fill="none" stroke="#6a3f12" stroke-width="8" stroke-linecap="round"/>
    <path d="M34 68 q-6 -28 1 -37 q7 -9 15 -9 t15 9 q7 9 1 37" fill="none" stroke="#8a5a1e" stroke-width="3" stroke-linecap="round"/>
    ${[38, 46, 54, 62].map((x) => `<circle cx="${x}" cy="30" r="2" fill="#6a3f12"/>`).join('')}
    <path d="M30 26 A32 32 0 0 1 70 26" fill="none" stroke="#fff6d8" stroke-width="2.5" opacity=".6" stroke-linecap="round"/>`,
};
