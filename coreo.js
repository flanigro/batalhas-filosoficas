/* Batalhas Filosóficas — coreografia (rodada visual 1)
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
 * REGRAS (ver também o comentário no topo do CSS)
 * - Toda duração passa por T(ms): "Ritmo: rápido" divide por 2; movimento reduzido corta para ~0.
 * - Nada encosta num filósofo. O alvo de um golpe retórico é torre, espantalho ou lápide.
 * - Uma coisa grande por vez; o coro pode reagir em paralelo.
 */
(function(){
'use strict';
var X={veloz:false,ctx:null}, reg={};
var RM=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches);
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

// cópia solta de uma carta pequena, na camada de efeitos, no lugar exato da original
function fantasma(el){
  var r=el.getBoundingClientRect(), g=el.cloneNode(true);
  g.className=g.className.replace(/\b(alvo|sobre|selecionado|novo|acted|brilho|ausente)\b/g,'')+' fantasma-fx';
  g.style.setProperty('--w',r.width+'px'); g.style.width=r.width+'px'; g.style.height=r.height+'px';
  g.style.transform='translate('+r.left+'px,'+r.top+'px)';
  camada().appendChild(g); return g;
}
// tremor curto da mesa (≤ 6px, ≤ 320ms)
function tremer(forca){
  var m=X.ctx&&X.ctx.mesa(); if(!m||RM)return Promise.resolve();
  var f=Math.min(6,forca||4), q=[{transform:'translate(0,0)'}];
  for(var i=1;i<=6;i++)q.push({transform:'translate('+((i%2?-1:1)*f*(1-i/7)).toFixed(1)+'px,'+((i%2?1:-.6)*f*(1-i/7)).toFixed(1)+'px)'});
  q.push({transform:'translate(0,0)'});
  return anim(m,q,{d:300,e:'linear',fill:'none'});
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
// livros que despencam de uma torre (ideias perdidas)
function livrosCaem(torre,n,cor){
  if(!torre||!n)return;
  var c=caixa(torre);
  anim(torre,[{transform:'rotate(0deg)'},{transform:'rotate(-2.5deg)'},{transform:'rotate(2deg)'},{transform:'rotate(-1deg)'},{transform:'rotate(0deg)'}],{d:460,e:'ease-in-out',fill:'none'});
  for(var i=0;i<Math.min(n,8);i++)(function(i){
    var v=cria('voa deitado','','--pc:'+cor), dx=(i%2?1:-1)*(18+Math.random()*34);
    anim(v,[{transform:'translate('+c.x+'px,'+(c.t+6)+'px) rotate(0deg)',opacity:1},{transform:'translate('+(c.x+dx*.6)+'px,'+(c.t-22)+'px) rotate('+(dx*4)+'deg)',opacity:1,offset:.3},
      {transform:'translate('+(c.x+dx)+'px,'+(c.b+18)+'px) rotate('+(dx*9)+'deg)',opacity:0}],{d:700,delay:340+i*70,e:'ease-in'}).then(function(){v.remove();});
  })(i);
}
// chuva de páginas sobre a mesa
function chuva(n){
  var m=centroMesa();
  for(var i=0;i<(n||26);i++)(function(i){
    var x=m.l+Math.random()*m.w, p=cria('pagina','','left:0;top:0'), g=(Math.random()*2-1)*260, dx=(Math.random()*2-1)*80;
    anim(p,[{transform:'translate('+x+'px,'+(m.t-30)+'px) rotate(0deg)',opacity:0},{opacity:1,offset:.1},
      {transform:'translate('+(x+dx)+'px,'+(m.t+m.h*.55)+'px) rotate('+g+'deg) rotateX(180deg)',opacity:1,offset:.7},
      {transform:'translate('+(x+dx*1.4)+'px,'+(m.t+m.h*.8)+'px) rotate('+g*1.3+'deg) rotateX(320deg)',opacity:0}],{d:1500+Math.random()*900,delay:Math.random()*600,e:'linear'}).then(function(){p.remove();});
  })(i);
}
// faixa curta de legenda (some sozinha, com tempo de leitura)
function legenda(tit,sub,cor,ms){
  var f=cria('faixa topo','<span>'+esc(tit)+'</span>'+(sub?'<small>'+esc(sub)+'</small>':''),'--pc:'+(cor||'#c8962a')+';--dur:'+T(ms)+'ms');
  setTimeout(function(){f.remove();},T(ms)+60);
  return dorme(ms);
}

// câmera: aproxima a vista de um ponto da mesa e escurece o resto; desfoco() volta ao plano geral.
// Meça posições (caixa) só depois de 'await foco(...)': a aproximação muda as coordenadas.
var focado=null;
function foco(el){
  var cn=document.querySelector('.cena3d'), v=document.getElementById('focoveu');
  if(!cn||!el||RM||focado)return Promise.resolve();
  var r=cn.getBoundingClientRect(), c=caixa(el);
  cn.style.transformOrigin=(c.x-r.left)+'px '+(c.y-r.top)+'px';
  if(v){var m=v.getBoundingClientRect();v.style.setProperty('--fx',(c.x-m.left)+'px');v.style.setProperty('--fy',(c.y-m.top)+'px');v.classList.add('on');}
  focado=cn;
  return anim(cn,[{transform:'scale(1)'},{transform:'scale(1.08)'}],{d:520,fill:'forwards'});
}
function desfoco(){
  var cn=focado, v=document.getElementById('focoveu'); if(!cn)return Promise.resolve();
  focado=null; if(v)v.classList.remove('on');
  return anim(cn,[{transform:'scale(1.08)'},{transform:'scale(1)'}],{d:520,fill:'forwards'}).then(function(){cn.getAnimations().forEach(function(a){a.cancel();});});
}

// ---------- coro grego ----------
// tipo: 'aplauso' | 'vaia' | 'murmurio'. Não bloqueia: reage em paralelo à cena.
var coroTimer=null;
function coro(tipo,texto,ms){
  var c=document.getElementById('coro'); if(!c)return;
  var f=c.querySelector('.coro-fala');
  c.classList.remove('aplauso','vaia','murmurio','falando'); void c.offsetWidth;
  c.classList.add(tipo); if(texto&&f){f.textContent=texto;c.classList.add('falando');}
  clearTimeout(coroTimer);
  coroTimer=setTimeout(function(){c.classList.remove('aplauso','vaia','murmurio','falando');},T(ms||1700));
}
function montarCoro(n){
  var c=document.getElementById('coro'); if(!c)return;
  var h='<div class="coro-fala" aria-live="polite"></div>';
  for(var i=0;i<(n||17);i++)h+='<i class="corista" style="--i:'+i+'"></i>';
  c.innerHTML=h;
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
function espantalhoSVG(cor){
  return '<svg viewBox="0 0 90 130" width="90" height="130" aria-hidden="true">'
    +'<rect x="42" y="40" width="6" height="88" fill="#7a5632"/><rect x="8" y="58" width="74" height="5" rx="2" fill="#7a5632"/>'
    +'<g stroke="#d9b24a" stroke-width="2" stroke-linecap="round"><path d="M8 60l-7-6M8 61l-8 2M8 62l-6 7M82 60l7-6M82 61l8 2M82 62l6 7M36 112l-5 12M45 114v13M54 112l5 12"/></g>'
    +'<path d="M27 56h36l5 56H22z" fill="#e2c36a" stroke="#a8842c" stroke-width="2"/><rect x="33" y="78" width="12" height="11" fill="'+cor+'" stroke="#26221c" stroke-width="1" stroke-dasharray="2 1.5"/>'
    +'<path d="M24 58q21 12 42 0v7q-21 12-42 0z" fill="'+cor+'"/>'
    +'<circle cx="45" cy="36" r="17" fill="#ecd58c" stroke="#a8842c" stroke-width="2"/>'
    +'<g stroke="#26221c" stroke-width="2" stroke-linecap="round" fill="none"><path d="M36 30l5 5M41 30l-5 5M49 30l5 5M54 30l-5 5M37 43q8 6 16 0"/><path d="M40 43v3M45 45v3M50 43v3" stroke-width="1.2"/></g>'
    +'<path d="M22 22h46l-9-5-7-15-16 2-6 13z" fill="'+cor+'" stroke="#26221c" stroke-width="1.5"/></svg>';
}

// ---------- registro e despacho ----------
function def(nome,fn){reg[nome]=fn;}
async function cena(nome,ev){
  var fn=reg[nome]; if(!fn)return;
  try{ await fn(ev,X.ctx); }catch(e){ if(window.console)console.error('cena '+nome,e); }
}

/* ===== CENA: entrada em debate =====
   O filósofo salta da cadeira, pousa na tribuna com um tranco, a mesa treme, sobe poeira de giz,
   ele solta a interjeição do seu tom e os livros caem na torre, um a um. Depois volta à cadeira. */
def('entrada',async function(ev,c){
  var m=c.elMini(ev.P,ev.id), torre=c.elTorre(ev.did,ev.P);
  if(!m||!torre){ await c.revelar(ev.did,ev.P,ev.amt); return; }
  await foco(torre);
  if(m.classList.contains('boneco')){ await entradaBoneco(ev,c,m,torre); await desfoco(); return; }
  var a=caixa(m), b=caixa(torre), g=fantasma(m), k=Math.min(.62,58/a.w);
  m.classList.add('ausente');
  var lv=torre.querySelector('.lv'), alt=lv?lv.getBoundingClientRect().height*torre.querySelectorAll('.lv').length:0;
  var topo=Math.max(b.t,b.b-alt-6), x1=b.x-a.w/2, y1=topo-a.h, sobe=Math.min(a.t,y1)-70;
  await anim(g,[{transform:'translate('+a.l+'px,'+a.t+'px) scale(1) rotate(0deg)'},
    {transform:'translate('+((a.l+x1)/2)+'px,'+sobe+'px) scale(1.12) rotate('+(x1>a.l?9:-9)+'deg)',offset:.5},
    {transform:'translate('+x1+'px,'+y1+'px) scale('+k+') rotate(0deg)'}],{d:520,e:'cubic-bezier(.45,0,.75,.6)'});
  // pouso: achata, treme, poeira, interjeição
  anim(g,[{transform:'translate('+x1+'px,'+y1+'px) scale('+(k*1.18)+','+(k*.74)+')'},{transform:'translate('+x1+'px,'+y1+'px) scale('+(k*.94)+','+(k*1.08)+')',offset:.45},{transform:'translate('+x1+'px,'+y1+'px) scale('+k+')'}],{d:280,e:CURVA.tranco});
  tremer(3); poeira(b.x,topo+2,9);
  var tom=tomDe(ev.id);
  estouro(sorteia(INTERJ[tom]),b.x+(b.x>innerWidth/2?-70:70),topo-a.h*k-16,tom);
  coro('murmurio',sorteia(CORO.entrada),1400);
  await dorme(260);
  await c.revelar(ev.did,ev.P,ev.amt);
  if(c.lidera(ev.did,ev.P)){ coro('aplauso',sorteia(CORO.lidera),1300); }
  await dorme(tom==='contido'?520:380);
  await anim(g,[{transform:'translate('+x1+'px,'+y1+'px) scale('+k+')',opacity:1},{transform:'translate('+a.l+'px,'+a.t+'px) scale(1)',opacity:.2}],{d:300,e:CURVA.saida});
  g.remove(); m.classList.remove('ausente');
  await desfoco();
});
/* Entrada de um filósofo que já tem marionete: sai do pedestal andando (o animal fica), para ao pé da
   própria torre e lança os papiros, que viram livros ao pousar. Depois volta andando. */
async function entradaBoneco(ev,c,m,torre){
  var a=caixa(m), b=caixa(torre), g=fantasma(m), k=.82, ped=m.querySelector('.pedestal'), hp=ped?ped.getBoundingClientRect().height:0;
  var lv=torre.querySelector('.lv'), alt=lv?lv.getBoundingClientRect().height*torre.querySelectorAll('.lv').length:0, topo=Math.max(b.t,b.b-alt-6);
  m.classList.add('ausente'); g.classList.add('anda');
  var x1=b.l-a.w*.66, y1=b.b+6+hp*k-a.h, dist=Math.hypot(x1-a.l,y1-a.t), dur=Math.max(800,Math.min(1700,dist*3.4));
  await anim(g,[{transform:'translate('+a.l+'px,'+a.t+'px) scale(1)'},{transform:'translate('+x1+'px,'+y1+'px) scale('+k+')'}],{d:dur,e:'linear'});
  g.classList.remove('anda'); await dorme(240); g.classList.add('lanca');
  coro('murmurio',sorteia(CORO.entrada),1500);
  var n=Math.min(ev.amt,8), ps=[], mao={x:x1+a.w*.42,y:y1+a.h-hp*k-a.w*k*.75};
  for(var i=0;i<n;i++)ps.push((function(i){
    var p=cria('papiro','','');
    return anim(p,[{transform:'translate('+mao.x+'px,'+mao.y+'px) rotate(0deg)',opacity:0},{opacity:1,offset:.1},
      {transform:'translate('+((mao.x+b.x)/2)+'px,'+(Math.min(mao.y,topo)-44)+'px) rotate(200deg)',offset:.5},
      {transform:'translate('+b.x+'px,'+(topo+4)+'px) rotate(360deg)',opacity:1}],{d:560,delay:i*460,e:'ease-in-out'}).then(function(){p.remove();return c.revelar(ev.did,ev.P,1);});
  })(i));
  await Promise.all(ps);
  if(ev.amt>n)await c.revelar(ev.did,ev.P,ev.amt-n);
  g.classList.remove('lanca');
  var tom=tomDe(ev.id);
  estouro(sorteia(INTERJ[tom]),b.x,topo-30,tom);
  if(c.lidera(ev.did,ev.P))coro('aplauso',sorteia(CORO.lidera),1300);
  await dorme(900);
  g.classList.add('anda');
  await anim(g,[{transform:'translate('+x1+'px,'+y1+'px) scale('+k+')'},{transform:'translate('+a.l+'px,'+a.t+'px) scale(1)'}],{d:dur*.85,e:'linear'});
  g.remove(); m.classList.remove('ausente');
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
  if(ev.perda>0&&ev.prm.o!==undefined)livrosCaem(c.elTorre(ev.did,ev.prm.o),ev.perda,c.cor(ev.prm.o));
  if(ev.ganho>0)await c.revelar(ev.did,ev.P,ev.ganho);
  await leg;
});
/* MODELO de falácia com cena própria — Espantalho (+4 para quem usa, −4 para o oponente).
   Sobe um boneco de palha com as cores do oponente; o golpe acerta o boneco, nunca o filósofo;
   a palha voa, o carimbo bate, o coro vaia, e as torres se acertam. */
def('falacia:espantalho',async function(ev,c){
  var o=ev.prm.o, tAlvo=c.elTorre(ev.did,o)||c.elTorreSlot(ev.prm.d,o), tMeu=c.elTorre(ev.did,ev.P)||c.elTorreSlot(ev.prm.d,ev.P);
  if(!tAlvo||!tMeu){ await reg['falacia:_padrao'](ev,c); return; }
  var leg=legenda(c.nome(ev.P)+' usa Espantalho','Caricatura o argumento de '+c.nome(o)+' e bate na caricatura',c.cor(ev.P),3000);
  var a=caixa(tAlvo), m=caixa(tMeu), lado=a.x>=m.x?1:-1;
  var ex=a.x+lado*34, ey=a.b-112, base='translate('+(ex-45)+'px,'+ey+'px) ';
  var e=cria('espantalho',espantalhoSVG(c.cor(o)),'');
  await anim(e,[{transform:base+'translateY(60px) scale(.5) rotate(0deg)',opacity:0},{transform:base+'translateY(-8px) scale(1.08) rotate('+(-lado*6)+'deg)',opacity:1,offset:.6},{transform:base+'rotate('+(lado*4)+'deg)',offset:.8},{transform:base+'rotate(0deg)',opacity:1}],{d:520,e:'ease-out'});
  estouro('“Então você diz que…”',ex,ey-18,'contido');
  await dorme(620);
  // o golpe: um livro do atacante acerta o boneco
  await livroVoa({x:m.x,y:m.t},{x:ex,y:ey+50},c.cor(ev.P),{d:380,alto:70,gira:300});
  tremer(2);
  for(var i=0;i<12;i++)(function(i){
    var p=cria('palha','', 'left:'+ex+'px;top:'+(ey+50)+'px'), an=Math.random()*Math.PI*2, d=30+Math.random()*60;
    anim(p,[{transform:'translate(-50%,-50%) rotate('+(an*57)+'deg)',opacity:1},{transform:'translate(calc(-50% + '+(Math.cos(an)*d).toFixed(0)+'px),calc(-50% + '+(Math.sin(an)*d+30).toFixed(0)+'px)) rotate('+(an*57+220)+'deg)',opacity:0}],{d:700,e:'ease-out'}).then(function(){p.remove();});
  })(i);
  anim(e,[{transform:base+'rotate(0deg)',opacity:1},{transform:base+'translate('+(lado*6)+'px,4px) rotate('+(lado*66)+'deg)',opacity:1,offset:.7},{transform:base+'translate('+(lado*8)+'px,6px) rotate('+(lado*72)+'deg)',opacity:1}],{d:520,e:CURVA.queda});
  coro('vaia',sorteia(CORO.espantalho),2000);
  await dorme(380);
  carimbo('Falácia!',a.x,a.t-6);
  livrosCaem(tAlvo,ev.perda,c.cor(o));
  await dorme(260);
  await c.revelar(ev.did,ev.P,ev.ganho);
  await dorme(700);
  await anim(e,[{opacity:1},{opacity:0}],{d:280,fill:'forwards'}); e.remove();
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

X.T=T; X.dorme=dorme; X.anim=anim; X.caixa=caixa; X.cria=cria; X.fantasma=fantasma; X.tremer=tremer; X.poeira=poeira; X.estouro=estouro;
X.carimbo=carimbo; X.livroVoa=livroVoa; X.livrosCaem=livrosCaem; X.chuva=chuva; X.legenda=legenda; X.coro=coro; X.montarCoro=montarCoro;
X.def=def; X.cena=cena; X.CURVA=CURVA; X.TOM=TOM; X.INTERJ=INTERJ; X.CORO=CORO; X.tomDe=tomDe;
X.foco=foco; X.desfoco=desfoco;
X.ligar=function(ctx){X.ctx=ctx;montarCoro(17);};
window.BFX=X;
})();
