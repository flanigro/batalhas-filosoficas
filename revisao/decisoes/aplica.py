import sys, json, re
sys.path.insert(0,'/home/claude/rev')
import dec2,dec3,dec4,dec5,dec6,dec7,dec8,dec9
from dec1 import D
dd=json.load(open('/home/claude/rev/dados.json'))
R='/home/claude/batalhas-filosoficas/'
ROT={'T':'c','P':'p','I':'i','Tradução livre':'c','Em outras palavras':'p','A partir de suas ideias':'i'}
def final(k):
    v=D[k]; n=dd['new'][k]; o=dd['old'].get(k) or dd['oldr'].get(k)
    otxt = o['texto'] if isinstance(o,dict) and 'texto' in o else (o['relacao'] if isinstance(o,dict) else o)
    t = otxt if v['t']=='A' else n['txt'] if v['t']=='R' else v['t']
    rot = ROT[v['rot']] if v['rot'] else (ROT[n['rot']] if n.get('rot') else None)
    fonte = v['fonte'] or n['fonte']
    t=re.sub(r'"([^"]*)"', '\u201c\\1\u201d', t)
    return t, rot, fonte
def js(s): return "'"+s.replace('\\','\\\\').replace("'","\\'")+"'"
NOTA={'aristoteles-d09':'Aristóteles também defendeu que alguns seriam escravos por natureza, tese hoje rejeitada.','heidegger-d08':'Em 1933, Heidegger aderiu ao Partido Nazista e foi reitor em Friburgo sob o regime.'}
# falas
tot=0
for fn in ['falas_gregos','falas_materialistas','falas_germanicos','falas_livres']:
    p=R+fn+'.js'; src=open(p).read(); cur=None; out=[]
    for line in src.split('\n'):
        m=re.match(r"\s*F\.(\w+) = \{",line)
        if m: cur=m.group(1)
        m2=re.match(r"(\s*)(d\d\d): \[",line)
        if m2 and cur:
            k=cur+'-'+m2.group(2)
            t,rot,fonte=final(k); tot+=1
            extra=', '+js(NOTA[k]) if k in NOTA else ''
            com=',' if line.rstrip().endswith(',') else ''
            line=m2.group(1)+m2.group(2)+': ['+js(rot)+', '+js(t)+', '+js(fonte)+extra+']'+com
        out.append(line)
    open(p,'w').write('\n'.join(out))
print('falas',tot)
# relações e cartas no engine.js
p=R+'engine.js'; src=open(p).read()
nrel=0
for i in range(1,43):
    k='rel%02d'%i; o=dd['oldr'][k]
    t,_,fonte=final(k)
    old="'"+o['relacao'].replace("'","\\'")+"', '"+o['fonte_indicada'].replace("'","\\'")+"'"
    assert src.count(old)==1, (k, src.count(old))
    src=src.replace(old, js(t)+', '+js(fonte)); nrel+=1
print('rel',nrel)
import csv
cart={r['﻿id'] if '﻿id' in r else r['id']:r for r in csv.DictReader(open('/home/claude/rev/cartas-revisadas.csv',encoding='utf-8'))}
open('/home/claude/rev/cartas_final.json','w').write(json.dumps({k:dict(v) for k,v in dec8.C.items()},ensure_ascii=False))
open(p,'w').write(src)
src=open(p).read()
NF={'aristoteles':'Metafísica I, 1, 980a21','platao':'Teeteto 155d','socrates':'Platão, Apologia 21d','epicuro':'Carta a Meneceu 124–125',
 'diogenes':'Diógenes Laércio VI, 32','hegel':'Filosofia do Direito, Prefácio','hobbes':'Do Cidadão, epístola dedicatória; Plauto, Asinária, v. 495',
 'bacon':'Novum Organum I, 3','locke':'Ensaio sobre o Entendimento Humano, II, 1, §19','rousseau':'Do Contrato Social I, 1',
 'kant':'Fundamentação da Metafísica dos Costumes, seção II (AA 4:421)','heidegger':'Carta sobre o Humanismo, abertura (GA 9, p. 313)',
 'arendt':'entrevista a Joachim Fest (1964), lendo Kant','erasmo':'Adágios, IV, I, 1 (“Dulce bellum inexpertis”)',
 'pitagoras':'atribuída aos pitagóricos (Aristóteles, Metafísica I, 5)'}
NC={'kant':'Age apenas segundo a regra que possas querer que vire lei para todos.'}
for k,r in cart.items():
    f=k.replace('carta-','')
    if f not in NF and f not in NC: continue
    old=js(r['citacao_da_carta'])+', '+js(r['fonte_indicada'])
    n=src.count(old); assert n==1,(f,n,old)
    src=src.replace(old, js(NC.get(f,r['citacao_da_carta']))+', '+js(NF.get(f,r['fonte_indicada'])))
REN=[("'Sínope, Jônia'","'Sínope, mar Negro'"),("'1466 – 1536'","'c. 1466 – 1536'"),
 ('Razão Áurea','Tetráctis'),('O Bom Selvagem','Estado de natureza'),('Super-Homem','Além-do-homem'),
 ('A Morte e a Existência Humana','Ser-para-a-morte'),('“Espaço e tempo são intuições da mente”','“Espaço e tempo são formas da intuição”'),
 ("'Dialética Hegeliana'","'“O real é racional”'"),('“Aliados hoje, inimigos amanhã”','A raposa e o leão'),
 ('“Aos amigos, os favores; aos inimigos, a lei”','“Mais seguro ser temido que amado”'),
 ('“O dinheiro é bom criado, mas mau senhor”','“O dinheiro é como esterco: só é bom espalhado”'),
 ('“Os objetos da Felicidade são ilusórios”','“A felicidade depende da opinião”')]
for a,b in REN:
    n=src.count(a); assert n>=1,(a,n); src=src.replace(a,b); print(n,a,'->',b)
open(p,'w').write(src)
