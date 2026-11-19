/* Batalha dos Filósofos — falas por pergunta: Livres-pensadores.
   Tipos: c = citação (tradução livre), p = paráfrase, i = inferência a partir da doutrina.
   Tudo a verificar. */
(function (r) {
  var F = r.BF_FALAS = r.BF_FALAS || {};

  F.maquiavel = {
    d01: ['p', 'O que importa conhecer é a “verdade efetiva das coisas” humanas, e não repúblicas e principados imaginados, que nunca se viu existirem.', 'O Príncipe, XV'],
    d02: ['i', 'Pela doutrina de Maquiavel, a política não é matemática: o príncipe calcula, mas metade de suas ações depende da fortuna.', 'O Príncipe, XXV'],
    d03: ['p', 'Muitos imaginaram repúblicas que nunca existiram. Maquiavel prefere ir atrás da verdade efetiva das coisas, mesmo quando ela desagrada.', 'O Príncipe, XV'],
    d13: ['p', 'O tempo traz consigo tudo, o bem e o mal. O príncipe sábio prevê os males de longe, como um bom médico, antes que se tornem incuráveis.', 'O Príncipe, III'],
    d14: ['p', 'Os homens têm sempre as mesmas paixões; por isso quem estuda bem o passado consegue prever o futuro de qualquer república.', 'Discursos sobre Tito Lívio, I, 39'],
    d15: ['p', 'A fortuna é como um rio que, quando transborda, inunda as planícies. Não se pode detê-lo na cheia, mas pode-se construir diques no tempo bom.', 'O Príncipe, XXV'],
    d04: ['p', 'A religião é útil para manter os povos unidos e obedientes: o rei Numa fingiu conversar com uma ninfa para dar autoridade às leis de Roma.', 'Discursos sobre Tito Lívio, I, 11'],
    d05: ['i', 'Pela doutrina de Maquiavel, a alma é assunto da Igreja; ao governante importam a reputação e a glória, que sobrevivem a ele.', 'Discursos sobre Tito Lívio, I, 10'],
    d06: ['p', 'A fortuna é árbitro de metade de nossas ações, mas deixa a outra metade, ou quase, para nós governarmos.', 'O Príncipe, XXV'],
    d16: ['p', 'O propósito é a glória, conquistada pela virtù — a energia e a habilidade de fundar e manter cidades. Os maiores são os fundadores de Estados e de religiões.', 'O Príncipe, VI; Discursos, I, 10'],
    d17: ['i', 'Pela doutrina de Maquiavel, essa é pergunta para teólogos; o governante deve ocupar-se do que existe e do que pode ser mudado.', 'O Príncipe, XV'],
    d18: ['c', 'Todos veem o que pareces, poucos sentem o que és; e esses poucos não ousam se opor à opinião da maioria.', 'O Príncipe, XVIII'],
    d07: ['p', 'Quem quiser ser bom em tudo se arruinará entre tantos que não são bons. O príncipe precisa aprender a poder não ser bom, conforme a necessidade.', 'O Príncipe, XV'],
    d08: ['p', 'A melhor forma é a república mista, como a de Roma, com cônsules, senado e tribunos da plebe: o conflito entre nobres e povo produziu leis e liberdade.', 'Discursos sobre Tito Lívio, I, 2–4'],
    d09: ['p', 'Os grandes desejam oprimir, e o povo deseja apenas não ser oprimido. Por isso o desejo do povo é mais honesto que o dos grandes.', 'O Príncipe, IX'],
    d19: ['p', 'Sem boas leis e boas armas não há Estado seguro. Quem funda uma república deve supor que todos os homens são maus.', 'O Príncipe, XII; Discursos, I, 3'],
    d20: ['p', 'Quando está em jogo a salvação da pátria, não cabe perguntar o que é justo ou injusto, piedoso ou cruel.', 'Discursos sobre Tito Lívio, III, 41'],
    d21: ['p', 'Nas ações dos príncipes, de quem não se pode apelar a um tribunal, olha-se o resultado: se ele vence e mantém o Estado, os meios serão julgados honrosos.', 'O Príncipe, XVIII'],
    d10: ['i', 'Pela doutrina de Maquiavel, na política o que conta é a aparência: a beleza das ações está em parecer piedoso, fiel e humano.', 'O Príncipe, XVIII'],
    d11: ['p', 'Os homens hesitam menos em ofender quem se faz amar do que quem se faz temer: o amor é um vínculo que eles rompem sempre que lhes convém.', 'O Príncipe, XVII'],
    d12: ['p', 'O príncipe deve ser raposa para reconhecer as armadilhas e leão para assustar os lobos: astúcia e força, sem se deixar levar pelos afetos.', 'O Príncipe, XVIII'],
    d22: ['p', 'Os homens são ingratos, volúveis, dissimulados e ávidos de ganho. Esquecem mais depressa a morte do pai do que a perda do patrimônio.', 'O Príncipe, XVII'],
    d23: ['p', 'Maquiavel também escreveu comédias, como A Mandrágora, em que os costumes de Florença aparecem, com riso, mais nus que nos tratados.', 'A Mandrágora (c. 1518), prólogo'],
    d24: ['p', 'Os homens são tão simples e tão presos às necessidades do momento que quem engana sempre encontra quem se deixe enganar.', 'O Príncipe, XVIII']
  };

  F.erasmo = {
    d01: ['i', 'Pela doutrina de Erasmo, o saber que importa é o que forma a vida — as boas letras e o Evangelho —, e não as especulações sem fim sobre a natureza.', 'Manual do Soldado Cristão (Enchiridion, 1503)'],
    d02: ['p', 'No Elogio da Loucura, matemáticos e astrônomos são ridicularizados: medem o sol e as estrelas como se tivessem visto de perto o projeto do universo.', 'Elogio da Loucura, §52'],
    d03: ['p', 'É preciso voltar às fontes: ler os textos antigos e a Bíblia nas línguas originais, em vez de confiar em comentários de comentários.', 'Prefácio ao Novo Testamento grego (1516)'],
    d13: ['p', 'Erasmo comentou o lema “apressa-te devagar”: o tempo bem usado une rapidez e paciência.', 'Adágios, II, I, 1 (Festina lente)'],
    d14: ['i', 'Pela doutrina de Erasmo, a ordem do mundo vem de Deus, e a razão humana deve ser modesta diante dela, sem pretender explicar tudo.', 'Sobre o Livre-Arbítrio (1524), introdução'],
    d15: ['p', 'A própria Loucura faz o seu elogio e mostra que sem ela nada funcionaria: casamentos, amizades e reinos dependem de doces ilusões.', 'Elogio da Loucura, §§19–21'],
    d04: ['p', 'A verdadeira religião é a “filosofia de Cristo”: amor, simplicidade e paz. Superstições, relíquias e peregrinações afastam do essencial.', 'Manual do Soldado Cristão; Colóquios, “A peregrinação”'],
    d05: ['p', 'A alma é a parte divina em nós e deve guiar o corpo; o cristão combate os vícios como um soldado.', 'Manual do Soldado Cristão (Enchiridion)'],
    d06: ['p', 'O homem tem livre-arbítrio: a graça de Deus ajuda, mas a vontade humana coopera. Foi esse o centro da famosa polêmica com Lutero.', 'Sobre o Livre-Arbítrio (1524)'],
    d16: ['p', 'O propósito é imitar Cristo numa vida simples e pacífica; o estudo das letras deve servir à virtude.', 'Manual do Soldado Cristão (Enchiridion)'],
    d17: ['p', 'A Loucura zomba dos teólogos que discutem sutilezas que nem os apóstolos entenderiam. Mais vale viver o Evangelho do que disputar sobre a criação.', 'Elogio da Loucura, §53'],
    d18: ['p', 'A vida humana é uma peça de teatro em que cada um usa uma máscara. Quem as arranca à força estraga a comédia: o sábio sabe que a ilusão faz parte do jogo.', 'Elogio da Loucura, §29'],
    d07: ['p', 'O bem é a caridade e a paz. Na Queixa da Paz, é a própria Paz que lamenta ser expulsa de toda parte, até pelos cristãos.', 'Queixa da Paz (1517)'],
    d08: ['p', 'O bom príncipe governa para o povo, e não para si; deve ser educado nas letras e na virtude desde criança.', 'A Educação do Príncipe Cristão (1516)'],
    d09: ['i', 'Pela doutrina de Erasmo, diante de Cristo não há reis nem servos: todos os cristãos são membros de um mesmo corpo.', 'Manual do Soldado Cristão; Queixa da Paz'],
    d19: ['p', 'O Estado existe para guardar a paz e o bem comum; o príncipe que arrasta o povo à guerra trai seu ofício.', 'A Educação do Príncipe Cristão, XI'],
    d20: ['p', 'A guerra é o pior dos males, e quase nunca é justa: quem conhece seus horrores só a aceitaria como último recurso.', 'Adágios, IV, I, 1 (Dulce bellum inexpertis); Queixa da Paz'],
    d21: ['p', 'Os teólogos querem ditar a moral com silogismos e sutilezas, mas a moral está no Evangelho simples, que qualquer pessoa pode ler.', 'Elogio da Loucura, §53; Paráclese (1516)'],
    d10: ['i', 'Pela doutrina de Erasmo, o belo verdadeiro está na alma e nas boas letras; o luxo das cortes e dos templos é vaidade.', 'Elogio da Loucura, §§40, 59'],
    d11: ['p', 'Sem uma doce ilusão ninguém se casaria nem continuaria casado: é a Loucura que une os amantes e os amigos.', 'Elogio da Loucura, §§19–20'],
    d12: ['p', 'Júpiter deu ao homem muito mais paixão do que razão — uma onça de razão para uma libra de paixão — e ainda confinou a razão num cantinho da cabeça.', 'Elogio da Loucura, §16'],
    d22: ['p', 'É a Loucura que move o mundo: sem ela ninguém teria filhos, faria guerras, buscaria fama ou escreveria livros.', 'Elogio da Loucura, §§11, 23'],
    d23: ['p', 'O próprio Elogio da Loucura é sátira: corrigir rindo. As letras antigas, bem lidas, formam o caráter.', 'Carta a Thomas More, prefácio do Elogio da Loucura'],
    d24: ['p', 'Agimos contra nós por amor-próprio, a Filáucia, companheira da Loucura: ela faz cada um se achar belo, sábio e feliz enquanto se arruína.', 'Elogio da Loucura, §22']
  };
})(typeof window !== 'undefined' ? window : globalThis);
