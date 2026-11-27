// Poder 2 das três escolas originais (em teste desde 27/11/2026).
//   node sim/poder2.js retrato 600 [bib]       retrato do jogo com e sem o Poder 2
//   node sim/poder2.js forca 400 [ids] [bib]   força de cada filósofo (carta na mão inicial), sem e com o Poder 2
var BF = require('../engine.js');
var modo = process.argv[2] || 'retrato', N = +process.argv[3] || 400;
var ids = process.argv[4] && process.argv[4] !== '-' ? process.argv[4].split(',') : Object.keys(BF.PODER2);
var bib = +(process.argv[5] || (modo === 'retrato' ? process.argv[4] : 0)) || 3;

function joga(seed, p2, injeta, b) {
  var s = BF.newGame(Object.assign({ seed: seed, humans: [false, false, false], mudo: true, poder2: p2, bibPorTurno: b || 3 }, process.env.CFG ? JSON.parse(process.env.CFG) : {}));
  if (injeta) {
    var hj = s.players[injeta.P].hand, idj = injeta.id, onde = null, k;
    for (var q = 0; q < 3 && !onde; q++) { k = s.players[q].hand.indexOf(idj); if (k >= 0) onde = [s.players[q].hand, k]; }
    if (!onde) { k = s.deck.indexOf(idj); if (k >= 0) onde = [s.deck, k]; }
    if (onde && onde[0] !== hj) { var tr = 1 + (seed % (hj.length - 1)); var t = hj[tr]; hj[tr] = idj; onde[0][onde[1]] = t; }
  }
  var n = 0, visto = {}, temp = 0;
  while (!s.over && n < 8000) {
    if (!BF.aiStep(s)) BF.endTurn(s, []);
    n++;
    s.players.forEach(function (p) { p.group.forEach(function (g) { if (BF.PODER2[g.id]) visto[g.id] = 1; }); });
  }
  s.visto = visto;
  return s;
}

if (modo === 'retrato') {
  [false, true].forEach(function (p2) {
    var W = [0, 0, 0], rod = 0, deb = 0, pts = 0, libFim = 0, uso = {}, pres = {}, usoTot = 0;
    for (var g = 0; g < N; g++) {
      var s = joga(7000 + g, p2, null, bib);
      if (s.vencedor >= 0) W[s.vencedor]++;
      rod += s.round; pts += Math.max.apply(null, s.players.map(function (p) { return p.points; }));
      s.players.forEach(function (p) { deb += p.won.length; libFim += p.library; });
      Object.keys(s.visto).forEach(function (k) { pres[k] = (pres[k] || 0) + 1; });
      Object.keys(s.p2 || {}).forEach(function (k) { uso[k] = (uso[k] || 0) + s.p2[k]; usoTot += s.p2[k]; });
    }
    console.log((p2 ? 'COM' : 'SEM') + ' Poder 2 · Biblioteca ' + bib + '/turno · ' + N + ' partidas: rodadas ' + (rod / N).toFixed(2) + ' · debates ' + (deb / N).toFixed(1) +
      ' · pontos do vencedor ' + (pts / N).toFixed(1) + ' · vitórias por assento ' + W.map(function (x) { return (100 * x / N).toFixed(1); }).join(' / ') +
      ' · Biblioteca no fim (média por jogador) ' + (libFim / N / 3).toFixed(1) + (p2 ? ' · Poderes 2 por partida ' + (usoTot / N).toFixed(1) : ''));
    if (p2) Object.keys(BF.PODER2).forEach(function (k) { console.log('  ' + k + ': ' + ((uso[k] || 0) / (pres[k] || 1)).toFixed(2) + ' usos por partida em que aparece (' + (pres[k] || 0) + ' partidas)'); });
  });
}

if (modo === 'forca') {
  function base(p2) { var b = [0, 0, 0]; for (var g = 0; g < N; g++) { var s = joga(9000 + g, p2, null, bib); if (s.vencedor >= 0) b[s.vencedor]++; } return b; }
  var B0 = base(false), B1 = base(true);
  ids.forEach(function (id) {
    var d0 = 0, d1 = 0, usou = 0;
    for (var P = 0; P < 3; P++) {
      var w0 = 0, w1 = 0;
      for (var g = 0; g < N; g++) {
        if (joga(9000 + g, false, { P: P, id: id }, bib).vencedor === P) w0++;
        var s = joga(9000 + g, true, { P: P, id: id }, bib);
        if (s.vencedor === P) w1++;
        if (s.p2 && s.p2[id]) usou++;
      }
      d0 += (w0 - B0[P]) / N; d1 += (w1 - B1[P]) / N;
    }
    function f(x) { x = x / 3 * 100; return (x >= 0 ? '+' : '') + x.toFixed(1); }
    console.log(id + '\tsem P2 ' + f(d0) + '\tcom P2 ' + f(d1) + '\tdiferença ' + f(d1 - d0) + '\tP2 usado em ' + (100 * usou / N / 3).toFixed(0) + '% das partidas');
  });
}
