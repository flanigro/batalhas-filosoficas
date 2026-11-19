/* Batalhas Filosóficas — a mesa em Three.js (rodada 5: a arena)
 *
 * COMO FUNCIONA
 * - A cena 3D é o TABULEIRO, em faixas (de cima para baixo na tela):
 *   1. Faixa dos adversários: uma galeria reta no alto da arena. Para cada adversário, o bloco de
 *      identificação (emblema e placar em HTML, Biblioteca em 3D) e quatro púlpitos compactos.
 *   2. Arena semicircular de mármore, com arquibancadas vazias e as três placas de debate no centro.
 *   3. Faixa estreita e livre entre as placas e os púlpitos (reservada aos saltos de uma etapa futura).
 *   4. Os quatro púlpitos do jogador, com o filósofo (imagem da carta) atrás de cada um.
 *   A faixa inferior (jogador, Minha Biblioteca, mão, comandos) é HTML, fora da cena (ui.js).
 * - ui.js desenha elementos HTML com data-anc="chave"; a cada quadro este arquivo põe cada um sobre o
 *   objeto 3D correspondente (função ancora). Clique, seleção, alvos e arrasto seguem em ui.js.
 * - M3D.sync(S, ocultos) deixa a cena igual ao estado do jogo. coreo.js pede movimentos pela API no fim
 *   do arquivo (window.M3D).
 * - Um elemento com a classe .alvo, .sobre ou .selecionado acende o objeto 3D da sua âncora.
 *
 * MEDIDAS: y para cima, x para a direita, z para o jogador. O piso da arena fica em y = 0.
 * Tudo o que é posição e tamanho está em L (logo abaixo); tudo o que é aparência, em materiais.js.
 */
import * as THREE from 'three';
import { criarMateriais, matLivro, gerado, normalDe, tela, registrar, anisotropia } from './materiais.js';

const V3 = THREE.Vector3, BF = window.BF;
const L = {
  // arena: centro (cx, cz), raio onde começam os degraus, número de degraus (bancos), profundidade e altura de
  // cada um, parapeito no alto; ext = quanto o arco passa de meia-volta de cada lado (em radianos)
  arena: { cx: 0, cz: .8, r0: 7.7, n: 4, prof: .8, alt: .3, ext: .5, ez: .62 },   // ez: achatamento em z (a planta é meia elipse)
  podio: .2,                                   // pódio baixo sob cada placa
  // placas: a do centro de frente; as dos lados giradas de leve, acompanhando a curva da arena
  placa: { x: [-4.4, 0, 4.4], z: [-1.08, -1.35, -1.08], rot: [.14, 0, -.14], w: 3.95, esp: .2, topo: .1, cab: .62, perg: 1.12, prat: .5, base: .14, lado: .14, med: .5, num: .44 },
  // púlpitos do jogador; a carta fica atrás, com "oculto" de altura escondida pelo púlpito
  ped: { x: [-4.1, -1.37, 1.37, 4.1], z: 3.9, w: 2.3, h: 1.22, d: .62, carta: [1.86, 2.48], oculto: 1.06, fig: .82 },
  // faixa dos adversários (fica no terraço, logo atrás da arquibancada; o z sai da arena): escala, inclinação para a
  // câmera, largura do bloco de identificação, do módulo e dos intervalos; módulo (púlpito compacto), carta atrás dele,
  // Biblioteca; alto = topo do bloco de identificação; id0 = onde ele começa (abaixo fica a Biblioteca)
  banda: { esc: 1.24, inc: .24, id: 2.2, m: 1.42, mg: .14, gg: .55, mod: { w: 1.34, h: .64, d: .46 }, carta: [1.24, 1.66], oculto: .54, bib: 1.7, alto: 2.42, id0: .9 },
  livro: { w: .74, d: .5 },
  cam: { fov: 30, passo: 35 * Math.PI / 180, alvo: [0, 1.4, -1.2] },
};
const PED_H = L.ped.h + .08;                 // altura do tampo do púlpito
const TOPO = L.arena.n * L.arena.alt;        // altura do terraço, no alto da arquibancada
const SOL = new V3(1, .62, .5).normalize();  // de onde vem a luz: direita, baixa, um pouco da frente
const CONTORNO = '#3a3836';                  // cor do contorno dos objetos de jogo (estilização), cinza neutro
const CINZA = '#a3a19c';                     // debate ainda não aberto
const R1 = L.arena.r0 + L.arena.n * L.arena.prof;   // raio externo da arquibancada
// a galeria dos adversários fica inteira atrás da arquibancada: nenhum degrau passa na frente dos dados
L.banda.z = L.arena.cz - (R1 + .3) * L.arena.ez - .45;
const USAR_BONECOS = false;                  // marionetes (Diógenes) ficam para a etapa de animação
/* PERSONAGENS: ilustração estática de corpo inteiro (PNG com transparência) que substitui a imagem da carta atrás
   do púlpito, enquanto não há animação. Encaixe reversível: se o arquivo faltar ou não carregar, volta a carta.
   Para desligar tudo, USAR_PERSONAGENS = false; para tirar um filósofo, apague a linha dele.
   Convenção da arte (lista de assets, item 1.1), em frações da altura da prancheta, medidas a partir da borda de baixo:
     pes  = linha do chão, onde os pés se apoiam (padrão .04);
     guia = guia do púlpito (padrão .476, que é 48% da altura da figura numa prancheta de 2200 px com figura de 2000 px).
   Na cena, os pés ficam no chão e a guia coincide com o tampo do púlpito: a escala sai daí. */
const USAR_PERSONAGENS = true;
const PERSONAGENS = {
  nietzsche: { arq: 'personagens/nietzsche.png', pes: .04, guia: .476 },
};
const _hash = location.hash.slice(1).split('-');   // entradas de teste: #medir, #doze (o mesmo personagem nas doze vagas)
const TESTE_DOZE = _hash.indexOf('doze') >= 0, MEDIR = _hash.indexOf('medir') >= 0;

let renderer, scene, camera, MAT, sol, hemi, relogio = 0;
const R = { slots: [], meus: [], ops: {}, bibs: {}, ident: {}, livroPe: {}, livroMat: {}, coro: [], halos: {}, emis: {} };
let S = null, OC = {};


// ---------- utilidades ----------
function rnd(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function uvMundo(geo, w, h, d) {
  const uv = geo.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const k = f * 4 + i; uv.setXY(k, uv.getX(k) * dims[f][0], uv.getY(k) * dims[f][1]); }
  return geo;
}
function caixa(w, h, d, material, o) {
  o = o || {};
  const m = new THREE.Mesh(uvMundo(new THREE.BoxGeometry(w, h, d), w, h, d), material);
  m.castShadow = o.sombra !== false; m.receiveShadow = true;
  if (o.p) m.position.set(o.p[0], o.p[1], o.p[2]);
  if (o.em) o.em.add(m);
  return m;
}
function cilindro(r1, r2, h, material, seg, o) {
  o = o || {};
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg || 16), material);
  m.castShadow = o.sombra !== false; m.receiveShadow = true; if (o.p) m.position.set(o.p[0], o.p[1], o.p[2]); if (o.em) o.em.add(m); return m;
}
function texCanvas(c, linear) { const t = new THREE.CanvasTexture(c); if (!linear) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return registrar(t); }
const FONTE = (peso, px, sans) => peso + ' ' + px + 'px ' + (sans ? "'Alegreya Sans',system-ui,sans-serif" : "'Alegreya',Georgia,serif");
function recorteMarmore(x, w, h, semente) {
  const m = gerado('marmore').cor, k = .5 + rnd(semente) * .3, sw = Math.min(m.width, w * k), sh = Math.min(m.height, h * k);
  x.drawImage(m, rnd(semente + 1) * (m.width - sw), rnd(semente + 2) * (m.height - sh), sw, sh, 0, 0, w, h);
}
function quebrar(x, txt, larg, maxLin) {
  const pal = txt.split(' '); let lin = [], at = '';
  pal.forEach(p => { const t = at ? at + ' ' + p : p; if (x.measureText(t).width > larg && at) { lin.push(at); at = p; } else at = t; });
  if (at) lin.push(at);
  return lin.length <= maxLin && lin.every(l => x.measureText(l).width <= larg) ? lin : null;
}
function caber(x, txt, larg, peso, px, min, sans) { x.font = FONTE(peso, px, sans); while (x.measureText(txt).width > larg && px > min) { px -= 1; x.font = FONTE(peso, px, sans); } return px; }
const repintar = [];   // funções que redesenham texturas com texto (rodam de novo quando as fontes chegam)

// ---------- retratos (provisórios: img/<id>.jpg) ----------
const _img = {};
function retrato(id, cb) {
  let o = _img[id];
  if (!o) { o = _img[id] = { img: new Image(), ok: false, cbs: [] }; o.img.onload = () => { o.ok = true; o.cbs.splice(0).forEach(f => f()); }; o.img.src = 'img/' + id + '.jpg'; }
  if (o.ok) return o.img; if (cb) o.cbs.push(cb); return null;
}
// ilustração do personagem (PNG): carrega uma vez; cb roda quando chega. null = não há ou não carregou
const _pers = {};
function personagem(id, cb) {
  const def = USAR_PERSONAGENS && PERSONAGENS[id]; if (!def) return null;
  let o = _pers[id];
  if (!o) {
    o = _pers[id] = { ok: false, falhou: false, cbs: [], def };
    const img = new Image();
    img.onload = () => { const t = new THREE.Texture(img); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.needsUpdate = true; registrar(t);
      o.tex = t; o.asp = img.width / img.height; o.ok = true; o.cbs.splice(0).forEach(f => f()); };
    img.onerror = () => { o.falhou = true; o.cbs.splice(0); };
    img.src = def.arq;
  }
  if (o.ok) return o; if (cb && !o.falhou) o.cbs.push(cb); return null;
}
/* O filósofo atrás do púlpito: a imagem da carta só com o personagem e o custo (sem os quatro valores,
   que já estão no púlpito). O púlpito esconde a parte de baixo; ficam à vista cabeça, ombros e peito. */
const _fig = {};
function texFig(id) {
  if (_fig[id]) return _fig[id];
  const W = 320, H = 428, c = tela(W, H), x = c.getContext('2d'), t = texCanvas(c);
  const pinta = () => {
    const ca = BF.C(id), e = BF.ESCOLA[ca.escola], im = retrato(id, pinta), m = 12;
    x.fillStyle = e.cor2; x.fillRect(0, 0, W, H);
    if (im) { const k = Math.max((W - 2 * m) / im.width, (H - 2 * m) / im.height), sw = (W - 2 * m) / k, sh = (H - 2 * m) / k; x.drawImage(im, (im.width - sw) / 2, Math.max(0, (im.height - sh) * .12), sw, sh, m, m, W - 2 * m, H - 2 * m); }
    else { x.fillStyle = '#5a5a5a'; x.fillRect(m, m, W - 2 * m, H - 2 * m); }
    x.lineWidth = 12; x.strokeStyle = e.cor; x.strokeRect(6, 6, W - 12, H - 12);
    x.lineWidth = 4; x.strokeStyle = CONTORNO; x.strokeRect(2, 2, W - 4, H - 4);
    // custo de invocação, no canto de cima, junto à cabeça
    x.fillStyle = 'rgba(30,15,8,.35)'; x.beginPath(); x.roundRect(17, 21, 70, 70, 14); x.fill();
    x.fillStyle = '#fffaf0'; x.beginPath(); x.roundRect(14, 16, 70, 70, 14); x.fill(); x.lineWidth = 6; x.strokeStyle = e.cor2; x.stroke();
    x.fillStyle = '#23201a'; x.font = FONTE(900, 54); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(ca.custo), 49, 54);
    t.needsUpdate = true;
  };
  pinta(); repintar.push(pinta);
  return _fig[id] = t;
}


// ---------- texturas com texto: placa do debate, face dos púlpitos ----------
function inicial(p) { const n = S && S.players[p] ? S.players[p].nome : '?'; return n.charAt(0).toUpperCase(); }
// geometria da placa em coordenadas locais (y a partir da base da placa; x a partir do centro)
function geoPlaca(nJ) {
  const P = L.placa, H = P.topo + P.cab + P.perg + nJ * P.prat + P.base;
  const linhas = []; for (let r = 0; r < nJ; r++) { const yT = H - P.topo - P.cab - P.perg - r * P.prat; linhas.push({ yT, yB: yT - P.prat }); }
  return { H, linhas, xb0: -P.w / 2 + P.lado + P.med, xb1: P.w / 2 - P.lado - P.num };
}
// posição do k-ésimo livro numa fileira com n vagas, agrupados de cinco em cinco (contagem a olho)
function fileira(n, larg, vagaMax, espMax) {
  const grupos = Math.max(0, Math.ceil(n / 5) - 1), vaga = Math.min(vagaMax, larg / Math.max(1, n + grupos * .5));
  return { vaga, esp: Math.min(espMax, vaga * .8), x: k => k * vaga + Math.floor(k / 5) * vaga * .5 + vaga / 2 };
}
/* Placa do debate. Aberto: tudo na cor da área (cabeçalho, borda, pilastras). Ainda não aberto: a mesma
   estrutura, em cinza, com o aviso de quando o debate entra. */
function pintarPlaca(slot) {
  const c = slot.tela, x = c.getContext('2d'), W = c.width, Hc = c.height, P = L.placa, g = slot.geo;
  const q = slot.did ? BF.DEB[slot.did] : null, a = q ? BF.AREA[q.area] : null, cor = a ? a.cor : CINZA;
  const X = wx => (wx + P.w / 2) / P.w * W, Y = wy => (g.H - wy) / g.H * Hc, k = W / P.w;
  // fundo: reboco claro com um pouco de veio
  x.fillStyle = q ? '#f5f1e8' : '#e6e4df'; x.fillRect(0, 0, W, Hc);
  x.globalAlpha = .28; x.globalCompositeOperation = 'multiply'; recorteMarmore(x, W, Hc, slot.i * 7 + 3); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
  // A. cabeçalho na cor da área, medalhão com o valor e nome da área
  const y0 = Y(g.H - P.topo), y1 = Y(g.H - P.topo - P.cab);
  x.fillStyle = cor; x.fillRect(0, 0, W, y1);
  x.fillStyle = 'rgba(0,0,0,.22)'; x.fillRect(0, y1 - 6, W, 6); x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(0, y0, W, 4);
  const mr = (y1 - y0) * .64, mx = mr + 22, my = (y0 + y1) / 2;
  x.fillStyle = 'rgba(40,20,10,.35)'; x.beginPath(); x.arc(mx - 3, my + 5, mr, 0, 7); x.fill();
  x.fillStyle = q ? '#f5dca4' : '#ddd8cf'; x.beginPath(); x.arc(mx, my, mr, 0, 7); x.fill();
  x.lineWidth = 5; x.strokeStyle = CONTORNO; x.stroke(); x.lineWidth = 2; x.strokeStyle = q ? '#c8962a' : '#a8a196'; x.beginPath(); x.arc(mx, my, mr - 7, 0, 7); x.stroke();
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = q ? '#3a2208' : '#8a847a';
  const val = q ? String(q.valor) : '?'; x.font = FONTE(900, mr * (val.length > 1 ? 1.15 : 1.35)); x.fillText(val, mx, my + 3);
  x.textAlign = 'left'; x.fillStyle = '#fffaf0'; const nome = q ? a.nome.toUpperCase() : 'DEBATE A ABRIR', larg = W - (mx + mr + 18) - 22; let pa = 34; x.font = FONTE(800, pa, true);
  let lin = [nome]; while (x.measureText(nome).width > larg && pa > 26) { pa--; x.font = FONTE(800, pa, true); }
  if (x.measureText(nome).width > larg) { pa = 30; x.font = FONTE(800, pa, true); lin = quebrar(x, nome, larg, 2) || [nome]; }
  lin.forEach((l, i) => x.fillText(l, mx + mr + 18, my + (i - (lin.length - 1) / 2) * pa * 1.05));
  // B. a pergunta: letra grande e escura, centrada (ou o aviso do debate que vai entrar)
  const pt = y1 + 6, ph = Y(g.H - P.topo - P.cab - P.perg) - pt - (q ? 30 : 8), pl = W - 56;
  const txt = q ? q.q : (slot.vago || ''), pmax = q ? 64 : 40;
  let px = pmax, pls = null; for (; px >= 26; px -= 2) { x.font = FONTE(q ? 700 : 500, px); pls = quebrar(x, txt, pl, 3); if (pls && pls.length * px * 1.08 <= ph) break; }
  if (!pls) { x.font = FONTE(700, 26); pls = quebrar(x, txt, pl, 9) || [txt]; px = 26; }
  x.textAlign = 'center'; x.fillStyle = q ? '#2a1c10' : '#7d776d'; const lh = px * 1.08, py0 = pt + (ph - pls.length * lh) / 2 + lh / 2;
  if (!q) x.font = FONTE(500, px).replace('500', 'italic 500');
  pls.forEach((l, i) => x.fillText(l, W / 2, py0 + i * lh));
  // C. prateleiras: fundo de pedra cinza (sem madeira), escuro o bastante para os livros de todas as cores
  //    saltarem; letra do jogador grande, na cor de maior contraste; marco dourado do valor
  const f = slot.fil;
  g.linhas.forEach((ln, p) => {
    const yt = Y(ln.yT), yb = Y(ln.yB), gr = x.createLinearGradient(0, yt, 0, yb), xa = X(-P.w / 2 + P.lado), xb = X(P.w / 2 - P.lado);
    gr.addColorStop(0, q ? '#6c6a67' : '#aeaaa3'); gr.addColorStop(1, q ? '#4f4d4a' : '#97938c'); x.fillStyle = gr; x.fillRect(xa, yt + 3, xb - xa, yb - yt - 3);
    x.fillStyle = 'rgba(0,0,0,.28)'; x.fillRect(xa, yt + 3, xb - xa, 5);
    const pc = q && S.players[p] ? S.players[p].cor : '#c4c0b8', cx = X(-P.w / 2 + P.lado + P.med / 2), cy = (yt + yb) / 2 + 2, r = Math.min(P.med * .47 * k, (yb - yt) * .47);
    x.fillStyle = pc; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); x.lineWidth = 3.5; x.strokeStyle = q ? '#1d1b18' : '#8a867f'; x.stroke();
    const tl = q ? corSobre(pc) : '#6f6b65', ct = tl === '#ffffff' ? 'rgba(20,18,15,.8)' : 'rgba(255,255,255,.75)';
    x.font = FONTE(900, r * 1.5); x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
    x.lineWidth = 3; x.strokeStyle = ct; x.strokeText(inicial(p), cx, cy + 3); x.fillStyle = tl; x.fillText(inicial(p), cx, cy + 3);
    if (!q || !f) return;
    // marco do valor (vence com N) e fim da prateleira (dobro = vitória imediata)
    const mv = X(g.xb0 + (f.x(q.valor - 1) + f.x(q.valor)) / 2);
    x.fillStyle = '#e9c25a'; x.fillRect(mv - 2.5, yt + 4, 5, yb - yt - 4); x.fillStyle = 'rgba(80,50,10,.6)'; x.fillRect(mv + 2.5, yt + 4, 1.5, yb - yt - 4);
    const me = X(g.xb0 + f.x(2 * q.valor - 1) + f.vaga / 2 + .02);
    x.fillStyle = 'rgba(233,194,90,.55)'; x.fillRect(me - 1, yt + 4, 3, yb - yt - 4);
  });
  // marcas do valor acima das prateleiras: "N" no marco e "2N" no fim
  if (q && f) {
    const ytop = Y(g.linhas[0].yT), mv = X(g.xb0 + (f.x(q.valor - 1) + f.x(q.valor)) / 2), me = X(g.xb0 + f.x(2 * q.valor - 1) + f.vaga / 2 + .02);
    // N e 2N: algarismos escuros e maiores sobre etiqueta clara com borda dourada (nunca branco sobre amarelo)
    x.font = FONTE(900, 27, true); x.textBaseline = 'bottom';
    [[mv, String(q.valor)], [me, String(2 * q.valor)]].forEach(([mx2, t], i) => { const w2 = x.measureText(t).width + 14; x.fillStyle = '#fff7df'; x.beginPath(); x.roundRect(mx2 - w2 / 2, ytop - 31, w2, 29, 6); x.fill();
      x.lineWidth = 3; x.strokeStyle = i ? '#a8822e' : '#c8962a'; x.stroke(); x.fillStyle = '#1d1710'; x.textAlign = 'center'; x.fillText(t, mx2, ytop - 3); });
    x.textBaseline = 'middle';
  }
  // borda na cor da área: a cor identifica o conjunto, não só o cabeçalho
  x.lineWidth = 18; x.strokeStyle = cor; x.strokeRect(9, 9, W - 18, Hc - 18);
  x.lineWidth = 3; x.strokeStyle = 'rgba(255,255,255,.45)'; x.strokeRect(19.5, 19.5, W - 39, Hc - 39);
  x.lineWidth = 4; x.strokeStyle = CONTORNO; x.strokeRect(2, 2, W - 4, Hc - 4);
  slot.tex.needsUpdate = true;
}
// fundo de mármore claro e neutro para as faces dos púlpitos
function faceMarmore(x, W, H, sem) {
  x.fillStyle = '#ece9e3'; x.fillRect(0, 0, W, H);
  x.globalAlpha = .35; x.globalCompositeOperation = 'multiply'; recorteMarmore(x, W, H, sem); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
}
// cor do texto sobre uma cor de fundo: escuro ou branco, o que contrastar mais
function corSobre(hex) {
  const c = new THREE.Color(hex), lin = v => v, L = .2126 * lin(c.r) + .7152 * lin(c.g) + .0722 * lin(c.b);   // THREE.Color já guarda em linear
  return (L + .05) / .05 > 1.05 / (L + .05) ? '#17130f' : '#ffffff';
}
// número de atributo: algarismo grosso, com contorno fino para não se perder no fundo
function numero(x, txt, cx, cy, px, cor, contornoCor) {
  x.font = FONTE(900, px, true); x.textAlign = 'center'; x.textBaseline = 'middle';
  x.lineJoin = 'round'; x.lineWidth = Math.max(3, px * .09); x.strokeStyle = contornoCor; x.strokeText(txt, cx, cy);
  x.fillStyle = cor; x.fillText(txt, cx, cy);
}
/* face do púlpito do jogador: nome na faixa escura de cima; os quatro atributos 2 × 2, grandes, em placas na
   cor da área. Área com debate na mesa: placa cheia e moldura branca; sem debate: placa mais apagada. */
function pintarPedestal(seat) {
  const c = seat.tela, x = c.getContext('2d'), W = c.width, H = c.height, fx = Math.round(H * .2);
  faceMarmore(x, W, H, seat.k * 13 + 5);
  x.fillStyle = '#26231f'; x.fillRect(0, 0, W, fx); x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(0, fx, W, 3);
  if (seat.id) {
    const ca = BF.C(seat.id), nome = ca.nome.toUpperCase();
    x.textAlign = 'center'; x.textBaseline = 'middle';
    try { x.letterSpacing = '3px'; } catch (e) {}
    caber(x, nome, W - 48, 900, Math.round(fx * .66), 26);
    x.fillStyle = '#f4efe4'; x.fillText(nome, W / 2, fx * .58); try { x.letterSpacing = '0px'; } catch (e) {}
    const gx = 16, gy = 12, bw = (W - 3 * gx) / 2, bh = (H - fx - 3 - 3 * gy) / 2;
    BF.AREAS.forEach((a, i) => {
      const ar = BF.AREA[a], bx = gx + (i % 2) * (bw + gx), by = fx + 3 + gy + Math.floor(i / 2) * (bh + gy), on = seat.on && seat.on[a];
      x.fillStyle = 'rgba(40,38,34,.28)'; x.beginPath(); x.roundRect(bx - 3, by + 5, bw, bh, 14); x.fill();
      x.globalAlpha = on ? 1 : .62; x.fillStyle = ar.cor; x.beginPath(); x.roundRect(bx, by, bw, bh, 14); x.fill(); x.globalAlpha = 1;
      if (on) { x.lineWidth = 5; x.strokeStyle = '#ffffff'; x.beginPath(); x.roundRect(bx + 7, by + 7, bw - 14, bh - 14, 9); x.stroke(); }
      x.lineWidth = 2.5; x.strokeStyle = 'rgba(30,28,25,.55)'; x.beginPath(); x.roundRect(bx, by, bw, bh, 14); x.stroke();
      numero(x, String(ca.vals[a]), bx + bw / 2, by + bh / 2 + 3, bh * .9, '#ffffff', 'rgba(20,18,15,.75)');
    });
  }
  seat.tex.needsUpdate = true;
}
// face do púlpito compacto do adversário: nome em cima, os quatro atributos em fila, grandes
function pintarModulo(s) {
  const c = s.tela, x = c.getContext('2d'), W = c.width, H = c.height, fx = Math.round(H * .34);
  faceMarmore(x, W, H, s.k * 17 + s.P * 5);
  x.fillStyle = '#26231f'; x.fillRect(0, 0, W, fx); x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(0, fx, W, 3);
  if (s.id) {
    const ca = BF.C(s.id), nome = ca.nome.toUpperCase();
    x.textAlign = 'center'; x.textBaseline = 'middle';
    try { x.letterSpacing = '2px'; } catch (e) {}
    caber(x, nome, W - 28, 900, Math.round(fx * .74), 24);
    x.fillStyle = '#f4efe4'; x.fillText(nome, W / 2, fx * .56); try { x.letterSpacing = '0px'; } catch (e) {}
    const g = 9, bw = (W - 5 * g) / 4, bh = H - fx - 3 - 2 * g;
    BF.AREAS.forEach((a, i) => {
      const bx = g + i * (bw + g), by = fx + 3 + g;
      x.fillStyle = 'rgba(40,38,34,.28)'; x.beginPath(); x.roundRect(bx - 2, by + 4, bw, bh, 10); x.fill();
      x.fillStyle = BF.AREA[a].cor; x.beginPath(); x.roundRect(bx, by, bw, bh, 10); x.fill();
      x.lineWidth = 2.5; x.strokeStyle = 'rgba(30,28,25,.55)'; x.stroke();
      numero(x, String(ca.vals[a]), bx + bw / 2, by + bh / 2 + 3, Math.min(bh * .9, bw * 1.05), '#ffffff', 'rgba(20,18,15,.75)');
    });
  }
  s.tex.needsUpdate = true;
}

// ---------- piso da arena: lajes de mármore, juntas, canaleta ao pé da arquibancada, borda com meandro ----------
function criarPiso(w, d, zc) {
  const esc = 2048 / w, W = 2048, H = Math.round(d * esc);
  const cor = tela(W, H), alt = tela(W, H), rug = tela(W, H), xc = cor.getContext('2d'), xa = alt.getContext('2d'), xr = rug.getContext('2d');
  const m = gerado('marmore'), laje = 1.32 * esc, nx = Math.ceil(W / laje), nz = Math.ceil(H / laje), ox = (W - nx * laje) / 2, oz = (H - nz * laje) / 2;
  xa.fillStyle = '#808080'; xa.fillRect(0, 0, W, H);
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const s = i * 31 + j * 57, sw = 250, sx = rnd(s) * (512 - sw), sy = rnd(s + 1) * (512 - sw), px = ox + i * laje, py = oz + j * laje;
    [[xc, m.cor], [xr, m.rug]].forEach(([c, img]) => { c.save(); c.translate(px + laje / 2, py + laje / 2); c.rotate(Math.floor(rnd(s + 2) * 4) * Math.PI / 2); c.drawImage(img, sx, sy, sw, sw, -laje / 2, -laje / 2, laje, laje); c.restore(); });
    const tom = rnd(s + 3); xc.fillStyle = tom < .5 ? 'rgba(120,96,60,' + (.08 * tom) + ')' : 'rgba(255,255,255,' + (.08 * (tom - .5)) + ')'; xc.fillRect(px, py, laje, laje);
  }
  // juntas das lajes
  [[xc, 'rgba(92,80,62,.45)', 1.4], [xa, '#3c3c3c', 2.5], [xr, 'rgb(255,230,0)', 2]].forEach(([c, s, lw]) => {
    c.strokeStyle = s; c.lineWidth = lw; c.beginPath();
    for (let i = 0; i <= nx; i++) { c.moveTo(ox + i * laje, 0); c.lineTo(ox + i * laje, H); }
    for (let j = 0; j <= nz; j++) { c.moveTo(0, oz + j * laje); c.lineTo(W, oz + j * laje); }
    c.stroke();
  });
  // canaleta de pedra escura ao pé da arquibancada: marca o semicírculo da arena
  const A = L.arena, cx = (A.cx + w / 2) * esc, cz = (A.cz - (zc - d / 2)) * esc, rr = (A.r0 - .22) * esc;
  const anel = (r, lw, c1, c2, c3) => { [[xc, c1], [xa, c2], [xr, c3]].forEach(([c, s]) => { c.strokeStyle = s; c.lineWidth = lw; c.beginPath(); c.ellipse(cx, cz, r, r * A.ez, 0, 0, 7); c.stroke(); }); };
  anel(rr, .26 * esc, '#6f747c', '#5a5a5a', 'rgb(255,80,0)'); anel(rr - .17 * esc, .04 * esc, '#b58a3a', '#8a8a8a', 'rgb(255,90,0)');
  // borda: pedra escura com meandro claro (fica sob a faixa inferior; aparece se a janela for alta)
  const b = .62 * esc, mg = .16 * esc;
  const faixa = (c, s) => { c.fillStyle = s; c.fillRect(mg, mg, W - 2 * mg, b); c.fillRect(mg, H - mg - b, W - 2 * mg, b); c.fillRect(mg, mg, b, H - 2 * mg); c.fillRect(W - mg - b, mg, b, H - 2 * mg); };
  xc.save(); xc.globalCompositeOperation = 'multiply'; faixa(xc, '#6c7480'); xc.restore(); faixa(xa, '#787878'); faixa(xr, 'rgb(255,80,0)');
  const tc = texCanvas(cor), tn = texCanvas(normalDe(alt, 2.2, false), true), tr = texCanvas(rug, true);
  [tc, tn, tr].forEach(t => { t.anisotropy = 16; });
  return new THREE.MeshStandardMaterial({ map: tc, normalMap: tn, roughnessMap: tr, roughness: 1.15, metalness: 0, envMapIntensity: .45 });
}
function criarAmbiente() {
  const sc = new THREE.Scene(), c = tela(64, 64), x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, 64);
  gr.addColorStop(0, '#5b6bb0'); gr.addColorStop(.45, '#e7a27c'); gr.addColorStop(.52, '#ffe0b0'); gr.addColorStop(.6, '#b08a62'); gr.addColorStop(1, '#6a5238');
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  const so = x.createRadialGradient(46, 26, 1, 46, 26, 16); so.addColorStop(0, '#fff8e0'); so.addColorStop(1, 'rgba(255,220,160,0)'); x.fillStyle = so; x.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  sc.add(new THREE.Mesh(new THREE.SphereGeometry(50, 24, 12), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide })));
  const pm = new THREE.PMREMGenerator(renderer), env = pm.fromScene(sc, .03).texture; pm.dispose(); return env;
}

// ---------- contorno (estilização): casca escura um pouco maior, só com as faces de trás ----------
const _matCont = {};
function contorno(m, w, h, d, cor, e) {
  e = e || .022; cor = cor || CONTORNO;
  const mc = _matCont[cor] || (_matCont[cor] = new THREE.MeshBasicMaterial({ color: cor, side: THREE.BackSide }));
  const c = new THREE.Mesh(new THREE.BoxGeometry(w + 2 * e, h + 2 * e, d + 2 * e), mc); c.castShadow = false; c.receiveShadow = false;
  m.add(c); return m;
}
function caixaC(w, h, d, material, o, cor) { const m = caixa(w, h, d, material, o); return contorno(m, w, h, d, cor); }

// ---------- arena: piso, arquibancada semicircular vazia (degraus largos = bancos), parapeito e terraço ----------
// UV em unidades de cena para as peças curvas: u = comprimento do arco, v = altura (espelhos) ou raio (bancos)
function uvArco(geo, modo) {
  const p = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z), f = Math.atan2(x, z); uv.setXY(i, f * r, modo === 'v' ? p.getY(i) : r); }
  return geo;
}
function criarArena() {
  const A = L.arena, g = new THREE.Group(); g.position.set(A.cx, 0, A.cz); g.scale.z = A.ez; scene.add(g); R.arena = g;
  const f0 = Math.PI / 2 - A.ext, df = Math.PI + 2 * A.ext, SEG = 128;
  // piso (um retângulo grande; a arquibancada cobre o que fica fora do semicírculo)
  const pw = 30, pd = 26, pz = -1;
  const piso = new THREE.Mesh(new THREE.PlaneGeometry(pw, pd), criarPiso(pw, pd, pz)); piso.rotation.x = -Math.PI / 2; piso.position.set(0, 0, pz); piso.receiveShadow = true; scene.add(piso);
  const anelV = (r, y0, h, mat) => { const cg = uvArco(new THREE.CylinderGeometry(r, r, h, SEG, 1, true, f0, df).translate(0, y0 + h / 2, 0), 'v'); const m = new THREE.Mesh(cg, mat); m.receiveShadow = true; m.castShadow = true; g.add(m); return m; };
  const anelH = (r0, r1, y, mat) => { const rg = new THREE.RingGeometry(r0, r1, SEG, 1, f0 - Math.PI / 2, df); rg.rotateX(-Math.PI / 2); rg.translate(0, y, 0); uvArco(rg, 'h'); const m = new THREE.Mesh(rg, mat); m.receiveShadow = true; g.add(m); return m; };
  for (let i = 0; i < A.n; i++) {
    const r = A.r0 + i * A.prof;
    anelV(r, i * A.alt, A.alt, MAT.marmoreEspelho);               // espelho do degrau
    anelH(r, r + A.prof, (i + 1) * A.alt, MAT.banco);               // banco
    anelV(r - .005, (i + 1) * A.alt - .035, .035, MAT.filete);      // quina do banco
  }
  // terraço no alto da arquibancada, no mesmo nível do último banco (sem parapeito, que passava na frente dos
  // dados dos adversários). Termina pouco atrás da galeria: dali para trás, só o céu.
  const zFim = L.banda.z - .9, zIni = A.cz + R1 * A.ez * Math.sin(A.ext);
  const ter = new THREE.Shape(); ter.moveTo(-18, -zIni); ter.lineTo(18, -zIni); ter.lineTo(18, -zFim); ter.lineTo(-18, -zFim); ter.lineTo(-18, -zIni);
  const furo = new THREE.Path(); furo.absellipse(A.cx, -A.cz, R1, R1 * A.ez, 0, Math.PI * 2, false, 0); ter.holes.push(furo);
  const tg = new THREE.ShapeGeometry(ter, 96); tg.rotateX(-Math.PI / 2); tg.translate(0, TOPO, 0);
  const terraco = new THREE.Mesh(tg, MAT.marmore); terraco.receiveShadow = true; scene.add(terraco);
  caixa(36, .22, .2, MAT.marmoreEspelho, { p: [0, TOPO - .11, zFim + .1], em: scene });   // borda de trás do terraço
  // cabeceiras da arquibancada (perfil em escada), nas duas pontas do arco
  const perfil = new THREE.Shape(); perfil.moveTo(A.r0, 0);
  for (let i = 0; i < A.n; i++) { perfil.lineTo(A.r0 + i * A.prof, (i + 1) * A.alt); perfil.lineTo(A.r0 + (i + 1) * A.prof, (i + 1) * A.alt); }
  perfil.lineTo(R1, 0); perfil.lineTo(A.r0, 0);
  [f0, f0 + df].forEach(f => { const m = new THREE.Mesh(new THREE.ShapeGeometry(perfil), MAT.marmoreEspelho); m.rotation.y = f - Math.PI / 2; m.castShadow = true; g.add(m); });
}

// ---------- faixa dos adversários: galeria reta no terraço, de frente para a câmera ----------
function larguraGrupo() { const B = L.banda; return B.id + B.mg + 4 * B.m + 3 * B.mg; }
function larguraBanda() { return 2 * larguraGrupo() + L.banda.gg; }
function criarBanda() {
  const B = L.banda, M = B.mod, W = larguraBanda(), GW = larguraGrupo();
  const g = new THREE.Group(); g.position.set(0, TOPO, B.z); g.scale.setScalar(B.esc); scene.add(g); R.banda = g;
  // sem parede de fundo (rodada 3 de ajustes): só a soleira baixa, que assenta a faixa no terraço
  caixaC(W + .8, .1, 1.3, MAT.marmorePolido, { p: [0, .05, -.15], em: g });
  // o conteúdo se inclina um pouco para a câmera (perspectiva discreta, leitura plana)
  const gi = new THREE.Group(); gi.position.set(0, .12, 0); gi.rotation.x = -B.inc; g.add(gi); R.bandaI = gi;
  [1, 2].forEach((P, b) => {
    const x0 = -W / 2 + b * (GW + B.gg), xi = x0 + B.id / 2;
    R.ident[P] = { x: xi };
    R.bibs[P] = criarBiblioteca(P, xi, -.02, B.bib, gi);
    R.ops[P] = [0, 1, 2, 3].map(k => criarModulo(P, k, x0 + B.id + B.mg + k * (B.m + B.mg) + B.m / 2, gi));
  });
}
function criarModulo(P, k, mx, em) {
  const B = L.banda, M = B.mod, c = tela(512, Math.round(512 * M.h / M.w)), tex = texCanvas(c);
  const face = new THREE.MeshStandardMaterial({ map: tex, roughness: .78, envMapIntensity: .25, emissive: new THREE.Color('#58c6ee'), emissiveIntensity: 0 });
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(M.w, M.h, M.d), [MAT.lado, MAT.lado, MAT.tampo, MAT.lado, face, MAT.lado]);
  corpo.position.set(mx, M.h / 2, 0); corpo.castShadow = true; corpo.receiveShadow = true; em.add(corpo); contorno(corpo, M.w, M.h, M.d);
  caixa(M.w + .04, .05, M.d + .04, MAT.tampo, { p: [mx, M.h + .025, 0], em });
  caixa(M.w - .08, .045, .03, MAT.lado, { p: [mx, M.h + .07, M.d / 2 - .03], em });   // beiral da prateleira
  const s = { P, k, x: mx, id: null, em, tela: c, tex, face, esc: 1, rx: 0, base: new V3(mx, M.h - B.oculto, -M.d / 2 - .07),
    pilhaPos: new V3(mx - M.w / 2 + .07, M.h + .05, M.d / 2 - .13), pilha: [], larg: M.w - .5, vaga: .11, espM: .09, alt: .32, prof: .16,
    cont: new V3(mx + M.w / 2 - .38, M.h + .15, M.d / 2 - .1) };
  criarFig(s, B.carta);
  s.pintar = () => pintarModulo(s); s.pintar();
  R.emis['op:' + P + ':' + k] = [s.matFig, face];
  return s;
}
// a imagem da carta, em pé atrás do púlpito (a base fica escondida por ele)
function criarFig(s, dim) {
  const geo = new THREE.PlaneGeometry(dim[0], dim[1]); geo.translate(0, dim[1] / 2, 0);
  const m = new THREE.MeshStandardMaterial({ roughness: .7, envMapIntensity: .2, emissive: new THREE.Color('#58c6ee'), emissiveIntensity: 0 });
  const fig = new THREE.Mesh(geo, m); fig.castShadow = true; fig.receiveShadow = true; fig.visible = false; fig.position.copy(s.base); fig.rotation.x = s.rx;
  s.em.add(fig); s.fig = fig; s.matFig = m; s.dim = dim; s.geoCarta = geo;
  s.topo = s.P === 0 ? PED_H : L.banda.mod.h + .05;   // altura do tampo, onde cai a guia do personagem
}

// ---------- montagem da cena ----------
function montar() {
  criarArena();
  criarBanda();
  // placas dos debates (a geometria se completa no primeiro sync, quando se sabe quantos jogadores há)
  L.placa.x.forEach((sx, i) => {
    const g = new THREE.Group(); g.position.set(sx, L.podio, L.placa.z[i]); g.rotation.y = L.placa.rot[i]; scene.add(g); g.updateMatrixWorld(true);
    const matCor = new THREE.MeshStandardMaterial({ color: CINZA, roughness: .55, envMapIntensity: .35 });
    R.slots.push({ i, x: sx, g, did: undefined, v: 0, nJ: 0, livros: [], prat: [], frisos: [], matCor });
  });
  // púlpitos do jogador: corpo de terracota, faixa negra do nome, valores 2 × 2; atrás, a carta do filósofo
  const pd = L.ped;
  pd.x.forEach((px, k) => {
    const g = new THREE.Group(); g.position.set(px, 0, pd.z); scene.add(g);
    const c = tela(640, Math.round(640 * pd.h / pd.w)), tex = texCanvas(c);
    const face = new THREE.MeshStandardMaterial({ map: tex, roughness: .78, envMapIntensity: .25, emissive: new THREE.Color('#58c6ee'), emissiveIntensity: 0 });
    // planos distintos: tampo claro, frente com o texto, laterais um pouco mais escuras
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(pd.w, pd.h, pd.d), [MAT.lado, MAT.lado, MAT.tampo, MAT.lado, face, MAT.lado]);
    corpo.position.y = pd.h / 2; corpo.castShadow = true; corpo.receiveShadow = true; g.add(corpo); contorno(corpo, pd.w, pd.h, pd.d);
    caixa(pd.w + .06, .08, pd.d + .04, MAT.tampo, { p: [0, pd.h + .04, 0], em: g });
    caixa(pd.w - .12, .07, .04, MAT.lado, { p: [0, PED_H + .035, pd.d / 2 - .04], em: g });   // beiral da prateleira
    const s = { P: 0, k, x: px, id: null, on: null, chave: '', em: scene, g, tela: c, tex, face, esc: 1, rx: -.05, base: new V3(px, PED_H - pd.oculto, pd.z - pd.d / 2 - .09),
      pilhaPos: new V3(px - pd.w / 2 + .12, PED_H, pd.z + pd.d / 2 - .19), pilha: [], larg: pd.w - .8, vaga: .16, espM: .13, alt: .46, prof: .24,
      cont: new V3(px + pd.w / 2 - .62, PED_H + .24, pd.z + pd.d / 2 - .19) };
    criarFig(s, pd.carta);
    s.ancora = new THREE.Object3D(); s.ancora.position.copy(s.base); scene.add(s.ancora);
    R.meus.push(s); pintarPedestal(s); R.emis['seat:' + k] = [face, s.matFig];
  });
}
// Biblioteca compacta (adversários): um móvel baixo e claro; os livros ficam em pé por cima, em duas fileiras
function criarBiblioteca(P, x, z, w, em) {
  const g = new THREE.Group(); g.position.set(x, 0, z); em.add(g);
  const m = MAT.lado.clone(); m.emissive = new THREE.Color('#58c6ee'); m.emissiveIntensity = 0;
  caixaC(w, .36, .5, m, { p: [0, .18, 0], em: g });
  caixaC(w, .14, .2, m, { p: [0, .43, -.15], em: g });                 // degrau da fileira de trás
  caixa(w + .05, .04, .53, MAT.tampo, { p: [0, .38, 0], em: g });
  caixa(w, .05, .03, MAT.lado, { p: [0, .41, .24], em: g });           // beiral
  R.emis['bibop:' + P] = [m];
  return { g, P, w, livros: [], n: 0, mat: m };
}

// ---------- livros em pé (lombada para a frente) ----------
function matsLivroPe(P, v) {
  R.livroPe[P] = R.livroPe[P] || [];
  if (!R.livroPe[P][v]) {
    const base = new THREE.Color(S ? S.players[P].cor : ['#e9b93f', '#3fc1d6', '#ea6a97', '#8ac24a'][P]); base.offsetHSL(0, 0, [0, .09, -.08][v]);
    const m = matLivro('#' + base.getHexString()), lo = m.lomb.clone();
    ['map', 'normalMap', 'roughnessMap'].forEach(k => { if (!lo[k]) return; const t = lo[k].clone(); t.center.set(.5, .5); t.rotation = Math.PI / 2; t.needsUpdate = true; lo[k] = registrar(t); });
    R.livroPe[P][v] = [m.capa, m.capa, MAT.paginas, MAT.paginas, lo, MAT.paginas];
  }
  return R.livroPe[P][v];
}
function novoLivroPe(P, k) { const m = new THREE.Mesh(R.geoLivroPe, matsLivroPe(P, k % 3)); m.castShadow = true; m.receiveShadow = true; return m; }
// livro deitado (para voos e quedas)
function matsLivro(P) {
  if (!R.livroMat[P]) { const cor = S ? S.players[P].cor : ['#e9b93f', '#3fc1d6', '#ea6a97'][P], m = matLivro(cor); R.livroMat[P] = [MAT.paginas, MAT.paginas, m.capa, m.capa, m.lomb, MAT.paginas]; }
  return R.livroMat[P];
}
function novoLivro(P) { const m = new THREE.Mesh(R.geoLivro, matsLivro(P)); m.castShadow = true; m.receiveShadow = true; return m; }
/* põe n livros em pé numa fileira. lista: array de malhas; em: grupo pai; o: { P, x0, y, z, f (fileira), alt, prof, sem } */
function ajustarFileira(lista, n, em, o) {
  while (lista.length > n) em.remove(lista.pop());
  while (lista.length < n) { const b = novoLivroPe(o.P, lista.length); em.add(b); lista.push(b); }
  lista.forEach((b, k) => { const sd = (o.sem || 0) + k * 7, alt = o.alt * (.9 + rnd(sd) * .14);
    b.scale.set(o.f.esp, alt, o.prof); b.position.set(o.x0 + o.f.x(k), o.y + alt / 2, o.z); b.rotation.set(0, (rnd(sd + 1) - .5) * .12, (rnd(sd + 2) - .5) * .05); });
}

// ---------- placas: moldura na cor da área, pilastras, pódio e uma prateleira por jogador ----------
function montarPlaca(slot, nJ) {
  const g = slot.g; while (g.children.length) g.remove(g.children[0]);
  const P = L.placa, geo = geoPlaca(nJ), c = tela(512, Math.round(512 * geo.H / P.w)), tex = texCanvas(c), mc = slot.matCor;
  const face = new THREE.MeshStandardMaterial({ map: tex, roughness: .82, envMapIntensity: .25, emissive: new THREE.Color('#58c6ee'), emissiveIntensity: 0 });
  const quadro = new THREE.Mesh(new THREE.BoxGeometry(P.w, geo.H, P.esp), [mc, mc, mc, mc, face, mc]);
  quadro.position.y = geo.H / 2; quadro.castShadow = true; quadro.receiveShadow = true; g.add(quadro); contorno(quadro, P.w, geo.H, P.esp);
  // pilastras finas nas laterais, na cor da área, com capitel e base de mármore
  [-1, 1].forEach(s => {
    const xx = s * (P.w / 2 + .06);
    contorno(cilindro(.075, .085, geo.H - .06, mc, 16, { p: [xx, geo.H / 2 + .03, .04], em: g }), .17, geo.H - .06, .17, null, .015);
    caixaC(.24, .09, .26, mc, { p: [xx, geo.H + .04, .04], em: g });          // capitel, na cor da área (topo visível)
    caixaC(.28, .1, .3, MAT.marmore, { p: [xx, .05, .04], em: g });
  });
  caixaC(P.w + .12, .06, P.esp + .06, mc, { p: [0, geo.H + .03, 0], em: g });   // filete fino no alto, na cor da área (no lugar da cornija)
  caixaC(P.w + .7, L.podio, 1.05, MAT.marmorePolido, { p: [0, -L.podio / 2, .22], em: g });    // pódio
  slot.geo = geo; slot.tela = c; slot.tex = tex; slot.face = face; slot.nJ = nJ; slot.livros = []; slot.prat = []; slot.frisos = [];
  geo.linhas.forEach((ln, p) => {
    const lw = geo.xb1 - geo.xb0 + .14, mp = MAT.lado.clone(); mp.emissive = new THREE.Color('#58c6ee'); mp.emissiveIntensity = 0;
    caixaC(lw, .05, .3, mp, { p: [(geo.xb0 + geo.xb1) / 2, ln.yB + .025, P.esp / 2 + .15], em: g });
    const fr = new THREE.MeshStandardMaterial({ color: CINZA, roughness: .6, emissive: new THREE.Color('#f3c552'), emissiveIntensity: 0 });
    caixa(lw, .05, .02, fr, { p: [(geo.xb0 + geo.xb1) / 2, ln.yB + .025, P.esp / 2 + .31], em: g, sombra: false });
    slot.livros.push([]); slot.prat.push(mp); slot.frisos.push(fr);
    R.emis['est:' + slot.i + ':' + p] = [mp];
  });
  R.emis['deb:' + slot.i] = [face];
  g.updateMatrixWorld(true);
  Object.keys(R.halos).forEach(k => { if (/^(deb|est):/.test(k)) { R.halos[k].forEach(m => m.parent && m.parent.remove(m)); delete R.halos[k]; } });
}
function colorirPlaca(slot) {
  const q = slot.did ? BF.DEB[slot.did] : null;
  slot.matCor.color.set(q ? BF.AREA[q.area].cor : CINZA);
  slot.prat.forEach(mp => mp.color.set(q ? '#c9c6c0' : '#b1aea8'));
  slot.frisos.forEach((fr, p) => fr.color.set(q && S.players[p] ? S.players[p].cor : '#a39d93'));
}
function medirPrat(slot) { slot.fil = fileira(2 * slot.v, slot.geo.xb1 - slot.geo.xb0, .3, .2); }
function ajustarPrat(slot, p, n) {
  if (!slot.livros[p]) return;
  if (!slot.fil) n = 0;
  const ln = slot.geo.linhas[p];
  ajustarFileira(slot.livros[p], n, slot.g, { P: p, x0: slot.geo.xb0, y: ln.yB + .05, z: L.placa.esp / 2 + .15, f: slot.fil, alt: .36, prof: .24, sem: slot.i * 97 + p * 31 });
}
// livros do filósofo, na prateleira do púlpito (o número e o + ficam à direita deles)
function ajustarPilha(s, n, P) {
  const f = fileira(Math.max(n, 1), s.larg, s.vaga, s.espM);
  ajustarFileira(s.pilha, n, s.em, { P, x0: s.pilhaPos.x, y: s.pilhaPos.y, z: s.pilhaPos.z, f, alt: s.alt, prof: s.prof, sem: s.k * 53 + P * 17 });
  s.fimPilha = s.pilhaPos.x + (n ? f.x(n - 1) + f.vaga / 2 : 0);
}
// Biblioteca: fileira da frente e a de trás, no degrau; doze por fileira antes de apertar
function ajustarBib(b, n) {
  b.frente = b.frente || []; b.tras = b.tras || [];
  const cap = 12, nf = n <= cap ? n : n <= 2 * cap ? cap : Math.ceil(n / 2), nt = n - nf, larg = b.w - .16;
  ajustarFileira(b.frente, nf, b.g, { P: b.P, x0: -larg / 2, y: .4, z: .1, f: fileira(Math.max(nf, cap), larg, .2, .085), alt: .3, prof: .17, sem: b.P * 71 });
  ajustarFileira(b.tras, nt, b.g, { P: b.P, x0: -larg / 2, y: .5, z: -.15, f: fileira(Math.max(nt, cap), larg, .2, .085), alt: .3, prof: .17, sem: b.P * 71 + 500 });
  b.n = n;
}

// ---------- estado do jogo → cena ----------
function textoVago() {
  if (!S) return '';
  const r = (S.cfg.novoDebate || []).filter(x => x >= S.round)[0];
  return S.debDeck && S.debDeck.length && r ? 'Novo debate ao fim da rodada ' + r : 'Sem novo debate nesta partida';
}
function sync(estado, ocultos) {
  if (!scene) return; S = estado; OC = ocultos || {};
  if (!S) return;
  const nJ = S.players.length, on = {}, vago = textoVago(); S.debates.forEach(d => { on[BF.DEB[d.id].area] = 1; });
  R.slots.forEach((slot, i) => {
    if (slot.nJ !== nJ) { montarPlaca(slot, nJ); slot.did = undefined; }
    const d = S.debates[i], did = d ? d.id : null;
    if (slot.did !== did || (!did && slot.vago !== vago)) {
      slot.did = did; slot.vago = vago;
      if (did) { slot.v = BF.DEB[did].valor; medirPrat(slot); } else { slot.v = 0; slot.fil = null; }
      slot.livros.forEach((l, p) => ajustarPrat(slot, p, 0));
      colorirPlaca(slot); pintarPlaca(slot);
    }
    if (!d) { slot.frisos.forEach(fr => { fr.emissiveIntensity = 0; }); return; }
    const q = BF.DEB[d.id];
    S.players.forEach((pl, p) => {
      const vis = Math.min(d.stakes[p], 2 * q.valor), oc = Math.min(vis, OC[d.id + ':' + p] || 0);
      ajustarPrat(slot, p, vis - oc);
      if (slot.frisos[p]) slot.frisos[p].emissiveIntensity = BF.lidera(S, i, p) && !oc ? .9 : 0;
    });
  });
  const chave = BF.AREAS.map(a => on[a] ? 1 : 0).join('');
  R.meus.forEach((s, k) => {
    const g = S.players[0].group[k], id = g ? g.id : null, ch = id + chave;
    ocupar(s, g, 0); if (s.chave !== ch) { s.chave = ch; s.on = on; pintarPedestal(s); }
  });
  [1, 2].forEach(p => { if (S.players[p] && R.ops[p]) R.ops[p].forEach((s, k) => ocupar(s, S.players[p].group[k], p)); });
  S.players.forEach((pl, p) => { if (R.bibs[p]) ajustarBib(R.bibs[p], pl.library); });
  if (alturaRodape() !== cam.rod) enquadrar(); else posicionar(true);
}
// lugar de repouso da figura: o da carta, ou, com personagem, os pés no chão logo atrás do púlpito
function baseDe(s) { return s.baseP || s.base; }
// veste a figura com o personagem (PNG) ou com a imagem da carta
function vestir(s, id) {
  const pid = TESTE_DOZE ? 'nietzsche' : id, pe = id ? personagem(pid, () => { s.vestido = null; ocupar(s, s.g0, s.P); }) : null;
  const chave = pe ? 'p:' + pid : 'c:' + id; if (s.vestido === chave) return; s.vestido = chave;
  if (pe) {
    const d = pe.def, h = s.topo / (d.guia - d.pes), w = h * pe.asp, geo = new THREE.PlaneGeometry(w, h); geo.translate(0, h / 2, 0);
    s.fig.geometry = geo; s.matFig.map = pe.tex; s.matFig.alphaTest = .5; s.matFig.needsUpdate = true;
    s.baseP = new V3(s.base.x, -d.pes * h, s.base.z); s.ajusteY = -d.pes * h;
  } else {
    s.fig.geometry = s.geoCarta; s.matFig.map = id ? texFig(id) : null; s.matFig.alphaTest = 0; s.matFig.needsUpdate = true; s.baseP = null; s.ajusteY = 0;
  }
}
function ocupar(s, g, P) {
  const id = g ? g.id : null; s.g0 = g;
  if (s.id !== id) { s.id = id; if (s.pintar) s.pintar(); }
  vestir(s, id);
  s.boneco = !!(USAR_BONECOS && id && P === 0 && window.BF_BONECOS && window.BF_BONECOS[id]);
  if (!s.fora) { s.fig.visible = !!id && !s.boneco; s.fig.position.copy(baseDe(s)); s.fig.rotation.set(s.rx, 0, 0); s.fig.scale.setScalar(1); }
  if (id) { const inerte = !BF.ativo(g); s.matFig.color.set(inerte ? '#b9bccb' : g.acted ? '#a8a49c' : '#ffffff'); s.matFig.opacity = inerte ? .6 : 1;
    if (s.matFig.transparent !== inerte) { s.matFig.transparent = inerte; s.matFig.needsUpdate = true; } }
  ajustarPilha(s, g && !g.lib ? g.ideas : 0, P);
}

// ---------- câmera: estável, sem paralaxe; a distância e o deslocamento vertical enquadram as faixas ----------
const cam = { alvo: new V3(), dist: 20, alvo0: new V3(), dist0: 20, offY: 0, tremor: 0, focado: false, rod: -1 };
function alturaRodape() { const r = document.getElementById('rodape'); return r ? Math.round(r.getBoundingClientRect().height) : 132; }
function aplicarCamera() {
  const p = L.cam.passo, t = cam.tremor ? (Math.sin(relogio * .09) * cam.tremor) : 0, t2 = cam.tremor ? (Math.cos(relogio * .13) * cam.tremor * .6) : 0;
  camera.position.set(cam.alvo.x + t, cam.alvo.y + Math.sin(p) * cam.dist + t2, cam.alvo.z + Math.cos(p) * cam.dist);
  camera.lookAt(cam.alvo); camera.updateMatrixWorld();
}
function enquadrar() {
  const W = innerWidth, H = innerHeight; renderer.setSize(W, H, false); camera.aspect = W / H; camera.clearViewOffset(); camera.updateProjectionMatrix();
  cam.rod = alturaRodape();
  const mao = cam.rod + 6, topo = 36, At = 1 - 2 * topo / H, Ab = -1 + 2 * mao / H, pd = L.ped, B = L.banda, wb = larguraBanda() / 2;
  R.banda.updateMatrixWorld(true);
  const nb = (x, y, z) => R.bandaI.localToWorld(new V3(x, y, z));
  const cima = [nb(-wb, B.alto, 0), nb(wb, B.alto, 0)];
  const baixo = [new V3(pd.x[0] - pd.w / 2, 0, pd.z + pd.d / 2 + .05), new V3(pd.x[3] + pd.w / 2, 0, pd.z + pd.d / 2 + .05)];
  const lados = [nb(-wb - .15, 0, 0), nb(wb + .15, 0, 0), new V3(pd.x[0] - pd.w / 2 - .1, 0, pd.z + pd.d / 2), new V3(pd.x[3] + pd.w / 2 + .1, 0, pd.z + pd.d / 2)];
  R.slots.forEach(s => { [-1, 1].forEach(k => lados.push(s.g.localToWorld(new V3(k * (L.placa.w / 2 + .4), 0, .3)))); });
  const medir = dd => { cam.dist = dd; cam.alvo.copy(cam.alvo0); aplicarCamera(); let yt = -9, yb = 9, xm = 0;
    cima.forEach(p => { yt = Math.max(yt, _v.copy(p).project(camera).y); }); baixo.forEach(p => { yb = Math.min(yb, _v.copy(p).project(camera).y); });
    lados.forEach(p => { xm = Math.max(xm, Math.abs(_v.copy(p).project(camera).x)); }); return { yt, yb, xm }; };
  let a = 5, b = 140; for (let i = 0; i < 34; i++) { const m = (a + b) / 2, r = medir(m); if (r.yt - r.yb <= At - Ab && r.xm <= .985) b = m; else a = m; }
  const r = medir(b); cam.dist0 = b;
  cam.offY = Math.round(((At + Ab) / 2 - (r.yt + r.yb) / 2) * H / 2);   // positivo: o conteúdo sobe
  camera.setViewOffset(W, H, 0, cam.offY, W, H); camera.updateProjectionMatrix();
  cam.dist = cam.focado ? b * .6 : b;
  aplicarCamera(); posicionar(true);
}
function centroPlaca(i) { const s = R.slots[i]; return s.g.localToWorld(new V3(0, s.geo ? s.geo.H * .5 : 1.7, 0)); }
function foco(chave) {
  if (cam.focado) return Promise.resolve();
  const m = /^deb:(\d)/.exec(chave || ''), i = m ? +m[1] : 1, de = cam.alvo.clone(), d0 = cam.dist, c = centroPlaca(i), para = new V3(c.x * .9, c.y - .2, c.z + .9), d1 = cam.dist0 * .6;
  cam.focado = true; document.getElementById('focoveu').classList.add('on');
  return tween(T(620), k => { cam.alvo.lerpVectors(de, para, k); cam.dist = d0 + (d1 - d0) * k; }, E.io);
}
function desfoco() {
  if (!cam.focado) return Promise.resolve();
  const de = cam.alvo.clone(), d0 = cam.dist; cam.focado = false; document.getElementById('focoveu').classList.remove('on');
  return tween(T(620), k => { cam.alvo.lerpVectors(de, cam.alvo0, k); cam.dist = d0 + (cam.dist0 - d0) * k; }, E.io);
}
function tremer(f) { cam.tremor = Math.min(.04, (f || 3) * .01); return tween(T(260), k => { cam.tremor = Math.min(.04, (f || 3) * .01) * (1 - k); }).then(() => { cam.tremor = 0; }); }
// ponto da cena sob um ponto da janela, num plano z constante (para ligar elementos HTML à cena)
function mundoDeTela(px, py, z) {
  const p = new V3(px / innerWidth * 2 - 1, -(py / innerHeight) * 2 + 1, .5).unproject(camera), o = camera.position, dir = p.sub(o).normalize();
  return o.clone().addScaledVector(dir, (z - o.z) / dir.z);
}

// ---------- âncoras: onde fica cada elemento HTML invisível ----------
const _v = new V3(), _w = new V3();
function tela2(v) { _v.copy(v).project(camera); return { x: (_v.x * .5 + .5) * innerWidth, y: (-_v.y * .5 + .5) * innerHeight }; }
function retCaixa(x0, y0, z0, x1, y1, z1, obj) {
  let l = 1e9, t = 1e9, r = -1e9, b = -1e9;
  for (let i = 0; i < 8; i++) { _w.set(i & 1 ? x1 : x0, i & 2 ? y1 : y0, i & 4 ? z1 : z0); if (obj) obj.localToWorld(_w); const p = tela2(_w); l = Math.min(l, p.x); r = Math.max(r, p.x); t = Math.min(t, p.y); b = Math.max(b, p.y); }
  return { l, t, w: r - l, h: b - t };
}
function ptObj(obj, x, y, z) { _w.set(x, y, z); if (obj) obj.localToWorld(_w); return tela2(_w); }
function retFig(pos, w, h) {
  const a = tela2(new V3(pos.x - w / 2, pos.y, pos.z)), b = tela2(new V3(pos.x + w / 2, pos.y, pos.z)), c = tela2(new V3(pos.x, pos.y + h, pos.z));
  return { l: a.x, t: c.y, w: b.x - a.x, h: Math.max(a.y, b.y) - c.y };
}
// pontos locais de uma placa em coordenadas do mundo
function naPlaca(s, x, y, z) { return s.g.localToWorld(new V3(x, y, z)); }
function ancora(chave) {
  const a = chave.split(':'), pd = L.ped, P = L.placa, B = L.banda, M = B.mod;
  switch (a[0]) {
    case 'deb': { const s = R.slots[+a[1]], H = s.geo ? s.geo.H : 3.5; return retCaixa(-P.w / 2, 0, 0, P.w / 2, H + .14, .35, s.g); }
    case 'est': { const s = R.slots[+a[1]], p = +a[2]; if (!s.geo || !s.geo.linhas[p]) return null; const ln = s.geo.linhas[p];
      return retCaixa(s.geo.xb0, ln.yB, P.esp / 2 + .3, s.geo.xb1, ln.yT - .06, P.esp / 2 + .3, s.g); }
    case 'lv': case 'lt': { const s = R.slots[+a[1]]; if (!s.fil || !s.geo) return null; const v = s.v, xx = a[0] === 'lv' ? (s.fil.x(v - 1) + s.fil.x(v)) / 2 : s.fil.x(2 * v - 1) + s.fil.vaga / 2;
      return ptObj(s.g, s.geo.xb0 + xx, s.geo.linhas[0].yT + .02, P.esp / 2 + .02); }
    case 'vago': { const s = R.slots[+a[1]]; return ptObj(s.g, 0, 2.2, .2); }
    case 'seat': { const x = pd.x[+a[1]]; return retCaixa(x - pd.w / 2, 0, pd.z - pd.d / 2, x + pd.w / 2, PED_H + pd.carta[1] - pd.oculto, pd.z + pd.d / 2); }
    case 'fig': { const s = R.meus[+a[2]]; return retFig(s.base, 1.3 * pd.fig, 1.5 * pd.fig); }
    case 'pilha': { const s = +a[1] === 0 ? R.meus[+a[2]] : R.ops[+a[1]][+a[2]]; return ptObj(s.em === scene ? null : s.em, s.cont.x, s.cont.y, s.cont.z); }
    case 'op': { const s = R.ops[+a[1]][+a[2]]; return retCaixa(s.x - M.w / 2, 0, -M.d / 2, s.x + M.w / 2, M.h - B.oculto + B.carta[1], M.d / 2, R.bandaI); }
    case 'ident': { const id = R.ident[+a[1]]; return retCaixa(id.x - B.id / 2, B.id0, .1, id.x + B.id / 2, B.alto, .1, R.bandaI); }
    case 'bibop': { const id = R.ident[+a[1]]; return ptObj(R.bandaI, id.x + B.bib / 2 - .08, .62, .12); }
    case 'grupo': return retCaixa(pd.x[0] - pd.w / 2, 0, pd.z - pd.d / 2, pd.x[3] + pd.w / 2, PED_H + .3, pd.z + pd.d / 2);
    case 'faixa': {   // meio da faixa livre, entre o pódio da placa do centro e o alto das cartas dos púlpitos (dica da seleção)
      const s0 = R.slots[1], pA = ptObj(s0.g, 0, -L.podio, .75), pB = tela2(new V3(0, PED_H + pd.carta[1] - pd.oculto, pd.z - pd.d / 2 - .09));
      return { x: innerWidth / 2, y: (pA.y + pB.y) / 2 }; }
    case 'coro': { const p = ptObj(R.banda, 0, -.2, 1.2); p.y = Math.max(p.y, 64); return p; }
  }
  return null;
}
let proxies = [];
function posicionar(reler) {
  if (!camera) return;
  if (reler) proxies = Array.from(document.querySelectorAll('[data-anc]')).map(el => ({ el, chave: el.dataset.anc }));
  proxies.forEach(p => {
    const r = ancora(p.chave); if (!r) return; const s = p.el.style;
    if (r.w !== undefined) { s.left = r.l.toFixed(1) + 'px'; s.top = r.t.toFixed(1) + 'px'; s.width = r.w.toFixed(1) + 'px'; s.height = r.h.toFixed(1) + 'px'; }
    else { s.left = r.x.toFixed(1) + 'px'; s.top = r.y.toFixed(1) + 'px'; }
  });
}

// ---------- realce de alvos: brilho no próprio objeto e halo de luz à frente dele ----------
const COR_REALCE = [null, new THREE.Color('#4fc3ee'), new THREE.Color('#ffffff'), new THREE.Color('#f3c552')];
function haloDe(chave) {
  if (R.halos[chave] !== undefined) return R.halos[chave];
  const a = chave.split(':'), pd = L.ped, P = L.placa, B = L.banda; let lista = [];
  const hz = (em, x, y, z, w, d) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), R.matHalo.clone()); m.rotation.x = -Math.PI / 2; m.position.set(x, y + .02, z); m.renderOrder = 4; m.visible = false; em.add(m); return m; };
  const hv = (em, x, y, z, w, h) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), R.matHalo.clone()); m.position.set(x, y, z); m.renderOrder = 4; m.visible = false; em.add(m); return m; };
  if (a[0] === 'deb') { const s = R.slots[+a[1]]; lista = [hz(s.g, 0, 0, P.esp / 2 + .62, P.w + .9, 1.1)]; }
  else if (a[0] === 'est') { const s = R.slots[+a[1]], ln = s.geo && s.geo.linhas[+a[2]]; if (ln) lista = [hv(s.g, (s.geo.xb0 + s.geo.xb1) / 2, (ln.yT + ln.yB) / 2, P.esp / 2 + .32, s.geo.xb1 - s.geo.xb0 + .5, P.prat + .2)]; }
  else if (a[0] === 'seat') lista = [hz(scene, pd.x[+a[1]], 0, pd.z + .25, 2.9, 1.9)];
  else if (a[0] === 'grupo') lista = pd.x.map(x => hz(scene, x, 0, pd.z + .25, 2.9, 1.9));
  else if (a[0] === 'op') { const s = R.ops[+a[1]][+a[2]]; lista = [hz(R.bandaI, s.x, 0, .2, 1.6, 1.0)]; }
  return R.halos[chave] = lista;
}
const realces = {};
function atualizarRealces() {
  const quer = {};
  proxies.forEach(p => { const c = p.el.classList, n = c.contains('sobre') ? 2 : c.contains('alvo') ? 1 : c.contains('selecionado') ? 3 : 0; if (n) quer[p.chave] = Math.max(quer[p.chave] || 0, n); });
  const pulso = .72 + .28 * Math.sin(relogio * .006);
  Object.keys(realces).forEach(k => { if (!quer[k]) { haloDe(k).forEach(m => m.visible = false); (R.emis[k] || []).forEach(m => m.emissiveIntensity = 0); delete realces[k]; } });
  Object.keys(quer).forEach(k => {
    const n = quer[k]; realces[k] = n;
    haloDe(k).forEach(m => { m.visible = true; m.material.color.copy(COR_REALCE[n]); m.material.opacity = (n === 2 ? 1 : .8) * pulso; });
    (R.emis[k] || []).forEach(m => { m.emissive.copy(COR_REALCE[n]); m.emissiveIntensity = (n === 2 ? .34 : n === 3 ? .14 : .2) * pulso; });
  });
}

// ---------- animação ----------
const E = { lin: k => k, io: k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, out: k => 1 - Math.pow(1 - k, 3), in: k => k * k, tranco: k => { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); } };
const tweens = new Set();
function T(ms) { return window.BFX && window.BFX.T ? window.BFX.T(ms) : ms; }
function tween(ms, fn, ease, atraso) {
  return new Promise(res => { if (ms <= 2 && !atraso) { fn(1); res(); return; } tweens.add({ t0: performance.now() + (atraso || 0), ms: Math.max(1, ms), fn, ease: ease || E.io, res }); });
}
function avancar(agora) {
  tweens.forEach(t => { if (agora < t.t0) return; const k = Math.min(1, (agora - t.t0) / t.ms); try { t.fn(t.ease(k), k); } catch (e) { console.error(e); } if (k >= 1) { tweens.delete(t); t.res(); } });
}
let luzK = 1, ultimo = 0;
function quadro(agora) {
  ultimo = agora; relogio = agora; avancar(agora);
  const quer = document.body.classList.contains('escolhendo') ? .6 : 1; luzK += (quer - luzK) * .12;
  sol.intensity = 3.1 * luzK; hemi.intensity = 1.15 * (.4 + .6 * luzK); renderer.toneMappingExposure = 1.05 * (.75 + .25 * luzK);
  aplicarCamera(); atualizarRealces(); posicionar(false);
  if (window.M3D && M3D.aoQuadro) M3D.aoQuadro();
  renderer.render(scene, camera);
}
function laco(t) { requestAnimationFrame(laco); quadro(t); if (MEDIR) medirQuadro(t); }

/* ---------- modo de medição (#medir no endereço) ----------
   Painel com quadros por segundo, tempo médio e p95 do quadro (últimos 600 quadros), chamadas de desenho,
   triângulos, texturas e resolução. "Gravar 20 s" mede um trecho e devolve um resumo para copiar.
   Sugestão de cenários (parecer dos personagens): parado na mesa; durante um salto; com a câmera em foco numa placa.
   #medir-doze põe o mesmo personagem de teste nas doze vagas. */
const MED = { dts: [], grav: null, ult: 0, prox: 0, el: null };
function criarMedidor() {
  const el = document.createElement('div'); el.className = 'medidor';
  el.innerHTML = '<div class="v">medindo…</div><div class="b"><button class="btn sm" data-med="gravar">Gravar 20 s</button><button class="btn sm" data-med="fechar">Ocultar</button></div><textarea readonly hidden></textarea>';
  el.addEventListener('click', e => { const b = e.target.closest('[data-med]'); if (!b) return; e.stopPropagation();
    if (b.dataset.med === 'fechar') { el.classList.toggle('min'); b.textContent = el.classList.contains('min') ? 'Mostrar' : 'Ocultar'; }
    if (b.dataset.med === 'gravar' && !MED.grav) { MED.grav = []; b.textContent = 'gravando…'; setTimeout(() => fimGravacao(b), 20000); }
    if (b.dataset.med === 'copiar') { const t = el.querySelector('textarea'); t.select(); try { navigator.clipboard.writeText(t.value); } catch (er) {} } });
  document.body.appendChild(el); MED.el = el;
}
function estat(lista) {
  const o = lista.slice().sort((a, b) => a - b), n = Math.max(1, o.length), media = o.reduce((a, b) => a + b, 0) / n;
  return { n: o.length, media, p95: o[Math.floor(o.length * .95)] || 0, pior: o[o.length - 1] || 0, lentos: o.filter(x => x > 33.4).length };
}
function fimGravacao(b) {
  const e = estat(MED.grav), i = renderer.info, t = MED.el.querySelector('textarea'); MED.grav = null; b.textContent = 'Gravar 20 s';
  t.value = ['Batalha dos Filósofos — medição de 20 s (' + new Date().toLocaleString('pt-BR') + ')',
    'Cenário: ' + (location.hash || '(nenhum)') + (cam.focado ? ', câmera em foco' : ''),
    'Quadros: ' + e.n + ' · média ' + (1000 / e.media).toFixed(1) + ' q/s · quadro médio ' + e.media.toFixed(1) + ' ms · p95 ' + e.p95.toFixed(1) + ' ms · pior ' + e.pior.toFixed(1) + ' ms · acima de 33 ms: ' + e.lentos,
    'Chamadas de desenho: ' + i.render.calls + ' · triângulos: ' + i.render.triangles + ' · texturas: ' + i.memory.textures + ' · geometrias: ' + i.memory.geometries,
    'Janela: ' + innerWidth + ' × ' + innerHeight + ' · densidade ' + renderer.getPixelRatio() + ' · sombras ' + (renderer.shadowMap.enabled ? 'sim' : 'não'),
    'Navegador: ' + navigator.userAgent].join('\n');
  t.hidden = false;
  if (!MED.el.querySelector('[data-med=copiar]')) MED.el.querySelector('.b').insertAdjacentHTML('beforeend', '<button class="btn sm" data-med="copiar">Copiar</button>');
}
function medirQuadro(agora) {
  if (MED.ult) { const dt = agora - MED.ult; MED.dts.push(dt); if (MED.dts.length > 600) MED.dts.shift(); if (MED.grav) MED.grav.push(dt); }
  MED.ult = agora;
  if (agora < MED.prox || !MED.el) return; MED.prox = agora + 500;
  const e = estat(MED.dts), i = renderer.info;
  MED.el.querySelector('.v').innerHTML = '<b>' + (1000 / e.media).toFixed(0) + '</b> q/s · quadro ' + e.media.toFixed(1) + ' ms · p95 ' + e.p95.toFixed(1) + ' ms<br>'
    + i.render.calls + ' desenhos · ' + (i.render.triangles / 1000).toFixed(0) + ' mil triângulos · ' + i.memory.textures + ' texturas<br>'
    + innerWidth + ' × ' + innerHeight + ' · densidade ' + renderer.getPixelRatio() + (MED.grav ? ' · <b>gravando</b>' : '');
}

// ---------- peças de coreografia ----------
function figura(P, id) {
  const lista = P === 0 ? R.meus : R.ops[P]; if (!lista) return null;
  const s = lista.find(x => x.id === id); if (!s) return null;
  const casa = s.em === scene ? baseDe(s).clone() : s.em.localToWorld(baseDe(s).clone());
  // ajusteY: quanto descer o ponto de pouso para os pés (e não a borda da prancheta) tocarem o chão
  const k = s.em === scene ? 1 : L.banda.esc;
  return { s, boneco: s.boneco, obj: s.boneco ? s.ancora : s.fig, casa, esc: s.esc, ajusteY: (s.ajusteY || 0) * k };
}
function arco(obj, para, ms, alto, ease) {
  const de = obj.position.clone(); alto = alto === undefined ? 1.6 : alto;
  return tween(ms, k => { obj.position.lerpVectors(de, para, k); obj.position.y += Math.sin(k * Math.PI) * alto; }, ease || E.io);
}
function andar(obj, para, ms) { const de = obj.position.clone(); return tween(ms, k => { obj.position.lerpVectors(de, para, k); }, E.lin); }
function tranco(obj, ms) { return tween(ms || 260, k => { const s = 1 + Math.sin(k * Math.PI) * .16 * (1 - k); obj.scale.set(1 + (s - 1) * 1.2, 1 - (s - 1) * 1.6, 1); }, E.lin).then(() => obj.scale.setScalar(1)); }
function slotDe(did) { return R.slots.find(s => s.did === did) || null; }
// onde cai o próximo livro do jogador P na prateleira do debate (coordenadas do mundo)
function topoTorre(did, P) {
  const s = slotDe(did); if (!s || !s.geo || !s.geo.linhas[P] || !s.fil) return null; const n = s.livros[P].length, ln = s.geo.linhas[P];
  return naPlaca(s, s.geo.xb0 + s.fil.x(Math.min(n, 2 * s.v - 1)), ln.yB + .25, L.placa.esp / 2 + .15);
}
// ponto no chão da faixa livre, diante da placa, abaixo da prateleira do jogador
function peTorre(did, P, lado) {
  const s = slotDe(did); if (!s) return null;
  return naPlaca(s, (P - (s.nJ - 1) / 2) * .95 + (lado || 0), -L.podio, 1.05);
}
// um livro entra na prateleira (ideia que chega)
function cairLivro(did, P) {
  const s = slotDe(did); if (!s || !s.livros[P] || !s.fil) return Promise.resolve();
  if (s.livros[P].length >= 2 * s.v) return Promise.resolve();
  ajustarPrat(s, P, s.livros[P].length + 1);
  const b = s.livros[P][s.livros[P].length - 1], y = b.position.y;
  return tween(T(300), k => { b.position.y = y + (1 - k) * 1.1; b.rotation.z = (1 - k) * .4; }, E.in).then(() => tween(T(140), k => { b.position.y = y + Math.sin(k * Math.PI) * .03; b.rotation.z = 0; }, E.lin));
}
// livros saem pela ponta da prateleira e caem no chão (ideias perdidas)
function derrubar(did, P, n) {
  const s = slotDe(did); if (!s || !n || !s.livros[P] || !s.fil) return;
  const lista = s.livros[P], ln = s.geo.linhas[P];
  lista.forEach(b => { const r = b.rotation.z; tween(T(460), k => { b.rotation.z = r + Math.sin(k * Math.PI * 3) * .06 * (1 - k); }, E.lin); });
  for (let i = 0; i < Math.min(n, 9); i++) {
    const k0 = Math.max(0, lista.length - 1 - i), de = naPlaca(s, s.geo.xb0 + s.fil.x(k0), ln.yB + .23, L.placa.esp / 2 + .15);
    const b = novoLivroPe(P, k0), lado = (i % 2 ? 1 : -1) * (.3 + Math.random() * .6), zz = .8 + Math.random() * .6, chao = .06;
    b.scale.set(s.fil.esp, .36, .24); b.position.copy(de); b.visible = false; scene.add(b);
    tween(T(760), k => { b.visible = true; b.position.x = de.x + lado * k; b.position.z = de.z + zz * k; b.position.y = Math.max(chao, de.y + .4 * Math.sin(k * 2.2) - (de.y - chao + .3) * k * k); b.rotation.z = lado * k * 4; b.rotation.x = k * 2.5; }, E.lin, T(340 + i * 70))
      .then(() => tween(T(500), k => { b.scale.setScalar(Math.max(.001, 1 - k) * .3); }, E.in, T(500))).then(() => scene.remove(b));
  }
}
function livroVoa(de, para, P, o) {
  o = o || {}; const b = novoLivro(P), bh = o.bh || .09; b.scale.set(o.esc || 1, bh, o.esc || 1); b.position.copy(de); b.visible = false; scene.add(b);
  return tween(T(o.d || 560), k => { b.visible = true; b.position.lerpVectors(de, para, k); b.position.y += Math.sin(k * Math.PI) * (o.alto === undefined ? 1.4 : o.alto); b.rotation.set(k * (o.gira || 6), k * 2, 0); }, E.io, T(o.atraso || 0)).then(() => scene.remove(b));
}
function papiro(de, para, ms, atraso) {
  const g = new THREE.Group(), r = cilindro(.07, .07, .42, MAT.pergaminho, 10, { em: g }); r.rotation.z = Math.PI / 2;
  [-1, 1].forEach(s => cilindro(.09, .09, .04, MAT.madeira, 10, { p: [s * .22, 0, 0], em: g }).rotation.z = Math.PI / 2);
  g.position.copy(de); g.visible = false; scene.add(g);
  return tween(ms, k => { g.visible = true; g.position.lerpVectors(de, para, k); g.position.y += Math.sin(k * Math.PI) * 1.5; g.rotation.set(k * 7, k * 3, 0); }, E.io, atraso || 0).then(() => scene.remove(g));
}
function espantalho(pos, cor, lado) {
  const g = new THREE.Group(), piv = new THREE.Group(); g.add(piv); g.position.copy(pos);
  const mc = new THREE.MeshStandardMaterial({ color: cor, roughness: .8, map: MAT.estopa.map });
  cilindro(.05, .06, 1.9, MAT.madeira, 8, { p: [0, .95, 0], em: piv }); cilindro(.04, .04, 1.5, MAT.madeira, 8, { p: [0, 1.25, 0], em: piv }).rotation.z = Math.PI / 2;
  cilindro(.3, .38, .8, MAT.estopa, 12, { p: [0, 1.0, 0], em: piv }); cilindro(.33, .33, .14, mc, 12, { p: [0, 1.36, 0], em: piv });
  const cab = new THREE.Mesh(new THREE.SphereGeometry(.27, 16, 12), MAT.estopa); cab.position.set(0, 1.72, 0); cab.castShadow = true; piv.add(cab);
  const ch = new THREE.Mesh(new THREE.ConeGeometry(.42, .42, 14), mc); ch.position.set(0, 2.08, 0); ch.castShadow = true; piv.add(ch); cilindro(.46, .46, .03, mc, 14, { p: [0, 1.9, 0], em: piv });
  [[-.75, 1.25, 0], [.75, 1.25, 0], [0, .56, 0]].forEach((p, i) => { for (let j = 0; j < 5; j++) { const t = new THREE.Mesh(new THREE.ConeGeometry(.025, .3, 5), MAT.palha); t.position.set(p[0] + (i < 2 ? Math.sign(p[0]) * .1 : (j - 2) * .09), p[1] + (i < 2 ? (j - 2) * .05 : -.12), p[2]); t.rotation.z = i < 2 ? -Math.sign(p[0]) * (1.57 + (j - 2) * .25) : Math.PI + (j - 2) * .2; piv.add(t); } });
  scene.add(g); g.scale.setScalar(.01);
  return { g,
    subir: () => tween(T(520), k => { g.scale.setScalar(Math.max(.01, k)); piv.rotation.z = Math.sin(k * 9) * .12 * (1 - k); }, E.tranco),
    tombar: () => tween(T(560), k => { piv.rotation.z = -lado * k * 1.3; }, E.in),
    sumir: () => tween(T(300), k => { g.scale.setScalar(Math.max(.01, 1 - k)); }, E.in).then(() => scene.remove(g)) };
}
function particulas(pos, n, mat3, o) {
  o = o || {};
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(o.geo || R.geoPalha, mat3), an = Math.random() * 6.3, d = .5 + Math.random() * 1.2, up = .6 + Math.random() * 1.2, chao = 0;
    m.position.copy(pos); scene.add(m);
    tween(T(o.d || 800), k => { m.position.set(pos.x + Math.cos(an) * d * k, Math.max(chao + .03, pos.y + up * Math.sin(k * 2.4) - (pos.y - chao) * k * k), pos.z + Math.sin(an) * d * k * .7); m.rotation.set(k * 9 + an, an, k * 7); if (k > .7) m.scale.setScalar((1 - k) / .3 + .01); }, E.out).then(() => scene.remove(m));
  }
}
function chuva(n) {
  for (let i = 0; i < (n || 30); i++) {
    const m = new THREE.Mesh(R.geoPagina, R.matPagina), x = (Math.random() - .5) * 15, z = -2.5 + Math.random() * 6, dx = (Math.random() - .5) * 2, g = Math.random() * 6;
    m.position.set(x, 9, z); m.visible = false; scene.add(m);
    tween(T(1700 + Math.random() * 900), k => { m.visible = true; m.position.set(x + dx * k + Math.sin(k * 9 + g) * .35, 8.5 * (1 - k) + .03, z); m.rotation.set(k * 8 + g, g + k * 3, Math.sin(k * 7 + g)); }, E.lin, T(Math.random() * 700))
      .then(() => tween(T(600), k => { m.scale.setScalar(Math.max(.01, 1 - k)); }, E.in, T(900))).then(() => scene.remove(m));
  }
}
// arquibancadas vazias nesta fase: o coro não tem figuras na cena; só a fala aparece (HTML, coreo.js)
function coro() {}
// livros novos chegando à Biblioteca de um adversário (a do jogador é HTML, na faixa de baixo)
function chegarEstante(P, n) {
  const b = R.bibs[P]; if (!b) return;
  const todos = (b.frente || []).concat(b.tras || []);
  todos.slice(-Math.min(n, todos.length)).forEach((l, i) => { const y = l.position.y; l.position.y = y + .9; l.visible = false; tween(T(420), k => { l.visible = true; l.position.y = y + (1 - k) * .9; }, E.tranco, T(i * 90)); });
}
function mundoEstante(P) {
  if (P === 0) { const el = document.getElementById('bib'), r = el && el.getBoundingClientRect(); if (!r) return null; return mundoDeTela(r.left + r.width / 2, r.top + r.height * .3, L.ped.z + L.ped.d / 2 + 1.2); }
  const b = R.bibs[P]; return b ? b.g.localToWorld(new V3(0, .7, .1)) : null;
}
function mundoPilha(P, id) { const f = figura(P, id); if (!f) return null; const s = f.s, v = new V3(s.fimPilha || s.pilhaPos.x, s.pilhaPos.y + s.alt * .7, s.pilhaPos.z); return s.em === scene ? v : s.em.localToWorld(v); }
// clarão breve na figura (poder que dispara, dupla clássica)
function brilhar(P, id, cor) {
  const f = figura(P, id); if (!f) return;
  const ms = [f.s.matFig, f.s.face], c = new THREE.Color(cor || '#f3c552');
  tween(T(1100), k => { ms.forEach(m => { m.emissive.copy(c); m.emissiveIntensity = Math.sin(k * Math.PI) * .6; }); }, E.lin).then(() => ms.forEach(m => { m.emissiveIntensity = 0; }));
}
function qualidade(q) { renderer.setPixelRatio(q.pixel || 1); renderer.shadowMap.enabled = q.sombras !== false; scene.traverse(o => { if (o.material) [].concat(o.material).forEach(m => { m.needsUpdate = true; }); }); enquadrar(); }
// a carta sai de trás do púlpito (salto até o debate) e volta: enquanto está fora, fica solta na cena
function fora(P, id, sim) {
  const f = figura(P, id); if (!f) return; const s = f.s; s.fora = sim;
  if (sim) { if (s.fig.parent !== scene) scene.attach(s.fig); }
  else { if (s.fig.parent !== s.em) s.em.attach(s.fig); s.fig.position.copy(baseDe(s)); s.fig.rotation.set(s.rx, 0, 0); s.fig.scale.setScalar(1); }
}

// ---------- partida ----------
function iniciar() {
  const cv = document.getElementById('gl');
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { document.body.classList.add('sem3d'); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
  scene = new THREE.Scene(); scene.fog = new THREE.Fog('#efe4d3', 60, 200);
  // fundo aberto: céu liso em degradê, sem horizonte nem paisagem
  { const c = tela(4, 256), x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#cfd6e2'); gr.addColorStop(.55, '#ece6dc'); gr.addColorStop(1, '#f3e7d4'); x.fillStyle = gr; x.fillRect(0, 0, 4, 256);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; scene.background = t; }
  scene.environment = criarAmbiente();
  camera = new THREE.PerspectiveCamera(L.cam.fov, innerWidth / innerHeight, .5, 600);
  cam.alvo0.set(L.cam.alvo[0], L.cam.alvo[1], L.cam.alvo[2]); cam.alvo.copy(cam.alvo0);
  MAT = criarMateriais(); anisotropia(Math.min(8, renderer.capabilities.getMaxAnisotropy()));
  MAT.marmoreEspelho = MAT.marmore.clone(); MAT.marmoreEspelho.color = new THREE.Color('#d9cfbd'); MAT.marmoreEspelho.side = THREE.DoubleSide;
  MAT.banco = MAT.marmore.clone(); MAT.banco.color = new THREE.Color('#e4dccd');
  // púlpitos, módulos e Bibliotecas: mármore claro no tampo, cinza neutro nas laterais (a frente leva a textura)
  MAT.tampo = MAT.marmorePolido.clone(); MAT.tampo.color = new THREE.Color('#fbf9f4');
  MAT.lado = MAT.marmore.clone(); MAT.lado.color = new THREE.Color('#b9b6b0');
  MAT.filete = new THREE.MeshStandardMaterial({ color: '#8c7f6c', roughness: .8, side: THREE.DoubleSide });
  R.geoLivro = new THREE.BoxGeometry(L.livro.w, 1, L.livro.d); R.geoLivroPe = new THREE.BoxGeometry(1, 1, 1);
  R.geoPalha = new THREE.BoxGeometry(.3, .025, .025); R.geoPagina = new THREE.PlaneGeometry(.34, .44);
  R.matPagina = new THREE.MeshStandardMaterial({ map: MAT.pergaminho.map, side: THREE.DoubleSide, roughness: .9 });
  const ch = tela(128, 128), xh = ch.getContext('2d'), gh = xh.createRadialGradient(64, 64, 20, 64, 64, 64); gh.addColorStop(0, 'rgba(255,255,255,.0)'); gh.addColorStop(.55, 'rgba(255,255,255,.75)'); gh.addColorStop(.75, 'rgba(255,255,255,.35)'); gh.addColorStop(1, 'rgba(255,255,255,0)');
  xh.fillStyle = gh; xh.fillRect(0, 0, 128, 128);
  R.matHalo = new THREE.MeshBasicMaterial({ map: texCanvas(ch), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true, fog: false, toneMapped: false });
  // luz: um só sol poente (direita), mais o céu e um pouco de preenchimento vindo da plateia
  sol = new THREE.DirectionalLight('#ffd3a4', 3.1); sol.position.copy(SOL).multiplyScalar(44).add(new V3(0, 0, -3)); sol.target.position.set(0, 0, -3); scene.add(sol, sol.target);
  sol.castShadow = true; sol.shadow.mapSize.set(2048, 2048); const sc = sol.shadow.camera; sc.left = -21; sc.right = 21; sc.top = 17; sc.bottom = -17; sc.near = 5; sc.far = 100; sol.shadow.bias = -.0006; sol.shadow.normalBias = .03; sol.shadow.radius = 3.5;
  hemi = new THREE.HemisphereLight('#c9d4ff', '#c79a6a', 1.15); scene.add(hemi);
  const frente = new THREE.DirectionalLight('#fff1dc', .55); frente.position.set(-2, 6, 20); scene.add(frente);
  montar();
  addEventListener('resize', enquadrar); enquadrar();
  requestAnimationFrame(laco);
  setInterval(() => { const a = performance.now(); if (a - ultimo > 180) avancar(a); }, 90);   // aba em segundo plano: as cenas não travam
  if (document.fonts && document.fonts.load) {
    const tudo = () => { repintar.forEach(f => f()); R.slots.forEach(s => { if (s.geo) pintarPlaca(s); }); R.meus.forEach(pintarPedestal); [1, 2].forEach(p => (R.ops[p] || []).forEach(s => s.pintar())); };
    Promise.all(["700 40px 'Alegreya'", "900 40px 'Alegreya'", "500 40px 'Alegreya'", "italic 500 40px 'Alegreya'", "800 40px 'Alegreya Sans'", "900 40px 'Alegreya Sans'"].map(f => document.fonts.load(f).catch(() => 0))).then(tudo);
    if (document.fonts.ready) document.fonts.ready.then(tudo);
  }
  if (MEDIR) criarMedidor();
  API.pronto = true; document.body.classList.add('com3d');
  if (window.__bf && window.__bf.S) window.__bf.render();
}

const API = {
  pronto: false, sync, posicionar, foco, desfoco, tremer, tela: tela2, retFig, L, E, tween, mundoDeTela,
  figura, arco, andar, tranco, fora, brilhar, cairLivro, derrubar, livroVoa, papiro, espantalho, particulas, chuva, coro, chegarEstante,
  topoTorre, peTorre, mundoEstante, mundoPilha, slotDe, qualidade,
  palha: pos => particulas(pos, 14, MAT.palha), V3,
  get camera() { return camera; }, get cena() { return scene; }, get R() { return R; },
};
window.M3D = API;
iniciar();
