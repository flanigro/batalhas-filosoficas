// Exporta para revisão externa o conteúdo das três escolas novas (Teístas, Franceses, Orientais), 21/11/2026.
// Uso, a partir da raiz do repositório (branch escolas-6):  node revisao/exporta_escolas_novas.js
// Saída: revisao/escolas-novas/ (CSV para a revisora preencher e um .md para leitura)
const path = require('path'), fs = require('fs');
const R = path.join(__dirname, '..'), OUT = path.join(__dirname, 'escolas-novas');
fs.mkdirSync(OUT, { recursive: true });
global.window = global;
['falas_teistas', 'falas_franceses', 'falas_orientais'].forEach(f => require(path.join(R, f + '.js')));
const BF = require(path.join(R, 'engine.js')), F = global.BF_FALAS;
// bordões: o coreo.js é do navegador; tira só as duas tabelas
const src = fs.readFileSync(path.join(R, 'coreo.js'), 'utf8');
const tab = nome => { const i = src.indexOf('var ' + nome + '='), j = src.indexOf('\n};', i); return eval('(' + src.slice(src.indexOf('{', i), j + 2) + ')'); };
const LINGUA = tab('LINGUA'), BORDAO = tab('BORDAO');

const ESC = ['teista', 'fran', 'orient'];
const NOVOS = BF.FILOSOFOS.filter(f => ESC.includes(f.escola));
const ids = new Set(NOVOS.map(f => f.id));
const ROT = { c: 'Tradução livre', p: 'Em outras palavras', i: 'A partir de suas ideias' };
const nomeCompleto = f => (f.pre ? (/^de /.test(f.pre) ? f.nome + ' ' + f.pre : f.pre + ' ' + f.nome) : f.nome);
const csv = rows => '﻿' + rows.map(r => r.map(v => { v = v == null ? '' : String(v); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(',')).join('\r\n') + '\r\n';
const REV = ['veredito', 'categorias', 'apontamento', 'evidencia', 'fonte_correta'];
const deb = BF.DEBATES.slice().sort((a, b) => a.id < b.id ? -1 : 1);

// 1. falas
const fal = [['id', 'filosofo', 'escola', 'pergunta', 'area', 'rotulo', 'texto', 'caracteres', 'fonte_indicada'].concat(REV)];
let md = '';
NOVOS.forEach(f => {
  const fs_ = F[f.id] || {}; md += '\n## ' + nomeCompleto(f) + ' (' + BF.ESCOLA[f.escola].nome + ')\n';
  deb.forEach(d => { const a = fs_[d.id]; if (!a) return;
    const id = f.id + '-' + d.id;
    fal.push([id, nomeCompleto(f), BF.ESCOLA[f.escola].nome, d.q, BF.AREA[d.area].nome, ROT[a[0]], a[1], a[1].length, a[2], '', '', '', '', '']);
    md += '\n**' + id + '** · ' + d.q + '\n- ' + ROT[a[0]] + ' — ' + a[2] + '\n- ' + a[1] + '\n';
  });
});
// 2. relações (as que envolvem um filósofo novo)
const rel = [['id', 'filosofo', 'sobre', 'relacao', 'fonte_indicada'].concat(REV)];
let mdr = '', nrel = 0;
BF.RELACOES.forEach((r, i) => { if (!ids.has(r[0]) && !ids.has(r[1])) return;
  const id = 'rel' + String(i + 1).padStart(2, '0'), a = BF.C(r[0]).nome, b = BF.C(r[1]).nome; nrel++;
  rel.push([id, a, b, r[2], r[3], '', '', '', '', '']);
  mdr += '\n**' + id + '** · ' + a + ' e ' + b + '\n- ' + r[2] + '\n- Fonte indicada: ' + r[3] + '\n'; });
// duplas novas (frase da dupla)
BF.DUPLAS.forEach((d, i) => { if (!ids.has(d[0]) && !ids.has(d[1])) return;
  const id = 'dupla-' + d[0] + '-' + d[1]; nrel++;
  rel.push([id, BF.C(d[0]).nome, BF.C(d[1]).nome, d[2], '(frase da dupla clássica)', '', '', '', '', '']);
  mdr += '\n**' + id + '** · dupla ' + BF.C(d[0]).nome + ' e ' + BF.C(d[1]).nome + '\n- ' + d[2] + '\n'; });
// 3. cartas dos filósofos
const car = [['id', 'filosofo', 'escola', 'datas', 'local', 'obra_de_referencia', 'citacao_da_carta', 'fonte_da_citacao', 'poder_nivel2_titulo', 'poder_nivel2_texto', 'poder2_titulo', 'poder3_titulo'].concat(REV)];
let mdc = '';
NOVOS.forEach(f => { car.push(['carta-' + f.id, nomeCompleto(f), BF.ESCOLA[f.escola].nome, f.datas, f.local, f.obra, f.cit || '', f.citFonte || '', f.c1.t, f.c1.d, f.c2.t, f.c3.t, '', '', '', '', '']);
  mdc += '\n**carta-' + f.id + '** · ' + nomeCompleto(f) + ' · ' + f.datas + ' · ' + f.local + '\n- Obra de referência: ' + f.obra + '\n- Citação: ' + (f.cit || '(nenhuma)') + ' — ' + (f.citFonte || '') + '\n- Poder do nível 2: ' + f.c1.t + ' — ' + f.c1.d + '\n- Poderes 2 e 3: ' + f.c2.t + ' · ' + f.c3.t + '\n'; });
// 4. cartas de escola contra estas escolas
const tmp = [['id', 'carta', 'custo', 'texto_do_jogo', 'o_que_e'].concat(REV)];
let mdt = '';
BF.PRAXIS.filter(c => c.fam === 'escola' && ESC.includes(c.esc)).forEach(c => {
  tmp.push(['temp-' + c.id, c.nome, c.custo, c.d, c.oq || '', '', '', '', '', '']);
  mdt += '\n**temp-' + c.id + '** · ' + c.nome + ' (custo ' + c.custo + ')\n- Jogo: ' + c.d + '\n- O que é: ' + (c.oq || '') + '\n'; });
// 5. bordões (texto|tradução)
const bor = [['id', 'filosofo', 'bordao', 'traducao'].concat(REV)];
let mdb = '';
NOVOS.forEach(f => { const b = BORDAO[f.id]; if (!b) return;
  b.p.forEach((x, k) => { const [t, tr] = x.split('|'); bor.push(['bordao-' + f.id + '-' + (k + 1), f.nome, t, tr || '', '', '', '', '', '']); });
  mdb += '\n**' + f.nome + '**: ' + b.p.map(x => x.replace('|', ' (') + (x.includes('|') ? ')' : '')).join(' · ') + ' — línguas: ' + b.l.join(', ') + '\n'; });
const usadas = new Set(); NOVOS.forEach(f => (BORDAO[f.id] || { l: [] }).l.forEach(l => usadas.add(l)));
[...usadas].forEach(l => LINGUA[l].forEach((x, k) => { const [t, tr] = x.split('|'); bor.push(['lingua-' + l + '-' + (k + 1), '(comum: ' + l + ')', t, tr || '', '', '', '', '', '']); }));
mdb += '\nBordões comuns das línguas usadas: ' + [...usadas].map(l => l + ': ' + LINGUA[l].map(x => x.replace('|', ' (') + ')').join(', ')).join(' · ') + '\n';

fs.writeFileSync(path.join(OUT, 'falas-escolas-novas.csv'), csv(fal));
fs.writeFileSync(path.join(OUT, 'relacoes-escolas-novas.csv'), csv(rel));
fs.writeFileSync(path.join(OUT, 'cartas-escolas-novas.csv'), csv(car));
fs.writeFileSync(path.join(OUT, 'temporarias-escolas-novas.csv'), csv(tmp));
fs.writeFileSync(path.join(OUT, 'bordoes-escolas-novas.csv'), csv(bor));
const cont = {}; fal.slice(1).forEach(l => cont[l[5]] = (cont[l[5]] || 0) + 1);
fs.writeFileSync(path.join(OUT, 'conteudo-escolas-novas.md'),
  '# Batalha dos Filósofos — escolas novas: conteúdo para revisão\n\nExportado do código do jogo em ' + new Date().toLocaleDateString('pt-BR') + '. Tudo está marcado “a verificar”. Os identificadores (por exemplo, descartes-d04, rel47, carta-buda) são os mesmos dos CSV.\n\n'
  + '- ' + (fal.length - 1) + ' falas (' + NOVOS.length + ' filósofos × 24 perguntas): ' + Object.entries(cont).map(([k, v]) => v + ' “' + k + '”').join(', ') + '.\n'
  + '- ' + nrel + ' relações históricas e frases de duplas.\n- ' + NOVOS.length + ' cartas de filósofos.\n- ' + (tmp.length - 1) + ' cartas de escola.\n- ' + (bor.length - 1) + ' bordões.\n'
  + '\n# Parte 1 — Falas por pergunta\n' + md + '\n# Parte 2 — Relações e duplas\n' + mdr + '\n# Parte 3 — Cartas dos filósofos\n' + mdc + '\n# Parte 4 — Cartas de escola\n' + mdt + '\n# Parte 5 — Bordões\n' + mdb);
console.log('falas', fal.length - 1, 'relações', nrel, 'cartas', car.length - 1, 'temporárias', tmp.length - 1, 'bordões', bor.length - 1, cont);
