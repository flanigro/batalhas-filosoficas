// node roda.js '<json opts>'  → imprime JSON agregado
// opts: {seeds:[a,b], v:{...variante}, injeta:{P,id}|null, niveis}
global.window=global;
const BF=require(__dirname+'/engine-var.js');
const o=JSON.parse(process.argv[2]);
const ag={lid6:0,lid6v:0,prxUsos:0,jogos:0,venc:[0,0,0],emp:0,rod:0,pts:[0,0,0],debs:0,ptsVenc:0,margem:0,pod:{},prx:{},lib:{n:0,prod:0},deb:{},baixa:{},baixaVence:{},prxVence:{},libVence:{n:0,v:0},cartaVirada:0};
for(let sd=o.seeds[0];sd<=o.seeds[1];sd++){
  const s=BF.newGame({seed:sd,mudo:true,niveis:o.niveis||['mestre','mestre','mestre'],humans:[false,false,false],v:o.v||{},injeta:o.injeta||null});
  // quem baixou o quê / usou o quê
  const quem={}, prxQuem={}, libQuem={};
  const pp=BF.playPhilosopher; 
  let k=0, lid=-2; while(!s.over&&k<6000){
    if(lid===-2&&s.round>=7){ const pts=s.players.map(p=>p.points), mx=Math.max(...pts); lid = mx>0&&pts.filter(x=>x===mx).length===1 ? pts.indexOf(mx) : -1; }
    const P=s.turn, antes=s.players[P].hand.slice(), ng=s.players[P].group.map(g=>g.id+(g.lib?'L':'')).join();
    BF.aiStep(s); k++;
    const depois=s.players[P].hand;
    antes.forEach(id=>{ if(depois.indexOf(id)<0){ const c=BF.C(id); if(c.tipo==='F'){ (quem[c.id]=quem[c.id]||new Set()).add(P); const g=s.players[P].group.find(x=>x.id===c.id); if(g&&g.lib) libQuem[P]=1; } else (prxQuem[c.id]=prxQuem[c.id]||new Set()).add(P);} });
  }
  ag.jogos++; ag.rod+=s.round; if(lid>=0){ag.lid6++; if(s.vencedor===lid)ag.lid6v++;} for(const id in s.est.prx) ag.prxUsos+=s.est.prx[id].n;
  if(s.vencedor<0) ag.emp++; else ag.venc[s.vencedor]++;
  s.players.forEach((p,i)=>{ag.pts[i]+=p.points; ag.debs+=p.won.length;});
  if(s.vencedor>=0){ const ps=s.players.map(p=>p.points).sort((a,b)=>b-a); ag.ptsVenc+=ps[0]; ag.margem+=ps[0]-ps[1]; }
  for(const id in s.est.pod){ const a=ag.pod[id]=ag.pod[id]||{g:0,t:0,n:0}; const e=s.est.pod[id]; a.g+=e.g;a.t+=e.t;a.n+=e.n; }
  for(const id in s.est.prx){ const a=ag.prx[id]=ag.prx[id]||{g:0,t:0,n:0}; const e=s.est.prx[id]; a.g+=e.g;a.t+=e.t;a.n+=e.n; }
  ag.lib.n+=s.est.lib.n; ag.lib.prod+=s.est.lib.prod;
  for(const id in s.est.deb) ag.deb[id]=(ag.deb[id]||0)+s.est.deb[id];
  for(const id in quem){ const b=ag.baixa[id]=ag.baixa[id]||{n:0,v:0}; quem[id].forEach(P=>{b.n++; if(s.vencedor===P)b.v++;}); }
  for(const id in prxQuem){ const b=ag.prxVence[id]=ag.prxVence[id]||{n:0,v:0}; prxQuem[id].forEach(P=>{b.n++; if(s.vencedor===P)b.v++;}); }
  for(const P in libQuem){ ag.libVence.n++; if(s.vencedor===+P) ag.libVence.v++; }
}
console.log(JSON.stringify(ag));
