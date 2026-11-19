// Exporta para revisão externa: falas por pergunta, relações históricas e citações das cartas.
// Uso: node revisao/exporta_revisao.js "$PWD" "$PWD/revisao"   (a partir da raiz do repositório)
const path=require('path'), fs=require('fs');
const R=process.argv[2], OUT=process.argv[3];
global.window=global;
['falas_gregos','falas_materialistas','falas_germanicos','falas_livres'].forEach(f=>require(path.join(R,f+'.js')));
const BF=require(path.join(R,'engine.js')), F=global.BF_FALAS;
const TIPO={c:'citação (tradução livre)',p:'paráfrase',i:'inferência a partir da doutrina'};
const csv=rows=>'﻿'+rows.map(r=>r.map(v=>{v=v==null?'':String(v);return /[",\n;]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}).join(',')).join('\r\n')+'\r\n';
const AREAORD=BF.AREAS, deb=BF.DEBATES.slice().sort((a,b)=>AREAORD.indexOf(a.area)-AREAORD.indexOf(b.area)||b.valor-a.valor);
const REV=['veredito','texto_corrigido','tipo_corrigido','fonte_corrigida','observacao'];
// 1. falas
const linhas=[['id','filosofo','escola','pergunta','area','tipo','texto','fonte_indicada'].concat(REV)];
let md='';
BF.FILOSOFOS.forEach(f=>{
  const fs_=F[f.id]||{}; md+='\n## '+f.nome+' ('+BF.ESCOLA[f.escola].nome+')\n';
  deb.forEach(d=>{ const a=fs_[d.id]; if(!a)return;
    const id=f.id+'-'+d.id;
    linhas.push([id,f.nome,BF.ESCOLA[f.escola].nome,d.q,BF.AREA[d.area].nome,TIPO[a[0]],a[1],a[2],'','','','','']);
    md+='\n**'+id+'** · '+d.q+' ('+BF.AREA[d.area].curto+')\n- Tipo: '+TIPO[a[0]]+'\n- Texto: '+a[1]+'\n- Fonte indicada: '+a[2]+'\n';
  });
});
// 2. relações
const rel=[['id','filosofo','sobre','relacao','fonte_indicada'].concat(REV.filter(x=>x!=='tipo_corrigido'))];
let mdr='';
BF.RELACOES.forEach((r,i)=>{ const id='rel'+String(i+1).padStart(2,'0'), a=BF.C(r[0]).nome, b=BF.C(r[1]).nome;
  rel.push([id,a,b,r[2],r[3],'','','','']);
  mdr+='\n**'+id+'** · '+a+' sobre '+b+'\n- Relação: '+r[2]+'\n- Fonte indicada: '+r[3]+'\n'; });
// 3. citações e títulos das cartas
const car=[['id','filosofo','poder_nivel2','poder2','poder3','citacao_da_carta','fonte_indicada','obra_de_referencia','datas','local'].concat(REV.filter(x=>x!=='tipo_corrigido'))];
let mdc='';
BF.FILOSOFOS.forEach(f=>{ car.push(['carta-'+f.id,f.nome,f.c1.t,f.c2.t,f.c3.t,f.cit||'',f.citFonte||'',f.obra,f.datas,f.local,'','','','']);
  mdc+='\n**carta-'+f.id+'** · '+f.nome+'\n- Datas e local: '+f.datas+' · '+f.local+'\n- Obra de referência: '+f.obra+'\n- Poderes (títulos): '+f.c1.t+' · '+f.c2.t+' · '+f.c3.t+'\n- Citação da carta: '+(f.cit||'(nenhuma)')+'\n- Fonte indicada: '+(f.citFonte||'')+'\n'; });
fs.writeFileSync(path.join(OUT,'falas-para-revisao.csv'),csv(linhas));
fs.writeFileSync(path.join(OUT,'relacoes-para-revisao.csv'),csv(rel));
fs.writeFileSync(path.join(OUT,'cartas-para-revisao.csv'),csv(car));
const n=linhas.length-1, cont={}; linhas.slice(1).forEach(l=>cont[l[5]]=(cont[l[5]]||0)+1);
fs.writeFileSync(path.join(OUT,'conteudo-para-revisao.md'),
 '# Batalha dos Filósofos — conteúdo filosófico para revisão\n\nExportado do código do jogo (falas_*.js e engine.js, branch `mesa-3d`) em '+new Date().toLocaleDateString('pt-BR')+'. Tudo está marcado \"a verificar\".\n\n'
 +'- '+n+' falas (20 filósofos × 24 perguntas): '+Object.entries(cont).map(([k,v])=>v+' '+k).join(', ')+'.\n- '+(rel.length-1)+' relações históricas entre filósofos.\n- 20 cartas: citação, fonte, obra de referência, datas, local e títulos dos poderes.\n\nOs identificadores (por exemplo, aristoteles-d01, rel07, carta-kant) são os mesmos das planilhas CSV que acompanham este arquivo e servem para devolver as correções.\n\n# Parte 1 — Falas por pergunta\n'+md
 +'\n# Parte 2 — Relações históricas\n'+mdr+'\n# Parte 3 — Cartas\n'+mdc);
console.log(n, rel.length-1, car.length-1, cont);
