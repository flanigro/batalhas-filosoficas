global.window=global;
const A=require(__dirname+'/../engine.js'); delete require.cache[require.resolve(__dirname+'/engine-var.js')];
const B=require(__dirname+'/engine-var.js');
function joga(E,sd){const s=E.newGame({seed:sd,mudo:true,niveis:['mestre','mestre','mestre'],humans:[false,false,false]}); let k=0; while(!s.over&&k<5000){E.aiStep(s);k++;} return s.round+':'+s.players.map(p=>p.points).join(',');}
let dif=0; for(let sd=1;sd<=300;sd++) if(joga(A,sd)!==joga(B,sd)) dif++;
console.log('diferenças',dif);
