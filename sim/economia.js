// Para onde vão as ideias (diagnóstico do acúmulo da IA, 27/11/2026). Uso: node sim/economia.js [N] [cfg-json]
var BF = require(require('path').join(__dirname, '..', 'engine.js'));
var N = +process.argv[2] || 200, extra = process.argv[3] ? JSON.parse(process.argv[3]) : {};
var A = { renda: 0, bibl: 0, baixar: 0, dar: 0, temp: 0, cartaExtra: 0, troca: 0, debate: 0, libFim: 0, filFim: 0, libT: 0, turnos: 0, libComBib: 0, turnosBib: 0, bibAtivo: 0, rod: 0, W: [0, 0, 0], pts: 0, deb: 0, refl: 0, tetoPerda: 0, grupo4: 0, porRod: {} };
for (var g = 0; g < N; g++) {
  var s = BF.newGame(Object.assign({ seed: 7000 + g, humans: [false, false, false] }, extra));
  var n = 0;
  while (!s.over && n < 8000) {
    var P = s.turn, pl = s.players[P], lib0 = pl.library;
    if (!BF.aiStep(s)) BF.endTurn(s, []);
    n++;
    s.fx.forEach(function (e) {
      var Q = e.P;
      if (e.k === 'bib') A.renda += e.n;
      if (e.k === 'baixa') A.baixar += BF.C(e.id).custo;
      if (e.k === 'dar') A.dar += e.n;
      if (e.k === 'praxis') A.temp += e.custo;
      if (e.k === 'troca') A.troca += 5;
      if (e.k === 'debate') A.debate += e.amt;
      if (e.k === 'pop' && e.tom === 'lib') A.bibl += BF.C(e.id).custo;
    });
    if (s.turn !== P || s.over) {
      (A.porRod[s.round] = A.porRod[s.round] || []).push(pl.library + '|' + pl.group.reduce(function (a, x) { return a + x.ideas; }, 0));
      A.libT += pl.library; A.turnos++;
      if (BF.libIdx(pl) >= 0) { A.turnosBib++; A.libComBib += pl.library; }
      if (pl.group.filter(function (x) { return !x.lib; }).length >= 4) A.grupo4++;
    }
    if (pl.boughtExtra && lib0 !== pl.library && s.fx.some(function (e) { return false; })) A.cartaExtra += 2;
    s.fx.length = 0; s.log.length = 0;
  }
  if (s.vencedor >= 0) A.W[s.vencedor]++;
  A.rod += s.round; A.pts += Math.max.apply(null, s.players.map(function (p) { return p.points; }));
  s.players.forEach(function (p) { A.libFim += p.library; A.deb += p.won.length; p.group.forEach(function (x) { A.filFim += x.ideas; }); });
}
var J = N * 3; function f(x) { return (x / J).toFixed(1); }
console.log('partidas ' + N + ' · rodadas ' + (A.rod / N).toFixed(2) + ' · debates ' + (A.deb / N).toFixed(1) + ' · pontos do vencedor ' + (A.pts / N).toFixed(1) + ' · assentos ' + A.W.map(function (x) { return (100 * x / N).toFixed(0); }).join('/'));
console.log('por jogador e partida: Biblioteca recebe ' + f(A.renda) + ' básicas + ' + f(A.bibl) + ' do Bibliotecário; gasta ' + f(A.baixar) + ' baixando cartas, ' + f(A.dar) + ' dando a filósofos, ' + f(A.temp) + ' em temporárias, ' + f(A.troca) + ' em trocas');
console.log('ideias levadas a debates ' + f(A.debate) + ' · no fim: Biblioteca ' + f(A.libFim) + ', nos filósofos ' + f(A.filFim));
console.log('Biblioteca média no fim do turno ' + (A.libT / A.turnos).toFixed(1) + ' · com Bibliotecário em ' + (100 * A.turnosBib / A.turnos).toFixed(0) + '% dos turnos · grupo com 4 debatedores em ' + (100 * A.grupo4 / A.turnos).toFixed(0) + '% dos turnos');
console.log('por rodada (fim do turno): Biblioteca / ideias nos filósofos');
Object.keys(A.porRod).forEach(function (r) { var L = A.porRod[r], a = 0, b = 0; L.forEach(function (x) { var p = x.split('|'); a += +p[0]; b += +p[1]; }); console.log('  rodada ' + r + ': ' + (a / L.length).toFixed(1) + ' / ' + (b / L.length).toFixed(1)); });
