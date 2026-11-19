// experimentos globais: node exp.js nome '<json v>' N
const run=require('./par.js'); const fs=require('fs');
(async()=>{ const nome=process.argv[2], v=JSON.parse(process.argv[3]), N=+process.argv[4]||3000;
 const r=await run({v},1,N); const J=r.jogos;
 const out={nome,v,J,venc:r.venc.map(x=>+(100*x/J).toFixed(1)),emp:+(100*r.emp/J).toFixed(1),rod:+(r.rod/J).toFixed(2),debs:+(r.debs/J).toFixed(2),ptsVenc:+(r.ptsVenc/J).toFixed(1),margem:+(r.margem/J).toFixed(1),prx:+(r.prxUsos/J).toFixed(1),lib:+(r.lib.n/J).toFixed(2),libprod:+(r.lib.prod/J).toFixed(1),lid6:+(100*r.lid6v/Math.max(1,r.lid6)).toFixed(1)};
 fs.appendFileSync(__dirname+'/exp.jsonl',JSON.stringify(out)+'\n'); console.log(JSON.stringify(out)); })();
