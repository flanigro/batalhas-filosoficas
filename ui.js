/* Batalhas Filosóficas — interface (protótipo nível 2)
 * A mesa é 3D (mesa3d.js). Aqui se desenham as cartas da mão, as telas e, para cada objeto clicável da
 * mesa, uma ÂNCORA invisível com data-anc (ver o CSS): mesmos data-atributos de antes, posição dada pela cena. */
(function(){
'use strict';
var S=null, veloz=false, ocupado=false, animando=null, aberto=null, emPalco=false, bibChegou=false, ultimoArrasto=0, sel=null, ocultos={};
var $=function(id){return document.getElementById(id);};
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}
var AREA=BF.AREA, ESC=BF.ESCOLA, C=BF.C, DEB=BF.DEB;
var BUSTO='<svg viewBox="0 0 40 44" width="34" height="38" aria-hidden="true"><path d="M6 44v-6q0-9 9-11l5 3 5-3q9 2 9 11v6z" fill="#efeae0" stroke="#8d8472"/><circle cx="20" cy="14" r="9.5" fill="#f6f2e9" stroke="#8d8472"/><path d="M8 34q12 8 24 0v4q-12 8-24 0z" fill="var(--pc)"/></svg>';
// ampulheta do botão Encerrar turno: duas bases, o vidro em dois bulbos, areia em cima, filete e monte embaixo
var AMPULHETA='<svg viewBox="0 0 24 30" width="20" height="25" aria-hidden="true"><rect x="2" y="1" width="20" height="3.6" rx="1.4" fill="currentColor"/><rect x="2" y="25.4" width="20" height="3.6" rx="1.4" fill="currentColor"/>'
  +'<path d="M5.2 4.6h13.6c0 5.6-4.2 7.6-5.4 10.4 1.2 2.8 5.4 4.8 5.4 10.4H5.2c0-5.6 4.2-7.6 5.4-10.4C9.4 12.2 5.2 10.2 5.2 4.6z" fill="rgba(255,255,255,.35)" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>'
  +'<path d="M8.3 8.2h7.4L12 12.6z" fill="currentColor"/><path d="M12 13v8.4" stroke="currentColor" stroke-width="1.1"/><path d="M7.2 24.6c1.4-3.6 3.2-4.6 4.8-4.6s3.4 1 4.8 4.6z" fill="currentColor"/></svg>';
var USAR_BONECOS=false;   // marionetes (Diógenes) ficam para a etapa de animação: por ora, todos aparecem como carta
// emblema do jogador: a inicial no centro de uma coroa de louros, e o nome completo num pergaminho
var LOUROS=(function(){
  var f='', cx=50, cy=48, r=37;
  for(var lado=-1;lado<=1;lado+=2){
    for(var i=0;i<10;i++){
      var t=(22+i*14.5)*Math.PI/180, x=cx+lado*r*Math.sin(t), y=cy+r*Math.cos(t), g=Math.atan2(-Math.sin(t),lado*Math.cos(t))*180/Math.PI;
      [-1,1].forEach(function(k){ var dx=k*lado*3.6*Math.sin(t), dy=k*3.6*Math.cos(t);   // duas folhas por nó, uma de cada lado do ramo
        f+='<ellipse cx="'+(x+dx).toFixed(1)+'" cy="'+(y+dy).toFixed(1)+'" rx="7.6" ry="3.1" transform="rotate('+(g+k*lado*28).toFixed(0)+' '+(x+dx).toFixed(1)+' '+(y+dy).toFixed(1)+')" fill="'+((i+k)%2?'#7d8f34':'#5f7128')+'" stroke="#36420f" stroke-width=".7"/>'; });
    }
  }
  return '<svg class="louros" viewBox="0 0 100 100" aria-hidden="true">'+f+'<path d="M38 88q12 6 24 0l-4 8-8-4-8 4z" fill="var(--pc)" stroke="#2a1c10" stroke-width="1"/>'
    +'<circle cx="50" cy="48" r="25" fill="#fbf4e2" stroke="var(--pc)" stroke-width="4.5"/><circle cx="50" cy="48" r="27.3" fill="none" stroke="#2a1c10" stroke-width="1"/>';
})();
function emblema(p){
  var pl=S.players[p], letra=pl.nome.charAt(0).toUpperCase();
  return '<div class="emb">'+LOUROS+'<text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-family="Alegreya,Georgia,serif" font-weight="900" font-size="38" fill="#2a1c10">'+esc(letra)+'</text></svg></div>'
    +'<div class="perg"><span>'+esc(pl.nome)+'</span></div>';
}
// placar: pontos acumulados e o objetivo (30)
function placar(p){ var pl=S.players[p]; return '<div class="pts" title="Pontos: '+pl.points+' de '+S.cfg.pontos+'"><b>'+pl.points+'</b><small>/'+S.cfg.pontos+'</small></div>'; }
// livros da Biblioteca em HTML (Minha Biblioteca, na faixa de baixo): em grupos de cinco, para contar a olho
function livrosHTML(n){ var h=''; for(var i=0;i<Math.min(n,60);i++)h+='<i class="liv"></i>'; return h; }
var TIPO={c:'Citação · tradução livre',p:'Paráfrase',i:'Inferência a partir da doutrina'};
function pode(){return S&&S.turn===0&&!S.over&&!ocupado&&!emPalco&&!animando;}
function areasNaMesa(){var o={};S.debates.forEach(function(d){o[DEB[d.id].area]=1;});return o;}
function m3d(){ if(window.M3D&&M3D.pronto)M3D.sync(S,ocultos); }
function M3(){ return window.M3D&&M3D.pronto?M3D:null; }

// ---------- cartas ----------
function miniF(g,c,attrs,cls,st){
  var e=ESC[c.escola], on=areasNaMesa();
  var vals=BF.AREAS.map(function(a){return '<span class="'+(on[a]?'on':'')+'" style="--c:'+AREA[a].cor+'" title="'+AREA[a].nome+'">'+c.vals[a]+'</span>';}).join('');
  return '<button class="mini F '+(cls||'')+'" style="--e1:'+e.cor+';--e2:'+e.cor2+';'+(st||'')+'" data-cid="'+c.id+'" '+attrs+' aria-label="'+esc(c.nome)+'">'
    +'<div class="img" style="background-image:url(img/'+c.id+'.jpg)"></div><span class="custo">'+c.custo+'</span>'
    +'<div class="nome">'+esc(c.nome)+'</div>'
    +'<div class="vals">'+vals+'</div></button>';
}
// âncora de um filósofo na mesa: a figura é da cena 3D; aqui ficam o alvo de clique, a etiqueta de estado
// e, se o filósofo tem marionete, o encaixe .fig com o boneco (posto sobre o pedestal pela cena)
function ancF(g,c,attrs,anc,figAnc){
  var inerte=!BF.ativo(g), bon=USAR_BONECOS&&figAnc&&window.BF_BONECOS&&BF_BONECOS[c.id];
  return '<button class="mini F '+(bon?'boneco ':'')+(inerte?'novo ':'')+(g.acted?'acted ':'')+'" data-anc="'+anc+'" data-cid="'+c.id+'" '+attrs+' aria-label="'+esc(c.nome)+'" title="'+esc(c.nome)+'">'
    +(bon?'<div class="fig" data-anc="'+figAnc+'">'+BF_BONECOS[c.id].svg+'</div>':'')
    +(g.lib?'<div class="sel libr">Bibliotecário</div>':inerte?'<div class="sel">chegando</div>':g.acted?'<div class="sel">já debateu</div>':'')+'</button>';
}
function miniP(c,attrs,cls){
  return '<button class="mini P '+(cls||'')+'" data-cid="'+c.id+'" '+attrs+' aria-label="'+esc(c.nome)+'"><span class="custo">'+c.custo+'</span>'
    +'<div class="pt">'+esc(c.nome)+'</div><div class="ps">'+esc(c.sub)+'</div><div class="pd">'+esc(c.d)+'</div></button>';
}
function seat(g,p,i,meu){
  var c=C(g.id), pl=S.players[p], dar=meu&&S.turn===0&&!S.over&&BF.ativo(g)&&!g.lib;
  var h='<div class="seat'+(meu?'':' opp-seat')+'" style="--pc:'+pl.cor+'" '+(meu?'data-seat="'+i+'"':'data-op="'+p+'" data-oi="'+i+'"')+'>'
    +ancF(g,c,(meu?'data-a="grupo" data-i="'+i+'" data-drag="fil"':'data-a="ver" data-id="'+g.id+'"')+' data-p="'+p+'"',meu?'seat:'+i:'op:'+p+':'+i,meu?'fig:0:'+i:null)
    +(g.lib?'<div class="pilha libp" data-anc="pilha:'+p+':'+i+'" title="Bibliotecário"><b>+'+c.custo+'/turno</b></div>'
      :'<div class="pilha '+(g.ideas?'':'zero')+'" data-anc="pilha:'+p+':'+i+'" title="'+BF.nI(g.ideas)+'"><b>'+g.ideas+'</b>'
        +(dar?'<button class="mais1" data-a="dar" data-i="'+i+'" '+(BF.canGive(S,0,i)?'':'disabled')+' title="Dar 1 ideia da Biblioteca">+</button>':'')+'</div>');
  return h+'</div>';
}

// ---------- render ----------
function renderOpps(){
  var h='';
  for(var p=1;p<S.players.length;p++){
    var pl=S.players[p], vez=S.turn===p&&!S.over, bk='';
    for(var b=0;b<pl.hand.length;b++)bk+='<span class="back"></span>';
    h+='<div class="ident'+(vez?' vez':'')+'" data-painel="'+p+'" data-anc="ident:'+p+'" style="--pc:'+pl.cor+'">'+emblema(p)
      +'<div class="linha">'+placar(p)+trofeus(p)+'<span class="backs" title="Cartas na mão: '+pl.hand.length+'">'+bk+'</span></div>'+(vez?'<span class="jog">jogando…</span>':'')+'</div>';
    pl.group.forEach(function(g,i){h+=seat(g,p,i,false);});
    h+='<div class="bibop" data-anc="bibop:'+p+'" style="--pc:'+pl.cor+'" title="Biblioteca de '+esc(pl.nome)+': '+BF.nI(pl.library)+' guardadas"><b>'+pl.library+'</b></div>';
  }
  $('opps').innerHTML=h;
}
function trofeus(p){
  var pl=S.players[p], oc=ocultos['trof:'+p]||0, h='<span class="trofeus" data-trof="'+p+'"><span class="tl">Debates vencidos</span>';
  pl.won.forEach(function(d,k){var q=DEB[d]; h+='<span class="trofeu'+(k>=pl.won.length-oc?' porvir':'')+'" style="--c:'+AREA[q.area].cor+'" title="«'+esc(q.q)+'» · '+q.valor+' pontos">'+q.valor+'</span>';});
  if(!pl.won.length)h+='<span class="tv">nenhum</span>';
  return h+'</span>';
}
function renderAgora(){
  var h='';
  S.debates.forEach(function(d,i){
    var q=DEB[d.id], a=AREA[q.area];
    h+='<div class="trib"><div class="deb" data-di="'+i+'" data-anc="deb:'+i+'" title="«'+esc(q.q)+'» · '+esc(a.nome)+' · vale '+q.valor+'">';
    S.players.forEach(function(pl,p){
      var n=d.stakes[p], lid=BF.lidera(S,i,p), vis=Math.min(n,2*q.valor), oc=Math.min(vis,ocultos[d.id+':'+p]||0);
      h+='<div class="est" data-row="'+i+':'+p+'" data-anc="est:'+i+':'+p+'" style="--pc:'+pl.cor+'" title="'+esc(pl.nome)+(lid?' · leva o debate no início do próprio turno':'')+'"><div class="torre'+(lid&&!oc?' lider':'')+'" data-est="'+d.id+':'+p+'"></div>'
        +'<span class="n '+(lid&&!oc?'lead':'')+(n-oc?'':' zero')+'">'+(n-oc)+(lid&&!oc?'★':'')+'</span></div>';
    });
    h+='</div><span class="rl" data-anc="lv:'+i+'" title="Linha do valor: quem tiver ao menos '+q.valor+' ideias, e mais que os outros, leva o debate no início do próprio turno"><b>'+q.valor+'</b><i> para vencer</i></span>'
      +'<span class="rl t" data-anc="lt:'+i+'" title="Topo: com '+(2*q.valor)+' ideias a vitória é imediata"><b>'+(2*q.valor)+'</b><i> = vitória imediata</i></span></div>';
  });
  for(var k=S.debates.length;k<3;k++)h+='<div class="vago" data-anc="vago:'+k+'">'+(S.debDeck.length?'Novo debate ao fim da rodada '+(S.cfg.novoDebate.filter(function(r){return r>=S.round;})[0]||'—'):'—')+'</div>';
  $('agora').innerHTML=h;
}
// o que chega à Biblioteca a cada fase de Reflexão: as 3 fixas e a produção do Bibliotecário (se já trabalha)
function ganhoBib(p){
  var pl=S.players[p], n=S.cfg.bibPorTurno||3;
  pl.group.forEach(function(g){ if(g.lib&&BF.ativo(g))n+=C(g.id).custo; });
  return n;
}
function renderMe(){
  var pl=S.players[0], vez=S.turn===0&&!S.over, h='', g='';
  g+='<div class="group" id="megrupo" data-anc="grupo">';
  pl.group.forEach(function(x,i){g+=seat(x,0,i,true);});
  g+='</div>';
  $('me').innerHTML=g;
  $('hvez').innerHTML=S.over?'<b>Partida encerrada.</b>':vez?'<b>Sua vez.</b> Clique numa carta ou num filósofo e a mesa mostra onde ele pode agir; ou arraste. Duplo clique: carta ampliada.':'Vez de <b>'+esc(S.players[S.turn].nome)+'</b>…';
  /* FAIXA INFERIOR (retangular, fora da perspectiva da cena): à esquerda, o jogador e Minha Biblioteca;
     no centro, a mão; à direita, os comandos */
  h+='<div class="rodape" id="rodape" style="--pc:'+pl.cor+'"><div class="r-esq">'
    +'<div class="ident eu'+(vez?' vez':'')+'" data-painel="0">'+emblema(0)+'<div class="linha">'+placar(0)+trofeus(0)+'</div></div>'
    +'<div class="bib'+(bibChegou?' chegou':'')+'" id="bib" '+(vez?'data-a="bib" data-drag="livro" title="Clique ou arraste para dar ideias aos filósofos"':'title="Minha Biblioteca"')+'>'
    +'<div class="bt">Minha Biblioteca</div><div class="bcorpo"><div class="estante'+(pl.library>30?' cheia':'')+'">'+livrosHTML(pl.library)+'</div>'
    +'<div class="bnum"><b>'+pl.library+'</b><small title="Ideias que chegam à Biblioteca na sua fase de Reflexão">+'+ganhoBib(0)+' por turno</small></div></div></div></div>';
  h+='<div class="mao" data-n="'+Math.min(pl.hand.length,9)+'" aria-label="Sua mão">';   // o limite é 5 no fim do turno; durante o turno a mão pode ter 6 ou 7
  pl.hand.forEach(function(id){
    var c=C(id), caro=vez&&c.custo>pl.library;
    h+=c.tipo==='F'?miniF(null,c,'data-a="mao" data-id="'+id+'" data-drag="mao"',caro?'caro':''):miniP(c,'data-a="mao" data-id="'+id+'" data-drag="mao"',caro?'caro':'');
  });
  if(!pl.hand.length)h+='<span class="vaziaM">Sem cartas na mão.</span>';
  h+='</div><div class="cmds">';
  if(S.over)h+='<button class="cmd fim" data-a="fim">Ver resultado</button>';
  else h+='<button class="cmd" data-a="extra" '+(!vez||pl.boughtExtra||pl.library<2?'disabled':'')+' title="Paga 2 ideias da Biblioteca e compra uma carta (uma vez por turno)"><span class="cc">2</span>Comprar carta extra</button>'
      +'<button class="cmd" data-a="troca" '+(vez&&BF.podeTrocar(S,0)?'':'disabled')+' title="Uma vez por partida"><span class="cc">'+S.cfg.custoTroca+'</span>'+(pl.trocou?'Troca já usada':'Trocar filósofo')+'</button>'
      +'<button class="cmd fim" data-a="fimturno" '+(vez?'':'disabled')+'><span class="ico">'+AMPULHETA+'</span>Encerrar turno</button>';
  h+='</div></div>';
  $('hud').innerHTML=h; bibChegou=false;
}
function redesenhar(){ renderOpps();renderAgora();renderMe();m3d(); }
var logN=0;
function renderLog(){
  var el=$('log'), h='', ini=Math.max(0,S.log.length-180);
  for(var i=ini;i<S.log.length;i++){
    var e=S.log[i], cor=e.p>=0?S.players[e.p].cor:'#555';
    var tag=e.cls==='cita'?'Fala sobre a pergunta · a verificar':e.cls==='rel'?'Contexto histórico · a verificar':'';
    h+='<div class="le '+e.cls+'" style="--pc:'+cor+'">'+(tag?'<span class="tag">'+tag+'</span>':'')+esc(e.txt)+'</div>';
  }
  el.innerHTML=h;
  if(S.log.length!==logN){el.scrollTop=el.scrollHeight;logN=S.log.length;}
}
function render(){
  $('hround').innerHTML='Rodada <b>'+S.round+'</b> de '+S.cfg.rodadas;
  var p='';for(var i=1;i<=S.cfg.rodadas;i++)p+='<i class="'+(i<S.round?'on':i===S.round?'on at':'')+'"></i>';
  $('pips').innerHTML=p;
  redesenhar();renderLog();
  if(sel)reaplicarSel();
}

// ---------- balões (fila, um de cada vez) ----------
function elMini(P,id){return document.querySelector('.mini[data-cid="'+id+'"][data-p="'+P+'"]');}
var TONS={con:'#8a6a12',ref:'#6d6f85',esc:'#2c9a4b',dupla:'#c2410c',neg:'#b3261e',mov:'#3b4b8a',lib:'#7a4f0c'};
function durBal(){return veloz?1500:3500;}
function balao(f){
  return new Promise(function(res){
    var m=elMini(f.P,f.id); if(!m){res();return;}
    var r=m.getBoundingClientRect(), b=document.createElement('div'), baixo=r.top<130, dur=durBal();
    b.className='balao '+(baixo?'baixo':'');
    b.style.cssText='--tc:'+(TONS[f.tom]||TONS.con)+';--dur:'+dur+'ms;left:'+Math.max(130,Math.min(window.innerWidth-130,r.left+r.width/2))+'px;top:'+(baixo?r.bottom+10:r.top-10)+'px';
    b.innerHTML='<b>'+esc(f.tit)+'</b>'+esc(f.txt||'');
    $('fx').appendChild(b);
    brilhar(f.P,f.id,TONS[f.tom]||TONS.con);
    setTimeout(function(){b.remove();res();},dur);
  });
}
var filaBal=[], rodandoBal=null;
function enfileirar(f){
  filaBal.push(f);
  if(!rodandoBal)rodandoBal=(async function(){ while(filaBal.length){ await balao(filaBal.shift()); } rodandoBal=null; })();
}
async function esperarBaloes(){ while(rodandoBal) await rodandoBal; }

function brilhar(P,id,cor){ var m=M3(); if(m)m.brilhar(P,id,cor); }
// livros voam de um ponto a outro da cena (ideias dadas, ideias que seguem para o debate)
function voo(de,para,n,P){
  var m=M3(); if(!m||!de||!para)return;
  n=Math.min(n,10);
  for(var i=0;i<n;i++)m.livroVoa(de.clone(),para.clone(),P,{d:750,atraso:i*70,esc:.8,alto:1.3});
}
function faixa(tit,sub,cor,dur){
  var f=document.createElement('div'); f.className='faixa'; f.style.cssText='--pc:'+(cor||'#e9b93f')+';--dur:'+dur+'ms';
  f.innerHTML=esc(tit)+(sub?'<small>'+esc(sub)+'</small>':'');
  $('fx').appendChild(f); setTimeout(function(){f.remove();},dur+40);
  return sleep(dur);
}

// ---------- palco central (espera o clique) ----------
function retHTML(c,sub){var e=ESC[c.escola];return '<div class="ret" style="--e1:'+e.cor+';--e2:'+e.cor2+'"><span class="rc" title="custo em ideias">'+c.custo+'</span><div class="f" style="background-image:url(img/'+c.id+'.jpg)"></div><div class="n">'+esc(c.nome)+'<small>'+esc(sub||e.nome)+'</small></div></div>';}
function palco(html){
  return new Promise(function(res){
    var p=$('palco');
    emPalco=true; cancelarSel();
    p.innerHTML=html.replace('%CONT%','<div class="cont">clique para continuar</div>');
    p.classList.add('on');
    function fim(){ p.removeEventListener('click',fim); document.removeEventListener('keydown',tecla); p.classList.remove('on'); p.innerHTML=''; emPalco=false; res(); }
    function tecla(e){ if(e.key==='Enter'||e.key===' '||e.key==='Escape'){e.preventDefault();fim();} }
    setTimeout(function(){p.addEventListener('click',fim);document.addEventListener('keydown',tecla);},300);
  });
}
function relHTML(r){
  var a=C(r.a), b=C(r.b);
  return '<div class="rel"><span class="mini-ret" style="background-image:url(img/'+b.id+'.jpg)"></span><div><b>'+esc(a.nome)+' × '+esc(b.nome)+'</b> — '+esc(r.nota)+'<div class="fonte">'+esc(r.fonte)+' · a verificar</div></div></div>';
}
var PFX='Na fase de Reflexão, ';
function palcoBaixa(f){
  var c=C(f.id), pl=S.players[f.P], d=BF.duplaDe(c.id), lista=[];
  var naRef=c.c1.d.indexOf(PFX)===0;
  if(f.lib){
    lista.push('Produz '+BF.nI(c.custo)+' por turno para a Biblioteca');
    lista.push('Não participa dos debates e não recebe ideias');
  } else {
    lista.push(c.nome+' recebe '+BF.nI(BF.REFLEXAO[c.custo]));
    if(d)lista.push('Dupla clássica com '+C(d[1]).nome+': +'+BF.nI(BF.BONUS_DUPLA));
  }
  if(naRef){var r=c.c1.d.slice(PFX.length); lista.push('<span class="peq">'+esc(c.c1.t)+': '+esc(r.charAt(0).toUpperCase()+r.slice(1))+'</span>');}
  var quando=f.lib?'Começará a produzir no próximo turno.':c.id==='nietzsche'?'Vontade de Poder: entra em ação já neste turno.':'Entrará em ação no próximo turno.';
  var jog='<div class="jogada" style="--pc:'+pl.cor+'"><b>'+esc(pl.nome)+'</b> ▸ '+(f.lib?'nomeia Bibliotecário':'baixa a carta')+'<span>'+quando+'</span></div>';
  return palco('<div class="cena">'+retHTML(c)+'<div class="fala">'+jog
    +'<h3><small class="rot">Poder</small>'+esc(c.c1.t)+'</h3><p>'+esc(c.c1.d)+'</p>'
    +'<div class="refl"><b>Na fase de Reflexão:</b><ul>'+lista.map(function(x){return '<li>'+(x.indexOf('<span')===0?x:esc(x))+'</li>';}).join('')+'</ul></div>%CONT%</div></div>');
}
function palcoDebate(f){
  var c=C(f.id), q=DEB[f.did], pl=S.players[f.P], x=f.fala;
  var h='<div class="cena">'+retHTML(c,pl.nome)+'<div class="fala"><div class="et">'+esc(c.nome)+' entra no debate · '+esc(AREA[q.area].nome)+'</div><h3>'+esc(q.q)+'</h3>';
  if(x)h+='<p class="'+(x[0]==='c'?'cit':'')+'">'+(x[0]==='c'?'“'+esc(x[1])+'”':esc(x[1]))+'</p><div class="fonte">'+esc(x[2])+'<span class="tipo '+x[0]+'">'+TIPO[x[0]]+'</span> · a verificar</div>';
  (f.rels||[]).forEach(function(r){h+=relHTML(r);});
  return palco(h+'%CONT%</div></div>');
}
function palcoRel(f){
  var q=DEB[f.did], h='';
  f.rels.forEach(function(r){
    h+='<div class="cena rel"><div class="duo">'+retHTML(C(r.a))+'<div class="x">×</div>'+retHTML(C(r.b))+'</div><div class="fala"><div class="et">Contexto histórico · «'+esc(q.q)+'»</div><p>'+esc(r.nota)+'</p><div class="fonte">'+esc(r.fonte)+' · a verificar</div>%CONT%</div></div>';
  });
  return palco(h);
}

// ---------- tocar efeitos ----------
// Livros e troféus que uma cena ainda vai "entregar" ficam escondidos até ela revelá-los.
function prepararOcultos(lista){
  var n=0;
  function add(k,q){ if(q>0){ocultos[k]=(ocultos[k]||0)+q;n++;} }
  lista.forEach(function(f){
    if(f.k==='debate')add(f.did+':'+f.P,f.amt);
    else if(f.k==='segue'&&f.did)add(f.did+':'+f.P,1);
    else if(f.k==='praxis'&&f.did&&f.ganho>0)add(f.did+':'+f.P,f.ganho);
    else if(f.k==='vit')add('trof:'+f.P,1);
  });
  if(n){redesenhar();if(sel)reaplicarSel();}
}
async function revelar(did,P,n){
  var key=did+':'+P, m=M3();
  for(var k=0;k<n;k++){
    if(!(ocultos[key]>0))continue;
    ocultos[key]--;
    if(m)m.cairLivro(did,P);
    var t=q$('[data-est="'+key+'"]'), ne=t&&t.parentNode.querySelector('.n');
    if(ne){ne.textContent=(parseInt(ne.textContent,10)||0)+1;ne.classList.remove('zero');}
    await sleep(veloz?35:80);
  }
}
function revelarTrofeu(P){
  if(ocultos['trof:'+P]>0)ocultos['trof:'+P]--;
  var t=q$('[data-trof="'+P+'"] .trofeu.porvir'); if(t){t.classList.remove('porvir');t.classList.add('chegou');}
  var v=q$('[data-trof="'+P+'"] .tv'); if(v)v.remove();
}
var CTX={
  mesa:function(){return $('mesa');},
  elMini:elMini,
  elTorre:function(did,P){return q$('[data-est="'+did+':'+P+'"]');},
  elTorreSlot:function(di,P){return q$('.est[data-row="'+di+':'+P+'"] .torre');},
  elDeb:function(di){return q$('.deb[data-di="'+di+'"]');},
  elTrofeu:function(P){return q$('[data-trof="'+P+'"]');},
  idDoGrupo:function(P,fi){var g=S.players[P].group[fi];return g?g.id:null;},
  revelar:revelar, revelarTrofeu:revelarTrofeu,
  lidera:function(did,P){for(var i=0;i<S.debates.length;i++)if(S.debates[i].id===did)return BF.lidera(S,i,P);return false;},
  nome:function(P){return S.players[P].nome;}, cor:function(P){return S.players[P].cor;},
  carta:function(id){return C(id);}, area:function(a){return AREA[a];}
};
async function tocar(lista){
  var bloq=S.turn!==0||S.over;
  prepararOcultos(lista);
  for(var k=0;k<lista.length;k++){
    var f=lista[k], pl=S.players[f.P];
    switch(f.k){
      case 'pop': if(bloq) await balao(f); else enfileirar(f); break;
      case 'turno': if(!S.over) await faixa(f.P===0?'Sua vez':pl.nome,'Rodada '+S.round+' · Fase de Reflexão',pl.cor,veloz?700:(f.P===0?1500:1200)); break;
      case 'troca': await esperarBaloes(); await faixa((f.P===0?'Você troca ':pl.nome+' troca ')+C(f.a).nome+' por '+C(f.b).nome,'Os dois perdem as ideias e entram em ação no próximo turno',pl.cor,veloz?1500:3200); break;
      case 'bib': if(f.P===0){var b=$('bib'); if(b){b.classList.remove('chegou');void b.offsetWidth;b.classList.add('chegou');}} if(M3())M3().chegarEstante(f.P,f.n); break;
      case 'dar': if(M3())voo(M3().mundoEstante(f.P),M3().mundoPilha(f.P,f.id),f.n,f.P); if(bloq) await sleep(veloz?400:900); break;
      case 'baixa': await esperarBaloes(); await palcoBaixa(f); break;
      case 'debate':
        await BFX.cena('entrada',f);
        if(f.fala){ await esperarBaloes(); await palcoDebate(f); }
        else {
          var bal={P:f.P,id:f.id,tit:C(f.id).nome+' +'+f.amt,txt:'em «'+DEB[f.did].q+'»',tom:'mov'};
          if(bloq) await balao(bal); else enfileirar(bal);
          if(f.rels&&f.rels.length){ await esperarBaloes(); await palcoRel(f); }
        }
        break;
      case 'segue': if(M3())voo(M3().mundoPilha(f.P,f.id),M3().topoTorre(f.did,f.P),1,f.P); await sleep(veloz?200:420); await revelar(f.did,f.P,1); break;
      case 'vit': await esperarBaloes(); await BFX.cena('vitoria',f); break;
      case 'praxis': await esperarBaloes(); await BFX.cena('falacia',f); break;
      case 'dupla': [f.a,f.b].forEach(function(id){brilhar(f.P,id,'#c2410c');}); BFX.coro('aplauso','Dupla clássica!',1300); break;
    }
  }
  if(bloq) await esperarBaloes();
  var sobra=Object.keys(ocultos).some(function(k){return ocultos[k]>0;});
  ocultos={}; if(sobra){redesenhar();}
}
function agir(fn){ cancelarSel(); fn(); aberto=null; $('ov').classList.remove('on'); render();
  animando=tocar(S.fx.splice(0)).then(function(){ animando=null; render(); if(S.over)telaFim(); }); }

// ---------- carta ampliada (só leitura) ----------
function bigHTML(c){
  if(c.tipo==='P')return '<div class="bigP"><span class="bc">'+c.custo+'</span><h3>'+esc(c.nome)+'</h3><div class="ps">'+esc(c.sub)+'</div><p>'+esc(c.d)+'</p></div>';
  var e=ESC[c.escola], d=BF.duplaDe(c.id);
  var pills=BF.AREAS.map(function(a){return '<div class="pill" style="--c:'+AREA[a].cor+'">'+AREA[a].nome+'<b>'+c.vals[a]+'</b></div>';}).join('');
  return '<div class="big" style="--e1:'+e.cor+';--e2:'+e.cor2+'"><div class="foto" style="background-image:url(img/'+c.id+'.jpg)"></div>'
    +'<span class="bc">'+c.custo+'</span><div class="head"><i>'+esc(c.pre)+'</i><b>'+esc(c.nome)+'</b></div><div class="areas">'+pills+'</div>'
    +'<div class="corpo">'
    +'<div class="conc c1"><span class="cc">–</span><b><small class="rot">Poder</small>'+esc(c.c1.t)+'</b>'+esc(c.c1.d)+'</div>'
    +'<div class="conc info"><b>Na fase de Reflexão:</b> recebe '+BF.nI(BF.REFLEXAO[c.custo])+(d?' · <b>Dupla clássica</b> com '+esc(C(d[1]).nome)+': +'+BF.nI(BF.BONUS_DUPLA):'')+'</div>'
    +'<div class="conc off"><span class="cc">'+c.c2.custo+'</span><b><small class="rot">Poder 2</small>'+esc(c.c2.t)+'</b>'+esc(c.c2.d)+'</div>'
    +'<div class="conc off"><span class="cc">'+c.c3.custo+'</span><b><small class="rot">Poder 3</small>'+esc(c.c3.t)+'</b>'+esc(c.c3.d)+'</div>'
    +(c.cit?'<div class="cit">“'+esc(c.cit)+'”<small>'+esc(c.citFonte)+'</small></div>':'')
    +'</div>'
    +'<div class="pe"><div>'+esc(c.datas)+'</div><div class="sc">'+esc(c.local)+'</div><div class="sc">Obra de referência</div><div><em>'+esc(c.obra)+'</em></div></div>'
    +'<div class="esc">'+e.nome+'</div></div>';
}
function verCarta(id){
  cancelarSel();
  $('box').innerHTML=bigHTML(C(id))+'<div class="fecha"><button class="btn" data-a="fechar">Fechar</button></div>';
  $('ov').classList.add('on'); aberto={id:id};
  var b=$('box').querySelector('[data-a=fechar]'); if(b)b.focus();
}
function fechar(){ $('ov').classList.remove('on'); aberto=null; }
function modal(html){ cancelarSel(); aberto=null; $('box').innerHTML=html; $('ov').classList.add('on'); }

// ---------- alvos (mesmo cálculo para clique e arrasto) ----------
function q$(s){return document.querySelector(s);}
function alvosDe(tipo,ref){
  var out=[], pl=S.players[0], c;
  if(tipo==='fil'){
    var i=ref;
    BF.moveOptions(S,0,i).forEach(function(o){var d=q$('.deb[data-di="'+o.di+'"]'); if(d)out.push({el:d,fn:function(){BF.moveToDebate(S,0,i,o.di);}});});
  } else if(tipo==='livro'){
    pl.group.forEach(function(g,k){ if(BF.canGive(S,0,k)){var s=q$('[data-seat="'+k+'"] .mini'); if(s)out.push({el:s,dar:k});} });
  } else if(tipo==='troca'){
    if(!BF.podeTrocar(S,0))return out;
    pl.group.forEach(function(g,k){ if(g.lib)return; var e=q$('[data-seat="'+k+'"] .mini'); if(!e)return;
      out.push({el:e,dica:'Agora escolha o filósofo de um adversário.',prox:function(){
        var r=[]; for(var o=1;o<S.players.length;o++) S.players[o].group.forEach(function(x,oi){ if(x.lib)return; var t=q$('[data-op="'+o+'"][data-oi="'+oi+'"] .mini'); if(t)r.push({el:t,fn:(function(o,oi){return function(){BF.trocar(S,0,k,o,oi);};})(o,oi)}); });
        return r; }});
    });
  } else if(tipo==='mao'){
    var id=ref; c=C(id);
    if(c.custo>pl.library)return out;
    if(c.tipo==='F'){
      if(pl.group.length<4)out.push({el:$('megrupo'),fn:function(){BF.playPhilosopher(S,0,id);}});
      else pl.group.forEach(function(g,k){var s=q$('[data-seat="'+k+'"] .mini'); if(s)out.push({el:s,fn:function(){BF.playPhilosopher(S,0,id,k);}});});
      if((pl.group.length<4||BF.libIdx(pl)>=0)&&$('bib'))out.push({el:$('bib'),fn:function(){BF.playPhilosopher(S,0,id,undefined,true);}});
    } else {
      var po=BF.praxisOptions(S,0,c.id);
      function jogar(o){return function(){BF.playPraxis(S,0,id,o.prm,o.label);};}
      if(c.id==='autoridade') po.forEach(function(o){var e=q$('.deb[data-di="'+o.prm.d+'"]'); if(e)out.push({el:e,fn:jogar(o)});});
      else if(c.id==='petitio') po.forEach(function(o){var e=q$('[data-seat="'+o.prm.fi+'"] .mini'); if(e)out.push({el:e,fn:jogar(o)});});
      else if(['espantalho','sofisma','reductio','retorsio','falseabilidade'].indexOf(c.id)>=0)
        po.forEach(function(o){var e=q$('.est[data-row="'+o.prm.d+':'+o.prm.o+'"]'); if(e)out.push({el:e,fn:jogar(o)});});
      else if(c.id==='adhominem'){
        var vistos={};
        po.forEach(function(o){var k=o.prm.o+':'+o.prm.fi; if(vistos[k])return; vistos[k]=1;
          var e=q$('[data-op="'+o.prm.o+'"][data-oi="'+o.prm.fi+'"] .mini'); if(!e)return;
          out.push({el:e,dica:'Agora escolha o debate que recebe as ideias.',prox:function(){
            return po.filter(function(x){return x.prm.o===o.prm.o&&x.prm.fi===o.prm.fi;}).map(function(x){return {el:q$('.deb[data-di="'+x.prm.d+'"]'),fn:jogar(x)};}).filter(function(a){return a.el;});
          }});
        });
      } else if(c.id==='mutatio'){
        var vd={};
        po.forEach(function(o){ if(vd[o.prm.d])return; vd[o.prm.d]=1;
          var e=q$('.deb[data-di="'+o.prm.d+'"]'); if(!e)return;
          out.push({el:e,dica:'Agora escolha o debate de destino.',prox:function(){
            return po.filter(function(x){return x.prm.d===o.prm.d;}).map(function(x){return {el:q$('.deb[data-di="'+x.prm.d2+'"]'),fn:jogar(x)};}).filter(function(a){return a.el;});
          }});
        });
      }
    }
  }
  return out;
}
var DICAS={
  fil:function(r){var c=C(S.players[0].group[r].id);return '<b>'+esc(c.nome)+'</b>: escolha um debate aceso.';},
  livro:function(){return '<b>Biblioteca</b>: clique num filósofo para dar 1 ideia ('+S.players[0].library+' restantes).';},
  mao:function(r){var c=C(r);return '<b>'+esc(c.nome)+'</b> (custo '+BF.nI(c.custo)+'): '+(c.tipo==='F'?'escolha uma cadeira, ou a Biblioteca para nomeá-lo Bibliotecário.':'escolha um alvo aceso.');},
  troca:function(){return '<b>Troca</b> ('+BF.nI(S.cfg.custoTroca)+', uma vez por partida): escolha o seu filósofo que sai.';}
};
function motivoSemAlvo(tipo,ref){
  var pl=S.players[0];
  if(tipo==='fil')return BF.porqueNao(S,0,ref);
  if(tipo==='livro')return pl.library?'Nenhum filósofo pode receber ideias agora.':'A Biblioteca está vazia.';
  if(tipo==='troca')return 'Troca indisponível.';
  var c=C(ref);
  if(c.custo>pl.library)return 'Custa '+BF.nI(c.custo)+'; a Biblioteca tem '+BF.nI(pl.library)+'.';
  if(c.tipo==='P')return 'Sem alvo válido agora. Falácias só agem em debates em que você já tem ideias.';
  return 'Não há onde baixar.';
}
function origemEl(tipo,ref){
  if(tipo==='fil')return q$('[data-seat="'+ref+'"] .mini');
  if(tipo==='livro')return $('bib');
  if(tipo==='troca')return q$('[data-a=troca]');
  return q$('#hud .mao [data-id="'+ref+'"]');
}
function iniciarSel(tipo,ref){
  if(!pode())return;
  if(sel&&sel.tipo===tipo&&sel.ref===ref){cancelarSel();return;}
  sel={tipo:tipo,ref:ref,passo:null};
  reaplicarSel();
}
function reaplicarSel(){
  document.querySelectorAll('.alvo,.selecionado').forEach(function(e){e.classList.remove('alvo','sobre','selecionado');});
  if(!sel||!pode()){ if(sel)cancelarSel(); return; }
  var o=origemEl(sel.tipo,sel.ref);
  if(!o&&sel.tipo!=='livro'&&sel.tipo!=='troca'){cancelarSel();return;}
  sel.alvos=sel.passo?sel.passo():alvosDe(sel.tipo,sel.ref);
  if(sel.tipo==='livro'&&!sel.alvos.length&&sel.dadas){cancelarSel();return;}
  if(o)o.classList.add('selecionado');
  sel.alvos.forEach(function(a){a.el.classList.add('alvo');});
  var t=sel.alvos.length?(sel.dicaPasso||DICAS[sel.tipo](sel.ref)):'<b>'+esc(motivoSemAlvo(sel.tipo,sel.ref))+'</b>';
  var cid=sel.tipo==='fil'?S.players[0].group[sel.ref].id:sel.tipo==='mao'?sel.ref:null;
  $('dica').innerHTML='<span class="t">'+t+'</span>'+(cid?'<button class="btn sm" data-a="lupa" data-id="'+cid+'">Ver carta</button>':'')+'<button class="btn sm" data-a="cancelar">'+(sel.tipo==='livro'&&sel.dadas?'Pronto':'Cancelar')+'</button>';
  document.body.classList.add('escolhendo');
}
function cancelarSel(){
  sel=null;
  document.body.classList.remove('escolhendo');
  document.querySelectorAll('.alvo,.selecionado').forEach(function(e){e.classList.remove('alvo','sobre','selecionado');});
}
function usarAlvo(a){
  if(a.dar!==undefined){ BF.giveIdea(S,0,a.dar); S.fx.length=0; sel.dadas=(sel.dadas||0)+1; render(); return; }
  if(a.prox){ var p=a.prox; sel.passo=p; sel.dicaPasso='<b>'+esc(sel.tipo==='troca'?'Troca':C(sel.ref).nome)+'</b>: '+esc(a.dica); reaplicarSel(); return; }
  if(a.fn) agir(a.fn);
}

// ---------- fluxo ----------
function rodarIA(){
  if(ocupado)return; ocupado=true; cancelarSel(); render();
  (async function(){
    if(animando) await animando;
    await tocar(S.fx.splice(0));
    while(!S.over&&!S.players[S.turn].human){
      await sleep(veloz?150:600);
      BF.aiStep(S); if(S.turn===0)bibChegou=true; render();
      await tocar(S.fx.splice(0));
    }
    ocupado=false; render(); if(S.over)telaFim();
  })();
}
function cartaJogavel(){
  var pl=S.players[0];
  for(var i=0;i<pl.hand.length;i++){var c=C(pl.hand[i]);
    if(c.custo>pl.library)continue;
    if(c.tipo==='F'&&pl.group.length<4)return c;
    if(c.tipo==='P'&&BF.praxisOptions(S,0,c.id).length)return c;}
  return null;
}
function encerrar(confirmado){
  var pl=S.players[0], cj=cartaJogavel();
  cancelarSel();
  if(!confirmado&&cj){ modal('<h2>Encerrar o turno?</h2><p>Você ainda tem ideias na Biblioteca para baixar <b>'+esc(cj.nome)+'</b> (custo '+cj.custo+').</p><div class="fecha"><button class="btn" data-a="fechar">Voltar</button><button class="btn pri" data-a="fimturno2">Encerrar assim mesmo</button></div>'); return; }
  var exc=pl.hand.length-5;
  if(exc>0){ pedirDescarte(exc); return; }
  finalizar();
}
function finalizar(desc){ BF.endTurn(S,desc); fechar(); if(S.turn===0)bibChegou=true; rodarIA(); }
var descSel=[];
function pedirDescarte(n){
  descSel=[];
  var pl=S.players[0], h='<h2>Descartar '+n+' carta(s)</h2><p>O limite da mão é 5. Escolha o que sai.</p><div class="hand" style="--w:118px">';
  pl.hand.forEach(function(id){var c=C(id); h+=c.tipo==='F'?miniF(null,c,'data-a="dsel" data-id="'+id+'"'):miniP(c,'data-a="dsel" data-id="'+id+'"');});
  modal(h+'</div><div class="fecha"><button class="btn" data-a="fechar">Voltar</button><button class="btn pri" id="dok" data-a="dok" data-n="'+n+'" disabled>Descartar e encerrar</button></div>');
}
function telaFim(){
  var ord=S.players.map(function(p,i){return i;}).sort(function(a,b){return S.players[b].points-S.players[a].points;});
  var h='<h2>'+(S.vencedor<0?'Empate':S.vencedor===0?'Você venceu':S.players[S.vencedor].nome+' venceu')+'</h2><div class="placar">';
  ord.forEach(function(i){var p=S.players[i]; h+='<div class="l" style="--pc:'+p.cor+'"><b>'+p.points+'</b><div>'+esc(p.nome)+'<br><small>'+(p.won.length?p.won.map(function(d){return '«'+DEB[d].q+'» ('+DEB[d].valor+')';}).join(' · '):'nenhum debate vencido')+'</small></div></div>';});
  modal(h+'</div><div class="fecha"><button class="btn" data-a="fechar">Ver a mesa</button><button class="btn pri" data-a="inicio">Nova partida</button></div>');
}
function regrasHTML(){
  return '<ul><li><b>Ideias são livros.</b> São a única moeda: pagam cartas e erguem as torres dos debates.</li>'
    +'<li><b>Fase de Reflexão</b> (início do turno, automática): você compra uma carta, a Biblioteca recebe 3 ideias (e guarda o que sobrar de um turno para outro), e cada filósofo reflete: +1 ideia (custo 1 ou 2), +2 (custo 3 ou 4) ou +3 (custo 5). Quem tem colega da mesma escola ganha +1. Depois disparam os poderes.</li>'
    +'<li><b>Sua vez, em qualquer ordem:</b> baixar cartas, dar ideias da Biblioteca aos filósofos e levá-los aos debates. Clique numa carta e a mesa mostra onde ela pode agir; ou arraste.</li>'
    +'<li><b>Debate:</b> o filósofo leva exatamente o valor que tem na área da pergunta. Sem esse tanto de ideias, não vai. Cada um debate uma vez por turno.</li>'
    +'<li><b>Recém-baixado:</b> entra em ação no próximo turno.</li>'
    +'<li><b>Bibliotecário:</b> solte um filósofo na Biblioteca para nomeá-lo. Ocupa uma cadeira, não debate e produz, a cada turno, tantas ideias quanto o seu custo, direto para a Biblioteca.</li>'
    +'<li><b>Troca</b> (5 ideias, uma vez por partida): troque um filósofo seu por um de um adversário. Os dois perdem as ideias e entram em ação no turno seguinte.</li>'
    +'<li><b>Vencer um debate:</b> no início do seu turno, ter ideias iguais ou acima do valor e ninguém com mais que você. O marco dourado da prateleira marca esse valor. Prateleira cheia (o dobro do valor) é vitória imediata.</li>'
    +'<li><b>Fim:</b> 30 pontos ou 12 rodadas. Duplo clique (ou botão direito) numa carta mostra a carta ampliada.</li></ul>';
}
function telaInicio(){
  modal('<h2>Batalhas Filosóficas</h2><p>Filósofos disputam as grandes perguntas da filosofia. Você joga contra Hipátia e Sêneca, com três escolas na pilha: Grécia Clássica, Materialistas e Empiristas, Germânicos, mais dois livres-pensadores.</p>'
    +regrasHTML()
    +'<div class="lab" style="margin-top:12px">Oponentes</div><div class="sel"><label><input type="radio" name="niv" value="aprendiz" checked>Aprendizes<br><small style="color:var(--mute)">erram mais, usam menos falácias</small></label><label><input type="radio" name="niv" value="mestre">Mestres<br><small style="color:var(--mute)">calculam cada debate</small></label></div>'
    +'<div class="fecha"><button class="btn pri" data-a="comecar">Começar</button></div>');
}
function nova(nivel){ S=BF.newGame({niveis:['mestre',nivel,nivel]}); if(location.hash==='#diogenes')comDiogenes(); logN=0; bibChegou=true; fechar(); rodarIA(); }
// Teste da marionete: abrir a página com #diogenes no fim do endereço põe o Diógenes, já ativo e com 4 ideias, no seu grupo.
function comDiogenes(){
  var tira=function(a){var i=a.indexOf('diogenes'); if(i>=0)a.splice(i,1);};
  tira(S.deck); S.players.forEach(function(x){tira(x.hand); x.group=x.group.filter(function(g){return g.id!=='diogenes';});});
  S.players[0].group.unshift({id:'diogenes',ideas:4,novo:false,acted:false});
}

// ---------- cliques ----------
document.addEventListener('click',function(ev){
  if(Date.now()-ultimoArrasto<150)return;
  // modo de seleção: alvo executa; resto cancela
  if(sel&&!emPalco&&!$('ov').classList.contains('on')){
    var al=ev.target.closest('.alvo');
    if(al){ var a=null; sel.alvos.forEach(function(x){if(x.el===al)a=x;}); if(a){usarAlvo(a);return;} }
    var b=ev.target.closest('[data-a]');
    if(b&&b.dataset.a==='lupa'){verCarta(b.dataset.id);return;}
    if(b&&b.closest('.dica')){cancelarSel();return;}
    if(b&&(b.dataset.a==='mao'||b.dataset.a==='grupo'||b.dataset.a==='bib')){ /* troca de seleção */ }
    else { cancelarSel(); if(!b)return; }
  }
  var t=ev.target.closest('[data-a]');
  if(!t){ if(ev.target===$('ov')&&S&&aberto)fechar(); return; }
  var a2=t.dataset.a, i=t.dataset.i!==undefined?+t.dataset.i:undefined, id=t.dataset.id;
  if(a2==='comecar'){var r=document.querySelector('input[name=niv]:checked'); nova(r?r.value:'aprendiz'); return;}
  if(a2==='inicio'){telaInicio();return;}
  if(!S){ if(a2==='fechar')telaInicio(); return; }
  var meu=pode();
  switch(a2){
    case 'fechar': fechar(); break;
    case 'ver': verCarta(id); break;
    case 'grupo': if(meu)iniciarSel('fil',i); else verCarta(S.players[0].group[i].id); break;
    case 'mao': if(meu)iniciarSel('mao',id); else verCarta(id); break;
    case 'bib': if(meu)iniciarSel('livro',null); break;
    case 'troca': if(meu)iniciarSel('troca',null); break;
    case 'fim': telaFim(); break;
    case 'dar': if(meu){BF.giveIdea(S,0,i);render();tocar(S.fx.splice(0));} break;
    case 'extra': if(meu)agir(function(){BF.buyExtra(S,0);}); break;
    case 'fimturno': if(meu)encerrar(false); break;
    case 'fimturno2': if(meu){fechar();encerrar(true);} break;
    case 'dsel':
      var k=descSel.indexOf(id); if(k>=0){descSel.splice(k,1);t.style.outline='';}else{descSel.push(id);t.style.outline='3px solid #d8483c';}
      var ok=$('dok'); if(ok)ok.disabled=descSel.length!==+ok.dataset.n; break;
    case 'dok': if(meu)finalizar(descSel.slice()); break;
  }
});
document.addEventListener('contextmenu',function(e){
  var m=e.target.closest('.mini[data-cid]'); if(!m||!S)return;
  e.preventDefault(); verCarta(m.dataset.cid);
});
// duplo clique numa carta (mão, púlpito ou adversário): carta ampliada
document.addEventListener('dblclick',function(e){
  var m=e.target.closest('.mini[data-cid]'); if(!m||!S||m.closest('.ov'))return;
  e.preventDefault(); verCarta(m.dataset.cid);
});
document.addEventListener('keydown',function(e){
  if(e.key!=='Escape'||!S)return;
  if($('ov').classList.contains('on')&&aberto){fechar();return;}
  if(sel)cancelarSel();
});

// ---------- arrastar e soltar ----------
var arr=null;
function refDe(el){ var t=el.dataset.drag; return t==='fil'?+el.dataset.i:t==='mao'?el.dataset.id:null; }
document.addEventListener('pointerdown',function(e){
  if(e.button)return;
  var el=e.target.closest('[data-drag]'); if(!el||!pode())return;
  arr={el:el,tipo:el.dataset.drag==='livro'?'livro':el.dataset.drag,ref:refDe(el),x:e.clientX,y:e.clientY,on:false};
});
document.addEventListener('pointermove',function(e){
  if(!arr)return;
  if(!arr.on){
    if(Math.hypot(e.clientX-arr.x,e.clientY-arr.y)<8)return;
    cancelarSel();
    sel={tipo:arr.tipo,ref:arr.ref,passo:null}; reaplicarSel(); arr.alvos=sel.alvos;
    arr.on=true; document.body.classList.add('arrastando');
    var g;
    if(arr.tipo==='livro'){g=document.createElement('div');g.innerHTML='<i class="liv" style="--pc:#e9b93f;width:12px;height:34px"></i>';arr.dx=6;arr.dy=17;}
    else if(arr.tipo==='fil'){var t0=document.createElement('div');t0.innerHTML=miniF(null,C(S.players[0].group[arr.ref].id),'','');g=t0.firstChild;g.style.setProperty('--w','84px');arr.dx=42;arr.dy=58;}
    else{var r=arr.el.getBoundingClientRect();g=arr.el.cloneNode(true);g.style.width=r.width+'px';g.style.height=r.height+'px';arr.dx=arr.x-r.left;arr.dy=arr.y-r.top;arr.el.classList.add('origem');}
    g.classList.add('fantasma'); document.body.appendChild(g); arr.g=g;
  }
  arr.g.style.transform='translate('+(e.clientX-arr.dx)+'px,'+(e.clientY-arr.dy)+'px) rotate(3deg)';
  var sob=document.elementFromPoint(e.clientX,e.clientY), al=sob&&sob.closest('.alvo');
  arr.alvos.forEach(function(a){a.el.classList.toggle('sobre',a.el===al);});
  e.preventDefault();
});
function soltar(e){
  if(!arr)return;
  var a=arr; arr=null;
  if(!a.on)return;
  ultimoArrasto=Date.now();
  var sob=document.elementFromPoint(e.clientX,e.clientY), al=sob&&sob.closest('.alvo'), hit=null;
  a.alvos.forEach(function(x){x.el.classList.remove('sobre'); if(x.el===al)hit=x;});
  a.g.remove(); a.el.classList.remove('origem'); document.body.classList.remove('arrastando');
  if(!hit||e.type==='pointercancel'){cancelarSel();return;}
  if(hit.dar!==undefined){ BF.giveIdea(S,0,hit.dar); S.fx.length=0; cancelarSel(); render(); return; }
  usarAlvo(hit);
}
document.addEventListener('pointerup',soltar);
document.addEventListener('pointercancel',soltar);
document.addEventListener('dragstart',function(e){e.preventDefault();});

$('bveloc').onclick=function(){veloz=!veloz;BFX.veloz=veloz;document.body.classList.toggle('veloz',veloz);this.textContent='Ritmo: '+(veloz?'rápido':'normal');};
// carta com volume: inclina conforme o ponteiro
var inclinada=null;
document.addEventListener('pointermove',function(e){
  var m=e.pointerType==='mouse'&&!arr&&e.target.closest?e.target.closest('.mini'):null;
  if(inclinada&&inclinada!==m){inclinada.style.removeProperty('--rx');inclinada.style.removeProperty('--ry');inclinada=null;}
  if(!m||m.classList.contains('fantasma')||m.closest('#mesa'))return;
  var r=m.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
  m.style.setProperty('--ry',(x*16).toFixed(1)+'deg'); m.style.setProperty('--rx',(-y*12).toFixed(1)+'deg'); inclinada=m;
});
$('bdiario').onclick=$('bdiario2').onclick=function(){document.body.classList.toggle('diario');};
BFX.ligar(CTX);
$('bregras').onclick=function(){modal('<h2>Como jogar</h2>'+regrasHTML()+'<p style="font-size:13.5px;color:var(--mute)">Protótipo de nível 2: valem os valores das áreas e o poder gratuito de cada filósofo. Os poderes pagos aparecem na carta ampliada, marcados como nível 3. Falas, citações e contextos históricos ainda estão por verificar.</p><div class="fecha"><button class="btn" data-a="fechar">Fechar</button></div>');};
$('bnova').onclick=telaInicio;
window.__bf={agir:agir,render:render,rodarIA:rodarIA,get S(){return S;},get ocupado(){return ocupado;},get emPalco(){return emPalco;},get animando(){return animando;},get sel(){return sel;}};
telaInicio();
})();
