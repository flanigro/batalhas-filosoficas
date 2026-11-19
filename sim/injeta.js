// injeta cada carta da lista na mão inicial de cada assento; compara a vitória do assento com a base
const run=require('./par.js'); const fs=require('fs'); global.window=global; const BF=require(__dirname+'/engine-var.js');
const lista=process.argv[2].split(','), N=+process.argv[3]||500, v=process.argv[4]?JSON.parse(process.argv[4]):{}, saida=process.argv[5]||__dirname+'/inj.json';
(async()=>{ const out=fs.existsSync(saida)?JSON.parse(fs.readFileSync(saida)):{};
 for(const id of lista){ let vit=0,j=0,porSeat=[];
  for(let P=0;P<3;P++){ const r=await run({injeta:{P,id},v},1,N); vit+=r.venc[P]; j+=r.jogos; porSeat.push(r.venc[P]/r.jogos); }
  out[id]={vit,j,porSeat}; fs.writeFileSync(saida,JSON.stringify(out)); console.log(id, (100*vit/j).toFixed(1), porSeat.map(x=>(100*x).toFixed(1)).join('/')); }
})();
