// Duelo de IAs pela configuração (27/11/2026): uma cadeira joga com a cfg A, as outras com a cfg B.
//   node sim/duelo-cfg.js N '{"iaSat":7}' '{}' ['{"poder2":true}']
var BF = require(require('path').join(__dirname, '..', 'engine.js'));
var N = +process.argv[2] || 300, A = JSON.parse(process.argv[3] || '{}'), B = JSON.parse(process.argv[4] || '{}'), base = JSON.parse(process.argv[5] || '{}');
var vit = 0, jogos = 0, emp = 0;
for (var P = 0; P < 3; P++) for (var g = 0; g < N; g++) {
  var s = BF.newGame(Object.assign({ seed: 8000 + g, humans: [false, false, false], mudo: true }, base));
  var n = 0;
  while (!s.over && n < 8000) {
    Object.assign(s.cfg, s.turn === P ? A : B);
    Object.keys(A).concat(Object.keys(B)).forEach(function (k) { if (!(k in (s.turn === P ? A : B))) s.cfg[k] = base[k] !== undefined ? base[k] : 0; });
    if (!BF.aiStep(s)) BF.endTurn(s, []);
    n++;
  }
  if (s.vencedor === P) vit++; if (s.vencedor < 0) emp++; jogos++;
}
console.log('cfg A numa cadeira contra cfg B nas outras: A vence ' + (100 * vit / jogos).toFixed(1) + '% (33,3% = igual; empates ' + (100 * emp / jogos).toFixed(1) + '%), ' + jogos + ' partidas');
