/* Batalhas Filosóficas — materiais da mesa 3D
 *
 * TODOS os materiais da cena nascem aqui. Hoje cada um usa mapas gerados por código (canvas):
 * cor, normal (derivada do relevo) e rugosidade. São PROVISÓRIOS.
 *
 * PARA TROCAR POR TEXTURA REAL (uma linha por material):
 *   em ARQUIVOS, acrescente a entrada com o mesmo nome do material. Exemplo:
 *     marmore: { cor:'tex/marmore_cor.jpg', normal:'tex/marmore_nor.jpg', rug:'tex/marmore_rug.jpg' },
 *   Mapas que faltarem (normal ou rug) continuam vindo do gerador. As texturas devem repetir sem emenda
 *   (exceto "piso", que cobre a plataforma inteira de uma vez). Tamanhos na lista de assets do projeto.
 *
 * Convenções: 1 unidade de cena ≈ 1 palmo de mesa (a estela tem 3,3 de altura). "esc" é quantas unidades
 * de cena cabem em uma repetição da textura.
 */
import * as THREE from 'three';

export const ARQUIVOS = {
  // marmore: { cor:'tex/marmore_cor.jpg', normal:'tex/marmore_nor.jpg', rug:'tex/marmore_rug.jpg' },
};

// ---------- ruído que repete sem emenda ----------
function ruido(per, semente) {
  const g = new Float32Array(per * per); let s = (semente * 9301 + 49297) | 0;
  for (let i = 0; i < g.length; i++) { s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff; g[i] = s / 0x7fffffff; }
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const x0 = ((xi % per) + per) % per, x1 = (x0 + 1) % per, y0 = ((yi % per) + per) % per, y1 = (y0 + 1) % per;
    const a = g[y0 * per + x0], b = g[y0 * per + x1], c = g[y1 * per + x0], d = g[y1 * per + x1];
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}
// fbm(u,v) com u,v em [0,1): soma de oitavas, período 1 nos dois eixos
export function fbm(semente, per, oit) {
  const ns = []; for (let o = 0; o < oit; o++) ns.push(ruido(per << o, semente + o * 17));
  return (u, v) => { let s = 0, a = .5, t = 0; for (let o = 0; o < oit; o++) { const f = per << o; s += a * ns[o](u * f, v * f); t += a; a *= .5; } return s / t; };
}
const fr = x => x - Math.floor(x);
const cl = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const mix = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); };

export function tela(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h || w; return c; }

/* gerar(n, px): px(u,v) devolve [r,g,b, altura 0..1, rugosidade 0..1, metal 0..1].
   Sai um trio de canvases: cor, alt (relevo, em cinza) e rug (G = rugosidade, B = metal). */
function gerar(n, px, m) {
  m = m || n;
  const cor = tela(n, m), alt = tela(n, m), rug = tela(n, m);
  const cc = cor.getContext('2d'), ca = alt.getContext('2d'), cr = rug.getContext('2d');
  const ic = cc.createImageData(n, m), ia = ca.createImageData(n, m), ir = cr.createImageData(n, m);
  for (let y = 0, i = 0; y < m; y++) for (let x = 0; x < n; x++, i += 4) {
    const p = px((x + .5) / n, (y + .5) / m);
    ic.data[i] = p[0]; ic.data[i + 1] = p[1]; ic.data[i + 2] = p[2]; ic.data[i + 3] = p[6] === undefined ? 255 : p[6];
    const h = cl(p[3]) * 255; ia.data[i] = ia.data[i + 1] = ia.data[i + 2] = h; ia.data[i + 3] = 255;
    ir.data[i] = 255; ir.data[i + 1] = cl(p[4]) * 255; ir.data[i + 2] = cl(p[5] || 0) * 255; ir.data[i + 3] = 255;
  }
  cc.putImageData(ic, 0, 0); ca.putImageData(ia, 0, 0); cr.putImageData(ir, 0, 0);
  return { cor, alt, rug };
}
// mapa de normais a partir do relevo (canvas em cinza). "forca" acentua; "repete" emenda as bordas.
export function normalDe(alt, forca, repete) {
  const w = alt.width, h = alt.height, src = alt.getContext('2d').getImageData(0, 0, w, h).data;
  const out = tela(w, h), co = out.getContext('2d'), io = co.createImageData(w, h), d = io.data;
  const H = (x, y) => { if (repete) { x = (x + w) % w; y = (y + h) % h; } else { x = cl(x, 0, w - 1); y = cl(y, 0, h - 1); } return src[(y * w + x) * 4] / 255; };
  for (let y = 0, i = 0; y < h; y++) for (let x = 0; x < w; x++, i += 4) {
    let nx = (H(x - 1, y) - H(x + 1, y)) * forca, ny = (H(x, y + 1) - H(x, y - 1)) * forca, nz = 1;
    const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
    d[i] = (nx * .5 + .5) * 255; d[i + 1] = (ny * .5 + .5) * 255; d[i + 2] = (nz * .5 + .5) * 255; d[i + 3] = 255;
  }
  co.putImageData(io, 0, 0); return out;
}

// ---------- geradores provisórios ----------
const GER = {
  // mármore branco, levemente quente, com veios cinzentos (pentélico de imaginação)
  marmore() {
    const a = fbm(11, 3, 5), w1 = fbm(23, 2, 4), w2 = fbm(37, 2, 4), v1 = fbm(41, 2, 5), v2 = fbm(53, 5, 4), gr = fbm(67, 48, 2);
    return gerar(512, (u, v) => {
      const du = (w1(u, v) - .5) * .5, dv = (w2(u, v) - .5) * .5;
      let r1 = 1 - Math.abs(2 * v1(u + du, v + dv) - 1); r1 = Math.pow(r1, 9);
      let r2 = 1 - Math.abs(2 * v2(u + du * .6, v + dv * .6) - 1); r2 = Math.pow(r2, 7) * .5;
      const nu = a(u, v), g = gr(u, v), ve = cl(r1 * .85 + r2 * .5), s = (nu - .5) * 26 + (g - .5) * 7;
      return [mix(240 + s, 150, ve * .62), mix(233 + s, 146, ve * .62), mix(220 + s * 1.2, 146, ve * .58), .55 + (nu - .5) * .12 - ve * .12 + (g - .5) * .05, .34 + ve * .22 + g * .12];
    });
  },
  // calcário poroso (poros), para degraus, embasamento e arquibancada
  calcario() {
    const a = fbm(5, 3, 5), b = fbm(9, 24, 3), p = fbm(15, 40, 2), st = fbm(19, 2, 3);
    return gerar(512, (u, v) => {
      const nu = a(u, v), g = b(u, v), poro = sstep(.66, .78, p(u, v)), suj = sstep(.5, .8, st(u, v * .4));
      const s = (nu - .5) * 34 + (g - .5) * 16 - poro * 46 - suj * 14;
      return [212 + s, 194 + s, 160 + s * 1.05, .5 + (nu - .5) * .2 + (g - .5) * .2 - poro * .5, .82 + poro * .1];
    });
  },
  // faixa de caneluras verticais (4 por repetição), com desgaste e escorrido
  caneluras() {
    const a = fbm(71, 3, 5), b = fbm(73, 30, 2), e = fbm(79, 6, 3);
    return gerar(512, (u, v) => {
      const t = fr(u * 4) * 2 - 1, cav = Math.sqrt(Math.max(0, 1 - t * t)), aresta = sstep(.86, 1, Math.abs(t));
      const nu = a(u, v), g = b(u, v), esc = sstep(.45, .9, e(u, v * .25)) * sstep(.1, .9, v), topo = sstep(.06, 0, v) + sstep(.94, 1, v);
      const s = (nu - .5) * 26 + (g - .5) * 12 - cav * 30 + aresta * 14 - esc * 22 - topo * 26;
      return [216 + s, 200 + s, 170 + s * 1.05, 1 - cav * .92 + (g - .5) * .05, .78 + cav * .08];
    });
  },
  // silhar: blocos de calcário com juntas
  silhar() {
    const a = fbm(81, 3, 5), b = fbm(83, 26, 3), p = fbm(87, 40, 2), t = fbm(89, 4, 2);
    return gerar(512, (u, v) => {
      const lin = Math.floor(v * 4), uu = fr(u * 2 + (lin % 2) * .5), vv = fr(v * 4);
      const ju = Math.min(uu, 1 - uu) * .5, jv = Math.min(vv, 1 - vv) * .25, j = sstep(.012, 0, Math.min(ju, jv));
      const bloco = t(Math.floor(u * 2 + (lin % 2) * .5) / 2 + .13, lin / 4 + .07) - .5;
      const nu = a(u, v), g = b(u, v), poro = sstep(.68, .8, p(u, v));
      const s = (nu - .5) * 26 + (g - .5) * 14 + bloco * 30 - j * 60 - poro * 34;
      return [208 + s, 190 + s, 158 + s * 1.05, .6 + (g - .5) * .15 - j * .6 - poro * .35, .84];
    });
  },
  // bronze envelhecido com pátina
  bronze() {
    const a = fbm(101, 4, 5), b = fbm(103, 30, 3), p = fbm(107, 7, 4);
    return gerar(256, (u, v) => {
      const nu = a(u, v), g = b(u, v), pat = sstep(.6, .78, p(u, v) + (g - .5) * .2);
      const k = .82 + nu * .3 + (g - .5) * .16;
      return [mix(196 * k, 92, pat), mix(142 * k, 138, pat), mix(72 * k, 112, pat), .5 + (g - .5) * .3 - pat * .1, mix(.36 + g * .22, .8, pat), 1 - pat * .7];
    });
  },
  ouro() {
    const a = fbm(111, 5, 4), b = fbm(113, 40, 2);
    return gerar(128, (u, v) => { const k = .9 + a(u, v) * .2; const g = b(u, v); return [236 * k, 186 * k, 84 * k, .5 + (g - .5) * .4, .3 + g * .18, 1]; });
  },
  // madeira escura (nogueira), fibra ao longo de u
  madeira() {
    const a = fbm(121, 2, 4), f1 = fbm(123, 2, 5), f2 = fbm(127, 4, 4), po = fbm(131, 6, 3);
    return gerar(512, (u, v) => {
      const on = v * 9 + (a(u, v) - .5) * 2.4, an = .5 + .5 * Math.sin(on * Math.PI * 2);
      const fi = f1(u, fr(v * 6)) * .6 + f2(u, fr(v * 22)) * .4, poro = sstep(.6, .75, po(u, fr(v * 40)));
      const t = cl(an * .45 + fi * .7 - .1);
      return [mix(74, 142, t) - poro * 24, mix(46, 96, t) - poro * 18, mix(24, 54, t) - poro * 10, .5 + (fi - .5) * .5 - poro * .3, .52 + poro * .2 - an * .08];
    });
  },
  // couro claro para tingir (material.color dá a cor do jogador)
  couro() {
    const a = fbm(141, 3, 4), g = fbm(143, 44, 2), r = fbm(147, 14, 3);
    return gerar(256, (u, v) => {
      const gr = g(u, v), nu = a(u, v), ru = r(u, v), borda = sstep(.05, 0, Math.min(u, 1 - u, v, 1 - v));
      const s = (nu - .5) * 34 + (gr - .5) * 30 - sstep(.62, .8, ru) * 18 + borda * 26;
      return [214 + s, 208 + s, 202 + s, .5 + (gr - .5) * .7, .5 + gr * .25];
    });
  },
  // lombada: couro com nervuras e filetes (claros: o tingimento os deixa mais vivos que a capa)
  lombada() {
    const a = fbm(151, 3, 4), g = fbm(153, 44, 2);
    return gerar(256, (u, v) => {
      const gr = g(u, v), nu = a(u, v);
      const f = x => sstep(.022, .008, Math.abs(u - x)), filete = Math.max(f(.14), f(.2), f(.8), f(.86)), nerv = Math.max(sstep(.05, .02, Math.abs(u - .36)), sstep(.05, .02, Math.abs(u - .64)));
      const rot = sstep(.13, .1, Math.abs(u - .5)) * sstep(.34, .26, Math.abs(v - .5));
      const s = (nu - .5) * 30 + (gr - .5) * 26 - 20 + nerv * 16;
      return [mix(mix(206 + s, 255, filete * .9), 250, rot * .55), mix(mix(200 + s, 244, filete * .9), 240, rot * .55), mix(mix(194 + s, 200, filete * .9), 214, rot * .55), .5 + nerv * .4 + (gr - .5) * .4, mix(.55, .3, filete)];
    }, 64);
  },
  // corte das páginas
  paginas() {
    const a = fbm(161, 3, 3), g = fbm(163, 2, 2);
    return gerar(128, (u, v) => {
      const li = .5 + .5 * Math.sin(v * Math.PI * 2 * 22 + g(u, v) * 3), nu = a(u, v), s = (nu - .5) * 20 - li * 26;
      return [240 + s, 228 + s, 200 + s, .5 + li * .3, .9];
    });
  },
  // pergaminho
  pergaminho() {
    const a = fbm(171, 3, 5), g = fbm(173, 30, 3), f = fbm(177, 3, 4);
    return gerar(256, (u, v) => {
      const nu = a(u, v), gr = g(u, v), fi = f(u, fr(v * 14)), s = (nu - .5) * 40 + (gr - .5) * 14 + (fi - .5) * 14;
      return [232 + s, 214 + s, 172 + s * 1.2, .5 + (fi - .5) * .3 + (gr - .5) * .2, .8];
    });
  },
  // terracota (cerâmica)
  terracota() {
    const a = fbm(181, 4, 4), g = fbm(183, 40, 2);
    return gerar(256, (u, v) => { const nu = a(u, v), gr = g(u, v), s = (nu - .5) * 36 + (gr - .5) * 20; return [198 + s, 112 + s * .8, 72 + s * .6, .5 + (gr - .5) * .5, .7]; });
  },
  // estopa e palha (espantalho)
  estopa() {
    const a = fbm(191, 3, 4);
    return gerar(256, (u, v) => {
      const tu = .5 + .5 * Math.sin(u * Math.PI * 2 * 40), tv = .5 + .5 * Math.sin(v * Math.PI * 2 * 40), tr = Math.max(tu * (fr(v * 20) < .5 ? 1 : .55), tv * (fr(u * 20) < .5 ? 1 : .55));
      const s = (a(u, v) - .5) * 40 + tr * 40 - 26;
      return [214 + s, 184 + s, 118 + s * .8, tr, .95];
    });
  },
  palha() {
    const a = fbm(195, 3, 4), f = fbm(197, 3, 4);
    return gerar(128, (u, v) => { const fi = f(fr(u * 26), v), s = (a(u, v) - .5) * 30 + (fi - .5) * 90; return [222 + s, 186 + s, 92 + s * .6, fi, .9]; });
  },
  // chão: terra batida, pedrisco e capim seco
  terra() {
    const a = fbm(201, 3, 5), g = fbm(203, 36, 3), pe = fbm(207, 22, 2), ca = fbm(211, 4, 4), fo = fbm(213, 60, 2);
    return gerar(512, (u, v) => {
      const nu = a(u, v), gr = g(u, v), ped = sstep(.7, .78, pe(u, v)), cap = sstep(.52, .7, ca(u, v)) * (.5 + fo(u, v));
      const s = (nu - .5) * 44 + (gr - .5) * 26;
      return [mix(mix(160 + s, 196, ped), 118 + s * .5, cap * .8), mix(mix(132 + s, 180, ped), 124 + s * .6, cap * .8), mix(mix(94 + s * .8, 154, ped), 66 + s * .3, cap * .8), .45 + (gr - .5) * .4 + ped * .4 + cap * fo(u, v) * .3, .95];
    });
  },
  // casca de oliveira
  casca() {
    const a = fbm(221, 3, 4), f = fbm(223, 5, 5), g = fbm(227, 30, 2);
    return gerar(256, (u, v) => {
      let r = 1 - Math.abs(2 * f(u, fr(v * .35)) - 1); r = Math.pow(r, 2.2);
      const s = (a(u, v) - .5) * 30 + (g(u, v) - .5) * 20 + r * 50 - 30;
      return [128 + s, 112 + s, 92 + s * .9, r, .92];
    });
  },
  // folhagem de cipreste (escura, em tufos)
  cipreste() {
    const a = fbm(231, 3, 4), f = fbm(233, 9, 5), g = fbm(237, 64, 2), r = fbm(239, 24, 3);
    return gerar(512, (u, v) => {
      const tu = f(u, v), gr = g(u, v), ra = r(u, fr(v * .6)), luz = sstep(.38, .72, tu * .7 + ra * .3), s = (a(u, v) - .5) * 18;
      return [mix(20, 66, luz) + s * .5 + gr * 16, mix(38, 98, luz) + s + gr * 22, mix(24, 46, luz) + s * .4 + gr * 6, tu * .6 + ra * .25 + gr * .15, .9];
    });
  },
};

// ---------- registro ----------
const _tex = {};          // trios {cor, normal, rug} de THREE.Texture por nome
const _todas = [];
function textura(fonte, srgb) {
  const t = fonte instanceof HTMLCanvasElement ? new THREE.CanvasTexture(fonte) : new THREE.TextureLoader().load(fonte);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; _todas.push(t); return t;
}
const FORCA = { marmore: 1.2, calcario: 3, caneluras: 5, silhar: 4, bronze: 2, ouro: 1.5, madeira: 2.4, couro: 1.6, lombada: 2, paginas: 2, pergaminho: 1.4, terracota: 1.6, estopa: 3, palha: 3, terra: 3.5, casca: 5, cipreste: 4 };
const _ger = {};
export function gerado(nome) { return _ger[nome] || (_ger[nome] = GER[nome]()); }   // canvases crus, para compor (piso, estelas)
export function mapas(nome) {
  if (_tex[nome]) return _tex[nome];
  const arq = ARQUIVOS[nome] || {}, precisa = !arq.cor || !arq.normal || !arq.rug, g = precisa ? gerado(nome) : null;
  return _tex[nome] = {
    cor: textura(arq.cor || g.cor, true),
    normal: textura(arq.normal || normalDe(g.alt, FORCA[nome] || 2, true)),
    rug: textura(arq.rug || g.rug),
  };
}
/* mat(nome, {esc, cor, metal, ...}) — material padrão com os três mapas.
   esc: unidades de cena por repetição (o mapeamento em mesa3d.js usa UV em unidades de cena). */
export function mat(nome, o) {
  o = o || {};
  const m = mapas(nome), rep = 1 / (o.esc || 1);
  const clo = t => { const c = t.clone(); c.repeat.set(rep * (o.ex || 1), rep * (o.ey || 1)); c.needsUpdate = true; _todas.push(c); return c; };
  const p = {
    map: clo(m.cor), normalMap: clo(m.normal), roughnessMap: clo(m.rug),
    color: new THREE.Color(o.cor || '#ffffff'), roughness: o.rug === undefined ? 1 : o.rug, metalness: o.metal ? 1 : 0,
    envMapIntensity: o.env === undefined ? (o.metal ? 1 : .32) : o.env,
  };
  if (o.metal) p.metalnessMap = p.roughnessMap;
  if (o.nor !== undefined) p.normalScale = new THREE.Vector2(o.nor, o.nor);
  const mm = new THREE.MeshStandardMaterial(p); mm.name = nome; return mm;
}
export function anisotropia(n) { _todas.forEach(t => { t.anisotropy = n; t.needsUpdate = true; }); }
export function registrar(t) { _todas.push(t); return t; }

/* Tabela dos materiais fixos da cena. Um lugar só: é aqui que se muda aparência, escala e brilho. */
export function criarMateriais() {
  return {
    marmore: mat('marmore', { esc: 3.2 }),
    marmorePolido: mat('marmore', { esc: 2.2, rug: .7, env: .5 }),
    calcario: mat('calcario', { esc: 3 }),
    caneluras: mat('caneluras', { esc: 1.3, ey: 1.3 / .9 }),
    silhar: mat('silhar', { esc: 2.6 }),
    bronze: mat('bronze', { esc: 1.2, metal: true }),
    ouro: mat('ouro', { esc: .6, metal: true }),
    madeira: mat('madeira', { esc: 2.2 }),
    madeiraClara: mat('madeira', { esc: 1.6, cor: '#e2bb86' }),
    paginas: mat('paginas', { esc: .5 }),
    pergaminho: mat('pergaminho', { esc: 1 }),
    terracota: mat('terracota', { esc: 1 }),
    estopa: mat('estopa', { esc: .8 }),
    palha: mat('palha', { esc: .6 }),
    terra: mat('terra', { esc: 7 }),
    casca: mat('casca', { esc: 1.4 }),
    cipreste: mat('cipreste', { esc: 1.6 }),
  };
}
// capa e lombada de livro na cor de um jogador (couro tingido)
export function matLivro(cor) {
  const c = new THREE.Color(cor); c.offsetHSL(0, -.08, -.06);
  const capa = mat('couro', { esc: 1, cor: '#' + c.getHexString(), env: .25 });
  const lomb = mat('lombada', { esc: 1, cor: '#' + c.getHexString(), env: .35 });
  return { capa, lomb };
}
