// roda em paralelo (2 processos) e soma
const {execFileSync,spawn}=require('child_process');
function soma(a,b){ if(typeof a==='number')return a+b; if(Array.isArray(a))return a.map((x,i)=>soma(x,b[i])); const r={...a}; for(const k in b) r[k]=k in a?soma(a[k],b[k]):b[k]; return r; }
module.exports=function(opts,n0,n1){ return new Promise(res=>{ const m=Math.floor((n0+n1)/2), partes=[[n0,m],[m+1,n1]], outs=[]; let f=0;
  partes.forEach((pt,i)=>{ const p=spawn('node',[__dirname+'/roda.js',JSON.stringify({...opts,seeds:pt})]); let buf=''; p.stdout.on('data',d=>buf+=d); p.stderr.on('data',d=>process.stderr.write(d)); p.on('close',()=>{outs[i]=JSON.parse(buf); if(++f===2)res(soma(outs[0],outs[1]));}); }); }); };
