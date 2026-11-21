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
  confere('Locke do adversário +1 quando o jogador da vez baixa um filósofo', s.players[0].group[0].ideas === 1, s.players[0].group[0].ideas);
  const prx = BF.PRAXIS.find(c => c.id.indexOf('autoridade') === 0).id + '#1'; p1.hand.push(prx); p1.library = 10;
  s.debates[0].stakes[1] = 1; BF.playPraxis(s, 1, prx, BF.praxisOptions(s, 1, 'autoridade')[0].prm);
  confere('Locke do adversário não ganha com Práxis do jogador da vez', s.players[0].group[0].ideas === 1, s.players[0].group[0].ideas); }
{ const s = jogo(5); zera(s); s.players[0].group = [G('locke')]; s.players[0].library = 10; const id = BF.FILOSOFOS.find(f => f.custo === 1 && f.id !== 'locke').id;
  s.players[0].hand.push(id); BF.playPhilosopher(s, 0, id);
  confere('Locke +1 quando o dono baixa (regra antiga mantida)', s.players[0].group[0].ideas === 1, s.players[0].group[0].ideas); }

// 6. Hegel: Síntese
{ const s = jogo(6); zera(s); s.players[0].group = [G('hegel', 4)]; s.debates[0].stakes[1] = 3; const v = (Array.isArray(BF.C('hegel').vals)?BF.C('hegel').vals[BF.AREAS.indexOf(BF.DEB[s.debates[0].id].area)]:BF.C('hegel').vals[BF.DEB[s.debates[0].id].area]);
  BF.moveToDebate(s, 0, 0, 0); confere('Hegel com adversário à frente: leva e ganha +1', s.debates[0].stakes[0] === Math.min(4, v) + 1, s.debates[0].stakes[0]); }
{ const s = jogo(6); zera(s); s.players[0].group = [G('hegel', 4)]; s.debates[0].stakes[0] = 5; s.debates[0].stakes[1] = 3; const v = (Array.isArray(BF.C('hegel').vals)?BF.C('hegel').vals[BF.AREAS.indexOf(BF.DEB[s.debates[0].id].area)]:BF.C('hegel').vals[BF.DEB[s.debates[0].id].area]);
  BF.moveToDebate(s, 0, 0, 0); confere('Hegel já à frente: sem Síntese', s.debates[0].stakes[0] === 5 + Math.min(4, v), s.debates[0].stakes[0]); }

// 8. cartas temporárias (19/11/2026)
function daCarta(s, P, id, lib) { s.players[P].hand.push(id + '#1'); s.players[P].library = lib === undefined ? 10 : lib; return id + '#1'; }
function opc(s, P, id, f) { return BF.praxisOptions(s, P, id).find(f || (() => true)); }
{ // falácia: sai do jogo, tira pontos (pode ficar negativo) e registra caveiras
  const s = jogo(8); zera(s); s.debates[0].stakes[0] = 2; s.debates[0].stakes[1] = 4; const c = daCarta(s, 0, 'espantalho');
  const o = opc(s, 0, 'espantalho', x => x.prm.o === 1); BF.playPraxis(s, 0, c, o.prm);
  confere('Espantalho: +4/−4', s.debates[0].stakes[0] === 6 && s.debates[0].stakes[1] === 0);
  confere('Espantalho: −2 pontos, placar negativo', s.players[0].points === -2, s.players[0].points);
  confere('Espantalho: 2 caveiras', s.players[0].caveiras === 2);
  confere('Espantalho: sai do jogo', s.exiladas.indexOf(c) >= 0 && s.discard.indexOf(c) < 0);
  const c2 = daCarta(s, 0, 'retorsio'); s.debates[0].stakes[1] = 3; BF.playPraxis(s, 0, c2, opc(s, 0, 'retorsio').prm);
  confere('Argumento volta com o descarte e não tira pontos', s.discard.indexOf(c2) >= 0 && s.players[0].points === -2); }
{ // Non Sequitur: descarta até 3 temporárias sorteadas (desde 20/11/2026)
  const s = jogo(9); zera(s); s.players[1].hand = ['kant', 'sofisma#1', 'reductio#1', 'tautologia#1'];
  const c = daCarta(s, 0, 'nonsequitur'); BF.playPraxis(s, 0, c, opc(s, 0, 'nonsequitur', x => x.prm.o === 1).prm);
  confere('Non Sequitur: fica só o filósofo', s.players[1].hand.length === 1 && s.players[1].hand[0] === 'kant', s.players[1].hand);
  confere('Non Sequitur: −1 ponto', s.players[0].points === -1); }
{ // Tautologia: no recém-chegado ou no debate
  const s = jogo(10); zera(s); s.players[0].group = [Object.assign(G('kant'), { novo: true })]; const c = daCarta(s, 0, 'tautologia', 2);
  BF.playPraxis(s, 0, c, opc(s, 0, 'tautologia', x => x.prm.fi === 0).prm);
  confere('Tautologia: 2 ideias no recém-chegado, Biblioteca paga 2', s.players[0].group[0].ideas === 2 && s.players[0].library === 0); }
{ const s = jogo(10); zera(s); s.debates[1].stakes[0] = 1; const c = daCarta(s, 0, 'tautologia', 2);
  BF.playPraxis(s, 0, c, opc(s, 0, 'tautologia', x => x.prm.d === 1).prm);
  confere('Tautologia: +2 no debate', s.debates[1].stakes[0] === 3); }
{ // Paradoxo: trava, protege a liderança, bloqueia vitória alheia e se desfaz no próximo turno de quem trancou
  const s = jogo(11); zera(s); const v = BF.DEB[s.debates[0].id].valor; s.debates[0].stakes[1] = v; // o 2º jogador lidera e venceria no turno dele
  s.players[0].group = [G('kant', 9)]; const c = daCarta(s, 0, 'paradoxo', 4);
  BF.playPraxis(s, 0, c, { d: 0 });
  confere('Paradoxo: debate trancado', !!s.debates[0].tranca && !BF.livre(s.debates[0]));
  confere('Paradoxo: ninguém leva ideias ao debate trancado', BF.moveOptions(s, 0, 0).every(o => o.di !== 0));
  const id0 = s.debates[0].id; s.players[0].hand = []; BF.endTurn(s, []);
  confere('Paradoxo: o líder adversário não vence enquanto trancado', s.debates.some(d => d.id === id0) && s.players[1].points === 0, s.players[1].points);
  s.players[1].hand = []; BF.endTurn(s, []); s.players[2].hand = []; BF.endTurn(s, []);
  const d0 = s.debates.find(d => d.id === id0); confere('Paradoxo: destrava no início do turno de quem trancou', d0 && !d0.tranca); }
{ const s = jogo(12); zera(s); const v = BF.DEB[s.debates[0].id].valor; s.debates[0].stakes[0] = v; const c = daCarta(s, 0, 'paradoxo', 4);
  BF.playPraxis(s, 0, c, { d: 0 }); s.players[0].hand = []; BF.endTurn(s, []); s.players[1].hand = []; BF.endTurn(s, []); s.players[2].hand = []; BF.endTurn(s, []);
  confere('Paradoxo: quem trancou e lidera vence ao destravar', s.players[0].points === v, s.players[0].points); }
{ // Cicuta
  const s = jogo(13); zera(s); s.players[1].group = [G('socrates', 3), G('diogenes', 2), G('kant', 1)]; const c = daCarta(s, 0, 'cicuta', 1);
  const os = BF.praxisOptions(s, 0, 'cicuta');
  confere('Cicuta com 1 na Biblioteca: só Sócrates', os.length === 1 && os[0].prm.fi === 0, os.map(o => o.label));
  BF.playPraxis(s, 0, c, os[0].prm);
  confere('Cicuta: Sócrates sai da mesa, custa 1', s.players[1].group.length === 2 && !s.players[1].group.some(g => g.id === 'socrates') && s.players[0].library === 0); }
{ const s = jogo(13); zera(s); s.players[1].group = [G('platao', 3), G('diogenes', 2)]; daCarta(s, 0, 'cicuta', 10);
  confere('Cicuta: Diógenes é imune; Platão custa 3', BF.praxisOptions(s, 0, 'cicuta').length === 1 && BF.custoPraxis(s, 0, 'cicuta#1', { o: 1, fi: 0 }) === 3); }
{ // Dogma: os dois materialistas não recebem ideias no próximo momento de Reflexão
  const s = jogo(14); zera(s); s.players[1].group = [G('marx', 0), G('locke', 0), G('hobbes', 0)]; const c = daCarta(s, 0, 'dogma', 4);
  BF.playPraxis(s, 0, c, { o: 1 }); s.players[0].hand = []; BF.endTurn(s, []);
  const g = s.players[1].group, z = g.filter(x => x.ideas === 0).length;
  confere('Dogma: dois sem Reflexão, um recebe', z === 2, g.map(x => x.id + ':' + x.ideas));
  s.players[1].hand = []; BF.endTurn(s, []); s.players[2].hand = []; BF.endTurn(s, []); s.players[0].hand = []; BF.endTurn(s, []);
  confere('Dogma: vale uma só vez', s.players[1].group.every(x => x.ideas > 0), s.players[1].group.map(x => x.id + ':' + x.ideas)); }
{ // Niilismo
  const s = jogo(15); zera(s); s.players[1].group = [G('kant', 9), G('marx', 9)]; const c = daCarta(s, 0, 'niilismo', 3);
  BF.playPraxis(s, 0, c, { o: 1 }); s.players[0].hand = []; BF.endTurn(s, []);
  confere('Niilismo: o Germânico não debate', BF.moveOptions(s, 1, 0).length === 0 && /Niilismo/.test(BF.porqueNao(s, 1, 0)));
  confere('Niilismo: os outros debatem', BF.moveOptions(s, 1, 1).length > 0);
  s.players[1].hand = []; BF.endTurn(s, []); s.players[2].hand = []; BF.endTurn(s, []); s.players[0].hand = []; BF.endTurn(s, []);
  confere('Niilismo: passa depois de um turno', BF.moveOptions(s, 1, 0).length > 0); }
{ // Ceticismo
  const s = jogo(16); zera(s); let di = s.debates.findIndex(d => BF.DEB[d.id].area === 'meta');
  if (di < 0) { s.debates[0].id = 'd04'; di = 0; }
  s.debates[di].stakes[0] = 1; s.debates[di].stakes[1] = 6; let c = daCarta(s, 0, 'ceticismo', 2);
  BF.playPraxis(s, 0, c, { d: di, o: 1 }); confere('Ceticismo sem materialista: −2', s.debates[di].stakes[1] === 4);
  s.players[0].group = [G('locke')]; c = daCarta(s, 0, 'ceticismo', 1); s.players[0].hand = s.players[0].hand.filter(x => x !== 'ceticismo#1').concat(['ceticismo#1']);
  BF.playPraxis(s, 0, 'ceticismo#1', { d: di, o: 1 }); confere('Ceticismo com materialista: −4', s.debates[di].stakes[1] === 0, s.debates[di].stakes[1]); }

// 9. Maquiavel: o soberano é o filósofo de maior custo; Bibliotecário ou teto mandam a ideia para a Biblioteca (19/11/2026)
{ const s = jogo(17); zera(s); s.players[1].group = [G('maquiavel', 0), G('marx', 3), G('locke', 0)]; passaPara1(s);
  const g = s.players[1].group; confere('Maquiavel: +1 para o de maior custo (Marx: 3 + Reflexão 3 + escola 1 + 1)', g[1].ideas === 3 + 3 + 1 + 1, g[1].ideas); }
{ const s = jogo(17); zera(s); s.players[1].group = [G('maquiavel', 0), Object.assign(G('kant', 0), { lib: true })]; passaPara1(s);
  confere('Maquiavel: soberano Bibliotecário → +1 na Biblioteca', s.players[1].library === 3 + 5 + 1, s.players[1].library); }
{ const s = jogo(17); zera(s); s.players[1].group = [G('maquiavel', 0), G('kant', 10)]; passaPara1(s);
  confere('Maquiavel: soberano no teto → +1 na Biblioteca', s.players[1].library === 3 + 1 && s.players[1].group[1].ideas === 10, s.players[1].library); }

// 10. Ajustes de 20/11/2026: Petitio nova, Erasmo só no líder, Bacon com debate de Lógica, explicação dos alvos fora do alcance
{ // Petitio (desde 20/11/2026): dá a conclusão por provada; vence abaixo do valor se ainda liderar depois de uma volta da mesa
  const volta = s => { for (let k = 0; k < 3; k++) { const pl = s.players[s.turn]; pl.hand = pl.hand.slice(0, 5); BF.endTurn(s, []); } };
  const s = jogo(18); zera(s); s.debates[0].id = 'd01'; s.debates[0].stakes = [3, 1, 0]; s.debates[1].stakes = [0, 2, 0];
  const c = daCarta(s, 0, 'petitio', 2); const ops = BF.praxisOptions(s, 0, 'petitio');
  confere('Petitio: só onde você tem mais ideias que cada um', ops.length === 1 && ops[0].prm.d === 0, ops);
  BF.playPraxis(s, 0, c, ops[0].prm); confere('Petitio: custo 2, −2 pontos, selo no debate', s.players[0].library === 0 && s.players[0].points === -2 && s.debates[0].petitio.P === 0);
  volta(s); confere('Petitio: ninguém recusou, vence abaixo do valor (15 pontos)', s.players[0].points === 13 && s.players[0].won.indexOf('d01') >= 0, s.players[0].points);
  const t = jogo(18); zera(t); t.debates[0].id = 'd01'; t.debates[0].stakes = [3, 1, 0]; const c2 = daCarta(t, 0, 'petitio', 2);
  BF.playPraxis(t, 0, c2, BF.praxisOptions(t, 0, 'petitio')[0].prm); t.debates[0].stakes[1] = 3;
  volta(t); confere('Petitio: empate recusa a conclusão; o selo sai', t.players[0].points === -2 && !t.debates[0].petitio && t.players[0].won.length === 0, [t.players[0].points, t.debates[0]]); }
{ const s = jogo(19); zera(s); s.debates[0].id = 'd04'; const di = 0;
  if (di >= 0) { s.players[1].group = [G('erasmo')]; s.debates[di].stakes[1] = 6; s.debates[di].stakes[2] = 4; s.debates[di].stakes[0] = 4; passaPara1(s);
    confere('Erasmo: quem lidera não é o jogador 2 (o dono lidera)', s.debates[di].stakes[2] === 4 && s.debates[di].stakes[0] === 4, s.debates[di].stakes); }
  else confere('Erasmo: semente sem debate de Metafísica', true); }
{ const s = jogo(19); zera(s); s.debates[0].id = 'd04'; const di = 0;
  if (di >= 0) { s.players[1].group = [G('erasmo')]; s.debates[di].stakes[0] = 5; s.debates[di].stakes[2] = 3; passaPara1(s);
    confere('Erasmo: o líder perde 1, o segundo não', s.debates[di].stakes[0] === 4 && s.debates[di].stakes[2] === 3, s.debates[di].stakes); }
  else confere('Erasmo: semente sem debate de Metafísica', true); }
for (const ids of [['d01', 'd07'], ['d04', 'd07']]) { const s = jogo(20); zera(s); ids.forEach((id, i) => { s.debates[i].id = id; });
  s.players[1].group = [G('bacon')]; const temLog = s.debates.some(d => BF.DEB[d.id].area === 'logica'); passaPara1(s);
  confere('Bacon: +1 na Biblioteca só com debate de Lógica (' + temLog + ')', s.players[1].library === 3 + (temLog ? 1 : 0), [s.players[1].library, temLog]); }
{ const s = jogo(21); zera(s); s.players[1].group = [Object.assign(G('socrates'), { lib: true }), G('nietzsche')]; s.players[0].library = 5;
  const f = BF.foraDoAlcance(s, 0, 'cicuta'); confere('Cicuta: explica o Sócrates Bibliotecário', f.length === 1 && /Bibliotecário/.test(f[0]), f);
  s.players[1].niil = 1; confere('Niilismo: explica quem já está sob o efeito', /já está sob o Niilismo/.test(BF.foraDoAlcance(s, 0, 'niilismo').join(' '))); }

// 11. Escolas novas (20/11/2026): Teístas e Racionalistas e Franceses
{ const s = jogo(30); zera(s); s.debates[0].id = 'd01'; s.debates[1].id = 'd07';   // Lógica e Ética
  s.players[1].group = [G('descartes')]; s.players[2].group = [G('kant', 6), G('marx', 2)]; passaPara1(s);
  confere('Descartes: o filósofo adversário com mais ideias cai em dúvida', s.players[2].group[0].duvida === true);
  BF.endTurn(s, []); const ops = BF.moveOptions(s, 2, 0);
  confere('Descartes: em dúvida, não vai à Lógica, mas vai à Ética', ops.every(o => o.di !== 0) && ops.some(o => o.di === 1), ops); }
{ const s = jogo(31); zera(s); s.players[0].group = [G('espinoza'), G('marx')]; s.players[1].group = [G('averrois', 0)];
  confere('Espinoza: Marx conta como colega de escola', BF.temColega(s.players[0], s.players[0].group[0]) && BF.temColega(s.players[0], s.players[0].group[1])); }
{ const s = jogo(32); zera(s); s.debates[0].id = 'd01'; s.players[0].group = [G('sartre', 4)];
  confere('Sartre: leva o maior valor (4) mesmo em Lógica (2)', BF.moveOptions(s, 0, 0).some(o => o.di === 0 && o.amt === 4), BF.moveOptions(s, 0, 0)); }
{ const s = jogo(33); zera(s); s.players[0].group = [G('voltaire')];
  confere('Voltaire: Argumento custa 1 a menos; falácia, não', BF.custoMin('reductio', s, 0) === 2 && BF.custoMin('sofisma', s, 0) === 2 && BF.custoMin('paradoxo', s, 0) === 3); }
{ const s = jogo(34); zera(s); s.debates[0].stakes = [3, 1, 0]; s.players[1].group = [G('foucault')]; const c = daCarta(s, 0, 'sofisma', 2);
  BF.playPraxis(s, 0, c, BF.praxisOptions(s, 0, 'sofisma')[0].prm); confere('Foucault: a falácia do adversário custa 1 ponto a mais', s.players[0].points === -2, s.players[0].points); }
{ const s = jogo(35); zera(s); s.debates[0].id = 'd07'; s.debates[0].stakes = [0, 5, 0]; s.players[0].group = [G('derrida', 2)];
  const o = BF.moveOptions(s, 0, 0).find(x => x.di === 0); if (o) BF.moveToDebate(s, 0, 0, 0, o.amt);
  confere('Derrida: quem tem mais ideias passa 1 para você', s.debates[0].stakes[1] === 4 && s.debates[0].stakes[0] === 2, s.debates[0].stakes); }
{ const s = jogo(36); zera(s); s.players[1].group = [G('averrois', 0), G('leibniz', 0)];
  const c = daCarta(s, 0, 'deusmorto', 4); const ops = BF.praxisOptions(s, 0, 'deusmorto');
  confere('Deus está morto: só Teístas de custo 1 ou 2', ops.length === 2, ops); BF.playPraxis(s, 0, c, ops[0].prm);
  confere('Deus está morto: o filósofo deixa a mesa', s.players[1].group.length === 1); }

// 12. Orientais (21/11/2026)
{ const s = jogo(40); zera(s); s.players[1].group = [G('jesus', 5), G('kant', 2)]; s.players[0].group = [G('marx', 4), G('hegel', 1)]; s.players[2].group = [G('platao', 0)];
  const lib0 = s.players[1].library; passaPara1(s); const p0 = s.players[0].group, p2 = s.players[2].group;
  confere('Jesus: +4 na Biblioteca (além das 3 do turno) e +1 ao mais pobre de cada adversário', s.players[1].library === lib0 + 3 + 4 && p0[1].ideas === 2 && p0[0].ideas === 4 && p2[0].ideas === 1, [s.players[1].library - lib0, p0.map(g => g.ideas), p2[0].ideas]); }
{ const roda = n => { const s = jogo(41); zera(s); s.players[1].group = [G('buda', n), G('kant', 1), G('marx', 3), G('hegel', 2)]; passaPara1(s); return s.players[1].group.map(x => x.ideas); };
  const a = roda(0), b = roda(4), dif = b.map((x, k) => x - a[k]);
  // 4 ideias: Kant (1), Hegel (2), Marx (3) e de novo Kant; depois Buda recebe as suas (2)
  confere('Buda: distribui uma a uma, do menor para o maior, e depois recebe as suas', b[0] === 2 && dif[1] === 2 && dif[3] === 1 && dif[2] === 1, [a, b]); }
{ const s = jogo(42); zera(s); s.players[1].group = [G('confucio', 0), G('kant', 0), G('platao', 0)]; passaPara1(s); const g = s.players[1].group;
  confere('Confúcio: o mais antigo do grupo (Confúcio, 551 a.C., antes de Platão) recebe +1', g[0].ideas === 2 + 1 && g[2].ideas === 2, g.map(x => x.ideas)); }
{ const s = jogo(43); zera(s); s.players[1].group = [G('confucio', 0), G('zoroastro', 0)]; passaPara1(s); const g = s.players[1].group;
  confere('Confúcio: Zoroastro é mais antigo', g[1].ideas === 1 + 1 + 1 + 2 && g[0].ideas === 2 + 1, g.map(x => x.ideas)); }
{ const s = jogo(44); zera(s); s.players[1].group = [G('avicena', 0), Object.assign(G('kant', 3), { ferido: 3 })]; passaPara1(s); const g = s.players[1].group;
  confere('Avicena: o colega ferido recupera até 2', g[1].ideas === 3 + 3 + 2 && g[0].ideas === 1, g.map(x => x.ideas)); }
{ const s = jogo(45); zera(s); s.players[1].group = [G('avicena', 0)]; passaPara1(s);
  confere('Avicena: sem feridos, estuda (+1)', s.players[1].group[0].ideas === 1 + 1, s.players[1].group[0].ideas); }
{ const s = jogo(46); zera(s); s.players[1].group = [G('zoroastro', 0)]; passaPara1(s); const a = s.players[1].group[0].ideas;
  const s2 = jogo(46); zera(s2); s2.players[1].group = [G('zoroastro', 0)]; s2.players[1].mentiu = true; passaPara1(s2);
  confere('Zoroastro: +2 sem falácia; nada depois de mentir', a === 3 && s2.players[1].group[0].ideas === 1, [a, s2.players[1].group[0].ideas]); }
{ const s = jogo(47); zera(s); s.debates[0].stakes = [0, 2, 0]; s.players[1].group = [G('laotse', 5)]; passaPara1(s);
  confere('Lao-Tsé: +1 em cada debate aberto, sem gastar as dele', s.debates.every((d, i) => d.stakes[1] === (i === 0 ? 3 : 1)) && s.players[1].group[0].ideas === 6, [s.debates.map(d => d.stakes[1]), s.players[1].group[0].ideas]);
  confere('Lao-Tsé: não vai a debates', BF.moveOptions(s, 1, 0).length === 0); }
{ const s = jogo(48); zera(s); s.debates[0].id = 'd04'; s.debates[1].id = 'd07';   // Metafísica e Ética
  s.players[1].group = [G('confucio', 6)]; const c = daCarta(s, 0, 'orientalismo', 2); const o = opc(s, 0, 'orientalismo');
  confere('Orientalismo: mira quem tem Orientais', o && o.prm.o === 1, BF.praxisOptions(s, 0, 'orientalismo'));
  BF.playPraxis(s, 0, c, o.prm); BF.endTurn(s, []); const ops = BF.moveOptions(s, 1, 0);
  confere('Orientalismo: Confúcio só vai à Metafísica', ops.length === 1 && ops[0].di === 0, ops);
  BF.endTurn(s, []); BF.endTurn(s, []); BF.endTurn(s, []);
  confere('Orientalismo: passa depois do turno', s.players[1].orient === 0, s.players[1].orient); }
{ const s = jogo(49); zera(s); s.players[0].group = [G('avicena', 0), G('aristoteles', 0)]; s.players[1].group = [G('confucio', 0), G('laotse', 0)];
  confere('Duplas novas: Confúcio e Lao-Tsé; Avicena e Aristóteles', BF.duplasDe('laotse').some(d => d.par === 'confucio') && BF.duplasDe('avicena').some(d => d.par === 'aristoteles')); }

// 7. partidas só de IA
{ let erros = 0, rod = 0, venc = [0, 0, 0], N = 300;
  for (let sd = 1; sd <= N; sd++) {
    try { const s = BF.newGame({ seed: sd, mudo: true, niveis: ['mestre', 'mestre', 'mestre'], humans: [false, false, false] });
      let k = 0; while (!s.over && k < 6000) { BF.aiStep(s); k++; }
      if (!s.over) erros++; rod += s.round; if (s.vencedor >= 0) venc[s.vencedor]++;
      s.players.forEach(p => p.group.forEach(g => { if (g.ideas < 0 || g.ideas > 10) erros++; })); s.debates.forEach(d => d.stakes.forEach(x => { if (x < 0) erros++; }));
      if (s.exiladas.some(id => !BF.C(id).falacia)) erros++;
    } catch (e) { erros++; console.log(e); } }
  confere('300 partidas só de IA sem erro', erros === 0, erros);
  console.log('partidas: rodadas', (rod / N).toFixed(2), 'vitórias por assento', venc.map(v => (100 * v / N).toFixed(1) + '%').join(' / ')); }

console.log(ok + ' testes ok, ' + falhas + ' falhas');
process.exit(falhas ? 1 : 0);
