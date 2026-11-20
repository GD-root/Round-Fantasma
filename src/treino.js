/* Montagem dos treinos: níveis, semanas, temas do dia, rounds, chamadas e condicionamento.
   Todo o conteúdo vem de src/dados/*.json. */
import niveis from "./dados/niveis.json";
import temas from "./dados/temas.json";
import condicionamento from "./dados/condicionamento.json";
import aquecimento from "./dados/aquecimento.json";
import voltaACalma from "./dados/volta-a-calma.json";
import tecnicas from "./dados/tecnicas.json";
import dicas from "./dados/dicas.json";

export const LEVELS = niveis;
export const LKEYS = ["basico", "intermediario", "avancado"];
export const FOCI = temas;
export const TIPS = dicas;

/* Conjuntos de condicionamento: [nome, dica] de cada exercício, e o nome e os músculos do conjunto */
export const COND = Object.fromEntries(Object.entries(condicionamento).map(([k, v]) => [k, v.exercicios.map((x) => [x.nome, x.dica])]));
export const COND_INFO = Object.fromEntries(Object.entries(condicionamento).map(([k, v]) => [k, { nome: v.nome, musculos: v.musculos }]));
/* Além do conjunto da semana, cada nível alterna estes durante a semana, para variar os músculos trabalhados */
export const COND_EXTRA = { basico: ["E2", "E3"], intermediario: ["F", "G", "H"], avancado: ["F", "G", "H", "I"] };
export const WARM = aquecimento.map((x) => [x.nome, x.dica, x.seg]);
export const COOL = voltaACalma.map((x) => [x.nome, x.dica, x.seg]);

/* Animação de cada exercício, pelo nome que aparece no treino */
export const COND_AK = {};
Object.values(condicionamento).forEach((v) => v.exercicios.forEach((x) => { if (x.anim) COND_AK[x.nome] = x.anim; }));
export const WARM_AK = Object.fromEntries(aquecimento.filter((x) => x.anim).map((x) => [x.nome, x.anim]));

/* Guia de técnicas */
export const GUIDE = tecnicas.map((c) => ({ cat: c.categoria, note: c.nota, items: c.itens }));
export const TECH = {};
GUIDE.forEach((c) => c.items.forEach((it) => {
  TECH[it.id] = { key: it.id, num: it.num, name: it.nome, desc: it.desc, err: it.erro, cat: c.cat, adv: it.nivel === "avancado", nivel: it.nivel, mus: it.musculos || "" };
}));
export const FOCUS_TECH = temas.map((t) => t.tecnicas);
export const ADV = new Set(Object.values(TECH).filter((t) => t.nivel === "avancado").map((t) => t.key));
export const NOT_BASIC = new Set(Object.values(TECH).filter((t) => t.nivel !== "basico").map((t) => t.key));

export function warmSteps(total){const out=[];let t=0;for(const w of WARM){if(t>=total)break;const d=Math.min(w[2],total-t);out.push({k:"warm",tag:"Aquecimento",title:w[0],sub:w[1],dur:d});t+=d}return out}
export function coolSteps(total){const out=[];let t=0;for(const w of COOL){if(t>=total)break;const d=Math.min(w[2],total-t);out.push({k:"cool",tag:"Volta à calma",title:w[0],sub:w[1],dur:d});t+=d}return out}

/* Cada nível tem 3 módulos (1, 2 e 3), de uma semana cada; depois o ciclo recomeça com chamadas extras */
export const NMOD = 3;
export function dayInfo(n){const i=n-1,w=Math.floor(i/7);return{n,i,w,phase:w%NMOD,cycle:Math.floor(w/NMOD)+1,di:i%7,wk:(w%NMOD)+1}}
/* Rounds e chamadas do tema, conforme o nível e o módulo (m = 0, 1 ou 2): cada módulo acrescenta golpes e sequências */
export function pick(F,lv,c,m=0){
  if(lv==="basico"){const B=[F.basico,F.basico2,F.basico3][m];return{rounds:B.rounds,calls:c>=2?[...B.calls,...(m<2?F[m?"basico3":"basico2"].calls.slice(0,3):F.inter.calls.slice(0,3))]:B.calls}}
  if(lv==="intermediario"){
    if(m===0)return{rounds:F.inter.rounds,calls:c>=2?[...F.inter.calls,...F.alt.calls.slice(0,4)]:F.inter.calls};
    if(m===1)return{rounds:F.alt.rounds,calls:[...F.inter.calls.slice(4),...F.alt.calls]};
    return{rounds:c%2===0?F.inter.rounds:F.alt.rounds,calls:[...F.alt.calls,...F.inter.calls.slice(6),...F.pro.calls.slice(0,c>=2?4:2)]};
  }
  if(m===0)return{rounds:F.pro.rounds,calls:[...F.inter.calls.slice(4),...F.alt.calls,...F.pro.calls]};
  if(m===1)return{rounds:F.alt.rounds,calls:[...F.alt.calls,...F.pro.calls,...F.pro.calls]};
  return{rounds:F.pro.rounds,calls:[...F.pro.calls,...F.pro.calls,...F.alt.calls.slice(4)]};
}
/* Sprint: golpes rápidos no fim dos rounds. As chamadas ficam mais longas a cada nível */
export const SPRINT={
  basico:{calls:["1-2","1-2","1-1-2","1-2-3"],every:5,sub:"Socos retos rápidos, sem parar. Guarda volta sempre."},
  intermediario:{calls:["1-2-3","1-2-3-2","3-2","5-6","Rajada!"],every:4,sub:"Mais golpes: retos, cruzados e uppers no máximo."},
  avancado:{calls:["1-2-3-2","5-6-3","3 corpo, 3","1-2-3-4","Rajada!","Esquiva e rajada"],every:3,sub:"Tudo no máximo: sequências longas, corpo e cabeça."},
};
export function buildDay(lv,n){
  const L=LEVELS[lv],I=dayInfo(n),W=L.weeks[I.phase],c=I.cycle;
  if(I.di===6){
    const steps=[...warmSteps(300)];
    for(let r=0;r<3;r++){steps.push({k:"round",tag:`Round ${r+1} de 3 · leve`,title:["Técnica lenta, espelho mental","Jab e movimento solto","Livre, 50% da força"][r],sub:"Sem pressa. Foco em forma perfeita e respiração.",dur:180,calls:null});if(r<2)steps.push({k:"rest",tag:"Descanso",title:"Respira",sub:"",dur:60})}
    steps.push(...coolSteps(240));
    return {...I,lv,rec:true,week:W,name:"Recuperação ativa",desc:"Dia de descanso. Se quiser se mexer, faça este treino leve de 20 minutos. Se preferir parar totalmente, também vale.",steps};
  }
  const F=FOCI[I.di],P=pick(F,lv,c,I.phase);
  const every=Math.max(5,W.every-Math.min(c-1,2));
  const finish=W.finish;
  const steps=[...warmSteps(W.warm)];
  const all=P.rounds;const R=W.rounds;
  const titles=R<=6?(R===6?all:[...all.slice(0,R-1),all[5]]):[...all.slice(0,5),...F[lv==="avancado"?"alt":"inter"].rounds.slice(0,R-6),all[5]];
  titles.forEach((t,r)=>{
    steps.push({k:"round",tag:`Round ${r+1} de ${R}`,title:t,sub:finish?`Últimos ${finish} s em ritmo máximo`:(I.phase===0&&lv==="basico"&&r<3?"Devagar e certo. Técnica antes de velocidade":"Técnica limpa, guarda sempre alta"),dur:W.work,calls:P.calls,every,finish});
    if(r<titles.length-1)steps.push({k:"rest",tag:"Descanso",title:"Respira e solta os braços",sub:"",dur:W.rest});
  });
  const SP=W.sprint,SPC=SPRINT[lv];
  if(SP&&SP.n){steps.push({k:"rest",tag:"Descanso",title:"Prepara o sprint",sub:"",dur:W.rest});
    for(let j=0;j<SP.n;j++){steps.push({k:"sprint",tag:`Sprint ${j+1} de ${SP.n}`,title:"Golpes rápidos",sub:SPC.sub,dur:SP.dur,calls:SPC.calls,every:SPC.every});
      if(j<SP.n-1)steps.push({k:"rest",tag:"Descanso",title:"Respira fundo",sub:"",dur:SP.rest})}}
  const sets=["A","B","C","D"];const base=c>=2&&lv!=="basico"?sets[(sets.indexOf(W.cond.set)+c-1)%4]:W.cond.set;
  /* o conjunto do dia gira entre o da semana e os extras do nível: cada dia trabalha um grupo muscular */
  const pool=[base,...COND_EXTRA[lv]];const set=pool[(I.di+c-1)%pool.length];const CL=COND[set];
  for(let j=0;j<W.cond.n;j++){const cx=CL[j%CL.length];steps.push({k:"cond",tag:`Condicionamento ${j+1}/${W.cond.n}`,title:cx[0],sub:cx[1],dur:W.cond.work});steps.push({k:"rest",tag:"Pausa",title:"Recupera",sub:"",dur:W.cond.rest})}
  steps.push(...coolSteps(W.cool));
  return {...I,lv,rec:false,week:W,name:F.name,desc:F.desc,mus:F.mus,steps,every,adv:c>=2,cond:W.cond.n?{set,...COND_INFO[set]}:null};
}
