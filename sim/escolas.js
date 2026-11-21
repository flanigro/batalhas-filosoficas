// Métricas para comparar o jogo com 3 escolas (+ Livres) e com 5 escolas. Uso: node sim/escolas.js [N] [engine.js]
var path = require('path');
global.window = global;
var BF = require(path.resolve(process.argv[3] || path.join(__dirname, '..', 'engine.js')));
var N = +process.argv[2] || 600;
function joga(seed) {
  var s = BF.newGame({ seed: seed, humans: [false, false, false], mudo: true });
  var n = 0; while (!s.over && n < 8000) { if (!BF.aiStep(s)) BF.endTurn(s, []); n++; }
  return s;
}
var A = { rod: 0, deb: 0, pts: 0, vit: [0, 0, 0], reemb: 0, reembJogo: 0, esc: 0, refl: 0, dupla: 0, baixados: {}, vence: {}, presente: {}, cart: {} };
for (var i = 0; i < N; i++) {
  var s = joga(5000 + i);
  A.rod += s.round;
  var top = Math.max.apply(null, s.players.map(function (p) { return p.points; }));
  s.players.forEach(function (p, k) { if (p.points === top) A.vit[k]++; A.deb += p.won.length; });
  A.pts += top;
  var r = s.reemb || 0;
  A.reemb += r; if (r) A.reembJogo++;
  // presença: quem terminou no grupo do vencedor
  s.players.forEach(function (p, k) {
    p.group.forEach(function (g) { A.presente[g.id] = (A.presente[g.id] || 0) + 1; if (p.points === top) A.vence[g.id] = (A.vence[g.id] || 0) + 1; });
  });
}
console.log('partidas', N, '| rodadas', (A.rod / N).toFixed(1), '| debates vencidos', (A.deb / N).toFixed(1), '| pontos do vencedor', (A.pts / N).toFixed(1));
console.log('vitórias por assento', A.vit.map(function (v) { return (100 * v / N).toFixed(1) + '%'; }).join(' / '));
console.log('reembaralhamentos por partida', (A.reemb / N).toFixed(2), '| partidas com reembaralhamento', (100 * A.reembJogo / N).toFixed(0) + '%');
var ids = Object.keys(A.presente).sort(function (a, b) { return (A.vence[b] || 0) / A.presente[b] - (A.vence[a] || 0) / A.presente[a]; });
console.log('no grupo final do vencedor (vitórias / presenças):');
console.log(ids.map(function (id) { return id + ' ' + (100 * (A.vence[id] || 0) / A.presente[id]).toFixed(0) + '% (' + A.presente[id] + ')'; }).join(' · '));
