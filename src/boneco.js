/* Boneco de traço: poses, animações e o motor que desenha. Não depende das telas. */
// ===== Boneco de traço: poses, animações e motor =====
const FIGCFG={hand:"D",style:"traco"};
const GLOVE_R={traco:7,neon:6};
const CUSTOM=new Set(["pixel","esboco"]);
// ---- pixel art: rasteriza a pose numa grade de 4x4 ----
const PX=4,PW=50,PH=53;
function segDist(px,py,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],L=dx*dx+dy*dy;let t=L?((px-a[0])*dx+(py-a[1])*dy)/L:0;t=Math.max(0,Math.min(1,t));const x=a[0]+t*dx-px,y=a[1]+t*dy-py;return Math.sqrt(x*x+y*y)}
function rasterize(shapes){const g=new Array(PW*PH).fill(null);
  shapes.forEach(sh=>{let x0,x1,y0,y1;if(sh.t==="c"){const r=sh.w/2;x0=Math.min(sh.a[0],sh.b[0])-r;x1=Math.max(sh.a[0],sh.b[0])+r;y0=Math.min(sh.a[1],sh.b[1])-r;y1=Math.max(sh.a[1],sh.b[1])+r}else if(sh.t==="o"){x0=sh.c[0]-sh.r;x1=sh.c[0]+sh.r;y0=sh.c[1]-sh.r;y1=sh.c[1]+sh.r}else{x0=sh.x;x1=sh.x+sh.w;y0=sh.y;y1=sh.y+sh.h}
    const cx0=Math.max(0,Math.floor(x0/PX)),cx1=Math.min(PW-1,Math.floor(x1/PX)),cy0=Math.max(0,Math.floor(y0/PX)),cy1=Math.min(PH-1,Math.floor(y1/PX));
    for(let y=cy0;y<=cy1;y++)for(let x=cx0;x<=cx1;x++){const px=(x+.5)*PX,py=(y+.5)*PX;let hit;
      if(sh.t==="c")hit=segDist(px,py,sh.a,sh.b)<=sh.w/2;else if(sh.t==="o")hit=Math.hypot(px-sh.c[0],py-sh.c[1])<=sh.r;else hit=px>=x0&&px<=x1&&py>=y0&&py<=y1;
      if(hit)g[y*PW+x]=sh.col}});
  const by={};for(let y=0;y<PH;y++){let x=0;while(x<PW){const c=g[y*PW+x];if(!c){x++;continue}let e=x;while(e+1<PW&&g[y*PW+e+1]===c)e++;(by[c]=by[c]||[]).push(`M${x*PX} ${y*PX}h${(e-x+1)*PX}v${PX}h-${(e-x+1)*PX}z`);x=e+1}}
  return Object.entries(by).map(([c,d])=>`<path d="${d.join("")}" fill="${c}" shape-rendering="crispEdges"/>`).join("")}
const PXC={sk:"#F0B27A",skr:"#C98B5A",top:"#F4F4F4",sh:"#2B4C9B",gl:"#E23B2E",glr:"#A82A21",boot:"#262626",hair:"#3B2414",eye:"#111111"};
function pixelShapes(p,view,front){const c=(a,b,w,col)=>({t:"c",a:p[a],b:p[b],w,col}),o=(k,r,col)=>({t:"o",c:p[k],r,col}),m=(a,b,t)=>[p[a][0]+(p[b][0]-p[a][0])*t,p[a][1]+(p[b][1]-p[a][1])*t];
  if(view==="top")return[c("rfh","rft",10,PXC.glr),c("lfh","lft",10,PXC.gl),c("c","d",4,"#7D8AA0")];
  const S=[c("rs","re",9,PXC.skr),c("re","rh",8,PXC.skr),o("rh",9,PXC.glr),c("rp","rk",12,PXC.skr),c("rk","ra",9,PXC.skr),c("ra","rt",8,PXC.boot),
   c("n","p",22,PXC.top),{t:"c",a:m("n","p",.78),b:p.p,w:20,col:PXC.sh},c("lp","lk",12,PXC.sk),c("lk","la",9,PXC.sk),c("la","lt",8,PXC.boot),c("n","h",7,PXC.sk),o("h",12,PXC.sk),
   {t:"r",x:p.h[0]-11,y:p.h[1]-13,w:22,h:6,col:PXC.hair}];
  if(front){S.push({t:"r",x:p.h[0]-6,y:p.h[1]-1,w:3,h:3,col:PXC.eye},{t:"r",x:p.h[0]+3,y:p.h[1]-1,w:3,h:3,col:PXC.eye})}
  else{const dir=p.lh[0]>=p.h[0]-4?1:-1;S.push({t:"r",x:p.h[0]+4*dir-1.5,y:p.h[1]-1,w:3,h:3,col:PXC.eye})}
  S.push(c("ls","le",9,PXC.sk),c("le","lh",8,PXC.sk),o("lh",9,PXC.gl));return S}
// ---- esboço: traço de lápis tremido ----
const hsh=n=>{const x=Math.sin(n*127.1)*43758.5453;return x-Math.floor(x)};
const jt=(pt,k,amp)=>[pt[0]+(hsh(k)-.5)*amp,pt[1]+(hsh(k+7.3)-.5)*amp];
function sketchSVG(p,view){const k=Math.floor(performance.now()/140),F=v=>v.toFixed(1);let s="";
  BONES[view].forEach(([a,b,cl],i)=>{if(!p[a]||!p[b])return;let d="";for(let r=0;r<2;r++){const A=jt(p[a],k*3.1+i*11+r*5,3),B=jt(p[b],k*2.7+i*13+r*7,3),M=jt([(p[a][0]+p[b][0])/2,(p[a][1]+p[b][1])/2],k*1.9+i*17+r*3,2.8);d+=`M${F(A[0])} ${F(A[1])}Q${F(M[0])} ${F(M[1])} ${F(B[0])} ${F(B[1])}`}
    s+=`<path d="${d}" class="sk ${cl.split(" ")[0]}${view==="top"?" skf":""}"/>`});
  if(view==="body"){for(let r=0;r<2;r++){const c=jt(p.h,k*2+r*9,2.4);s+=`<ellipse cx="${F(c[0])}" cy="${F(c[1])}" rx="${F(11.5+r)}" ry="${F(12.5-r)}" class="sk skh"/>`}
    ["rh","lh"].forEach((g,i)=>{const c=jt(p[g],k*2.3+i*5,2);s+=`<circle cx="${F(c[0])}" cy="${F(c[1])}" r="7.5" class="skg ${g[0]}"/>`})}
  return s}
const UK=["h","n","ls","rs","le","re","lh","rh"];
const mv=(p,keys,dx,dy)=>{const q={...p};keys.forEach(k=>{q[k]=[p[k][0]+dx,p[k][1]+dy]});return q};
const md=(p,o)=>({...p,...o});
const bend=(p,d)=>{const q=mv(p,[...UK,"p","lp","rp"],0,d);q.lk=[p.lk[0]+d*.5,p.lk[1]+d*.45];q.rk=[p.rk[0]-d*.35,p.rk[1]+d*.45];return q};
const all=(p,dx,dy)=>mv(p,Object.keys(p),dx,dy);
const swapLR=p=>{const q={...p};Object.keys(p).forEach(k=>{const o="r"+k.slice(1);if(k[0]==="l"&&p[o]){q[k]=p[o];q[o]=p[k]}});return q};
const rot=(p,c,deg,keys)=>{const a=deg*Math.PI/180,q={...p};(keys||Object.keys(p)).forEach(k=>{const x=p[k][0]-c[0],y=p[k][1]-c[1];q[k]=[c[0]+x*Math.cos(a)-y*Math.sin(a),c[1]+x*Math.sin(a)+y*Math.cos(a)]});return q};

// Perfil, guarda ortodoxa, olhando para a direita. l = lado da frente (esquerdo), r = lado de trás.
const S={h:[100,38],n:[98,56],ls:[104,64],rs:[93,63],le:[112,93],lh:[122,62],re:[98,93],rh:[110,63],p:[95,122],lp:[100,122],rp:[90,122],lk:[112,160],la:[120,196],lt:[134,198],rk:[80,160],ra:[68,193],rt:[80,198]};
const J=md(S,{ls:[108,64],le:[138,63],lh:[170,62],h:[102,38]});
const X=md(S,{n:[100,56],h:[103,39],rs:[108,64],ls:[101,64],re:[138,64],rh:[170,63],le:[110,93],lh:[118,60],rp:[93,122],rk:[87,160],ra:[73,190],rt:[85,198]});
const H3=md(S,{h:[101,38],ls:[106,63],rs:[90,62],le:[128,63],lh:[141,61]});
const H4=md(S,{n:[100,56],h:[103,39],rs:[106,63],ls:[101,64],re:[128,63],rh:[141,61],le:[110,93],lh:[118,60],rp:[93,122],rk:[87,160],ra:[73,190],rt:[85,198]});
const U5a=md(bend(S,8),{le:[108,102],lh:[120,110]});
const U5=md(bend(S,2),{le:[120,86],lh:[133,52]});
const U6a=md(bend(S,8),{re:[96,102],rh:[108,110]});
const U6=md(bend(S,2),{rs:[104,66],le:[110,95],lh:[118,62],re:[118,88],rh:[131,54],rp:[93,122],rk:[87,160],ra:[73,190],rt:[85,198]});
const bodyV=(pose,hk,ek)=>{const q=bend(pose,16);q[hk]=[pose[hk][0]-6,104];q[ek]=[pose[ek][0]-4,97];q.h=[q.h[0]+4,q.h[1]+2];return q};
const STRIKE={1:J,2:X,3:H3,4:H4,5:U5,6:U6};
const BODY={1:bodyV(J,"lh","le"),2:bodyV(X,"rh","re"),3:bodyV(H3,"lh","le"),4:bodyV(H4,"rh","re"),5:U5,6:U6};
const SLo=bend(mv(S,UK,9,0),10);
const PDs=bend(mv(S,UK,10,0),28);
const PB=md(mv(S,UK,-14,2),{rk:[76,163]});
const BL=md(S,{rh:[101,40],re:[100,76],lh:[117,48],le:[113,80]});
const PR=md(S,{rh:[130,72],re:[110,90]});
const SR=md(mv(S,["h","n","rs","rh","re"],-6,0),{ls:[102,58],le:[114,88],lh:[103,106],h:[93,40]});
const FT=md(S,{ls:[107,64],le:[128,67],lh:[146,62],h:[102,38]});
const CH=md(H3,{rp:[97,122],rk:[102,160],ra:[106,195],rt:[96,201]});
const CC=bend(md(X,{h:[107,44],n:[102,60]}),6);
// Frente (o lado da frente do lutador aparece à direita de quem olha)
const F={h:[100,36],n:[100,54],ls:[118,62],rs:[82,62],le:[116,84],lh:[108,48],re:[84,84],rh:[92,48],p:[100,122],lp:[110,122],rp:[90,122],lk:[118,160],la:[124,196],lt:[132,198],rk:[82,160],ra:[76,196],rt:[68,198]};
const slipF=dx=>bend(mv(F,UK,dx,0),8);
const PDf=dx=>bend(mv(F,UK,dx,0),30);
const BLF=md(F,{lh:[113,30],rh:[87,30],le:[121,64],re:[79,64]});
// Em pé, neutro
const N={h:[100,28],n:[100,46],ls:[103,54],rs:[97,54],le:[105,84],lh:[106,112],re:[99,84],rh:[100,112],p:[100,114],lp:[102,114],rp:[98,114],lk:[104,155],la:[103,195],lt:[117,198],rk:[99,155],ra:[98,195],rt:[112,198]};
const Q={h:[118,74],n:[110,90],ls:[112,96],rs:[108,96],le:[136,98],lh:[164,98],re:[132,100],rh:[160,100],p:[78,146],lp:[80,146],rp:[76,146],lk:[118,154],la:[103,195],lt:[117,198],rk:[114,156],ra:[98,195],rt:[112,198]};
const QB=md(Q,{h:[134,98],n:[120,110],ls:[121,114],rs:[117,114],le:[128,150],lh:[132,198],re:[125,151],rh:[129,198]});
const NF={h:[100,30],n:[100,48],ls:[114,56],rs:[86,56],le:[118,84],lh:[120,110],re:[82,84],rh:[80,110],p:[100,114],lp:[108,114],rp:[92,114],lk:[110,156],la:[110,196],lt:[118,198],rk:[90,156],ra:[90,196],rt:[82,198]};
const JJ=md(NF,{le:[134,36],lh:[142,10],re:[66,36],rh:[58,10],lk:[122,154],la:[134,194],lt:[142,198],rk:[78,154],ra:[66,194],rt:[58,198]});
const AF={h:[96,52],n:[96,70],ls:[99,78],rs:[93,78],le:[100,106],lh:[100,132],re:[94,106],rh:[94,132],p:[94,140],lp:[96,140],rp:[92,140],lk:[130,146],la:[130,195],lt:[144,198],rk:[72,178],ra:[48,186],rt:[40,198]};
// Chão
const HP={h:[156,140],n:[146,146],ls:[140,150],rs:[138,150],le:[140,174],lh:[140,198],re:[138,174],rh:[138,198],p:[92,162],lp:[92,162],rp:[90,162],lk:[64,170],la:[38,178],lt:[32,198],rk:[64,171],ra:[38,179],rt:[32,198]};
const LP={h:[154,174],n:[146,178],ls:[140,180],rs:[138,180],le:[118,184],lh:[140,198],re:[116,185],rh:[138,198],p:[92,184],lp:[92,184],rp:[90,184],lk:[64,187],la:[38,190],lt:[32,198],rk:[64,188],ra:[38,191],rt:[32,198]};
const HPd=md(HP,{lh:[130,198],rh:[130,198],le:[137,174],re:[135,174]});
const LPd=md(LP,{lh:[130,198],rh:[130,198],le:[118,190],re:[116,190]});
const HPx=md(HP,{h:[158,122],n:[148,128],ls:[142,132],rs:[140,132],le:[143,157],lh:[145,182],re:[141,157],rh:[143,182],p:[94,152],lp:[94,152],rp:[92,152]});
const FP={h:[152,162],n:[144,168],ls:[138,172],rs:[136,172],le:[138,196],lh:[160,196],re:[136,196],rh:[158,196],p:[90,180],lp:[90,180],rp:[88,180],lk:[64,185],la:[38,189],lt:[32,198],rk:[64,186],ra:[38,190],rt:[32,198]};
const LY={h:[38,184],n:[50,186],ls:[54,186],rs:[54,186],le:[36,186],lh:[18,186],re:[36,187],rh:[18,187],p:[102,190],lp:[102,190],rp:[102,190],lk:[134,191],la:[166,192],lt:[170,182],rk:[134,192],ra:[166,193],rt:[170,183]};
const VU={h:[74,136],n:[82,150],ls:[84,154],rs:[84,154],le:[110,138],lh:[136,122],re:[110,139],rh:[136,123],p:[102,188],lp:[102,188],rp:[102,188],lk:[122,152],la:[142,118],lt:[150,110],rk:[122,153],ra:[142,119],rt:[150,111]};
// Vista de cima (pés). O adversário fica à direita.
const T={lfh:[112,98],lft:[130,94],rfh:[74,118],rft:[86,105],c:[96,106],d:[124,103]};
const OPP=[176,100];

const idle=(p,d=3,ms=480)=>[[p,0,0],[bend(p,d),ms,0]];
const ANIM={
 base:{view:"body",frames:idle(S)},
 guarda:{view:"body",front:true,frames:idle(F,2,600)},
 pular:{view:"body",frames:[[S,0,0],[all(S,0,-7),160,0],[S,160,40]]},
 respira:{view:"body",frames:[[N,0,0],[md(N,{ls:[103,52],rs:[97,52],h:[100,27]}),1400,300]]},
 jab:{view:"body",frames:[[S,0,500],[J,170,140],[S,220,500]],trail:"M124 62 L168 62"},
 direto:{view:"body",frames:[[S,0,500],[X,200,160],[S,240,500]],trail:"M112 63 L168 63"},
 hook3:{view:"body",frames:[[S,0,500],[md(S,{le:[120,74],lh:[132,64]}),120,0],[H3,140,160],[S,240,500]],trail:"M120 66 Q138 92 142 62"},
 hook4:{view:"body",frames:[[S,0,500],[H4,220,160],[S,240,500]],trail:"M110 64 Q134 96 142 62"},
 up5:{view:"body",frames:[[S,0,400],[U5a,200,60],[U5,170,180],[S,240,500]],trail:"M120 110 Q124 80 133 52"},
 up6:{view:"body",frames:[[S,0,400],[U6a,200,60],[U6,180,180],[S,240,500]],trail:"M108 110 Q118 82 131 54"},
 corpo:{view:"body",frames:[[S,0,500],[bend(S,16),220,40],[BODY[1],170,160],[bend(S,16),180,60],[BODY[2],190,160],[S,300,500]]},
 esquiva:{view:"body",front:true,frames:[[F,0,500],[slipF(-17),220,300],[F,220,400],[slipF(17),220,300],[F,220,400]],trail:"M84 52 L100 38 L116 52"},
 pendulo:{view:"body",front:true,frames:[[F,0,400],[PDf(-14),320,0],[PDf(14),420,0],[F,320,500]],trail:"M86 46 Q100 120 114 46"},
 pullback:{view:"body",frames:[[S,0,500],[PB,220,220],[X,200,160],[S,240,500]]},
 bloqueio:{view:"body",front:true,frames:[[F,0,500],[BLF,180,600],[F,240,500]]},
 parry:{view:"body",frames:[[S,0,500],[PR,140,100],[S,160,120],[X,190,160],[S,240,500]],trail:"M110 63 L130 72"},
 shoulder:{view:"body",frames:[[S,0,400],[SR,260,400],[X,200,160],[S,260,500]]},
 checkhook:{view:"body",frames:[[S,0,500],[H3,160,0],[CH,260,300],[S,320,500]],trail:"M120 66 Q138 92 142 62"},
 finta:{view:"body",frames:[[S,0,500],[FT,130,60],[S,120,80],[X,190,160],[S,240,500]]},
 crosscounter:{view:"body",frames:[[S,0,500],[CC,230,220],[S,260,500]]},
 stepjab:{view:"body",frames:[[S,0,400],[md(mv(J,UK,8,0),{lk:[124,160],la:[133,196],lt:[147,198]}),200,80],[all(S,13,0),200,60],[all(J,13,0),170,120],[S,420,500]]},
 socos:{view:"body",frames:[[S,0,0],[J,110,20],[S,110,0],[X,120,20],[S,120,0]]},
 passofrente:{view:"body",frames:[[S,0,400],[md(mv(S,[...UK,"p","lp","rp"],6,0),{lk:[126,160],la:[135,196],lt:[149,198]}),220,0],[all(S,15,0),220,400],[md(mv(all(S,15,0),[...UK,"p","lp","rp"],-6,0),{rk:[80,160],ra:[68,193],rt:[80,198]}),220,0],[S,220,400]]},
 passoatras:{view:"body",frames:[[S,0,400],[md(mv(S,[...UK,"p","lp","rp"],-6,0),{rk:[66,160],ra:[53,193],rt:[65,198]}),220,0],[all(S,-15,0),220,400],[S,440,400]]},
 lateral:{view:"body",front:true,frames:[[F,0,400],[md(mv(F,[...UK,"p","lp","rp"],6,0),{lk:[132,160],la:[139,196],lt:[147,198]}),220,0],[all(F,15,0),220,400],[md(mv(all(F,15,0),[...UK,"p","lp","rp"],-6,0),{rk:[82,160],ra:[76,196],rt:[68,198]}),220,0],[F,220,400]]},
 troca:{view:"body",frames:[[S,0,500],[swapLR(S),300,600],[S,300,500]]},
 pivo:{view:"top",frames:[[T,0,500],[rot(T,T.lft,-45),300,0],[rot(T,T.lft,-90),300,600],[T,400,400]]},
 circular:{view:"top",frames:[[T,0,300],[rot(T,OPP,-22),500,200],[rot(T,OPP,-44),500,400],[T,700,300]]},
 angulo:{view:"top",frames:[[T,0,500],[rot(mv(T,Object.keys(T),6,-34),[96,72],28),380,600],[T,420,400]]},
 lstep:{view:"top",frames:[[T,0,500],[md(rot(T,T.rfh,-80,["c","d"]),{lfh:[82,88],lft:[92,74]}),380,600],[T,400,400]]},
 agach:{view:"body",frames:[[N,0,300],[Q,600,300],[N,600,300]]},
 agachsalto:{view:"body",frames:[[N,0,200],[Q,380,80],[all(N,0,-15),220,60],[Q,260,120],[N,380,300]]},
 polichinelo:{view:"body",frames:[[NF,0,80],[JJ,260,80],[NF,260,80]]},
 afundo:{view:"body",frames:[[N,0,300],[AF,600,300],[N,600,300]]},
 flexao:{view:"body",frames:[[HP,0,300],[LP,600,150],[HP,600,300]]},
 diamante:{view:"body",frames:[[HPd,0,300],[LPd,600,150],[HPd,600,300]]},
 explosiva:{view:"body",frames:[[HP,0,200],[LP,500,100],[HPx,220,60],[HP,260,300]]},
 prancha:{view:"body",frames:[[FP,0,0],[md(FP,{p:[90,177],lp:[90,177],rp:[88,177]}),1400,200]]},
 toque:{view:"body",frames:[[HP,0,200],[md(HP,{le:[152,164],lh:[140,150]}),280,200],[HP,280,200],[md(HP,{re:[150,165],rh:[138,151]}),280,200],[HP,280,200]]},
 escalador:{view:"body",frames:[[HP,0,0],[md(HP,{lk:[118,176],la:[100,188],lt:[94,198]}),220,40],[HP,200,0],[md(HP,{rk:[118,177],ra:[100,189],rt:[94,198]}),220,40],[HP,200,0]]},
 canivete:{view:"body",frames:[[LY,0,300],[VU,520,200],[LY,560,300]]},
 burpee:{view:"body",frames:[[N,0,200],[QB,380,60],[HP,260,60],[LP,320,60],[HP,320,60],[QB,300,60],[all(N,0,-15),300,80],[N,260,300]]}
};
// Combinações: transforma "1-2, esquiva, 3" em uma sequência de poses
function comboAnim(call){
  const fr=[[S,0,120]];const L=String(call||"").toLowerCase();
  const push=(p,ms=170,h=40)=>{fr.push([p,ms,h])};
  if(/burpee/.test(L)){ANIM.burpee.frames.slice(1).forEach(f=>fr.push([f[0],f[1]*.8,f[2]]));fr.push([S,260,200])}
  else if(/rajada|socos r/.test(L)&&!/\d/.test(L)){for(let i=0;i<3;i++){push(J,100,10);push(S,90,0);push(X,100,10);push(S,90,0)}}
  L.split(",").forEach(seg=>{seg=seg.trim();const body=/corpo|fígado/.test(seg);
    if(/esquiva/.test(seg)){const n=(seg.match(/esquiva/g)||[]).length;for(let i=0;i<n;i++){push(SLo,180,80);push(S,160,0)}}
    if(/pêndulo/.test(seg)){const n=(seg.match(/pêndulo/g)||[]).length;for(let i=0;i<n;i++){push(PDs,260,0);push(S,240,0)}}
    if(/pull back|recua/.test(seg)){push(PB,200,120);push(S,160,0)}
    if(/parry|aparou/.test(seg)){push(PR,130,60);push(S,130,0)}
    if(/bloqueia/.test(seg)){push(BL,160,200);push(S,160,0)}
    if(/shoulder roll/.test(seg)){push(SR,220,220);push(S,180,0)}
    if(/check hook/.test(seg)){push(H3,150,0);push(CH,240,200);push(S,260,0)}
    if(/finta/.test(seg)){push(FT,120,60);push(S,110,0)}
    if(/agacha/.test(seg)){push(bend(S,26),260,80);push(S,220,0)}
    if(/saltita|pernas/.test(seg)){for(let i=0;i<3;i++){push(all(S,0,-7),140,0);push(S,140,0)}}
    if(/pivô|l-step|ângulo|circula|passo lateral|sai pra|troca de base/.test(seg)&&!/\d/.test(seg)){push(all(S,10,0),220,100);push(S,240,0)}
    const m=seg.match(/\d(?:-\d)*/g);if(m)m.forEach(g=>g.split("-").forEach((d,i,arr)=>{const st=(body&&i===0)?BODY[d]:STRIKE[d];if(!st)return;push(st,d==="1"?150:180,50);if(i<arr.length-1)push(md(S,{h:st.h}),120,0)}));
    if(m)push(S,170,0);
  });
  fr.push([S,200,300]);
  return {view:"body",frames:fr};
}

const BONES={body:[["rs","re","r"],["re","rh","r"],["rp","rk","r"],["rk","ra","r"],["ra","rt","r"],["n","p","t tor"],["ls","rs","t"],["lp","rp","t"],["n","h","t"],["lp","lk","l"],["lk","la","l"],["la","lt","l"],["ls","le","l"],["le","lh","l"]],
 top:[["rfh","rft","r"],["lfh","lft","l"],["c","d","t"]]};
const NS="http://www.w3.org/2000/svg";
let figUid=0;const FIGS=new Set();
const lerp=(a,b,t)=>{const o={};for(const k in a){const bb=b[k]||a[k];o[k]=[a[k][0]+(bb[0]-a[k][0])*t,a[k][1]+(bb[1]-a[k][1])*t]}return o};
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const REDUCED=(()=>{try{return matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){return false}})();
class Fig{
  constructor(host,opt={}){
    this.opt=opt;this.id="f"+(++figUid);this.speed=1;this.paused=false;this.style=opt.style||FIGCFG.style;
    const svg=document.createElementNS(NS,"svg");svg.setAttribute("viewBox","0 0 200 210");svg.setAttribute("class","fig fs-"+this.style+(opt.cls?" "+opt.cls:""));svg.setAttribute("role","img");
    if(opt.label)svg.setAttribute("aria-label",opt.label);
    svg.innerHTML=`<defs><marker id="${this.id}a" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="fhead"/></marker></defs><line class="fground" x1="10" y1="200" x2="190" y2="200"/><path class="ftrail"/><g class="fmarks"></g><g class="fghost"></g><g class="fmain"></g>`;
    host.appendChild(svg);this.svg=svg;this.view=null;
    if(opt.anim)this.play(opt.anim,opt);
  }
  build(view){
    this.view=view;const custom=CUSTOM.has(this.style);const mk=(g,ghost)=>{g.innerHTML="";const els={};if(custom){els.__g=g;return els}
      BONES[view].forEach(([a,b,c])=>{const l=document.createElementNS(NS,"line");l.setAttribute("data-b",a+b);l.setAttribute("class","b "+c+(view==="top"?" foot":""));if(view==="top"&&a==="c"){l.setAttribute("marker-end",`url(#${this.id}a)`);l.setAttribute("class","b t arrow")}g.appendChild(l);els[a+b]=l});
      if(view==="body"&&this.style==="lutador"){["r","l"].forEach(c=>{const l=document.createElementNS(NS,"line");l.setAttribute("class","sh "+c);g.insertBefore(l,g.querySelector(c==="r"?'[data-b="ntp"],[data-b="np"]':'[data-b="lplk"]'));els["sh"+c]=l})}
      if(view==="body"){const h=document.createElementNS(NS,"circle");h.setAttribute("r","12");h.setAttribute("class","hd");g.appendChild(h);els.head=h;
        ["rh","lh"].forEach(k=>{const c=document.createElementNS(NS,"circle");c.setAttribute("r",String(GLOVE_R[this.style]||7));c.setAttribute("class","gl "+k[0]);g.appendChild(c);els["g"+k]=c})}
      return els};
    this.els=mk(this.svg.querySelector(".fmain"));
    this.gels=this.opt.ghost&&!custom?mk(this.svg.querySelector(".fghost")):null;if(custom)this.svg.querySelector(".fghost").innerHTML="";
    const marks=this.svg.querySelector(".fmarks");marks.innerHTML=view==="top"?`<circle cx="${OPP[0]}" cy="${OPP[1]}" r="11" class="opp"/><text x="${OPP[0]}" y="${OPP[1]+28}" class="opplbl" text-anchor="middle">adversário</text>`:"";
    this.svg.querySelector(".fground").style.display=view==="top"?"none":"";

  }
  applyTf(anim){
    const C=FIGCFG.hand==="C";let main="",marks="";
    if(this.view==="top"){marks="translate(100 105) scale(1.5) translate(-124 -106)";main=marks+(C?" translate(0 212) scale(1 -1)":"")}
    else if(anim&&anim.front&&C)main="translate(200 0) scale(-1 1)";
    [["fmain",main],["fghost",main],["ftrail",main],["fmarks",marks]].forEach(([c,t])=>{const g=this.svg.querySelector("."+c);if(t)g.setAttribute("transform",t);else g.removeAttribute("transform")});
  }
  draw(p,els){
    if(els.__g){els.__g.innerHTML=this.style==="pixel"?rasterize(pixelShapes(p,this.view,this.anim&&this.anim.front)):sketchSVG(p,this.view);return}
    BONES[this.view].forEach(([a,b])=>{const l=els[a+b];if(!p[a]||!p[b])return;l.setAttribute("x1",p[a][0].toFixed(1));l.setAttribute("y1",p[a][1].toFixed(1));l.setAttribute("x2",p[b][0].toFixed(1));l.setAttribute("y2",p[b][1].toFixed(1))});
    if(els.shl){[["l","lp","lk"],["r","rp","rk"]].forEach(([c,a,b])=>{const e=els["sh"+c];e.setAttribute("x1",p[a][0].toFixed(1));e.setAttribute("y1",(p[a][1]-6).toFixed(1));e.setAttribute("x2",(p[a][0]+(p[b][0]-p[a][0])*.42).toFixed(1));e.setAttribute("y2",(p[a][1]+(p[b][1]-p[a][1])*.42).toFixed(1))})}
    if(this.view==="body"){els.head.setAttribute("cx",p.h[0].toFixed(1));els.head.setAttribute("cy",p.h[1].toFixed(1));
      ["lh","rh"].forEach(k=>{els["g"+k].setAttribute("cx",p[k][0].toFixed(1));els["g"+k].setAttribute("cy",p[k][1].toFixed(1))})}
  }
  play(anim,o={}){
    if(!anim)return;this.anim=anim;this.loop=o.loop!==false;this.onend=o.onend||null;this.t0=performance.now();this.pausedAt=null;
    if(this.view!==anim.view)this.build(anim.view);this.applyTf(anim);
    const tr=this.svg.querySelector(".ftrail");tr.setAttribute("d",anim.trail||"");
    const fr=anim.frames,segs=[];const n=fr.length;
    for(let i=0;i<(this.loop?n:n-1);i++){const a=fr[i][0],nx=fr[(i+1)%n];segs.push({a,b:nx[0],dur:Math.max(1,nx[1]),hold:nx[2]||0})}
    if(this.loop&&fr[0][2])segs[segs.length-1].hold+=0;
    this.segs=segs;this.total=segs.reduce((s,x)=>s+x.dur+x.hold,0)+(fr[0][2]||0);this.lead=fr[0][2]||0;
    this.cur=fr[0][0];this.gpose=null;this.draw(this.cur,this.els);if(this.gels)this.draw(this.cur,this.gels);
    if(REDUCED&&!o.force){const k=anim.key??Math.min(1,n-1);this.cur=fr[k][0];this.draw(this.cur,this.els);if(this.gels)this.draw(this.cur,this.gels);FIGS.delete(this);if(!this.loop&&this.onend)setTimeout(this.onend,600);return}
    FIGS.add(this);kick();
  }
  pose(at){
    let t=at;if(t<this.lead)return this.segs[0].a;t-=this.lead;
    for(const s of this.segs){if(t<s.dur)return lerp(s.a,s.b,ease(t/s.dur));t-=s.dur;if(t<s.hold)return s.b;t-=s.hold}
    return this.segs[this.segs.length-1].b;
  }
  tick(now){
    if(this.paused)return;
    let el=(now-this.t0)*this.speed;
    if(!this.loop&&el>=this.total){this.cur=this.pose(this.total);this.draw(this.cur,this.els);FIGS.delete(this);const f=this.onend;this.onend=null;if(f)f();return}
    if(this.loop)el=el%this.total;
    this.cur=this.pose(el);this.draw(this.cur,this.els);
    if(this.gels){this.gpose=this.gpose?lerp(this.gpose,this.cur,.18):this.cur;this.draw(this.gpose,this.gels)}
  }
  setPaused(v){if(v===this.paused)return;const now=performance.now();if(v){this.pausedAt=now}else if(this.pausedAt){this.t0+=(now-this.pausedAt)/1;this.pausedAt=null}this.paused=v;if(!v){FIGS.add(this);kick()}}
  setSpeed(s){const now=performance.now();const el=(now-this.t0)*this.speed;this.speed=s;this.t0=now-el/s}
  showStatic(anim){this.anim=anim;if(this.view!==anim.view)this.build(anim.view);this.applyTf(anim);this.svg.querySelector(".ftrail").setAttribute("d",anim.trail||"");const k=anim.key??Math.min(1,anim.frames.length-1);this.draw(anim.frames[k][0],this.els);if(this.gels)this.draw(anim.frames[k][0],this.gels);FIGS.delete(this)}
  stop(){FIGS.delete(this)}
}
let raf=0;function kick(){if(!raf)raf=requestAnimationFrame(loopFigs)}
function loopFigs(now){raf=0;FIGS.forEach(f=>{if(f.svg.isConnected)f.tick(now);else FIGS.delete(f)});if(FIGS.size)kick()}

export { FIGCFG, Fig, ANIM, comboAnim, S, md, mv, all, bend, rot, swapLR, UK };
