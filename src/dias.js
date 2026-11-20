/* Os dias da semana como adversários: de pé com o número no short; treino feito = nocauteado no chão,
   um dia caindo para cada lado, com as estrelinhas e o KO. */

/** SVG do dia n. estado: "feito", "hoje" ou "falta". */
export function adversarioSVG(n, estado) {
  const s = n % 2 ? 1 : -1;
  if (estado === "feito") {
    return `<svg viewBox="0 0 60 70" aria-hidden="true"><ellipse cx="30" cy="63" rx="20" ry="3.4" fill="#000" opacity=".4"/>
<g transform="translate(${30 - s * 13} 60) scale(.62) rotate(${s * 90}) translate(-30 -58)">
<line x1="30" y1="30" x2="30" y2="46" stroke="#e8c4a0" stroke-width="7" stroke-linecap="round"/>
<path d="M24 44h12v8h-12z" fill="#1f4fa8"/><line x1="27" y1="52" x2="25" y2="60" stroke="#e8c4a0" stroke-width="4" stroke-linecap="round"/><line x1="33" y1="52" x2="35" y2="60" stroke="#e8c4a0" stroke-width="4" stroke-linecap="round"/>
<circle cx="30" cy="24" r="6" fill="#e8c4a0" stroke="#2a160c" stroke-width="1"/><path d="M27 23l2 2m0-2l-2 2M31 23l2 2m0-2l-2 2" stroke="#2a160c" stroke-width="1"/>
<circle cx="22" cy="36" r="3.6" fill="#1f4fa8"/><circle cx="38" cy="36" r="3.6" fill="#1f4fa8"/></g>
<text x="30" y="26" text-anchor="middle" font-family="Big Shoulders Display, Impact, sans-serif" font-weight="900" font-size="11" fill="#8a8278">${n}</text>
<text x="30" y="40" text-anchor="middle" font-family="Big Shoulders Display, Impact, sans-serif" font-weight="900" font-size="13" fill="#ff3b30">KO</text>
${[0, 1, 2].map((i) => `<path transform="translate(${30 + s * (4 + i * 6)} ${50 - i * 4})" d="M0-3l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="#f2c94c"/>`).join("")}</svg>`;
  }
  const cor = estado === "hoje" ? "#ff3b30" : "#5a524a", op = estado === "falta" ? .45 : 1;
  return `<svg viewBox="0 0 60 70" aria-hidden="true"><ellipse cx="30" cy="63" rx="12" ry="3" fill="#000" opacity=".4"/>
<g opacity="${op}"><line x1="30" y1="20" x2="30" y2="40" stroke="#e8c4a0" stroke-width="7" stroke-linecap="round"/>
<line x1="27" y1="48" x2="25" y2="61" stroke="#e8c4a0" stroke-width="4" stroke-linecap="round"/><line x1="33" y1="48" x2="35" y2="61" stroke="#e8c4a0" stroke-width="4" stroke-linecap="round"/>
<circle cx="30" cy="13" r="7" fill="#e8c4a0" stroke="#2a160c" stroke-width="1"/></g>
<path d="M23 38h14v10h-14z" fill="${cor}"/><text x="30" y="46.5" text-anchor="middle" font-family="Big Shoulders Display, Impact, sans-serif" font-weight="900" font-size="9" fill="#fff">${n}</text>
<circle cx="24" cy="24" r="4" fill="${cor}"/><circle cx="36" cy="24" r="4" fill="${cor}"/></svg>`;
}
