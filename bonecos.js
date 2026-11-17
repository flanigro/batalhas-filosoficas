/* Batalhas Filosóficas — marionetes de recorte (piloto: Diógenes)
 *
 * Cada boneco é um SVG desenhado em PARTES. O programa não redesenha nada: só gira e desloca as partes
 * (as animações estão no CSS de index.html, bloco "motor de marionetes").
 *
 * PARTES (classes dentro do SVG; use as que o boneco tiver):
 *   figura     tudo o que sai andando (o que fica no pedestal, como o animal, fica fora)
 *   perna-e / perna-d   giram no quadril quando o boneco anda
 *   corpo      tronco, braços e cabeça: respira parado, balança ao andar
 *   braco-e    braço que lança os papiros
 *   braco-d    braço do adereço (oscila de leve)
 *   pendulo    o que pende e balança (lanterna, balança, relógio)
 *   cabeca     inclina devagar
 *   palpebra   forma da cor da pele sobre o olho; fecha para piscar
 *   animal / rabo   companheiro que espera no pedestal
 * Cada parte que gira precisa do ponto de giro: style="transform-origin:Xpx Ypx" (unidades do viewBox).
 * Desenhe com sobra nas articulações, para o giro não abrir buracos.
 *
 * ESTADOS (classes postas pelo programa no elemento da carta): parado (nenhuma), "anda", "lanca".
 * Para acrescentar um filósofo: BF_BONECOS.<id> = { svg: '<svg class="bn" viewBox="…">…</svg>' }.
 * Quem não tem boneco continua aparecendo como carta.
 */
window.BF_BONECOS={
diogenes:{svg:'<svg class="bn" viewBox="0 0 128 146" aria-hidden="true"><g fill="none" stroke="#2a211a" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">'
+'<g class="figura">'
+'<g class="perna-e" style="transform-origin:46px 112px"><path d="M45 110v22" stroke-width="8"/><path d="M45 110v22" stroke="#e8b98e" stroke-width="5"/><ellipse cx="41" cy="136" rx="10" ry="4.5" fill="#e8b98e"/></g>'
+'<g class="perna-d" style="transform-origin:73px 112px"><path d="M73 110v22" stroke-width="8"/><path d="M73 110v22" stroke="#e8b98e" stroke-width="5"/><ellipse cx="77" cy="136" rx="10" ry="4.5" fill="#e8b98e"/></g>'
+'<g class="corpo">'
+'<path d="M37 64Q38 45 60 45Q82 45 83 64Z" fill="#e8b98e"/><path d="M41 62L57 46l9 1L52 64Z" fill="#f4ecd6"/>'
+'<path d="M30 62Q23 88 32 116H88Q97 88 90 62Z" fill="#b98550"/>'
+'<path d="M28 76Q60 83 92 76M29 103Q60 110 91 103" stroke-width="3.2" stroke="#5a3d22"/><path d="M45 64v51M60 65v51M75 64v51" stroke-width="1.2"/>'
+'<g class="braco-e" style="transform-origin:39px 58px"><path d="M39 58Q24 70 31 86" stroke-width="9"/><path d="M39 58Q24 70 31 86" stroke="#e8b98e" stroke-width="6"/><circle cx="32" cy="88" r="5" fill="#e8b98e"/></g>'
+'<g class="braco-d" style="transform-origin:82px 58px"><path d="M100 78L103 16" stroke-width="2.6" stroke="#5a3d22"/><path d="M82 58Q94 62 100 54" stroke-width="9"/><path d="M82 58Q94 62 100 54" stroke="#e8b98e" stroke-width="6"/><circle cx="101" cy="53" r="5" fill="#e8b98e"/>'
+'<g class="pendulo" style="transform-origin:103px 16px"><path d="M103 16v5"/><rect x="95" y="21" width="16" height="22" rx="4" fill="#f3cf6c"/><path d="M95 32h16M103 21v22"/><circle cx="103" cy="32" r="3" fill="#fff6d8" stroke="none"/></g></g>'
+'<g class="cabeca" style="transform-origin:60px 46px">'
+'<path d="M46 40Q60 66 74 40Q60 48 46 40Z" fill="#a9a59c"/><circle cx="60" cy="28" r="17" fill="#e8b98e"/>'
+'<path d="M43 26Q41 12 52 11Q55 5 62 9Q72 6 75 15Q80 20 77 27Q72 17 60 18Q48 17 43 26Z" fill="#a9a59c"/>'
+'<ellipse cx="53" cy="27" rx="4" ry="3.3" fill="#fff"/><ellipse cx="67" cy="27" rx="4" ry="3.3" fill="#fff"/>'
+'<circle cx="54" cy="27.5" r="1.5" fill="#2a211a" stroke="none"/><circle cx="66" cy="27.5" r="1.5" fill="#2a211a" stroke="none"/>'
+'<ellipse class="palpebra" cx="53" cy="27" rx="4.6" ry="3.9" fill="#e8b98e" stroke="none" style="transform-origin:53px 23px"/><ellipse class="palpebra" cx="67" cy="27" rx="4.6" ry="3.9" fill="#e8b98e" stroke="none" style="transform-origin:67px 23px"/>'
+'<path d="M48 22l8 1M72 22l-8 1" stroke-width="2.2"/><path d="M60 28q-6 7 0 9q6-2 0-9Z" fill="#dba07a"/>'
+'<path d="M50 39Q55 36 60 39Q65 36 70 39Q65 43 60 41Q55 43 50 39Z" fill="#8f8b82"/><path d="M54 44Q60 48 66 44"/>'
+'</g></g></g>'
+'<g class="animal"><g class="rabo" style="transform-origin:97px 126px"><path d="M97 126Q90 120 92 112" stroke-width="2.6"/></g>'
+'<path d="M100 130v9M107 131v8M113 131v8" stroke-width="2.4"/><ellipse cx="106" cy="127" rx="11" ry="6" fill="#caa46a"/><circle cx="117" cy="119" r="6.5" fill="#caa46a"/><path d="M113 114l-2-7 6 4Z" fill="#8a6a3a"/><path d="M122 120l5 1-4 3Z" fill="#caa46a"/><circle cx="119" cy="118" r="1" fill="#2a211a" stroke="none"/></g>'
+'</g></svg>'}
};
