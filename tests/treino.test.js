/* Regras que o conteúdo precisa seguir: tudo tem animação, os níveis respeitam a dificuldade
   e o condicionamento varia os músculos ao longo da semana. */
import { describe, expect, it } from "vitest";
import { buildDay, COND, COND_AK, FOCI, FOCUS_TECH, GUIDE, TECH, LKEYS, LEVELS, SPRINT } from "../src/treino.js";
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
    const chamadas = new Set([...FOCI.flatMap((F) => ["basico", "basico2", "basico3", "inter", "alt", "pro"].flatMap((k) => F[k].calls)), ...Object.values(SPRINT).flatMap((s) => s.calls)]);
    chamadas.forEach((c) => expect(comboAnim(c).frames.length, c).toBeGreaterThan(3));
  });
  it("o nível Básico não chama técnica de outro nível", () => {
    const proibidas = /overhand|blitz|pivô reverso|shoulder|check hook|l-step|finta|jab saindo|passo duplo|sprawl/i;
    FOCI.forEach((F) => ["basico", "basico2", "basico3"].forEach((k) => F[k].calls.forEach((c) => expect(proibidas.test(c), k + ": " + c).toBe(false))));
  });
});

describe("módulos e sprints", () => {
  const sprints = (lv, n) => buildDay(lv, n).steps.filter((s) => s.k === "sprint");
  it("cada nível tem 3 módulos, de uma semana cada", () => {
    for (const lv of LKEYS) {
      expect(LEVELS[lv].weeks.length, lv).toBe(3);
      LEVELS[lv].weeks.forEach((w, i) => expect(w.name.startsWith(`${LEVELS[lv].name} ${i + 1}`), w.name).toBe(true));
      expect(buildDay(lv, 22).week.name, "o ciclo recomeça no módulo 1").toBe(LEVELS[lv].weeks[0].name);
    }
  });
  it("Básico: 1 sprint por treino, que fica mais longo a cada módulo", () => {
    const dur = [1, 8, 15].map((n) => { const s = sprints("basico", n); expect(s.length).toBe(1); return s[0].dur; });
    expect(dur[0]).toBe(30); expect(dur[1]).toBeGreaterThan(dur[0]); expect(dur[2]).toBeGreaterThan(dur[1]);
  });
  for (const lv of ["intermediario", "avancado"]) {
    it(`${lv}: 1, 2 e 3 sprints nos módulos 1, 2 e 3, com descanso entre eles`, () => {
      [1, 8, 15].forEach((n, m) => {
        const d = buildDay(lv, n), i = d.steps.findIndex((s) => s.k === "sprint");
        expect(sprints(lv, n).length, `${lv} módulo ${m + 1}`).toBe(m + 1);
        for (let j = 1; j <= m; j++) expect(d.steps[i + 2 * j - 1].k, "descanso entre os sprints").toBe("rest");
      });
    });
  }
  it("o sprint do Intermediário é mais longo e tem mais golpes que o do Básico; o do Avançado, mais ainda", () => {
    const golpes = (lv) => Math.max(...SPRINT[lv].calls.map((c) => (c.match(/\d/g) || []).length));
    expect(sprints("intermediario", 1)[0].dur).toBeGreaterThan(sprints("basico", 1)[0].dur);
    expect(sprints("avancado", 1)[0].dur).toBeGreaterThan(sprints("intermediario", 1)[0].dur);
    expect(golpes("intermediario")).toBeGreaterThan(golpes("basico"));
    expect(golpes("avancado")).toBeGreaterThanOrEqual(golpes("intermediario"));
  });
  it("o Básico acrescenta golpes a cada módulo: upper e cruzado de direita no 2, pêndulo e sequências de 4 no 3", () => {
    const todas = (k) => FOCI.flatMap((F) => F[k].calls).join(" | ");
    expect(todas("basico")).not.toMatch(/[56]|pêndulo/);
    expect(todas("basico2")).toMatch(/5-6|1-2-5|1-6-3/);
    expect(todas("basico2")).toMatch(/1-2-4/);
    expect(todas("basico3")).toMatch(/pêndulo/i);
    expect(todas("basico3")).toMatch(/\d-\d-\d-\d/);
  });
});
