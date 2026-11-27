// Testes do Poder 2 das três escolas originais (em teste desde 27/11/2026). Uso: node sim/testes-poder2.js
global.window = global;
const BF = require(__dirname + '/../engine.js');
let ok = 0, falhas = 0;
function confere(nome, cond, extra) { if (cond) ok++; else { falhas++; console.log('FALHA:', nome, extra === undefined ? '' : JSON.stringify(extra)); } }
function jogo(seed) { const s = BF.newGame({ seed: seed || 7, humans: [true, true, true], mudo: true, poder2: true }); return s; }
function G(id, ideas, extra) { return Object.assign({ id: id, ideas: ideas || 0, novo: false, lib: false, acted: false, foi: false, foiAnt: false, given: 0 }, extra || {}); }
function zera(s, ids) { s.players.forEach(p => { p.group = []; p.library = 0; p.hand = []; }); if (ids) s.debates = ids.map(id => ({ id: id, stakes: [0, 0, 0], part: [[], [], []] })); else s.debates.forEach(d => { d.stakes = [0, 0, 0]; }); }
function passa(s) { BF.endTurn(s, []); }   // do jogador 0 para o 1
function usa(s, P, fi, f) { const o = BF.poder2Options(s, P, fi).find(f || (() => true)); return o ? BF.usaPoder2(s, P, fi, o.prm) : false; }
// d02: Lógica 12 · d04: Metafísica 15 · d07: Ética 15
const LOG = 'd02', MET = 'd04', ET = 'd07';
confere('debates de teste', BF.DEB[LOG].area === 'logica' && BF.DEB[MET].area === 'meta' && BF.DEB[ET].area === 'etica');

{ const s = jogo(); zera(s, [LOG, MET]); s.players[0].group = [G('aristoteles', 3)]; s.debates[0].stakes = [1, 7, 0];
  confere('Aristóteles: usa', usa(s, 0, 0)); confere('Termo Médio: −5', s.debates[0].stakes[1] === 2, s.debates[0].stakes); confere('custo 3 pago', s.players[0].group[0].ideas === 0);
  confere('Aristóteles: só uma ação', !BF.podeP2(s, 0, 0)); }
{ const s = jogo(); zera(s, [MET, LOG]); s.players[0].group = [G('aristoteles', 3)]; s.debates[0].stakes = [1, 7, 0];
  confere('Termo Médio fora da Lógica: sem opção', BF.poder2Options(s, 0, 0).length === 0); }
{ const s = jogo(); zera(s, [LOG, MET]); s.players[0].group = [G('aristoteles', 2)]; s.debates[0].stakes = [1, 7, 0];
  confere('Poder 2 sem 3 ideias: recusa', !usa(s, 0, 0)); }

{ const s = jogo(); zera(s, [LOG, MET]); s.players[0].group = [G('socrates', 3)];
  s.players[1].group = [G('kant', 6), G('diogenes', 9)]; s.players[2].group = [G('marx', 5)];
  usa(s, 0, 0); confere('Ironia: tira 5 dos mais ricos, um a um (Kant 6→3, Marx 5→3)', s.players[1].group[0].ideas === 3 && s.players[2].group[0].ideas === 3, [s.players[1].group[0].ideas, s.players[2].group[0].ideas]);
  confere('Ironia: Diógenes imune', s.players[1].group[1].ideas === 9); }

{ const s = jogo(); zera(s, [LOG, MET]); s.players[1].group = [G('epicuro', 3), G('kant', 0), G('marx', 0)];
  BF.endTurn(s, []); s.players[1].group.forEach(g => g.novo = false);
  confere('Jardim: baixa', usa(s, 1, 0)); confere('Legado marcado', s.players[1].group[0].legado === true);
  BF.endTurn(s, []); BF.endTurn(s, []); BF.endTurn(s, []);
  const g = s.players[1].group;   // Epicuro 3 +1 +1 −3 (paga) +1 +2 = 5; Kant 0 +3 +1 +3 +2 = 9; Marx 0 +3 +3 = 6 (sem vizinho da esquerda)
  confere('Jardim: +2 para Epicuro e para o vizinho da direita', g[0].ideas === 5 && g[1].ideas === 9, g.map(x => x.ideas));
  confere('Jardim: o vizinho da esquerda não recebe', g[2].ideas === 6, g[2].ideas); }

{ const s = jogo(); zera(s, [LOG, MET]); s.players[0].group = [G('pitagoras', 3), G('kant', 0)]; s.players[1].group = [G('hobbes', 4), G('marx', 2)];
  const op = BF.poder2Options(s, 0, 0); confere('Metempsicose: só custo até 3', op.length === 1 && op[0].prm.fi2 === 0, op.map(o => o.label));
  usa(s, 0, 0); confere('Metempsicose: Hobbes vem sem ideias e recém-chegado', s.players[0].group[0].id === 'hobbes' && s.players[0].group[0].ideas === 0 && s.players[0].group[0].novo);
  confere('Metempsicose: Pitágoras vai para o adversário', s.players[1].group[0].id === 'pitagoras'); }

{ const s = jogo(); zera(s, [LOG, MET]); s.players[0].group = [G('diogenes', 3)]; usa(s, 0, 0);
  passa(s); const fal = 'espantalho'; s.players[1].hand.push(fal + '#1'); s.players[1].library = 10; s.debates[0].stakes = [3, 1, 0];
  const custo = BF.custoPraxis(s, 1, fal + '#1'); confere('Lanterna: falácia custa 1 a mais', custo === BF.C(fal).custo + 1, custo);
  const antes = s.players[0].group[0].ideas;
  BF.playPraxis(s, 1, fal + '#1', BF.praxisOptions(s, 1, fal)[0].prm);
  confere('Lanterna: Diógenes +1 com falácia do adversário', s.players[0].group[0].ideas === antes + 1, [antes, s.players[0].group[0].ideas]);
  confere('Lanterna: biblioteca do adversário pagou o custo maior', s.players[1].library === 10 - custo); }
{ const s = jogo(); zera(s, [LOG, MET]); s.players[0].group = [G('diogenes', 3)]; usa(s, 0, 0);
  s.players[0].hand.push('espantalho#1'); s.players[0].library = 10; s.debates[0].stakes = [1, 3, 0];
  BF.playPraxis(s, 0, 'espantalho#1', BF.praxisOptions(s, 0, 'espantalho')[0].prm);
  confere('Lanterna: o dono usa falácia e perde a Lanterna', !s.players[0].group[0].legado); }

{ const s = jogo(); zera(s, [LOG, MET]); s.players[0].group = [G('marx', 3)];
  s.players[1].group = [G('kant', 6), G('locke', 0)]; s.players[2].group = [G('hegel', 1), G('freud', 4)];
  usa(s, 0, 0, o => o.prm.o === 1);
  const k = s.players[1].group[0];
  confere('Luta de Classes: alvo de maior custo zerado e parado', k.ideas === 0 && k.parado, k);
  const tot = s.players.reduce((a, p) => a + p.group.reduce((b, g) => b + g.ideas, 0), 0);
  confere('Luta de Classes: as 6 ideias foram repartidas (total na mesa 0+6+1+4=11)', tot === 11, tot);
  confere('Luta de Classes: os mais pobres recebem (Marx, Locke, Hegel)', s.players[0].group[0].ideas >= 1 && s.players[1].group[1].ideas >= 2 && s.players[2].group[0].ideas >= 2, s.players.map(p => p.group.map(g => g.ideas)));
  passa(s); confere('Parado: não vai a debates no turno do dono', BF.moveOptions(s, 1, 0).length === 0 && !BF.canGive(s, 1, 0));
  confere('Parado: não recebe Reflexão', s.players[1].group[0].ideas === 0, s.players[1].group[0].ideas);
  passa(s); confere('Parado: termina no fim do turno do dono', !s.players[1].group[0].parado); }

{ const s = jogo(); zera(s, [LOG, MET]); s.players[0].group = [G('hegel', 3)]; s.debates[0].stakes = [6, 9, 0];
  usa(s, 0, 0); confere('Superação: 4 passam de um debate a outro', s.debates[0].stakes[0] === 2 && s.debates[1].stakes[0] === 4, s.debates.map(d => d.stakes)); }

{ const s = jogo(); zera(s, [LOG, MET]); s.players[1].hand.push('hobbes'); s.players[1].group = [G('hobbes', 3)];
  passa(s); usa(s, 1, 0); passa(s);
  s.players[2].hand.push('autoridade#1'); s.players[2].library = 10; s.debates[0].stakes[2] = 1;
  const lib = s.players[1].library; BF.playPraxis(s, 2, 'autoridade#1', BF.praxisOptions(s, 2, 'autoridade')[0].prm);
  confere('Leviatã: carta temporária de adversário dá +1 à Biblioteca do dono', s.players[1].library === lib + 1, [lib, s.players[1].library]);
  confere('Leviatã: o adversário não paga a mais', s.players[2].library === 10 - BF.C('autoridade').custo); }

{ const s = jogo(); zera(s, [LOG, MET]); s.players[0].group = [G('bacon', 3), G('kant', 0), G('locke', 10)];
  usa(s, 0, 0); confere('Ídolos: +1 para cada um, inclusive Bacon; teto respeitado', s.players[0].group.map(g => g.ideas).join() === '1,1,10', s.players[0].group.map(g => g.ideas)); }

{ const s = jogo(); zera(s, [LOG, MET]); s.players[0].group = [G('locke', 3)]; s.debates[0].stakes = [12, 5, 0];
  usa(s, 0, 0, o => o.prm.d === 0);
  passa(s); s.players[1].group = [G('kant', 9)];
  confere('Propriedade: o adversário não leva ideias ao debate cercado', !BF.moveOptions(s, 1, 0).some(o => o.di === 0));
  s.debates[0].stakes[1] = 13; confere('Propriedade: o adversário não vence ali mesmo liderando', !BF.lidera(s, 0, 1));
  s.debates[0].stakes[1] = 5;
  s.players[1].hand.push('falseabilidade#1'); s.players[1].library = 10; s.debates[0].stakes[1] = 5;
  const op = BF.praxisOptions(s, 1, 'falseabilidade').find(o => o.prm.d === 0);
  confere('Propriedade: tirar ideias continua possível', op && BF.playPraxis(s, 1, 'falseabilidade#1', op.prm) && s.debates[0].stakes[0] === 7, s.debates[0].stakes); }
{ const s = jogo(); zera(s, [LOG, MET]); s.players[0].group = [G('locke', 3)]; s.debates[0].stakes = [12, 5, 0];
  usa(s, 0, 0, o => o.prm.d === 0); passa(s); passa(s); passa(s);
  confere('Propriedade: o dono vence no próprio turno se liderar', s.players[0].points === 12, s.players[0].points);
  confere('Propriedade: cerca desfeita no turno do dono', !s.debates.some(d => d.prop)); }
{ const s = jogo(); zera(s, [LOG, MET]); s.players[0].group = [G('locke', 3)];
  confere('Propriedade: só em debate em que você tem ideias', BF.poder2Options(s, 0, 0).length === 0); }

{ const s = jogo(); zera(s, [LOG, MET]); s.players[0].group = [G('kant', 3)]; s.players[1].group = [G('descartes', 7), G('marx', 7)];
  usa(s, 0, 0, o => o.prm.fi2 === 0); confere('Coisa em si: Teísta/Racionalista perde 5', s.players[1].group[0].ideas === 2);
  s.players[0].group[0].acted = false; s.players[0].group[0].ideas = 3; usa(s, 0, 0, o => o.prm.fi2 === 1); confere('Coisa em si: outro perde 3', s.players[1].group[1].ideas === 4); }

{ const s = jogo(); zera(s, [LOG, MET, ET]); s.players[0].group = [G('nietzsche', 3)]; usa(s, 0, 0);
  confere('Além-do-homem: entra', s.players[0].alem && s.players[0].alem.novo);
  passa(s); passa(s); passa(s); s.players[0].library = 5;
  confere('Além-do-homem: recebe da Biblioteca', BF.giveAlem(s, 0) && BF.giveAlem(s, 0));
  confere('Além-do-homem: leva 2', BF.moveAlem(s, 0, 2) && s.debates[2].stakes[0] === 2);
  s.players[0].group = []; s.players[0].hand.push('locke'); s.players[0].library = 5; BF.playPhilosopher(s, 0, 'locke');
  confere('Além-do-homem: sai sem Nietzsche', !s.players[0].alem); }

{ const s = jogo(); zera(s, [LOG, MET, ET]); s.players[0].group = [G('schopenhauer', 3)]; s.debates[0].stakes[0] = 1; s.debates[2].stakes[0] = 2;
  usa(s, 0, 0); confere('Vontade: +2 em cada debate seu', s.debates.map(d => d.stakes[0]).join() === '3,0,4'); }

{ const s = jogo(); zera(s, [LOG, MET]); s.players[0].group = [G('heidegger', 9), G('kant', 0)];
  usa(s, 0, 0, o => o.prm.d === 1); confere('Ser-para-a-morte: leva o que resta (6), sem limite', s.debates[1].stakes[0] === 6, s.debates[1].stakes);
  confere('Ser-para-a-morte: Heidegger sai', s.players[0].group.length === 1 && s.players[0].group[0].id === 'kant'); }

{ const s = jogo(); zera(s, [LOG, MET]); s.players[1].group = [G('freud', 3), G('kant', 0)];
  passa(s); usa(s, 1, 0); passa(s); passa(s); passa(s);
  confere('Divã: vizinho da direita +1 (duas Reflexões de 3+1 escola, mais 1)', s.players[1].group[1].ideas === 9, s.players[1].group[1].ideas); }

{ const s = jogo(); zera(s, [LOG, MET, ET]); s.players[0].group = [G('arendt', 3)]; s.players[1].group = [G('marx', 0)]; s.players[2].group = [G('kant', 6)];
  usa(s, 0, 0); passa(s); confere('Banalidade do Mal: a Mais-Valia do adversário não funciona', s.players[2].group[0].ideas === 6, s.players[2].group[0].ideas);
  confere('Banalidade do Mal: a Reflexão comum continua', s.players[1].group[0].ideas === 3); }

{ const s = jogo(); zera(s, [LOG, MET]); s.players[0].group = [G('rousseau', 3), G('locke', 0), G('kant', 0)]; usa(s, 0, 0); passa(s); passa(s); passa(s);
  const g = s.players[0].group; confere('Estado de natureza: custo 1 e 2 +1 (Locke: Reflexão 1, escola 1, Contrato 1, Legado 1); Kant só a Reflexão', g[1].ideas === 4 && g[2].ideas === 3, g.map(x => x.ideas)); }

{ const s = jogo(); zera(s, [LOG, MET]); s.players[0].group = [G('platao', 3)]; s.players[1].group = [G('aristoteles', 5)]; usa(s, 0, 0);
  confere('Caverna: Gregos de todos imunes', BF.imune(s.players[1].group[0]));
  s.players[0].group[0].acted = false; }
{ const s = jogo(); zera(s, [LOG, MET]); s.players[0].group = [G('epicuro', 3), G('rousseau', 3)];
  confere('Um Legado de cada tipo: com o Jardim, o Estado de natureza (também do grupo) não entra', usa(s, 0, 0) && BF.poder2Options(s, 0, 1).length === 0); }

// partidas só de IA com o Poder 2
{ let erro = null; try { for (let g = 0; g < 60; g++) { const s = BF.newGame({ seed: 300 + g, humans: [false, false, false], mudo: true, poder2: true }); let n = 0; while (!s.over && n < 8000) { if (!BF.aiStep(s)) BF.endTurn(s, []); n++; } if (!s.over) throw new Error('partida sem fim ' + g); } } catch (e) { erro = e.stack; }
  confere('60 partidas só de IA com o Poder 2, sem erro', !erro, erro); }
{ let igual = true; for (let g = 0; g < 30; g++) { const a = BF.newGame({ seed: 800 + g, humans: [false, false, false], mudo: true }); let n = 0; while (!a.over && n < 8000) { if (!BF.aiStep(a)) BF.endTurn(a, []); n++; } if (a.p2) igual = false; }
  confere('Sem a chave, nenhum Poder 2 é usado', igual); }

console.log(ok + ' ok, ' + falhas + ' falha(s).');
