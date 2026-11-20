/* Fundo "Academia de rua": debaixo do viaduto, muro grafitado, sacos pendurados dos lados e o ringue no centro,
   onde o lutador treina manopla com o instrutor, fazendo as combinações do treino do dia. */
import { comboAnim, S, md } from "./boneco.js";
import { lutadorSVG, instrutorSVG } from "./lutador.js";

const W = 390, H = 844;
const rnd = (seed) => () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

function sacoTeto(x, topo, cor, faixa, chao) {
  return `<ellipse cx="${x}" cy="${chao}" rx="18" ry="4" fill="#000" opacity=".35"/>` +
    `<path d="M${x} 0V${topo - 8}" stroke="#9aa0a8" stroke-width="1.8" stroke-dasharray="3 2"/><path d="M${x} ${topo - 8}l-11 8M${x} ${topo - 8}l11 8" stroke="#9aa0a8" stroke-width="1.4"/>` +
    `<rect x="${x - 13}" y="${topo}" width="26" height="70" rx="11" fill="${cor}" stroke="#0a0806" stroke-width="1.4"/>` +
    `<rect x="${x - 13}" y="${topo + 9}" width="26" height="4" fill="${faixa}"/><rect x="${x - 13}" y="${topo + 56}" width="26" height="4" fill="${faixa}"/>` +
    `<path d="M${x - 6} ${topo + 16}v38" stroke="#ffffff22" stroke-width="4" stroke-linecap="round"/>`;
}

/** O cenário inteiro, em SVG. As cordas da frente do ringue passam na frente dos lutadores. */
export function cenaRua() {
  const r = rnd(7);
  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMin slice" aria-hidden="true"><defs>
<linearGradient id="ac-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfd8c8"/><stop offset="1" stop-color="#e8e2d0"/></linearGradient>
<radialGradient id="ac-luz" cx="50%" cy="10%" r="70%"><stop offset="0" stop-color="#fff6d8" stop-opacity=".35"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient>
<linearGradient id="ac-esm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14110f" stop-opacity="0"/><stop offset=".33" stop-color="#14110f" stop-opacity="0"/><stop offset=".42" stop-color="#14110f" stop-opacity="1"/></linearGradient></defs>`;
  s += `<rect width="${W}" height="${H}" fill="#14110f"/><rect y="40" width="${W}" height="120" fill="url(#ac-ceu)"/>`;
  // lá fora: árvores e casas
  for (let i = 0; i < 22; i++) s += `<circle cx="${(r() * W).toFixed(0)}" cy="${(80 + r() * 40).toFixed(0)}" r="${(12 + r() * 18).toFixed(0)}" fill="${["#5a7a3e", "#4a6a34", "#6e8a4a", "#3e5a2a"][i % 4]}"/>`;
  for (let i = 0; i < 9; i++) { const x = i * 46 + r() * 8, h = 20 + r() * 20; s += `<rect x="${x.toFixed(0)}" y="${(128 - h).toFixed(0)}" width="40" height="${(h + 40).toFixed(0)}" fill="${["#c9b49a", "#b89a7a", "#d8c8b0", "#a88a6a"][i % 4]}"/>`; }
  // muro grafitado (só cores, sem palavras)
  s += `<rect y="132" width="${W}" height="80" fill="#6a5a46"/>`;
  for (const [x, y, rx, cor] of [[40, 160, 30, "#d8261c"], [110, 176, 26, "#f2c94c"], [300, 156, 24, "#2fb3d8"], [350, 182, 30, "#2a9d6a"], [240, 186, 20, "#e08a1a"], [170, 150, 18, "#7a3cc0"]]) s += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${(rx * .6).toFixed(1)}" fill="${cor}" opacity=".85"/>`;
  // laje, viga e lâmpada fluorescente
  s += `<rect width="${W}" height="40" fill="#2e322c"/><rect y="36" width="${W}" height="10" fill="#4a4e48"/><path d="M150 52h90" stroke="#f4f0e0" stroke-width="4"/><rect width="${W}" height="${H}" fill="url(#ac-luz)"/>`;
  s += `<rect y="206" width="${W}" height="${H - 206}" fill="#3a3632"/>`;
  // ringue em perspectiva
  const bx1 = 98, bx2 = 292, by = 202, fx1 = 46, fx2 = 344, fy = 260, corda = "#d8261c";
  s += sacoTeto(22, 136, "#1e1e22", "#e8e2d0", 228) + sacoTeto(368, 136, "#6a3a22", "#3a1e10", 228);
  s += `<path d="M${bx1} ${by}H${bx2}L${fx2} ${fy}H${fx1}Z" fill="#6a645a"/><path d="M${fx1} ${fy}H${fx2}V${fy + 16}H${fx1}Z" fill="#2e2a26"/>`;
  s += `<rect x="${bx1 - 3}" y="${by - 58}" width="6" height="58" fill="#2a5ab8"/><rect x="${bx2 - 3}" y="${by - 58}" width="6" height="58" fill="#c0281e"/>`;
  [0, 1, 2].forEach((i) => { const yb = by - 46 + i * 15, yf = fy - 62 + i * 19; s += `<path d="M${bx1} ${yb}H${bx2}" stroke="${corda}" stroke-width="2.4"/><path d="M${bx1} ${yb}L${fx1} ${yf}M${bx2} ${yb}L${fx2} ${yf}" stroke="${corda}" stroke-width="2.8"/>`; });
  s += `<g transform="translate(110 140) scale(.5)"><g class="atores"></g></g>`;
  s += `<rect x="${fx1 - 4}" y="${fy - 80}" width="8" height="80" fill="#c0281e"/><rect x="${fx2 - 4}" y="${fy - 80}" width="8" height="80" fill="#2a5ab8"/>`;
  [0, 1, 2].forEach((i) => { s += `<path d="M${fx1} ${fy - 62 + i * 19}H${fx2}" stroke="${corda}" stroke-width="3.2"/>`; });
  return s + `<rect width="${W}" height="${H}" fill="url(#ac-esm)"/></svg>`;
}

const lerp = (a, b, t) => { const o = {}; for (const k in a) { const bb = b[k] || a[k]; o[k] = [a[k][0] + (bb[0] - a[k][0]) * t, a[k][1] + (bb[1] - a[k][1]) * t]; } return o; };
const ease = (t) => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const BASE_INSTRUTOR = md(S, { lh: [134, 60], rh: [132, 74], le: [120, 82], re: [112, 90] });
const REDUZIDO = (() => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } })();

/** Põe o lutador e o instrutor para treinar no ringue, sorteando as chamadas de pool. onCall(c) avisa a chamada atual. */
export function animaRingue(svg, pool, onCall) {
  const g = svg.querySelector(".atores");
  let segs = [], total = 0, t0 = 0, imp = 0, raf = 0, parado = false;
  const desenha = (p) => {
    const alcance = Math.max(p.lh[0], p.rh[0]);
    imp = alcance > 164 ? Math.min(1, imp + .3) : Math.max(0, imp - .08);
    const q = { ...BASE_INSTRUTOR, lh: [BASE_INSTRUTOR.lh[0] - imp * 5, BASE_INSTRUTOR.lh[1]], rh: [BASE_INSTRUTOR.rh[0] - imp * 3, BASE_INSTRUTOR.rh[1]] };
    g.innerHTML = `<g transform="translate(322 0) scale(-1 1)">${instrutorSVG(q)}</g>` + lutadorSVG(p);
  };
  const proxima = (agora) => {
    const c = pool[Math.floor(Math.random() * pool.length)];
    if (onCall) onCall(c);
    const fr = comboAnim(c).frames; segs = [];
    for (let i = 0; i < fr.length - 1; i++) segs.push({ a: fr[i][0], b: fr[i + 1][0], dur: Math.max(1, fr[i + 1][1]), hold: fr[i + 1][2] || 0 });
    segs.push({ a: S, b: S, dur: 1, hold: 1300 });
    total = segs.reduce((s, x) => s + x.dur + x.hold, 0); t0 = agora;
  };
  const pose = (t) => { for (const s of segs) { if (t < s.dur) return lerp(s.a, s.b, ease(t / s.dur)); t -= s.dur; if (t < s.hold) return s.b; t -= s.hold; } return S; };
  const quadro = (agora) => {
    raf = 0; if (parado || !svg.isConnected) return;
    if (!segs.length || agora - t0 >= total) proxima(agora);
    desenha(pose(agora - t0));
    raf = requestAnimationFrame(quadro);
  };
  if (REDUZIDO) { desenha(comboAnim(pool[0] || "1-2").frames.find((f) => f[0].lh[0] > 150)?.[0] || S); if (onCall) onCall(pool[0] || "1-2"); return () => {}; }
  raf = requestAnimationFrame(quadro);
  return () => { parado = true; if (raf) cancelAnimationFrame(raf); };
}
