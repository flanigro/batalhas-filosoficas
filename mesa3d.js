/* Batalhas Filosóficas — a mesa em Three.js
 *
 * COMO FUNCIONA
 * - A cena 3D é só o TABULEIRO: plataforma, placas dos debates (com uma prateleira de livros por jogador),
 *   pedestais (busto, prateleira, nome, valores), Bibliotecas, galeria dos adversários, estandartes, coro e luz. Cartas da mão, telas de texto, balões e botões continuam em HTML, por cima do canvas.
 * - ui.js continua desenhando elementos HTML com os mesmos data-atributos (data-di, data-est, data-row,
 *   data-seat…). Eles agora são INVISÍVEIS e recebem data-anc="chave": a cada quadro este arquivo põe cada
 *   um sobre o objeto 3D correspondente (projeção). Clique, seleção, alvos e arrasto seguem em ui.js.
 * - M3D.sync(S, ocultos) deixa a cena igual ao estado do jogo. As cenas de coreo.js pedem movimentos
 *   (saltar, andar, cairLivro, derrubar, foco…) pela API no fim do arquivo (window.M3D).
 * - Um elemento com a classe .alvo, .sobre ou .selecionado acende o objeto 3D da sua âncora.
 *
 * MEDIDAS: y para cima, x para a direita, z para o jogador. O piso da plataforma fica em y = 0.
 * Tudo o que é posição e tamanho está em L (logo abaixo); tudo o que é aparência, em materiais.js.
 */
import * as THREE from 'three';
import { criarMateriais, matLivro, mat, gerado, normalDe, tela, registrar, anisotropia } from './materiais.js';

const V3 = THREE.Vector3, BF = window.BF;
/* Composição (rodada 4): três faixas, de trás para a frente.
   - Galeria dos adversários (alto, ao fundo): as cartas de cada adversário em pé, com uma prateleirinha de
     livros à frente de cada uma. Nas laterais, no meio da altura, o estandarte e a Biblioteca de cada um.
   - Placas dos debates (meio), sobre um tablado: cabeçalho, pergunta e uma prateleira por jogador.
   - Pedestais do jogador (frente) e, à direita deles, a Biblioteca do jogador.
   A câmera é estável (sem paralaxe do mouse), com lente fechada (30°) para achatar a perspectiva. */
const L = {
  plat: { hw: 11, zf: 4.3, zb: -4.4, borda: .2, faixa: .9, degrau: .3 },   // meia largura, frente, fundo
  chao: -1.7,
  dais: { z0: -2.25, z1: -.15, h: .95 },                                     // tablado sob as placas
  placa: { x: [-4.15, 0, 4.15], z: -1.35, w: 3.95, esp: .2, topo: .1, cab: .62, perg: 1.12, prat: .5, base: .14, lado: .14, med: .5, num: .44 },
  ped: { x: [-4.45, -2.15, .15, 2.45], z: 2.75, w: 2.1, h: 1.2, d: .95, fig: .82, busto: [1.22, 1.5] },
  bib: { eu: [5.2, 2.75], op: [[-7.3, -3.35], [7.3, -3.35]], w: 1.7, wop: 1.45 },  // Bibliotecas: do jogador e dos adversários (na galeria)
  gal: { y: 4.6, zf: -2.75, zb: -5.4, x: [[-5.75, -4.4, -3.05, -1.7], [1.7, 3.05, 4.4, 5.75]], esc: .86 },
  livro: { w: .74, d: .5 },
  cam: { fov: 30, passo: 29 * Math.PI / 180, alvo: [0, 1.9, -.6] },
};
const PED_H = L.ped.h + .08;                 // altura do tampo do pedestal
const SOL = new V3(1, .62, .5).normalize();  // de onde vem a luz: direita, baixa, um pouco da frente
const CONTORNO = '#3b2414';                  // cor do contorno dos objetos de jogo (estilização)

let renderer, scene, camera, MAT, sol, hemi, relogio = 0;
const R = { slots: [], meus: [], ops: {}, bibs: {}, ids: {}, livroPe: {}, livroMat: {}, coro: [], halos: {}, emis: {} };
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
// placa extrudada a partir de um contorno; a face da frente recebe UV de 0 a 1 (para textura com texto)
function placa(forma, w, h, esp, o) {
  o = o || {};
  const g = new THREE.ExtrudeGeometry(forma, { depth: esp, bevelEnabled: !!o.chanfro, bevelSize: o.chanfro || 0, bevelThickness: o.chanfro || 0, bevelSegments: 2, curveSegments: 24 });
  const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    if (Math.abs(n.getZ(i)) > .7) uv.setXY(i, (p.getX(i) + w / 2) / w, p.getY(i) / h);
    else uv.setXY(i, p.getX(i) + p.getZ(i), p.getY(i));
  }
  return g;
}
function retArred(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2;
  s.moveTo(x + r, 0); s.lineTo(x + w - r, 0); s.quadraticCurveTo(x + w, 0, x + w, r); s.lineTo(x + w, h - r); s.quadraticCurveTo(x + w, h, x + w - r, h);
  s.lineTo(x + r, h); s.quadraticCurveTo(x, h, x, h - r); s.lineTo(x, r); s.quadraticCurveTo(x, 0, x + r, 0); return s;
}
function texCanvas(c, linear) { const t = new THREE.CanvasTexture(c); if (!linear) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return registrar(t); }
const FONTE = (peso, px, sans) => peso + ' ' + px + 'px ' + (sans ? "'Alegreya Sans',system-ui,sans-serif" : "'Alegreya',Georgia,serif");
// letra gravada na pedra: sombra na parede de cima, luz na de baixo (a luz vem do alto, à direita)
function gravar(x, txt, px, py, cor) {
  x.fillStyle = 'rgba(40,28,18,.5)'; x.fillText(txt, px + 1, py - 1);
  x.fillStyle = 'rgba(255,255,255,.8)'; x.fillText(txt, px - 1.2, py + 1.6);
  x.fillStyle = cor || 'rgba(58,44,32,.92)'; x.fillText(txt, px, py);
}
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
const repintar = [];   // funções que redesenham texturas com texto (rodam de novo quando as fontes chegam)

// ---------- retratos (provisórios: img/<id>.jpg) ----------
const _img = {};
function retrato(id, cb) {
  let o = _img[id];
  if (!o) { o = _img[id] = { img: new Image(), ok: false, cbs: [] }; o.img.onload = () => { o.ok = true; o.cbs.splice(0).forEach(f => f()); }; o.img.src = 'img/' + id + '.jpg'; }
  if (o.ok) return o.img; if (cb) o.cbs.push(cb); return null;
}
const _carta = {};
function texCarta(id) {
  if (_carta[id]) return _carta[id];
  const c = tela(256, 352), x = c.getContext('2d'), t = texCanvas(c);
  const pinta = () => {
    const ca = BF.C(id), e = BF.ESCOLA[ca.escola], im = retrato(id, pinta);
    x.fillStyle = e.cor2; x.fillRect(0, 0, 256, 352);
    if (im) { const k = Math.max(236 / im.width, 232 / im.height), sw = 236 / k, sh = 232 / k; x.drawImage(im, (im.width - sw) / 2, (im.height - sh) * .16, sw, sh, 10, 10, 236, 232); }
    else { x.fillStyle = '#5a5a5a'; x.fillRect(10, 10, 236, 232); }
    const g = x.createLinearGradient(0, 150, 0, 244); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, e.cor2); x.fillStyle = g; x.fillRect(10, 150, 236, 94);
    x.strokeStyle = e.cor; x.lineWidth = 3; x.strokeRect(6.5, 6.5, 243, 339);
    x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.fillStyle = '#fff'; let px = 40; x.font = FONTE(900, px);
    while (x.measureText(ca.nome).width > 226 && px > 20) { px -= 2; x.font = FONTE(900, px); }
    x.shadowColor = 'rgba(0,0,0,.8)'; x.shadowBlur = 5; x.fillText(ca.nome, 128, 268); x.shadowBlur = 0;
    BF.AREAS.forEach((a, i) => {
      const cx = 12 + i * 59; x.fillStyle = BF.AREA[a].cor; x.beginPath(); x.roundRect(cx, 284, 55, 54, 8); x.fill();
      x.fillStyle = '#fff'; x.font = FONTE(800, 36, true); x.fillText(ca.vals[a], cx + 27.5, 324);
    });
    x.fillStyle = '#fff'; x.beginPath(); x.roundRect(12, 12, 50, 50, 10); x.fill(); x.strokeStyle = e.cor2; x.lineWidth = 4; x.stroke();
    x.fillStyle = '#23201a'; x.font = FONTE(900, 38); x.fillText(ca.custo, 37, 51);
    t.needsUpdate = true;
  };
  pinta(); repintar.push(pinta);
  return _carta[id] = t;
}


// ---------- texturas com texto: placa do debate, face do pedestal, busto, estandarte ----------
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
function pintarPlaca(slot) {
  const c = slot.tela, x = c.getContext('2d'), W = c.width, Hc = c.height, P = L.placa, g = slot.geo, q = BF.DEB[slot.did], a = BF.AREA[q.area];
  const X = wx => (wx + P.w / 2) / P.w * W, Y = wy => (g.H - wy) / g.H * Hc, k = W / P.w;
  // fundo: reboco claro com um pouco de veio
  x.fillStyle = '#f2e7cf'; x.fillRect(0, 0, W, Hc);
  x.globalAlpha = .28; x.globalCompositeOperation = 'multiply'; recorteMarmore(x, W, Hc, slot.i * 7 + 3); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
  // A. cabeçalho na cor da área, medalhão com o valor e nome da área
  const y0 = Y(g.H - P.topo), y1 = Y(g.H - P.topo - P.cab);
  x.fillStyle = a.cor; x.fillRect(0, y0, W, y1 - y0);
  x.fillStyle = 'rgba(0,0,0,.22)'; x.fillRect(0, y1 - 6, W, 6); x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(0, y0, W, 4);
  const mr = (y1 - y0) * .62, mx = mr + 14, my = (y0 + y1) / 2;
  x.fillStyle = 'rgba(40,20,10,.35)'; x.beginPath(); x.arc(mx - 3, my + 5, mr, 0, 7); x.fill();
  x.fillStyle = '#f5dca4'; x.beginPath(); x.arc(mx, my, mr, 0, 7); x.fill();
  x.lineWidth = 5; x.strokeStyle = CONTORNO; x.stroke(); x.lineWidth = 2; x.strokeStyle = '#c8962a'; x.beginPath(); x.arc(mx, my, mr - 7, 0, 7); x.stroke();
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#3a2208'; x.font = FONTE(900, mr * (q.valor > 9 ? 1.15 : 1.35)); x.fillText(String(q.valor), mx, my + 3);
  x.textAlign = 'left'; x.fillStyle = '#fffaf0'; const nome = a.nome.toUpperCase(), larg = W - (mx + mr + 18) - 14; let pa = 34; x.font = FONTE(800, pa, true);
  let lin = [nome]; while (x.measureText(nome).width > larg && pa > 26) { pa--; x.font = FONTE(800, pa, true); }
  if (x.measureText(nome).width > larg) { pa = 30; x.font = FONTE(800, pa, true); lin = quebrar(x, nome, larg, 2) || [nome]; }
  lin.forEach((l, i) => x.fillText(l, mx + mr + 18, my + (i - (lin.length - 1) / 2) * pa * 1.05));
  // B. a pergunta: letra grande e escura, centrada
  const pt = Y(g.H - P.topo - P.cab) + 6, ph = Y(g.H - P.topo - P.cab - P.perg) - pt - 30, pl = W - 44;
  let px = 64, pls = null; for (; px >= 28; px -= 2) { x.font = FONTE(700, px); pls = quebrar(x, q.q, pl, 3); if (pls && pls.length * px * 1.08 <= ph) break; }
  if (!pls) { x.font = FONTE(700, 28); pls = quebrar(x, q.q, pl, 9) || [q.q]; }
  x.textAlign = 'center'; x.fillStyle = '#2a1c10'; const lh = px * 1.08, py0 = pt + (ph - pls.length * lh) / 2 + lh / 2;
  pls.forEach((l, i) => x.fillText(l, W / 2, py0 + i * lh));
  // C. prateleiras: fundo de madeira, letra do jogador, marco dourado do valor
  const f = slot.fil;
  g.linhas.forEach((ln, p) => {
    const yt = Y(ln.yT), yb = Y(ln.yB), gr = x.createLinearGradient(0, yt, 0, yb);
    gr.addColorStop(0, '#9a6b3f'); gr.addColorStop(1, '#6e4626'); x.fillStyle = gr; x.fillRect(X(-P.w / 2 + P.lado) , yt + 3, X(P.w / 2 - P.lado) - X(-P.w / 2 + P.lado), yb - yt - 3);
    x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(X(-P.w / 2 + P.lado), yt + 3, X(P.w / 2 - P.lado) - X(-P.w / 2 + P.lado), 5);
    const cor = S.players[p] ? S.players[p].cor : '#888', cx = X(-P.w / 2 + P.lado + P.med / 2), cy = (yt + yb) / 2 + 2, r = Math.min(P.med * .4 * k, (yb - yt) * .4);
    x.fillStyle = cor; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); x.lineWidth = 4; x.strokeStyle = CONTORNO; x.stroke();
    x.fillStyle = '#fff'; x.font = FONTE(900, r * 1.25); x.textAlign = 'center'; x.fillText(inicial(p), cx, cy + 2);
    // marco do valor (vence com N) e fim da prateleira (dobro = vitória imediata)
    const mv = X(g.xb0 + (f.x(q.valor - 1) + f.x(q.valor)) / 2);
    x.fillStyle = '#e9c25a'; x.fillRect(mv - 2.5, yt + 4, 5, yb - yt - 4); x.fillStyle = 'rgba(80,50,10,.6)'; x.fillRect(mv + 2.5, yt + 4, 1.5, yb - yt - 4);
    const me = X(g.xb0 + f.x(2 * q.valor - 1) + f.vaga / 2 + .02);
    x.fillStyle = 'rgba(233,194,90,.55)'; x.fillRect(me - 1, yt + 4, 3, yb - yt - 4);
  });
  // marcas do valor acima das prateleiras: "N" no marco e "2N" no fim
  const ytop = Y(g.linhas[0].yT), mv = X(g.xb0 + (f.x(q.valor - 1) + f.x(q.valor)) / 2), me = X(g.xb0 + f.x(2 * q.valor - 1) + f.vaga / 2 + .02);
  x.font = FONTE(800, 22, true); x.textBaseline = 'bottom';
  [[mv, String(q.valor)], [me, String(2 * q.valor)]].forEach(([mx2, t], i) => { const w2 = x.measureText(t).width + 12; x.fillStyle = i ? '#b98d36' : '#c8962a'; x.beginPath(); x.roundRect(mx2 - w2 / 2, ytop - 26, w2, 24, 5); x.fill(); x.fillStyle = '#fff8e0'; x.textAlign = 'center'; x.fillText(t, mx2, ytop - 3); });
  x.textBaseline = 'middle';
  slot.tex.needsUpdate = true;
}
function pintarPedestal(seat) {
  const c = seat.tela, x = c.getContext('2d'), W = c.width, H = c.height;
  x.fillStyle = '#b8562f'; x.fillRect(0, 0, W, H);                       // terracota
  x.globalAlpha = .18; x.globalCompositeOperation = 'multiply'; x.drawImage(gerado('terracota').cor, 0, 0, W, H); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
  // faixa negra do nome (cerâmica de figuras negras)
  x.fillStyle = '#1e130e'; x.fillRect(0, 0, W, 66); x.fillStyle = '#d98a52'; x.fillRect(0, 66, W, 4);
  if (seat.id) {
    const ca = BF.C(seat.id);
    x.textAlign = 'center'; x.textBaseline = 'middle'; let px = 48; x.font = FONTE(900, px);
    try { x.letterSpacing = '2px'; } catch (e) {}
    while (x.measureText(ca.nome.toUpperCase()).width > W - 40 && px > 28) { px -= 2; x.font = FONTE(900, px); }
    x.fillStyle = '#f3d9a8'; x.fillText(ca.nome.toUpperCase(), W / 2, 36); try { x.letterSpacing = '0px'; } catch (e) {}
    // quatro valores, 2 × 2: número grande na cor da área; borda grossa = área com debate na mesa
    const bw = (W - 3 * 16) / 2, bh = (H - 70 - 3 * 10) / 2;
    BF.AREAS.forEach((a, i) => {
      const ar = BF.AREA[a], bx = 16 + (i % 2) * (bw + 16), by = 70 + 10 + Math.floor(i / 2) * (bh + 10), on = seat.on && seat.on[a];
      x.fillStyle = 'rgba(30,15,8,.35)'; x.beginPath(); x.roundRect(bx - 3, by + 4, bw, bh, 12); x.fill();
      x.fillStyle = on ? '#fffaf0' : '#d9cdb6'; x.beginPath(); x.roundRect(bx, by, bw, bh, 12); x.fill();
      if (on) { x.lineWidth = 15; x.strokeStyle = ar.cor; x.stroke(); x.lineWidth = 2.5; x.strokeStyle = '#fff'; x.beginPath(); x.roundRect(bx + 10, by + 10, bw - 20, bh - 20, 6); x.stroke(); }
      else { x.lineWidth = 2; x.strokeStyle = 'rgba(60,35,20,.35)'; x.stroke(); }
      x.fillStyle = ar.cor; x.font = FONTE(900, bh * .86, true); x.textAlign = 'center'; x.fillText(ca.vals[a], bx + bw / 2, by + bh / 2 + 4);
    });
  }
  seat.tex.needsUpdate = true;
}
// busto: o retrato num nicho de topo em arco, com moldura na cor da escola (fundo transparente fora do arco)
const _busto = {};
function texBusto(id) {
  if (_busto[id]) return _busto[id];
  const c = tela(256, 320), x = c.getContext('2d'), t = texCanvas(c);
  const pinta = () => {
    const ca = BF.C(id), e = BF.ESCOLA[ca.escola], im = retrato(id, pinta), r = 112, cx = 128, topo = 12;
    x.clearRect(0, 0, 256, 320);
    const forma = () => { x.beginPath(); x.moveTo(cx - r, 316); x.lineTo(cx - r, topo + r); x.arc(cx, topo + r, r, Math.PI, 0); x.lineTo(cx + r, 316); x.closePath(); };
    x.save(); forma(); x.clip();
    x.fillStyle = e.cor2; x.fillRect(0, 0, 256, 320);
    if (im) { const kk = Math.max(2 * r / im.width, 304 / im.height), sw = 2 * r / kk, sh = 304 / kk; x.drawImage(im, (im.width - sw) / 2, Math.max(0, (im.height - sh) * .12), sw, sh, cx - r, topo, 2 * r, 304); }
    const gr = x.createLinearGradient(0, 230, 0, 320); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.35)'); x.fillStyle = gr; x.fillRect(0, 230, 256, 90);
    x.restore();
    forma(); x.lineWidth = 12; x.strokeStyle = e.cor; x.stroke(); x.lineWidth = 3.5; x.strokeStyle = CONTORNO; x.stroke();
    t.needsUpdate = true;
  };
  pinta(); repintar.push(pinta);
  return _busto[id] = t;
}

// ---------- piso da plataforma: lajes, juntas, faixa de meandro, círculo da orquestra ----------
function criarPiso(w, d) {
  const esc = 2048 / w, W = 2048, H = Math.round(d * esc);
  const cor = tela(W, H), alt = tela(W, H), rug = tela(W, H), xc = cor.getContext('2d'), xa = alt.getContext('2d'), xr = rug.getContext('2d');
  const m = gerado('marmore'), laje = 1.32 * esc, nx = Math.ceil(W / laje), nz = Math.ceil(H / laje), ox = (W - nx * laje) / 2, oz = (H - nz * laje) / 2;
  xa.fillStyle = '#808080'; xa.fillRect(0, 0, W, H);
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const s = i * 31 + j * 57, sw = 250, sx = rnd(s) * (512 - sw), sy = rnd(s + 1) * (512 - sw), px = ox + i * laje, py = oz + j * laje;
    [[xc, m.cor], [xr, m.rug]].forEach(([c, img]) => { c.save(); c.translate(px + laje / 2, py + laje / 2); c.rotate(Math.floor(rnd(s + 2) * 4) * Math.PI / 2); c.drawImage(img, sx, sy, sw, sw, -laje / 2, -laje / 2, laje, laje); c.restore(); });
    const tom = rnd(s + 3); xc.fillStyle = tom < .5 ? 'rgba(120,96,60,' + (.1 * tom) + ')' : 'rgba(255,255,255,' + (.1 * (tom - .5)) + ')'; xc.fillRect(px, py, laje, laje);
  }
  // círculo da orquestra (incrustação de pedra escura) sob as estelas
  const cx = W / 2, cz = (-.25 - (-d / 2 + (L.plat.zf + L.plat.zb) / 2)) * esc, rr = 4.35 * esc;
  const anel = (r, lw, c1, c2, c3) => { [[xc, c1], [xa, c2], [xr, c3]].forEach(([c, s]) => { c.strokeStyle = s; c.lineWidth = lw; c.beginPath(); c.arc(cx, cz, r, 0, 7); c.stroke(); }); };
  xc.save(); xc.globalCompositeOperation = 'multiply'; xc.fillStyle = '#f1e2c4'; xc.beginPath(); xc.arc(cx, cz, rr, 0, 7); xc.fill(); xc.restore();
  anel(rr, .22 * esc, '#59606a', '#767676', 'rgb(255,70,0)'); anel(rr - .2 * esc, .05 * esc, '#b58a3a', '#8a8a8a', 'rgb(255,90,0)'); anel(rr + .2 * esc, .05 * esc, '#b58a3a', '#8a8a8a', 'rgb(255,90,0)');
  // juntas das lajes
  [[xc, 'rgba(92,80,62,.6)', 1.6], [xa, '#3c3c3c', 2.5], [xr, 'rgb(255,230,0)', 2]].forEach(([c, s, lw]) => {
    c.strokeStyle = s; c.lineWidth = lw; c.beginPath();
    for (let i = 0; i <= nx; i++) { c.moveTo(ox + i * laje, 0); c.lineTo(ox + i * laje, H); }
    for (let j = 0; j <= nz; j++) { c.moveTo(0, oz + j * laje); c.lineTo(W, oz + j * laje); }
    c.stroke();
  });
  xc.strokeStyle = 'rgba(255,255,255,.35)'; xc.lineWidth = 1; xc.beginPath();
  for (let i = 0; i <= nx; i++) { xc.moveTo(ox + i * laje - 2, 0); xc.lineTo(ox + i * laje - 2, H); }
  for (let j = 0; j <= nz; j++) { xc.moveTo(0, oz + j * laje + 2); xc.lineTo(W, oz + j * laje + 2); }
  xc.stroke();
  // faixa da borda: pedra escura com meandro claro e filetes de bronze
  const b = .62 * esc, mg = .16 * esc;
  const faixa = (c, s) => { c.fillStyle = s; c.fillRect(mg, mg, W - 2 * mg, b); c.fillRect(mg, H - mg - b, W - 2 * mg, b); c.fillRect(mg, mg, b, H - 2 * mg); c.fillRect(W - mg - b, mg, b, H - 2 * mg); };
  xc.save(); xc.globalCompositeOperation = 'multiply'; faixa(xc, '#6c7480'); xc.restore(); faixa(xa, '#787878'); faixa(xr, 'rgb(255,80,0)');
  const u = b / 5, meandro = (c, s, lw) => {
    c.strokeStyle = s; c.lineWidth = lw; c.lineJoin = 'miter';
    const lado = (x0, y0, comp, rot) => { c.save(); c.translate(x0, y0); c.rotate(rot); const n = Math.floor(comp / (u * 4)); const o = (comp - n * u * 4) / 2; c.beginPath();
      for (let k = 0; k < n; k++) { const x1 = o + k * u * 4; c.moveTo(x1, u * 4); c.lineTo(x1, u); c.lineTo(x1 + u * 3, u); c.lineTo(x1 + u * 3, u * 3); c.lineTo(x1 + u * 1.5, u * 3); c.lineTo(x1 + u * 1.5, u * 2.1); }
      c.moveTo(o, u * 4); c.lineTo(o + n * u * 4, u * 4); c.stroke(); c.restore(); };
    lado(mg + b, mg, W - 2 * mg - 2 * b, 0); lado(W - mg - b, H - mg, W - 2 * mg - 2 * b, Math.PI); lado(W - mg, mg + b, H - 2 * mg - 2 * b, Math.PI / 2); lado(mg, H - mg - b, H - 2 * mg - 2 * b, -Math.PI / 2);
  };
  meandro(xc, '#efe7d6', u * .5); meandro(xa, '#909090', u * .5);
  const filete = (c, s, lw) => { c.strokeStyle = s; c.lineWidth = lw; c.strokeRect(mg, mg, W - 2 * mg, H - 2 * mg); c.strokeRect(mg + b, mg + b, W - 2 * mg - 2 * b, H - 2 * mg - 2 * b); };
  filete(xc, '#b58a3a', .05 * esc); filete(xa, '#8c8c8c', .05 * esc); filete(xr, 'rgb(255,95,0)', .05 * esc);
  const tc = texCanvas(cor), tn = texCanvas(normalDe(alt, 2.2, false), true), tr = texCanvas(rug, true);
  [tc, tn, tr].forEach(t => { t.anisotropy = 16; });
  return new THREE.MeshStandardMaterial({ map: tc, normalMap: tn, roughnessMap: tr, roughness: 1.15, metalness: 0, envMapIntensity: .45 });
}

// ---------- céu, morro com templo, serra ao fundo (camadas provisórias) ----------
function criarFundo() {
  const g = new THREE.Group();
  const c = tela(1024, 512), x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, '#27356b'); gr.addColorStop(.3, '#5b5f9c'); gr.addColorStop(.5, '#a9799c'); gr.addColorStop(.66, '#ee9f72'); gr.addColorStop(.78, '#fbd3a0'); gr.addColorStop(.83, '#f6d9b4'); gr.addColorStop(1, '#f1cfa6');
  x.fillStyle = gr; x.fillRect(0, 0, 1024, 512);
  const so = x.createRadialGradient(960, 410, 6, 960, 410, 420); so.addColorStop(0, 'rgba(255,246,214,1)'); so.addColorStop(.12, 'rgba(255,222,150,.85)'); so.addColorStop(.45, 'rgba(255,170,100,.3)'); so.addColorStop(1, 'rgba(255,170,100,0)');
  x.fillStyle = so; x.fillRect(0, 0, 1024, 512);
  // nuvens finas
  x.globalAlpha = .5; for (let i = 0; i < 9; i++) { const cx = rnd(i * 3) * 1024, cy = 250 + rnd(i * 3 + 1) * 130, w = 120 + rnd(i * 3 + 2) * 240; const n = x.createLinearGradient(0, cy - 8, 0, cy + 8); n.addColorStop(0, 'rgba(255,214,170,0)'); n.addColorStop(.5, 'rgba(255,224,190,.9)'); n.addColorStop(1, 'rgba(180,120,130,0)'); x.fillStyle = n; x.beginPath(); x.ellipse(cx, cy, w, 9, 0, 0, 7); x.fill(); } x.globalAlpha = 1;
  const ceu = new THREE.Mesh(new THREE.PlaneGeometry(560, 230), new THREE.MeshBasicMaterial({ map: texCanvas(c), fog: false, toneMapped: false, depthWrite: false }));
  ceu.position.set(0, 68, -210); ceu.renderOrder = -10; g.add(ceu);
  // serra distante
  const s = tela(1024, 128), xs = s.getContext('2d'); xs.fillStyle = '#b18aa0'; xs.beginPath(); xs.moveTo(0, 128);
  for (let i = 0; i <= 64; i++) xs.lineTo(i * 16, 70 - rnd(i * 5) * 34 - Math.sin(i * .37) * 18 - Math.sin(i * .11 + 1) * 16); xs.lineTo(1024, 128); xs.fill();
  const gs = xs.createLinearGradient(0, 20, 0, 128); gs.addColorStop(0, 'rgba(241,207,166,0)'); gs.addColorStop(1, 'rgba(244,214,178,.95)'); xs.fillStyle = gs; xs.fillRect(0, 0, 1024, 128);
  const serra = new THREE.Mesh(new THREE.PlaneGeometry(520, 30), new THREE.MeshBasicMaterial({ map: texCanvas(s), transparent: true, fog: false, toneMapped: false, depthWrite: false }));
  serra.position.set(0, 8, -200); serra.renderOrder = -9; g.add(serra);
  // morro com templo no alto (Acrópole), apagado pela distância
  const h = tela(1024, 400), xh = h.getContext('2d'); const gh = xh.createLinearGradient(0, 90, 0, 400); gh.addColorStop(0, '#9c7f96'); gh.addColorStop(.55, '#b7929a'); gh.addColorStop(1, 'rgba(241,207,166,.0)');
  xh.fillStyle = gh; xh.beginPath(); xh.moveTo(0, 400); xh.bezierCurveTo(120, 330, 250, 190, 380, 150); xh.lineTo(640, 146); xh.bezierCurveTo(760, 190, 900, 330, 1024, 400); xh.fill();
  xh.fillStyle = 'rgba(255,214,170,.5)'; xh.beginPath(); xh.moveTo(640, 146); xh.bezierCurveTo(760, 190, 900, 330, 1024, 400); xh.lineTo(900, 400); xh.bezierCurveTo(820, 300, 720, 210, 610, 150); xh.fill();
  // rocha do topo e templo
  xh.fillStyle = '#a58a9a'; xh.fillRect(372, 138, 276, 16);
  const tx = 420, ty = 64, tw = 180, th = 74; xh.fillStyle = '#e9d2c0'; xh.fillRect(tx - 8, ty + th, tw + 16, 8);
  for (let i = 0; i < 9; i++) { xh.fillStyle = '#8f7890'; xh.fillRect(tx + i * (tw / 8) - 5, ty + 22, 10, th - 22); xh.fillStyle = '#f7e2c4'; xh.fillRect(tx + i * (tw / 8) + 1, ty + 22, 4.5, th - 22); }
  xh.fillStyle = '#d9bfb4'; xh.fillRect(tx - 10, ty + 12, tw + 20, 11); xh.fillStyle = '#f3dcc2'; xh.beginPath(); xh.moveTo(tx - 12, ty + 12); xh.lineTo(tx + tw / 2, ty - 16); xh.lineTo(tx + tw + 12, ty + 12); xh.fill();
  xh.fillStyle = '#b79aa2'; xh.beginPath(); xh.moveTo(tx + 6, ty + 9); xh.lineTo(tx + tw / 2, ty - 8); xh.lineTo(tx + tw / 2, ty + 9); xh.fill();
  const morro = new THREE.Mesh(new THREE.PlaneGeometry(56, 22), new THREE.MeshBasicMaterial({ map: texCanvas(h), transparent: true, fog: false, toneMapped: false, depthWrite: false }));
  morro.position.set(-44, 3, -150); morro.renderOrder = -8; g.add(morro);
  return g;
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

// ---------- árvores ----------
function coristaTex(v) {
  const c = tela(128, 192), x = c.getContext('2d'), esc = '#1e130e';
  x.fillStyle = esc; x.strokeStyle = esc; x.lineCap = 'round';
  x.beginPath(); x.moveTo(40, 190); x.lineTo(46, 92); x.quadraticCurveTo(64, 78, 82, 92); x.lineTo(90, 190); x.fill();          // túnica
  x.beginPath(); x.arc(64, 62, 17, 0, 7); x.fill();                                                                               // cabeça
  x.lineWidth = 11; x.beginPath(); x.moveTo(50, 96); x.quadraticCurveTo(28, 78, v ? 18 : 26, v ? 30 : 22); x.stroke();             // braços erguidos
  x.beginPath(); x.moveTo(78, 96); x.quadraticCurveTo(100, 78, v ? 104 : 112, v ? 22 : 34); x.stroke();
  x.beginPath(); x.arc(v ? 18 : 26, v ? 26 : 18, 7, 0, 7); x.arc(v ? 104 : 112, v ? 18 : 30, 7, 0, 7); x.fill();
  x.strokeStyle = '#d98a52'; x.lineWidth = 2;                                                                                     // incisões em terracota
  x.beginPath(); x.moveTo(48, 120); x.lineTo(84, 120); x.moveTo(46, 128); x.lineTo(86, 128); x.stroke();
  for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(50 + i * 8, 134); x.lineTo(48 + i * 9.5, 186); x.stroke(); }
  x.beginPath(); x.arc(70, 60, 2.5, 0, 7); x.stroke(); x.beginPath(); x.moveTo(52, 50); x.quadraticCurveTo(64, 42, 78, 50); x.stroke();
  return texCanvas(c);
}

// ---------- montagem da cena ----------

// ---------- contorno (estilização): casca escura um pouco maior, só com as faces de trás ----------
const _matCont = {};
function contorno(m, w, h, d, cor, e) {
  e = e || .022; cor = cor || CONTORNO;
  const mc = _matCont[cor] || (_matCont[cor] = new THREE.MeshBasicMaterial({ color: cor, side: THREE.BackSide }));
  const c = new THREE.Mesh(new THREE.BoxGeometry(w + 2 * e, h + 2 * e, d + 2 * e), mc); c.castShadow = false; c.receiveShadow = false;
  m.add(c); return m;
}
function caixaC(w, h, d, material, o, cor) { const m = caixa(w, h, d, material, o); return contorno(m, w, h, d, cor); }

// ---------- montagem da cena ----------
function montar() {
  const P = L.plat, w = P.hw * 2, d = P.zf - P.zb, zc = (P.zf + P.zb) / 2;
  scene.add(criarFundo());
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), MAT.terra); chao.geometry.attributes.uv.array.forEach((v, i, a) => { a[i] = v * 400; });
  chao.rotation.x = -Math.PI / 2; chao.position.y = L.chao; chao.receiveShadow = true; scene.add(chao);
  // plataforma
  const pl = new THREE.Group(); scene.add(pl);
  caixa(w + 2, P.degrau, d + 2, MAT.calcario, { p: [0, L.chao + P.degrau / 2, zc], em: pl });
  caixa(w + 1, P.degrau, d + 1, MAT.calcario, { p: [0, L.chao + P.degrau * 1.5, zc], em: pl });
  caixa(w, P.faixa, d, MAT.caneluras, { p: [0, -P.borda - P.faixa / 2, zc], em: pl });
  caixa(w + .3, P.borda, d + .3, MAT.marmore, { p: [0, -P.borda / 2, zc], em: pl });
  const piso = new THREE.Mesh(new THREE.PlaneGeometry(w + .3, d + .3), criarPiso(w + .3, d + .3)); piso.rotation.x = -Math.PI / 2; piso.position.set(0, .004, zc); piso.receiveShadow = true; pl.add(piso);

  // tablado das placas
  const D = L.dais, dd = D.z1 - D.z0;
  caixaC(13.2, D.h, dd, MAT.silhar, { p: [0, D.h / 2, (D.z0 + D.z1) / 2], em: pl });
  caixa(13.4, .06, dd + .12, MAT.marmorePolido, { p: [0, D.h + .03, (D.z0 + D.z1) / 2], em: pl });

  // galeria dos adversários: muro alto ao fundo, com friso; parapeito atrás e o coro do outro lado
  const G = L.gal, gd = G.zf - G.zb;
  caixa(w, G.y, gd, MAT.silhar, { p: [0, G.y / 2, (G.zf + G.zb) / 2], em: pl });
  caixa(w + .2, .14, gd + .1, MAT.marmorePolido, { p: [0, G.y + .07, (G.zf + G.zb) / 2], em: pl });
  caixa(w, .34, .06, MAT.terracota, { p: [0, G.y - .32, G.zf + .03], em: pl, sombra: false });
  // placas de identificação dos adversários, na borda da galeria, sob as cartas de cada um
  [1, 2].forEach((p, bi) => { const xs = G.x[bi], cx = (xs[0] + xs[3]) / 2, mp = new THREE.MeshStandardMaterial({ color: '#888', roughness: .55, envMapIntensity: .4 });
    const pl2 = caixaC(xs[3] - xs[0] + 1.5, .62, .1, mp, { p: [cx, G.y - .36, G.zf + .06], em: pl }); R.ids[p] = { P: p, mat: mp, x: cx, pintado: false }; });
  caixa(w + .2, 1.15, .4, MAT.calcario, { p: [0, G.y + .14 + .57, G.zb + .2], em: pl });
  [1, 2].forEach((p, bi) => {
    R.ops[p] = [];
    G.x[bi].forEach((x, k) => {
      const s = { P: p, k, id: null, esc: G.esc, base: new V3(x, G.y + .14, G.zf - .62), pilhaPos: new V3(x, G.y + .14, G.zf - .22), pilha: [], larg: 1.1, vaga: .1, espM: .08, alt: .3, prof: .2 };
      caixaC(1.25, .05, .34, MAT.madeira, { p: [x, G.y + .165, G.zf - .22], em: pl });
      criarCarta(s); R.ops[p].push(s);
    });
  });

  // placas dos debates (a geometria se completa no primeiro sync, quando se sabe quantos jogadores há)
  L.placa.x.forEach((sx, i) => {
    const g = new THREE.Group(); g.position.set(sx, D.h + .06, L.placa.z); scene.add(g);
    const vazio = caixaC(L.placa.w - .4, 2.2, L.placa.esp, MAT.calcario, { p: [sx, D.h + .06 + 1.1, L.placa.z] }); scene.add(vazio); vazio.visible = false;
    R.slots.push({ i, x: sx, g, vazio, did: null, v: 0, nJ: 0, livros: [], prat: [], frisos: [] });
  });

  // pedestais do jogador: corpo de terracota, faixa negra do nome, valores 2 × 2; em cima, prateleira e busto
  const pd = L.ped;
  pd.x.forEach((px, k) => {
    const g = new THREE.Group(); g.position.set(px, 0, pd.z); scene.add(g);
    const c = tela(512, 292), tex = texCanvas(c);
    const face = new THREE.MeshStandardMaterial({ map: tex, roughness: .78, envMapIntensity: .25, emissive: new THREE.Color('#58c6ee'), emissiveIntensity: 0 });
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(pd.w, pd.h, pd.d), [MAT.terracota, MAT.terracota, MAT.terracota, MAT.terracota, face, MAT.terracota]);
    corpo.position.y = pd.h / 2; corpo.castShadow = true; corpo.receiveShadow = true; g.add(corpo); contorno(corpo, pd.w, pd.h, pd.d);
    caixaC(pd.w + .1, .08, pd.d + .08, MAT.verniz, { p: [0, pd.h + .04, 0], em: g });
    caixaC(pd.w - .12, .07, .04, MAT.madeira, { p: [0, PED_H + .035, pd.d / 2 - .04], em: g });   // beiral da prateleira
    // busto (plano com recorte), atrás da prateleira
    const bg = new THREE.PlaneGeometry(pd.busto[0], pd.busto[1]); bg.translate(0, pd.busto[1] / 2, 0);
    const mb = new THREE.MeshStandardMaterial({ alphaTest: .5, roughness: .7, envMapIntensity: .2, emissive: new THREE.Color('#58c6ee'), emissiveIntensity: 0 });
    const busto = new THREE.Mesh(bg, mb); busto.position.set(px - .12, PED_H - .02, pd.z - .12); busto.rotation.x = -.18; busto.castShadow = true; busto.visible = false; scene.add(busto);
    const s = { P: 0, k, id: null, on: null, chave: '', esc: pd.fig, g, tela: c, tex, face, busto, matBusto: mb, base: new V3(px - .12, PED_H, pd.z - .12),
      pilhaPos: new V3(px - pd.w / 2 + .12, PED_H, pd.z + pd.d / 2 - .2), pilha: [], larg: pd.w - .62, vaga: .14, espM: .12, alt: .4, prof: .24 };
    s.ancora = new THREE.Object3D(); s.ancora.position.copy(s.base); scene.add(s.ancora);
    R.meus.push(s); pintarPedestal(s); R.emis['seat:' + k] = [face, mb];
  });

  // Bibliotecas: a do jogador ao lado dos pedestais; as dos adversários nas laterais, junto aos estandartes
  R.bibs[0] = criarBiblioteca(0, L.bib.eu[0], L.bib.eu[1], 0, 0, L.bib.w);
  L.bib.op.forEach((e, i) => { R.bibs[i + 1] = criarBiblioteca(i + 1, e[0], e[1], 0, G.y + .14, L.bib.wop); });

  // coro, atrás do parapeito da galeria: só cabeças e braços aparecem
  const tx = [coristaTex(0), coristaTex(1)], mc = tx.map(t => new THREE.MeshStandardMaterial({ map: t, alphaTest: .5, roughness: .7, side: THREE.DoubleSide, envMapIntensity: .2 }));
  const gc = new THREE.PlaneGeometry(1.15, 1.72); gc.translate(0, .86, 0);
  for (let i = 0; i < 19; i++) {
    const fila = i % 2, m = new THREE.Mesh(gc, mc[i % 2]), y = G.y + .55 + fila * .45;
    m.position.set((i - 9) * .95 + fila * .3, y, G.zb - .5 - fila * .9); m.userData = { y, i, s: .85 + rnd(i) * .2 }; m.scale.setScalar(m.userData.s);
    pl.add(m); R.coro.push(m);
  }
  for (let i = 0; i < 2; i++) caixa(w + 2, G.y + .4 + i * .45, .9, MAT.silhar, { p: [0, (G.y + .4 + i * .45) / 2, G.zb - .5 - i * .9], em: pl });
}
function criarCarta(s) {
  const w = 1.1 * s.esc, h = 1.5 * s.esc, geo = placa(retArred(w, h, .07 * s.esc), w, h, .05 * s.esc);
  const face = new THREE.MeshStandardMaterial({ roughness: .62, envMapIntensity: .3, emissive: new THREE.Color('#58c6ee'), emissiveIntensity: 0 });
  const m = new THREE.Mesh(geo, [face, MAT.madeiraClara]); m.castShadow = true; m.receiveShadow = true; m.visible = false;
  m.position.copy(s.base); m.rotation.x = -.09; scene.add(m); s.carta = m; s.matCarta = face;
  s.ancora = new THREE.Object3D(); s.ancora.position.copy(s.base); scene.add(s.ancora);
  R.emis['op:' + s.P + ':' + s.k] = [face];
}
// Biblioteca compacta: um móvel baixo e claro; os livros ficam em pé por cima, em duas fileiras escalonadas
function criarBiblioteca(P, x, z, rot, y0, w) {
  const g = new THREE.Group(); g.position.set(x, y0 || 0, z); g.rotation.y = rot || 0; scene.add(g);
  const m = MAT.madeiraClara.clone(); m.emissive = new THREE.Color('#58c6ee'); m.emissiveIntensity = 0;
  caixaC(w, .5, .72, m, { p: [0, .25, 0], em: g });
  caixaC(w, .2, .3, m, { p: [0, .6, -.21], em: g });                 // degrau da fileira de trás
  caixaC(w + .06, .05, .76, MAT.verniz, { p: [0, .525, 0], em: g });
  caixaC(w, .07, .04, MAT.madeira, { p: [0, .56, .34], em: g });     // beiral
  R.emis[P === 0 ? 'bib' : 'bibop:' + P] = [m];
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

// ---------- placas: prateleiras por jogador ----------
function montarPlaca(slot, nJ) {
  const g = slot.g; while (g.children.length) g.remove(g.children[0]);
  const P = L.placa, geo = geoPlaca(nJ), c = tela(512, Math.round(512 * geo.H / P.w)), tex = texCanvas(c);
  const face = new THREE.MeshStandardMaterial({ map: tex, roughness: .82, envMapIntensity: .25, emissive: new THREE.Color('#58c6ee'), emissiveIntensity: 0 });
  const quadro = new THREE.Mesh(new THREE.BoxGeometry(P.w, geo.H, P.esp), [MAT.madeira, MAT.madeira, MAT.madeira, MAT.madeira, face, MAT.madeira]);
  quadro.position.y = geo.H / 2; quadro.castShadow = true; quadro.receiveShadow = true; g.add(quadro); contorno(quadro, P.w, geo.H, P.esp);
  // moldura: pilastras laterais com caneluras e cornija
  [-1, 1].forEach(s => caixaC(P.lado + .04, geo.H + .02, P.esp + .12, MAT.marmore, { p: [s * (P.w / 2 - P.lado / 2 + .02), geo.H / 2, .02], em: g }));
  caixaC(P.w + .3, .14, P.esp + .26, MAT.marmorePolido, { p: [0, geo.H + .07, .02], em: g });
  caixaC(P.w + .2, .12, P.esp + .22, MAT.marmore, { p: [0, .06, .03], em: g });
  slot.geo = geo; slot.tela = c; slot.tex = tex; slot.face = face; slot.nJ = nJ; slot.livros = []; slot.prat = []; slot.frisos = [];
  geo.linhas.forEach((ln, p) => {
    const lw = geo.xb1 - geo.xb0 + .14, mp = MAT.madeira.clone(); mp.emissive = new THREE.Color('#58c6ee'); mp.emissiveIntensity = 0;
    caixaC(lw, .05, .3, mp, { p: [(geo.xb0 + geo.xb1) / 2, ln.yB + .025, P.esp / 2 + .15], em: g });
    const fr = new THREE.MeshStandardMaterial({ color: S.players[p] ? S.players[p].cor : '#888', roughness: .6, emissive: new THREE.Color('#f3c552'), emissiveIntensity: 0 });
    caixa(lw, .05, .02, fr, { p: [(geo.xb0 + geo.xb1) / 2, ln.yB + .025, P.esp / 2 + .31], em: g, sombra: false });
    slot.livros.push([]); slot.prat.push(mp); slot.frisos.push(fr);
    R.emis['est:' + slot.i + ':' + p] = [mp];
  });
  R.emis['deb:' + slot.i] = [face];
  Object.keys(R.halos).forEach(k => { if (/^(deb|est):/.test(k)) { R.halos[k].forEach(m => scene.remove(m)); delete R.halos[k]; } });
}
function medirPrat(slot) { slot.fil = fileira(2 * slot.v, slot.geo.xb1 - slot.geo.xb0, .3, .2); }
function ajustarPrat(slot, p, n) {
  if (!slot.livros[p]) return;
  const ln = slot.geo.linhas[p];
  ajustarFileira(slot.livros[p], n, slot.g, { P: p, x0: slot.geo.xb0, y: ln.yB + .05, z: L.placa.esp / 2 + .15, f: slot.fil, alt: .36, prof: .24, sem: slot.i * 97 + p * 31 });
}
// livros do filósofo (na prateleira do pedestal ou no beiral da galeria)
function ajustarPilha(s, n, P) {
  const f = fileira(Math.max(n, 1), s.larg, s.vaga, s.espM);
  ajustarFileira(s.pilha, n, scene, { P, x0: s.pilhaPos.x - (P === 0 ? 0 : s.larg / 2), y: s.pilhaPos.y, z: s.pilhaPos.z, f, alt: s.alt, prof: s.prof, sem: s.k * 53 + P * 17 });
  s.fimPilha = s.pilhaPos.x - (P === 0 ? 0 : s.larg / 2) + (n ? f.x(n - 1) + f.vaga / 2 : 0);
}
// Biblioteca: fileira da frente e a de trás, no degrau; doze por fileira antes de apertar
function ajustarBib(b, n) {
  b.frente = b.frente || []; b.tras = b.tras || [];
  const cap = 12, nf = n <= cap ? n : n <= 2 * cap ? cap : Math.ceil(n / 2), nt = n - nf, larg = b.w - .2;
  ajustarFileira(b.frente, nf, b.g, { P: b.P, x0: -larg / 2, y: .55, z: .14, f: fileira(Math.max(nf, cap), larg, .2, .1), alt: .42, prof: .22, sem: b.P * 71 });
  ajustarFileira(b.tras, nt, b.g, { P: b.P, x0: -larg / 2, y: .7, z: -.21, f: fileira(Math.max(nt, cap), larg, .2, .1), alt: .42, prof: .22, sem: b.P * 71 + 500 });
  b.n = n;
}

// ---------- estado do jogo → cena ----------
function sync(estado, ocultos) {
  if (!scene) return; S = estado; OC = ocultos || {};
  if (!S) return;
  const nJ = S.players.length, on = {}; S.debates.forEach(d => { on[BF.DEB[d.id].area] = 1; });
  R.slots.forEach((slot, i) => {
    if (slot.nJ !== nJ) { montarPlaca(slot, nJ); slot.did = null; }
    const d = S.debates[i];
    if (!d) { slot.did = null; slot.g.visible = false; slot.vazio.visible = true; slot.livros.forEach((l, p) => { if (slot.fil) ajustarPrat(slot, p, 0); }); return; }
    slot.g.visible = true; slot.vazio.visible = false;
    const q = BF.DEB[d.id];
    if (slot.did !== d.id) { slot.did = d.id; slot.v = q.valor; medirPrat(slot); slot.livros.forEach((l, p) => ajustarPrat(slot, p, 0)); pintarPlaca(slot); }
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
  [1, 2].forEach(p => { if (S.players[p]) R.ops[p].forEach((s, k) => ocupar(s, S.players[p].group[k], p)); });
  S.players.forEach((pl, p) => { if (R.bibs[p]) ajustarBib(R.bibs[p], pl.library); });
  Object.values(R.ids).forEach(id => { if (!id.pintado && S.players[id.P]) { id.mat.color.set(S.players[id.P].cor); id.pintado = true; } });
  posicionar(true);
}
function ocupar(s, g, P) {
  const id = g ? g.id : null, boneco = !!(id && P === 0 && window.BF_BONECOS && window.BF_BONECOS[id]);
  if (P === 0) {
    if (s.id !== id) { s.id = id; if (id) { s.matBusto.map = texBusto(id); s.matBusto.needsUpdate = true; } }
    s.boneco = boneco;
    if (!s.fora) { s.busto.visible = !!id && !boneco; s.busto.position.copy(s.base); s.busto.rotation.set(-.18, 0, 0); s.busto.scale.setScalar(1); }
    if (id) { const inerte = !BF.ativo(g); s.matBusto.color.set(inerte ? '#b9bccb' : g.acted ? '#a8a49c' : '#ffffff'); s.matBusto.opacity = inerte ? .62 : 1;
      const tr = inerte; if (s.matBusto.transparent !== tr) { s.matBusto.transparent = tr; s.matBusto.alphaTest = tr ? .02 : .5; s.matBusto.needsUpdate = true; } }
  } else {
    if (s.id !== id) { s.id = id; if (id) { s.matCarta.map = texCarta(id); s.matCarta.needsUpdate = true; } }
    s.boneco = false;
    if (!s.fora) { s.carta.visible = !!id; s.carta.position.copy(s.base); s.carta.rotation.set(-.09, 0, 0); s.carta.scale.setScalar(1); }
    if (id) { const inerte = !BF.ativo(g); s.matCarta.color.set(inerte ? '#aeb2c0' : g.acted ? '#a8a49c' : '#ffffff'); s.matCarta.opacity = inerte ? .78 : 1; if (s.matCarta.transparent !== inerte) { s.matCarta.transparent = inerte; s.matCarta.needsUpdate = true; } }
  }
  ajustarPilha(s, g && !g.lib ? g.ideas : 0, P);
}

// ---------- câmera: estável, sem paralaxe; a distância e o deslocamento vertical enquadram as três faixas ----------
const cam = { alvo: new V3(), dist: 20, alvo0: new V3(), dist0: 20, offY: 0, tremor: 0, focado: false };
function aplicarCamera() {
  const p = L.cam.passo, t = cam.tremor ? (Math.sin(relogio * .09) * cam.tremor) : 0, t2 = cam.tremor ? (Math.cos(relogio * .13) * cam.tremor * .6) : 0;
  camera.position.set(cam.alvo.x + t, cam.alvo.y + Math.sin(p) * cam.dist + t2, cam.alvo.z + Math.cos(p) * cam.dist);
  camera.lookAt(cam.alvo); camera.updateMatrixWorld();
}
function enquadrar() {
  const W = innerWidth, H = innerHeight; renderer.setSize(W, H, false); camera.aspect = W / H; camera.clearViewOffset(); camera.updateProjectionMatrix();
  const mao = Math.min(150, H * .19), topo = 42, At = 1 - 2 * topo / H, Ab = -1 + 2 * mao / H, G = L.gal, pd = L.ped;
  const cima = [new V3(-5.8, G.y + .14 + 1.5 * G.esc, G.zf - .62), new V3(5.8, G.y + .14 + 1.5 * G.esc, G.zf - .62)];
  const baixo = [new V3(pd.x[0] - pd.w / 2, 0, pd.z + pd.d / 2 + .05), new V3(L.bib.eu[0] + L.bib.w / 2, 0, L.bib.eu[1] + .4)];
  const lados = [new V3(-6.4, L.dais.h, L.placa.z + .3), new V3(6.4, L.dais.h, L.placa.z + .3), new V3(-8.1, G.y, G.zf), new V3(8.1, G.y, G.zf), new V3(pd.x[0] - pd.w / 2 - .1, 0, pd.z + pd.d / 2), new V3(L.bib.eu[0] + L.bib.w / 2 + .1, 0, L.bib.eu[1] + .4)];
  const medir = dd => { cam.dist = dd; cam.alvo.copy(cam.alvo0); aplicarCamera(); let yt = -9, yb = 9, xm = 0;
    cima.forEach(p => { yt = Math.max(yt, _v.copy(p).project(camera).y); }); baixo.forEach(p => { yb = Math.min(yb, _v.copy(p).project(camera).y); });
    lados.forEach(p => { xm = Math.max(xm, Math.abs(_v.copy(p).project(camera).x)); }); return { yt, yb, xm }; };
  let a = 5, b = 120; for (let i = 0; i < 32; i++) { const m = (a + b) / 2, r = medir(m); if (r.yt - r.yb <= At - Ab && r.xm <= .985) b = m; else a = m; }
  const r = medir(b); cam.dist0 = b;
  cam.offY = Math.round(((At + Ab) / 2 - (r.yt + r.yb) / 2) * H / 2);   // positivo: o conteúdo sobe
  camera.setViewOffset(W, H, 0, cam.offY, W, H); camera.updateProjectionMatrix();
  cam.dist = cam.focado ? b * .6 : b;
  aplicarCamera(); posicionar(true);
}
function centroPlaca(i) { const s = R.slots[i]; return new V3(s.x, L.dais.h + .06 + (s.geo ? s.geo.H * .5 : 1.7), L.placa.z); }
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

// ---------- âncoras: onde fica cada elemento HTML invisível ----------
const _v = new V3(), _w = new V3();
function tela2(v) { _v.copy(v).project(camera); return { x: (_v.x * .5 + .5) * innerWidth, y: (-_v.y * .5 + .5) * innerHeight }; }
function retCaixa(x0, y0, z0, x1, y1, z1) {
  let l = 1e9, t = 1e9, r = -1e9, b = -1e9;
  for (let i = 0; i < 8; i++) { const p = tela2(_w.set(i & 1 ? x1 : x0, i & 2 ? y1 : y0, i & 4 ? z1 : z0)); l = Math.min(l, p.x); r = Math.max(r, p.x); t = Math.min(t, p.y); b = Math.max(b, p.y); }
  return { l, t, w: r - l, h: b - t };
}
function retFig(pos, w, h) {
  const a = tela2(new V3(pos.x - w / 2, pos.y, pos.z)), b = tela2(new V3(pos.x + w / 2, pos.y, pos.z)), c = tela2(new V3(pos.x, pos.y + h, pos.z));
  return { l: a.x, t: c.y, w: b.x - a.x, h: Math.max(a.y, b.y) - c.y };
}
// pontos locais de uma placa em coordenadas do mundo
function naPlaca(s, x, y, z) { return new V3(s.x + x, L.dais.h + .06 + y, L.placa.z + z); }
function ancora(chave) {
  const a = chave.split(':'), pd = L.ped, P = L.placa, G = L.gal;
  switch (a[0]) {
    case 'deb': { const s = R.slots[+a[1]], H = s.geo ? s.geo.H : 3.5, b = L.dais.h + .06; return retCaixa(s.x - P.w / 2, b, P.z, s.x + P.w / 2, b + H + .14, P.z + .4); }
    case 'est': { const s = R.slots[+a[1]], p = +a[2]; if (!s.geo || !s.geo.linhas[p]) return null; const ln = s.geo.linhas[p], b = L.dais.h + .06;
      return retCaixa(s.x + s.geo.xb0, b + ln.yB, P.z + P.esp / 2 + .3, s.x + s.geo.xb1, b + ln.yT - .06, P.z + P.esp / 2 + .3); }
    case 'lv': case 'lt': { const s = R.slots[+a[1]]; if (!s.fil || !s.geo) return null; const v = s.v, xx = a[0] === 'lv' ? (s.fil.x(v - 1) + s.fil.x(v)) / 2 : s.fil.x(2 * v - 1) + s.fil.vaga / 2;
      return tela2(naPlaca(s, s.geo.xb0 + xx, s.geo.linhas[0].yT + .02, P.esp / 2 + .02)); }
    case 'vago': { const s = R.slots[+a[1]]; return tela2(new V3(s.x, L.dais.h + 1.3, P.z + .2)); }
    case 'seat': { const x = pd.x[+a[1]]; return retCaixa(x - pd.w / 2, 0, pd.z - pd.d / 2, x + pd.w / 2, PED_H + pd.busto[1] * .95, pd.z + pd.d / 2); }
    case 'fig': { const s = R.meus[+a[2]]; return retFig(s.base, 1.3 * pd.fig, 1.5 * pd.fig); }
    case 'pilha': { const s = +a[1] === 0 ? R.meus[+a[2]] : R.ops[+a[1]][+a[2]];
      return +a[1] === 0 ? tela2(new V3(L.ped.x[+a[2]] + pd.w / 2 - .3, PED_H + .22, s.pilhaPos.z)) : tela2(new V3(s.pilhaPos.x + s.larg / 2 + .05, s.pilhaPos.y + .18, s.pilhaPos.z)); }
    case 'op': { const s = R.ops[+a[1]][+a[2]]; return retCaixa(s.base.x - .5 * s.esc * 1.1, s.base.y, s.base.z - .1, s.base.x + .5 * s.esc * 1.1, s.base.y + 1.5 * s.esc, s.base.z + .1); }
    case 'painel': { const id = R.ids[+a[1]]; return tela2(new V3(id.x, L.gal.y - .36, L.gal.zf + .12)); }
    case 'grupo': return retCaixa(pd.x[0] - pd.w / 2, 0, pd.z - pd.d / 2, pd.x[3] + pd.w / 2, PED_H + .3, pd.z + pd.d / 2);
    case 'bib': { const e = L.bib.eu; return retCaixa(e[0] - L.bib.w / 2, 0, e[1] - .3, e[0] + L.bib.w / 2, 1.0, e[1] + .4); }
    case 'bibop': { const e = L.bib.op[+a[1] - 1]; return tela2(new V3(e[0], L.gal.y + 1.15, e[1])); }
    case 'coro': { const p = tela2(new V3(0, G.y + 1.7, G.zb - .5)); p.y = Math.max(p.y, 64); return p; }
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
  const a = chave.split(':'), pd = L.ped, P = L.placa; let lista = [];
  const hz = (x, y, z, w, d) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), R.matHalo.clone()); m.rotation.x = -Math.PI / 2; m.position.set(x, y + .02, z); m.renderOrder = 4; m.visible = false; scene.add(m); return m; };
  const hv = (c, w, h) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), R.matHalo.clone()); m.position.copy(c); m.renderOrder = 4; m.visible = false; scene.add(m); return m; };
  if (a[0] === 'deb') { const s = R.slots[+a[1]]; lista = [hz(s.x, L.dais.h + .06, P.z + .75, P.w + 1, 1.3)]; }
  else if (a[0] === 'est') { const s = R.slots[+a[1]], ln = s.geo && s.geo.linhas[+a[2]]; if (ln) lista = [hv(naPlaca(s, (s.geo.xb0 + s.geo.xb1) / 2, (ln.yT + ln.yB) / 2, P.esp / 2 + .32), s.geo.xb1 - s.geo.xb0 + .5, P.prat + .2)]; }
  else if (a[0] === 'seat') lista = [hz(pd.x[+a[1]], 0, pd.z + .2, 2.9, 2.2)];
  else if (a[0] === 'grupo') lista = pd.x.map(x => hz(x, 0, pd.z + .2, 2.9, 2.2));
  else if (a[0] === 'op') { const s = R.ops[+a[1]][+a[2]]; lista = [hz(s.base.x, s.base.y, s.base.z + .2, 1.5, 1.1)]; }
  else if (a[0] === 'bib') lista = [hz(L.bib.eu[0], 0, L.bib.eu[1] + .1, 2.6, 1.8)];
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
let luzK = 1, ultimo = 0, coroTipo = null, coroAte = 0;
function quadro(agora) {
  ultimo = agora; relogio = agora; avancar(agora);
  const quer = document.body.classList.contains('escolhendo') ? .6 : 1; luzK += (quer - luzK) * .12;
  sol.intensity = 3.1 * luzK; hemi.intensity = 1.15 * (.4 + .6 * luzK); renderer.toneMappingExposure = 1.05 * (.75 + .25 * luzK);
  // coro: parado em espera; aplauso pula; vaia nega; murmúrio oscila (só quando há cena)
  const tp = agora < coroAte ? coroTipo : null;
  if (tp || R.coroMexeu) { R.coroMexeu = !!tp; R.coro.forEach(m => { const u = m.userData, f = agora * .001 + u.i * .7;
    m.position.y = u.y + (tp === 'aplauso' ? Math.abs(Math.sin(f * 9)) * .3 : 0);
    m.rotation.z = tp === 'vaia' ? Math.sin(f * 16) * .2 : tp === 'murmurio' ? Math.sin(f * 4.5) * .09 : 0; }); }
  aplicarCamera(); atualizarRealces(); posicionar(false);
  if (window.M3D && M3D.aoQuadro) M3D.aoQuadro();
  renderer.render(scene, camera);
}
function laco(t) { requestAnimationFrame(laco); quadro(t); }

// ---------- peças de coreografia ----------
function figura(P, id) {
  const lista = P === 0 ? R.meus : R.ops[P]; if (!lista) return null;
  const s = lista.find(x => x.id === id); if (!s) return null;
  return { s, boneco: s.boneco, obj: s.boneco ? s.ancora : (P === 0 ? s.busto : s.carta), casa: s.base.clone(), esc: s.esc };
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
  const s = slotDe(did); if (!s || !s.geo || !s.geo.linhas[P]) return null; const n = s.livros[P].length, ln = s.geo.linhas[P];
  return naPlaca(s, s.geo.xb0 + s.fil.x(Math.min(n, 2 * s.v - 1)), ln.yB + .25, L.placa.esp / 2 + .15);
}
// ponto no tablado, diante da placa, abaixo da prateleira do jogador
function peTorre(did, P, lado) {
  const s = slotDe(did); if (!s) return null;
  return new V3(s.x + (P - (s.nJ - 1) / 2) * .95 + (lado || 0), L.dais.h + .06, L.placa.z + L.placa.esp / 2 + .62);
}
// um livro entra na prateleira (ideia que chega)
function cairLivro(did, P) {
  const s = slotDe(did); if (!s || !s.livros[P]) return Promise.resolve();
  if (s.livros[P].length >= 2 * s.v) return Promise.resolve();
  ajustarPrat(s, P, s.livros[P].length + 1);
  const b = s.livros[P][s.livros[P].length - 1], y = b.position.y;
  return tween(T(300), k => { b.position.y = y + (1 - k) * 1.1; b.rotation.z = (1 - k) * .4; }, E.in).then(() => tween(T(140), k => { b.position.y = y + Math.sin(k * Math.PI) * .03; b.rotation.z = 0; }, E.lin));
}
// livros saem pela ponta da prateleira e caem no tablado (ideias perdidas)
function derrubar(did, P, n) {
  const s = slotDe(did); if (!s || !n || !s.livros[P]) return;
  const lista = s.livros[P], ln = s.geo.linhas[P];
  lista.forEach((b, i) => { const r = b.rotation.z; tween(T(460), k => { b.rotation.z = r + Math.sin(k * Math.PI * 3) * .06 * (1 - k); }, E.lin); });
  for (let i = 0; i < Math.min(n, 9); i++) {
    const k0 = Math.max(0, lista.length - 1 - i), de = naPlaca(s, s.geo.xb0 + s.fil.x(k0), ln.yB + .23, L.placa.esp / 2 + .15);
    const b = novoLivroPe(P, k0), lado = (i % 2 ? 1 : -1) * (.3 + Math.random() * .6), zz = .6 + Math.random() * .6, chao = L.dais.h + .1;
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
    const m = new THREE.Mesh(o.geo || R.geoPalha, mat3), an = Math.random() * 6.3, d = .5 + Math.random() * 1.2, up = .6 + Math.random() * 1.2, chao = pos.y > 1 ? L.dais.h : 0;
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
function coro(tipo, ms) { coroTipo = tipo; coroAte = performance.now() + (ms || 1700); }
// livros novos chegando à Biblioteca (ideias do turno)
function chegarEstante(P, n) {
  const b = R.bibs[P]; if (!b) return;
  const todos = (b.frente || []).concat(b.tras || []);
  todos.slice(-Math.min(n, todos.length)).forEach((l, i) => { const y = l.position.y; l.position.y = y + .9; l.visible = false; tween(T(420), k => { l.visible = true; l.position.y = y + (1 - k) * .9; }, E.tranco, T(i * 90)); });
}
function mundoEstante(P) { const b = R.bibs[P]; return b.g.localToWorld(new V3(0, .9, .1)); }
function mundoPilha(P, id) { const f = figura(P, id); if (!f) return null; const s = f.s; return new V3(s.fimPilha || s.pilhaPos.x, s.pilhaPos.y + s.alt * .7, s.pilhaPos.z); }
// clarão breve na figura (poder que dispara, dupla clássica)
function brilhar(P, id, cor) {
  const f = figura(P, id); if (!f) return;
  const ms = P === 0 ? [f.s.matBusto, f.s.face] : [f.s.matCarta], c = new THREE.Color(cor || '#f3c552');
  tween(T(1100), k => { ms.forEach(m => { m.emissive.copy(c); m.emissiveIntensity = Math.sin(k * Math.PI) * .6; }); }, E.lin).then(() => ms.forEach(m => { m.emissiveIntensity = 0; }));
}
function qualidade(q) { renderer.setPixelRatio(q.pixel || 1); renderer.shadowMap.enabled = q.sombras !== false; scene.traverse(o => { if (o.material) [].concat(o.material).forEach(m => { m.needsUpdate = true; }); }); enquadrar(); }
function fora(P, id, sim) { const f = figura(P, id); if (f) f.s.fora = sim; }

// ---------- partida ----------
function iniciar() {
  const cv = document.getElementById('gl');
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { document.body.classList.add('sem3d'); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
  scene = new THREE.Scene(); scene.background = new THREE.Color('#f1cfa6'); scene.fog = new THREE.Fog('#f1cfa6', 40, 160);
  scene.environment = criarAmbiente();
  camera = new THREE.PerspectiveCamera(L.cam.fov, innerWidth / innerHeight, .5, 600);
  cam.alvo0.set(L.cam.alvo[0], L.cam.alvo[1], L.cam.alvo[2]); cam.alvo.copy(cam.alvo0);
  MAT = criarMateriais(); anisotropia(Math.min(8, renderer.capabilities.getMaxAnisotropy()));
  R.geoLivro = new THREE.BoxGeometry(L.livro.w, 1, L.livro.d); R.geoLivroPe = new THREE.BoxGeometry(1, 1, 1);
  R.geoPalha = new THREE.BoxGeometry(.3, .025, .025); R.geoPagina = new THREE.PlaneGeometry(.34, .44);
  R.matPagina = new THREE.MeshStandardMaterial({ map: MAT.pergaminho.map, side: THREE.DoubleSide, roughness: .9 });
  const ch = tela(128, 128), xh = ch.getContext('2d'), gh = xh.createRadialGradient(64, 64, 20, 64, 64, 64); gh.addColorStop(0, 'rgba(255,255,255,.0)'); gh.addColorStop(.55, 'rgba(255,255,255,.75)'); gh.addColorStop(.75, 'rgba(255,255,255,.35)'); gh.addColorStop(1, 'rgba(255,255,255,0)');
  xh.fillStyle = gh; xh.fillRect(0, 0, 128, 128);
  R.matHalo = new THREE.MeshBasicMaterial({ map: texCanvas(ch), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true, fog: false, toneMapped: false });
  // luz: um só sol poente (direita), mais o céu; um pouco mais de luz de céu para os livros nas prateleiras
  sol = new THREE.DirectionalLight('#ffd3a4', 3.1); sol.position.copy(SOL).multiplyScalar(40).add(new V3(0, 0, -1)); sol.target.position.set(0, 0, -1); scene.add(sol, sol.target);
  sol.castShadow = true; sol.shadow.mapSize.set(2048, 2048); const sc = sol.shadow.camera; sc.left = -17; sc.right = 17; sc.top = 14; sc.bottom = -14; sc.near = 5; sc.far = 90; sol.shadow.bias = -.0006; sol.shadow.normalBias = .03; sol.shadow.radius = 3.5;
  hemi = new THREE.HemisphereLight('#c9d4ff', '#c79a6a', 1.15); scene.add(hemi);
  const frente = new THREE.DirectionalLight('#fff1dc', .55); frente.position.set(-2, 6, 20); scene.add(frente);   // luz de preenchimento vinda da plateia
  montar();
  addEventListener('resize', enquadrar); enquadrar();
  requestAnimationFrame(laco);
  setInterval(() => { const a = performance.now(); if (a - ultimo > 180) avancar(a); }, 90);   // aba em segundo plano: as cenas não travam
  if (document.fonts && document.fonts.load) {
    const tudo = () => { repintar.forEach(f => f()); R.slots.forEach(s => { if (s.did) pintarPlaca(s); }); R.meus.forEach(pintarPedestal); };
    Promise.all(["700 40px 'Alegreya'", "900 40px 'Alegreya'", "500 40px 'Alegreya'", "800 40px 'Alegreya Sans'", "900 40px 'Alegreya Sans'"].map(f => document.fonts.load(f).catch(() => 0))).then(tudo);
    if (document.fonts.ready) document.fonts.ready.then(tudo);
  }
  API.pronto = true; document.body.classList.add('com3d');
  if (window.__bf && window.__bf.S) window.__bf.render();
}

const API = {
  pronto: false, sync, posicionar, foco, desfoco, tremer, tela: tela2, retFig, L, E, tween,
  figura, arco, andar, tranco, fora, brilhar, cairLivro, derrubar, livroVoa, papiro, espantalho, particulas, chuva, coro, chegarEstante,
  topoTorre, peTorre, mundoEstante, mundoPilha, slotDe, qualidade,
  palha: pos => particulas(pos, 14, MAT.palha), V3,
  get camera() { return camera; }, get cena() { return scene; }, get R() { return R; },
};
window.M3D = API;
iniciar();
