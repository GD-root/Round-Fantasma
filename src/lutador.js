/* Estilo "Academia": lutador desenhado sobre as poses do boneco (protetor de cabeça, short largo, luvas e botas),
   o instrutor de boné com as manoplas e o saco de pancada. Só gera texto SVG; quem anima é o boneco.js. */

const F1 = (v) => v.toFixed(1);
const mid = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const L = (a, b, w, c) => `<line x1="${F1(a[0])}" y1="${F1(a[1])}" x2="${F1(b[0])}" y2="${F1(b[1])}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;

export const CORES = {
  lutador: { pele: "#d9a074", pele2: "#a8724c", short: "#c0281e", short2: "#8a1a12", faixa: "#f4f0e6", luva: "#d8261c", luva2: "#9a160e", capacete: "#b81e16", bota: "#1c1c22", contorno: "#2a160c" },
  instrutor: { pele: "#8a5a3a", pele2: "#5e3a22", camisa: "#1c1f28", camisa2: "#14161e", calca: "#2a2e3a", bone: "#d8261c", letra: "#f2c94c" },
};

/** Lutador na pose p (caixa 200 × 210, de perfil olhando para a direita; front = de frente). */
export function lutadorSVG(p, front = false, c = CORES.lutador, capacete = true) {
  const k = c.contorno;
  const luva = (h, cor) => `<circle cx="${F1(h[0])}" cy="${F1(h[1])}" r="9.5" fill="${cor}" stroke="${k}" stroke-width="1.4"/><path d="M${F1(h[0] - 4)} ${F1(h[1] - 5)}q4 -3 8 0" fill="none" stroke="#ffffff66" stroke-width="2" stroke-linecap="round"/>`;
  let s = L(p.rs, p.re, 10, k) + L(p.re, p.rh, 9, k) + L(p.rs, p.re, 8, c.pele2) + L(p.re, p.rh, 7, c.pele2) + luva(p.rh, c.luva2);
  s += L(p.rp, p.rk, 14, k) + L(p.rk, p.ra, 11, k) + L(p.rp, p.rk, 12, c.pele2) + L(p.rk, p.ra, 9, c.pele2);
  s += L(mid(p.ra, p.rk, .28), p.ra, 11, c.bota) + L(p.ra, p.rt, 9, c.bota);
  s += L(p.n, mid(p.n, p.p, .9), 25, k) + L(p.n, mid(p.n, p.p, .9), 23, c.pele) + L(p.ls, p.rs, 12, c.pele);
  s += `<path d="M${F1(p.n[0] - 4)} ${F1(p.n[1] + 18)}q8 4 14 0" fill="none" stroke="${c.pele2}" stroke-width="1.4"/>`;
  const ql = mid(p.lp, p.lk, .48), qr = mid(p.rp, p.rk, .48), cos = mid(p.n, p.p, .8);
  s += L(p.rp, qr, 19, k) + L(p.rp, qr, 17, c.short2) + L(mid(p.n, p.p, .78), p.p, 26, c.short);
  s += L(p.lp, ql, 19, k) + L(p.lp, ql, 17, c.short) + L([p.p[0] - 12, cos[1]], [p.p[0] + 12, cos[1]], 6, c.faixa);
  s += L(ql, p.lk, 14, k) + L(p.lk, p.la, 11, k) + L(ql, p.lk, 12, c.pele) + L(p.lk, p.la, 9, c.pele);
  s += L(mid(p.la, p.lk, .28), p.la, 11, c.bota) + L(p.la, p.lt, 9, c.bota);
  s += L(p.n, p.h, 9, c.pele2);
  const [hx, hy] = p.h;
  s += `<circle cx="${F1(hx)}" cy="${F1(hy)}" r="12.5" fill="${capacete ? c.capacete : "#2a1a10"}" stroke="${k}" stroke-width="1.4"/>`;
  if (front) {
    s += `<ellipse cx="${F1(hx)}" cy="${F1(hy + 1.5)}" rx="7.5" ry="8.5" fill="${c.pele}"/><circle cx="${F1(hx - 3)}" cy="${F1(hy)}" r="1.4" fill="#1a0e06"/><circle cx="${F1(hx + 3)}" cy="${F1(hy)}" r="1.4" fill="#1a0e06"/>`;
  } else {
    s += `<ellipse cx="${F1(hx + 4.5)}" cy="${F1(hy + 1.5)}" rx="6.6" ry="8" fill="${c.pele}"/><circle cx="${F1(hx + 8)}" cy="${F1(hy - .5)}" r="1.4" fill="#1a0e06"/>`;
    if (capacete) s += `<path d="M${F1(hx - 2)} ${F1(hy - 8)}q8 -3 12 3" fill="none" stroke="${c.faixa}" stroke-width="1.6"/>`;
  }
  s += L(p.ls, p.le, 10, k) + L(p.le, p.lh, 9, k) + L(p.ls, p.le, 8, c.pele) + L(p.le, p.lh, 7, c.pele) + luva(p.lh, c.luva);
  return s;
}

/** Pés vistos de cima (vista "top" das técnicas de pernas). */
export function pesSVG(p) {
  let s = "";
  for (const [a, b, cor] of [["rfh", "rft", "#9a160e"], ["lfh", "lft", "#d8261c"]]) if (p[a] && p[b]) s += L(p[a], p[b], 12, "#2a160c") + L(p[a], p[b], 10, cor);
  if (p.c && p.d) s += L(p.c, p.d, 2.4, "#9aa0ab");
  return s;
}

/** Instrutor de boné, camiseta e calça, segurando as manoplas (de perfil, olhando para a direita). */
export function instrutorSVG(p, c = CORES.instrutor, espelhado = true) {
  const k = "#1a120a", tenis = "#f4f0e6";
  let s = L(p.rs, p.re, 10, k) + L(p.re, p.rh, 9, k) + L(p.rs, p.re, 8, c.pele2) + L(p.re, p.rh, 7, c.pele2) + L(p.rs, mid(p.rs, p.re, .5), 12, c.camisa2);
  s += L(p.rp, p.rk, 15, k) + L(p.rk, p.ra, 13, k) + L(p.rp, p.rk, 13, c.calca) + L(p.rk, p.ra, 11, c.calca) + L(p.ra, p.rt, 9, k) + L(p.ra, p.rt, 7, tenis);
  s += L(p.n, p.p, 27, k) + L(p.n, p.p, 25, c.camisa) + L(p.ls, p.rs, 13, c.camisa);
  const tx = p.n[0] - 1, vira = espelhado ? ` transform="translate(${F1(tx)} 0) scale(-1 1) translate(${F1(-tx)} 0)"` : "";
  s += `<text${vira} x="${F1(tx)}" y="${F1(p.n[1] + 34)}" text-anchor="middle" font-family="Big Shoulders Display, Impact, sans-serif" font-weight="900" font-size="8" fill="${c.letra}">COACH</text>`;
  s += L(p.lp, p.lk, 15, k) + L(p.lk, p.la, 13, k) + L(p.lp, p.lk, 13, c.calca) + L(p.lk, p.la, 11, c.calca) + L(p.la, p.lt, 9, k) + L(p.la, p.lt, 7, tenis);
  s += L(p.n, p.h, 9, c.pele2);
  const [hx, hy] = p.h;
  s += `<circle cx="${F1(hx)}" cy="${F1(hy)}" r="11.5" fill="${c.pele}" stroke="${k}" stroke-width="1.4"/>`;
  s += `<path d="M${F1(hx - 12)} ${F1(hy - 2)}Q${F1(hx - 11)} ${F1(hy - 14)} ${F1(hx + 1)} ${F1(hy - 13)}Q${F1(hx + 11)} ${F1(hy - 12)} ${F1(hx + 11)} ${F1(hy - 4)}L${F1(hx + 21)} ${F1(hy - 3)}Q${F1(hx + 21)} ${F1(hy)} ${F1(hx + 11)} ${F1(hy)}H${F1(hx - 12)}Z" fill="${c.bone}" stroke="${k}" stroke-width="1.2"/>`;
  s += `<path d="M${F1(hx - 11)} ${F1(hy + 1)}q2 8 8 10" fill="none" stroke="#3a2414" stroke-width="3"/><circle cx="${F1(hx + 7)}" cy="${F1(hy + 2)}" r="1.4" fill="#1a0e06"/>`;
  s += L(p.ls, p.le, 10, k) + L(p.le, p.lh, 9, k) + L(p.ls, p.le, 8, c.pele) + L(p.le, p.lh, 7, c.pele) + L(p.ls, mid(p.ls, p.le, .5), 12, c.camisa);
  for (const [h, inc] of [[p.rh, 6], [p.lh, -8]]) s += `<g transform="translate(${F1(h[0] + 4)} ${F1(h[1])}) rotate(${inc})"><rect x="-6" y="-13" width="12" height="26" rx="6" fill="#f2c94c" stroke="#3a2a08" stroke-width="1.4"/><circle cx="1" cy="0" r="3.8" fill="none" stroke="#c0281e" stroke-width="1.8"/></g>`;
  return s;
}

/** Saco de pancada pendurado em (x, -60), girando ang graus em torno do gancho. */
export function sacoSVG(x, ang, cor = "#2a1d14", faixa = "#c0281e") {
  return `<g transform="rotate(${F1(ang)} ${x} -60)"><path d="M${x} -60V18" stroke="#8a8f99" stroke-width="2" stroke-dasharray="3 2"/>` +
    `<path d="M${x - 2} 18l-14 12M${x + 2} 18l14 12" stroke="#8a8f99" stroke-width="1.6"/>` +
    `<rect x="${x - 17}" y="28" width="34" height="112" rx="14" fill="${cor}" stroke="#0a0806" stroke-width="1.6"/>` +
    `<rect x="${x - 17}" y="40" width="34" height="6" fill="${faixa}"/><rect x="${x - 17}" y="120" width="34" height="6" fill="${faixa}"/>` +
    `<path d="M${x - 9} 50v62" stroke="#ffffff1c" stroke-width="5" stroke-linecap="round"/></g>`;
}

/** Física simples do saco: recebe o alcance da mão e devolve o novo ângulo. */
export function balancaSaco(est, alcance, x, dt) {
  if (alcance > x - 24 && est.vel > -0.02) est.vel -= 0.0016 * (alcance - (x - 24));
  est.vel += -est.ang * 0.00012 * dt; est.vel *= 0.985; est.ang += est.vel * dt;
  est.ang = Math.max(-9, Math.min(9, est.ang));
  return est.ang;
}
