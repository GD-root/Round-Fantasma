/* O que já existia na versão anterior continua igual: técnicas, animações e combinações antigas.
   (Os treinos mudaram de propósito: agora são 9 módulos com sprints, e mais chamadas. Veja treino.test.js.) */
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
});
