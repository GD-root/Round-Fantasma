/* A versão reorganizada precisa montar os mesmos treinos e as mesmas animações da versão anterior. */
import { describe, expect, it } from "vitest";
import { lerGabarito, json } from "./gabarito.js";
import { buildDay, TECH } from "../src/treino.js";
import { ANIM, comboAnim } from "../src/boneco.js";

const g = lerGabarito("gabarito");

describe("igual à versão anterior", () => {
  for (const lv of ["basico", "intermediario", "avancado"]) {
    it(`${lv}: 140 dias de treino`, () => {
      for (let n = 1; n <= 140; n++) expect(json(buildDay(lv, n)), `${lv} dia ${n}`).toEqual(g.dias[lv + ":" + n]);
    });
  }
  it("técnicas", () => {
    const sem = (t) => { const { nivel, mus, ...r } = t; return r; };
    expect(json(Object.fromEntries(Object.entries(TECH).map(([k, t]) => [k, sem(t)])))).toEqual(g.TECH);
  });
  it("animações", () => {
    expect(json(ANIM)).toEqual(g.ANIM);
  });
  it("combinações", () => {
    for (const [c, esperado] of Object.entries(g.combos)) expect(json(comboAnim(c)), c).toEqual(esperado);
  });
});
