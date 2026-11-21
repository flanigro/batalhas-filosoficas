// Diagnóstico da IA (21/11/2026): ideias jogadas em debate perdido, Biblioteca parada, uso de temporárias.
//   node sim/ia.js diag 300            (todas as cadeiras com a IA atual)
//   node sim/ia.js duelo 300           (IA atual numa cadeira, IA anterior nas outras; roda as três cadeiras)
var NOVO = require('../engine.js'), VELHO = require('./engine-ia-antes.js');
var modo = process.argv[2] || 'diag', N = +process.argv[3] || 300;

function lider(s, di) {   // quem venceria este debate no próprio turno, se nada mudar (ou -1)
  var d = s.debates[di], val = NOVO.DEB[d.id].valor;
  for (var o = 0; o < 3; o++) {
    var req = d.petitio && d.petitio.P === o ? 1 : val, ok = d.stakes[o] >= req;
    for (var x = 0; x < 3; x++) if (x !== o && d.stakes[x] >= d.stakes[o]) ok = false;
    if (ok) return o;
  }
  return -1;
}

function joga(seed, quem) {   // quem[P] = motor da IA dessa cadeira
  var s = NOVO.newGame({ seed: seed, humans: [false, false, false] });
  var st = [0, 1, 2].map(function () { return { perdidas: 0, jogadas: 0, libFim: 0, turnos: 0, temp: 0, extra: 0, baixou: 0 }; });
  var n = 0, turnoAnt = s.turn;
  while (!s.over && n < 6000) {
    var P = s.turn, antes = s.debates.map(function (d, i) { return { id: d.id, mine: d.stakes[P], lid: lider(s, i), om: Math.max.apply(null, d.stakes.filter(function (_, x) { return x !== P; })) }; });
    var lib0 = s.players[P].library;
    if (!quem[P].aiStep(s)) NOVO.endTurn(s, []);
    n++;
    s.debates.forEach(function (d, i) {
      var a = antes[i]; if (!a || a.id !== d.id) return;
      var add = d.stakes[P] - a.mine;
      if (add > 0) { st[P].jogadas += add; if (a.lid >= 0 && a.lid !== P && d.stakes[P] < d.stakes[a.lid]) st[P].perdidas += add; }
    });
    for (var i = 0; i < s.fx.length; i++) { var e = s.fx[i]; if (e.k === 'praxis' && e.P === P) st[P].temp++; if (e.k === 'baixa' && e.P === P) st[P].baixou++; }
    s.fx.length = 0; s.log.length = 0;
    if (s.turn !== P || s.over) { st[P].libFim += s.players[P].library; st[P].turnos++; }
  }
  return { s: s, st: st };
}

function resumo(L, rot) {
  var t = { perdidas: 0, jogadas: 0, libFim: 0, turnos: 0, temp: 0, baixou: 0, jogos: 0 };
  L.forEach(function (x) { for (var k in x) t[k] += x[k]; t.jogos++; });
  console.log(rot + ': ideias em debate perdido ' + (t.perdidas / t.jogos).toFixed(1) + ' por partida (' + (100 * t.perdidas / t.jogadas).toFixed(1) + '% das ideias levadas a debates) · Biblioteca no fim do turno ' + (t.libFim / t.turnos).toFixed(1) + ' · temporárias usadas ' + (t.temp / t.jogos).toFixed(2) + ' por partida');
}

if (modo === 'diag') {
  var L = [], W = [0, 0, 0], rod = 0, libFinal = 0;
  for (var g = 0; g < N; g++) {
    var r = joga(7000 + g, [NOVO, NOVO, NOVO]);
    r.st.forEach(function (x) { L.push(x); }); if (r.s.vencedor >= 0) W[r.s.vencedor]++; rod += r.s.round;
    r.s.players.forEach(function (p) { libFinal += p.library; });
  }
  resumo(L, 'IA atual');
  console.log('Biblioteca no fim da partida: ' + (libFinal / N / 3).toFixed(1) + ' · rodadas ' + (rod / N).toFixed(2) + ' · assentos ' + W.map(function (x) { return (100 * x / N).toFixed(1); }).join(' / '));
}

if (modo === 'duelo') {
  var vit = 0, jogos = 0, Ln = [], Lv = [];
  for (var P = 0; P < 3; P++) for (var g2 = 0; g2 < N; g2++) {
    var quem = [VELHO, VELHO, VELHO]; quem[P] = NOVO;
    var r2 = joga(8000 + g2, quem);
    if (r2.s.vencedor === P) vit++; jogos++;
    r2.st.forEach(function (x, k) { (k === P ? Ln : Lv).push(x); });
  }
  console.log('IA nova contra duas IAs anteriores: vence ' + (100 * vit / jogos).toFixed(1) + '% (33,3% seria empate técnico), ' + jogos + ' partidas');
  resumo(Ln, 'IA nova     '); resumo(Lv, 'IA anterior ');
}
