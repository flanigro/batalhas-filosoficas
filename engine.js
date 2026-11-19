/* Batalha dos Filósofos — motor de regras (protótipo nível 2; regras de 15/11/2026, revistas em 18/11/2026)
   Sem dependências; roda no navegador e no Node (para simulação). */
(function (root) {
  'use strict';

  var AREAS = ['meta', 'logica', 'etica', 'psico'];
  var AREA = {
    meta:   { nome: 'Metafísica e Religião',        curto: 'Metafísica', cor: '#d8483c' },
    logica: { nome: 'Lógica, Ciência e Matemática', curto: 'Lógica',     cor: '#2f8fd0' },
    etica:  { nome: 'Ética e Política',             curto: 'Ética',      cor: '#2c9a4b' },
    psico:  { nome: 'Psicologia e Estética',        curto: 'Psicologia', cor: '#a13a9b' }
  };
  var ESCOLA = {
    grega: { nome: 'Grécia Clássica',            cor: '#2a6db3', cor2: '#17406e' },
    mat:   { nome: 'Materialistas e Empiristas', cor: '#c4861c', cor2: '#7a4f0c' },
    germ:  { nome: 'Germânicos',                 cor: '#2f9e4a', cor2: '#17592a' },
    livre: { nome: 'Livres-Pensadores',             cor: '#6d6f85', cor2: '#3b3c4d' }
  };

  function F(id, pre, nome, custo, escola, v, local, datas, obra, cit, citFonte, c1, c2, c3) {
    return {
      id: id, tipo: 'F', pre: pre, nome: nome, custo: custo, escola: escola,
      vals: { meta: v[0], logica: v[1], etica: v[2], psico: v[3] },
      local: local, datas: datas, obra: obra, cit: cit, citFonte: citFonte,
      c1: { t: c1[0], d: c1[1] },
      c2: { custo: c2[0], t: c2[1], d: c2[2] },
      c3: { custo: c3[0], t: c3[1], d: c3[2] }
    };
  }

  // Valores e textos: planilha "Versão 4". Datas/locais em falta completados (a conferir).
  var FILOSOFOS = [
    F('aristoteles', 'de Estagira', 'Aristóteles', 5, 'grega', [4, 5, 4, 4], 'Estagira – Atenas', '384 – 322 a.C.', 'Organon',
      'Todos os homens, por natureza, desejam conhecer.', 'Metafísica, I, 1',
      ['Silogismo – Premissa', 'Na fase de Reflexão, acrescente +1 ideia em um debate de Lógica.'],
      [4, 'Silogismo – Termo Médio', 'Elimine 5 ideias de um oponente em um debate no qual você participa.'],
      [7, 'Silogismo – Conclusão', 'Ganhe um debate de Lógica no qual você participe.']),
    F('platao', 'de Atenas', 'Platão', 4, 'grega', [5, 3, 5, 3], 'Atenas', '427 – 347 a.C.', 'A República',
      'O mundo sensível é sombra do mundo das Ideias.', 'paráfrase de A República, VII',
      ['A República', 'O “Rei Filósofo”: seu Catedrático ganha +1 ideia na Reflexão.'],
      [3, 'Formas Ideais', 'Arredonde as ideias ímpares para cima e as dos oponentes para baixo.'],
      [6, 'A Caverna de Platão', 'Baixe o Legado. Todos os Gregos ficam imunes a efeitos negativos.']),
    F('socrates', 'de Atenas', 'Sócrates', 3, 'grega', [4, 4, 3, 2], 'Atenas', '469 – 399 a.C.', 'Apologia (de Platão)',
      'Só sei que nada sei.', 'tradição a partir da Apologia, 21d',
      ['“Só sei que nada sei”', 'Se Platão estiver no grupo, ambos recebem +1 ideia na Reflexão.'],
      [3, 'Dialética Socrática', 'Inverta as cores das ideias em um debate de Lógica no qual você participe.'],
      [7, 'O Banquete', 'Ganhe um debate de Estética / Psicologia no qual você participe.']),
    F('epicuro', 'de Samos', 'Epicuro', 2, 'grega', [3, 1, 3, 3], 'Samos', '341 – 270 a.C.', 'Da Natureza',
      'A morte não é nada para nós.', 'Carta a Meneceu',
      ['Laço de Amizade', 'Um filósofo ao lado recebe +1 ideia na Reflexão.'],
      [4, 'O Jardim', 'Baixe o Legado Jardim. Aliados não perdem ideias. Gera +1 ideia na Reflexão.'],
      [6, '“A Morte não é nada para nós”', 'Ganhe um debate à sua escolha no qual você participe. Elimine a carta Epicuro.']),
    F('pitagoras', 'de Samos', 'Pitágoras', 1, 'grega', [1, 5, 1, 2], 'Samos', 'séc. VI a.C.', 'Teorema de Pitágoras',
      'Tudo é número.', 'atribuída pela tradição pitagórica',
      ['Harmonia das Esferas', 'Na fase de Reflexão, coloque 1 ideia em um debate cujo valor seja número primo.'],
      [4, 'Metempsicose', 'Troque Pitágoras por um outro filósofo da mesa. Catedráticos não são afetados.'],
      [6, 'Razão Áurea', 'Todos os filósofos gregos, inclusive Pitágoras, recebem +3 ideias.']),
    F('diogenes', 'de Sínope', 'Diógenes', 1, 'grega', [2, 1, 3, 2], 'Sínope, Jônia', '412 – 323 a.C.', '—',
      'Na casa de um rico não há lugar para se cuspir, a não ser em sua cara.', 'anedota em Diógenes Laércio, VI',
      ['Barrica de Diógenes', 'Proteção contra Conceitos negativos de Catedráticos adversários.'],
      [5, 'Cínicos – Vivendo como um cão', 'Livre-se dos bens materiais: elimine todas as Legados do jogo.'],
      [6, 'Lanterna de Diógenes', 'Baixe o Legado Lanterna de Diógenes. Gera 2 ideias na Reflexão.']),

    F('marx', 'Karl', 'Marx', 5, 'mat', [4, 3, 5, 2], 'Tréveris, Prússia', '1818 – 1883', 'O Capital',
      'Os filósofos apenas interpretaram o mundo de diferentes maneiras; o que importa é transformá-lo.', 'Teses sobre Feuerbach, 11',
      ['Mais-Valia', 'Na fase de Reflexão de Marx, um filósofo de um oponente perde 1 ideia.'],
      [3, 'Luta de Classes', 'Substitua todos os Catedráticos pelo filósofo de menor valor no grupo.'],
      [7, 'Comunismo', 'Expurgo! Remova todos os Catedráticos, exceto Marx.']),
    F('hegel', 'Georg', 'Hegel', 4, 'mat', [4, 4, 3, 3], 'Stuttgart, Alemanha', '1770 – 1831', 'Fenomenologia do Espírito',
      'O que é racional é real, e o que é real é racional.', 'Filosofia do Direito, prefácio',
      ['“Toda realidade é um processo histórico”', 'Se for Catedrático, Hegel move para um debate quantas ideias tiver, sem o teto da área.'],
      [4, '“Estruturas de pensamento são mutáveis”', 'Transporte até 5 ideias de qualquer filósofo para outro filósofo.'],
      [7, 'Dialética Hegeliana', 'Converta todas as ideias adversárias de um debate de que você participa para sua cor.']),
    F('hobbes', 'Thomas', 'Hobbes', 3, 'mat', [3, 4, 4, 2], 'Malmesbury, Inglaterra', '1588 – 1679', 'Leviatã',
      'O homem é o lobo do homem.', 'Do Cidadão, dedicatória',
      ['“Tudo no Universo é físico”', 'Na fase de Reflexão, elimine 1 ideia de um oponente em um debate de Lógica / Ciência.'],
      [5, '“O mais fraco tem força para matar o forte”', 'Substitua um filósofo de valor 4 ou 5 por um de valor 1 de sua mão.'],
      [6, 'Leviatã', 'Baixe o Legado. Elimine as cartas da mão de um jogador. Ativação: 4 ideias.']),
    F('bacon', 'Francis', 'Bacon', 2, 'mat', [1, 4, 2, 2], 'Londres, Inglaterra', '1561 – 1626', 'O progresso do conhecimento',
      'A natureza só é comandada se é obedecida.', 'Novum Organum, I, 3',
      ['“Conhecimento é poder”', 'Na fase de Reflexão de Bacon, veja duas cartas na mão de um jogador.'],
      [5, '“O dinheiro é bom criado, mas mau senhor”', 'Elimine 2 ideias de todos os filósofos de uma escola à sua escolha.'],
      [6, 'O Método Científico', 'Todos os debates ficam reduzidos a 1 ideia de cada jogador.']),
    F('locke', 'John', 'Locke', 1, 'mat', [1, 4, 3, 1], 'Wrington, Inglaterra', '1632 – 1704', 'Ensaio sobre o entendimento humano',
      'Não há nada na mente que não tenha passado antes pelos sentidos.', 'máxima empirista associada ao Ensaio',
      ['“A Mente é uma Tábula Rasa”', 'Filósofos não recebem ideias do Jogador no turno em que foram baixados.'],
      [3, '“Não existem ideias universais”', 'Teístas e Racionalistas não recebem ideias na Reflexão nesta rodada.'],
      [7, 'Direito natural ao autogoverno', 'Mova todas as ideias de seus filósofos para um debate de Ética / Política.']),
    F('rousseau', 'Jean-Jacques', 'Rousseau', 1, 'mat', [1, 1, 4, 2], 'Genebra', '1712 – 1778', 'Do Contrato Social',
      'O homem nasce livre, e por toda parte encontra-se a ferros.', 'Do Contrato Social, I, 1',
      ['Contrato Social', 'Na fase de Reflexão de Rousseau, todos os filósofos de custo 1 da mesa recebem +1 ideia.'],
      [4, 'A propriedade privada é um roubo', 'Elimine qualquer Legado. Use apenas uma vez.'],
      [6, 'O Bom Selvagem', 'Baixe o Legado. Na Reflexão, gera +2 ideias a redistribuir.']),

    F('kant', 'Immanuel', 'Kant', 5, 'germ', [3, 5, 5, 4], 'Königsberg, Prússia', '1724 – 1804', 'Crítica da Razão Pura',
      'Age sempre de tal modo que o teu comportamento possa vir a ser princípio de uma lei universal.', 'Fundamentação da Metafísica dos Costumes',
      ['Imperativo Categórico', 'Se um jogador compra sua carta extra, os demais também compram.'],
      [5, '“As coisas em si são incognoscíveis”', 'Elimine qualquer Legado.'],
      [7, '“Espaço e tempo são intuições da mente”', 'Jogue um turno extra, pulando sua fase do Jogador.']),
    F('nietzsche', 'Friedrich', 'Nietzsche', 4, 'germ', [5, 1, 4, 5], 'Röcken, Prússia', '1844 – 1900', 'Assim Falou Zaratustra',
      'Deus está morto.', 'A Gaia Ciência, § 125',
      ['Vontade de Poder', 'Se você não tiver Teístas, Nietzsche assume a cadeira de Catedrático sem custo.'],
      [4, '“Deus está morto”', 'Elimine a Legado Igreja ou Alma Imortal. Remova um Teísta de valor 1 ou 2.'],
      [5, 'Super-Homem', 'Legado. Um filósofo germânico em vaga extra, que ignora as regras alheias.']),
    F('schopenhauer', 'Arthur', 'Schopenhauer', 3, 'germ', [3, 2, 3, 4], 'Danzig', '1788 – 1860', 'O Mundo como Vontade e Representação',
      'O mundo é minha representação.', 'O Mundo como Vontade e Representação, § 1',
      ['Mestre e discípulo', 'Na fase de Reflexão, recebe +1 ideia se Kant, Freud ou Nietzsche estiverem no grupo.'],
      [5, 'Vontade Universal', 'Coloque +3 ideias em cada um dos debates de que você participa.'],
      [7, '“Os limites do mundo são os da minha visão”', 'Oponentes perdem até 5 ideias em todos os debates de que você participa.']),
    F('heidegger', 'Martin', 'Heidegger', 2, 'germ', [4, 2, 2, 2], 'Messkirch, Alemanha', '1889 – 1976', 'Ser e Tempo',
      'A linguagem é a morada do ser.', 'Carta sobre o Humanismo',
      ['Fenomenologia', 'Por 1 turno, um filósofo adversário aleatório paga +2 ideias para participar de debates.'],
      [4, 'A Morte e a Existência Humana', 'Elimine Heidegger e um filósofo de outra corrente que não a Germânica.'],
      [7, 'Ser e Tempo', 'Descarte sua mão e não compre cartas. Jogue um turno extra.']),
    F('freud', 'Sigmund', 'Freud', 1, 'germ', [2, 1, 1, 5], 'Freiberg, Morávia', '1856 – 1939', 'A Interpretação dos Sonhos',
      'O eu não é senhor em sua própria casa.', 'Uma dificuldade no caminho da psicanálise (1917)',
      ['O Inconsciente', 'Na fase de Reflexão, Freud pode mover 1 ideia para outro filósofo do grupo.'],
      [3, 'Divã', 'Baixe o Legado Divã. Um filósofo recebe +1 ideia na Reflexão.'],
      [6, 'Complexo de Édipo', 'Elimine um Filósofo Catedrático da mesa de jogo.']),
    F('arendt', 'Hannah', 'Arendt', 1, 'germ', [1, 1, 4, 3], 'Hannover, Alemanha', '1906 – 1975', 'A Condição Humana',
      'Toda dor pode ser suportada se sobre ela puder ser contada uma história.', 'citada em A Condição Humana (atribuída a Isak Dinesen)',
      ['A Condição Humana', 'Recebe +1 ideia na Reflexão se houver um debate de Ética / Política na mesa.'],
      [3, 'As Origens do Totalitarismo', 'Elimine 4 ideias dos oponentes em um debate de Ética de que você participe.'],
      [7, 'A Banalidade do Mal', 'Elimine todos os filósofos de custo 1 e 2 de uma escola não germânica. Uma vez por jogo.']),

    F('maquiavel', 'Nicolau', 'Maquiavel', 1, 'livre', [1, 1, 5, 2], 'Florença, Itália', '1469 – 1527', 'O Príncipe',
      'Vale mais fazer e arrepender-se que não fazer e arrepender-se.', 'atribuída; a conferir',
      ['O Príncipe', 'Mais poder ao soberano: seu Catedrático recebe +1 ideia na Reflexão.'],
      [5, '“Aliados hoje, inimigos amanhã”', 'Troque quaisquer dois filósofos da mesa entre você e um oponente.'],
      [6, '“Aos amigos, os favores; aos inimigos, a lei”', '+2 ideias para seus filósofos. Um oponente não baixa cartas na próxima rodada.']),
    F('erasmo', 'de Roterdã', 'Erasmo', 1, 'livre', [2, 1, 3, 2], 'Roterdã, Holanda', '1466 – 1536', 'Elogio da Loucura',
      'A pior das loucuras é tentar ser sensato em um mundo de loucos.', 'atribuída; a conferir',
      ['“A Religião é uma forma de loucura”', 'Na fase de Reflexão de Erasmo, um filósofo Teísta perde 2 ideias. (Sem Teístas neste protótipo.)'],
      [3, '“Os objetos da Felicidade são ilusórios”', 'Coloque +1 ideia em cada debate.'],
      [5, 'Elegância Retórica', 'Baixe o Legado. Seus filósofos recebem +1 ideia ao mover ideias para debates.'])
  ];

  var PRAXIS = [
    { id: 'autoridade',     nome: 'Argumento de Autoridade', custo: 4, sub: 'Falácia — “Doutor falou”',
      d: 'Escolha um debate do qual você já participa. Acrescente +5 ideias.' },
    { id: 'espantalho',     nome: 'Espantalho', custo: 5, sub: 'Falácia — caricatura do oponente',
      d: 'Num debate em que você e um oponente participam: +4 ideias para você e −4 para ele.' },
    { id: 'retorsio',       nome: 'Retorsio Argumenti', custo: 3, sub: 'Técnica — bumerangue',
      d: 'Use o argumento do oponente contra ele. Num debate seu em que ele tenha ao menos 3 ideias, mude 3 para a sua cor.' },
    { id: 'adhominem',      nome: 'Ad Hominem', custo: 2, sub: 'Falácia — ataque pessoal',
      d: 'Remova até 5 ideias de um filósofo oponente e acrescente a mesma quantidade em um debate do qual você participa.' },
    { id: 'reductio',       nome: 'Reductio ad Absurdum', custo: 3, sub: 'Técnica — redução ao absurdo',
      d: 'Reduza as ideias de um oponente em um debate pela metade.' },
    { id: 'sofisma',        nome: 'Sofisma', custo: 2, sub: 'Falácia — argumento enganoso',
      d: 'Num debate do qual você já participa: +2 ideias para você e −3 de um oponente.' },
    { id: 'petitio',        nome: 'Petitio Principii', custo: 3, sub: 'Falácia — petição de princípio',
      d: 'Demonstre uma tese partindo do princípio de que já é válida. Coloque 5 ideias em um filósofo seu que já esteja em ação e não tenha ideias.' },
    { id: 'mutatio',        nome: 'Mutatio Controversiae', custo: 3, sub: 'Falácia — mudando de assunto',
      d: 'Retire até 4 ideias suas de um debate e mova-as para qualquer outro debate na mesa.' },
    { id: 'falseabilidade', nome: 'Falseabilidade', custo: 2, sub: 'Técnica — critério de Popper',
      d: 'Elimine 5 ideias de um oponente em um debate de Lógica / Ciência do qual você participa.' }
  ];
  PRAXIS.forEach(function (p) { p.tipo = 'P'; p.falacia = /^Falácia/.test(p.sub); });

  function D(id, area, valor, q) { return { id: id, area: area, valor: valor, q: q }; }
  var DEBATES = [
    D('d01', 'logica', 15, 'O Universo é conhecível?'),
    D('d02', 'logica', 12, 'O Universo é matemático?'),
    D('d03', 'logica', 10, 'Como podemos conhecer a verdade?'),
    D('d04', 'meta', 15, 'Deus existe?'),
    D('d05', 'meta', 12, 'Temos uma alma?'),
    D('d06', 'meta', 10, 'Temos livre-arbítrio?'),
    D('d07', 'etica', 15, 'O que é o Bem?'),
    D('d08', 'etica', 12, 'Qual a melhor forma de governo?'),
    D('d09', 'etica', 10, 'Somos todos iguais?'),
    D('d10', 'psico', 15, 'O que é o Belo?'),
    D('d11', 'psico', 12, 'O que é o Amor?'),
    D('d12', 'psico', 10, 'É possível separar emoção da razão?'),
    D('d13', 'logica', 9, 'O que é o tempo?'),
    D('d14', 'logica', 7, 'Existem leis no Universo?'),
    D('d15', 'logica', 5, 'Como explicar os paradoxos?'),
    D('d16', 'meta', 9, 'Existe um propósito para o ser humano?'),
    D('d17', 'meta', 7, 'Por que existe algo em vez de nada?'),
    D('d18', 'meta', 5, 'Como distinguir verdade de ilusão?'),
    D('d19', 'etica', 9, 'O Estado é necessário?'),
    D('d20', 'etica', 7, 'Quando se pode fazer o mal?'),
    D('d21', 'etica', 5, 'Quem dita a moral?'),
    D('d22', 'psico', 9, 'O que move o ser humano?'),
    D('d23', 'psico', 7, 'Para que serve a arte?'),
    D('d24', 'psico', 5, 'Por que agimos contra nossos interesses?')
  ];

  // Relações históricas entre filósofos (notas em paráfrase, com fonte; todas a verificar).
  var RELACOES = [
    ['nietzsche', 'socrates', 'Nietzsche trata Sócrates como sintoma de decadência da cultura grega.', 'Crepúsculo dos Ídolos, “O problema de Sócrates”'],
    ['nietzsche', 'platao', 'Nietzsche chama o cristianismo de “platonismo para o povo” e vê em Platão a origem do desprezo pelo mundo sensível.', 'Além do Bem e do Mal, prefácio'],
    ['nietzsche', 'kant', 'Nietzsche ataca o imperativo categórico como moral impessoal, perigosa para a vida.', 'O Anticristo, § 11'],
    ['nietzsche', 'schopenhauer', 'Nietzsche teve Schopenhauer como mestre de juventude e depois rompeu com seu pessimismo.', 'Schopenhauer como Educador; Genealogia da Moral, III'],
    ['schopenhauer', 'kant', 'Schopenhauer se declara herdeiro de Kant, mas dedica um apêndice inteiro a criticá-lo.', 'O Mundo como Vontade e Representação, apêndice'],
    ['schopenhauer', 'hegel', 'Schopenhauer chamava Hegel de charlatão e marcava suas aulas no mesmo horário das dele, em Berlim.', 'O Mundo como Vontade e Representação, prefácio à 2ª ed.'],
    ['schopenhauer', 'platao', 'Schopenhauer aponta Platão e Kant como seus dois grandes mestres.', 'O Mundo como Vontade e Representação, prefácio à 1ª ed.'],
    ['marx', 'hegel', 'Marx diz que a dialética de Hegel está de cabeça para baixo e que é preciso invertê-la.', 'O Capital, posfácio à 2ª ed.'],
    ['marx', 'epicuro', 'A tese de doutorado de Marx compara as filosofias da natureza de Demócrito e de Epicuro.', 'Diferença entre as filosofias da natureza de Demócrito e Epicuro (1841)'],
    ['marx', 'aristoteles', 'Marx chama Aristóteles de grande pensador por ter sido o primeiro a analisar a forma do valor.', 'O Capital, livro I, cap. 1'],
    ['aristoteles', 'platao', 'Aristóteles critica a Ideia do Bem de seu mestre: a amizade é cara, mas a verdade vem antes.', 'Ética a Nicômaco, I, 6'],
    ['platao', 'socrates', 'Quase tudo o que sabemos de Sócrates vem dos diálogos de Platão, seu discípulo.', 'Apologia, Críton, Fédon'],
    ['diogenes', 'platao', 'Diógenes chamava as aulas de Platão de perda de tempo, e Platão o chamava de “um Sócrates enlouquecido”.', 'Diógenes Laércio, Vidas, VI, 24 e 54'],
    ['bacon', 'aristoteles', 'Bacon intitulou sua obra Novum Organum para substituir a lógica do Organon aristotélico.', 'Novum Organum (1620)'],
    ['hobbes', 'aristoteles', 'Hobbes rejeita a tese aristotélica de que o homem é naturalmente político.', 'Do Cidadão, I; Leviatã, XVII'],
    ['locke', 'hobbes', 'Locke distingue estado de natureza de estado de guerra, respondendo ao quadro traçado por Hobbes.', 'Segundo Tratado sobre o Governo, cap. III'],
    ['rousseau', 'hobbes', 'Rousseau acusa Hobbes de atribuir ao homem natural paixões que nascem da sociedade.', 'Discurso sobre a Origem da Desigualdade'],
    ['kant', 'rousseau', 'Kant escreveu que Rousseau o ensinou a respeitar os seres humanos.', 'Anotações às Observações sobre o Belo e o Sublime'],
    ['hegel', 'kant', 'Hegel critica o formalismo vazio da moral kantiana.', 'Filosofia do Direito, § 135'],
    ['hegel', 'socrates', 'Hegel vê em Sócrates o momento em que a consciência individual se volta contra os costumes da cidade.', 'Lições sobre a História da Filosofia'],
    ['heidegger', 'platao', 'Heidegger abre Ser e Tempo com uma passagem do Sofista, de Platão, sobre o sentido de “ser”.', 'Ser e Tempo, epígrafe'],
    ['heidegger', 'nietzsche', 'Heidegger dedicou anos de cursos a Nietzsche, que considerava o último metafísico do Ocidente.', 'Nietzsche (cursos de 1936–1940)'],
    ['heidegger', 'aristoteles', 'Os primeiros cursos de Heidegger são longas interpretações de Aristóteles.', 'Interpretações Fenomenológicas de Aristóteles'],
    ['arendt', 'heidegger', 'Arendt foi aluna de Heidegger em Marburgo e manteve com ele um diálogo crítico por toda a vida.', 'Martin Heidegger faz oitenta anos (1969)'],
    ['arendt', 'kant', 'Arendt buscou na Crítica do Juízo, de Kant, as bases de uma filosofia política.', 'Lições sobre a Filosofia Política de Kant'],
    ['arendt', 'marx', 'Arendt critica Marx por reduzir a ação política ao trabalho.', 'A Condição Humana, cap. III'],
    ['arendt', 'socrates', 'Para Arendt, Sócrates é o modelo do pensador que examina opiniões em público.', 'A Vida do Espírito, “Pensar”'],
    ['freud', 'schopenhauer', 'Freud reconhece que Schopenhauer antecipou a ideia de recalque.', 'Contribuição à História do Movimento Psicanalítico'],
    ['freud', 'nietzsche', 'Freud dizia evitar a leitura de Nietzsche por temer encontrar ali suas próprias descobertas.', 'Um Estudo Autobiográfico'],
    ['freud', 'platao', 'Freud aproxima sua noção de Eros do Eros de Platão.', 'Três Ensaios sobre a Teoria da Sexualidade, prefácio à 4ª ed.'],
    ['maquiavel', 'rousseau', 'Rousseau lê O Príncipe como livro dos republicanos: fingindo ensinar os reis, ensinou os povos.', 'Do Contrato Social, III, 6'],
    ['epicuro', 'platao', 'O Jardim de Epicuro nasceu como alternativa à Academia platônica: prazer sereno em vez de Ideias eternas.', 'Diógenes Laércio, Vidas, X']
  ];

  var CARTAS = {};
  FILOSOFOS.forEach(function (c) { CARTAS[c.id] = c; });
  PRAXIS.forEach(function (c) { CARTAS[c.id] = c; });
  var DEB = {};
  DEBATES.forEach(function (d) { DEB[d.id] = d; });

  function C(id) { return CARTAS[String(id).split('#')[0]]; }

  function relacao(a, b) {
    for (var i = 0; i < RELACOES.length; i++) {
      var r = RELACOES[i];
      if ((r[0] === a && r[1] === b) || (r[0] === b && r[1] === a)) return { a: r[0], b: r[1], nota: r[2], fonte: r[3], k: r[0] + '|' + r[1] };
    }
    return null;
  }

  // ---------- utilidades ----------
  function mulberry(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function rnd(s) { // RNG com estado dentro do próprio state (clonável)
    s.seed = (s.seed + 0x6D2B79F5) | 0;
    var t = Math.imul(s.seed ^ (s.seed >>> 15), 1 | s.seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function shuffle(s, arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(rnd(s) * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
  function clone(s) { return JSON.parse(JSON.stringify(s)); }
  function log(s, txt, cls, p) {
    if (s.mudo) return;
    s.log.push({ txt: txt, cls: cls || '', p: p === undefined ? -1 : p, r: s.round });
  }
  function nomeJ(s, p) { return s.players[p].nome; }
  function isPrime(n) { if (n < 2) return false; for (var i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; }

  // ---------- conteúdo do nível 2 ----------
  // Conceito primário reescrito para o digital (decisões de 15/11/2026).
  var C1 = {
    platao: ['A República', 'Na fase de Reflexão, o filósofo de maior custo do seu grupo — o Rei Filósofo — recebe +1 ideia.'],
    socrates: ['Maiêutica', 'Na fase de Reflexão, o colega de grupo com menos ideias recebe +1. Sócrates ajuda os outros a dar à luz ideias.'],
    epicuro: ['Laço de Amizade', 'Na fase de Reflexão, um filósofo vizinho recebe +1 ideia, e Epicuro também: a amizade é recíproca.'],
    diogenes: ['Barrica de Diógenes', 'Nenhum adversário pode escolher Diógenes como alvo nem tirar ideias dele. Não pode ser trocado. Na fase de Reflexão, se tiver 2 ideias ou menos, recebe +1: vive com o mínimo.'],
    marx: ['Mais-Valia', 'Na fase de Reflexão, o filósofo adversário com mais ideias perde 1.'],
    hegel: ['Dialética', 'Hegel é o único que pode levar a um debate menos que o valor da área: leva o que tiver, até o valor. Síntese: ao entrar num debate em que um adversário tem mais ideias que você, +1 ideia sua.'],
    locke: ['Tábula Rasa', 'Locke recebe +1 ideia sempre que você baixa uma carta e sempre que um adversário baixa um filósofo. As ideias vêm da experiência.'],
    kant: ['Imperativo Categórico', 'Quando Kant leva ideias a um debate de Ética / Política, cada colega em ação que tenha ideias põe 1 delas no mesmo debate, queira ou não.'],
    nietzsche: ['Filosofar com o martelo', 'Ao entrar num debate, o adversário com mais ideias nesse debate perde 2.'],
    schopenhauer: ['Negação da Vontade', 'Na fase de Reflexão, recebe +1 ideia se não foi a nenhum debate no turno anterior.'],
    heidegger: ['Ser-no-mundo', 'Na fase de Reflexão, recebe +1 ideia para cada debate em que você tem ideias.'],
    freud: ['Ato Falho', 'Freud recebe +1 ideia sempre que um adversário usa uma falácia.'],
    maquiavel: ['O Príncipe', 'Na fase de Reflexão, o filósofo com mais ideias do seu grupo recebe +1.'],
    erasmo: ['Elogio da Loucura', 'Na fase de Reflexão, o adversário que lidera um debate de Metafísica / Religião perde 1 ideia.'],
    hobbes: ['Guerra de todos contra todos', 'Na fase de Reflexão, o adversário com mais ideias num debate perde 1 ideia nesse debate.'],
    bacon: ['“Conhecimento é poder”', 'Na fase de Reflexão, Bacon espia duas cartas da mão de um adversário.'],
    rousseau: ['Contrato Social', 'Na fase de Reflexão, todos os filósofos de custo 1 da mesa recebem +1 ideia, inclusive os dos adversários.'],
    arendt: ['A Condição Humana', 'Na fase de Reflexão, recebe +1 ideia se houver um debate de Ética / Política na mesa.'],
    aristoteles: ['Silogismo – Premissa', 'Na fase de Reflexão, acrescenta +1 ideia sua a um debate de Lógica.'],
    pitagoras: ['Harmonia das Esferas', 'Na fase de Reflexão, acrescenta 1 ideia sua a um debate cujo valor seja número primo.']
  };
  Object.keys(C1).forEach(function (k) { CARTAS[k].c1 = { t: C1[k][0], d: C1[k][1] }; });


  // Citações da carta, obras e conceitos 2–3 alinhados à aba "Cartas v5" (16/11/2026).
  var CIT = {
    platao: ['O espanto é a única origem da filosofia.', 'Teeteto, 155d'],
    socrates: ['Pareço ser mais sábio apenas porque não penso saber o que não sei.', 'Platão, Apologia, 21d'],
    locke: ['Nenhum conhecimento humano pode ir além da sua experiência.', 'Ensaio, II, 1, 19'],
    nietzsche: ['Torna-te quem tu és.', 'A Gaia Ciência, §270; Ecce Homo (subtítulo)'],
    arendt: ['Ninguém tem o direito de obedecer.', 'entrevista a Joachim Fest (1964)'],
    maquiavel: ['É muito mais seguro ser temido do que amado, quando se tem de escolher.', 'O Príncipe, XVII'],
    erasmo: ['A guerra é doce para quem não a experimentou.', 'Adágios, IV, I, 1'],
    hobbes: ['O homem é o lobo do homem.', 'Do Cidadão, epístola dedicatória (de Plauto)'],
    pitagoras: ['Tudo é número.', 'atribuída pela tradição pitagórica (Aristóteles, Metafísica I, 5)']
  };
  Object.keys(CIT).forEach(function (k) { CARTAS[k].cit = CIT[k][0]; CARTAS[k].citFonte = CIT[k][1]; });
  CARTAS.epicuro.obra = 'Carta a Meneceu'; CARTAS.bacon.obra = 'Novum Organum'; CARTAS.diogenes.obra = '— (não deixou obra)';
  CARTAS.hegel.pre = 'Georg W. F.'; CARTAS.pitagoras.datas = 'c. 570 – c. 495 a.C.';
  var C23 = {
    platao: [null, null, null, 'A Caverna de Platão', 'Baixe o Legado Caverna de Platão: todos os Gregos ficam imunes a efeitos negativos.'],
    pitagoras: ['Metempsicose', 'Troque Pitágoras por outro filósofo da mesa.'],
    diogenes: ['Cínicos – Vivendo como um cão', 'Livre-se dos bens materiais: elimine todos os Legados do jogo. Uma vez por partida.', null, 'Lanterna de Diógenes', 'Baixe o Legado Lanterna de Diógenes: gera +2 ideias na Reflexão.'],
    epicuro: ['O Jardim', 'Baixe o Legado Jardim de Epicuro: aliados não perdem ideias; gera +1 ideia na Reflexão.'],
    marx: ['Luta de Classes', 'Substitua o filósofo de maior custo de cada oponente pelo de menor custo do grupo dele.', null, 'Comunismo', 'Expurgo! Elimine o filósofo de maior custo de cada oponente.'],
    hobbes: [null, null, null, 'Leviatã', 'Baixe o Legado Leviatã. Ativação: 4 ideias. Elimine as cartas da mão de um jogador.'],
    locke: ['“Não existem ideias inatas”', 'Teístas e Racionalistas não recebem ideias na Reflexão nesta rodada.'],
    rousseau: ['O primeiro que cercou um terreno', 'Elimine qualquer Legado. Uma vez por partida.', null, 'O Bom Selvagem', 'Baixe o Legado O Bom Selvagem: gera +2 ideias na Reflexão, a redistribuir.'],
    kant: ['“As coisas em si são incognoscíveis”', 'Elimine qualquer Legado.', null, '“Espaço e tempo são intuições da mente”', 'Jogue um turno extra, sem a compra e sem a Biblioteca.'],
    nietzsche: ['“Deus está morto”', 'Elimine o Legado Igreja ou Alma Imortal. Remova um Teísta de custo 1 ou 2.', null, 'Super-Homem', 'Baixe o Legado Super-Homem: um filósofo germânico em cadeira extra, imune às regras alheias.'],
    schopenhauer: [null, null, null, '“O mundo é minha representação”', 'Oponentes perdem até 5 ideias em todos os debates dos quais você participa.'],
    freud: ['Divã', 'Baixe o Legado Divã: um filósofo recebe +1 ideia na Reflexão.', null, 'Complexo de Édipo', 'Elimine o filósofo de maior custo de um oponente.'],
    erasmo: [null, null, null, 'Elegância Retórica', 'Baixe o Legado Elegância Retórica: seus filósofos recebem +1 ideia ao levar ideias a debates.']
  };
  Object.keys(C23).forEach(function (k) {
    var v = C23[k], c = CARTAS[k];
    if (v[0]) c.c2.t = v[0]; if (v[1]) c.c2.d = v[1]; if (v[3]) c.c3.t = v[3]; if (v[4]) c.c3.d = v[4];
  });

  // Duplas clássicas: [filósofo, parceiro, motivo]. Desde 18/11/2026 cada um dos dois recebe +1 na Reflexão;
  // quem está em duas duplas completas (Platão) recebe +1 por dupla.
  var DUPLAS = [
    ['platao', 'socrates', 'Sócrates fala pela pena de Platão.'],
    ['aristoteles', 'platao', 'Vinte anos de Academia ao lado do mestre.'],
    ['marx', 'hegel', 'A dialética herdada, posta de pé.'],
    ['schopenhauer', 'kant', 'O herdeiro declarado de Kant.'],
    ['arendt', 'heidegger', 'A aluna de Marburgo.']
  ];
  var BONUS_DUPLA = 1;
  function duplasDe(id) {
    var out = [];
    DUPLAS.forEach(function (d) { if (d[0] === id) out.push({ par: d[1], motivo: d[2] }); else if (d[1] === id) out.push({ par: d[0], motivo: d[2] }); });
    return out;
  }

  // Relações acrescentadas nesta versão (a verificar).
  [
    ['kant', 'platao', 'Kant compara Platão a uma pomba que, sentindo a resistência do ar, imagina voar melhor no vácuo.', 'Crítica da Razão Pura, Introdução (B 8–9)'],
    ['kant', 'aristoteles', 'Kant afirma que a lógica não deu um passo adiante nem atrás desde Aristóteles.', 'Crítica da Razão Pura, prefácio à 2ª ed. (B VIII)'],
    ['hobbes', 'bacon', 'O jovem Hobbes serviu de secretário a Bacon, anotando seus pensamentos durante os passeios.', 'John Aubrey, Brief Lives'],
    ['rousseau', 'locke', 'Rousseau discute a pedagogia de Locke: raciocinar com crianças é começar pelo fim.', 'Emílio, livro II'],
    ['nietzsche', 'epicuro', 'Nietzsche admira em Epicuro a felicidade de quem contempla o mar da existência já serenado.', 'A Gaia Ciência, § 45'],
    ['erasmo', 'socrates', 'Um personagem de Erasmo, comovido, quase diz: “São Sócrates, rogai por nós”.', 'Colóquios, “O banquete religioso”'],
    ['pitagoras', 'platao', 'A cosmologia matemática de Platão deve muito aos pitagóricos.', 'Timeu; Aristóteles, Metafísica I, 6'],
    ['hegel', 'aristoteles', 'Hegel considera Aristóteles um dos gênios mais ricos e profundos que já existiram.', 'Lições sobre a História da Filosofia'],
    ['locke', 'bacon', 'O empirismo de Locke herda de Bacon a confiança na experiência contra a autoridade.', 'Ensaio sobre o Entendimento Humano, Epístola ao leitor'],
    ['maquiavel', 'aristoteles', 'Maquiavel troca a pergunta clássica pelo melhor regime pela pergunta de como o poder de fato se conquista e se mantém.', 'O Príncipe, cap. XV']
  ].forEach(function (r) { RELACOES.push(r); });

  // ---------- preparação ----------
  var PADRAO = { pontos: 30, rodadas: 12, debInicial: 2, novoDebate: [4], copiasPraxis: 1, bibPorTurno: 3, custoTroca: 5, teto: 10, maoInicial: 3 };
  var REFLEXAO = [0, 1, 1, 2, 2, 3];

  function fx(s, e) { if (!s.mudo) s.fx.push(e); }
  function nI(n) { return n === 1 || n === -1 ? n + ' ideia' : n + ' ideias'; }
  // ganho do próprio filósofo; se ele é o Bibliotecário, vai para a Biblioteca
  // teto de ideias por filósofo (decisão de 18/11/2026): o que passa do teto se perde. Devolve quanto entrou.
  function poe(s, g, n) { var a = Math.max(0, Math.min(n, s.cfg.teto - g.ideas)); g.ideas += a; return a; }
  function ganha(s, P, g, n) { if (g.lib) s.players[P].library += n; else poe(s, g, n); }
  function semLib(pl) { return pl.group.filter(function (x) { return !x.lib; }); }
  function FALAS() { return root.BF_FALAS || null; }

  function newGame(opt) {
    opt = opt || {};
    var cfg = {};
    Object.keys(PADRAO).forEach(function (k) { cfg[k] = opt[k] !== undefined ? opt[k] : PADRAO[k]; });
    var s = {
      seed: (opt.seed !== undefined ? opt.seed : Math.floor(Math.random() * 2147483647)) | 0,
      cfg: cfg, round: 1, turn: 0, phase: 'acao', over: false, vencedor: -1,
      players: [], deck: [], discard: [], debates: [], debDeck: [], log: [], fx: [],
      vistos: {}, falados: {}, stat: {}, mudo: !!opt.mudo
    };
    var nomes = opt.nomes || ['Você', 'Hipátia', 'Sêneca'];
    var cores = ['#e9b93f', '#3fc1d6', '#ea6a97'];
    for (var i = 0; i < 3; i++) {
      s.players.push({
        nome: nomes[i], cor: cores[i], human: opt.humans ? !!opt.humans[i] : i === 0,
        nivel: opt.niveis ? opt.niveis[i] : 'mestre',
        hand: [], group: [], library: 0, points: 0, won: [], boughtExtra: false, trocou: false
      });
    }
    FILOSOFOS.forEach(function (f) { s.deck.push(f.id); });
    PRAXIS.forEach(function (p) { for (var k = 1; k <= cfg.copiasPraxis; k++) s.deck.push(p.id + '#' + k); });
    shuffle(s, s.deck);
    s.players.forEach(function (pl) {
      for (var j = s.deck.length - 1; j >= 0; j--) {
        var c = C(s.deck[j]);
        if (c.tipo === 'F' && c.custo === 1) { pl.hand.push(s.deck.splice(j, 1)[0]); break; }
      }
    });
    // mão inicial: o filósofo de custo 1 e mais maoInicial cartas (3 desde 19/11/2026; antes, 4)
    s.players.forEach(function (pl) { for (var k = 0; k < cfg.maoInicial; k++) pl.hand.push(s.deck.pop()); });
    DEBATES.forEach(function (d) { s.debDeck.push(d.id); });
    shuffle(s, s.debDeck);
    for (var d = 0; d < cfg.debInicial; d++) addDebate(s);
    log(s, 'Começa a partida. Vence quem chegar a ' + cfg.pontos + ' pontos, ou quem tiver mais ao fim de ' + cfg.rodadas + ' rodadas.', 'sis');
    startTurn(s);
    return s;
  }

  function addDebate(s) {
    if (!s.debDeck.length || s.debates.length >= 3) return false;
    var id = s.debDeck.pop();
    s.debates.push({ id: id, stakes: [0, 0, 0], part: [[], [], []] });
    log(s, 'Novo debate na Ágora: «' + DEB[id].q + '» (' + AREA[DEB[id].area].curto + ', vale ' + DEB[id].valor + ').', 'novo');
    return true;
  }

  // ---------- consultas ----------
  function inGroup(pl, id) { for (var i = 0; i < pl.group.length; i++) if (pl.group[i].id === id) return pl.group[i]; return null; }
  function oppMax(d, P) { var m = 0; for (var i = 0; i < d.stakes.length; i++) if (i !== P && d.stakes[i] > m) m = d.stakes[i]; return m; }
  function lidera(s, di, P) { var d = s.debates[di]; return d.stakes[P] >= DEB[d.id].valor && d.stakes[P] > oppMax(d, P); }
  function ativo(g) { return !g.novo; }
  // Diógenes: nenhum adversário o escolhe como alvo nem tira ideias dele; não pode ser trocado (nem pelo dono).
  function imune(g) { return g.id === 'diogenes'; }
  function trocavel(g) { return !g.lib && !imune(g); }
  function temColega(pl, g) {
    for (var i = 0; i < pl.group.length; i++) if (pl.group[i] !== g && C(pl.group[i].id).escola === C(g.id).escola) return true;
    return false;
  }

  // ---------- turno ----------
  function startTurn(s) {
    var P = s.turn, pl = s.players[P];
    pl.boughtExtra = false;
    // recém-baixados (por baixa ou por troca) entram em ação no início do próximo turno do dono
    pl.group.forEach(function (g) { g.novo = false; });
    log(s, 'Rodada ' + s.round + ' — turno de ' + pl.nome + '.', 'turno', P);
    fx(s, { k: 'turno', P: P });
    for (var i = s.debates.length - 1; i >= 0; i--) {
      if (lidera(s, i, P)) win(s, P, i, 'sustentou a liderança até seu turno');
    }
    draw(s, P, 1);
    pl.library += s.cfg.bibPorTurno;
    fx(s, { k: 'bib', P: P, n: s.cfg.bibPorTurno });
    log(s, pl.nome + ' compra uma carta; a Biblioteca recebe ' + nI(s.cfg.bibPorTurno) + ' e fica com ' + nI(pl.library) + '.', 'sis', P);
    reflexao(s, P);
    s.phase = 'acao';
  }

  function win(s, P, di, motivo) {
    var d = s.debates[di], q = DEB[d.id], pl = s.players[P];
    pl.points += q.valor;
    pl.won.push(d.id);
    log(s, pl.nome + ' vence o debate «' + q.q + '» e marca ' + q.valor + ' pontos (' + motivo + ').', 'vit', P);
    fx(s, { k: 'vit', P: P, q: q.q, valor: q.valor, di: di, did: d.id, area: q.area, stakes: d.stakes.slice() });
    s.debates.splice(di, 1);
    if (s.debDeck.length) {
      var id = s.debDeck.pop();
      s.debates.splice(di, 0, { id: id, stakes: [0, 0, 0], part: [[], [], []] });
      log(s, 'Novo debate na Ágora: «' + DEB[id].q + '» (' + AREA[DEB[id].area].curto + ', vale ' + DEB[id].valor + ').', 'novo');
    }
  }

  function checkInstant(s, P) {
    for (var i = s.debates.length - 1; i >= 0; i--) {
      var d = s.debates[i];
      if (d.stakes[P] >= 2 * DEB[d.id].valor) win(s, P, i, 'vitória instantânea, com o dobro do valor');
    }
  }

  function melhorDebate(s, P, filtro) {
    var best = -1, bv = -1;
    for (var i = 0; i < s.debates.length; i++) {
      if (!filtro(DEB[s.debates[i].id])) continue;
      var v = s.debates[i].stakes[P] * 100 + DEB[s.debates[i].id].valor;
      if (v > bv) { bv = v; best = i; }
    }
    return best;
  }

  function pop(s, P, id, tit, txt, tom) {
    fx(s, { k: 'pop', P: P, id: id, tit: tit, txt: txt, tom: tom || 'con' });
  }

  function reflexao(s, P) {
    var pl = s.players[P], g, i, anunciadas = {};
    if (!pl.group.length) return;
    for (i = 0; i < pl.group.length; i++) {
      g = pl.group[i];
      if (g.lib) {
        if (ativo(g)) {
          var prod = C(g.id).custo; pl.library += prod;
          pop(s, P, g.id, 'Bibliotecário · ' + C(g.id).nome, '+' + nI(prod) + ' para a Biblioteca', 'lib');
          log(s, 'Bibliotecário: ' + C(g.id).nome + ' produz ' + nI(prod) + ' para a Biblioteca.', 'con', P);
        }
        continue;
      }
      var base = REFLEXAO[C(g.id).custo], esc = temColega(pl, g) ? 1 : 0;
      var pares = duplasDe(g.id).filter(function (x) { return inGroup(pl, x.par); }), dup = pares.length * BONUS_DUPLA;
      var tot = base + esc + dup, entrou = poe(s, g, tot);
      var partes = ['Reflexão ' + base];
      if (esc) partes.push('Escola ' + esc);
      pares.forEach(function (x) { partes.push('Dupla com ' + C(x.par).nome + ' ' + BONUS_DUPLA); });
      if (entrou < tot) partes.push('teto de ' + s.cfg.teto + ': ' + (tot - entrou) + ' se perde' + (tot - entrou > 1 ? 'm' : ''));
      pop(s, P, g.id, C(g.id).nome + ' +' + entrou, partes.join(' · '), dup ? 'dupla' : esc ? 'esc' : 'ref');
      pares.forEach(function (x) {
        var chave = [g.id, x.par].sort().join('|');
        if (anunciadas[chave]) return;
        anunciadas[chave] = 1;
        fx(s, { k: 'dupla', P: P, a: g.id, b: x.par });
        log(s, 'Dupla clássica: ' + C(g.id).nome + ' com ' + C(x.par).nome + ' (+' + BONUS_DUPLA + ' para cada um; o Bibliotecário não recebe).', 'con', P);
      });
    }
    for (i = 0; i < pl.group.length; i++) conceitoReflexao(s, P, pl.group[i], i);
    checkInstant(s, P);
  }

  function conceitoReflexao(s, P, g, idx) {
    var pl = s.players[P], di, o, j, t, c = C(g.id), nome = c.c1.t;
    function diz(txt, tom) { pop(s, P, g.id, c.nome + ' · ' + nome, txt, tom); log(s, nome + ' (' + c.nome + '): ' + txt, tom === 'neg' ? 'neg' : 'con', P); }
    switch (g.id) {
      case 'aristoteles':
        di = melhorDebate(s, P, function (q) { return q.area === 'logica'; });
        if (di >= 0) { s.debates[di].stakes[P] += 1; marcaPart(s, di, P, g.id); diz('+1 ideia em «' + DEB[s.debates[di].id].q + '».'); }
        break;
      case 'platao':
        t = null; semLib(pl).forEach(function (x) { if (!t || C(x.id).custo > C(t.id).custo) t = x; });
        if (t) { poe(s, t, 1); diz('+1 ideia para ' + C(t.id).nome + ', o Rei Filósofo.'); }
        break;
      case 'socrates':
        t = null;
        semLib(pl).forEach(function (x) { if (x !== g && (!t || x.ideas < t.ideas)) t = x; });
        if (t) { poe(s, t, 1); diz('+1 ideia para ' + C(t.id).nome + '.'); }
        break;
      case 'epicuro':
        var viz = [];
        if (idx > 0 && !pl.group[idx - 1].lib) viz.push(pl.group[idx - 1]);
        if (idx < pl.group.length - 1 && !pl.group[idx + 1].lib) viz.push(pl.group[idx + 1]);
        if (viz.length) {
          t = viz[0];
          if (viz[1] && viz[1].ideas < t.ideas) t = viz[1];
          poe(s, t, 1); ganha(s, P, g, 1); diz('+1 ideia para ' + C(t.id).nome + ' e para Epicuro.');
        }
        break;
      case 'pitagoras':
        di = melhorDebate(s, P, function (q) { return isPrime(q.valor); });
        if (di >= 0) { s.debates[di].stakes[P] += 1; marcaPart(s, di, P, g.id); diz('+1 ideia em «' + DEB[s.debates[di].id].q + '», de valor ' + DEB[s.debates[di].id].valor + '.'); }
        break;
      case 'marx':
        t = null; var dono = -1;
        for (o = 0; o < s.players.length; o++) {
          if (o === P) continue;
          for (j = 0; j < s.players[o].group.length; j++) {
            var x = s.players[o].group[j];
            if (x.ideas <= 0 || imune(x) || x.lib) continue;
            if (!t || x.ideas > t.ideas) { t = x; dono = o; }
          }
        }
        if (t) { t.ideas -= 1; diz(C(t.id).nome + ' (' + nomeJ(s, dono) + ') perde 1 ideia.', 'neg'); pop(s, dono, t.id, '−1 ideia', 'Mais-Valia de Marx', 'neg'); }
        break;
      case 'hobbes':
        var bd = -1, bo = -1, bv = 0;
        for (di = 0; di < s.debates.length; di++) {
          for (o = 0; o < s.players.length; o++) if (o !== P && s.debates[di].stakes[o] > bv) { bv = s.debates[di].stakes[o]; bd = di; bo = o; }
        }
        if (bd >= 0) { s.debates[bd].stakes[bo] -= 1; diz(nomeJ(s, bo) + ' perde 1 ideia em «' + DEB[s.debates[bd].id].q + '».', 'neg'); }
        break;
      case 'bacon':
        if (pl.human) {
          var alvo = -1;
          for (o = 0; o < s.players.length; o++) if (o !== P && (alvo < 0 || s.players[o].hand.length > s.players[alvo].hand.length)) alvo = o;
          if (alvo >= 0 && s.players[alvo].hand.length) {
            var mao = s.players[alvo].hand.slice();
            shuffle(s, mao);
            diz('Na mão de ' + nomeJ(s, alvo) + ': ' + mao.slice(0, 2).map(function (x) { return C(x).nome; }).join(' e ') + '.');
          }
        }
        break;
      case 'rousseau':
        var n = 0;
        for (o = 0; o < s.players.length; o++) for (j = 0; j < s.players[o].group.length; j++) {
          var y = s.players[o].group[j];
          if (C(y.id).custo === 1 && ativo(y) && !y.lib) { poe(s, y, 1); n++; }
        }
        diz('+1 ideia para cada filósofo de custo 1 da mesa (' + n + ').');
        break;
      case 'schopenhauer':
        if (!g.foiAnt) { ganha(s, P, g, 1); diz('+1 ideia por não ter debatido no turno anterior.'); }
        break;
      case 'heidegger':
        var k = 0;
        for (di = 0; di < s.debates.length; di++) if (s.debates[di].stakes[P] > 0) k++;
        if (k) { ganha(s, P, g, k); diz('+' + nI(k) + ': presente em ' + k + (k > 1 ? ' debates.' : ' debate.')); }
        break;
      case 'arendt':
        if (s.debates.some(function (d) { return DEB[d.id].area === 'etica'; })) { ganha(s, P, g, 1); diz('+1 ideia: há debate de Ética na mesa.'); }
        break;
      case 'maquiavel':
        t = null; semLib(pl).forEach(function (x) { if (!t || x.ideas > t.ideas) t = x; });
        if (t) { poe(s, t, 1); diz('+1 ideia para ' + C(t.id).nome + ', quem tem mais ideias.'); }
        break;
      case 'diogenes':
        if (g.ideas <= 2) { ganha(s, P, g, 1); diz('+1 ideia: vive com o mínimo.'); }
        break;
      case 'erasmo':
        var ed = -1, eo = -1, ev = 0;
        for (di = 0; di < s.debates.length; di++) {
          if (DEB[s.debates[di].id].area !== 'meta') continue;
          for (o = 0; o < s.players.length; o++) if (o !== P && s.debates[di].stakes[o] > ev) { ev = s.debates[di].stakes[o]; ed = di; eo = o; }
        }
        if (ed >= 0) { s.debates[ed].stakes[eo] -= 1; diz(nomeJ(s, eo) + ' perde 1 ideia em «' + DEB[s.debates[ed].id].q + '».', 'neg'); }
        break;
    }
  }

  function marcaPart(s, di, P, id) {
    var d = s.debates[di];
    if (d.part[P].indexOf(id) < 0) d.part[P].push(id);
  }

  // ---------- ações ----------
  function moveOptions(s, P, fi) {
    var pl = s.players[P], g = pl.group[fi], out = [];
    if (!g || g.lib || g.acted || s.over || s.turn !== P || !ativo(g) || g.ideas <= 0) return out;
    var c = C(g.id);
    for (var i = 0; i < s.debates.length; i++) {
      var cap = c.vals[DEB[s.debates[i].id].area];
      if (g.id === 'hegel') out.push({ di: i, amt: Math.min(cap, g.ideas), cap: cap });
      else if (g.ideas >= cap) out.push({ di: i, amt: cap, cap: cap });
    }
    return out;
  }
  function porqueNao(s, P, fi) {
    var g = s.players[P].group[fi];
    if (!g) return '';
    if (g.lib) return 'É o Bibliotecário: não participa dos debates.';
    if (!ativo(g)) return 'Acabou de chegar: entrará em ação no próximo turno.';
    if (g.acted) return 'Já foi a um debate neste turno.';
    return 'Ainda não tem ideias suficientes: precisa do valor exato da área do debate.';
  }

  function moveToDebate(s, P, fi, di) {
    var opts = moveOptions(s, P, fi), o = null, k;
    for (var i = 0; i < opts.length; i++) if (opts[i].di === di) o = opts[i];
    if (!o) return false;
    var pl = s.players[P], g = pl.group[fi], d = s.debates[di], q = DEB[d.id], c = C(g.id);
    g.ideas -= o.amt; g.acted = true; g.foi = true;
    d.stakes[P] += o.amt;
    s.stat[c.custo] = (s.stat[c.custo] || 0) + o.amt;
    log(s, c.nome + ' leva ' + nI(o.amt) + ' a «' + q.q + '».', 'mov', P);
    var par = g.id + '|' + d.id, primeira = !s.falados[par];
    s.falados[par] = 1;
    var rels = [];
    for (var op = 0; op < s.players.length; op++) {
      if (op === P) continue;
      for (k = 0; k < d.part[op].length; k++) {
        var r = relacao(g.id, d.part[op][k]);
        if (r && !s.vistos[r.k]) {
          s.vistos[r.k] = 1;
          rels.push({ a: g.id, b: d.part[op][k], nota: r.nota, fonte: r.fonte, op: op });
          log(s, C(r.a).nome + ' × ' + C(r.b).nome + ': ' + r.nota + ' · ' + r.fonte, 'rel', P);
        }
      }
    }
    var fala = FALAS() && FALAS()[g.id] ? FALAS()[g.id][d.id] : null;
    if (primeira && fala) log(s, c.nome + ' sobre «' + q.q + '»: ' + fala[1] + ' · ' + fala[2], 'cita', P);
    fx(s, { k: 'debate', P: P, id: g.id, di: di, did: d.id, amt: o.amt, primeira: primeira, fala: primeira ? fala : null, rels: rels });
    marcaPart(s, di, P, g.id);
    if (g.id === 'kant' && q.area === 'etica') {
      var n = 0;
      pl.group.forEach(function (x) {
        if (x !== g && !x.lib && ativo(x) && x.ideas >= 1) { x.ideas -= 1; d.stakes[P] += 1; n++; marcaPart(s, di, P, x.id); fx(s, { k: 'segue', P: P, id: x.id, di: di, did: d.id }); }
      });
      if (n) { pop(s, P, 'kant', 'Imperativo Categórico', n + ' colega(s) acrescentam 1 ideia cada ao debate.'); log(s, 'Imperativo Categórico: ' + n + ' colega(s) de Kant acrescentam 1 ideia cada.', 'con', P); }
    }
    if (g.id === 'hegel' && oppMax(d, P) > d.stakes[P] - o.amt) {   // Síntese (desde 19/11/2026)
      d.stakes[P] += 1; pop(s, P, 'hegel', 'Síntese', '+1 ideia no debate: a tese encontrou a antítese.');
    }
    if (g.id === 'nietzsche') {
      var mo = -1, mv = 0;
      for (var oo = 0; oo < s.players.length; oo++) if (oo !== P && d.stakes[oo] > mv) { mv = d.stakes[oo]; mo = oo; }
      if (mo >= 0) {
        var perde = Math.min(2, d.stakes[mo]);
        d.stakes[mo] -= perde;
        pop(s, P, 'nietzsche', 'Filosofar com o martelo', nomeJ(s, mo) + ' perde ' + nI(perde) + ' em «' + q.q + '».');
        log(s, 'Filosofar com o martelo: ' + nomeJ(s, mo) + ' perde ' + nI(perde) + ' em «' + q.q + '».', 'con', P);
      }
    }
    checkInstant(s, P);
    return true;
  }

  function draw(s, P, n) {
    for (var i = 0; i < n; i++) {
      if (!s.deck.length && s.discard.length) { s.deck = shuffle(s, s.discard); s.discard = []; log(s, 'A pilha de descartes foi reembaralhada.', 'sis'); }
      if (!s.deck.length) return;
      s.players[P].hand.push(s.deck.pop());
    }
  }

  function gatilhoLocke(s, P, idBaixado) {
    // desde 19/11/2026, Locke ganha também quando um adversário baixa um filósofo (não as cartas temporárias)
    for (var oL = 0; oL < s.players.length && C(idBaixado).tipo === 'F'; oL++) {
      if (oL === P) continue;
      var lo = inGroup(s.players[oL], 'locke');
      if (lo && ativo(lo)) { ganha(s, oL, lo, 1); pop(s, oL, 'locke', 'Tábula Rasa', '+1 ideia: ' + nomeJ(s, P) + ' baixou um filósofo.'); }
    }
    var l = inGroup(s.players[P], 'locke');
    if (l && ativo(l) && idBaixado !== 'locke') { ganha(s, P, l, 1); pop(s, P, 'locke', 'Tábula Rasa', '+1 ideia: você baixou uma carta.'); }
  }

  function libIdx(pl) { for (var i = 0; i < pl.group.length; i++) if (pl.group[i].lib) return i; return -1; }
  function playPhilosopher(s, P, cardId, replaceIdx, comoLib) {
    var pl = s.players[P], c = C(cardId), hi = pl.hand.indexOf(cardId);
    if (s.over || s.turn !== P || hi < 0 || c.tipo !== 'F' || pl.library < c.custo) return false;
    if (comoLib) { var li = libIdx(pl); if (li >= 0) replaceIdx = li; else if (pl.group.length >= 4 && replaceIdx === undefined) return false; }
    var novo = { id: c.id, ideas: 0, novo: true, acted: false, given: 0, foi: false, foiAnt: false, lib: !!comoLib };
    if (pl.group.length >= 4 || replaceIdx !== undefined) {
      if (replaceIdx === undefined || !pl.group[replaceIdx]) return false;
      var old = pl.group[replaceIdx];
      s.discard.push(old.id);
      pl.group[replaceIdx] = novo;
      log(s, pl.nome + ' baixa ' + c.nome + (comoLib ? ' como Bibliotecário' : '') + ' no lugar de ' + C(old.id).nome + '.', 'carta', P);
    } else {
      pl.group.push(novo);
      log(s, pl.nome + ' baixa ' + c.nome + ' (' + ESCOLA[c.escola].nome + ')' + (comoLib ? ' como Bibliotecário' : '') + '.', 'carta', P);
    }
    pl.library -= c.custo;
    pl.hand.splice(hi, 1);
    fx(s, { k: 'baixa', P: P, id: c.id, lib: !!comoLib });
    gatilhoLocke(s, P, c.id);
    return true;
  }

  function canGive(s, P, fi) {
    var pl = s.players[P], g = pl.group[fi];
    return !(s.over || s.turn !== P || !g || g.lib || pl.library < 1 || !ativo(g) || g.ideas >= s.cfg.teto);
  }
  function giveIdea(s, P, fi, quieto) {
    if (!canGive(s, P, fi)) return false;
    var pl = s.players[P], g = pl.group[fi];
    pl.library -= 1; g.ideas += 1; g.given += 1;
    if (!quieto) fx(s, { k: 'dar', P: P, id: g.id, n: 1 });
    return true;
  }

  function podeTrocar(s, P) { var pl = s.players[P]; return !s.over && s.turn === P && !pl.trocou && pl.library >= s.cfg.custoTroca && pl.group.some(trocavel); }
  function trocar(s, P, mi, o, oi) {
    var pl = s.players[P], op = s.players[o], a = pl.group[mi], b = op && op.group[oi];
    if (!podeTrocar(s, P) || o === P || !a || !b || !trocavel(a) || !trocavel(b)) return false;
    pl.library -= s.cfg.custoTroca; pl.trocou = true;
    pl.group[mi] = { id: b.id, ideas: 0, novo: true, acted: false, given: 0, foi: false, foiAnt: false };
    op.group[oi] = { id: a.id, ideas: 0, novo: true, acted: false, given: 0, foi: false, foiAnt: false };
    log(s, pl.nome + ' troca ' + C(a.id).nome + ' por ' + C(b.id).nome + ', de ' + op.nome + '. Os dois perdem as ideias e entram em ação no próximo turno de seus donos.', 'praxis', P);
    fx(s, { k: 'troca', P: P, o: o, a: a.id, b: b.id });
    return true;
  }
  function buyExtra(s, P) {
    var pl = s.players[P];
    if (s.over || s.turn !== P || pl.boughtExtra || pl.library < 2) return false;
    pl.library -= 2; pl.boughtExtra = true;
    draw(s, P, 1);
    log(s, pl.nome + ' paga 2 ideias e compra uma carta extra.', 'carta', P);
    return true;
  }

  function praxisOptions(s, P, base) {
    var out = [], pl = s.players[P], d, q, j;
    function ops(fn) { for (var x = 0; x < s.players.length; x++) if (x !== P) fn(x); }
    var M = [];
    for (var i0 = 0; i0 < s.debates.length; i0++) if (s.debates[i0].stakes[P] > 0) M.push(i0);
    switch (base) {
      case 'autoridade':
        M.forEach(function (i) { out.push({ label: '+5 em «' + DEB[s.debates[i].id].q + '»', prm: { d: i } }); });
        break;
      case 'espantalho': case 'sofisma': case 'reductio': case 'retorsio': case 'falseabilidade':
        M.forEach(function (i) {
          d = s.debates[i]; q = DEB[d.id];
          if (base === 'falseabilidade' && q.area !== 'logica') return;
          ops(function (x) {
            var min = base === 'retorsio' ? 3 : base === 'reductio' ? 2 : 1;   // Reductio: com 1 ideia a metade (para cima) não tira nada
            if (d.stakes[x] >= min) out.push({ label: '«' + q.q + '» contra ' + nomeJ(s, x) + ' (tem ' + d.stakes[x] + ')', prm: { d: i, o: x } });
          });
        });
        break;
      case 'adhominem':
        ops(function (x) {
          s.players[x].group.forEach(function (g, fi) {
            if (g.ideas <= 0 || imune(g)) return;
            M.forEach(function (i) {
              out.push({ label: 'Tirar ' + Math.min(5, g.ideas) + ' de ' + C(g.id).nome + ' (' + nomeJ(s, x) + ') → «' + DEB[s.debates[i].id].q + '»', prm: { o: x, fi: fi, d: i } });
            });
          });
        });
        break;
      case 'petitio':
        pl.group.forEach(function (g, fi) { if (g.ideas === 0 && ativo(g) && !g.lib) out.push({ label: '5 ideias para ' + C(g.id).nome, prm: { fi: fi } }); });
        break;
      case 'mutatio':
        M.forEach(function (i) {
          for (j = 0; j < s.debates.length; j++) if (j !== i) {
            out.push({ label: Math.min(4, s.debates[i].stakes[P]) + ' de «' + DEB[s.debates[i].id].q + '» → «' + DEB[s.debates[j].id].q + '»', prm: { d: i, d2: j } });
          }
        });
        break;
    }
    return out;
  }

  function applyPraxis(s, P, base, prm) {
    var d = prm.d !== undefined ? s.debates[prm.d] : null, n;
    switch (base) {
      case 'autoridade': d.stakes[P] += 5; break;
      case 'espantalho': d.stakes[P] += 4; d.stakes[prm.o] = Math.max(0, d.stakes[prm.o] - 4); break;
      case 'sofisma': d.stakes[P] += 2; d.stakes[prm.o] = Math.max(0, d.stakes[prm.o] - 3); break;
      case 'reductio': d.stakes[prm.o] = Math.ceil(d.stakes[prm.o] / 2); break;   // o oponente fica com a metade, arredondada para cima (9 → 5)
      case 'retorsio': d.stakes[prm.o] -= 3; d.stakes[P] += 3; break;
      case 'falseabilidade': d.stakes[prm.o] = Math.max(0, d.stakes[prm.o] - 5); break;
      case 'adhominem':
        var g = s.players[prm.o].group[prm.fi]; n = Math.min(5, g.ideas); g.ideas -= n; d.stakes[P] += n; break;   // até 5 (18/11/2026)
      case 'petitio': poe(s, s.players[P].group[prm.fi], 5); break;
      case 'mutatio':
        n = Math.min(4, d.stakes[P]); d.stakes[P] -= n; s.debates[prm.d2].stakes[P] += n; break;
    }
  }

  function playPraxis(s, P, cardId, prm, label) {
    var pl = s.players[P], c = C(cardId), hi = pl.hand.indexOf(cardId);
    if (s.over || s.turn !== P || hi < 0 || c.tipo !== 'P' || pl.library < c.custo) return false;
    pl.library -= c.custo;
    pl.hand.splice(hi, 1);
    s.discard.push(cardId);
    // dados só para a coreografia (não alteram regra): debate-alvo e variação das torres
    var d0 = prm && prm.d !== undefined ? s.debates[prm.d] : null, antes = d0 ? d0.stakes.slice() : null;
    applyPraxis(s, P, c.id, prm);
    log(s, pl.nome + ' usa ' + c.nome + (label ? ': ' + label : '') + '.', 'praxis', P);
    fx(s, { k: 'praxis', P: P, id: c.id, label: label || '', prm: prm || {}, did: d0 ? d0.id : null,
      ganho: d0 ? d0.stakes[P] - antes[P] : 0, perda: d0 && prm.o !== undefined ? antes[prm.o] - d0.stakes[prm.o] : 0 });
    gatilhoLocke(s, P, c.id);
    for (var o = 0; c.falacia && o < s.players.length; o++) {
      if (o === P) continue;
      var f = inGroup(s.players[o], 'freud');
      if (f && ativo(f)) { ganha(s, o, f, 1); pop(s, o, 'freud', 'Ato Falho', '+1 ideia: ' + pl.nome + ' usou uma falácia.'); }
    }
    checkInstant(s, P);
    return true;
  }

  function autoDistribute(s, P) {
    var pl = s.players[P], deu = {}, total = 0;
    while (pl.library > 0) {
      var best = -1, bv = -1e9;
      for (var i = 0; i < pl.group.length; i++) {
        if (!canGive(s, P, i)) continue;
        var g = pl.group[i], c = C(g.id), need = 99, mx = 1;
        for (var k = 0; k < s.debates.length; k++) {
          var cap = c.vals[DEB[s.debates[k].id].area];
          mx = Math.max(mx, cap);
          if (cap - g.ideas > 0 && cap - g.ideas < need) need = cap - g.ideas;
        }
        var v = need === 99 ? -6 - g.ideas * 0.1 : -need + mx * 0.1;
        if (v > bv) { bv = v; best = i; }
      }
      if (best < 0) break;
      giveIdea(s, P, best, true);
      deu[pl.group[best].id] = (deu[pl.group[best].id] || 0) + 1; total++;
    }
    Object.keys(deu).forEach(function (id) { fx(s, { k: 'dar', P: P, id: id, n: deu[id] }); });
    return total;
  }

  function autoDiscard(s, P) {
    var pl = s.players[P];
    while (pl.hand.length > 5) {
      var wi = 0, wv = 1e9;
      for (var i = 0; i < pl.hand.length; i++) {
        var c = C(pl.hand[i]);
        var v = c.custo + (c.tipo === 'F' ? 0.5 : 0);
        if (c.tipo === 'F' && pl.group.length >= 4 && c.custo <= 2) v -= 2;
        if (v < wv) { wv = v; wi = i; }
      }
      s.discard.push(pl.hand.splice(wi, 1)[0]);
    }
  }

  function endTurn(s, descartes) {
    var P = s.turn, pl = s.players[P];
    if (s.over) return false;
    if (descartes) descartes.forEach(function (id) { var i = pl.hand.indexOf(id); if (i >= 0) s.discard.push(pl.hand.splice(i, 1)[0]); });
    autoDiscard(s, P);
    pl.group.forEach(function (g) { g.foiAnt = !!g.foi; g.foi = false; g.acted = false; g.given = 0; });
    s.turn = (P + 1) % s.players.length;
    if (s.turn === 0) {
      var top = Math.max.apply(null, s.players.map(function (x) { return x.points; }));
      if (top >= s.cfg.pontos || s.round >= s.cfg.rodadas) { finish(s); return true; }
      if (s.cfg.novoDebate.indexOf(s.round) >= 0) addDebate(s);
      s.round += 1;
    }
    startTurn(s);
    return true;
  }

  function finish(s) {
    s.over = true; s.phase = 'over';
    var best = 0;
    for (var i = 1; i < s.players.length; i++) {
      var a = s.players[i], b = s.players[best];
      if (a.points > b.points || (a.points === b.points && a.won.length > b.won.length)) best = i;
    }
    var emp = s.players.filter(function (x) { return x.points === s.players[best].points && x.won.length === s.players[best].won.length; }).length;
    s.vencedor = emp > 1 ? -1 : best;
    log(s, emp > 1 ? 'Fim da partida: empate.' : 'Fim da partida: ' + s.players[best].nome + ' vence com ' + s.players[best].points + ' pontos.', 'vit');
  }

  // ---------- IA ----------
  function evalState(s, P) {
    var v = 0, i, o;
    for (i = 0; i < s.debates.length; i++) {
      var d = s.debates[i], val = DEB[d.id].valor, mine = d.stakes[P], om = oppMax(d, P);
      v += 0.6 * Math.min(mine, val);
      v += 0.25 * Math.max(-val, Math.min(val, mine - om));
      if (mine >= val && mine > om) v += 0.8 * val;
      if (om >= val && om > mine) v -= 0.6 * val;
    }
    var maxOpp = 0;
    for (o = 0; o < s.players.length; o++) {
      var pl = s.players[o];
      if (o === P) { v += pl.points * 3 + pl.library * 0.4; pl.group.forEach(function (g) { v += 0.45 * g.ideas; }); }
      else { maxOpp = Math.max(maxOpp, pl.points); pl.group.forEach(function (g) { v -= 0.15 * g.ideas; }); }
    }
    return v - maxOpp * 1.5;
  }

  function aiStep(s) {
    if (s.over) return false;
    var P = s.turn, pl = s.players[P], mestre = pl.nivel === 'mestre', i, j, c;
    // 0) Bibliotecário e troca
    if (libIdx(pl) < 0 && pl.group.length < 4 && pl.group.length >= 1 && s.round <= 6) {
      var bl = -1, bc = 2;
      for (i = 0; i < pl.hand.length; i++) { c = C(pl.hand[i]); if (c.tipo === 'F' && c.custo <= pl.library && c.custo > bc) { bc = c.custo; bl = i; } }
      if (bl >= 0) { playPhilosopher(s, P, pl.hand[bl], undefined, true); return true; }
    }
    if (podeTrocar(s, P) && s.round >= 3) {
      var meu = -1, mv = 99, bo = -1, bi = -1, bvv = -1;
      pl.group.forEach(function (g, k) { if (trocavel(g)) { var v = C(g.id).custo + g.ideas * 0.5; if (v < mv) { mv = v; meu = k; } } });
      for (var oo = 0; oo < s.players.length; oo++) if (oo !== P) s.players[oo].group.forEach(function (g, k) {
        if (!trocavel(g)) return; var v = C(g.id).custo; pl.group.forEach(function (x) { if (C(x.id).escola === C(g.id).escola) v += 0.8; });
        if (v > bvv) { bvv = v; bo = oo; bi = k; } });
      if (meu >= 0 && bo >= 0 && bvv - mv >= 3) { trocar(s, P, meu, bo, bi); return true; }
    }
    // 1) baixar filósofo
    var cand = -1, cv = -1;
    for (i = 0; i < pl.hand.length; i++) {
      c = C(pl.hand[i]);
      if (c.tipo !== 'F' || c.custo > pl.library) continue;
      var bonus = 0;
      pl.group.forEach(function (g) { if (C(g.id).escola === c.escola) bonus += 0.8; });
      DUPLAS.forEach(function (d) { if ((d[0] === c.id && inGroup(pl, d[1])) || (d[1] === c.id && inGroup(pl, d[0]))) bonus += 2; });
      if (c.custo + bonus > cv) { cv = c.custo + bonus; cand = i; }
    }
    if (cand >= 0) {
      c = C(pl.hand[cand]);
      if (pl.group.length < 4) { playPhilosopher(s, P, pl.hand[cand]); return true; }
      var wi = -1, wv = 1e9;
      for (i = 0; i < pl.group.length; i++) {
        if (pl.group[i].lib) continue;
        var w = C(pl.group[i].id).custo + pl.group[i].ideas * 0.4;
        if (w < wv) { wv = w; wi = i; }
      }
      if (wi >= 0 && c.custo >= wv + 2) { playPhilosopher(s, P, pl.hand[cand], wi); return true; }
    }
    // 2) práxis
    var base = evalState(s, P);
    if (mestre || rnd(s) < 0.35) {
      var bestP = null, bpv = 0.6;
      for (i = 0; i < pl.hand.length; i++) {
        c = C(pl.hand[i]);
        if (c.tipo !== 'P' || c.custo > pl.library) continue;
        var po = praxisOptions(s, P, c.id);
        for (j = 0; j < po.length; j++) {
          var t2 = clone(s); t2.mudo = true;
          playPraxis(t2, P, pl.hand[i], po[j].prm);
          var g2 = evalState(t2, P) - base;
          if (g2 > bpv) { bpv = g2; bestP = { id: pl.hand[i], o: po[j] }; }
        }
      }
      if (bestP) { playPraxis(s, P, bestP.id, bestP.o.prm, bestP.o.label); return true; }
    }
    // 3) completar ideias e debater
    var plano = null, pv = 0.05, lista = [];
    for (i = 0; i < pl.group.length; i++) {
      var g = pl.group[i];
      if (g.acted || g.lib || !ativo(g)) continue;
      c = C(g.id);
      for (j = 0; j < s.debates.length; j++) {
        var cap = c.vals[DEB[s.debates[j].id].area];
        var falta = g.id === 'hegel' ? (g.ideas >= 1 ? 0 : 1) : Math.max(0, cap - g.ideas);
        if (falta > pl.library) continue;
        var t = clone(s); t.mudo = true;
        for (var k = 0; k < falta; k++) giveIdea(t, P, i, true);
        if (!moveToDebate(t, P, i, j)) continue;
        var sc = evalState(t, P) - base;
        lista.push({ fi: i, di: j, falta: falta, sc: sc });
        if (sc > pv) { pv = sc; plano = lista[lista.length - 1]; }
      }
    }
    if (!mestre && lista.length && rnd(s) < 0.45) plano = lista[Math.floor(rnd(s) * lista.length)];
    if (plano) {
      for (i = 0; i < plano.falta; i++) giveIdea(s, P, plano.fi, true);
      if (plano.falta) fx(s, { k: 'dar', P: P, id: pl.group[plano.fi].id, n: plano.falta });
      moveToDebate(s, P, plano.fi, plano.di);
      return true;
    }
    // 4) carta extra
    if (!pl.boughtExtra && pl.library >= 4 && pl.hand.length <= 2) { buyExtra(s, P); return true; }
    endTurn(s);
    return true;
  }

  var API = {
    AREAS: AREAS, AREA: AREA, ESCOLA: ESCOLA, FILOSOFOS: FILOSOFOS, PRAXIS: PRAXIS, DEBATES: DEBATES, DEB: DEB, RELACOES: RELACOES,
    DUPLAS: DUPLAS, BONUS_DUPLA: BONUS_DUPLA, duplasDe: duplasDe, imune: imune, trocavel: trocavel, REFLEXAO: REFLEXAO, FALAS: FALAS,
    C: C, newGame: newGame, moveOptions: moveOptions, porqueNao: porqueNao, moveToDebate: moveToDebate,
    playPhilosopher: playPhilosopher, trocar: trocar, podeTrocar: podeTrocar, libIdx: libIdx, nI: nI, canGive: canGive, giveIdea: giveIdea, buyExtra: buyExtra,
    praxisOptions: praxisOptions, playPraxis: playPraxis, endTurn: endTurn, aiStep: aiStep,
    oppMax: oppMax, lidera: lidera, ativo: ativo, evalState: evalState
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.BF = API;
})(typeof window !== 'undefined' ? window : this);
