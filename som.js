/* Batalha dos Filósofos — sons (18/11/2026)
 * Sons curtos e discretos, sintetizados no navegador (Web Audio): nenhum arquivo, nenhuma licença.
 * Os sons "físicos" (papel, livro, areia) poderão ser trocados depois por gravações de licença livre (CC0).
 * Uso: SOM.toca('nome', opcoes). O som só começa depois do primeiro gesto de quem joga (regra dos navegadores).
 * SOM.ligado(bool) liga ou desliga; a escolha fica guardada no navegador.
 */
(function (root) {
  'use strict';
  var ctx = null, mestre = null, ruidoBuf = null, ligado = true, VOLUME = 0.32;
  try { ligado = localStorage.getItem('bf-som') !== 'off'; } catch (e) {}

  function abrir() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
    var AC = root.AudioContext || root.webkitAudioContext; if (!AC) return false;
    try { ctx = new AC(); } catch (e) { return false; }
    mestre = ctx.createGain(); mestre.gain.value = VOLUME;
    var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 4;
    mestre.connect(comp); comp.connect(ctx.destination);
    var n = ctx.sampleRate; ruidoBuf = ctx.createBuffer(1, n, n);
    var d = ruidoBuf.getChannelData(0); for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }
  // primeiro gesto destrava o áudio
  ['pointerdown', 'keydown'].forEach(function (ev) { root.addEventListener(ev, function () { if (ligado) abrir(); }, { capture: true, passive: true }); });

  // ---------- peças ----------
  function env(g, t, a, pico, dur) {   // envelope: ataque a, decaimento até dur
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(pico, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }
  function tom(freq, t, dur, o) {
    o = o || {};
    var os = ctx.createOscillator(), g = ctx.createGain();
    os.type = o.tipo || 'sine'; os.frequency.setValueAtTime(freq, t);
    if (o.para) os.frequency.exponentialRampToValueAtTime(o.para, t + (o.desliza || dur));
    if (o.det) os.detune.value = o.det;
    env(g, t, o.a || 0.005, o.vol || 0.1, dur);
    var saida = g;
    if (o.filtro) { var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.filtro; g.connect(f); saida = f; }
    os.connect(g); saida.connect(mestre); os.start(t); os.stop(t + dur + 0.05);
  }
  function ruido(t, dur, o) {
    o = o || {};
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = ruidoBuf; s.loop = true; s.playbackRate.value = o.taxa || 1;
    f.type = o.tipo || 'bandpass'; f.frequency.setValueAtTime(o.freq || 1500, t); f.Q.value = o.q || 1;
    if (o.para) f.frequency.exponentialRampToValueAtTime(o.para, t + dur);
    env(g, t, o.a || 0.004, o.vol || 0.08, dur);
    s.connect(f); f.connect(g); g.connect(mestre); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }
  // trombeta: dente de serra com filtro que abre no ataque e vibrato depois do início
  function trompete(freq, t, dur, rel) {
    rel = rel || 1;
    var os = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
    os.type = 'sawtooth'; os.frequency.setValueAtTime(freq * 0.985, t); os.frequency.linearRampToValueAtTime(freq, t + 0.04);
    lfo.frequency.value = 5.5; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(freq * 0.006, t + Math.min(0.25, dur));
    lfo.connect(lg); lg.connect(os.frequency);
    f.type = 'lowpass'; f.Q.value = 2; f.frequency.setValueAtTime(700, t); f.frequency.exponentialRampToValueAtTime(2800, t + 0.05); f.frequency.exponentialRampToValueAtTime(1600, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06 * rel, t + 0.03); g.gain.setValueAtTime(0.055 * rel, t + Math.max(0.04, dur - 0.05)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.08);
    os.connect(f); f.connect(g); g.connect(mestre); os.start(t); lfo.start(t); os.stop(t + dur + 0.12); lfo.stop(t + dur + 0.12);
  }
  // torcida: rumor de muitas vozes (ruído em faixas que sobem e descem) e alguns "êêê" de vogal aberta
  function torcida(t, dur) {
    for (var b = 0; b < 4; b++) {
      var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = ruidoBuf; s.loop = true; f.type = 'bandpass'; f.Q.value = 1.3; f.frequency.value = [700, 1100, 1700, 2600][b];
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.03, t + 0.25);
      for (var k = 1; k < 8; k++) g.gain.linearRampToValueAtTime(0.018 + Math.random() * 0.022, t + 0.25 + k * (dur - 0.6) / 8);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(mestre); s.start(t, Math.random()); s.stop(t + dur + 0.05);
    }
    for (var v = 0; v < 7; v++) {   // vozes: dente de serra com formantes de "é"
      var t0 = t + Math.random() * 0.35, d = 0.7 + Math.random() * 0.6, f0 = 170 + Math.random() * 180;
      var o = ctx.createOscillator(), f1 = ctx.createBiquadFilter(), f2 = ctx.createBiquadFilter(), gv = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, t0); o.frequency.linearRampToValueAtTime(f0 * 1.25, t0 + d * 0.4); o.frequency.linearRampToValueAtTime(f0 * 1.1, t0 + d);
      f1.type = 'bandpass'; f1.frequency.value = 600; f1.Q.value = 4; f2.type = 'bandpass'; f2.frequency.value = 1800; f2.Q.value = 5;
      gv.gain.setValueAtTime(0.0001, t0); gv.gain.exponentialRampToValueAtTime(0.012, t0 + 0.12); gv.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      o.connect(f1); o.connect(f2); f1.connect(gv); f2.connect(gv); gv.connect(mestre); o.start(t0); o.stop(t0 + d + 0.05);
    }
  }
  function sino(freq, t, dur, vol) {   // sino suave: fundamental e parciais inarmônicos
    [[1, 1], [2.76, 0.35], [5.4, 0.12]].forEach(function (p) { tom(freq * p[0], t, dur * (p[0] > 1 ? 0.6 : 1), { vol: vol * p[1], a: 0.004 }); });
  }

  // ---------- catálogo ----------
  var SONS = {
    // PLIM: o mesmo som para toda ideia ganha, venha de onde vier (Biblioteca, Reflexão, poderes) — ensina a moeda do jogo.
    // Só os livros que entram na prateleira de um debate usam outro som (livro).
    plim: function (t) { tom(1568, t, 0.2, { vol: 0.055 }); tom(2349.3, t + 0.05, 0.32, { vol: 0.045 }); tom(4698.6, t + 0.05, 0.12, { vol: 0.008 }); },
    clique: function (t) { tom(1250, t, 0.05, { para: 700, vol: 0.05 }); },
    erro: function (t) { tom(150, t, 0.16, { tipo: 'square', vol: 0.035, filtro: 600 }); tom(118, t + 0.09, 0.18, { tipo: 'square', vol: 0.03, filtro: 600 }); },
    carta: function (t) { ruido(t, 0.14, { freq: 2600, para: 900, q: 0.8, vol: 0.06 }); tom(190, t + 0.1, 0.09, { para: 120, vol: 0.07 }); },
    livro: function (t, o) {   // toque de livro: madeira e papel
      var k = (o && o.k) || 0, f = 300 + (k % 5) * 18;
      tom(f, t, 0.08, { tipo: 'triangle', para: f * 0.62, vol: 0.075 }); ruido(t, 0.04, { freq: 3200, q: 1.5, vol: 0.03 });
    },
    salto: function (t) { ruido(t, 0.28, { freq: 420, para: 1900, q: 0.9, vol: 0.045, a: 0.04 }); },
    pouso: function (t) { tom(120, t, 0.22, { para: 52, vol: 0.16 }); ruido(t, 0.12, { tipo: 'lowpass', freq: 500, vol: 0.06 }); },
    brilho: function (t) { tom(1320, t, 0.28, { vol: 0.03 }); tom(1980, t + 0.03, 0.24, { vol: 0.02 }); },
    perda: function (t) { tom(520, t, 0.22, { tipo: 'triangle', para: 300, vol: 0.04 }); },
    dupla: function (t) { sino(660, t, 0.5, 0.05); sino(880, t + 0.14, 0.6, 0.05); },
    falacia: function (t) {   // carimbo seco e um "uuh" curto do coro
      tom(95, t, 0.16, { para: 60, vol: 0.18 }); ruido(t, 0.06, { freq: 1200, q: 0.7, vol: 0.09 });
      [196, 207, 185].forEach(function (f, i) { tom(f, t + 0.12, 0.55, { tipo: 'sawtooth', para: f * 0.82, desliza: 0.55, vol: 0.016, filtro: 650, a: 0.08, det: i * 7 }); });
    },
    tecnica: function (t) { tom(130, t, 0.14, { para: 90, vol: 0.11 }); ruido(t, 0.05, { freq: 1500, q: 0.8, vol: 0.05 }); tom(523, t + 0.1, 0.3, { vol: 0.025 }); },
    // vitória num debate: toque curto de trombetas (sol-dó-mi-sol) e a torcida vibrando
    vitoria: function (t) {
      [[392, 0, 0.13], [523.25, 0.13, 0.13], [659.25, 0.26, 0.13], [783.99, 0.39, 0.7]].forEach(function (n) {
        trompete(n[0], t + n[1], n[2]); trompete(n[0] * 0.75, t + n[1], n[2], 0.5);   // segunda voz uma quarta abaixo
      });
      torcida(t + 0.3, 1.9);
    },
    livros: function (t, o) { var n = Math.min((o && o.n) || 1, 6); for (var i = 0; i < n; i++) SONS.livro(t + i * 0.07, { k: i }); },
    turno: function (t) { sino(988, t, 0.9, 0.035); },
    ampulheta: function (t) { ruido(t, 0.55, { freq: 4200, para: 2600, q: 2, vol: 0.022, a: 0.06 }); },
    fim: function (t) { [392, 523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { tom(f, t + i * 0.12, i === 4 ? 1.3 : 0.45, { tipo: 'triangle', vol: 0.06 }); }); },
    aplauso: function (t) { for (var i = 0; i < 14; i++) ruido(t + i * 0.045 + Math.random() * 0.03, 0.03, { freq: 2200 + Math.random() * 1500, q: 1.2, vol: 0.012 }); }
  };
  var ultimo = {};
  function toca(nome, o) {
    if (!ligado || !SONS[nome] || !abrir() || ctx.state !== 'running') return;
    var agora = ctx.currentTime, gap = nome === 'livro' ? 0.03 : 0.06;
    if (ultimo[nome] && agora - ultimo[nome] < gap) return;   // evita amontoar o mesmo som
    ultimo[nome] = agora;
    try { SONS[nome](agora + 0.01 + ((o && o.atraso) || 0), o); } catch (e) {}
  }
  function liga(sim) {
    if (sim === undefined) return ligado;
    ligado = !!sim; try { localStorage.setItem('bf-som', ligado ? 'on' : 'off'); } catch (e) {}
    if (ligado) { abrir(); toca('clique'); } else if (ctx && ctx.state === 'running') ctx.suspend();
    return ligado;
  }
  root.SOM = { toca: toca, ligado: liga, sons: Object.keys(SONS) };
})(typeof window !== 'undefined' ? window : this);
