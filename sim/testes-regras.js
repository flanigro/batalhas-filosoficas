// Testes das regras novas de 19/11/2026 (mão inicial, Epicuro, Diógenes, Hobbes, Locke, Hegel)
// e uma bateria de partidas só de IA. Uso, a partir da raiz: node sim/testes-regras.js
global.window = global;
const BF = require(__dirname + '/../engine.js');
let ok = 0, falhas = 0;
function confere(nome, cond, extra) { if (cond) ok++; else { falhas++; console.log('FALHA:', nome, extra || ''); } }
function jogo(seed) { return BF.newGame({ seed: seed || 7, humans: [true, true, true], mudo: true }); }
function G(id, ideas) { return { id: id, ideas: ideas || 0, novo: false, lib: false, acted: false, foi: false, foiAnt: false, given: 0 }; }
function zera(s) { s.players.forEach(p => { p.group = []; p.library = 0; }); s.debates.forEach(d => { d.stakes = d.stakes.map(() => 0); }); }
function passaPara1(s) { s.players[0].hand = s.players[0].hand.slice(0, 5); BF.endTurn(s, []); }

// 1. mão inicial: custo 1 + 3
{ const s = jogo(1); confere('mão inicial do 2º jogador = 4', s.players[1].hand.length === 4, s.players[1].hand.length);
  confere('mão inicial do 3º jogador = 4', s.players[2].hand.length === 4);
  confere('1º jogador = 4 + compra do turno', s.players[0].hand.length === 5);
  confere('todos têm um filósofo de custo 1', s.players.every(p => p.hand.some(id => BF.C(id).tipo === 'F' && BF.C(id).custo === 1))); }

// 2. Epicuro: vizinho +1 e Epicuro +1
{ const s = jogo(2); zera(s); s.players[1].group = [G('epicuro'), G('arendt')]; passaPara1(s);
  const g = s.players[1].group; confere('Epicuro: vizinho recebe 1 (Reflexão) + 1', g[1].ideas === 2, g[1].ideas);
  confere('Epicuro: ele mesmo recebe 1 (Reflexão) + 1', g[0].ideas === 2, g[0].ideas); }
{ const s = jogo(2); zera(s); s.players[1].group = [G('epicuro')]; passaPara1(s);
  confere('Epicuro sem vizinho: só a Reflexão', s.players[1].group[0].ideas === 1, s.players[1].group[0].ideas); }

// 3. Diógenes: +1 com 2 ou menos
{ const s = jogo(3); zera(s); s.players[1].group = [G('diogenes', 0)]; passaPara1(s);
  confere('Diógenes com 0: Reflexão +1 e mínimo +1 = 2', s.players[1].group[0].ideas === 2, s.players[1].group[0].ideas); }
{ const s = jogo(3); zera(s); s.players[1].group = [G('diogenes', 3)]; passaPara1(s);
  confere('Diógenes com 3: só a Reflexão = 4', s.players[1].group[0].ideas === 4, s.players[1].group[0].ideas); }

// 4. Hobbes: qualquer área
{ const s = jogo(4); zera(s); const di = s.debates.findIndex(d => BF.DEB[d.id].area !== 'logica');
  s.players[1].group = [G('hobbes')]; s.debates[di].stakes[2] = 5; passaPara1(s);
  confere('Hobbes tira 1 do adversário com mais ideias num debate fora da Lógica', s.debates[di].stakes[2] === 4, s.debates[di].stakes[2]); }
{ const s = jogo(4); zera(s); s.players[1].group = [G('hobbes')]; s.debates[0].stakes[0] = 2; s.debates[1].stakes[2] = 6; passaPara1(s);
  confere('Hobbes escolhe o adversário com mais ideias', s.debates[1].stakes[2] === 5 && s.debates[0].stakes[0] === 2); }

// 5. Locke: ganha quando o adversário baixa carta
{ const s = jogo(5); zera(s); s.players[0].group = [G('locke')]; passaPara1(s);
  const p1 = s.players[1]; p1.library = 10; const id = BF.FILOSOFOS.find(f => f.custo === 1 && f.id !== 'locke' && f.id !== 'diogenes').id;
  p1.hand.push(id); BF.playPhilosopher(s, 1, id);
  confere('Locke do adversário +1 quando o jogador da vez baixa', s.players[0].group[0].ideas === 1, s.players[0].group[0].ideas); }
{ const s = jogo(5); zera(s); s.players[0].group = [G('locke')]; s.players[0].library = 10; const id = BF.FILOSOFOS.find(f => f.custo === 1 && f.id !== 'locke').id;
  s.players[0].hand.push(id); BF.playPhilosopher(s, 0, id);
  confere('Locke +1 quando o dono baixa (regra antiga mantida)', s.players[0].group[0].ideas === 1, s.players[0].group[0].ideas); }

// 6. Hegel: Síntese
{ const s = jogo(6); zera(s); s.players[0].group = [G('hegel', 4)]; s.debates[0].stakes[1] = 3; const v = (Array.isArray(BF.C('hegel').vals)?BF.C('hegel').vals[BF.AREAS.indexOf(BF.DEB[s.debates[0].id].area)]:BF.C('hegel').vals[BF.DEB[s.debates[0].id].area]);
  BF.moveToDebate(s, 0, 0, 0); confere('Hegel com adversário à frente: leva e ganha +1', s.debates[0].stakes[0] === Math.min(4, v) + 1, s.debates[0].stakes[0]); }
{ const s = jogo(6); zera(s); s.players[0].group = [G('hegel', 4)]; s.debates[0].stakes[0] = 5; s.debates[0].stakes[1] = 3; const v = (Array.isArray(BF.C('hegel').vals)?BF.C('hegel').vals[BF.AREAS.indexOf(BF.DEB[s.debates[0].id].area)]:BF.C('hegel').vals[BF.DEB[s.debates[0].id].area]);
  BF.moveToDebate(s, 0, 0, 0); confere('Hegel já à frente: sem Síntese', s.debates[0].stakes[0] === 5 + Math.min(4, v), s.debates[0].stakes[0]); }

// 7. partidas só de IA
{ let erros = 0, rod = 0, venc = [0, 0, 0], N = 300;
  for (let sd = 1; sd <= N; sd++) {
    try { const s = BF.newGame({ seed: sd, mudo: true, niveis: ['mestre', 'mestre', 'mestre'], humans: [false, false, false] });
      let k = 0; while (!s.over && k < 6000) { BF.aiStep(s); k++; }
      if (!s.over) erros++; rod += s.round; if (s.vencedor >= 0) venc[s.vencedor]++;
      s.players.forEach(p => p.group.forEach(g => { if (g.ideas < 0 || g.ideas > 10) erros++; })); s.debates.forEach(d => d.stakes.forEach(x => { if (x < 0) erros++; }));
    } catch (e) { erros++; console.log(e); } }
  confere('300 partidas só de IA sem erro', erros === 0, erros);
  console.log('partidas: rodadas', (rod / N).toFixed(2), 'vitórias por assento', venc.map(v => (100 * v / N).toFixed(1) + '%').join(' / ')); }

console.log(ok + ' testes ok, ' + falhas + ' falhas');
process.exit(falhas ? 1 : 0);
