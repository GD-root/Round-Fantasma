/* Shadowboxing: telas, cronômetro, voz e progresso. */
import "./estilos.css";
import { FIGCFG, Fig, ANIM, comboAnim } from "./boneco.js";
import { cenaRua, animaRingue } from "./academia.js";
import { adversarioSVG } from "./dias.js";
import { LEVELS, LKEYS, FOCI, TIPS, COND_AK, WARM_AK, GUIDE, TECH, FOCUS_TECH, ADV, NOT_BASIC, dayInfo, buildDay } from "./treino.js";

const LVL_ICON={
 basico:`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"><path d="M15 31V19a9 9 0 0 1 9-9h5a8 8 0 0 1 8 8v6a7 7 0 0 1-7 7z"/><path d="M15 23a5 5 0 0 1 5-5"/><rect x="15" y="31" width="16" height="7" rx="2"/></svg>`,
 intermediario:`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><g transform="rotate(-18 18 26)"><path d="M8 32V21a8 8 0 0 1 8-8h4a7 7 0 0 1 7 7v5a7 7 0 0 1-7 7z"/><rect x="8" y="32" width="14" height="6" rx="2"/></g><g transform="rotate(18 30 26)"><path d="M40 32V21a8 8 0 0 0-8-8h-4a7 7 0 0 0-7 7v5a7 7 0 0 0 7 7z"/><rect x="26" y="32" width="14" height="6" rx="2"/></g></svg>`,
 avancado:`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><rect x="2" y="17" width="44" height="14" rx="3"/><rect x="6" y="19.5" width="6" height="9" rx="1.5"/><rect x="36" y="19.5" width="6" height="9" rx="1.5"/><circle cx="24" cy="24" r="11" fill="var(--panel)"/><circle cx="24" cy="24" r="11"/><path d="M24 17.5l1.9 4 4.3.4-3.3 2.9 1 4.2-3.9-2.3-3.9 2.3 1-4.2-3.3-2.9 4.3-.4z" fill="currentColor" stroke-width="1"/></svg>`
};
const ICO={play:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8z"/></svg>`,eye:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,flame:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z"/></svg>`,muscle:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15c2-6 4-9 6-10 2 0 3 1 2 3l-2 2c3-1 7 0 9 3 2 4-2 7-8 7-4 0-6-2-7-5z"/></svg>`};

const cache={};const DAY=(lv,n)=>cache[lv+n]||(cache[lv+n]=buildDay(lv,n));
const total=d=>d.steps.reduce((a,s)=>a+s.dur,0);
const fmt=s=>{s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")};
const fmtMin=s=>Math.round(s/60)+" min";
const ymd=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const today=()=>ymd(new Date());
const FIG_STYLES={academia:{name:"Academia",desc:"Lutador de protetor, short e luvas, como na academia."},pixel:{name:"Pixel art",desc:"Boxeador de jogo antigo, em pixels."},esboco:{name:"Esboço",desc:"Traço de lápis tremido, de caderno."},traco:{name:"Traço",desc:"Linhas finas, o desenho original."},neon:{name:"Neon",desc:"Linhas brilhantes com rastro."}};
const sw=t=>{t=String(t);if(store.hand!=="C")return t;const m={esquerda:"direita",direita:"esquerda",esquerdo:"direito",direito:"esquerdo",Esquerda:"Direita",Direita:"Esquerda",Esquerdo:"Direito",Direito:"Esquerdo"};return t.replace(/[Ee]squerd[ao]|[Dd]ireit[ao]/g,w=>m[w]||w)};
const leadHand=()=>store.hand==="C"?"direita":"esquerda";
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

let store={level:"intermediario",prog:{basico:{},intermediario:{},avancado:{}},voice:true,beep:true,hand:"D",figStyle:"academia"};
try{const v=JSON.parse(localStorage.getItem("roundfantasma2")||"null");if(v)store=Object.assign(store,v);
 else{const o=JSON.parse(localStorage.getItem("roundfantasma")||"null");if(o&&o.done){store.prog.intermediario=o.done;store.voice=o.voice!==false;store.beep=o.beep!==false}}}catch(e){}
LKEYS.forEach(k=>{if(!store.prog[k])store.prog[k]={}});
/* versão Academia: o lutador detalhado vira o desenho padrão (dá para voltar a outro estilo nas configurações) */
if(!store.academia){store.figStyle="academia";store.academia=1}
syncFig();
function syncFig(){FIGCFG.hand=store.hand==="C"?"C":"D";FIGCFG.style=FIG_STYLES[store.figStyle]?store.figStyle:"academia"}
function save(){try{localStorage.setItem("roundfantasma2",JSON.stringify(store))}catch(e){}}
const LV=()=>store.level;const done=(lv=LV())=>store.prog[lv];
const nextN=(lv=LV())=>{const ks=Object.keys(store.prog[lv]).map(Number);return ks.length?Math.max(...ks)+1:1};
let selPlan=nextN(),selHoje=null,techFilter="Todas";
const $=id=>document.getElementById(id);
function allDates(){const s=new Set();LKEYS.forEach(k=>Object.values(store.prog[k]).forEach(x=>s.add(x.date)));return s}
function streak(){const ds=allDates();let s=0;const d=new Date();if(!ds.has(today()))d.setDate(d.getDate()-1);while(ds.has(ymd(d))){s++;d.setDate(d.getDate()-1)}return s}
function bestStreak(){const ds=[...allDates()].sort();let best=0,cur=0,prev=null;ds.forEach(x=>{const d=new Date(x+"T12:00");if(prev&&(d-prev)/864e5<1.5)cur++;else cur=1;best=Math.max(best,cur);prev=d});return best}
function toast(t){const el=$("toast");el.textContent=t;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>el.hidden=true,2200)}

function techForDay(d){
  if(d.rec)return["base","guarda","esquiva"].filter(k=>TECH[k]);
  let ks=FOCUS_TECH[d.di].filter(k=>TECH[k]);
  if(d.lv==="basico")ks=ks.filter(k=>!NOT_BASIC.has(k));else if(d.lv==="intermediario")ks=ks.filter(k=>!ADV.has(k));
  if(d.lv==="avancado")ks=[...ks.filter(k=>ADV.has(k)),...ks.filter(k=>!ADV.has(k))];
  const cond=[...new Set(d.steps.filter(s=>s.k==="cond").map(s=>COND_AK[s.title]).filter(Boolean))];
  return [...ks,...cond.filter(k=>!ks.includes(k))];
}
function techChips(keys){return `<div class="techrow">${keys.map(k=>`<button type="button" class="tchip" data-tech="${k}"><span class="tfig" data-static="${k}"></span><span>${esc(sw(TECH[k].name))}</span><em>${ICO.eye.replace('<svg','<svg width="9" height="9"')} Ver movimento</em></button>`).join("")}</div>`}
function mountStatics(root){root.querySelectorAll("[data-static]").forEach(el=>{if(el.firstChild)return;const f=new Fig(el,{label:TECH[el.dataset.static]?.name||""});f.showStatic(ANIM[el.dataset.static])})}
function wireTech(root){root.querySelectorAll("[data-tech]").forEach(b=>b.onclick=()=>openTech(b.dataset.tech))}

function timeline(d){
  const rows=[];
  d.steps.forEach(s=>{
    if(s.k==="rest"&&rows.length&&rows[rows.length-1].k==="cond"){rows[rows.length-1].dur+=s.dur;return}
    if(s.k==="rest"){const p=rows[rows.length-1];if(p&&p.k==="rests"){p.n++;p.dur+=s.dur}else rows.push({k:"rests",n:1,dur:s.dur,one:s.dur});return}
    if(s.k==="round"){rows.push({k:"round",nm:s.title,sub:s.tag,dur:s.dur});return}
    const last=rows[rows.length-1];if(last&&last.k===s.k){last.items.push(s.title);last.dur+=s.dur;return}
    rows.push({k:s.k,items:[s.title],dur:s.dur});
  });
  const name={warm:"Aquecimento",sprint:"Sprint",cond:"Condicionamento",cool:"Volta à calma"};
  return `<ul class="tl">${rows.filter(r=>r.k!=="rests").map(r=>r.k==="round"?`<li><span class="dot round"></span><span class="nm">${esc(sw(r.nm))}<small>${r.sub}</small></span><span class="d">${fmt(r.dur)}</span></li>`:`<li><span class="dot ${r.k}"></span><span class="nm">${name[r.k]}<small>${r.items.map(esc).join(" · ")}</small></span><span class="d">${fmt(r.dur)}</span></li>`).join("")}</ul>${d.steps.some(s=>s.k==="rest")?`<p class="note" style="margin:0">Descanso entre rounds: ${fmt(d.steps.find(s=>s.k==="rest").dur)}.</p>`:""}`;
}
function dayDetail(d){
  const calls=d.rec?[]:[...new Set(d.steps.find(s=>s.k==="round").calls)];
  return `<div class="card"><div class="sec-h"><h3>Técnicas do treino</h3><span class="eyebrow">toque para ver o movimento</span></div>${techChips(techForDay(d))}</div>
  <div class="card"><div class="sec-h"><h3>O treino</h3><span class="eyebrow">${fmtMin(total(d))}</span></div>${timeline(d)}</div>
  ${calls.length?`<div class="card"><div class="sec-h"><h3>Combinações do dia</h3><span class="eyebrow">chamadas a cada ${d.every} s</span></div><div class="cloud">${calls.map(c=>`<span>${esc(sw(c))}</span>`).join("")}</div>${d.mus?`<div class="mus">${ICO.muscle}<span><b>Músculos mais trabalhados.</b> ${esc(d.mus)}</span></div>`:""}${d.cond?`<div class="mus">${ICO.muscle}<span><b>Condicionamento de hoje: ${esc(d.cond.nome)}.</b> ${esc(d.cond.musculos)}</span></div>`:""}</div>`:""}`;
}

// ---------- HOJE ----------
let heroFig=null,heroTok=0;
function renderHoje(){
  const cur=nextN(),n=selHoje||cur,d=DAY(LV(),n),isDone=!!done()[n],W=d.week;
  const wst=d.w*7+1;
  const label=n===cur?"Treino de hoje":isDone?"Treino feito":"Prévia";
  const host=$("tab-hoje");
  host.innerHTML=`
  <section class="hero" aria-label="${label}">
    <div class="hero-txt">
      <div class="eyebrow">${label} · Dia ${n}</div>
      <h1>${esc(d.name).replace(/ (\S+)$/," <em>$1</em>")}</h1>
      <div class="meta"><span>${esc(W.name)}</span>${d.cycle>1?`<span>Ciclo ${d.cycle}</span>`:""}<span>${fmtMin(total(d))}</span>${d.rec?"<span>Opcional</span>":""}</div>
      <p style="margin:0;color:var(--heromuted);font-size:15px;max-width:42ch">${esc(d.desc)}</p>
      <div class="noringue"><span>No ringue</span><b id="heroCall" aria-live="off"></b></div>
      <div class="hero-actions"><button type="button" class="cta" id="hStart">${ICO.play} ${isDone?"Treinar de novo":"Começar treino"}</button><button type="button" class="ghostbtn" id="hMark">${isDone?"Desmarcar":"Marcar feito"}</button></div>
    </div>
  </section>
  ${levelUpBanner()}
  <div class="weekstrip" role="list">${Array.from({length:7},(_,i)=>{const m=wst+i,dd=DAY(LV(),m);return `<button type="button" role="listitem" class="wd${dd.rec?" rec":""}${done()[m]?" done":""}${m===cur?" cur":""}${m===n&&n!==cur?" sel":""}" data-n="${m}" aria-label="Dia ${m}: ${esc(dd.name)}${done()[m]?" (feito)":""}">${adversarioSVG(m,done()[m]?"feito":m===cur?"hoje":"falta")}<small>${m===cur?"Hoje":dd.rec?"Leve":"Dia "+m}</small></button>`}).join("")}</div>
  ${dayDetail(d)}`;
  host.querySelectorAll(".wd").forEach(b=>b.onclick=()=>{const m=+b.dataset.n;selHoje=m===cur?null:m;renderHoje()});
  $("hStart").onclick=()=>start(d);
  $("hMark").onclick=()=>{toggleDone(d);};
  const g=$("goUp");if(g)g.onclick=goUp;
  mountStatics(host);wireTech(host);
  heroLoop(d);
}
/* O lutador e o instrutor do ringue, no fundo, treinam as combinações do dia */
let pararRingue=null;
function heroLoop(d){
  const pool=d.rec?["1-2","Esquiva, 2","1-1-2"]:[...new Set(d.steps.find(s=>s.k==="round").calls)];
  if(pararRingue)pararRingue();
  const svg=$("fundoAc").querySelector("svg");
  pararRingue=animaRingue(svg,pool,(c)=>{const el=$("heroCall");if(el)el.textContent=sw(c)});
}
function levelUpBanner(){
  if(LV()==="avancado"||Object.keys(done()).length<21)return"";
  const nx=LV()==="basico"?"Intermediário":"Avançado";
  return `<div class="banner">${LVL_ICON[LV()==="basico"?"intermediario":"avancado"]}<div>Você completou os 3 módulos do ${LEVELS[LV()].name}. Se a técnica está limpa mesmo cansado, suba para o <button type="button" class="linkbtn" id="goUp">${nx}</button>. Seu progresso aqui fica guardado.</div></div>`;
}
function goUp(){store.level=LV()==="basico"?"intermediario":"avancado";save();selHoje=null;selPlan=nextN();renderAll();toast("Nível "+LEVELS[LV()].name)}
function toggleDone(d){const p=store.prog[d.lv];if(p[d.n])delete p[d.n];else p[d.n]={date:today(),min:Math.round(total(d)/60)};save();selHoje=null;selPlan=nextN();renderAll();toast(p[d.n]?"Dia "+d.n+" marcado como feito":"Dia "+d.n+" desmarcado")}

// ---------- PLANO ----------
function renderPlano(){
  const host=$("tab-plano");const I=dayInfo(selPlan),L=LEVELS[LV()],W=L.weeks[I.phase],wst=I.w*7+1,cur=nextN();
  const d=DAY(LV(),selPlan),isDone=!!done()[selPlan];
  host.innerHTML=`
  <div class="sec-h"><h2>Seu nível</h2><span class="eyebrow">cada nível tem seu progresso</span></div>
  <div class="levels">${LKEYS.map((k,i)=>{const nd=Object.keys(store.prog[k]).length,cy=dayInfo(nextN(k)).cycle;return `<button type="button" class="lvl${k===LV()?" on":""}" data-k="${k}" aria-pressed="${k===LV()}"><span class="ic">${LVL_ICON[k]}</span><span class="ln">${LEVELS[k].name}</span><span class="lw">${LEVELS[k].who}</span><span class="steps">${[0,1,2].map(j=>`<i class="${j<=i?"f":""}"></i>`).join("")}<small>${nd?`${nd} dias · ciclo ${cy}`:"novo"}</small></span></button>`}).join("")}</div>
  <div class="card"><div class="sec-h"><h3>Dicas do nível ${L.name}</h3></div><ul class="tips">${TIPS[LV()].map(t=>`<li>${esc(t)}</li>`).join("")}</ul></div>
  <div class="sec-h"><h2>Os módulos</h2><span class="eyebrow">1 semana cada · depois recomeça</span></div>
  <div class="phases">${L.weeks.map((w,i)=>`<div class="phase${i===I.phase?" now":""}"><b>${esc(w.name)}</b><p>${esc(w.note)}</p></div>`).join("")}<div class="phase"><b>Novo ciclo</b><p>Volta ao módulo 1 com combinações a mais e chamadas um pouco mais rápidas.</p></div></div>
  <div class="card">
    <div class="weeknav"><button type="button" class="wbtn" id="wPrev" aria-label="Módulo anterior">‹</button><h3>${esc(W.name.split(" · ")[0])}${I.cycle>1?` · ciclo ${I.cycle}`:""}</h3><button type="button" class="wbtn" id="wToday">Hoje</button><button type="button" class="wbtn" id="wNext" aria-label="Próximo módulo">›</button></div>
    <div class="weekstrip">${Array.from({length:7},(_,i)=>{const m=wst+i,dd=DAY(LV(),m);return `<button type="button" class="wd${dd.rec?" rec":""}${done()[m]?" done":""}${m===cur?" cur":""}${m===selPlan?" sel":""}" data-n="${m}" aria-label="Dia ${m}: ${esc(dd.name)}${done()[m]?" (feito)":""}">${adversarioSVG(m,done()[m]?"feito":m===cur?"hoje":"falta")}<small>${m===cur?"Hoje":dd.rec?"Leve":"Dia "+m}</small></button>`}).join("")}</div>
    <div class="sec-h"><div><div class="eyebrow">Dia ${selPlan}${selPlan===cur?" · treino de hoje":isDone?" · feito":""}</div><h3 style="font-size:28px">${esc(d.name)}</h3></div><div class="rowbtns"><button type="button" class="btn primary" id="pStart">Começar</button><button type="button" class="btn" id="pMark">${isDone?"Desmarcar":"Marcar feito"}</button></div></div>
  </div>
  ${dayDetail(d)}`;
  host.querySelectorAll(".lvl").forEach(b=>b.onclick=()=>{store.level=b.dataset.k;save();selHoje=null;selPlan=nextN();renderAll()});
  host.querySelectorAll(".wd").forEach(b=>b.onclick=()=>{selPlan=+b.dataset.n;renderPlano()});
  $("wPrev").disabled=wst===1;
  $("wPrev").onclick=()=>{selPlan=Math.max(1,selPlan-7);renderPlano()};
  $("wNext").onclick=()=>{selPlan+=7;renderPlano()};
  $("wToday").onclick=()=>{selPlan=nextN();renderPlano()};
  $("pStart").onclick=()=>start(d);$("pMark").onclick=()=>toggleDone(d);
  mountStatics(host);wireTech(host);
}

// ---------- TÉCNICAS ----------
function renderTecnicas(){
  const host=$("tab-tecnicas");const cats=["Todas",...GUIDE.map(c=>c.cat),"Básico","Intermediário","Avançado"];
  const NV={"Básico":"basico","Intermediário":"intermediario","Avançado":"avancado"};
  const list=GUIDE.flatMap(c=>c.items.map(it=>TECH[it.id]).filter(Boolean)).filter(t=>techFilter==="Todas"||(NV[techFilter]?t.nivel===NV[techFilter]:t.cat===techFilter));
  host.innerHTML=`<div class="sec-h"><h2>Técnicas</h2><button type="button" class="linkbtn" id="goStyle">Trocar estilo do boneco</button></div>
  <div class="filters" role="tablist">${cats.map(c=>`<button type="button" class="${c===techFilter?"on":""}" data-f="${esc(c)}">${esc(c)}</button>`).join("")}</div>
  <div class="tgrid">${list.map(t=>`<div class="tcard"><span data-static="${t.key}"></span><div style="min-width:0"><h4>${t.num?`<b>${t.num}</b>`:""}${esc(sw(t.name))}${t.adv?'<span class="tag">Avançado</span>':t.nivel==="intermediario"?'<span class="tag inter">Intermediário</span>':""}</h4><p>${esc(sw(t.desc))}</p><button type="button" class="vbtn" data-tech="${t.key}">${ICO.eye} Ver movimento</button></div></div>`).join("")}</div>
  <p class="note">No desenho, o vermelho é o lado da frente. Você está no modo ${store.hand==="C"?"canhoto (C): pé e mão direitos à frente":"destro (D): pé e mão esquerdos à frente"}. Para trocar, toque na luva CONF no topo.</p>`;
  host.querySelectorAll("[data-f]").forEach(b=>b.onclick=()=>{techFilter=b.dataset.f;renderTecnicas()});
  $("goStyle").onclick=()=>{openConfig();setTimeout(()=>{const e=document.querySelector("#cfg .styles");if(e)e.scrollIntoView({behavior:"smooth",block:"center"})},80)};
  mountStatics(host);wireTech(host);
}
function openTech(k){
  const t=TECH[k];if(!t)return;$("mCat").textContent=t.cat+(t.adv?" · Avançado":t.nivel==="intermediario"?" · Intermediário":"");$("mTitle").textContent=(t.num?t.num+" · ":"")+sw(t.name);$("mDesc").textContent=sw(t.desc);$("mErr").innerHTML="<b>Erro comum:</b> "+esc(sw(t.err));$("mMus").innerHTML=t.mus?"<b>Músculos:</b> "+esc(sw(t.mus)):"";$("mLegL").textContent="lado da frente (mão "+leadHand()+")";$("mLegR").textContent="lado de trás";
  const st=$("mStage");st.innerHTML="";const f=new Fig(st,{ghost:true,label:t.name});f.play(ANIM[k],{force:true});
  $("mPause").textContent="Pausar";$("mSlow").textContent="Câmera lenta";
  $("mPause").onclick=()=>{f.setPaused(!f.paused);$("mPause").textContent=f.paused?"Continuar":"Pausar"};
  $("mSlow").onclick=()=>{const s=f.speed===1?.4:1;f.setSpeed(s);$("mSlow").textContent=s===1?"Câmera lenta":"Velocidade normal"};
  $("modal").hidden=false;openTech.f=f;setTimeout(()=>$("mClose").focus(),50);
}
function closeModal(){$("modal").hidden=true;if(openTech.f)openTech.f.stop()}
$("mClose").onclick=closeModal;$("modal").addEventListener("click",e=>{if(e.target.id==="modal")closeModal()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("modal").hidden)closeModal()});

// ---------- PROGRESSO ----------
function renderProgresso(){
  const host=$("tab-progresso");const all=LKEYS.flatMap(k=>Object.values(store.prog[k]));const ds=allDates();
  const now=new Date();const mon=new Date(now);mon.setDate(now.getDate()-((now.getDay()+6)%7)-7*11);
  const cells=[];for(let i=0;i<84;i++){const d=new Date(mon);d.setDate(mon.getDate()+i);const k=ymd(d);cells.push(`<i class="${ds.has(k)?"on":""}${k===today()?" today":""}" title="${k.split("-").reverse().join("/")}"></i>`)}
  host.innerHTML=`<div class="sec-h"><h2>Progresso</h2></div>
  <div class="stats"><div class="stat"><b>${all.length}</b><small>treinos</small></div><div class="stat"><b>${all.reduce((a,x)=>a+(x.min||0),0)}</b><small>minutos</small></div><div class="stat"><b>${streak()}</b><small>dias seguidos</small></div><div class="stat"><b>${bestStreak()}</b><small>maior sequência</small></div></div>
  <div class="card"><div class="sec-h"><h3>Últimas 12 semanas</h3><span class="eyebrow">cada quadrado é um dia</span></div><div class="heat">${cells.join("")}</div></div>
  <div class="card"><h3>Por nível</h3>${LKEYS.map(k=>{const nd=Object.keys(store.prog[k]).length;return `<div class="lbar"><span>${LEVELS[k].name}</span><div><i style="width:${Math.min(100,nd/21*100)}%"></i></div><span>${nd}/21</span></div>`}).join("")}<p class="note" style="margin:0">A barra mostra o primeiro ciclo de 28 dias de cada nível.</p></div>`;
}
function renderConfig(){
  const host=$("cfgBody");
  host.innerHTML=`<div class="card"><h3>Sua guarda</h3>
    <div class="seg" role="radiogroup" aria-label="Guarda"><button type="button" role="radio" aria-checked="${store.hand==="D"}" data-hand="D"><span class="hball">D</span><span><b>Destro</b><small>Guarda ortodoxa · esquerda à frente</small></span></button><button type="button" role="radio" aria-checked="${store.hand==="C"}" data-hand="C"><span class="hball">C</span><span><b>Canhoto</b><small>Guarda canhota · direita à frente</small></span></button></div>
    <p class="note" style="margin:0">A numeração não muda: 1 é sempre o jab da mão da frente, 2 o direto da mão de trás. Os desenhos e os textos se ajustam ao lado escolhido.</p>
  </div>
  <div class="card"><h3>Estilo do boneco</h3>
    <div class="styles">${Object.entries(FIG_STYLES).map(([k,v])=>`<button type="button" class="stl${store.figStyle===k?" on":""}" data-style="${k}" aria-pressed="${store.figStyle===k}"><span class="stlfig" data-prev="${k}"></span><b>${v.name}</b><small>${v.desc}</small></button>`).join("")}</div>
  </div>
  <div class="card"><h3>App e som</h3>
    <div class="set"><span>Chamar combinações por voz</span><button type="button" class="switch" role="switch" aria-checked="${store.voice}" id="sVoice" aria-label="Voz"></button></div>
    <div class="set"><span>Sinal sonoro (sino e bipes)</span><button type="button" class="switch" role="switch" aria-checked="${store.beep}" id="sBeep" aria-label="Som"></button></div>
    <p class="note" style="margin:0">Instale o Shadowboxing na tela inicial. No Android (Chrome): toque em Instalar app ou no menu ⋮ › Instalar app. No iPhone (Safari): Compartilhar › Adicionar à Tela de Início. Depois de aberto uma vez com internet, ele funciona offline, com voz, cronômetro e animações. Para trazer o progresso de outra versão, use o backup abaixo.</p>
    <div class="rowbtns"><button type="button" class="btn primary" id="bInstall" hidden>Instalar app</button><button type="button" class="btn" id="bkCopy">Copiar meu progresso</button></div>
    <label for="bkIn" class="eyebrow">Colar progresso</label><textarea id="bkIn" placeholder="Cole aqui o código copiado na outra versão"></textarea>
    <div class="rowbtns"><button type="button" class="btn" id="bkLoad">Restaurar progresso</button></div>
  </div>`;
  host.querySelectorAll("[data-hand]").forEach(b=>b.onclick=()=>setHand(b.dataset.hand));
  host.querySelectorAll("[data-style]").forEach(b=>b.onclick=()=>{store.figStyle=b.dataset.style;save();syncFig();renderAll();toast("Estilo "+FIG_STYLES[store.figStyle].name)});
  host.querySelectorAll("[data-prev]").forEach(el=>{const f=new Fig(el,{style:el.dataset.prev,ghost:el.dataset.prev==="neon",label:"Prévia do estilo "+FIG_STYLES[el.dataset.prev].name});f.play(comboAnim("1-2-3"),{force:true})});
  $("sVoice").onclick=()=>{store.voice=!store.voice;save();renderConfig()};
  $("sBeep").onclick=()=>{store.beep=!store.beep;save();renderConfig()};
  $("bkCopy").onclick=async()=>{const code="RF1:"+btoa(unescape(encodeURIComponent(JSON.stringify({level:store.level,prog:store.prog}))));try{await navigator.clipboard.writeText(code);toast("Código copiado")}catch(e){$("bkIn").value=code;$("bkIn").select();toast("Selecione e copie o código")}};
  $("bkLoad").onclick=()=>{try{const raw=$("bkIn").value.trim().replace(/^RF1:/,"");const v=JSON.parse(decodeURIComponent(escape(atob(raw))));LKEYS.forEach(k=>Object.assign(store.prog[k],(v.prog||{})[k]||{}));if(v.level)store.level=v.level;save();selHoje=null;selPlan=nextN();renderAll();toast("Progresso restaurado")}catch(e){toast("Código inválido. Copie de novo na outra versão.")}};
}
function openConfig(){renderConfig();$("cfg").hidden=false;setTimeout(()=>$("cfgClose").focus(),50)}
function closeConfig(){$("cfg").hidden=true;$("cfgBody").innerHTML=""}
$("cConf").onclick=openConfig;$("cfgClose").onclick=closeConfig;
$("cfg").addEventListener("click",e=>{if(e.target.id==="cfg")closeConfig()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("cfg").hidden)closeConfig()});

function setHand(h){store.hand=h;save();syncFig();renderAll();toast(h==="C"?"Canhoto: pé e mão direitos à frente":"Destro: pé e mão esquerdos à frente")}
// ---------- navegação ----------
const TABS=["hoje","plano","tecnicas","progresso"];let curTab="hoje";
function showTab(t,push){if(!TABS.includes(t))t="hoje";curTab=t;TABS.forEach(x=>{$("tab-"+x).classList.toggle("on",x===t)});document.querySelectorAll(".bnav button").forEach(b=>{b.classList.toggle("on",b.dataset.tab===t);b.setAttribute("aria-current",b.dataset.tab===t?"page":"false")});
  if(push){try{history.replaceState(null,"","#"+t)}catch(e){location.hash=t}}window.scrollTo({top:0})}
document.querySelectorAll(".bnav button").forEach(b=>b.onclick=()=>showTab(b.dataset.tab,true));
window.addEventListener("hashchange",()=>showTab(location.hash.slice(1)));
function renderTop(){const n=streak(),el=$("cStreak");el.className="streak"+(n?"":" zero")+(n>9?" two":"")+(n>99?" three":"");el.setAttribute("aria-label",n+(n===1?" dia seguido":" dias seguidos"));el.title=el.getAttribute("aria-label");
  el.innerHTML=`<svg viewBox="0 0 54 50" aria-hidden="true"><rect x="21" y="1" width="12" height="48" rx="3" fill="#7A4E2A"/><rect x="23" y="3" width="2" height="44" rx="1" fill="#ffffff22"/><circle cx="27" cy="25" r="19" class="bdome"/><circle cx="27" cy="25" r="19" fill="none" stroke="#00000040" stroke-width="1.5"/><circle cx="27" cy="25" r="14" fill="none" stroke="#00000030" stroke-width="1.5"/><path d="M15 15a16 16 0 0 1 9-5" fill="none" stroke="#ffffff88" stroke-width="2.4" stroke-linecap="round"/><path d="M46 38l6 8" stroke="#7A4E2A" stroke-width="3" stroke-linecap="round"/><circle cx="45" cy="37" r="3.2" fill="#3a3a3a"/></svg><b>${n}</b>`}
function renderAll(){renderTop();renderHoje();renderPlano();renderTecnicas();renderProgresso();if(!$("cfg").hidden)renderConfig();showTab(curTab)}

// ---------- som e voz ----------
let ac=null;
function tone(f,d,when=0,vol=.25){if(!store.beep)return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;o.type="sine";const t=ac.currentTime+when;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(ac.destination);o.start(t);o.stop(t+d)}catch(e){}}
const bell=()=>{tone(1320,.9,0,.3);tone(1320,.9,.25,.3);tone(1320,1.1,.5,.3)};
const pip=()=>tone(880,.15);
const NUM={"1":"um","2":"dois","3":"três","4":"quatro","5":"cinco","6":"seis"};
function speak(t){if(!store.voice||!("speechSynthesis" in window))return;try{const s=t.replace(/\d(?:-\d)*/g,m=>m.split("-").map(x=>NUM[x]).join(", "));speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(s);u.lang="pt-BR";u.rate=1.15;speechSynthesis.speak(u)}catch(e){}}

// ---------- cronômetro ----------
let P=null,lock=null,pFig=null;
async function wake(){try{lock=await navigator.wakeLock.request("screen")}catch(e){lock=null}}
function start(d){
  const steps=[{k:"prep",tag:"Prepare-se",title:d.name,sub:"Fica na guarda",dur:5},...d.steps];
  P={d,steps,idx:0,left:steps[0].dur,running:true,last:performance.now(),nextCall:0,lastCall:"",said10:false,saidFin:false,lastPip:null};
  $("player").hidden=false;document.body.style.overflow="hidden";heroTok++;
  $("pFig").innerHTML="";pFig=new Fig($("pFig"),{ghost:true,largo:true,label:"Demonstração do movimento"});
  wake();enter();loop();
}
function figFor(s){
  if(s.k==="cond")return ANIM[COND_AK[s.title]]||ANIM.base;
  if(s.k==="warm")return ANIM[WARM_AK[s.title]]||ANIM.base;
  if(s.k==="round"||s.k==="prep")return ANIM.base;
  if(s.k==="sprint")return comboAnim("Rajada!");
  return ANIM.respira;
}
function enter(){
  const s=P.steps[P.idx];P.left=s.dur;P.said10=false;P.saidFin=false;P.nextCall=s.calls?s.dur-4:0;$("pCall").textContent="";
  $("player").className="player"+(["round","rest","cond","sprint"].includes(s.k)?" k-"+s.k:"");
  $("pTag").textContent=s.tag;$("pTitle").textContent=sw(s.title);$("pSub").textContent=s.sub||"";
  const n=P.steps[P.idx+1];$("pNext").textContent=n?`A seguir: ${n.title} (${fmt(n.dur)})`:"Último bloco";
  $("pDay").textContent=`Dia ${P.d.n} · ${P.d.name}`;
  if(pFig){pFig.opt.saco=s.k==="round"||s.k==="sprint";pFig.play(figFor(s),{force:true})}
  if(s.k==="round"){bell();speak(s.title)}else if(s.k==="sprint"){bell();speak("Sprint! Golpes rápidos, no máximo")}else if(s.k==="cond"){pip();speak(s.title)}else if(s.k==="rest"&&P.idx>0){tone(660,.4)}
  paint();
}
function paint(){
  const s=P.steps[P.idx];$("pTime").textContent=fmt(P.left);
  const all=P.steps.reduce((a,x)=>a+x.dur,0),past=P.steps.slice(0,P.idx).reduce((a,x)=>a+x.dur,0)+(s.dur-P.left);
  $("pBar").style.width=(past/all*100)+"%";$("pLeft").textContent=`Falta ${fmt(all-past)}`;
  $("bPlay").textContent=P.ended?"Fechar":P.running?"Pausar":"Continuar";
}
function call(t){t=sw(t);const c=$("pCall");c.textContent=t;c.classList.remove("flash");void c.offsetWidth;c.classList.add("flash");speak(t);
  if(pFig)pFig.play(comboAnim(t),{loop:false,force:true,onend:()=>{if(P&&["round","sprint"].includes(P.steps[P.idx].k))pFig.play(P.steps[P.idx].k==="sprint"?comboAnim("Rajada!"):ANIM.base,{force:true})}})}
function loop(){
  if(!P)return;const now=performance.now(),dt=(now-P.last)/1000;P.last=now;
  if(P.running&&!P.ended){
    const s=P.steps[P.idx];P.left-=dt;
    if(s.calls&&P.left<=P.nextCall&&P.left>3){
      if(s.finish&&P.left<=s.finish){if(!P.saidFin){P.saidFin=true;call("Ritmo máximo!")}}
      else{let t;do{t=s.calls[Math.floor(Math.random()*s.calls.length)]}while(t===P.lastCall&&s.calls.length>1);P.lastCall=t;call(t)}
      P.nextCall=P.left-s.every;
    }
    if(!P.said10&&P.left<=10&&(s.k==="round"||s.k==="sprint")){P.said10=true;tone(1000,.12);tone(1000,.12,.18)}
    if(P.left<=3.05&&P.left>0&&s.k!=="round"&&s.k!=="sprint"&&Math.ceil(P.left)!==P.lastPip){P.lastPip=Math.ceil(P.left);pip()}
    if(P.left<=0){if(P.idx<P.steps.length-1){P.idx++;enter()}else{finish();return}}
  }
  paint();requestAnimationFrame(loop);
}
function finish(){bell();speak("Treino concluído. Bom trabalho!");store.prog[P.d.lv][P.d.n]={date:today(),min:Math.round(total(P.d)/60)};save();
  $("pTag").textContent="Treino concluído";$("pTitle").textContent="Bom trabalho, campeão";$("pSub").textContent="Dia "+P.d.n+" marcado como feito. Amanhã tem o próximo.";$("pTime").textContent="0:00";$("pCall").textContent="";$("pNext").textContent="";$("pBar").style.width="100%";
  P.running=false;P.ended=true;$("player").className="player";if(pFig)pFig.play(ANIM.pular,{force:true});paint();selHoje=null;selPlan=nextN();renderAll()}
function exit(){P=null;$("player").hidden=true;document.body.style.overflow="";if(pFig){pFig.stop();pFig=null}try{speechSynthesis.cancel()}catch(e){}try{lock&&lock.release()}catch(e){}renderHoje()}
$("bPlay").onclick=()=>{if(!P)return;if(P.ended){exit();return}P.running=!P.running;P.last=performance.now();if(pFig)pFig.setPaused(!P.running);if(P.running)wake();paint()};
$("bNext").onclick=()=>{if(!P||P.ended)return;if(P.idx<P.steps.length-1){P.idx++;enter()}else finish()};
$("bPrev").onclick=()=>{if(!P||P.ended)return;if(P.steps[P.idx].dur-P.left>3||P.idx===0){enter()}else{P.idx--;enter()}};
$("bExit").onclick=exit;
document.addEventListener("visibilitychange",()=>{if(P&&P.running&&document.visibilityState==="visible")wake()});

curTab=TABS.includes(location.hash.slice(1))?location.hash.slice(1):"hoje";
/* o cenário da academia: no fundo das abas e, escurecido, atrás do cronômetro */
$("fundoAc").innerHTML=cenaRua();$("pFundo").innerHTML=cenaRua().replace('class="atores"','class="vazio"');
renderAll();
window.RF={LEVELS,FOCI,GUIDE,DAY,ANIM,TECH,comboAnim};

/* ---------- instalar o app ---------- */
  if("serviceWorker" in navigator&&location.protocol.startsWith("http")){window.addEventListener("load",()=>{/* versão nova publicada: recarrega uma vez, sozinha */const tinha=!!navigator.serviceWorker.controller;let rec=false;navigator.serviceWorker.addEventListener("controllerchange",()=>{if(tinha&&!rec){rec=true;location.reload()}});navigator.serviceWorker.register("./sw.js").then(r=>r.update()).catch(()=>{})})}
  let dp=null;
  const sync=()=>{const b=document.getElementById("bInstall");if(b)b.hidden=!dp};
  window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();dp=e;sync()});
  window.addEventListener("appinstalled",()=>{dp=null;sync()});
  document.addEventListener("click",async e=>{if(e.target&&e.target.id==="bInstall"&&dp){dp.prompt();try{await dp.userChoice}catch(_){}dp=null;sync()}});
  const t=document.getElementById("cfgBody");if(t)new MutationObserver(sync).observe(t,{childList:true});
