from dec1 import d, D
F={'freud':['d04','d05','d06','d16','d18','d01','d02','d03','d13','d14','d15','d07','d08','d09','d19','d20','d21','d10','d11','d12','d22','d23','d24'],
 'arendt':['d05','d06','d16','d18','d01','d02','d03','d13','d14','d15','d07','d08','d09','d19','d20','d21','d10','d11','d12','d22','d23','d24'],
 'maquiavel':['d04','d06','d16','d18','d01','d13','d14','d15','d07','d08','d09','d19','d20','d21','d11','d12','d22','d23','d24'],
 'erasmo':['d04','d05','d06','d16','d17','d18','d02','d03','d13','d15','d07','d08','d19','d21','d11','d12','d22','d23','d24']}
for f,ids in F.items():
    for i in ids: d(f+'-'+i,'A')
d('freud-d17','Perguntar pela origem e pelo sentido de tudo é pedir amparo, como a criança pede ao pai. A ciência só responde ao que pode observar.','I')
d('arendt-d04','Deus é assunto do pensamento solitário. No mundo comum, o que conta é o que fazemos juntos.','I',None,2,'Fala de Arendt sobre Deus: ela quase não trata do tema, e a anterior e a revisada são deduções. Mantive a dedução curta, com rótulo "A partir de suas ideias". Alternativa: trocar o tema da carta para ela.')
d('arendt-d17','Por que há algo e não nada? O pensamento tem sede de sentido e não se contenta com respostas definitivas.','I')
d('maquiavel-d05','A alma é assunto da Igreja. Ao governante importam a reputação e a glória, que sobrevivem a ele.','I')
d('maquiavel-d17','Essa é pergunta para teólogos. Eu me ocupo do que existe e do que pode ser mudado.','I')
d('maquiavel-d02','A política não é matemática: o príncipe calcula, mas metade das suas ações depende da fortuna.','I')
d('maquiavel-d03','Prefiro a verdade efetiva das coisas à imaginação delas. Quem troca o que se faz pelo que se deveria fazer aprende antes a se arruinar que a se preservar.','P','O Príncipe, cap. XV',2,'A "verdade efetiva das coisas" aparecia em duas falas (d01 e d03). Deixei a d01 como estava e passei a d03 para a outra metade da mesma passagem, a do "que se faz e o que se deveria fazer".')
d('maquiavel-d10','Na política, o que conta é parecer: o príncipe não precisa ter todas as virtudes, mas precisa parecer que as tem.','P','O Príncipe, cap. XVIII')
d('erasmo-d01','O saber que importa é o que forma a vida: as boas letras e o Evangelho. Especular sem fim sobre a natureza não torna ninguém melhor.','I')
d('erasmo-d14','A ordem do mundo vem de Deus. Diante dela, a razão humana faz melhor em ser modesta do que em querer explicar tudo.','I')
d('erasmo-d09','Diante de Cristo não há reis nem servos: todos os cristãos são membros de um mesmo corpo.','I')
d('erasmo-d10','O belo verdadeiro está na alma e nas boas letras. O luxo das cortes e dos templos é vaidade.','I')
d('erasmo-d20','A')
d('diogenes-d23','Os músicos afinam a lira com todo o cuidado e deixam a própria alma desafinada.','P','Diógenes Laércio VI, 27',2,'Troca a inferência ("o resto é enfeite") por uma tirada dele sobre artistas.')
