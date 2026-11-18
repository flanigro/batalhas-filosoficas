/* Batalhas Filosóficas — coreografia (rodada visual 3: a mesa é 3D)
 *
 * COMO FUNCIONA
 * O motor (engine.js) empilha eventos em S.fx. A interface (ui.js) lê a fila e, para cada evento,
 * chama uma CENA daqui:  await BFX.cena('entrada', evento).
 * Cada cena é um bloco pequeno e independente, registrado com BFX.def(nome, async function(ev){…}),
 * montado só com as PEÇAS abaixo (voar, tremer, poeira, estouro, carimbo, chuva, coro…).
 * Uma cena nunca mexe no estado do jogo: só lê o evento e o contexto (BFX.ctx, fornecido por ui.js).
 *
 * PARA ACRESCENTAR UM EFEITO
 * 1. Falácia nova:   BFX.def('falacia:<id da carta>', async function(ev){ … });
 *    Copie 'falacia:espantalho'. Sem bloco próprio, a carta usa 'falacia:_padrao'.
 * 2. Outra cena:     BFX.def('minhaCena', …) e uma linha em tocar() de ui.js.
 * 3. Textos:         INTERJ (interjeições por tom), TOM (tom de cada filósofo), CORO (falas do coro).
 *
 * 4. Movimento na mesa: use as peças de M3D (mesa3d.js): M3D.figura, arco, andar, cairLivro, derrubar,
 *    livroVoa, papiro, espantalho, chuva, foco… Posições são pontos da cena (M3D.V3); M3D.tela(ponto)
 *    devolve o lugar na janela, para pôr um efeito HTML (pergaminho, selo, poeira) em cima.
 *
 * REGRAS (ver também o comentário no topo do CSS)
 * - Toda duração passa por T(ms): "Ritmo: rápido" divide por 2; movimento reduzido corta para ~0.
 * - Nada encosta num filósofo. O alvo de um golpe retórico é torre, espantalho ou lápide.
 * - Uma coisa grande por vez; o coro pode reagir em paralelo.
 */
(function(){
'use strict';
var X={veloz:false,ctx:null}, reg={};
var RM=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches);
function M3(){return window.M3D&&M3D.pronto?M3D:null;}
var CURVA={saida:'cubic-bezier(.16,1,.3,1)',tranco:'cubic-bezier(.3,1.6,.5,1)',queda:'cubic-bezier(.6,0,.9,.3)'};

// ---------- textos (provisórios; a lista completa fica para a próxima rodada) ----------
var TOM={contido:['kant','socrates','arendt','hegel','schopenhauer'],escrachado:['diogenes','nietzsche','erasmo','maquiavel','rousseau']};
var INTERJ={
  contido:['Ergo!','Objeção!','Distinguo!','Nego a premissa.','Quod erat demonstrandum.'],
  medio:['Eureka!','Vejamos!','Ora, ora!','Ponto para mim!'],
  escrachado:['Ha!','Ora essa!','Bah!','Tolice!','Essa é boa!']
};
var CORO={
  entrada:['Hmmm…','Atenção, atenção…','Lá vem argumento.'],
  lidera:['Oooh!','Tomou a frente!'],
  falacia:['Uuuh! Falácia!','Non sequitur!','Isso não vale!'],
  espantalho:['Uuuh! Ninguém disse isso!','Bateu no espantalho!'],
  vitoria:['Bravo!','Evoé!','Louros ao vencedor!'],
  dupla:['Dupla clássica!']
};
function tomDe(id){return TOM.contido.indexOf(id)>=0?'contido':TOM.escrachado.indexOf(id)>=0?'escrachado':'medio';}
function sorteia(a){return a[Math.floor(Math.random()*a.length)];}

// ---------- peças ----------
function T(ms){return RM?Math.min(ms,40):X.veloz?ms*.5:ms;}
function dorme(ms){return new Promise(function(r){setTimeout(r,T(ms));});}
function camada(){return document.getElementById('fx');}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function cria(cls,html,css){var e=document.createElement('div');e.className=cls;if(html)e.innerHTML=html;if(css)e.style.cssText=css;camada().appendChild(e);return e;}
function anim(el,quadros,o){
  o=o||{};
  var a=el.animate(quadros,{duration:Math.max(1,T(o.d||520)),delay:T(o.delay||0),easing:o.e||CURVA.saida,fill:o.fill||'both'});
  return new Promise(function(r){a.onfinish=r;a.oncancel=r;});
}
function caixa(el){var r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height,t:r.top,b:r.bottom,l:r.left,r:r.right};}
function centroMesa(){var m=X.ctx&&X.ctx.mesa();return m?caixa(m):{x:innerWidth/2,y:innerHeight/2,w:innerWidth,h:innerHeight,t:0,b:innerHeight,l:0,r:innerWidth};}

// tremor curto: a câmera balança de leve
function tremer(forca){
  var m=M3(); if(!m||RM)return Promise.resolve();
  return m.tremer(forca||3);
}
// poeira de giz: n nuvenzinhas que se abrem e somem
function poeira(x,y,n){
  for(var i=0;i<(n||8);i++)(function(i){
    var p=cria('po','', 'left:'+x+'px;top:'+y+'px'), ang=Math.PI*(1+i/((n||8)-1)), d=26+Math.random()*30;
    anim(p,[{transform:'translate(-50%,-50%) scale(.4)',opacity:.95},{transform:'translate(calc(-50% + '+(Math.cos(ang)*d).toFixed(0)+'px),calc(-50% + '+(Math.sin(ang)*d*.45-6).toFixed(0)+'px)) scale(1.9)',opacity:0}],{d:520+Math.random()*200}).then(function(){p.remove();});
  })(i);
}
// interjeição numa tira de pergaminho que se desenrola; o tom muda só o corpo da letra
function estouro(texto,x,y,tom){
  x=Math.max(90,Math.min(innerWidth-90,x)); y=Math.max(40,y);
  var e=cria('estouro '+(tom||'medio'),'<span>'+esc(texto)+'</span>','left:'+x+'px;top:'+y+'px'), b='translate(-50%,-50%) ';
  return anim(e,[{transform:b+'scaleX(.08)',opacity:0},{transform:b+'scaleX(1)',opacity:1,offset:.2},{transform:b+'scaleX(1)',opacity:1,offset:.84},{transform:b+'translateY(-6px)',opacity:0}],
    {d:1800,e:'ease-out'}).then(function(){e.remove();});
}
// selo que assenta e fica um instante
function carimbo(texto,x,y){
  var e=cria('carimbo',esc(texto),'left:'+x+'px;top:'+y+'px'), b='translate(-50%,-50%) rotate(-6deg) ';
  return anim(e,[{transform:b+'scale(1.5)',opacity:0},{transform:b+'scale(.97)',opacity:1,offset:.16},{transform:b+'scale(1)',opacity:1,offset:.24},{transform:b+'scale(1)',opacity:1,offset:.84},{transform:b+'scale(1)',opacity:0}],{d:1900,e:'ease-out'}).then(function(){e.remove();});
}
// um livro em arco de A até B; resolve ao chegar
function livroVoa(de,para,cor,o){
  o=o||{};
  var v=cria('voa','','--pc:'+cor), alto=Math.min(de.y,para.y)-(o.alto||50);
  return anim(v,[{transform:'translate('+de.x+'px,'+de.y+'px) rotate(0deg)',opacity:0},{opacity:1,offset:.12},
    {transform:'translate('+((de.x+para.x)/2)+'px,'+alto+'px) rotate('+(o.gira||200)+'deg)',offset:.55},
    {transform:'translate('+para.x+'px,'+para.y+'px) rotate('+(o.gira||200)*1.8+'deg)',opacity:1}],{d:o.d||520,delay:o.delay||0,e:'ease-in-out'}).then(function(){v.remove();});
}
// livros despencam do alto de uma torre (ideias perdidas); a torre oscila antes
function livrosCaem(did,P,n){ var m=M3(); if(m&&n>0)m.derrubar(did,P,n); }
// chuva de páginas sobre a mesa
function chuva(n){ var m=M3(); if(m)m.chuva(n||26); }
// faixa curta de legenda (some sozinha, com tempo de leitura)
function legenda(tit,sub,cor,ms){
  var f=cria('faixa topo','<span>'+esc(tit)+'</span>'+(sub?'<small>'+esc(sub)+'</small>':''),'--pc:'+(cor||'#c8962a')+';--dur:'+T(ms)+'ms');
  setTimeout(function(){f.remove();},T(ms)+60);
  return dorme(ms);
}

// câmera: avança de verdade até a estela do debate e o resto escurece; desfoco() volta ao plano geral.
// Meça posições na janela (caixa, M3D.tela) só depois de 'await foco(...)': a câmera muda tudo de lugar.
function chaveDe(el){
  var a=el&&el.closest?el.closest('[data-anc]'):null; if(!a)return null;
  var k=a.dataset.anc.split(':'); return (k[0]==='est'||k[0]==='deb')?'deb:'+k[1]:a.dataset.anc;
}
function foco(el){ var m=M3(); if(!m||RM||!el)return Promise.resolve(); return m.foco(chaveDe(el)||'deb:1'); }
function desfoco(){ var m=M3(); return m?m.desfoco():Promise.resolve(); }

// ---------- coro grego ----------
// tipo: 'aplauso' | 'vaia' | 'murmurio'. Não bloqueia: reage em paralelo à cena.
var coroTimer=null;
function coro(tipo,texto,ms){
  var c=document.getElementById('coro'), m=M3(); if(m)m.coro(tipo,T(ms||1700));
  if(!c)return;
  var f=c.querySelector('.coro-fala');
  c.classList.remove('falando'); void c.offsetWidth;
  if(texto&&f){f.textContent=texto;c.classList.add('falando');}
  clearTimeout(coroTimer);
  coroTimer=setTimeout(function(){c.classList.remove('falando');},T(ms||1700));
}
// as figuras do coro são da cena 3D; em HTML fica só a fala
function montarCoro(){
  var c=document.getElementById('coro'); if(c)c.innerHTML='<div class="coro-fala" aria-live="polite"></div>';
}

// ---------- desenhos ----------
function lourosSVG(){
  var f='';
  for(var lado=-1;lado<=1;lado+=2)for(var i=0;i<9;i++){
    var t=(18+i*16)*Math.PI/180, x=60+lado*46*Math.sin(t), y=46+38*Math.cos(t), g=Math.atan2(-Math.sin(t),lado*Math.cos(t))*180/Math.PI;
    f+='<ellipse cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" rx="11" ry="5" transform="rotate('+g+' '+x.toFixed(1)+' '+y.toFixed(1)+')" fill="'+(i%2?'#d9a93a':'#b98a1e')+'" stroke="#7a5a10" stroke-width=".8"/>';
  }
  return '<svg viewBox="0 0 120 92" width="120" height="92" aria-hidden="true">'+f+'<path d="M50 84 q10 7 20 0" fill="none" stroke="#7a5a10" stroke-width="2.5" stroke-linecap="round"/></svg>';
}
// ---------- registro e despacho ----------
function def(nome,fn){reg[nome]=fn;}
async function cena(nome,ev){
  var fn=reg[nome]; if(!fn)return;
  try{ await fn(ev,X.ctx); }catch(e){ if(window.console)console.error('cena '+nome,e); }
}

/* ===== CENA: entrada em debate =====
   A câmera avança até a estela. Quem tem boneco desce do pedestal, anda pela plataforma até o pé da
   própria torre e lança os papiros, que viram livros. Quem ainda é carta salta até lá, pousa com um
   tranco, solta a interjeição do seu tom e os livros caem na torre. Depois voltam ao lugar. */
def('entrada',async function(ev,c){
  var m=M3(), torre=c.elTorre(ev.did,ev.P), f=m&&m.figura(ev.P,ev.id);
  if(!torre||!f){ await c.revelar(ev.did,ev.P,ev.amt); return; }
  await foco(torre);
  if(f.boneco) await entradaBoneco(ev,c,f,torre); else await entradaCarta(ev,c,f,torre);
  await desfoco();
});
async function entradaCarta(ev,c,f,torre){
  var m=M3D, o=f.obj, casa=f.casa.clone(), pe=m.peTorre(ev.did,ev.P), tom=tomDe(ev.id);
  if(f.ajusteY)pe.y+=f.ajusteY;   // personagem em PNG: os pés, e não a borda da prancheta, tocam o chão
  m.fora(ev.P,ev.id,true);
  await m.arco(o,pe,T(ev.P===0?620:760),ev.P===0?2.2:4.6);
  m.tranco(o,T(280)); tremer(3);
  var p=m.tela(pe), b=caixa(torre); poeira(p.x,p.y,9);
  estouro(sorteia(INTERJ[tom]),b.x+(b.x>innerWidth/2?-90:90),b.t-8,tom);
  coro('murmurio',sorteia(CORO.entrada),1400);
  await dorme(260);
  await c.revelar(ev.did,ev.P,ev.amt);
  if(c.lidera(ev.did,ev.P)){ coro('aplauso',sorteia(CORO.lidera),1300); }
  await dorme(tom==='contido'?520:380);
  m.encolher(ev.P,ev.id,T(680));   // adversário: volta à escala da faixa de cima durante o voo
  await m.arco(o,casa,T(ev.P===0?520:680),ev.P===0?1.6:4.2);
  m.fora(ev.P,ev.id,false);
}
/* Entrada de um filósofo que já tem marionete. A figura é HTML (hoje SVG de recorte; depois Rive) e segue,
   quadro a quadro, um ponto que anda pela plataforma 3D: por isso diminui ao se afastar. O animal fica
   no pedestal. */
async function entradaBoneco(ev,c,f,torre){
  var m=M3D, el=c.elMini(ev.P,ev.id), fig=el&&el.querySelector('.fig'), o=f.obj, casa=f.casa.clone();
  var pe=m.peTorre(ev.did,ev.P,-.8), lado=new m.V3(casa.x-1.05,0,casa.z-.15);
  var g=document.createElement('div'); g.className='fig-fx'; g.innerHTML=fig?fig.innerHTML:''; camada().appendChild(g);
  var fe=m.L.ped.fig||1;
  function segue(){ var r=m.retFig(o.position,1.3*fe,1.5*fe); g.style.width=r.w.toFixed(1)+'px'; g.style.height=r.h.toFixed(1)+'px'; g.style.transform='translate('+r.l.toFixed(1)+'px,'+r.t.toFixed(1)+'px)'; }
  m.aoQuadro=segue; segue();
  if(el)el.classList.add('ausente');
  await m.arco(o,lado,T(420),.5);                       // desce do pedestal
  g.classList.add('anda');
  var dur=Math.max(900,Math.min(2400,lado.distanceTo(pe)*360));
  await m.andar(o,pe,T(dur));
  g.classList.remove('anda'); await dorme(240); g.classList.add('lanca');
  coro('murmurio',sorteia(CORO.entrada),1500);
  var n=Math.min(ev.amt,8), ps=[], mao=new m.V3(pe.x-.3,.95,pe.z);
  for(var i=0;i<n;i++)ps.push((function(i){
    var alvo=m.topoTorre(ev.did,ev.P)||pe; alvo.y+=.12+i*.05;
    return m.papiro(mao.clone(),alvo,T(560),T(i*460)).then(function(){return c.revelar(ev.did,ev.P,1);});
  })(i));
  await Promise.all(ps);
  if(ev.amt>n)await c.revelar(ev.did,ev.P,ev.amt-n);
  g.classList.remove('lanca');
  var tom=tomDe(ev.id), b=caixa(torre);
  estouro(sorteia(INTERJ[tom]),b.x,b.t-24,tom);
  if(c.lidera(ev.did,ev.P))coro('aplauso',sorteia(CORO.lidera),1300);
  await dorme(900);
  g.classList.add('anda');
  await m.andar(o,lado,T(dur*.85));
  g.classList.remove('anda');
  await m.arco(o,casa,T(440),.8);                       // sobe de volta
  m.aoQuadro=null; g.remove();
  [el,c.elMini(ev.P,ev.id)].forEach(function(x){ if(x)x.classList.remove('ausente'); });
}

/* ===== CENA: falácia (despacho) =====
   ev: {P, id, label, prm, did, ganho, perda}. Procura 'falacia:<id>'; se não houver, usa o padrão. */
def('falacia',async function(ev,c){
  var al=ev.prm&&ev.prm.d!==undefined?c.elDeb(ev.prm.d):null;
  if(al)await foco(al);
  await (reg['falacia:'+ev.id]||reg['falacia:_padrao'])(ev,c);
  await desfoco();
});
function alvoDaFalacia(ev,c){
  var p=ev.prm||{};
  return (p.d!==undefined&&p.o!==undefined&&c.elTorreSlot(p.d,p.o))||(p.d!==undefined&&c.elDeb(p.d))||(p.fi!==undefined&&p.o===undefined&&c.elMini(ev.P,c.idDoGrupo(ev.P,p.fi)))||null;
}
// padrão: legenda com o nome da carta, carimbo no alvo, vaia do coro; as torres se acertam
def('falacia:_padrao',async function(ev,c){
  var carta=c.carta(ev.id), ehFalacia=/^Fal/.test(carta.sub||''), al=alvoDaFalacia(ev,c), p=al?caixa(al):centroMesa();
  var leg=legenda(c.nome(ev.P)+(ev.P===0?' usa ':' usa ')+carta.nome,ev.label,c.cor(ev.P),2200);
  await dorme(350);
  if(ehFalacia){ carimbo('Falácia!',p.x,p.y); coro('vaia',sorteia(CORO.falacia),1800); }
  else { carimbo('Práxis!',p.x,p.y); coro('murmurio','Hmmm…',1500); }
  await dorme(300);
  if(ev.perda>0&&ev.prm.o!==undefined)livrosCaem(ev.did,ev.prm.o,ev.perda);
  if(ev.ganho>0)await c.revelar(ev.did,ev.P,ev.ganho);
  await leg;
});
/* MODELO de falácia com cena própria — Espantalho (+4 para quem usa, −4 para o oponente).
   Sobe, ao pé da torre do oponente, um boneco de palha com as cores dele; o golpe (um livro do atacante)
   acerta o boneco, nunca o filósofo; a palha voa, o boneco tomba, o selo bate, o coro vaia, e as torres
   se acertam. */
def('falacia:espantalho',async function(ev,c){
  var m=M3(), o=ev.prm.o, tAlvo=c.elTorre(ev.did,o)||c.elTorreSlot(ev.prm.d,o), tMeu=c.elTorre(ev.did,ev.P)||c.elTorreSlot(ev.prm.d,ev.P);
  var pa=m&&m.peTorre(ev.did,o), pm=m&&m.topoTorre(ev.did,ev.P);
  if(!tAlvo||!tMeu||!pa||!pm){ await reg['falacia:_padrao'](ev,c); return; }
  var leg=legenda(c.nome(ev.P)+' usa Espantalho','Caricatura o argumento de '+c.nome(o)+' e bate na caricatura',c.cor(ev.P),3000);
  var lado=pa.x>=pm.x?1:-1, e=m.espantalho(pa,c.cor(o),lado), peito=new m.V3(pa.x,1.25,pa.z);
  await e.subir();
  var s=m.tela(new m.V3(pa.x,2.5,pa.z)); estouro('“Então você diz que…”',s.x,s.y,'contido');
  await dorme(620);
  // o golpe: um livro do atacante acerta o boneco
  pm.y+=.2; await m.livroVoa(pm,peito,ev.P,{d:380,alto:.9,gira:9});
  tremer(2); m.palha(peito); e.tombar();
  coro('vaia',sorteia(CORO.espantalho),2000);
  await dorme(380);
  var a=caixa(tAlvo); carimbo('Falácia!',a.x,a.t-6);
  livrosCaem(ev.did,o,ev.perda);
  await dorme(260);
  await c.revelar(ev.did,ev.P,ev.ganho);
  await dorme(700);
  await e.sumir();
  await leg;
});

/* ===== CENA: vitória num debate =====
   A pergunta vencida vira placa, recebe a coroa de louros, chovem páginas, o coro aplaude,
   e a placa vai para a prateleira de troféus do vencedor. */
def('vitoria',async function(ev,c){
  var slot=c.elDeb(ev.di); if(slot)await foco(slot);
  var o=slot?caixa(slot):centroMesa(), ar=c.area(ev.area);
  var px=Math.max(170,Math.min(innerWidth-170,o.x)), py=Math.max(150,Math.min(innerHeight-120,o.t+70));
  var pl=cria('placa','<div class="lr">'+lourosSVG()+'</div><div class="pa">'+esc(ar.nome)+'</div><div class="pq">'+esc(ev.q)+'</div>'
    +'<div class="pv"><b>'+esc(ev.P===0?'Você venceu o debate':c.nome(ev.P)+' vence o debate')+'</b> · +'+ev.valor+' pontos</div>','--c:'+ar.cor+';--pc:'+c.cor(ev.P));
  var base='translate('+px+'px,'+py+'px) translate(-50%,-50%) ';
  coro('aplauso',sorteia(CORO.vitoria),2600);
  await anim(pl,[{transform:base+'scale(.5)',opacity:0},{transform:base+'scale(1)',opacity:1}],{d:520,e:CURVA.tranco});
  var lr=pl.querySelector('.lr');
  anim(lr,[{transform:'translate(-50%,-150px) rotate(-20deg)',opacity:0},{transform:'translate(-50%,0) rotate(0deg)',opacity:1}],{d:520,e:CURVA.tranco});
  chuva(28);
  await dorme(2400);
  await desfoco();
  var t=c.elTrofeu(ev.P), d=t?caixa(t):{x:px,y:py-200};
  await anim(pl,[{transform:base+'scale(1)',opacity:1},{transform:'translate('+d.x+'px,'+d.y+'px) translate(-50%,-50%) scale(.08)',opacity:.7}],{d:700,e:'cubic-bezier(.5,0,.3,1)'});
  pl.remove(); c.revelarTrofeu(ev.P);
});

X.T=T; X.dorme=dorme; X.anim=anim; X.caixa=caixa; X.cria=cria; X.tremer=tremer; X.poeira=poeira; X.estouro=estouro;
X.carimbo=carimbo; X.livroVoa=livroVoa; X.livrosCaem=livrosCaem; X.chuva=chuva; X.legenda=legenda; X.coro=coro; X.montarCoro=montarCoro;
X.def=def; X.cena=cena; X.CURVA=CURVA; X.TOM=TOM; X.INTERJ=INTERJ; X.CORO=CORO; X.tomDe=tomDe;
X.foco=foco; X.desfoco=desfoco;
X.ligar=function(ctx){X.ctx=ctx;montarCoro();};
window.BFX=X;
})();
