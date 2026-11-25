// Символы слота «Дикий Запад» — собственный SVG, нарисованный кодом.
// БЕЗ круглой рамки: каждый символ стоит на барабане как отдельная литая фигура
// с объёмом, бликом и тенью. Стиль — реалистичный вестерн (не «Небесный Куш»).
const svg = (body, defs = '') =>
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>` +
  // мягкая тень под фигурой — «стоит» на барабане
  `<ellipse cx="50" cy="92" rx="30" ry="6" fill="#000" opacity=".35"/>${body}</svg>`;

const rg = (id, stops, cx = '38%', cy = '28%', r = '80%') =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</radialGradient>`;
const lg = (id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;

// металл (сталь) и дерево (рукоять) — общие градиенты
const steel = (id) => lg(id, [[0, '#f2f5f8'], [0.28, '#c3ccd6'], [0.55, '#7f8995'], [0.8, '#4c545f'], [1, '#2a2f37']]);
const brass = (id) => lg(id, [[0, '#fff3c0'], [0.3, '#ffd766'], [0.6, '#e0a62e'], [1, '#9a5f14']]);
const wood = (id) => lg(id, [[0, '#b07a42'], [0.5, '#7e4d22'], [1, '#4a2a10']]);
const leather = (id) => lg(id, [[0, '#c98a4e'], [0.45, '#8a5226'], [1, '#4e2c12']]);

export const WESTERN_SYMBOLS = {
  // ---- Подкова (младший) — литое железо с золотым бликом, дырки под гвозди ----
  horseshoe: svg(
    `<g stroke="#2a1607" stroke-width="2.5" stroke-linejoin="round">
       <path d="M30 24c-11 9-14 26-8 42 4 12 15 18 28 18s24-6 28-18c6-16 3-33-8-42"
             fill="none" stroke="url(#hsG)" stroke-width="15" stroke-linecap="round"/>
     </g>
     <path d="M30 24c-11 9-14 26-8 42 4 12 15 18 28 18s24-6 28-18c6-16 3-33-8-42"
           fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".45"
           stroke-dasharray="20 120" stroke-dashoffset="4"/>
     <g fill="#1c0e04">
       <circle cx="29" cy="40" r="2.4"/><circle cx="26" cy="56" r="2.4"/><circle cx="31" cy="72" r="2.4"/>
       <circle cx="71" cy="40" r="2.4"/><circle cx="74" cy="56" r="2.4"/><circle cx="69" cy="72" r="2.4"/>
     </g>`,
    lg('hsG', [[0, '#fff6cf'], [0.4, '#ffcf52'], [0.75, '#c9881f'], [1, '#7c4e12']]),
  ),

  // ---- Звезда шерифа (младший+) — латунная пятиконечная бляха с шариками ----
  sheriff: svg(
    `<!-- тело звезды -->
     <path d="M50 14 58.2 38.7 82.3 39.5 63.3 54.3 70 77.5 50 64 30 77.5 36.7 54.3 17.7 39.5 41.8 38.7Z"
           fill="url(#shG)" stroke="#5a3a10" stroke-width="2.5" stroke-linejoin="round"/>
     <!-- шарики на концах -->
     <g fill="url(#shB)" stroke="#5a3a10" stroke-width="1.6">
       <circle cx="50" cy="12" r="4.6"/><circle cx="84.5" cy="39" r="4.6"/><circle cx="71.5" cy="80" r="4.6"/>
       <circle cx="28.5" cy="80" r="4.6"/><circle cx="15.5" cy="39" r="4.6"/>
     </g>
     <!-- центральный медальон -->
     <circle cx="50" cy="52" r="11" fill="url(#shC)" stroke="#5a3a10" stroke-width="2"/>
     <path d="M50 45l1.8 4 4.4.3-3.4 2.8 1.1 4.3L50 58.9 46.1 61l1.1-4.3-3.4-2.8 4.4-.3Z" fill="#6a4710"/>
     <!-- блик -->
     <path d="M50 17 55 32" stroke="#fff" stroke-width="2" opacity=".5" stroke-linecap="round"/>`,
    lg('shG', [[0, '#fff6cc'], [0.4, '#ffd457'], [0.72, '#d49a22'], [1, '#8a5a12']]) +
      rg('shB', [[0, '#fff3c0'], [1, '#c98a1e']], '35%', '30%', '80%') +
      rg('shC', [[0, '#ffe9a6'], [0.6, '#e0a62e'], [1, '#9a5f16']], '38%', '30%', '85%'),
  ),

  // ---- Бандит (средний) — шляпа + платок на лице, прищуренный взгляд ----
  bandit: svg(
    `<!-- лицо -->
     <path d="M31 50c0-13 9-21 19-21s19 8 19 21c0 7-2 12-5 16H36c-3-4-5-9-5-16Z" fill="url(#baF)" stroke="#5a3418" stroke-width="2"/>
     <!-- тень от полей -->
     <path d="M32 46q18-7 36 0l-1 7q-17-6-34 0Z" fill="#000" opacity=".28"/>
     <!-- глаза (прищур) -->
     <g fill="#201208"><path d="M38 47q5-3 10 0-5 2-10 0Z"/><path d="M52 47q5-3 10 0-5 2-10 0Z"/></g>
     <path d="M37 43q6-3 11 1M52 44q6-3 11-1" fill="none" stroke="#3a2410" stroke-width="1.6" stroke-linecap="round"/>
     <!-- платок на лице -->
     <path d="M31 54q19 9 38 0l2 4c-2 11-11 20-21 20s-19-9-21-20Z" fill="url(#baK)" stroke="#6a1410" stroke-width="2" stroke-linejoin="round"/>
     <path d="M34 57q16 7 32 0" fill="none" stroke="#ff8a7a" stroke-width="1.4" opacity=".5"/>
     <path d="M40 68q10 4 20 0M42 74q8 3 16 0" fill="none" stroke="#7a1812" stroke-width="1.6" opacity=".7"/>
     <!-- узел платка сбоку -->
     <path d="M69 56l10-3-4 7 6 3-9 3-2-6Z" fill="url(#baK)" stroke="#6a1410" stroke-width="1.6" stroke-linejoin="round"/>
     <!-- шляпа -->
     <ellipse cx="50" cy="31" rx="35" ry="8.5" fill="url(#baHb)" stroke="#2e180a" stroke-width="2.2"/>
     <path d="M31 30c-2-15 3-22 19-22s21 7 19 22c-6-5-12-6-19-6s-13 1-19 6Z" fill="url(#baHg)" stroke="#2e180a" stroke-width="2.2" stroke-linejoin="round"/>
     <path d="M30 27q20 8 40 0l1 5q-21 8-42 0Z" fill="#1f1107"/>`,
    lg('baF', [[0, '#eec19a'], [0.5, '#cf9a66'], [1, '#9a6638']]) +
      lg('baK', [[0, '#e8402e'], [0.5, '#c21f18'], [1, '#8a120e']]) +
      lg('baHg', [[0, '#8a5a30'], [0.5, '#5a3516'], [1, '#3a2010']]) +
      lg('baHb', [[0, '#6a4020'], [1, '#3a2010']]),
  ),

  // ---- Револьвер (средний) — шестизарядник: ствол, барабан, курок, деревянная рукоять ----
  revolver: svg(
    `<!-- ствол и рама -->
     <path d="M14 46h52v10H48l-2 1v6h-6l-2-7H30l-4 14c-1 3-4 5-7 5h-3c-3 0-5-3-4-6l5-18c-3-1-5-3-5-6 0-4 3-9 9-9Z"
           fill="url(#rvM)" stroke="#161a20" stroke-width="2.2" stroke-linejoin="round"/>
     <rect x="60" y="44" width="24" height="7" rx="2" fill="url(#rvM)" stroke="#161a20" stroke-width="1.6"/>
     <circle cx="84" cy="47.5" r="2" fill="#0c0f14"/>
     <!-- барабан -->
     <circle cx="31" cy="50" r="12" fill="url(#rvC)" stroke="#161a20" stroke-width="2.4"/>
     <circle cx="31" cy="50" r="4" fill="#0c0f14"/>
     <g fill="#11151b"><circle cx="31" cy="41" r="2"/><circle cx="39" cy="46" r="2"/><circle cx="39" cy="55" r="2"/><circle cx="31" cy="60" r="2"/><circle cx="23" cy="55" r="2"/><circle cx="23" cy="46" r="2"/></g>
     <!-- курок -->
     <path d="M12 44c-3-3-3-8 1-9l3 2-1 7Z" fill="#2a2f37" stroke="#161a20" stroke-width="1.5"/>
     <!-- спусковая скоба -->
     <path d="M30 66q7 10 15 2" fill="none" stroke="#2a2f37" stroke-width="2.4"/>
     <!-- рукоять -->
     <path d="M44 56l16 10c5 3 7 9 5 16l-3 8c-1 3-4 4-6 2l-16-14c-4-3-5-9-2-14 1-3 4-7 6-8Z"
           fill="url(#rvW)" stroke="#2a1708" stroke-width="2.2" stroke-linejoin="round"/>
     <path d="M48 62l12 9M45 70l11 8" stroke="#3a2010" stroke-width="1.5" opacity=".7"/>
     <!-- блик на стволе -->
     <path d="M18 48h44" stroke="#ffffff" stroke-width="1.6" opacity=".5"/>`,
    steel('rvM') + rg('rvC', [[0, '#eef2f6'], [0.5, '#9aa4af'], [1, '#434a54']], '40%', '35%', '75%') + wood('rvW'),
  ),

  // ---- Ковбойская шляпа (средний+) — фетр, лента, загнутые поля ----
  hat: svg(
    `<ellipse cx="50" cy="68" rx="42" ry="13" fill="url(#htB)" stroke="#2e180a" stroke-width="2.5"/>
     <path d="M24 66c-2-4-1-8 1-9 2 14 48 14 50 0 2 1 3 5 1 9-7 7-45 7-52 0Z" fill="#2e180a" opacity=".5"/>
     <path d="M30 64c-3-18 2-40 20-40s23 22 20 40c-7-7-13-9-20-9s-13 2-20 9Z"
           fill="url(#htG)" stroke="#2e180a" stroke-width="2.5" stroke-linejoin="round"/>
     <path d="M29 56q21 9 42 0l2 9q-23 9-46 0Z" fill="#1f1107"/>
     <rect x="45" y="50" width="10" height="7" rx="1.5" fill="url(#htK)" stroke="#5a3410" stroke-width="1"/>
     <path d="M34 40q16-8 32 0" fill="none" stroke="#ffe3ad" stroke-width="1.4" opacity=".4"/>`,
    lg('htG', [[0, '#c98f52'], [0.5, '#8a5a2c'], [1, '#573317']]) +
      lg('htB', [[0, '#a56a34'], [1, '#5a3418']]) + brass('htK'),
  ),

  // ---- Динамит (старший) — три шашки, бечёвка, горящий фитиль ----
  dynamite: svg(
    `<g stroke="#4a0d0e" stroke-width="2.2" stroke-linejoin="round">
       <rect x="30" y="34" width="13" height="46" rx="3.5" fill="url(#dyR)"/>
       <rect x="43.5" y="34" width="13" height="46" rx="3.5" fill="url(#dyR)"/>
       <rect x="57" y="34" width="13" height="46" rx="3.5" fill="url(#dyR)"/>
     </g>
     <g stroke="#2a1708" stroke-width="3" opacity=".85"><path d="M28 48h44"/><path d="M28 66h44"/></g>
     <rect x="30" y="52" width="40" height="10" fill="#3a1206" opacity=".75"/>
     <text x="50" y="60.5" text-anchor="middle" font-size="9.5" font-weight="900" fill="#ffd98a" font-family="'Russo One',system-ui,sans-serif" letter-spacing="1">TNT</text>
     <path d="M63 34q8-12 16-9" fill="none" stroke="#3a2a14" stroke-width="3" stroke-linecap="round"/>
     <circle cx="80" cy="23" r="6.5" fill="url(#dySpark)"/>
     <path d="M80 13l2 6 6-2-4 4.5 2.5 6-6.5-3.5-6.5 3.5 2.5-6-4-4.5 6 2Z" fill="#fff3b0" opacity=".95"/>
     <path d="M32 40h9M45.5 40h9M59 40h9" stroke="#fff" stroke-width="1.4" opacity=".35"/>`,
    lg('dyR', [[0, '#ff8a6b'], [0.35, '#e23a22'], [0.7, '#b31c12'], [1, '#7a120a']], 0, 0, 1, 0) +
      rg('dySpark', [[0, '#fff6cc'], [0.5, '#ffb02e'], [1, '#ff5a00']], '50%', '50%', '55%'),
  ),

  // ---- Мешок денег (ДИКИЙ) — мешковина, бечёвка, золото, лента WILD (без «$») ----
  moneybag: svg(
    `<!-- горловина -->
     <path d="M36 26q14-7 28 0l-7 10-7 2-7-2Z" fill="url(#mbT)" stroke="#5a3a14" stroke-width="2"/>
     <path d="M40 36q10-4 20 0" fill="none" stroke="#4a2f10" stroke-width="3"/>
     <!-- тело мешка -->
     <path d="M28 58c0-15 10-24 22-24s22 9 22 24c0 14-10 26-22 26S28 72 28 58Z"
           fill="url(#mbG)" stroke="#5a3a12" stroke-width="2.5" stroke-linejoin="round"/>
     <path d="M38 44q12-6 24 0M34 54q16-7 32 0" fill="none" stroke="#6a4718" stroke-width="1.4" opacity=".5"/>
     <!-- монеты -->
     <g stroke="#9a6a10" stroke-width="1.5">
       <circle cx="43" cy="58" r="7" fill="url(#mbCoin)"/>
       <circle cx="58" cy="61" r="7" fill="url(#mbCoin)"/>
       <circle cx="50" cy="70" r="7" fill="url(#mbCoin)"/>
     </g>
     <g fill="#9a6a10" font-family="'Russo One',system-ui,sans-serif" font-size="7" text-anchor="middle">
       <circle cx="43" cy="58" r="3.4" fill="none" stroke="#c98a1e" stroke-width="1"/>
       <circle cx="58" cy="61" r="3.4" fill="none" stroke="#c98a1e" stroke-width="1"/>
       <circle cx="50" cy="70" r="3.4" fill="none" stroke="#c98a1e" stroke-width="1"/>
     </g>
     <!-- лента WILD -->
     <rect x="14" y="74" width="72" height="18" rx="7" fill="url(#mbRib)" stroke="#6a3a08" stroke-width="2"/>
     <path d="M14 80h72" stroke="#fff" stroke-width="1" opacity=".3"/>
     <text x="50" y="87" text-anchor="middle" font-size="13" font-weight="900" fill="#4a1e00" font-family="'Russo One',system-ui,sans-serif" letter-spacing="1.5">WILD</text>`,
    rg('mbG', [[0, '#efe0b2'], [0.5, '#cda35c'], [1, '#8a5f22']]) +
      rg('mbCoin', [[0, '#fff6b4'], [0.55, '#ffcf52'], [1, '#c9881e']]) +
      lg('mbT', [[0, '#d9b876'], [1, '#9a6f32']]) +
      lg('mbRib', [[0, '#ffe59a'], [0.5, '#ffb53a'], [1, '#d9881e']]),
  ),
};
