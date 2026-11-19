// Cartas temporárias (19/11/2026): uso e força de cada carta, direto no engine.js.
//   node sim/temporarias.js uso 600
//   node sim/temporarias.js forca 400 [ids,separados,por,vírgula]
//   node sim/temporarias.js pen 600 '{"espantalho":0,...}'   (penalidades alternativas)
//   PEN='{"nonsequitur":0}' node sim/temporarias.js forca 400 nonsequitur   (força com outra penalidade)
var BF = require('../engine.js');
var modo = process.argv[2] || 'uso', N = +process.argv[3] || 400, arg = process.argv[4];

function joga(seed, injeta) {
  var s = BF.newGame({ seed: seed, humans: [false, false, false] });
  if (injeta) {   // põe a carta na mão do assento P, no lugar de uma carta sorteada que não seja o filósofo de custo 1 garantido
    var hj = s.players[injeta.P].hand, idj = injeta.id + '#1', onde = null, k;
    for (var q = 0; q < 3 && !onde; q++) { k = s.players[q].hand.indexOf(idj); if (k >= 0) onde = [s.players[q].hand, k]; }
    if (!onde) { k = s.deck.indexOf(idj); if (k >= 0) onde = [s.deck, k]; }
    if (onde && onde[0] !== hj) { var tr = 1 + (seed % (hj.length - 1)); var t = hj[tr]; hj[tr] = idj; onde[0][onde[1]] = t; }
  }
  var uso = {}, n = 0;
  while (!s.over && n < 6000) {
    if (!BF.aiStep(s)) BF.endTurn(s, []);
    n++;
    for (var i = 0; i < s.fx.length; i++) { var e = s.fx[i]; if (e.k === 'praxis') (uso[e.P] = uso[e.P] || []).push(e.id); }
    s.fx.length = 0; s.log.length = 0;
  }
  return { s: s, uso: uso };
}

if (process.env.PEN) { var pe = JSON.parse(process.env.PEN); BF.PRAXIS.forEach(function (p) { if (p.id in pe) p.pen = pe[p.id]; }); }   // PEN='{"espantalho":0}' vale para qualquer modo
if (modo === 'pen' && arg) { var pen = JSON.parse(arg); BF.PRAXIS.forEach(function (p) { if (p.id in pen) p.pen = pen[p.id]; }); }

if (modo === 'uso' || modo === 'pen') {
  var W = [0, 0, 0], rod = 0, cav = 0, neg = 0, usos = {}, venc = {}, pts = 0;
  for (var g = 0; g < N; g++) {
    var r = joga(5000 + g), s = r.s;
    if (s.vencedor >= 0) { W[s.vencedor]++; (r.uso[s.vencedor] || []).forEach(function (id) { venc[id] = (venc[id] || 0) + 1; }); }
    rod += s.round;
    s.players.forEach(function (p) { cav += p.caveiras; if (p.points < 0) neg++; pts += p.points; });
    Object.keys(r.uso).forEach(function (P) { r.uso[P].forEach(function (id) { usos[id] = (usos[id] || 0) + 1; }); });
  }
  console.log('Partidas: ' + N + ' · vitórias por assento: ' + W.map(function (x) { return (100 * x / N).toFixed(1) + '%'; }).join(' / ') + ' · rodadas: ' + (rod / N).toFixed(2));
  console.log('Caveiras por jogador e partida: ' + (cav / N / 3).toFixed(2) + ' · placares finais negativos: ' + (100 * neg / N / 3).toFixed(1) + '% · pontos médios: ' + (pts / N / 3).toFixed(1));
  BF.PRAXIS.forEach(function (p) {
    console.log('  ' + p.id + ' (' + p.fam + (p.pen ? ', −' + p.pen : '') + '): ' + ((usos[p.id] || 0) / N).toFixed(2) + ' usos por partida; o vencedor usou ' + ((venc[p.id] || 0) / N).toFixed(2));
  });
}

if (modo === 'forca') {
  var ids = arg ? arg.split(',') : BF.PRAXIS.map(function (p) { return p.id; });
  // linha de base: vitórias por assento sem injeção
  var base = [0, 0, 0];
  for (var g0 = 0; g0 < N; g0++) { var s0 = joga(9000 + g0).s; if (s0.vencedor >= 0) base[s0.vencedor]++; }
  console.log('Base: ' + base.map(function (x) { return (100 * x / N).toFixed(1); }).join(' / '));
  ids.forEach(function (id) {
    var dif = 0, usou = 0;
    for (var P = 0; P < 3; P++) {
      var w = 0;
      for (var g = 0; g < N; g++) { var r = joga(9000 + g, { P: P, id: id }); if (r.s.vencedor === P) w++; if ((r.uso[P] || []).indexOf(id) >= 0) usou++; }
      dif += (w - base[P]) / N;
    }
    console.log('  ' + id + ': ' + (dif / 3 * 100 >= 0 ? '+' : '') + (dif / 3 * 100).toFixed(1) + ' p.p. de vitória com a carta na mão inicial · usada em ' + (100 * usou / N / 3).toFixed(0) + '% das partidas');
  });
}
