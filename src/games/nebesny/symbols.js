// Собственная графика символов слота «Небесный Куш»: SVG, нарисованный кодом.
const svg = (body, defs = '') => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>${body}</svg>`;
const radial = (id, stops, cx = '35%', cy = '30%', r = '75%') =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</radialGradient>`;
const linear = (id, stops, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const sphereShade = (id) => radial(id, [[0.55, '#0000'], [1, '#000a']], '30%', '28%', '80%');
const gloss = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".45" transform="rotate(-30 ${cx} ${cy})"/>`;

function facetedStar() {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? 19 : 44;
    pts.push([50 + r * Math.cos(a), 52 + r * Math.sin(a)]);
  }
  const p = (q) => q.map((v) => v.toFixed(1)).join(',');
  let facets = '';
  for (let i = 0; i < 10; i++) {
    const a = pts[i], b = pts[(i + 1) % 10];
    facets += `<polygon points="50,52 ${p(a)} ${p(b)}" fill="${i % 2 ? '#ffb300' : '#fff1a1'}" opacity="${i % 2 ? 0.55 : 0.5}"/>`;
  }
  const outline = pts.map(p).join(' ');
  return svg(
    `<polygon points="${outline}" fill="url(#st-g)" stroke="#8a4b00" stroke-width="3" stroke-linejoin="round"/>
     ${facets}
     <polygon points="${outline}" fill="none" stroke="#fff6c7" stroke-width="1.2" stroke-linejoin="round" opacity=".9"/>
     <circle cx="50" cy="52" r="4" fill="#fff" opacity=".9"/>
     <path d="M78 14l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#fff"/>`,
    radial('st-g', [[0, '#fff7b8'], [0.5, '#ffc928'], [1, '#d07a00']]),
  );
}

export const SYMBOL_SVG = {
  star: facetedStar(),

  moon: svg(
    `<circle cx="50" cy="50" r="40" fill="#7fb7ff" opacity=".18"/>
     <path d="M64 12a40 40 0 1 0 26 62A33 33 0 0 1 64 12Z" fill="url(#mn-g)" stroke="#5a6aa8" stroke-width="2"/>
     <circle cx="38" cy="40" r="7" fill="url(#mn-c)"/><circle cx="48" cy="68" r="5" fill="url(#mn-c)"/>
     <circle cx="28" cy="62" r="4" fill="url(#mn-c)"/><circle cx="58" cy="82" r="3" fill="url(#mn-c)"/>
     <path d="M30 22a36 36 0 0 0-8 46" stroke="#fff" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`,
    radial('mn-g', [[0, '#ffffff'], [0.6, '#cfd6ff'], [1, '#7c83c4']], '30%', '30%') +
      radial('mn-c', [[0, '#8f95c9'], [1, '#c9cff5']], '60%', '60%', '60%'),
  ),

  comet: svg(
    `<path d="M96 4 34 50l14 14Z" fill="url(#cm-t)"/>
     <path d="M84 2 32 46l8 8Z" fill="url(#cm-t)" opacity=".7"/>
     <path d="M98 22 46 60l6 8Z" fill="url(#cm-t)" opacity=".6"/>
     <circle cx="38" cy="62" r="25" fill="#38d9ff" opacity=".25"/>
     <circle cx="38" cy="62" r="19" fill="url(#cm-g)" stroke="#bdf6ff" stroke-width="2"/>
     ${gloss(31, 54, 7, 4)}`,
    radial('cm-g', [[0, '#ffffff'], [0.45, '#7df0ff'], [1, '#0077d6']]) +
      linear('cm-t', [[0, '#00e5ff00'], [1, '#a6f6ff']], 0, 1).replace('x1="0" y1="0" x2="0" y2="1"', 'x1="1" y1="0" x2="0" y2="1"'),
  ),

  ringed: svg(
    `<ellipse cx="50" cy="52" rx="47" ry="13" fill="none" stroke="url(#rg-r)" stroke-width="7" transform="rotate(-18 50 52)"/>
     <circle cx="50" cy="50" r="28" fill="url(#rg-g)"/>
     <path d="M24 42q26 8 52-2M23 55q27 9 54-2M30 68q20 6 40-1" stroke="#7a1f2b" stroke-width="4" fill="none" opacity=".45"/>
     <circle cx="50" cy="50" r="28" fill="url(#rg-s)"/>
     <g transform="rotate(-18 50 52)"><ellipse cx="50" cy="52" rx="47" ry="13" fill="none" stroke="url(#rg-r)" stroke-width="7" clip-path="url(#rg-front)"/></g>
     ${gloss(40, 36, 9, 5)}`,
    radial('rg-g', [[0, '#ffe2b8'], [0.5, '#ff8a5c'], [1, '#a4243b']]) +
      sphereShade('rg-s') +
      linear('rg-r', [[0, '#fff0b3'], [0.5, '#e0a43a'], [1, '#fff0b3']], 1, 0) +
      '<clipPath id="rg-front"><rect x="0" y="52" width="100" height="48"/></clipPath>',
  ),

  alien: svg(
    `<ellipse cx="50" cy="56" rx="40" ry="34" fill="#c86bff" opacity=".18"/>
     <path d="M50 14c-2-7 2-11 8-12" stroke="#7a2cc8" stroke-width="4" fill="none" stroke-linecap="round"/>
     <circle cx="60" cy="2" r="5" fill="#ffe36b"/><circle cx="60" cy="2" r="9" fill="#ffe36b" opacity=".3"/>
     <path d="M24 72c-6 8-5 16-10 20M38 78c-3 9-1 15-5 21M62 78c3 9 1 15 5 21M76 72c6 8 5 16 10 20M50 82v18"
       stroke="url(#al-b)" stroke-width="9" fill="none" stroke-linecap="round"/>
     <path d="M50 14c20 0 33 15 33 35 0 16-9 28-20 33H37C26 77 17 65 17 49c0-20 13-35 33-35Z" fill="url(#al-g)" stroke="#5a179a" stroke-width="2"/>
     <ellipse cx="50" cy="44" rx="21" ry="23" fill="#fff"/>
     <ellipse cx="50" cy="44" rx="20" ry="22" fill="none" stroke="#5a179a" stroke-width="2"/>
     <circle cx="50" cy="46" r="12" fill="#1aa7ff"/>
     <circle cx="50" cy="46" r="6" fill="#06121f"/>
     <circle cx="45" cy="41" r="3.5" fill="#fff"/>
     <path d="M40 72q10 7 20 0" stroke="#5a179a" stroke-width="3" fill="none" stroke-linecap="round"/>
     ${gloss(34, 30, 8, 4)}`,
    radial('al-g', [[0, '#f0c6ff'], [0.5, '#b14dff'], [1, '#6a1fb0']]) +
      linear('al-b', [[0, '#b14dff'], [1, '#6a1fb0']]),
  ),

  ufo: svg(
    `<path d="M36 66 18 98h64L64 66Z" fill="url(#uf-b)"/>
     <ellipse cx="50" cy="42" rx="20" ry="19" fill="url(#uf-d)" stroke="#e4fbff" stroke-width="2"/>
     <ellipse cx="44" cy="34" rx="6" ry="4" fill="#fff" opacity=".7"/>
     <ellipse cx="50" cy="58" rx="46" ry="15" fill="url(#uf-g)" stroke="#2b5e3a" stroke-width="2"/>
     <ellipse cx="50" cy="54" rx="40" ry="7" fill="#ffffff" opacity=".35"/>
     <circle cx="22" cy="60" r="4.5" fill="#fff35c"/><circle cx="36" cy="64" r="4.5" fill="#ff5cf0"/>
     <circle cx="50" cy="66" r="4.5" fill="#5cf9ff"/><circle cx="64" cy="64" r="4.5" fill="#ff5cf0"/><circle cx="78" cy="60" r="4.5" fill="#fff35c"/>`,
    radial('uf-d', [[0, '#ffffff'], [0.5, '#a9f0ff'], [1, '#3aa0c8']], '40%', '30%') +
      linear('uf-g', [[0, '#e8fff0'], [0.45, '#61e08f'], [1, '#1b7a45']]) +
      linear('uf-b', [[0, '#b6ff9c88'], [1, '#b6ff9c00']]),
  ),

  wild: svg(
    `<circle cx="50" cy="44" r="46" fill="url(#wd-h)"/>
     <ellipse cx="50" cy="44" rx="44" ry="12" fill="none" stroke="url(#wd-d)" stroke-width="7" transform="rotate(-16 50 44)"/>
     <circle cx="50" cy="44" r="17" fill="#000"/>
     <circle cx="50" cy="44" r="18.5" fill="none" stroke="#ffd2fb" stroke-width="2"/>
     <g transform="rotate(-16 50 44)"><ellipse cx="50" cy="44" rx="44" ry="12" fill="none" stroke="url(#wd-d)" stroke-width="7" clip-path="url(#wd-front)"/></g>
     <rect x="14" y="72" width="72" height="22" rx="8" fill="url(#wd-p)" stroke="#7a3d00" stroke-width="2.5"/>
     <text x="50" y="89" text-anchor="middle" font-size="18" font-weight="900" fill="#5a1a00" font-family="'Russo One',system-ui,sans-serif" letter-spacing="1">WILD</text>`,
    radial('wd-h', [[0.3, '#000'], [0.42, '#ff3df2'], [0.65, '#7b2cff88'], [1, '#7b2cff00']], '50%', '50%', '50%') +
      linear('wd-d', [[0, '#ffe1fb'], [0.5, '#ff5cf0'], [1, '#ffb14a']], 1, 0) +
      linear('wd-p', [[0, '#fff3a6'], [0.5, '#ffc12e'], [1, '#e08a00']]) +
      '<clipPath id="wd-front"><rect x="0" y="44" width="100" height="56"/></clipPath>',
  ),

  rocket: svg(
    `<path d="M40 70 50 99 60 70Z" fill="url(#rk-f)"/>
     <path d="M50 4C68 18 70 44 63 70H37C30 44 32 18 50 4Z" fill="url(#rk-g)" stroke="#9aa6d8" stroke-width="2"/>
     <path d="M50 4C59 11 64 22 65 34H35C36 22 41 11 50 4Z" fill="url(#rk-n)"/>
     <path d="M37 50 20 74l17-3ZM63 50l17 24-17-3Z" fill="url(#rk-n)" stroke="#8a0f33" stroke-width="1.5"/>
     <circle cx="50" cy="46" r="9" fill="url(#rk-w)" stroke="#2346c6" stroke-width="3"/>
     <path d="M44 12q-6 20-4 50" stroke="#fff" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>
     <rect x="18" y="72" width="64" height="20" rx="8" fill="url(#rk-p)" stroke="#0b3a8a" stroke-width="2.5"/>
     <text x="50" y="87.5" text-anchor="middle" font-size="14.5" font-weight="900" fill="#fff" font-family="'Russo One',system-ui,sans-serif" letter-spacing=".5">БОНУС</text>`,
    linear('rk-g', [[0, '#c7d0f0'], [0.5, '#ffffff'], [1, '#aab4e0']], 1, 0) +
      linear('rk-n', [[0, '#ff7aa2'], [1, '#d6164f']]) +
      radial('rk-w', [[0, '#e8fdff'], [1, '#26b6ff']]) +
      linear('rk-f', [[0, '#fff36b'], [0.5, '#ff8a1c'], [1, '#ff3d0000']]) +
      linear('rk-p', [[0, '#7ee2ff'], [1, '#2f6bff']]),
  ),
};
