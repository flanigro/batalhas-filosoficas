/* Batalha dos Filósofos — assistente Φ (roteiro aprovado pelo Flavio em 23/11/2026)
 * Um balão por vez, no centro da tela (na faixa livre entre as placas e os pódios). Acompanha as três primeiras
 * rodadas e dá cada dica uma vez por partida. O ponto central é o valor exato: o filósofo leva ao debate
 * exatamente o valor dele na área, e pode completar com ideias da Biblioteca.
 * Dois tipos de balão:
 *   - de ação (no seu turno): não trava nada; some quando há ação no centro, na seleção e nos turnos dos adversários;
 *   - de momento (antes do momento de Reflexão, depois de uma vitória ou de uma falácia): segura o jogo até o "Entendi".
 * Ligado na primeira partida; a partir da segunda, desligado, com a opção de ligar na escolha dos oponentes ou em
 * Preferências. A escolha e o "já jogou" ficam no navegador. */
(function () {
  'use strict';
  var C = BF.C, DEB = BF.DEB, AREA = BF.AREA;
  var ligado = false, R = null, atual = null, espera = null, el = null, ultimoHTML = '';
  var COR_NOME = ['amarela', 'azul-clara', 'rosa'];

  function guarda(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function B() { return window.__bf; }
  function S() { return B() && B().S; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function nI(n) { return BF.nI(n); }
  function q(d) { return '«' + DEB[d.id].q + '»'; }
  function aberto(id) { var e = document.getElementById(id); return !!(e && e.classList.contains('on')); }

  // ---------- estado da partida ----------
  function novaPartida(on) {
    R = { vistos: {}, plano: null };
    guarda('bf-phi-jogou', '1');
    ligar(on, true);
  }
  function jaJogou() { return guarda('bf-phi-jogou') === '1'; }
  function ligar(on, quieto) {
    ligado = !!on;
    var cb = document.getElementById('pphi'); if (cb) cb.checked = ligado;
    if (!ligado && espera) { var f = espera.res; espera = null; f(); }
    if (!quieto) atualizar();
    if (!ligado) { mostrar(null); pintar([]); }
  }
  function visto(k) { return R && R.vistos[k]; }
  function marca(k) { if (R) R.vistos[k] = 1; }

  // ---------- o que o jogador tem ----------
  function eu() { return S().players[0]; }
  function cartasF() { return eu().hand.filter(function (id) { return C(id).tipo === 'F'; }); }
  function pagaveis() { var pl = eu(); return pl.group.length >= 4 ? [] : cartasF().filter(function (id) { return C(id).custo <= pl.library; }); }
  function selMao(ids) { return ids.map(function (id) { return '.rodape .mao [data-id="' + id + '"]'; }); }
  function idxDe(gid) { return eu().group.findIndex(function (g) { return g.id === gid; }); }

  // o debate que o assistente usa de exemplo: o filósofo em ação que precisa de menos ideias da Biblioteca
  function planejar() {
    var s = S(), pl = eu(), melhor = null;
    pl.group.forEach(function (g, fi) {
      if (g.lib || !BF.ativo(g) || g.acted || !BF.acumula(g)) return;
      s.debates.forEach(function (d, di) {
        if (!BF.livre(d)) return;
        var area = DEB[d.id].area, v = C(g.id).vals[area], falta = v - g.ideas;
        if (falta < 0 || falta > pl.library || v > s.cfg.teto) return;
        if (!melhor || falta < melhor.falta || (falta === melhor.falta && DEB[d.id].valor > DEB[melhor.did].valor))
          melhor = { gid: g.id, did: d.id, v: v, area: area, falta: falta };
      });
    });
    return melhor;
  }
  // confere se o plano ainda vale (o debate pode ter sido vencido; o filósofo, trocado)
  function planoVivo() {
    var p = R.plano; if (!p) return null;
    var fi = idxDe(p.gid), di = S().debates.findIndex(function (d) { return d.id === p.did; });
    if (fi < 0 || di < 0) return null;
    return { g: eu().group[fi], fi: fi, di: di, d: S().debates[di], v: p.v, area: p.area };
  }
  // o primeiro debate em que um filósofo seu já entrou
  function entrada() {
    var s = S(), pl = eu();
    for (var fi = 0; fi < pl.group.length; fi++) {
      var g = pl.group[fi]; if (!g.acted) continue;
      for (var di = 0; di < s.debates.length; di++) if (s.debates[di].part[0].indexOf(g.id) >= 0) return { g: g, fi: fi, di: di, d: s.debates[di] };
    }
    return null;
  }

  // ---------- balões de ação (no seu turno) ----------
  // cada um: chave, condição, texto e o que marcar na tela. O primeiro aplicável e ainda não visto aparece.
  function acoes() {
    var s = S(), pl = eu(), L = [], r = s.round;
    // Rodada 1: baixar um filósofo, pagando com a Biblioteca
    if (r === 1) {
      if (!pl.group.length) {
        L.push({ k: 'r1-mao', t: 'Embaixo está a sua mão, com 5 cartas: as 4 do começo e 1 que você acabou de comprar. Na sua frente, 4 pódios vazios: é onde seus filósofos vão ficar.',
          m: ['.rodape .mao', '[data-anc="grupo"]'] });
        var um = cartasF().filter(function (id) { return C(id).custo === 1; })[0] || pagaveis()[0];
        if (um) {
          var c1 = C(um), lao = c1.id === 'laotse';
          L.push({ k: 'r1-baixar', t: 'Comece baixando um filósofo. O número no canto da carta é o custo, pago com ideias da Biblioteca. Você sempre começa com um filósofo de custo 1, como ' + c1.nome + ': arraste a carta até um pódio.'
            + (lao ? ' Lao-Tsé nunca vai a debates, mas dá 1 ideia em cada debate aberto a cada turno. Se puder, baixe também outro filósofo para debater.' : ''),
            m: selMao([um]).concat(['[data-anc="grupo"]', '#bib']) });
        }
      } else {
        marca('r1-mao'); marca('r1-baixar');
        var ui = pl.group.findIndex(function (g) { return g.novo; }); if (ui < 0) ui = pl.group.length - 1;
        var cu = C(pl.group[ui].id);
        L.push({ k: 'r1-baixou', t: 'A Biblioteca pagou ' + cu.custo + ' e ficou com ' + pl.library + '. ' + cu.nome + ' acabou de chegar e só entra em ação no seu próximo turno; por isso aparece esmaecido.',
          m: ['[data-anc="seat:' + ui + '"]', '#bib'] });
        var pg = pagaveis();
        if (pg.length && visto('r1-baixou') && !visto('r1-mais')) {
          L.push({ k: 'r1-mais', t: 'Com as ' + nI(pl.library) + ' que sobraram, você ainda pode baixar ' + pg.map(function (id) { return C(id).nome; }).slice(0, 2).join(' ou ') + '. Ou guarde as ideias: elas ficam na Biblioteca para o próximo turno.',
            m: selMao(pg) });
        }
      }
      L.push({ k: 'r1-fim', t: 'Quando terminar, clique em Encerrar turno.', m: ['[data-a="fimturno"]'] });
      return L;
    }
    // Rodada 2 em diante, até o primeiro debate: o valor exato
    if (!visto('r2-vencer')) {
      if (r === 2) L.push({ k: 'r2-bib', t: 'A Biblioteca recebeu mais 3 e agora tem ' + nI(pl.library) + '. É a hora de entrar num debate.', m: ['#bib'] });
      var en = entrada();
      if (en) {
        ['r2-valor', 'r2-completar', 'r2-levar', 'r2-sem'].forEach(marca);
        L.push({ k: 'r2-entrou', t: 'As ideias que ' + C(en.g.id).nome + ' levou estão no debate e agora são suas, não do filósofo. Cada filósofo vai a um debate por turno.',
          m: ['[data-anc="est:' + en.di + ':0"]'] });
        var val = DEB[en.d.id].valor;
        L.push({ k: 'r2-vencer', t: 'Você vence ' + q(en.d) + ' se, no começo do seu próximo turno, tiver pelo menos ' + val + ' ideias e mais que cada adversário. Hipátia e Sêneca têm uma volta da mesa para reagir. Quem chega ao dobro, ' + (2 * val) + ', vence na hora.',
          m: ['[data-anc="lv:' + en.di + '"]', '[data-anc="lt:' + en.di + '"]', '[data-anc="est:' + en.di + ':0"]'] });
        return L;
      }
      var p = planoVivo();
      if (!p || p.g.acted) { R.plano = planejar(); p = planoVivo(); }
      if (!p) {
        var semAcao = !pl.group.some(function (g) { return !g.lib && BF.ativo(g) && BF.acumula(g); });
        L.push({ k: 'r2-sem', t: semAcao
          ? 'Nenhum filósofo seu pode debater agora: quem acabou de chegar só entra em ação no próximo turno, e Lao-Tsé nunca debate. Baixe um filósofo para debater na próxima rodada.'
          : 'Para entrar num debate, o filósofo leva exatamente o valor dele na área da placa: nem mais, nem menos. Agora nenhum dos seus tem esse número, nem completando com a Biblioteca. Guarde ideias e tente no próximo turno.',
          m: semAcao ? ['[data-anc="grupo"]'] : ['#bib'] });
        return L;
      }
      var nome = C(p.g.id).nome, an = AREA[p.area].curto, hegel = p.g.id === 'hegel';
      L.push({ k: 'r2-valor', t: 'Cada debate é de uma área, pela cor. Para entrar, o filósofo leva exatamente o valor dele nessa área: nem mais, nem menos. '
        + nome + ' tem ' + p.v + ' em ' + an + ', então entra em ' + q(p.d) + ' com ' + nI(p.v) + '. ' + (p.v > 1 ? 'Nem ' + (p.v - 1) + ', nem ' + (p.v + 1) + '.' : 'Nem 2.')
        + (hegel ? ' (Hegel é a exceção: a Dialética deixa que ele leve menos.)' : ''),
        m: ['[data-anc="seat:' + p.fi + '"]', '[data-anc="deb:' + p.di + '"]'] });
      if (p.g.ideas < p.v) {
        L.push({ k: 'r2-completar', t: nome + ' tem ' + p.g.ideas + '. ' + (p.v - p.g.ideas === 1 ? 'Falta 1' : 'Faltam ' + (p.v - p.g.ideas)) + ': clique no + do pódio para passar ideias da Biblioteca a ' + nome + ', uma por clique. Pense antes: o que você gasta agora pode fazer falta para baixar um filósofo mais caro depois.',
          m: ['[data-anc="pilha:0:' + p.fi + '"]', '#bib'] });
      } else if (p.g.ideas === p.v) {
        marca('r2-completar');
        L.push({ k: 'r2-levar', t: 'Agora arraste ' + nome + ' até a placa, ou clique em ' + nome + ' e depois na placa. Só acendem os debates em que dá para entrar.',
          m: ['[data-anc="seat:' + p.fi + '"]', '[data-anc="deb:' + p.di + '"]'] });
      } else {
        L.push({ k: 'r2-demais', t: nome + ' tem ideias demais para esse debate: espere outro debate de ' + an + ' ou de outra área em que o valor dê certo.', m: ['[data-anc="seat:' + p.fi + '"]'] });
      }
      return L;
    }
    // Rodada 3 em diante: completar o grupo; depois, despedida
    if (r >= 3 && !visto('r3-fim')) {
      var pg3 = pagaveis();
      if (pl.group.length < 4) L.push({ k: 'r3-mais', t: 'Quanto mais filósofos em ação, mais ideias por turno e mais debates ao mesmo tempo. Filósofos caros pensam mais: um de custo 5 ganha 3 ideias por turno.',
        m: ['[data-anc="grupo"]'].concat(selMao(pg3)) });
      L.push({ k: 'r3-poder', t: 'Cada filósofo tem um poder próprio. Para ler, dê duplo clique na carta.', m: [] });
      L.push({ k: 'r3-fim', t: 'Agora você já sabe o essencial. Daqui em diante, eu só apareço quando acontecer algo novo.', m: [] });
      return L;
    }
    return L;
  }
  // dicas de situação, uma vez por partida (depois do roteiro da rodada)
  function dicas() {
    var s = S(), pl = eu(), L = [];
    for (var di = 0; di < s.debates.length; di++) {
      var d = s.debates[di], meu = d.stakes[0];
      if (!meu || !BF.livre(d)) continue;
      for (var o = 1; o < 3; o++) if (d.stakes[o] > meu) {
        L.push({ k: 'd-ultrapassado', t: s.players[o].nome + ' passou à sua frente em ' + q(d) + '. Mande outro filósofo para lá, ou use uma carta temporária.',
          m: ['[data-anc="est:' + di + ':' + o + '"]'] });
        o = 3; di = s.debates.length;
      }
    }
    var temp = pl.hand.filter(function (id) { return C(id).tipo === 'P'; });
    if (temp.length) L.push({ k: 'd-temp', t: 'Esta é uma carta temporária: um golpe de argumentação, que você paga com ideias e usa uma vez. Quase todas só valem num debate em que você já tem ideias.', m: selMao([temp[0]]) });
    var fal = pl.hand.filter(function (id) { return C(id).fam === 'falacia'; });
    if (fal.length) L.push({ k: 'd-falacia', t: 'As cartas da caveira são falácias: argumentos que parecem bons e não são. Funcionam, mas tiram pontos de quem usa e saem do jogo.', m: selMao([fal[0]]) });
    var cheio = pl.group.findIndex(function (g) { return !g.lib && g.ideas >= s.cfg.teto; });
    if (cheio >= 0) L.push({ k: 'd-teto', t: C(pl.group[cheio].id).nome + ' chegou a ' + s.cfg.teto + ' ideias, o máximo. O que passar disso se perde: leve-o a um debate.', m: ['[data-anc="seat:' + cheio + '"]'] });
    if (s.debates.length === 3) L.push({ k: 'd-terceiro', t: 'Um terceiro debate abriu na Ágora. A partir de agora são três.', m: ['[data-anc="deb:2"]'] });
    return L;
  }

  // ---------- balões de momento (seguram o jogo até o "Entendi") ----------
  function momentos(tipo, f) {
    var s = S(), L = [], nm = function (P) { return s.players[P].nome; };
    if (tipo === 'turno' && s.round === 1 && f.P === 0) {
      L.push({ k: 'm-ola', t: 'Olá! Eu sou o Φ e vou acompanhar suas primeiras jogadas. Seu objetivo é vencer debates usando ideias. Cada debate vencido dá os pontos da placa. Vence quem chegar a 30 pontos, ou quem tiver mais ao fim de 12 rodadas.', m: ['[data-anc="deb:0"]', '[data-anc="deb:1"]'] });
      L.push({ k: 'm-reflexao1', t: 'Todo turno começa com o momento de Reflexão. Você compra uma carta, e sua Biblioteca recebe 3 ideias. As ideias são a moeda do jogo: cada livro na estante é uma ideia.', m: ['#bib'] });
    }
    if (tipo === 'turno' && s.round === 1 && f.P === 1)
      L.push({ k: 'm-adversarios', t: 'Agora jogam ' + nm(1) + ' e ' + nm(2) + ', seus adversários. Eles seguem as mesmas regras que você. Observe o que eles fazem.', m: ['[data-anc="ident:1"]', '[data-anc="ident:2"]'] });
    if (tipo === 'turno' && s.round === 2 && f.P === 0)
      L.push({ k: 'm-reflexao2', t: 'Momento de Reflexão: seus filósofos pensam e ganham ideias. Quem custa 1 ou 2 ganha 1; quem custa 3 ou 4 ganha 2; quem custa 5 ganha 3. Colegas da mesma escola ganham mais 1. Cada ganho aparece num balão de pensamento.', m: ['[data-anc="grupo"]'] });
    if (tipo === 'debate' && f.P !== 0) {
      var di = s.debates.findIndex(function (d) { return d.id === f.did; });
      L.push({ k: 'm-debate-op', t: nm(f.P) + ' levou ' + nI(f.amt) + ' a «' + DEB[f.did].q + '». Na placa, cada jogador tem a sua prateleira de livros: a de ' + nm(f.P) + ' é a ' + COR_NOME[f.P] + '.',
        m: di >= 0 ? ['[data-anc="est:' + di + ':' + f.P + '"]'] : [] });
    }
    if (tipo === 'vit' && f.P === 0)
      L.push({ k: 'm-vit-eu', t: 'Debate vencido: ' + f.valor + ' pontos! As ideias do debate se perdem, e uma pergunta nova toma o lugar.', m: [] });
    if (tipo === 'vit' && f.P !== 0)
      L.push({ k: 'm-vit-op', t: nm(f.P) + ' venceu «' + f.q + '», porque tinha mais ideias que todos no começo do próprio turno. Para impedir, é preciso passar à frente antes.', m: [] });
    if (tipo === 'praxis' && f.P !== 0 && C(f.id).fam === 'falacia')
      L.push({ k: 'm-falacia-op', t: nm(f.P) + ' usou uma falácia e perdeu ' + C(f.id).pen + (C(f.id).pen > 1 ? ' pontos' : ' ponto') + ': veja a caveira ao lado do placar.', m: ['[data-anc="ident:' + f.P + '"]'] });
    return L.filter(function (x) { return !visto(x.k); });
  }
  async function momento(tipo, f) {
    if (!ligado || !R || !S()) return;
    var L = momentos(tipo, f);
    for (var i = 0; i < L.length && ligado; i++) {
      await new Promise(function (res) { espera = { msg: L[i], res: res }; mostrar(L[i], true); });
      marca(L[i].k);
    }
    espera = null; mostrar(null);
  }

  // ---------- desenho ----------
  function caixa() {
    if (el) return el;
    el = document.createElement('div'); el.id = 'phi'; el.className = 'phi'; el.setAttribute('data-anc', 'faixa'); el.setAttribute('role', 'status');
    document.body.appendChild(el);
    el.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-phi]'); if (!b) return;
      ev.stopPropagation();
      if (b.dataset.phi === 'ok') entendi();
    });
    el.addEventListener('change', function (ev) {
      if (ev.target.name === 'phi-nao') { ligar(false); guarda('bf-phi', '0'); }
    });
    return el;
  }
  function entendi() {
    if (espera) { var f = espera.res; espera = null; f(); return; }
    if (atual) marca(atual.k);
    atualizar();
  }
  function mostrar(msg, trava) {
    var e = caixa();
    if (!msg) { e.classList.remove('on', 'trava'); ultimoHTML = ''; atual = null; pintar([]); return; }
    var h = '<div class="phi-med" aria-hidden="true">Φ</div><div class="phi-bal"><p>' + esc(msg.t) + '</p><div class="phi-pe">'
      + '<label><input type="checkbox" name="phi-nao"> Não mostrar mais o assistente</label>'
      + '<button class="btn sm pri" data-phi="ok">Entendi</button></div></div>';
    if (h !== ultimoHTML) { e.innerHTML = h; ultimoHTML = h; }
    e.classList.toggle('trava', !!trava); e.classList.add('on');
    if (window.M3D && M3D.posicionar) M3D.posicionar(true);
    atual = trava ? null : msg;
    pintar(msg.m || []);
  }
  var marcados = [];
  function pintar(sels) {
    if (sels) marcados = sels;
    document.querySelectorAll('.phi-alvo').forEach(function (x) { x.classList.remove('phi-alvo'); });
    if (!ligado) return;
    marcados.forEach(function (s) { document.querySelectorAll(s).forEach(function (x) { x.classList.add('phi-alvo'); }); });
  }

  // ---------- a cada mudança (e a cada 250 ms): o balão de ação que vale agora ----------
  function oculto() {
    var b = B(), s = S();
    return !s || s.over || s.turn !== 0 || b.ocupado || b.emPalco || b.animando || b.sel
      || aberto('abertura') || aberto('ov') || aberto('aviso') || aberto('demo') || aberto('palco') || document.body.classList.contains('escolhendo');
  }
  function atualizar() {
    if (!ligado || !R || !S()) { if (el && el.classList.contains('on') && !espera) mostrar(null); return; }
    if (espera) { mostrar(espera.msg, true); return; }
    if (oculto()) { if (el) { el.classList.remove('on'); } pintar([]); atual = null; return; }
    var L = acoes().concat(dicas()).filter(function (x) { return !visto(x.k); });
    mostrar(L[0] || null);
  }
  caixa();
  setInterval(function () { if (ligado) atualizar(); }, 250);

  window.PHI = { novaPartida: novaPartida, ligar: ligar, ligado: function () { return ligado; }, jaJogou: jaJogou, momento: momento, atualizar: atualizar, pintar: function () { pintar(); } };
})();
