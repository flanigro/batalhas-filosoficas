/* Batalhas Filosóficas — a mesa em Three.js
 *
 * COMO FUNCIONA
 * - A cena 3D é só o TABULEIRO: plataforma, estelas, torres de livros, pedestais, bancos, estantes, árvores,
 *   fundo e luz. Cartas da mão, telas de texto, balões e botões continuam em HTML, por cima do canvas.
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
const L = {
  plat: { hw: 7.9, zf: 5.0, zb: -7.3, borda: .2, faixa: .9, degrau: .3 },   // meia largura, frente, fundo
  chao: -1.7,
  estela: { x: [-3.85, 0, 3.85], z: -2.2, w: 3.4, h: 3.2, t: .34, arco: .8 },
  torre: { dz: 1.15, dx: [-1.08, 0, 1.08], H: 1.35 },                       // dz: à frente da estela
  ped: { x: [-4.75, -1.95, .85, 3.65], z: 2.85, w: 1.4, h: .8, tras: -.45, frente: .8, topo: .1, fig: .86 },   // face da frente inclinada, como estante de leitura
  estrado: { h: 1.9, zf: -4.7 },
  banco: { x: [-3.95, 3.95], z: -6.1, w: 6.4, passo: 1.5 },
  estante: { eu: [6.3, 2.35, -.42], op: [[-6.95, -3.1, .62], [6.95, -3.1, -.62]] },
  livro: { w: .74, d: .5 },
  cam: { fov: 62, passo: 30 * Math.PI / 180, alvo: [0, 1.3, -1.3] },
};
const PED_H = L.ped.h + .21;                 // altura total do pedestal (base + corpo + tampo)
const SOL = new V3(1, .62, .5).normalize();  // de onde vem a luz: direita, baixa, um pouco da frente

let renderer, scene, camera, MAT, sol, hemi, relogio = 0;
const R = { slots: [], meus: [], ops: {}, estantes: {}, livroMat: {}, coro: [], halos: {}, emis: {} };
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

// ---------- texturas com texto: estela e face do pedestal ----------
function pintarEstela(slot, did) {
  const c = slot.tela, x = c.getContext('2d'), W = c.width, H = c.height, q = BF.DEB[did], a = BF.AREA[q.area];
  recorteMarmore(x, W, H, slot.i * 7 + 3);
  const yArco = H * (L.estela.arco / L.estela.h);
  // faixa pintada na cor da área (pigmento gasto) com o nome da área
  x.globalCompositeOperation = 'multiply'; x.fillStyle = a.cor; x.globalAlpha = .86; x.fillRect(0, yArco + 6, W, 58); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  x.fillStyle = 'rgba(255,255,255,.5)'; x.fillRect(0, yArco + 4, W, 2); x.fillRect(0, yArco + 64, W, 2);
  x.fillStyle = 'rgba(60,40,20,.45)'; x.fillRect(0, yArco + 2, W, 2); x.fillRect(0, yArco + 66, W, 2);
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#fffaf0'; let pa = 31; x.font = FONTE(800, pa, true);
  while (x.measureText(a.nome.toUpperCase()).width > W - 44 && pa > 16) { pa--; x.font = FONTE(800, pa, true); }
  x.fillText(a.nome.toUpperCase(), W / 2, yArco + 37);
  // medalhão de bronze com o valor, no arco
  const mx = W / 2, my = yArco * .56, mr = yArco * .4, g = x.createRadialGradient(mx + mr * .35, my - mr * .4, mr * .1, mx, my, mr);
  g.addColorStop(0, '#f6d98a'); g.addColorStop(.55, '#c8962a'); g.addColorStop(1, '#7a5512');
  x.fillStyle = 'rgba(40,25,10,.35)'; x.beginPath(); x.arc(mx - 4, my + 5, mr + 2, 0, 7); x.fill();
  x.fillStyle = g; x.beginPath(); x.arc(mx, my, mr, 0, 7); x.fill();
  x.strokeStyle = '#5c3f0c'; x.lineWidth = 3; x.stroke(); x.strokeStyle = 'rgba(255,240,190,.7)'; x.lineWidth = 2; x.beginPath(); x.arc(mx, my, mr - 7, 0, 7); x.stroke();
  x.font = FONTE(900, mr * 1.25); gravar(x, String(q.valor), mx, my + 4, '#3a2606');
  // a pergunta, gravada
  const topo = yArco + 82, alt = H * .33, larg = W - 70; let px = 78, lin = null;
  for (; px >= 34; px -= 4) { x.font = FONTE(700, px); lin = quebrar(x, q.q, larg, 3); if (lin && lin.length * px * 1.06 <= alt) break; }
  if (!lin) { x.font = FONTE(700, 34); lin = quebrar(x, q.q, larg, 9) || [q.q]; }
  const lh = px * 1.06, y0 = topo + (alt - lin.length * lh) / 2 + lh / 2;
  lin.forEach((l, i) => gravar(x, l, W / 2, y0 + i * lh));
  // moldura rebaixada
  x.strokeStyle = 'rgba(70,52,34,.35)'; x.lineWidth = 2; x.strokeRect(16, yArco + 76, W - 32, H - yArco - 92);
  slot.tex.needsUpdate = true;
}
function pintarPedestal(seat) {
  const c = seat.tela, x = c.getContext('2d'), W = c.width, H = c.height;
  recorteMarmore(x, W, H, seat.k * 11 + 5);
  x.strokeStyle = 'rgba(70,52,34,.4)'; x.lineWidth = 3; x.strokeRect(12, 12, W - 24, H - 24); x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 2; x.strokeRect(15, 15, W - 30, H - 30);
  if (seat.id) {
    const ca = BF.C(seat.id);
    x.textAlign = 'center'; x.textBaseline = 'middle'; let px = 78; x.font = FONTE(900, px);
    while (x.measureText(ca.nome).width > W - 56 && px > 30) { px -= 2; x.font = FONTE(900, px); }
    gravar(x, ca.nome, W / 2, 64);
    x.fillStyle = 'rgba(70,52,34,.4)'; x.fillRect(34, 112, W - 68, 2); x.fillStyle = 'rgba(255,255,255,.6)'; x.fillRect(34, 114, W - 68, 2);
    BF.AREAS.forEach((a, i) => {
      const ar = BF.AREA[a], cx = (i % 2) * (W / 2 - 8) + 70, cy = 178 + Math.floor(i / 2) * 104, on = seat.on && seat.on[a];
      x.globalAlpha = on ? 1 : .7; x.fillStyle = 'rgba(40,25,10,.35)'; x.beginPath(); x.arc(cx - 3, cy + 4, 46, 0, 7); x.fill();
      x.fillStyle = ar.cor; x.beginPath(); x.arc(cx, cy, 45, 0, 7); x.fill(); x.globalAlpha = 1;
      if (on) { x.strokeStyle = '#f6d98a'; x.lineWidth = 6; x.beginPath(); x.arc(cx, cy, 45, 0, 7); x.stroke(); }
      x.fillStyle = '#fff'; x.font = FONTE(800, 64, true); x.textAlign = 'center'; x.fillText(ca.vals[a], cx, cy + 4);
      let fp = 38; x.font = FONTE(on ? 700 : 500, fp); x.textAlign = 'left'; const larg = W / 2 - 8 - 56 - 64; const rot = { meta: 'Metaf.', logica: 'Lógica', etica: 'Ética', psico: 'Psic.' }[a] || ar.curto; while (x.measureText(rot).width > larg && fp > 24) { fp -= 1; x.font = FONTE(on ? 700 : 500, fp); } gravar(x, rot, cx + 56, cy + 2, on ? 'rgba(48,34,22,.95)' : 'rgba(80,66,52,.72)');
    });
  }
  seat.tex.needsUpdate = true;
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
function cipreste(alt, raio, semente) {
  const g = new THREE.Group(), pts = [];
  for (let i = 0; i <= 14; i++) { const t = i / 14; pts.push(new THREE.Vector2(raio * Math.pow(Math.sin(Math.PI * Math.min(1, t * .96 + .04)), .7) * (1 - t * .25) + .02, t * alt)); }
  const geo = new THREE.LatheGeometry(pts, 22), p = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x), k = 1 + (rnd(Math.round(a * 7) + Math.round(y * 3.1) * 13 + semente) - .5) * .34;
    p.setXYZ(i, x * k, y + (rnd(i + semente) - .5) * .12, z * k); uv.setXY(i, uv.getX(i) * raio * 6.3, uv.getY(i) * alt);
  }
  geo.computeVertexNormals();
  const copa = new THREE.Mesh(geo, MAT.cipreste); copa.position.y = .7; copa.castShadow = true; copa.receiveShadow = true; g.add(copa);
  cilindro(.1, .16, 1, MAT.casca, 8, { p: [0, .4, 0], em: g });
  return g;
}
function folhagemTex() {
  const c = tela(256, 256), x = c.getContext('2d');
  for (let r = 0; r < 7; r++) {
    const ox = 128 + (rnd(r * 9) - .5) * 90, oy = 128 + (rnd(r * 9 + 1) - .5) * 90, an = rnd(r * 9 + 2) * 6.3, comp = 80 + rnd(r * 9 + 3) * 40;
    x.save(); x.translate(ox, oy); x.rotate(an); x.strokeStyle = '#6a5a44'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(-comp / 2, 0); x.quadraticCurveTo(0, -8, comp / 2, 0); x.stroke();
    for (let i = 0; i < 16; i++) {
      const t = i / 15, px = -comp / 2 + t * comp, lado = i % 2 ? 1 : -1, cl = rnd(r * 31 + i);
      x.save(); x.translate(px, -8 * Math.sin(t * Math.PI) * .5); x.rotate(lado * (.7 + rnd(i + r) * .5));
      x.fillStyle = cl < .33 ? '#7f9160' : cl < .66 ? '#a7b48a' : '#5d7347'; x.beginPath(); x.ellipse(15, 0, 17, 4.6, 0, 0, 7); x.fill();
      x.strokeStyle = 'rgba(230,236,210,.5)'; x.lineWidth = 1; x.beginPath(); x.moveTo(0, 0); x.lineTo(30, 0); x.stroke(); x.restore();
    }
    x.restore();
  }
  return texCanvas(c);
}
function oliveira(semente) {
  const g = new THREE.Group();
  const ramo = (pts, r0, r1) => { const cur = new THREE.CatmullRomCurve3(pts.map(p => new V3(p[0], p[1], p[2]))), geo = new THREE.TubeGeometry(cur, 14, 1, 9);
    const P = geo.attributes.position, N = geo.attributes.normal; for (let i = 0; i < P.count; i++) { const t = Math.floor(i / 10) / 14, r = r0 + (r1 - r0) * t - 1 + (rnd(i * 3 + semente) - .5) * .06; P.setXYZ(i, P.getX(i) + N.getX(i) * r, P.getY(i) + N.getY(i) * r, P.getZ(i) + N.getZ(i) * r); }
    geo.computeVertexNormals(); const m = new THREE.Mesh(geo, MAT.casca); m.castShadow = true; m.receiveShadow = true; g.add(m); };
  ramo([[0, 0, 0], [.12, 1, .05], [-.1, 1.9, .1], [.15, 2.7, 0]], .42, .24);
  ramo([[0, 2, .08], [.8, 2.9, .3], [1.6, 3.5, .3]], .2, .07); ramo([[.1, 2.6, 0], [-.7, 3.4, -.2], [-1.3, 4.1, -.1]], .2, .07); ramo([[.12, 2.7, 0], [.3, 3.6, .5], [.2, 4.4, .9]], .18, .06);
  const n = 700, geo = new THREE.PlaneGeometry(.9, .9), matF = new THREE.MeshStandardMaterial({ map: folhagemTex(), alphaTest: .45, side: THREE.DoubleSide, roughness: .8, envMapIntensity: .3 });
  const im = new THREE.InstancedMesh(geo, matF, n), o = new THREE.Object3D(), cor = new THREE.Color();
  const copas = [[1.5, 3.7, .3, 1.5], [-1.2, 4.2, -.1, 1.5], [.2, 4.7, .8, 1.4], [.2, 3.9, -.7, 1.3], [.1, 5.2, 0, 1.1]];
  for (let i = 0; i < n; i++) {
    const c = copas[i % copas.length], a = rnd(i * 3 + semente) * 6.3, b = Math.acos(2 * rnd(i * 3 + 1 + semente) - 1), r = c[3] * Math.pow(rnd(i * 3 + 2 + semente), .4);
    o.position.set(c[0] + r * Math.sin(b) * Math.cos(a), c[1] + r * Math.cos(b) * .72, c[2] + r * Math.sin(b) * Math.sin(a));
    o.rotation.set(rnd(i + 9) * 6.3, rnd(i + 19) * 6.3, rnd(i + 29) * 6.3); const s = .7 + rnd(i + 39) * .7; o.scale.set(s, s, s); o.updateMatrix(); im.setMatrixAt(i, o.matrix);
    const k = .5 + rnd(i + 49) * .32; cor.setRGB(k, k, k * .9); im.setColorAt(i, cor);
  }
  im.instanceColor.needsUpdate = true; im.castShadow = true; im.receiveShadow = true; g.add(im);
  return g;
}

// ---------- coro: figuras negras de cerâmica, de braços erguidos (provisórias) ----------
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
function montar() {
  const P = L.plat, w = P.hw * 2, d = P.zf - P.zb, zc = (P.zf + P.zb) / 2;
  scene.add(criarFundo());
  // chão
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), MAT.terra); chao.geometry.attributes.uv.array.forEach((v, i, a) => { a[i] = v * 400; });
  chao.rotation.x = -Math.PI / 2; chao.position.y = L.chao; chao.receiveShadow = true; scene.add(chao);
  // plataforma: dois degraus, faixa de caneluras, cornija e piso
  const pl = new THREE.Group(); scene.add(pl);
  caixa(w + 2, P.degrau, d + 2, MAT.calcario, { p: [0, L.chao + P.degrau / 2, zc], em: pl });
  caixa(w + 1, P.degrau, d + 1, MAT.calcario, { p: [0, L.chao + P.degrau * 1.5, zc], em: pl });
  const yF = -P.borda - P.faixa / 2; caixa(w, P.faixa, d, MAT.caneluras, { p: [0, yF, zc], em: pl });
  caixa(w + .3, P.borda, d + .3, MAT.marmore, { p: [0, -P.borda / 2, zc], em: pl });
  const piso = new THREE.Mesh(new THREE.PlaneGeometry(w + .3, d + .3), criarPiso(w + .3, d + .3)); piso.rotation.x = -Math.PI / 2; piso.position.set(0, .004, zc); piso.receiveShadow = true; pl.add(piso);

  // estrado do fundo, com escada no meio, e os dois bancos dos oponentes
  const E = L.estrado, ed = E.zf - P.zb;
  caixa(w - .3, E.h, ed, MAT.silhar, { p: [0, E.h / 2, P.zb + ed / 2 + .05], em: pl });
  caixa(w - .1, .14, ed + .14, MAT.marmore, { p: [0, E.h + .07, P.zb + ed / 2 + .05], em: pl });
  for (let i = 0; i < 3; i++) caixa(2.4, E.h * (3 - i) / 4, .42, MAT.marmore, { p: [0, E.h * (3 - i) / 8, E.zf + .26 + i * .42], em: pl });
  [1, 2].forEach((p, bi) => {
    const B = L.banco, g = new THREE.Group(), y0 = E.h + .14; g.position.set(B.x[bi], y0, B.z); pl.add(g);
    caixa(B.w, .16, 1.0, MAT.marmorePolido, { p: [0, .42, 0], em: g });
    caixa(B.w - .3, .34, .7, MAT.marmore, { p: [0, .17, 0], em: g });
    caixa(B.w, 1.25, .2, MAT.marmore, { p: [0, .62, -.5], em: g });
    caixa(B.w + .1, .12, .3, MAT.marmorePolido, { p: [0, 1.3, -.5], em: g });
    [-1, 1].forEach(s => { caixa(.24, .95, 1.1, MAT.marmore, { p: [s * (B.w / 2 + .02), .47, 0], em: g }); cilindro(.13, .13, .26, MAT.bronze, 14, { p: [s * (B.w / 2 + .02), 1.0, .42], em: g }).rotation.z = Math.PI / 2; });
    R.ops[p] = [];
    for (let k = 0; k < 4; k++) {
      const x = B.x[bi] + (k - 1.5) * B.passo, s = { P: p, k, id: null, esc: .68, base: new V3(x - .14, y0 + .5, B.z + .05), pilhaPos: new V3(x + .5, y0 + .5, B.z + .16), pilha: [], be: .56 };
      criarCarta(s); R.ops[p].push(s);
    }
  });

  // estelas (debates), cada uma com base, três torres e a régua do valor
  const es = L.estela, f = new THREE.Shape();
  f.moveTo(-es.w / 2, 0); f.lineTo(es.w / 2, 0); f.lineTo(es.w / 2, es.h - es.arco); f.absellipse(0, es.h - es.arco, es.w / 2, es.arco, 0, Math.PI, false); f.lineTo(-es.w / 2, 0);
  const geoEst = placa(f, es.w, es.h, es.t, { chanfro: .03 });
  es.x.forEach((sx, i) => {
    const g = new THREE.Group(); g.position.set(sx, 0, es.z); scene.add(g);
    const c = tela(512, 482), tex = texCanvas(c);
    const face = new THREE.MeshStandardMaterial({ map: tex, normalMap: MAT.marmore.normalMap, roughnessMap: MAT.marmore.roughnessMap, roughness: 1, envMapIntensity: .35, emissive: new THREE.Color('#58c6ee'), emissiveIntensity: 0 });
    caixa(es.w + .5, .16, 1.15, MAT.calcario, { p: [0, .08, 0], em: g }); caixa(es.w + .26, .14, .86, MAT.marmore, { p: [0, .23, 0], em: g });
    const st = new THREE.Mesh(geoEst, [face, MAT.marmore]); st.position.set(0, .3, -es.t / 2); st.castShadow = true; st.receiveShadow = true; g.add(st);
    const vazio = caixa(es.w - .4, .1, .5, MAT.marmore, { p: [0, .35, 0], em: g }); vazio.visible = false;
    const slot = { i, x: sx, g, st, vazio, face, tela: c, tex, did: null, v: 0, bh: .1, torres: [[], [], []], regua: new THREE.Group(), fachos: [] };
    scene.add(slot.regua);
    for (let p = 0; p < 3; p++) { const fa = new THREE.Mesh(R.geoFacho, R.matFacho); fa.position.set(sx + L.torre.dx[p], 2.6, es.z + L.torre.dz); fa.visible = false; fa.renderOrder = 5; scene.add(fa); slot.fachos.push(fa); }
    R.slots.push(slot); R.emis['deb:' + i] = [face];
  });

  // pedestais do jogador: a face da frente é inclinada (lê-se de cima) e traz o nome e os quatro valores
  const pd = L.ped, perfil = new THREE.Shape();
  perfil.moveTo(pd.tras, 0); perfil.lineTo(pd.frente, 0); perfil.lineTo(pd.topo, pd.h); perfil.lineTo(pd.tras, pd.h); perfil.closePath();
  const geoPed = new THREE.ExtrudeGeometry(perfil, { depth: pd.w, bevelEnabled: false }); geoPed.translate(0, 0, -pd.w / 2); geoPed.rotateY(-Math.PI / 2);
  { const p = geoPed.attributes.position, n = geoPed.attributes.normal, uv = geoPed.attributes.uv;
    for (let i = 0; i < p.count; i++) { const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)); if (ax > .6) uv.setXY(i, p.getZ(i), p.getY(i)); else if (ay > .8) uv.setXY(i, p.getX(i), p.getZ(i)); else uv.setXY(i, p.getX(i), p.getY(i)); } }
  const incl = Math.atan((pd.frente - pd.topo) / pd.h), rampa = Math.hypot(pd.frente - pd.topo, pd.h);
  pd.x.forEach((px, k) => {
    const g = new THREE.Group(); g.position.set(px, 0, pd.z); scene.add(g);
    const c = tela(448, 352), tex = texCanvas(c);
    const face = new THREE.MeshStandardMaterial({ map: tex, normalMap: MAT.marmore.normalMap, roughnessMap: MAT.marmore.roughnessMap, roughness: 1, envMapIntensity: .35, emissive: new THREE.Color('#58c6ee'), emissiveIntensity: 0 });
    caixa(pd.w + .24, .14, pd.frente - pd.tras + .24, MAT.marmorePolido, { p: [0, .07, (pd.frente + pd.tras) / 2], em: g });
    const corpo = new THREE.Mesh(geoPed, MAT.marmore); corpo.position.y = .14; corpo.castShadow = true; corpo.receiveShadow = true; g.add(corpo);
    const pl2 = new THREE.Mesh(new THREE.PlaneGeometry(pd.w - .1, rampa - .08), face); pl2.rotation.x = -incl; pl2.position.set(0, .14 + pd.h / 2 + Math.sin(incl) * .006, (pd.frente + pd.topo) / 2 + Math.cos(incl) * .006); pl2.receiveShadow = true; g.add(pl2);
    caixa(pd.w + .12, .07, pd.topo - pd.tras + .1, MAT.marmorePolido, { p: [0, .14 + pd.h + .035, (pd.topo + pd.tras) / 2], em: g });
    const s = { P: 0, k, id: null, on: null, chave: '', esc: pd.fig, g, tela: c, tex, face, base: new V3(px, PED_H, pd.z + (pd.topo + pd.tras) / 2), pilhaPos: new V3(px + 1.05, 0, pd.z + .35), pilha: [], be: .78 };
    criarCarta(s); R.meus.push(s); pintarPedestal(s); R.emis['seat:' + k].push(face);
  });

  // estantes: a Biblioteca do jogador (frente, à direita) e as dos oponentes (laterais, no meio)
  R.estantes[0] = criarEstante(L.estante.eu, 1.6, 1.95, 0);
  L.estante.op.forEach((e, i) => { R.estantes[i + 1] = criarEstante(e, 1.7, 2.6, i + 1); });

  // arquibancada com o coro, atrás da plataforma
  const arq = new THREE.Group(); scene.add(arq);
  for (let i = 0; i < 5; i++) caixa(26, .8 * (i + 1) + .4, 1.2, MAT.silhar, { p: [0, L.chao + (.8 * (i + 1) + .4) / 2, P.zb - 2.4 - i * 1.2], em: arq });
  caixa(27, 5.6, .5, MAT.calcario, { p: [0, L.chao + 2.8, P.zb - 2.4 - 5 * 1.2 + .3], em: arq });
  const tx = [coristaTex(0), coristaTex(1)], mc = tx.map(t => new THREE.MeshStandardMaterial({ map: t, alphaTest: .5, roughness: .7, side: THREE.DoubleSide, envMapIntensity: .2 }));
  const gc = new THREE.PlaneGeometry(1.15, 1.72); gc.translate(0, .86, 0);
  for (let i = 0; i < 17; i++) {
    const fila = i % 3, m = new THREE.Mesh(gc, mc[i % 2]), y = L.chao + .8 * (fila + 3) + .4;
    m.position.set((i - 8) * 1.18 + (fila - 1) * .3, y, P.zb - 2.4 - (fila + 2) * 1.2 + .1); m.castShadow = true; m.userData = { y, i, s: .9 + rnd(i) * .2 }; m.scale.setScalar(m.userData.s);
    arq.add(m); R.coro.push(m);
  }
  // árvores: ciprestes nos cantos de trás, oliveira na frente à esquerda (cortada pela borda)
  [[-10.4, -9.3, 8.2, 1.25, 1], [10.6, -9.8, 9, 1.35, 2], [-13.2, -12.5, 7, 1.1, 3], [13.6, -6.4, 6.4, 1.05, 4]].forEach(a => { const c = cipreste(a[2], a[3], a[4]); c.position.set(a[0], L.chao, a[1]); scene.add(c); });
  const ol = oliveira(7); ol.position.set(-9.9, L.chao, 3.6); ol.scale.setScalar(1.25); scene.add(ol);
  const ol2 = oliveira(21); ol2.position.set(13.2, L.chao, -4.6); ol2.scale.setScalar(1.1); ol2.rotation.y = 2; scene.add(ol2);
}
function criarCarta(s) {
  const w = 1.1 * s.esc, h = 1.5 * s.esc, geo = placa(retArred(w, h, .07 * s.esc), w, h, .05 * s.esc);
  const face = new THREE.MeshStandardMaterial({ roughness: .62, envMapIntensity: .3, emissive: new THREE.Color('#58c6ee'), emissiveIntensity: 0 });
  const m = new THREE.Mesh(geo, [face, MAT.madeiraClara]); m.castShadow = true; m.receiveShadow = true; m.visible = false;
  m.position.copy(s.base); m.rotation.x = -.09; scene.add(m); s.carta = m; s.matCarta = face;
  s.ancora = new THREE.Object3D(); s.ancora.position.copy(s.base); scene.add(s.ancora);
  R.emis[(s.P === 0 ? 'seat:' : 'op:' + s.P + ':') + s.k] = (R.emis[(s.P === 0 ? 'seat:' : 'op:' + s.P + ':') + s.k] || []).concat([face]);
}
function criarEstante(e, w, h, P) {
  const g = new THREE.Group(); g.position.set(e[0], 0, e[1]); g.rotation.y = e[2]; scene.add(g);
  const m = MAT.madeira.clone(); m.emissive = new THREE.Color('#58c6ee'); m.emissiveIntensity = 0;
  const d = .58, pr = 3, vao = (h - .5) / pr;
  caixa(w + .2, .2, d + .12, m, { p: [0, .1, 0], em: g }); caixa(w + .24, .12, d + .16, m, { p: [0, h - .06, 0], em: g });
  caixa(w, h - .3, .06, m, { p: [0, h / 2, -d / 2 + .03], em: g });
  [-1, 1].forEach(s => caixa(.1, h - .3, d, m, { p: [s * (w / 2 - .05), h / 2, 0], em: g }));
  for (let i = 1; i < pr; i++) caixa(w - .2, .06, d - .06, m, { p: [0, .2 + i * vao, .02], em: g });
  cilindro(.05, .05, w + .1, MAT.bronze, 10, { p: [0, h + .02, d / 2 + .05], em: g }).rotation.z = Math.PI / 2;
  const est = { g, w, h, P, livros: [], vao, d, n: 0, mat: m };
  R.emis[P === 0 ? 'bib' : 'bibop:' + P] = [m];
  return est;
}

// ---------- livros ----------
function matsLivro(P) {
  if (!R.livroMat[P]) { const cor = S ? S.players[P].cor : ['#e9b93f', '#3fc1d6', '#ea6a97'][P], m = matLivro(cor); R.livroMat[P] = [MAT.paginas, MAT.paginas, m.capa, m.capa, m.lomb, MAT.paginas]; }
  return R.livroMat[P];
}
function novoLivro(P) { const m = new THREE.Mesh(R.geoLivro, matsLivro(P)); m.castShadow = true; m.receiveShadow = true; return m; }
function posTorre(slot, p) { return new V3(slot.x + L.torre.dx[p], .0, L.estela.z + L.torre.dz); }
function porLivroTorre(slot, p, k) {
  const b = novoLivro(p), t = posTorre(slot, p), s = slot.i * 97 + p * 31 + k * 7;
  b.scale.set(1, slot.bh, 1); b.position.set(t.x + (rnd(s) - .5) * .08, (k + .5) * slot.bh, t.z + (rnd(s + 1) - .5) * .06); b.rotation.y = (rnd(s + 2) - .5) * .16;
  scene.add(b); slot.torres[p].push(b); return b;
}
function ajustarTorre(slot, p, n) {
  const t = slot.torres[p];
  while (t.length > n) scene.remove(t.pop());
  while (t.length < n) porLivroTorre(slot, p, t.length);
}
function montarRegua(slot) {
  const g = slot.regua; while (g.children.length) g.remove(g.children[0]);
  if (!slot.did) return;
  const v = slot.v, bh = slot.bh, z = L.estela.z + L.torre.dz, hx = 1.72, alt = 2 * v * bh;
  [-1, 1].forEach(s => { cilindro(.035, .045, alt + .1, MAT.bronze, 10, { p: [slot.x + s * hx, (alt + .1) / 2, z], em: g }); cilindro(.09, .11, .06, MAT.bronze, 12, { p: [slot.x + s * hx, .03, z], em: g });
    const e = new THREE.Mesh(new THREE.SphereGeometry(.07, 12, 8), MAT.ouro); e.position.set(slot.x + s * hx, alt + .14, z); e.castShadow = true; g.add(e); });
  const corda = (y, r, m) => { const c = cilindro(r, r, hx * 2, m, 8, { p: [slot.x, y, z], em: g }); c.rotation.z = Math.PI / 2; };
  corda(v * bh, .022, MAT.ouro); corda(alt + .02, .014, MAT.bronze);
}
function ajustarPilha(s, n, P) {
  const max = P === 0 ? 14 : 10; n = Math.min(n, max);
  while (s.pilha.length > n) scene.remove(s.pilha.pop());
  while (s.pilha.length < n) {
    const k = s.pilha.length, b = novoLivro(P), bh = .085 * s.be, sd = s.k * 53 + P * 17 + k * 5;
    b.scale.set(s.be, bh, s.be); b.position.set(s.pilhaPos.x + (rnd(sd) - .5) * .07, s.pilhaPos.y + (k + .5) * bh, s.pilhaPos.z + (rnd(sd + 1) - .5) * .06); b.rotation.y = (rnd(sd + 2) - .5) * .5;
    scene.add(b); s.pilha.push(b);
  }
}
function posLivroEstante(e, k) {
  const por = Math.floor((e.w - .3) / .125), pr = 2 - Math.floor(k / por) % 3, col = k % por, sd = e.P * 71 + k * 3;
  return { x: -e.w / 2 + .2 + col * .125, y: .2 + pr * e.vao + .03 + (pr === 0 ? 0 : .03), alt: .42 + rnd(sd) * .12, esp: .09 + rnd(sd + 1) * .03, sd };
}
function ajustarEstante(e, n) {
  const max = Math.floor((e.w - .3) / .125) * 3; n = Math.min(n, max);
  while (e.livros.length > n) e.g.remove(e.livros.pop());
  while (e.livros.length < n) {
    const k = e.livros.length, q = posLivroEstante(e, k), b = novoLivro(e.P);
    b.rotation.z = Math.PI / 2; b.scale.set(q.alt / L.livro.w, q.esp, .74); b.position.set(q.x, q.y + q.alt / 2, .04); e.g.add(b); e.livros.push(b);
  }
  e.n = n;
}

// ---------- estado do jogo → cena ----------
function sync(estado, ocultos) {
  if (!scene) return; S = estado; OC = ocultos || {};
  if (!S) return;
  const on = {}; S.debates.forEach(d => { on[BF.DEB[d.id].area] = 1; });
  R.slots.forEach((slot, i) => {
    const d = S.debates[i];
    if (!d) { slot.did = null; slot.st.visible = false; slot.vazio.visible = true; [0, 1, 2].forEach(p => ajustarTorre(slot, p, 0)); montarRegua(slot); slot.fachos.forEach(f => { f.visible = false; }); return; }
    const q = BF.DEB[d.id];
    if (slot.did !== d.id) {
      [0, 1, 2].forEach(p => ajustarTorre(slot, p, 0));
      slot.did = d.id; slot.v = q.valor; slot.bh = Math.max(.045, Math.min(.12, L.torre.H / (2 * q.valor)));
      slot.st.visible = true; slot.vazio.visible = false; pintarEstela(slot, d.id); montarRegua(slot);
    }
    S.players.forEach((pl, p) => {
      const vis = Math.min(d.stakes[p], 2 * q.valor), oc = Math.min(vis, OC[d.id + ':' + p] || 0);
      ajustarTorre(slot, p, vis - oc);
      const lid = BF.lidera(S, i, p) && !oc, fa = slot.fachos[p]; fa.visible = lid; if (lid) fa.position.y = (vis - oc) * slot.bh + 1.5;
    });
  });
  const chave = BF.AREAS.map(a => on[a] ? 1 : 0).join('');
  R.meus.forEach((s, k) => {
    const g = S.players[0].group[k], id = g ? g.id : null, ch = id + chave;
    ocupar(s, g, 0); if (s.chave !== ch) { s.chave = ch; s.on = on; pintarPedestal(s); }
  });
  [1, 2].forEach(p => R.ops[p].forEach((s, k) => ocupar(s, S.players[p].group[k], p)));
  S.players.forEach((pl, p) => ajustarEstante(R.estantes[p], pl.library));
  posicionar(true);
}
function ocupar(s, g, P) {
  const id = g ? g.id : null, boneco = !!(id && P === 0 && window.BF_BONECOS && window.BF_BONECOS[id]);
  if (s.id !== id) { s.id = id; if (id) { s.matCarta.map = texCarta(id); s.matCarta.needsUpdate = true; } }
  s.boneco = boneco;
  if (!s.fora) { s.carta.visible = !!id && !boneco; s.carta.position.copy(s.base); s.carta.rotation.set(-.09, 0, 0); s.carta.scale.setScalar(1); }
  if (id) { const inerte = !BF.ativo(g); s.matCarta.color.set(inerte ? '#aeb2c0' : g.acted ? '#a8a49c' : '#ffffff'); s.matCarta.opacity = inerte ? .78 : 1; if (s.matCarta.transparent !== inerte) { s.matCarta.transparent = inerte; s.matCarta.needsUpdate = true; } }
  ajustarPilha(s, g && !g.lib ? g.ideas : 0, P);
}

// ---------- câmera ----------
const cam = { alvo: new V3(), dist: 16, alvo0: new V3(), dist0: 16, mx: 0, my: 0, px: 0, py: 0, tremor: 0, focado: false };
function aplicarCamera() {
  const p = L.cam.passo, t = cam.tremor ? (Math.sin(relogio * .09) * cam.tremor) : 0, t2 = cam.tremor ? (Math.cos(relogio * .13) * cam.tremor * .6) : 0;
  camera.position.set(cam.alvo.x + cam.px * 1.1 + t, cam.alvo.y + Math.sin(p) * cam.dist + cam.py * .5 + t2, cam.alvo.z + Math.cos(p) * cam.dist);
  camera.lookAt(cam.alvo.x + cam.px * .12, cam.alvo.y, cam.alvo.z); camera.updateMatrixWorld();
}
// escolhe a distância para que a mesa caiba: os pedestais ficam acima da mão; as estantes, dentro das laterais
function enquadrar() {
  const W = innerWidth, H = innerHeight; renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
  const mao = Math.min(.36, 150 / H) * 2, yb = -1 + mao, pd = L.ped, e = L.estante.eu, pts = [[pd.x[0] - 1.0, 0, pd.z + pd.frente, 1], [e[0] + 1.15, 0, e[1] + .8, 1], [e[0] + 1.2, 2.0, e[1] + .3, 0], [0, 0, pd.z + pd.frente + .15, 2], [pd.x[0] - .8, 2.6, pd.z, 0]];
  const cabe = dd => { cam.dist = dd; cam.alvo.copy(cam.alvo0); const px = cam.px, py = cam.py; cam.px = cam.py = 0; aplicarCamera(); cam.px = px; cam.py = py;
    return pts.every(p => { const v = new V3(p[0], p[1], p[2]).project(camera); return Math.abs(v.x) <= .985 && (p[3] !== 2 || v.y >= yb) && v.y <= .9; }); };
  let a = 6, b = 60; for (let i = 0; i < 22; i++) { const m = (a + b) / 2; if (cabe(m)) b = m; else a = m; }
  cam.dist0 = b; if (!cam.focado) cam.dist = b; else cam.dist = b * .72;
  aplicarCamera(); posicionar(true);
}
function foco(chave) {
  if (cam.focado) return Promise.resolve();
  const m = /^deb:(\d)/.exec(chave || ''), i = m ? +m[1] : 1, de = cam.alvo.clone(), d0 = cam.dist, para = new V3(L.estela.x[i] * .8, 1.5, L.estela.z + .7), d1 = cam.dist0 * .72;
  cam.focado = true; document.getElementById('focoveu').classList.add('on');
  return tween(T(620), k => { cam.alvo.lerpVectors(de, para, k); cam.dist = d0 + (d1 - d0) * k; }, E.io);
}
function desfoco() {
  if (!cam.focado) return Promise.resolve();
  const de = cam.alvo.clone(), d0 = cam.dist; cam.focado = false; document.getElementById('focoveu').classList.remove('on');
  return tween(T(620), k => { cam.alvo.lerpVectors(de, cam.alvo0, k); cam.dist = d0 + (cam.dist0 - d0) * k; }, E.io);
}
function tremer(f) { cam.tremor = Math.min(.05, (f || 3) * .012); return tween(T(300), k => { cam.tremor = Math.min(.05, (f || 3) * .012) * (1 - k); }).then(() => { cam.tremor = 0; }); }

// ---------- âncoras: onde fica cada elemento HTML invisível ----------
const _v = new V3(), _b = new THREE.Box3();
function tela2(v) { _v.copy(v).project(camera); return { x: (_v.x * .5 + .5) * innerWidth, y: (-_v.y * .5 + .5) * innerHeight }; }
function retCaixa(x0, y0, z0, x1, y1, z1) {
  let l = 1e9, t = 1e9, r = -1e9, b = -1e9;
  for (let i = 0; i < 8; i++) { const p = tela2(_v.set(i & 1 ? x1 : x0, i & 2 ? y1 : y0, i & 4 ? z1 : z0)); l = Math.min(l, p.x); r = Math.max(r, p.x); t = Math.min(t, p.y); b = Math.max(b, p.y); }
  return { l, t, w: r - l, h: b - t };
}
// retângulo de uma figura de pé (boneco) com a base em pos
function retFig(pos, w, h) {
  const a = tela2(new V3(pos.x - w / 2, pos.y, pos.z)), b = tela2(new V3(pos.x + w / 2, pos.y, pos.z)), c = tela2(new V3(pos.x, pos.y + h, pos.z));
  return { l: a.x, t: c.y, w: b.x - a.x, h: Math.max(a.y, b.y) - c.y };
}
function ancora(chave) {
  const a = chave.split(':'), es = L.estela, pd = L.ped, tz = es.z + L.torre.dz;
  switch (a[0]) {
    case 'deb': { const x = es.x[+a[1]]; return retCaixa(x - 1.9, 0, es.z - .2, x + 1.9, es.h + .3, tz + .35); }
    case 'est': { const x = es.x[+a[1]] + L.torre.dx[+a[2]]; return retCaixa(x - .45, 0, tz - .3, x + .45, L.torre.H + .1, tz + .3); }
    case 'lv': case 'lt': { const s = R.slots[+a[1]]; return tela2(_v.set(s.x + 1.72, (a[0] === 'lv' ? s.v : 2 * s.v) * s.bh + (a[0] === 'lt' ? .12 : 0), tz)); }
    case 'vago': return tela2(_v.set(es.x[+a[1]], 1.5, es.z));
    case 'seat': { const x = pd.x[+a[1]]; return retCaixa(x - .78, 0, pd.z + pd.tras, x + .78, PED_H + 1.5 * pd.fig, pd.z + pd.frente); }
    case 'fig': { const s = R.meus[+a[2]]; return retFig(s.base, 1.3 * pd.fig, 1.5 * pd.fig); }
    case 'pilha': { const s = +a[1] === 0 ? R.meus[+a[2]] : R.ops[+a[1]][+a[2]]; return tela2(_v.set(s.pilhaPos.x, s.pilhaPos.y + s.pilha.length * .085 * s.be + .12, s.pilhaPos.z)); }
    case 'op': { const s = R.ops[+a[1]][+a[2]]; return retCaixa(s.base.x - .42, s.base.y, s.base.z - .1, s.base.x + .42, s.base.y + 1.05, s.base.z + .1); }
    case 'painel': { const bi = +a[1] - 1; return tela2(_v.set(L.banco.x[bi], L.estrado.h + .14 + 1.5, L.banco.z - .5)); }
    case 'grupo': return retCaixa(pd.x[0] - .85, 0, pd.z + pd.tras, pd.x[3] + .85, PED_H + .2, pd.z + pd.frente);
    case 'bib': { const e = L.estante.eu; return retCaixa(e[0] - .85, 0, e[1] - .45, e[0] + .85, 2.0, e[1] + .45); }
    case 'bibop': { const e = L.estante.op[+a[1] - 1]; return tela2(_v.set(e[0], 2.75, e[1])); }
    case 'coro': return tela2(_v.set(0, L.chao + 6.4, L.plat.zb - 6));
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

// ---------- realce de alvos ----------
const COR_REALCE = [null, new THREE.Color('#4fc3ee'), new THREE.Color('#ffffff'), new THREE.Color('#f3c552')];
function haloDe(chave) {
  if (R.halos[chave] !== undefined) return R.halos[chave];
  const a = chave.split(':'), es = L.estela, pd = L.ped, tz = es.z + L.torre.dz; let lista = [];
  const h = (x, y, z, w, d) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), R.matHalo.clone()); m.rotation.x = -Math.PI / 2; m.position.set(x, y + .02, z); m.renderOrder = 4; m.visible = false; scene.add(m); return m; };
  if (a[0] === 'deb') lista = [h(es.x[+a[1]], 0, es.z + .5, 5, 3.4)];
  else if (a[0] === 'est') lista = [h(es.x[+a[1]] + L.torre.dx[+a[2]], 0, tz, 1.7, 1.5)];
  else if (a[0] === 'seat') lista = [h(pd.x[+a[1]], 0, pd.z + .2, 2.7, 2.7)];
  else if (a[0] === 'grupo') lista = pd.x.map(x => h(x, 0, pd.z + .2, 2.7, 2.7));
  else if (a[0] === 'op') { const s = R.ops[+a[1]][+a[2]]; lista = [h(s.base.x, s.base.y, s.base.z + .1, 1.5, 1.3)]; }
  else if (a[0] === 'bib') lista = [h(L.estante.eu[0], 0, L.estante.eu[1], 3.2, 2.2)];
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
    (R.emis[k] || []).forEach(m => { m.emissive.copy(COR_REALCE[n]); m.emissiveIntensity = (n === 2 ? .34 : n === 3 ? .14 : .17) * pulso; });
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
  cam.px += (cam.mx - cam.px) * .06; cam.py += (cam.my - cam.py) * .06;
  const quer = document.body.classList.contains('escolhendo') ? .55 : 1; luzK += (quer - luzK) * .12;
  sol.intensity = 3.3 * luzK; hemi.intensity = .95 * (.35 + .65 * luzK); renderer.toneMappingExposure = 1.02 * (.72 + .28 * luzK);
  // coro: em espera, balança de leve; aplauso pula; vaia nega; murmúrio oscila
  const tp = agora < coroAte ? coroTipo : null;
  R.coro.forEach(m => { const u = m.userData, f = agora * .001 + u.i * .7;
    m.position.y = u.y + (tp === 'aplauso' ? Math.abs(Math.sin(f * 9)) * .3 : 0);
    m.rotation.z = tp === 'vaia' ? Math.sin(f * 16) * .2 : tp === 'murmurio' ? Math.sin(f * 4.5) * .09 : Math.sin(f * 1.3) * .025; });
  R.slots.forEach(s => s.fachos.forEach(f => { if (f.visible) f.quaternion.copy(camera.quaternion); }));
  aplicarCamera(); atualizarRealces(); posicionar(false);
  if (window.M3D && M3D.aoQuadro) M3D.aoQuadro();
  renderer.render(scene, camera);
}
function laco(t) { requestAnimationFrame(laco); quadro(t); }

// ---------- peças de coreografia ----------
function figura(P, id) {
  const lista = P === 0 ? R.meus : R.ops[P]; if (!lista) return null;
  const s = lista.find(x => x.id === id); if (!s) return null;
  return { s, boneco: s.boneco, obj: s.boneco ? s.ancora : s.carta, casa: s.base.clone(), esc: s.esc };
}
function arco(obj, para, ms, alto, ease) {
  const de = obj.position.clone(); alto = alto === undefined ? 1.6 : alto;
  return tween(ms, k => { obj.position.lerpVectors(de, para, k); obj.position.y += Math.sin(k * Math.PI) * alto; }, ease || E.io);
}
function andar(obj, para, ms) { const de = obj.position.clone(); return tween(ms, k => { obj.position.lerpVectors(de, para, k); }, E.lin); }
function tranco(obj, ms) { return tween(ms || 260, k => { const s = 1 + Math.sin(k * Math.PI) * .16 * (1 - k); obj.scale.set(1 + (s - 1) * 1.2, 1 - (s - 1) * 1.6, 1); }, E.lin).then(() => obj.scale.setScalar(1)); }
function slotDe(did) { return R.slots.find(s => s.did === did) || null; }
function topoTorre(did, P) { const s = slotDe(did); if (!s) return null; const t = posTorre(s, P); t.y = s.torres[P].length * s.bh; return t; }
function peTorre(did, P, lado) { const s = slotDe(did); if (!s) return null; const t = posTorre(s, P); t.z += .95; t.x += (lado || 0); return t; }
// um livro cai sobre a torre (ideia que chega)
function cairLivro(did, P) {
  const s = slotDe(did); if (!s) return Promise.resolve();
  if (s.torres[P].length >= 2 * s.v) return Promise.resolve();
  const b = porLivroTorre(s, P, s.torres[P].length), y = b.position.y;
  return tween(T(300), k => { b.position.y = y + (1 - k) * 1.5; b.rotation.z = (1 - k) * .5; }, E.in).then(() => tween(T(140), k => { b.position.y = y + Math.sin(k * Math.PI) * .04; b.rotation.z = 0; }, E.lin));
}
// livros despencam do alto da torre (ideias perdidas); a torre oscila antes
function derrubar(did, P, n) {
  const s = slotDe(did); if (!s || !n) return;
  const t = s.torres[P], base = posTorre(s, P), y0 = t.length * s.bh;
  t.forEach((b, i) => { const x = b.position.x; tween(T(460), k => { b.position.x = x + Math.sin(k * Math.PI * 3) * .035 * (i / Math.max(1, t.length)) * (1 - k); }, E.lin); });
  for (let i = 0; i < Math.min(n, 9); i++) {
    const b = novoLivro(P), lado = (i % 2 ? 1 : -1) * (.5 + Math.random() * .7), zz = .5 + Math.random() * .8;
    b.scale.set(1, s.bh, 1); b.position.set(base.x, y0 + (i + .5) * s.bh, base.z); b.visible = false; scene.add(b);
    tween(T(760), k => { b.visible = true; b.position.x = base.x + lado * k; b.position.z = base.z + zz * k; b.position.y = Math.max(s.bh / 2, y0 + .5 * Math.sin(k * 2.2) - (y0 + .2) * k * k); b.rotation.z = lado * k * 5; b.rotation.x = k * 3; }, E.lin, T(340 + i * 70))
      .then(() => tween(T(500), k => { b.scale.setScalar(Math.max(.001, 1 - k)); }, E.in, T(500))).then(() => scene.remove(b));
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
    const m = new THREE.Mesh(o.geo || R.geoPalha, mat3), an = Math.random() * 6.3, d = .5 + Math.random() * 1.2, up = .6 + Math.random() * 1.2;
    m.position.copy(pos); scene.add(m);
    tween(T(o.d || 800), k => { m.position.set(pos.x + Math.cos(an) * d * k, Math.max(.03, pos.y + up * Math.sin(k * 2.4) - pos.y * k * k), pos.z + Math.sin(an) * d * k * .7); m.rotation.set(k * 9 + an, an, k * 7); if (k > .7) m.scale.setScalar((1 - k) / .3 + .01); }, E.out).then(() => scene.remove(m));
  }
}
function chuva(n) {
  for (let i = 0; i < (n || 30); i++) {
    const m = new THREE.Mesh(R.geoPagina, R.matPagina), x = (Math.random() - .5) * 15, z = -4 + Math.random() * 7.5, dx = (Math.random() - .5) * 2, g = Math.random() * 6;
    m.position.set(x, 9, z); m.visible = false; scene.add(m);
    tween(T(1700 + Math.random() * 900), k => { m.visible = true; m.position.set(x + dx * k + Math.sin(k * 9 + g) * .35, 8.5 * (1 - k) + .03, z); m.rotation.set(k * 8 + g, g + k * 3, Math.sin(k * 7 + g)); }, E.lin, T(Math.random() * 700))
      .then(() => tween(T(600), k => { m.scale.setScalar(Math.max(.01, 1 - k)); }, E.in, T(900))).then(() => scene.remove(m));
  }
}
function coro(tipo, ms) { coroTipo = tipo; coroAte = performance.now() + (ms || 1700); }
// livros novos caindo na estante (chegada das ideias do turno)
function chegarEstante(P, n) {
  const e = R.estantes[P]; if (!e) return;
  e.livros.slice(-Math.min(n, e.livros.length)).forEach((b, i) => { const y = b.position.y; b.position.y = y + .9; b.visible = false; tween(T(420), k => { b.visible = true; b.position.y = y + (1 - k) * .9; }, E.tranco, T(i * 90)); });
}
function mundoEstante(P) { const e = R.estantes[P]; return e.g.localToWorld(new V3(0, e.h * .62, .3)); }
function mundoPilha(P, id) { const f = figura(P, id); if (!f) return null; const s = f.s; return new V3(s.pilhaPos.x, s.pilhaPos.y + s.pilha.length * .085 * s.be + .1, s.pilhaPos.z); }
// clarão breve na figura (poder que dispara, dupla clássica)
function brilhar(P, id, cor) {
  const f = figura(P, id); if (!f) return;
  const ms = [f.s.matCarta].concat(f.s.face ? [f.s.face] : []), c = new THREE.Color(cor || '#f3c552');
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
  scene = new THREE.Scene(); scene.background = new THREE.Color('#f1cfa6'); scene.fog = new THREE.Fog('#f1cfa6', 34, 150);
  scene.environment = criarAmbiente();
  camera = new THREE.PerspectiveCamera(L.cam.fov, innerWidth / innerHeight, .5, 600);
  cam.alvo0.set(L.cam.alvo[0], L.cam.alvo[1], L.cam.alvo[2]); cam.alvo.copy(cam.alvo0);
  MAT = criarMateriais(); anisotropia(Math.min(8, renderer.capabilities.getMaxAnisotropy()));
  R.geoLivro = new THREE.BoxGeometry(L.livro.w, 1, L.livro.d);
  R.geoPalha = new THREE.BoxGeometry(.3, .025, .025); R.geoPagina = new THREE.PlaneGeometry(.34, .44);
  R.matPagina = new THREE.MeshStandardMaterial({ map: MAT.pergaminho.map, side: THREE.DoubleSide, roughness: .9 });
  // facho de luz sobre a torre que lidera e halo de alvo
  const cf = tela(64, 256), xf = cf.getContext('2d'), gf = xf.createLinearGradient(0, 0, 0, 256); gf.addColorStop(0, 'rgba(255,214,120,0)'); gf.addColorStop(1, 'rgba(255,224,150,.55)');
  xf.fillStyle = gf; xf.fillRect(0, 0, 64, 256); const gx = xf.createLinearGradient(0, 0, 64, 0); gx.addColorStop(0, 'rgba(0,0,0,1)'); gx.addColorStop(.5, 'rgba(0,0,0,0)'); gx.addColorStop(1, 'rgba(0,0,0,1)'); xf.globalCompositeOperation = 'destination-out'; xf.fillStyle = gx; xf.fillRect(0, 0, 64, 256);
  R.geoFacho = new THREE.PlaneGeometry(1.1, 3); R.matFacho = new THREE.MeshBasicMaterial({ map: texCanvas(cf), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false });
  const ch = tela(128, 128), xh = ch.getContext('2d'), gh = xh.createRadialGradient(64, 64, 20, 64, 64, 64); gh.addColorStop(0, 'rgba(255,255,255,.0)'); gh.addColorStop(.55, 'rgba(255,255,255,.75)'); gh.addColorStop(.75, 'rgba(255,255,255,.35)'); gh.addColorStop(1, 'rgba(255,255,255,0)');
  xh.fillStyle = gh; xh.fillRect(0, 0, 128, 128);
  R.matHalo = new THREE.MeshBasicMaterial({ map: texCanvas(ch), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true, fog: false, toneMapped: false });
  // luz: um só sol poente (direita), mais o céu
  sol = new THREE.DirectionalLight('#ffcf9a', 3.3); sol.position.copy(SOL).multiplyScalar(40).add(new V3(0, 0, -1)); sol.target.position.set(0, 0, -1); scene.add(sol, sol.target);
  sol.castShadow = true; sol.shadow.mapSize.set(2048, 2048); const sc = sol.shadow.camera; sc.left = -17; sc.right = 17; sc.top = 14; sc.bottom = -14; sc.near = 5; sc.far = 90; sol.shadow.bias = -.0006; sol.shadow.normalBias = .03; sol.shadow.radius = 3.5;
  hemi = new THREE.HemisphereLight('#b9c8ff', '#c79a6a', .95); scene.add(hemi);
  montar();
  addEventListener('resize', enquadrar); enquadrar();
  addEventListener('pointermove', e => { if (e.pointerType && e.pointerType !== 'mouse') return; cam.mx = (e.clientX / innerWidth - .5) * 2 * .42; cam.my = -(e.clientY / innerHeight - .5) * 2 * .3; });
  requestAnimationFrame(laco);
  setInterval(() => { const a = performance.now(); if (a - ultimo > 180) avancar(a); }, 90);   // aba em segundo plano: as cenas não travam
  // as letras gravadas usam as fontes da página; pede cada corte e repinta quando chegarem
  if (document.fonts && document.fonts.load) {
    const tudo = () => { repintar.forEach(f => f()); R.slots.forEach(s => { if (s.did) pintarEstela(s, s.did); }); R.meus.forEach(pintarPedestal); };
    Promise.all(["700 40px 'Alegreya'", "900 40px 'Alegreya'", "500 40px 'Alegreya'", "800 40px 'Alegreya Sans'"].map(f => document.fonts.load(f).catch(() => 0))).then(tudo);
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
