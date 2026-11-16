/* Regras que o conteúdo precisa seguir: tudo tem animação, os níveis respeitam a dificuldade
   e o condicionamento varia os músculos ao longo da semana. */
import { describe, expect, it } from "vitest";
import { buildDay, COND, COND_AK, FOCI, FOCUS_TECH, GUIDE, TECH, LKEYS } from "../src/treino.js";
import { ANIM, BONES, comboAnim } from "../src/boneco.js";
import condicionamento from "../src/dados/condicionamento.json";

const ORDEM = { basico: 0, intermediario: 1, avancado: 2 };

describe("técnicas", () => {
  it("são pelo menos 60, todas com descrição, erro comum e músculos", () => {
    const todas = Object.values(TECH);
    expect(todas.length).toBeGreaterThanOrEqual(60);
    todas.forEach((t) => {
      expect(t.desc.length, t.key).toBeGreaterThan(20);
      expect(t.err.length, t.key).toBeGreaterThan(10);
      expect(t.mus.length, t.key + " sem músculos").toBeGreaterThan(5);
    });
  });
  it("toda técnica tem animação, e toda pose tem todas as articulações", () => {
    Object.keys(TECH).forEach((k) => {
      const a = ANIM[k];
      expect(a, "sem animação: " + k).toBeTruthy();
      const pontos = [...new Set(BONES[a.view].flatMap(([x, y]) => [x, y]))];
      a.frames.forEach(([pose], i) => pontos.forEach((pt) => {
        expect(pose[pt], `${k}, quadro ${i}, ponto ${pt}`).toBeTruthy();
        expect(Number.isFinite(pose[pt][0]) && Number.isFinite(pose[pt][1]), `${k} ${pt}`).toBe(true);
        expect(pose[pt][0]).toBeGreaterThanOrEqual(-5); expect(pose[pt][0]).toBeLessThanOrEqual(205);
        expect(pose[pt][1]).toBeGreaterThanOrEqual(-5); expect(pose[pt][1]).toBeLessThanOrEqual(212);
      }));
    });
  });
  it("cada nível tem técnicas próprias em todas as categorias de golpes, defesa e pernas", () => {
    for (const cat of ["Golpes", "Defesa", "Trabalho de pernas"]) {
      const c = GUIDE.find((g) => g.cat === cat);
      for (const nv of LKEYS) expect(c.items.some((it) => it.nivel === nv), `${cat} sem técnica ${nv}`).toBe(true);
    }
  });
});

describe("condicionamento", () => {
  it("todo exercício tem animação e aparece no guia de técnicas", () => {
    Object.values(condicionamento).forEach((s) => s.exercicios.forEach((x) => {
      expect(ANIM[x.anim], x.nome).toBeTruthy();
      expect(TECH[x.anim], x.nome + " sem técnica no guia").toBeTruthy();
      expect(COND_AK[x.nome]).toBe(x.anim);
    }));
  });
  it("cada conjunto tem nome e músculos", () => {
    Object.entries(condicionamento).forEach(([k, s]) => { expect(s.nome, k).toBeTruthy(); expect(s.musculos, k).toBeTruthy(); expect(COND[k].length).toBeGreaterThan(2); });
  });
  for (const lv of LKEYS) {
    it(`${lv}: a semana trabalha pelo menos 3 grupos musculares diferentes`, () => {
      for (let sem = 0; sem < 8; sem++) {
        const conjuntos = new Set();
        for (let d = 1; d <= 6; d++) { const dia = buildDay(lv, sem * 7 + d); if (dia.cond) conjuntos.add(dia.cond.set); }
        if (conjuntos.size) expect(conjuntos.size, `${lv}, semana ${sem + 1}`).toBeGreaterThanOrEqual(3);
      }
    });
  }
});

describe("treinos", () => {
  for (const lv of LKEYS) {
    it(`${lv}: 140 dias montam sem erro, com tempo e técnicas do nível`, () => {
      for (let n = 1; n <= 140; n++) {
        const d = buildDay(lv, n);
        expect(d.steps.length).toBeGreaterThan(5);
        d.steps.forEach((s) => expect(s.dur, `${lv} dia ${n}`).toBeGreaterThan(0));
        if (d.rec) continue;
        /* técnicas do tema mostradas no dia: nenhuma acima do nível */
        const temas = FOCUS_TECH[d.di].filter((k) => TECH[k]);
        const permitidas = temas.filter((k) => ORDEM[TECH[k].nivel] <= ORDEM[lv]);
        expect(permitidas.length, `${lv} dia ${n} sem técnica`).toBeGreaterThan(0);
      }
    });
  }
  it("toda chamada vira uma animação com movimento", () => {
    const chamadas = new Set(FOCI.flatMap((F) => ["basico", "inter", "alt", "pro"].flatMap((k) => F[k].calls)));
    chamadas.forEach((c) => expect(comboAnim(c).frames.length, c).toBeGreaterThan(3));
  });
  it("o nível Básico não chama técnica de outro nível", () => {
    const proibidas = /overhand|blitz|pivô reverso|shoulder|check hook|l-step|finta|jab saindo|passo duplo|sprawl/i;
    FOCI.forEach((F) => F.basico.calls.forEach((c) => expect(proibidas.test(c), c).toBe(false)));
  });
});
