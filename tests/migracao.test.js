/* O que já existia na versão anterior continua igual: técnicas, animações e combinações antigas.
   (Os treinos mudaram de propósito: mais chamadas e condicionamento variado. Veja treino.test.js.) */
import { describe, expect, it } from "vitest";
import { lerGabarito, json } from "./gabarito.js";
import { TECH } from "../src/treino.js";
import { ANIM, comboAnim } from "../src/boneco.js";

const g = lerGabarito("gabarito");

describe("igual à versão anterior", () => {
  it("as 40 técnicas antigas, com o mesmo texto", () => {
    for (const [k, antiga] of Object.entries(g.TECH)) {
      const { nivel, mus, ...t } = TECH[k];
      expect(json(t), k).toEqual(antiga);
    }
  });
  it("as 42 animações antigas", () => {
    for (const [k, antiga] of Object.entries(g.ANIM)) expect(json(ANIM[k]), k).toEqual(antiga);
  });
  /* Correção feita de propósito: trechos com "jab" por extenso ou "passo atrás" deixavam o boneco parado;
     agora ele faz o movimento. Nessas chamadas a animação só pode ter ficado maior. */
  const corrigida = (c) => /passo atrás|\bjab\b/i.test(c);
  it("as 152 combinações antigas (as com jab por extenso ou passo atrás ganharam movimento)", () => {
    let corrigidas = 0;
    for (const [c, esperado] of Object.entries(g.combos)) {
      const novo = json(comboAnim(c));
      if (JSON.stringify(novo) === JSON.stringify(esperado)) continue;
      expect(corrigida(c), "mudou sem motivo: " + c).toBe(true);
      expect(novo.frames.length, c).toBeGreaterThan(esperado.frames.length);
      corrigidas++;
    }
    expect(corrigidas).toBeLessThan(15);
  });
  it("os treinos têm a mesma estrutura de rounds, descanso e tempo da versão anterior", () => {
    for (const [chave, antigo] of Object.entries(g.dias)) {
      const [lv, n] = chave.split(":");
      const novo = json(buildDayCache(lv, +n));
      const forma = (d) => d.steps.map((s) => [s.k, s.dur, s.k === "round" ? s.title : ""]);
      expect(forma(novo), chave).toEqual(forma(antigo));
    }
  });
});

import { buildDay } from "../src/treino.js";
const cache = {};
function buildDayCache(lv, n) { return cache[lv + n] || (cache[lv + n] = buildDay(lv, n)); }
