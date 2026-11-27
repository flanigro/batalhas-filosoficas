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
    livre: { nome: 'Livres-Pensadores',             cor: '#6d6f85', cor2: '#3b3c4d' },
    // escolas novas (proposta de 20/11/2026, em teste no branch escolas-5): cores fora das usadas por áreas, escolas, jogadores e famílias
    teista: { nome: 'Teístas e Racionalistas',      cor: '#b0532c', cor2: '#64290f' },   // terracota, como no impresso
    fran:   { nome: 'Franceses',                    cor: '#8a9a2a', cor2: '#4a5410' },   // verde-absinto
    // sexta escola (proposta de 21/11/2026, branch escolas-6). O impresso usa magenta, que no digital se confunde
    // com a Psicologia (#a13a9b) e com a Sêneca (#ea6a97); açafrão fica livre de áreas, escolas, jogadores e famílias.
    orient: { nome: 'Orientais',                    cor: '#dc6f0e', cor2: '#7a3603' }    // açafrão
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
      'Todos os homens, por natureza, desejam conhecer.', 'Metafísica I, 1, 980a21',
      ['Silogismo – Premissa', 'No momento de Reflexão, acrescente +1 ideia em um debate de Lógica.'],
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
      'A morte não é nada para nós.', 'Carta a Meneceu 124–125',
      ['Laço de Amizade', 'Um filósofo ao lado recebe +1 ideia na Reflexão.'],
      [4, 'O Jardim', 'Baixe o Legado Jardim. Aliados não perdem ideias. Gera +1 ideia na Reflexão.'],
      [6, '“A Morte não é nada para nós”', 'Ganhe um debate à sua escolha no qual você participe. Elimine a carta Epicuro.']),
    F('pitagoras', 'de Samos', 'Pitágoras', 1, 'grega', [1, 5, 1, 2], 'Samos', 'séc. VI a.C.', 'Teorema de Pitágoras',
      'Tudo é número.', 'atribuída pela tradição pitagórica',
      ['Harmonia das Esferas', 'No momento de Reflexão, coloque 1 ideia em um debate cujo valor seja número primo.'],
      [4, 'Metempsicose', 'Troque Pitágoras por um outro filósofo da mesa. Catedráticos não são afetados.'],
      [6, 'Tetráctis', 'Todos os filósofos gregos, inclusive Pitágoras, recebem +3 ideias.']),
    F('diogenes', 'de Sínope', 'Diógenes', 1, 'grega', [2, 1, 3, 2], 'Sínope, mar Negro', '412 – 323 a.C.', '—',
      'Na casa de um rico não há lugar para se cuspir, a não ser em sua cara.', 'Diógenes Laércio VI, 32',
      ['Barrica de Diógenes', 'Proteção contra Conceitos negativos de Catedráticos adversários.'],
      [5, 'Cínicos – Vivendo como um cão', 'Livre-se dos bens materiais: elimine todas as Legados do jogo.'],
      [6, 'Lanterna de Diógenes', 'Baixe o Legado Lanterna de Diógenes. Gera 2 ideias na Reflexão.']),

    F('marx', 'Karl', 'Marx', 5, 'mat', [4, 3, 5, 2], 'Tréveris, Prússia', '1818 – 1883', 'O Capital',
      'Os filósofos apenas interpretaram o mundo de diferentes maneiras; o que importa é transformá-lo.', 'Teses sobre Feuerbach, 11',
      ['Mais-Valia', 'No momento de Reflexão de Marx, um filósofo de um oponente perde 1 ideia.'],
      [3, 'Luta de Classes', 'Substitua todos os Catedráticos pelo filósofo de menor valor no grupo.'],
      [7, 'Comunismo', 'Expurgo! Remova todos os Catedráticos, exceto Marx.']),
    F('hegel', 'Georg', 'Hegel', 4, 'mat', [4, 4, 3, 3], 'Stuttgart, Alemanha', '1770 – 1831', 'Fenomenologia do Espírito',
      'O que é racional é real, e o que é real é racional.', 'Filosofia do Direito, Prefácio',
      ['“Toda realidade é um processo histórico”', 'Se for Catedrático, Hegel move para um debate quantas ideias tiver, sem o teto da área.'],
      [4, '“Estruturas de pensamento são mutáveis”', 'Transporte até 5 ideias de qualquer filósofo para outro filósofo.'],
      [7, '“O real é racional”', 'Converta todas as ideias adversárias de um debate de que você participa para sua cor.']),
    F('hobbes', 'Thomas', 'Hobbes', 3, 'mat', [3, 4, 4, 2], 'Malmesbury, Inglaterra', '1588 – 1679', 'Leviatã',
      'O homem é o lobo do homem.', 'Do Cidadão, dedicatória',
      ['“Tudo no Universo é físico”', 'No momento de Reflexão, elimine 1 ideia de um oponente em um debate de Lógica / Ciência.'],
      [5, '“O mais fraco tem força para matar o forte”', 'Substitua um filósofo de valor 4 ou 5 por um de valor 1 de sua mão.'],
      [6, 'Leviatã', 'Baixe o Legado. Elimine as cartas da mão de um jogador. Ativação: 4 ideias.']),
    F('bacon', 'Francis', 'Bacon', 2, 'mat', [1, 4, 2, 2], 'Londres, Inglaterra', '1561 – 1626', 'O progresso do conhecimento',
      'A natureza só é comandada se é obedecida.', 'Novum Organum I, 3',
      ['“Conhecimento é poder”', 'No momento de Reflexão de Bacon, veja duas cartas na mão de um jogador.'],
      [5, '“O dinheiro é como esterco: só é bom espalhado”', 'Elimine 2 ideias de todos os filósofos de uma escola à sua escolha.'],
      [6, 'O Método Científico', 'Todos os debates ficam reduzidos a 1 ideia de cada jogador.']),
    F('locke', 'John', 'Locke', 1, 'mat', [1, 4, 3, 1], 'Wrington, Inglaterra', '1632 – 1704', 'Ensaio sobre o entendimento humano',
      'Não há nada na mente que não tenha passado antes pelos sentidos.', 'máxima empirista associada ao Ensaio',
      ['“A Mente é uma Tábula Rasa”', 'Filósofos não recebem ideias do Jogador no turno em que foram baixados.'],
      [3, '“Não existem ideias universais”', 'Teístas e Racionalistas não recebem ideias na Reflexão nesta rodada.'],
      [7, 'Direito natural ao autogoverno', 'Mova todas as ideias de seus filósofos para um debate de Ética / Política.']),
    F('rousseau', 'Jean-Jacques', 'Rousseau', 1, 'mat', [1, 1, 4, 2], 'Genebra', '1712 – 1778', 'Do Contrato Social',
      'O homem nasce livre, e por toda parte encontra-se a ferros.', 'Do Contrato Social I, 1',
      ['Contrato Social', 'No momento de Reflexão de Rousseau, todos os filósofos de custo 1 da mesa recebem +1 ideia.'],
      [4, 'A propriedade privada é um roubo', 'Elimine qualquer Legado. Use apenas uma vez.'],
      [6, 'Estado de natureza', 'Baixe o Legado. Na Reflexão, gera +2 ideias a redistribuir.']),

    F('kant', 'Immanuel', 'Kant', 5, 'germ', [3, 5, 5, 4], 'Königsberg, Prússia', '1724 – 1804', 'Crítica da Razão Pura',
      'Age apenas segundo a regra que possas querer que vire lei para todos.', 'Fundamentação da Metafísica dos Costumes, seção II (AA 4:421)',
      ['Imperativo Categórico', 'Se um jogador compra sua carta extra, os demais também compram.'],
      [5, '“As coisas em si são incognoscíveis”', 'Elimine qualquer Legado.'],
      [7, '“Espaço e tempo são formas da intuição”', 'Jogue um turno extra, pulando sua fase do Jogador.']),
    F('nietzsche', 'Friedrich', 'Nietzsche', 4, 'germ', [5, 1, 4, 5], 'Röcken, Prússia', '1844 – 1900', 'Assim Falou Zaratustra',
      'Deus está morto.', 'A Gaia Ciência, § 125',
      ['Vontade de Poder', 'Se você não tiver Teístas, Nietzsche assume a cadeira de Catedrático sem custo.'],
      [4, '“Deus está morto”', 'Elimine a Legado Igreja ou Alma Imortal. Remova um Teísta de valor 1 ou 2.'],
      [5, 'Além-do-homem', 'Legado. Um filósofo germânico em vaga extra, que ignora as regras alheias.']),
    F('schopenhauer', 'Arthur', 'Schopenhauer', 3, 'germ', [3, 2, 3, 4], 'Danzig', '1788 – 1860', 'O Mundo como Vontade e Representação',
      'O mundo é minha representação.', 'O Mundo como Vontade e Representação, § 1',
      ['Mestre e discípulo', 'No momento de Reflexão, recebe +1 ideia se Kant, Freud ou Nietzsche estiverem no grupo.'],
      [5, 'Vontade Universal', 'Coloque +3 ideias em cada um dos debates de que você participa.'],
      [7, '“Os limites do mundo são os da minha visão”', 'Oponentes perdem até 5 ideias em todos os debates de que você participa.']),
    F('heidegger', 'Martin', 'Heidegger', 2, 'germ', [4, 2, 2, 2], 'Messkirch, Alemanha', '1889 – 1976', 'Ser e Tempo',
      'A linguagem é a morada do ser.', 'Carta sobre o Humanismo, abertura (GA 9, p. 313)',
      ['Fenomenologia', 'Por 1 turno, um filósofo adversário aleatório paga +2 ideias para participar de debates.'],
      [4, 'Ser-para-a-morte', 'Elimine Heidegger e um filósofo de outra corrente que não a Germânica.'],
      [7, 'Ser e Tempo', 'Descarte sua mão e não compre cartas. Jogue um turno extra.']),
    F('freud', 'Sigmund', 'Freud', 1, 'germ', [2, 1, 1, 5], 'Freiberg, Morávia', '1856 – 1939', 'A Interpretação dos Sonhos',
      'O eu não é senhor em sua própria casa.', 'Uma dificuldade no caminho da psicanálise (1917)',
      ['O Inconsciente', 'No momento de Reflexão, Freud pode mover 1 ideia para outro filósofo do grupo.'],
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
      [5, 'A raposa e o leão', 'Troque quaisquer dois filósofos da mesa entre você e um oponente.'],
      [6, '“Mais seguro ser temido que amado”', '+2 ideias para seus filósofos. Um oponente não baixa cartas na próxima rodada.']),
    F('erasmo', 'de Roterdã', 'Erasmo', 1, 'livre', [2, 1, 3, 2], 'Roterdã, Holanda', 'c. 1466 – 1536', 'Elogio da Loucura',
      'A pior das loucuras é tentar ser sensato em um mundo de loucos.', 'atribuída; a conferir',
      ['“A Religião é uma forma de loucura”', 'No momento de Reflexão de Erasmo, um filósofo Teísta perde 2 ideias.'],
      [3, '“A felicidade depende da opinião”', 'Coloque +1 ideia em cada debate.'],
      [5, 'Elegância Retórica', 'Baixe o Legado. Seus filósofos recebem +1 ideia ao mover ideias para debates.']),
    // ---- Teístas e Racionalistas (proposta de 20/11/2026; valores do impresso v4) ----
    F('descartes', 'René', 'Descartes', 5, 'teista', [5, 5, 2, 4], 'La Haye (França) – Estocolmo', '1596 – 1650', 'Meditações Metafísicas',
      'Penso, logo existo.', 'Discurso do Método, IV',
      ['Gênio Maligno', 'No momento de Reflexão, o filósofo adversário com mais ideias cai em dúvida: no próximo turno do dono, não vai a debates de Lógica nem de Metafísica. Ética e Psicologia continuam: Descartes mantinha uma moral provisória enquanto duvidava. Diógenes e o Bibliotecário escapam.'],
      [3, 'O Demônio da Dúvida', 'Um filósofo oponente não pode levar ideias a debates nem usar poderes nesta rodada.'],
      [7, 'Sistema Cartesiano', 'Reorganize todos os filósofos em jogo, fazendo as trocas que quiser. Elimine as ideias das cartas.']),
    F('tomas', 'Santo', 'Tomás de Aquino', 4, 'teista', [5, 2, 4, 3], 'Roccasecca (Itália) – Fossanova', '1225 – 1274', 'Suma Teológica',
      'A graça não destrói a natureza, mas a aperfeiçoa.', 'Suma Teológica I, q. 1, a. 8, ad 2',
      ['Fé e Razão', 'Quando Tomás leva ideias a um debate de Lógica, +1 ideia sua num debate de Metafísica em que você já tem ideias; e vice-versa. Fé e razão andam juntas.'],
      [4, 'Igreja', 'Baixe o Legado Igreja: protege todos os filósofos Teístas contra efeitos negativos.'],
      [7, 'Pecado Original', 'Expulse um filósofo definitivamente do jogo.']),
    F('agostinho', 'Santo', 'Agostinho', 3, 'teista', [5, 1, 3, 3], 'Tagaste – Hipona (norte da África)', '354 – 430', 'Confissões',
      'Inquieto está o nosso coração enquanto não repousa em ti.', 'Confissões I, 1',
      ['Graça', 'No momento de Reflexão, se Agostinho estiver sem nenhuma ideia, recebe +3. A graça vem para quem nada tem.'],
      [4, 'Seres Morais e Imorais', 'Os Teístas, inclusive Agostinho, ganham +2 ideias; os Empiristas perdem 2.'],
      [6, 'Alma Imortal', 'Baixe o Legado Alma Imortal: um filósofo fica imune a efeitos e ações de oponentes.']),
    F('leibniz', 'Gottfried W.', 'Leibniz', 2, 'teista', [4, 5, 1, 1], 'Leipzig – Hanôver', '1646 – 1716', 'Monadologia',
      'Calculemos!', 'A Ciência Geral (c. 1685), a verificar',
      ['Cálculo', 'Toda vez que Leibniz entra num debate de Lógica / Ciência, +1 ideia sua nesse debate.'],
      [5, 'Verdades da Razão e de Fato', 'Troque um filósofo de custo 1 da sua mão por um de custo 1 de um oponente.'],
      [6, 'O Melhor dos Mundos', 'Duplique suas ideias num debate de Lógica.']),
    F('averrois', 'de Córdoba', 'Averróis', 1, 'teista', [2, 1, 3, 1], 'Córdoba – Marrakech', '1126 – 1198', 'Discurso Decisivo',
      'A verdade não contradiz a verdade; concorda com ela e dá testemunho dela.', 'Discurso Decisivo',
      ['O Comentador', 'No momento de Reflexão, se Aristóteles estiver na mesa, em qualquer grupo, Averróis recebe +2. Os latinos o chamavam simplesmente de "o Comentador".'],
      [4, 'Leis religiosas são políticas necessárias', 'Todos os filósofos Teístas, inclusive Averróis, recebem +2 ideias.'],
      [5, 'Alcorão, verdade poética', 'Se suas ideias já forem suficientes, vença imediatamente um debate de Metafísica.']),
    F('espinoza', 'Baruch', 'Espinoza', 1, 'teista', [4, 1, 3, 1], 'Amsterdã – Haia', '1632 – 1677', 'Ética',
      'Não rir, não lamentar, nem detestar, mas compreender.', 'Tratado Político I, 4',
      ['Deus sive Natura', 'Espinoza conta como Teísta e como Materialista para o bônus de escola: dele e dos colegas. Deus e a Natureza são uma só substância.'],
      [2, 'Substância Única', 'Nesta rodada seus filósofos só geram ideias de uma única área à sua escolha.'],
      [5, 'Razão: autopreservação e entendimento', 'Espinoza recebe +2 ideias. O grupo fica protegido de efeitos negativos por uma rodada.']),
    // ---- Franceses ----
    F('sartre', 'Jean-Paul', 'Sartre', 5, 'fran', [3, 2, 4, 4], 'Paris', '1905 – 1980', 'O Ser e o Nada',
      'O homem está condenado a ser livre.', 'O Existencialismo é um Humanismo',
      ['A Existência Precede a Essência', 'Sartre leva a qualquer debate o seu maior valor (4), seja qual for a área. Ele se faz o que escolhe ser.'],
      [4, 'Condenado a ser livre', 'Troque um filósofo da sua mão por um de mesmo custo do grupo de um oponente.'],
      [7, '“O inferno são os outros”', 'Reduza pela metade (arredondando para baixo) as ideias dos oponentes nos debates.']),
    F('foucault', 'Michel', 'Foucault', 4, 'fran', [2, 2, 4, 3], 'Poitiers – Paris', '1926 – 1984', 'Vigiar e Punir',
      'Onde há poder, há resistência.', 'História da Sexualidade I, IV, 2',
      ['Vigiar e Punir', 'Enquanto Foucault estiver em ação no seu grupo, cada falácia usada por um adversário custa a ele 1 ponto a mais.'],
      [4, 'Arqueologia do Saber', 'Escolha uma carta da pilha de descartes.'],
      [6, 'Vigiar e Punir', 'Baixe o Legado Vigiar e Punir: um filósofo escolhido não participa de debates.']),
    F('voltaire', '', 'Voltaire', 3, 'fran', [2, 1, 3, 3], 'Paris', '1694 – 1778', 'Cândido',
      'É preciso cultivar nosso jardim.', 'Cândido, cap. 30',
      ['Contra o Fanatismo', 'Os Argumentos e as cartas de Práxis que você joga custam 1 ideia a menos (mínimo 1). As falácias, não.'],
      [4, '“A certeza é agradável, mas absurda”', 'Elimine 2 ideias de todos os filósofos Germânicos e Racionalistas.'],
      [6, 'Iluminismo', 'Todos os filósofos do seu grupo, incluindo Voltaire, recebem +3 ideias.']),
    F('derrida', 'Jacques', 'Derrida', 2, 'fran', [2, 4, 1, 2], 'El Biar (Argélia) – Paris', '1930 – 2004', 'Gramatologia',
      'Não há fora-de-texto.', 'Gramatologia, parte II, cap. 2',
      ['Desconstrução', 'Ao entrar num debate, cada adversário que tem ali mais ideias que você passa 1 delas para você. A desconstrução inverte as hierarquias.'],
      [4, 'Desconstrutivismo', 'As ideias em todos os debates são igualmente redistribuídas entre os jogadores.'],
      [6, '“O significado é sempre incompleto”', 'Escolha um debate do qual você participe. Elimine todas as ideias de um oponente.']),
    F('camus', 'Albert', 'Camus', 1, 'fran', [1, 1, 4, 2], 'Mondovi (Argélia) – Villeblevin', '1913 – 1960', 'O Mito de Sísifo',
      'É preciso imaginar Sísifo feliz.', 'O Mito de Sísifo, final',
      ['Sísifo', 'No momento de Reflexão, se você não lidera nenhum debate, Camus recebe +1. E sempre que um adversário vence um debate em que você tinha ideias, Camus recebe +2: a pedra rola, e ele recomeça.'],
      [5, 'O Estrangeiro', 'Elimine um filósofo que tenha custo 1 ou 2. Uma vez por partida.'],
      [6, '“O suicídio é a única questão filosófica séria”', 'Elimine a carta Camus. Ganhe um debate de Metafísica.']),
    F('lacan', 'Jacques', 'Lacan', 1, 'fran', [1, 2, 1, 5], 'Paris', '1901 – 1981', 'Escritos',
      'O inconsciente é estruturado como uma linguagem.', 'O Seminário, livro 11',
      ['O Grande Outro', 'No momento de Reflexão, se algum adversário tiver mais pontos que você, Lacan recebe +1. O desejo é o desejo do Outro.'],
      [6, 'Estádio do Espelho', 'Escolha um debate do qual você participe. Iguale as suas ideias às de um oponente.'],
      [7, 'O Grande Outro', 'Ganhe um debate de Psicologia.']),
    // ---- Orientais (proposta de 21/11/2026; valores do impresso v4) ----
    F('jesus', 'de Nazaré', 'Jesus', 5, 'orient', [5, 1, 5, 4], 'Galileia – Jerusalém', 'c. 4 a.C. – c. 30', 'Sermão da Montanha (nos Evangelhos)',
      'Ame o próximo como a si mesmo.', 'Evangelho de Mateus 22, 39',
      ['Amem os seus inimigos', 'No momento de Reflexão, os quatro Evangelhos põem +4 ideias na sua Biblioteca, e o filósofo com menos ideias de cada grupo adversário recebe +1: o próximo inclui o adversário (Mateus 5, 44).'],
      [4, '“Quem não tiver pecado, atire a primeira pedra”', 'Proteja um filósofo por 2 rodadas de todos os efeitos negativos.'],
      [6, '“A César o que é de César”', 'Remova 3 ideias de um debate de Ética / Política. Vença um debate de Metafísica / Religião.']),
    F('buda', '', 'Buda', 4, 'orient', [4, 1, 4, 4], 'Lumbini (Nepal) – Kushinagar (Índia)', 'c. 563 – c. 483 a.C.', 'Dhammapada (ensinamentos reunidos pelos discípulos)',
      'O ódio nunca cessa pelo ódio; só pelo não ódio ele cessa.', 'Dhammapada, verso 5',
      ['Desapego', 'No momento de Reflexão, antes de receber, Buda entrega uma a uma as ideias que tem, do colega com menos ideias para o com mais. Depois recebe as suas, como todos.'],
      [5, 'Nirvana', 'Baixe o Legado Nirvana: protege um filósofo contra efeitos negativos.'],
      [7, 'Pensamento correto, ação correta', 'Todos os seus filósofos, inclusive Buda, recebem +3 ideias.']),
    F('confucio', '', 'Confúcio', 3, 'orient', [3, 1, 5, 3], 'Qufu (Estado de Lu, China)', '551 – 479 a.C.', 'Analectos',
      'Não faças aos outros o que não queres para ti.', 'Analectos XV, 24',
      ['Respeito à Tradição', 'No momento de Reflexão, o filósofo mais antigo do seu grupo, o de nascimento mais remoto, recebe +1. Confúcio dizia transmitir, e não inventar (Analectos VII, 1).'],
      [4, 'Código de Conduta', 'Um filósofo não recebe ideias de filósofos, jogadores ou Legados nas 2 próximas rodadas.'],
      [6, 'Justiça, Retidão, Honradez', 'Descarte sua mão. Vença um debate de Ética / Política.']),
    F('avicena', '', 'Avicena', 2, 'orient', [4, 4, 2, 1], 'Afshana, perto de Bukhara – Hamadã (Pérsia)', '980 – 1037', 'O Livro da Cura; Cânone da Medicina',
      'Suspenso no ar, sem ver nem tocar coisa alguma, eu ainda saberia que existo.', 'O Livro da Cura, Livro da Alma I, 1 (paráfrase do “homem voador”, a verificar)',
      ['Cânone da Medicina', 'No momento de Reflexão, cada colega que perdeu ideias para um adversário desde o seu último turno recupera até 2. Se ninguém se feriu, Avicena estuda e recebe +1.'],
      [3, 'O Homem Voador', 'Um filósofo Oriental coloca o dobro de ideias num debate de Metafísica / Religião neste turno.'],
      [6, 'A Alma é distinta do corpo', 'Se Aristóteles estiver no seu grupo, ele e Avicena recebem +3 ideias.']),
    F('zoroastro', '', 'Zoroastro', 1, 'orient', [4, 1, 2, 1], 'Irã oriental (Ásia Central)', 'c. 1500 – 1000 a.C. (incerto)', 'Gathas (no Avesta)',
      'Bons pensamentos, boas palavras, boas ações.', 'Fórmula do Avesta (humata, hukhta, hvarshta), a verificar',
      ['Verdade contra Mentira', 'No momento de Reflexão, Zoroastro recebe +2 se você não usou nenhuma falácia na partida. Para ele, a mentira é o lado do mal.'],
      [5, 'Juízo Final', 'Remova as ideias de um debate de Lógica e troque-o por um debate de Metafísica / Religião da pilha.'],
      [6, 'Bem contra Mal', 'Ponha +2 ideias nos debates de que você participa e tire 2 dos oponentes.']),
    F('laotse', '', 'Lao-Tsé', 1, 'orient', [3, 1, 3, 2], 'Estado de Chu (China)', 'séc. VI a.C. (tradição)', 'Tao Te Ching',
      'Uma viagem de mil léguas começa com um passo.', 'Tao Te Ching, 64',
      ['Wu wei, a não ação', 'Lao-Tsé não vai a debates nem acumula ideias. Mesmo assim, no momento de Reflexão, você ganha +1 ideia em cada debate aberto: o sábio age sem agir (Tao Te Ching, 2).'],
      [2, 'Fluxo de Chi', 'Remaneje as ideias dos seus filósofos dentro do grupo.'],
      [6, 'Yin / Yang', 'Escolha um debate do qual você participe. Troque as suas ideias com as de um oponente.'])
  ];

  // Cartas temporárias (19/11/2026): quatro famílias.
  //   falacia   — borda vermelho-escura e caveirinha; depois de usada, sai do jogo e tira pontos (pen)
  //   argumento — técnicas legítimas de prova e refutação; voltam com o descarte
  //   escola    — atacam uma escola (esc) e só entram no baralho quando ela está em jogo
  //   praxis    — ideias filosóficas que viram manobra
  // d: a mecânica; oq: o parágrafo "O que é" (referências a verificar).
  var PRAXIS = [
    { id: 'autoridade', nome: 'Argumento de Autoridade', custo: 4, fam: 'falacia', pen: 1, sub: 'Falácia — “o mestre disse”',
      d: 'Num debate do qual você participa, +5 ideias suas.',
      oq: '“É verdade porque o mestre disse.” Os discípulos de Pitágoras encerravam as discussões assim (Cícero, Da Natureza dos Deuses I, 5, 10, a verificar). Citar quem entende do assunto é prudente; a falácia é usar o nome para não precisar de argumento.' },
    { id: 'espantalho', nome: 'Espantalho', custo: 5, fam: 'falacia', pen: 2, sub: 'Falácia — caricatura do oponente',
      d: 'Num debate em que você e um oponente participam, +4 ideias para você e −4 para ele.',
      oq: 'Você deforma a posição do adversário até ela ficar fácil de derrubar, e então derruba a versão de palha. O espantalho perde todas as discussões; por isso é o oponente preferido de tanta gente.' },
    { id: 'adhominem', nome: 'Ad Hominem', custo: 2, fam: 'falacia', pen: 2, sub: 'Falácia — ataque pessoal',
      d: 'Tire até 5 ideias de um filósofo adversário e ponha a mesma quantidade num debate do qual você participa. Não pode mirar Diógenes.',
      oq: 'Em latim, “contra o homem”: em vez de discutir a ideia, ataca-se quem a defende. “Você diz isso porque é rico, velho, alemão...” O argumento continua de pé; só o mensageiro foi para o chão. Diógenes está imune: quem mora num jarro de cerâmica não se ofende com nada.' },
    { id: 'sofisma', nome: 'Sofisma', custo: 2, fam: 'falacia', pen: 1, sub: 'Falácia — argumento enganoso',
      d: 'Num debate em que você e um oponente participam, +2 ideias para você e −3 para ele.',
      oq: 'Um raciocínio que parece válido e foi feito para enganar. O nome vem dos sofistas, professores de retórica da Atenas do século V a.C., que Platão acusava de vender a aparência da sabedoria (Aristóteles, Refutações Sofísticas, a verificar). Os sofistas cobravam caro pelas aulas; esta carta cobra só 2 ideias, mas a conta chega depois.' },
    { id: 'petitio', nome: 'Petitio Principii', custo: 2, fam: 'falacia', pen: 2, sub: 'Falácia — dar por provado',
      d: 'Num debate em que você tem mais ideias que cada adversário, dê a conclusão por provada: se no início do seu próximo turno você ainda tiver mais ideias que cada um, vence o debate, mesmo sem ter chegado ao valor.',
      oq: 'Petição de princípio: usar como premissa justamente o que está em discussão. “Tenho razão porque estou certo.” A premissa não foi aceita pelos outros e costuma vir do senso comum: “todo mundo sabe que…”. Aristóteles a descreve nos Primeiros Analíticos II, 16 (a verificar).' },
    { id: 'mutatio', nome: 'Mutatio Controversiae', custo: 3, fam: 'falacia', pen: 1, sub: 'Falácia — mudando de assunto',
      d: 'Retire até 4 ideias suas de um debate e ponha-as em outro debate da Ágora.',
      oq: 'Mudar de assunto quando a discussão aperta. Em inglês, a manobra ganhou o nome de red herring, o arenque vermelho, um peixe defumado de cheiro forte capaz de despistar os cães de caça.' },
    { id: 'nonsequitur', nome: 'Non Sequitur', custo: 2, fam: 'falacia', pen: 1, sub: 'Falácia — não se segue',
      d: 'Um oponente descarta até 3 cartas temporárias da mão, sorteadas.',
      oq: 'Em latim, “não se segue”: a conclusão não decorre das premissas. “Está chovendo; logo, o seu adversário descarta duas cartas.” Faz tanto sentido quanto esta carta, e funciona do mesmo jeito.' },

    { id: 'retorsio', nome: 'Retorsio Argumenti', custo: 3, fam: 'argumento', sub: 'Argumento — bumerangue',
      d: 'Num debate do qual você participa e em que um oponente tenha ao menos 3 ideias, 3 delas passam para você.',
      oq: 'Devolver ao adversário o argumento que ele usou, como um bumerangue. Aristóteles lista o recurso na Retórica II, 23 (a verificar). Não há trapaça nenhuma: o argumento era dele, você só o devolveu.' },
    { id: 'reductio', nome: 'Reductio ad Absurdum', custo: 3, fam: 'argumento', sub: 'Argumento — redução ao absurdo',
      d: 'Num debate do qual você participa, um oponente com 2 ou mais ideias fica com a metade, arredondada para cima.',
      oq: 'Aceite a tese do outro e siga com ela até o fim, até que ela se contradiga. Alguém diz: “Não se deve confiar em ninguém.” Então também não se deve confiar em quem disse isso. Basta levar a tese a sério para que ela desabe sozinha.' },
    { id: 'falseabilidade', nome: 'Falseabilidade', custo: 2, fam: 'argumento', sub: 'Argumento — o critério de Popper',
      d: 'Num debate de Lógica / Ciência do qual você participa, um oponente perde 5 ideias.',
      oq: 'Para Karl Popper, uma teoria é científica quando pode, em princípio, ser desmentida por um fato (A Lógica da Pesquisa Científica, 1934, a verificar). Mil cisnes brancos não provam que todos os cisnes são brancos; um único cisne negro desmente a tese.' },
    { id: 'tautologia', nome: 'Tautologia', custo: 2, fam: 'argumento', sub: 'Argumento — verdade pela forma',
      d: 'Pague 2 e receba 2 ideias. Ponha-as num filósofo seu, mesmo recém-chegado, ou num debate do qual você participa.',
      oq: 'Uma frase verdadeira só por sua forma, como “amanhã chove ou não chove”. Nunca erra porque não diz nada sobre o mundo (Wittgenstein, Tractatus 4.461, a verificar). Esta carta faz exatamente o que faz: você paga 2 e recebe 2. A vantagem está no lugar onde elas vão parar.' },
    { id: 'paradoxo', nome: 'Paradoxo Lógico', custo: 4, fam: 'argumento', sub: 'Argumento — o debate trava',
      d: 'Tranque um debate até o início do seu próximo turno: ninguém põe nem tira ideias dele, e ninguém o vence enquanto estiver trancado.',
      oq: 'O mais famoso é o do mentiroso, atribuído a Eubúlides de Mileto (Diógenes Laércio II, 108, a verificar): “esta frase é falsa”. Se for verdadeira, é falsa; se for falsa, é verdadeira. O debate fica parado até alguém resolver isso. Ninguém resolve a tempo.' },

    { id: 'fantasma', nome: 'O Fantasma na Máquina', custo: 2, fam: 'argumento', sub: 'Argumento — corta para os dois lados',
      d: 'Escolha um filósofo dualista em ação (Pitágoras, Sócrates, Platão, Agostinho, Descartes ou Avicena). Se for seu, a alma pilota o corpo: ele recebe +3 ideias. Se for de um adversário, a máquina fica sem piloto: ele não vai a debates no próximo turno do dono.',
      oq: 'Gilbert Ryle chamou de “dogma do fantasma na máquina” a ideia, que vem de Descartes, de que somos um corpo mecânico pilotado por uma alma invisível (O Conceito de Mente, 1949, cap. 1, a verificar). Para Ryle, é um erro de categoria: procurar a mente dentro do corpo é como visitar os prédios de uma universidade e perguntar onde fica a universidade. A carta corta para os dois lados: para o dualista, o piloto existe e dá força à máquina; para o crítico, sem piloto a máquina não anda.' },
    { id: 'cicuta', nome: 'Cicuta', custo: 3, fam: 'escola', esc: 'grega', sub: 'Escola — contra os Gregos',
      d: 'Elimine um filósofo grego de um adversário (custa 1 se for Sócrates). Diógenes é imune.',
      oq: 'O veneno com que Atenas executava seus condenados. Em 399 a.C., Sócrates bebeu o cálice conversando com os amigos sobre a imortalidade da alma (Platão, Fédon, a verificar). Escolheu bem o assunto.' },
    { id: 'dogma', nome: 'Dogma', custo: 4, fam: 'escola', esc: 'mat', sub: 'Escola — contra os Materialistas',
      d: 'Dois filósofos Materialistas e Empiristas de um adversário não recebem ideias no próximo momento de Reflexão dele.',
      oq: 'Uma verdade declarada indiscutível. Kant contou que a leitura de Hume o despertou do “sono dogmático” (Prolegômenos, prefácio, a verificar). Os empiristas, que só confiam na experiência, detestam dogmas. Esta carta os põe para dormir mesmo assim.' },
    { id: 'deusmorto', nome: '“Deus está morto”', custo: 4, fam: 'escola', esc: 'teista', sub: 'Escola — contra os Teístas',
      d: 'Remova do jogo um filósofo Teísta de custo 1 ou 2 de um adversário. O Bibliotecário não é alvo.',
      oq: 'A frase é de Nietzsche, em A Gaia Ciência §125 (a verificar). Quem a anuncia é um louco que acende uma lanterna em plena manhã e procura Deus na praça. A lanterna lembra outro filósofo do jogo, que saía de dia procurando um homem. Nietzsche não comemora: para ele, a morte de Deus deixa a cultura sem chão.' },
    { id: 'determinismo', nome: 'Determinismo', custo: 2, fam: 'escola', esc: 'fran', sub: 'Escola — contra os Franceses',
      d: 'Cada filósofo Francês dos adversários perde 2 ideias. Se um adversário tiver Agostinho, ele perde todas.',
      oq: 'A tese de que tudo o que acontece decorre necessariamente do que veio antes. Laplace imaginou uma inteligência que, conhecendo o estado presente do universo, saberia todo o futuro (Ensaio Filosófico sobre as Probabilidades, 1814, a verificar). Os existencialistas franceses apostam na liberdade, e Agostinho defende o livre-arbítrio; por isso a carta acerta os dois. Ela já sabia que você ia jogá-la.' },
    { id: 'orientalismo', nome: 'Orientalismo', custo: 1, fam: 'escola', esc: 'orient', sub: 'Escola — contra os Orientais',
      d: 'No próximo turno de um adversário, os filósofos Orientais dele só levam ideias a debates de Metafísica / Religião.',
      oq: 'Edward Said chamou de orientalismo o modo como a Europa inventou um “Oriente” único, místico e parado no tempo (Orientalismo, 1978, a verificar). Esta própria escola junta mestres da China, da Índia, da Pérsia e da Judeia sob um nome só. A carta faz o mesmo: trata Confúcio, que pensava o governo, e Avicena, médico e lógico, como se só soubessem falar de religião.' },
    { id: 'niilismo', nome: 'Niilismo', custo: 3, fam: 'escola', esc: 'germ', sub: 'Escola — contra os Germânicos',
      d: 'No próximo turno de um adversário, nenhum filósofo Germânico dele leva ideias a debates.',
      oq: 'A ideia de que nada tem sentido, valor ou propósito. Nietzsche fez dela o diagnóstico de uma época que perdeu seus fundamentos (fragmentos póstumos, a verificar). Os Germânicos atingidos ficam parados, sem motivo para ir ao debate. Afinal, para quê?' },

    { id: 'ceticismo', nome: 'Ceticismo', custo: 1, fam: 'praxis', sub: 'Práxis — a dúvida como método',
      d: 'Num debate de Metafísica / Religião do qual você participa, um oponente perde 2 ideias, ou 4 se você tiver um Materialista e Empirista no grupo.',
      oq: 'Pirro de Élis recomendava suspender o juízo diante de qualquer tese (Sexto Empírico, Hipotiposes Pirrônicas I, a verificar). Séculos depois, Hume mostrou que nem a relação de causa e efeito escapa da dúvida. O cético não diz que esta carta funciona; prefere esperar para ver.' }
  ];
  var FAMILIA = {
    falacia:   { nome: 'Falácia',  cor: '#7a1420' },
    argumento: { nome: 'Argumento', cor: '#4a2f86' },   // roxo-índigo: nenhuma escola, área ou jogador usa (19/11/2026)
    escola:    { nome: 'Escola',    cor: '#5a4a8a' },   // não usada na tela: a carta de escola leva a cor da escola atacada
    praxis:    { nome: 'Práxis',    cor: '#1d5c63' }    // petróleo escuro
  };
  PRAXIS.forEach(function (p) { p.tipo = 'P'; p.falacia = p.fam === 'falacia'; p.pen = p.pen || 0; });

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
    ['nietzsche', 'platao', 'Nietzsche chama o cristianismo de “platonismo para o povo” e vê em Platão a origem do desprezo pelo mundo sensível.', 'Além do Bem e do Mal, Prefácio; Crepúsculo dos Ídolos, «Como o mundo verdadeiro se tornou fábula», §§1–2'],
    ['nietzsche', 'kant', 'Nietzsche ataca o imperativo categórico como moral impessoal, perigosa para a vida.', 'O Anticristo, § 11'],
    ['nietzsche', 'schopenhauer', 'Nietzsche teve Schopenhauer como mestre de juventude e depois rompeu com seu pessimismo.', 'Schopenhauer como Educador, §§1–3; A Gaia Ciência, §370; Genealogia da Moral III, §§5–8; Ecce Homo, «As extemporâneas», §3'],
    ['schopenhauer', 'kant', 'Schopenhauer se declara herdeiro de Kant, mas dedica um apêndice inteiro a criticá-lo.', 'O Mundo como Vontade e Representação, apêndice'],
    ['schopenhauer', 'hegel', 'Schopenhauer chamava Hegel de charlatão e marcou seu curso em Berlim no mesmo horário da aula do rival. Quase ninguém apareceu.', 'Os Dois Problemas Fundamentais da Ética, prefácio à 1ª ed.; carta a August Böckh, 31 de dezembro de 1819; programação da Universidade de Berlim, 1820'],
    ['schopenhauer', 'platao', 'Schopenhauer pede que o leitor chegue à sua obra conhecendo Kant e, se possível, Platão.', 'O Mundo como Vontade e Representação, prefácio à 1ª ed.'],
    ['marx', 'hegel', 'Marx diz que a dialética de Hegel está de cabeça para baixo e que é preciso invertê-la.', 'O Capital, posfácio à 2ª ed.'],
    ['marx', 'epicuro', 'A tese de doutorado de Marx compara as filosofias da natureza de Demócrito e de Epicuro.', 'Diferença entre as filosofias da natureza de Demócrito e Epicuro (1841)'],
    ['marx', 'aristoteles', 'Marx chama Aristóteles de grande pensador por ter sido o primeiro a analisar a forma do valor.', 'O Capital, livro I, cap. 1, § 3, A.3, «A forma de equivalente» (MEW 23, pp. 73–74)'],
    ['aristoteles', 'platao', 'Aristóteles critica a Ideia do Bem de seu mestre: a amizade é cara, mas a verdade vem antes.', 'Ética a Nicômaco, I, 6'],
    ['platao', 'socrates', 'Sócrates nada escreveu. Platão, seu discípulo, fez dele o protagonista de quase todos os seus diálogos.', 'Platão, Apologia 34a e 38b; Aristófanes, Nuvens, vv. 218–234; Xenofonte, Memoráveis I, 1, 1–9'],
    ['diogenes', 'platao', 'Diógenes chamava as aulas de Platão de perda de tempo, e Platão o chamava de “um Sócrates enlouquecido”.', 'Diógenes Laércio, Vidas, VI, 24 e 54'],
    ['bacon', 'aristoteles', 'Bacon intitulou sua obra Novum Organum para substituir a lógica do Organon aristotélico.', 'Novum Organum (1620), Prefácio e I, 11–19 e 105'],
    ['hobbes', 'aristoteles', 'Hobbes rejeita a tese aristotélica de que o homem é naturalmente político.', 'Do Cidadão I, 2 e nota; Leviatã XVII; Aristóteles, Política I, 2, 1253a2–3'],
    ['locke', 'hobbes', 'Locke distingue estado de natureza de estado de guerra, respondendo ao quadro traçado por Hobbes.', 'Locke, Segundo Tratado sobre o Governo III, §19; Hobbes, Leviatã XIII'],
    ['rousseau', 'hobbes', 'Rousseau acusa Hobbes de atribuir ao homem natural paixões que nascem da sociedade.', 'Discurso sobre a Origem da Desigualdade'],
    ['kant', 'rousseau', 'Kant escreveu que Rousseau o ensinou a respeitar os seres humanos.', 'Anotações às Observações sobre o Sentimento do Belo e do Sublime (AA 20:44)'],
    ['hegel', 'kant', 'Hegel critica o formalismo vazio da moral kantiana.', 'Filosofia do Direito, § 135'],
    ['hegel', 'socrates', 'Hegel vê em Sócrates o momento em que a consciência individual se volta contra os costumes da cidade.', 'Lições sobre a História da Filosofia, «Sócrates», partes 1 e 3, «O princípio socrático» e «O destino de Sócrates»'],
    ['heidegger', 'platao', 'Heidegger abre Ser e Tempo com uma passagem do Sofista, de Platão, sobre o sentido de “ser”.', 'Ser e Tempo, epígrafe; Platão, Sofista, 244a'],
    ['heidegger', 'nietzsche', 'Heidegger dedicou anos de cursos a Nietzsche, que considerava o último metafísico do Ocidente.', 'Nietzsche I–II (GA 6.1–6.2); cursos em GA 43, 44, 47 e 48'],
    ['heidegger', 'aristoteles', 'Os primeiros cursos de Heidegger são longas interpretações de Aristóteles.', 'Interpretações Fenomenológicas de Aristóteles, cursos de 1921–22 e verão de 1922 (GA 61 e 62); relatório Natorp (1922, GA 62)'],
    ['arendt', 'heidegger', 'Arendt foi aluna de Heidegger em Marburgo. Afastaram-se quando ele aderiu ao nazismo e retomaram o diálogo em 1950.', 'Hannah Arendt e Martin Heidegger, correspondência 1925–1975; Martin Heidegger faz oitenta anos (1969)'],
    ['arendt', 'kant', 'Arendt buscou na Crítica do Juízo, de Kant, as bases de uma filosofia política.', 'Lições sobre a Filosofia Política de Kant'],
    ['arendt', 'marx', 'Arendt critica Marx por fazer do trabalho a essência do ser humano, sem deixar lugar para a ação política.', 'A Condição Humana, cap. III, §§11 e 14; “Karl Marx and the Tradition of Western Political Thought”'],
    ['arendt', 'socrates', 'Para Arendt, Sócrates é o modelo do pensador que examina opiniões em público.', 'A Vida do Espírito I, “Pensar”, cap. III, §§17–18'],
    ['freud', 'schopenhauer', 'Freud reconhece que Schopenhauer antecipou a ideia de recalque.', 'Contribuição à História do Movimento Psicanalítico, I; Schopenhauer, O Mundo como Vontade e Representação II, cap. 32'],
    ['freud', 'nietzsche', 'Freud evitou ler Nietzsche por muito tempo: as intuições do filósofo coincidiam demais com o que a psicanálise descobria com esforço.', 'Um Estudo Autobiográfico (Selbstdarstellung), V'],
    ['freud', 'platao', 'Freud lembra que a sexualidade ampliada da psicanálise se aproxima do Eros do “divino Platão”.', 'Três Ensaios sobre a Teoria da Sexualidade, prefácio à 4ª ed.'],
    ['maquiavel', 'rousseau', 'Rousseau lê O Príncipe como livro dos republicanos: fingindo ensinar os reis, ensinou os povos.', 'Do Contrato Social, III, 6'],
    ['epicuro', 'platao', 'Epicuro chamava os seguidores de Platão de “bajuladores de Dionísio”, o tirano de Siracusa a quem Platão tentou aconselhar.', 'Diógenes Laércio, Vidas, X, 8']
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
    platao: ['A República', 'No momento de Reflexão, o filósofo de maior custo do seu grupo — o Rei Filósofo — recebe +1 ideia.'],
    socrates: ['Maiêutica', 'No momento de Reflexão, o colega de grupo com menos ideias recebe +1. Sócrates ajuda os outros a dar à luz ideias.'],
    epicuro: ['Laço de Amizade', 'No momento de Reflexão, um filósofo vizinho recebe +1 ideia, e Epicuro também: a amizade é recíproca.'],
    diogenes: ['Barrica de Diógenes', 'Nenhum adversário pode escolher Diógenes como alvo nem tirar ideias dele. Não pode ser trocado. No momento de Reflexão, se tiver 2 ideias ou menos, recebe +1: vive com o mínimo.'],
    marx: ['Mais-Valia', 'No momento de Reflexão, o filósofo adversário com mais ideias perde 1.'],
    hegel: ['Dialética', 'Hegel é o único que pode levar a um debate menos que o valor da área: leva o que tiver, até o valor. Síntese: ao entrar num debate em que um adversário tem mais ideias que você, +1 ideia sua.'],
    locke: ['Tábula Rasa', 'Locke recebe +1 ideia sempre que você baixa uma carta e sempre que um adversário baixa um filósofo. As ideias vêm da experiência.'],
    kant: ['Imperativo Categórico', 'Quando Kant leva ideias a um debate de Ética / Política, cada colega em ação que tenha ideias põe 1 delas no mesmo debate, queira ou não.'],
    nietzsche: ['Filosofar com o martelo', 'Ao entrar num debate, o adversário com mais ideias nesse debate perde 2.'],
    schopenhauer: ['Negação da Vontade', 'No momento de Reflexão, recebe +1 ideia se não foi a nenhum debate no turno anterior.'],
    heidegger: ['Ser-no-mundo', 'No momento de Reflexão, recebe +1 ideia para cada debate em que você tem ideias.'],
    freud: ['Ato Falho', 'Freud recebe +1 ideia sempre que um adversário usa uma falácia.'],
    maquiavel: ['O Príncipe', 'No momento de Reflexão, o filósofo de maior custo do seu grupo, o soberano, recebe +1. Se for o Bibliotecário ou já tiver 10 ideias, a ideia vai para a Biblioteca.'],
    erasmo: ['Elogio da Loucura', 'No momento de Reflexão, o adversário que lidera um debate de Metafísica / Religião perde 1 ideia.'],
    hobbes: ['Guerra de todos contra todos', 'No momento de Reflexão, o adversário com mais ideias num debate perde 1 ideia nesse debate.'],
    bacon: ['“Conhecimento é poder”', 'No momento de Reflexão, se houver um debate de Lógica / Ciência na mesa, +1 ideia na sua Biblioteca. E Bacon espia duas cartas da mão de um adversário.'],
    rousseau: ['Contrato Social', 'No momento de Reflexão, todos os filósofos de custo 1 da mesa recebem +1 ideia, inclusive os dos adversários.'],
    arendt: ['A Condição Humana', 'No momento de Reflexão, recebe +1 ideia se houver um debate de Ética / Política na mesa.'],
    aristoteles: ['Silogismo – Premissa', 'No momento de Reflexão, acrescenta +1 ideia sua a um debate de Lógica.'],
    pitagoras: ['Harmonia das Esferas', 'No momento de Reflexão, acrescenta 1 ideia sua a um debate cujo valor seja número primo.']
  };
  Object.keys(C1).forEach(function (k) { CARTAS[k].c1 = { t: C1[k][0], d: C1[k][1] }; });


  // Citações da carta, obras e conceitos 2–3 alinhados à aba "Cartas v5" (16/11/2026).
  var CIT = {
    platao: ['O espanto é a única origem da filosofia.', 'Teeteto 155d'],
    socrates: ['Pareço ser mais sábio apenas porque não penso saber o que não sei.', 'Platão, Apologia 21d'],
    locke: ['Nenhum conhecimento humano pode ir além da sua experiência.', 'Ensaio sobre o Entendimento Humano, II, 1, §19'],
    nietzsche: ['Torna-te quem tu és.', 'A Gaia Ciência, §270; Ecce Homo (subtítulo)'],
    arendt: ['Ninguém tem o direito de obedecer.', 'entrevista a Joachim Fest (1964), lendo Kant'],
    maquiavel: ['É muito mais seguro ser temido do que amado, quando se tem de escolher.', 'O Príncipe, XVII'],
    erasmo: ['A guerra é doce para quem não a experimentou.', 'Adágios, IV, I, 1 (“Dulce bellum inexpertis”)'],
    hobbes: ['O homem é o lobo do homem.', 'Do Cidadão, epístola dedicatória; Plauto, Asinária, v. 495'],
    pitagoras: ['Tudo é número.', 'atribuída aos pitagóricos (Aristóteles, Metafísica I, 5)']
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
    rousseau: ['O primeiro que cercou um terreno', 'Elimine qualquer Legado. Uma vez por partida.', null, 'Estado de natureza', 'Baixe o Legado Estado de natureza: gera +2 ideias na Reflexão, a redistribuir.'],
    kant: ['“As coisas em si são incognoscíveis”', 'Elimine qualquer Legado.', null, '“Espaço e tempo são formas da intuição”', 'Jogue um turno extra, sem a compra e sem a Biblioteca.'],
    nietzsche: ['“Deus está morto”', 'Elimine o Legado Igreja ou Alma Imortal. Remova um Teísta de custo 1 ou 2.', null, 'Além-do-homem', 'Baixe o Legado Além-do-homem: um filósofo germânico em cadeira extra, imune às regras alheias.'],
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
    ['arendt', 'heidegger', 'A aluna de Marburgo.'],
    ['tomas', 'agostinho', 'Os dois grandes doutores da Igreja: Tomás cita Agostinho a cada passo.'],
    ['espinoza', 'descartes', 'Espinoza expôs em livro os Princípios da Filosofia de Descartes.'],
    ['camus', 'sartre', 'Amigos, rivais e vizinhos de mesa no Café de Flore.'],
    ['lacan', 'freud', 'O retorno a Freud.'],
    ['confucio', 'laotse', 'Confúcio foi perguntar a Lao-Tsé sobre os ritos e voltou dizendo que tinha visto um dragão.'],
    ['avicena', 'aristoteles', 'Avicena leu a Metafísica de Aristóteles quarenta vezes antes de entendê-la.']
  ];
  var BONUS_DUPLA = 1;
  function duplasDe(id) {
    var out = [];
    DUPLAS.forEach(function (d) { if (d[0] === id) out.push({ par: d[1], motivo: d[2] }); else if (d[1] === id) out.push({ par: d[0], motivo: d[2] }); });
    return out;
  }

  // Relações acrescentadas nesta versão (a verificar).
  [
    ['kant', 'platao', 'Kant compara Platão a uma pomba que, sentindo a resistência do ar, imagina voar melhor no vácuo.', 'Crítica da Razão Pura, Introdução, A5/B8–9'],
    ['kant', 'aristoteles', 'Kant afirma que a lógica não deu um passo adiante nem atrás desde Aristóteles.', 'Crítica da Razão Pura, prefácio à 2ª ed. (B VIII)'],
    ['hobbes', 'bacon', 'O jovem Hobbes serviu de secretário a Bacon, anotando seus pensamentos durante os passeios.', 'John Aubrey, Brief Lives, «Thomas Hobbes»'],
    ['rousseau', 'locke', 'Rousseau discute a pedagogia de Locke: raciocinar com crianças é começar pelo fim.', 'Rousseau, Emílio II, «Raisonner avec les enfans…»; Locke, Alguns Pensamentos sobre a Educação, §§81–82'],
    ['nietzsche', 'epicuro', 'Nietzsche admira em Epicuro a felicidade de quem contempla o mar da existência já serenado.', 'A Gaia Ciência, §45, «Epicuro»'],
    ['erasmo', 'socrates', 'Um personagem de Erasmo, comovido, quase diz: “São Sócrates, rogai por nós”.', 'Colóquios, “O Banquete Religioso” (Convivium religiosum), fala de Nephalius após a discussão da morte de Sócrates'],
    ['pitagoras', 'platao', 'A cosmologia matemática de Platão deve muito aos pitagóricos.', 'Platão, Timeu 35b–36b e República VII, 530d–531c; Aristóteles, Metafísica I, 6, 987a29–b14; Filolau, fr. 6a, ed. Huffman'],
    ['hegel', 'aristoteles', 'Hegel considera Aristóteles um dos gênios mais ricos e profundos que já existiram.', 'Lições sobre a História da Filosofia, seção «Aristóteles», abertura (Werke 19, p. 132)'],
    ['locke', 'bacon', 'O empirismo de Locke segue o caminho aberto por Bacon: começar pela experiência, e não pela autoridade.', 'Locke, Ensaio sobre o Entendimento Humano, Introdução, §2, e IV, 12, §§9–10; Bacon, Novum Organum I, 19 e 82'],
    ['maquiavel', 'aristoteles', 'Maquiavel troca a pergunta clássica pelo melhor regime pela pergunta de como o poder de fato se conquista e se mantém.', 'Aristóteles, Política IV, 1, 1288b21–1289a7; Maquiavel, O Príncipe, I–II e XV'],
    // relações das escolas novas (20/11/2026; a verificar)
    ['tomas', 'aristoteles', 'Tomás chama Aristóteles simplesmente de “o Filósofo” e constrói a Suma com as ferramentas dele.', 'Suma Teológica, passim'],
    ['averrois', 'aristoteles', 'Averróis comentou quase toda a obra de Aristóteles; os latinos o chamavam simplesmente de “o Comentador”.', 'Grandes Comentários'],
    ['tomas', 'averrois', 'Tomás escreveu um tratado inteiro contra os averroístas e a tese de um só intelecto para todos.', 'A Unidade do Intelecto contra os Averroístas (1270)'],
    ['tomas', 'agostinho', 'Tomás cita Agostinho a cada passo, mesmo quando discorda dele com delicadeza.', 'Suma Teológica, passim'],
    ['agostinho', 'platao', 'Agostinho diz que nenhum filósofo chegou tão perto do cristianismo quanto os platônicos.', 'Cidade de Deus VIII, 5'],
    ['descartes', 'agostinho', 'Arnauld mostrou a Descartes que Agostinho já dizia “se me engano, existo”, parente próximo do “penso, logo existo”.', 'Quartas Objeções às Meditações'],
    ['espinoza', 'descartes', 'Espinoza publicou uma exposição geométrica dos Princípios da Filosofia de Descartes, antes de se afastar dele.', 'Princípios da Filosofia de Descartes (1663)'],
    ['leibniz', 'espinoza', 'Leibniz visitou Espinoza em Haia em 1676 e conversou com ele por dias; depois preferiu não falar muito do encontro.', 'Carta de Leibniz a Gallois, 1677'],
    ['voltaire', 'leibniz', 'Voltaire ridiculariza o “melhor dos mundos possíveis” de Leibniz na figura de Pangloss.', 'Cândido (1759)'],
    ['voltaire', 'locke', 'Voltaire apresentou Locke aos franceses como o homem que fez a anatomia da alma, como um bom anatomista do corpo.', 'Cartas Filosóficas XIII'],
    ['sartre', 'camus', 'Sartre e Camus foram amigos e romperam em 1952, numa troca de cartas públicas sobre O Homem Revoltado.', 'Les Temps Modernes, agosto de 1952'],
    ['sartre', 'heidegger', 'Sartre leu Heidegger em Berlim e O Ser e o Nada responde a Ser e Tempo; Heidegger não se reconheceu no existencialismo.', 'Carta sobre o Humanismo (1946)'],
    ['lacan', 'freud', 'Lacan chamou seu ensino de “retorno a Freud”: reler Freud ao pé da letra, contra seus herdeiros.', 'Escritos, “A coisa freudiana”'],
    ['foucault', 'nietzsche', 'Foucault tomou de Nietzsche a genealogia: procurar a origem baixa das ideias que parecem eternas.', 'Nietzsche, a Genealogia e a História (1971)'],
    ['derrida', 'heidegger', 'A desconstrução de Derrida nasce da “destruição” da metafísica proposta por Heidegger.', 'Carta a um amigo japonês (1985)'],
    ['arendt', 'agostinho', 'A tese de doutorado de Arendt foi sobre o conceito de amor em Agostinho.', 'O Conceito de Amor em Santo Agostinho (1929)'],
    ['camus', 'nietzsche', 'Camus lê em Nietzsche a revolta contra um mundo sem Deus, e também os perigos dela.', 'O Homem Revoltado, “Nietzsche e o niilismo”'],
    // Orientais (21/11/2026; tudo a verificar)
    ['laotse', 'confucio', 'Segundo o historiador Sima Qian, Confúcio visitou Lao-Tsé para perguntar sobre os ritos e saiu dizendo que tinha visto um dragão.', 'Sima Qian, Registros do Historiador, cap. 63'],
    ['avicena', 'aristoteles', 'Avicena conta que leu a Metafísica de Aristóteles quarenta vezes sem entender, até achar num mercado um livrinho de al-Farabi que a explicava.', 'Autobiografia de Avicena (ed. Gohlman)'],
    ['averrois', 'avicena', 'Averróis acusa Avicena de se afastar de Aristóteles e de ceder aos teólogos.', 'Incoerência da Incoerência'],
    ['tomas', 'avicena', 'A distinção entre essência e existência chega a Tomás por Avicena, que ele cita a cada página.', 'O Ente e a Essência'],
    ['nietzsche', 'zoroastro', 'Nietzsche fez de Zaratustra o seu porta-voz: quem inventou a moral do bem contra o mal devia ser o primeiro a reconhecer o erro.', 'Ecce Homo, “Por que sou um destino”, §3'],
    ['schopenhauer', 'buda', 'Schopenhauer via no budismo a religião mais próxima da sua filosofia e guardava uma estátua do Buda em casa.', 'O Mundo como Vontade e Representação II, cap. 17; cartas'],
    ['nietzsche', 'jesus', 'Nietzsche separa Jesus da Igreja: no fundo houve um só cristão, e ele morreu na cruz.', 'O Anticristo, §39'],
    ['arendt', 'jesus', 'Para Arendt, foi Jesus de Nazaré quem descobriu o papel do perdão nos assuntos humanos.', 'A Condição Humana, cap. V, §33'],
    ['leibniz', 'confucio', 'Leibniz admirava a ética chinesa e propôs que sábios da China viessem ensinar teologia natural à Europa.', 'Novissima Sinica (1697), prefácio'],
    ['voltaire', 'confucio', 'Voltaire elogia Confúcio como o sábio que ensinou a virtude sem se dizer profeta.', 'Dicionário Filosófico, verbete “China”'],
    ['hegel', 'confucio', 'Hegel achou os Analectos uma moral prática e comum, e disse que a fama de Confúcio teria ganhado se não tivessem sido traduzidos.', 'Lições sobre a História da Filosofia, introdução'],
    ['heidegger', 'laotse', 'Em 1946 Heidegger tentou traduzir o Tao Te Ching com o estudioso chinês Paul Shih-yi Hsiao e parou depois de alguns capítulos.', 'Relato de Paul Shih-yi Hsiao (1977)'],
  ].forEach(function (r) { RELACOES.push(r); });

  // ---------- preparação ----------
  var PADRAO = { pontos: 30, rodadas: 12, debInicial: 2, novoDebate: [4], copiasPraxis: 1, bibPorTurno: 3, custoTroca: 5, teto: 10, maoInicial: 3, poder2: false, custoP2: 3, varLocke: 2, iaSat: 7, iaBibRod: 6, iaSatBib: 9, p2Acao: false };
  var REFLEXAO = [0, 1, 1, 2, 2, 3];

  function fx(s, e) { if (!s.mudo) s.fx.push(e); }
  function nI(n) { return n === 1 || n === -1 ? n + ' ideia' : n + ' ideias'; }
  // ganho do próprio filósofo; se ele é o Bibliotecário, vai para a Biblioteca
  // teto de ideias por filósofo (decisão de 18/11/2026): o que passa do teto se perde. Devolve quanto entrou.
  // Lao-Tsé não acumula (wu wei): nada do que lhe dariam entra (decisão do Flavio, 21/11/2026)
  function acumula(g) { return g.id !== 'laotse'; }
  // O Fantasma na Máquina: os dualistas de alma e corpo (lista a verificar)
  var DUALISTAS = ['pitagoras', 'socrates', 'platao', 'agostinho', 'descartes', 'avicena'];
  function poe(s, g, n) { if (g.bloq || !acumula(g)) return 0; var a = Math.max(0, Math.min(n, s.cfg.teto - g.ideas)); g.ideas += a; return a; }
  // Paradoxo Lógico: debate trancado (ninguém põe, tira nem vence) até o início do próximo turno de quem trancou
  function livre(d) { return !d.tranca; }
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
      players: [], deck: [], discard: [], exiladas: [], debates: [], debDeck: [], log: [], fx: [],
      vistos: {}, falados: {}, stat: {}, mudo: !!opt.mudo
    };
    var nomes = opt.nomes || ['Você', 'Hipátia', 'Sêneca'];
    var cores = ['#e9b93f', '#3fc1d6', '#ea6a97'];
    for (var i = 0; i < 3; i++) {
      s.players.push({
        nome: nomes[i], cor: cores[i], human: opt.humans ? !!opt.humans[i] : i === 0,
        nivel: opt.niveis ? opt.niveis[i] : 'mestre',
        hand: [], group: [], library: 0, points: 0, caveiras: 0, niil: 0, orient: 0, mentiu: false, won: [], boughtExtra: false, trocou: false
      });
    }
    FILOSOFOS.forEach(function (f) { s.deck.push(f.id); });
    var escolas = {}; FILOSOFOS.forEach(function (f) { escolas[f.escola] = 1; });
    PRAXIS.forEach(function (p) {
      if (p.esc && !escolas[p.esc]) return;   // carta de escola: só com a escola em jogo
      for (var k = 1; k <= cfg.copiasPraxis; k++) s.deck.push(p.id + '#' + k);
    });
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
  function lidera(s, di, P) { var d = s.debates[di]; if (d.prop && (d.prop.P !== P || s.cfg.varLocke === 2)) return false; var req = d.petitio && d.petitio.P === P ? 1 : DEB[d.id].valor; return d.stakes[P] >= req && d.stakes[P] > oppMax(d, P); }
  function ativo(g) { return !g.novo; }
  // Diógenes: nenhum adversário o escolhe como alvo nem tira ideias dele; não pode ser trocado (nem pelo dono).
  function imune(g) { return g.id === 'diogenes' || !!g.cav; }   // g.cav: Caverna de Platão (Poder 2, em teste)
  function trocavel(g) { return !g.lib && !imune(g); }
  // Espinoza (Deus sive Natura) conta como Teísta e como Materialista para o bônus de escola
  function escolasDe(id) { return id === 'espinoza' ? ['teista', 'mat'] : [C(id).escola]; }
  function temColega(pl, g) {
    var minhas = escolasDe(g.id);
    for (var i = 0; i < pl.group.length; i++) {
      if (pl.group[i] === g) continue;
      var dele = escolasDe(pl.group[i].id);
      if (minhas.some(function (e) { return dele.indexOf(e) >= 0; })) return true;
    }
    return false;
  }

  // ---------- turno ----------
  function startTurn(s) {
    var P = s.turn, pl = s.players[P];
    pl.boughtExtra = false;
    // recém-baixados (por baixa ou por troca) entram em ação no início do próximo turno do dono
    pl.group.forEach(function (g) { g.novo = false; });
    if (pl.alem) pl.alem.novo = false;
    limpa(s);
    if (pl.niil === 1) pl.niil = 2;   // Niilismo: vale durante este turno
    if (pl.orient === 1) pl.orient = 2;   // Orientalismo: vale durante este turno
    log(s, 'Rodada ' + s.round + ' — turno de ' + pl.nome + '.', 'turno', P);
    fx(s, { k: 'turno', P: P });
    s.debates.forEach(function (d, di) {
      if (d.tranca && d.tranca.P === P) { delete d.tranca; log(s, 'O Paradoxo se desfaz: «' + DEB[d.id].q + '» volta a andar.', 'sis', P); fx(s, { k: 'destranca', di: di, did: d.id }); }
    });
    for (var i = s.debates.length - 1; i >= 0; i--) {
      if (livre(s.debates[i]) && lidera(s, i, P)) win(s, P, i, s.debates[i].petitio && s.debates[i].petitio.P === P && s.debates[i].stakes[P] < DEB[s.debates[i].id].valor ? 'deu a conclusão por provada, e ninguém a recusou' : 'sustentou a liderança até seu turno');
    }
    s.debates.forEach(function (d, di) { if (d.prop && d.prop.P === P) { delete d.prop; log(s, 'A Propriedade de ' + pl.nome + ' em «' + DEB[d.id].q + '» volta a ser de todos.', 'sis', P); fx(s, { k: 'semProp', di: di, did: d.id }); } });
    s.debates.forEach(function (d) { if (d.petitio && d.petitio.P === P) { delete d.petitio; log(s, 'A Petitio de ' + pl.nome + ' em «' + DEB[d.id].q + '» foi recusada pelos adversários.', 'sis', P); } });
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
    for (var oc = 0; oc < s.players.length; oc++) {   // Sísifo (Camus): quem perdeu ideias no debate recomeça
      if (oc === P || !(d.stakes[oc] > 0)) continue;
      var cm = temAtivo(s.players[oc], 'camus');
      if (cm && !cm.lib) { ganha(s, oc, cm, 2); pop(s, oc, 'camus', 'Sísifo', '+2 ideias: a pedra rolou; é preciso imaginar Sísifo feliz.'); }
    }
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
      if (d.prop && (d.prop.P !== P || s.cfg.varLocke === 2)) continue;   // Propriedade (Locke): só o dono vence ali
      if (d.stakes[P] >= 2 * DEB[d.id].valor) win(s, P, i, 'vitória instantânea, com o dobro do valor');
    }
  }

  function melhorDebate(s, P, filtro) {
    var best = -1, bv = -1;
    for (var i = 0; i < s.debates.length; i++) {
      if (!livre(s.debates[i]) || !filtro(DEB[s.debates[i].id])) continue;
      var v = s.debates[i].stakes[P] * 100 + DEB[s.debates[i].id].valor;
      if (v > bv) { bv = v; best = i; }
    }
    return best;
  }

  function pop(s, P, id, tit, txt, tom) {
    var e = { k: 'pop', P: P, id: id, tit: tit, txt: txt, tom: tom || 'con' };
    // no momento de Reflexão, o balão leva as ideias que mudaram desde o balão anterior:
    // a interface só altera os números quando o balão aparece (um PLIM por mudança)
    if (!s.mudo && s._snap) {
      var nv = snapIdeias(s), mud = [];
      Object.keys(nv).forEach(function (k) { if (k in s._snap && nv[k] !== s._snap[k]) mud.push({ k: k, n: nv[k] - s._snap[k] }); });
      s._snap = nv; e.mud = mud; e.pensa = true;
    }
    fx(s, e);
  }
  function snapIdeias(s) {
    var m = {};
    s.players.forEach(function (pl, P) { pl.group.forEach(function (g) { if (!g.lib) m['f:' + P + ':' + g.id] = g.ideas; }); });
    s.debates.forEach(function (d) { d.stakes.forEach(function (v, P) { m['d:' + d.id + ':' + P] = v; }); });
    return m;
  }

  // Ano de nascimento a partir das datas da carta (a.C. negativo), para o poder de Confúcio
  var NASC_FIXO = { laotse: -571 };   // tradição (Sima Qian); as datas da carta dizem só "séc. VI a.C."
  function nascimento(id) {
    if (id in NASC_FIXO) return NASC_FIXO[id];
    var d = C(id).datas || '', partes = d.split('–'), m = partes[0].match(/\d+/);
    if (!m) return 9999;
    var ac = /a\.C\./.test(partes[0]) || (/a\.C\./.test(d) && !/d\.C\./.test(d));
    return ac ? -(+m[0]) : +m[0];
  }

  function reflexao(s, P) {
    s._snap = s.mudo ? null : snapIdeias(s);
    var pl = s.players[P];
    pl.group.forEach(function (g) { if (g.dogma) { g.bloq = true; delete g.dogma; } });   // Dogma: só neste momento de Reflexão
    try { reflexao0(s, P); } finally { delete s._snap; pl.group.forEach(function (g) { delete g.bloq; }); }
  }
  var JESUS_BIB = 4;   // os quatro Evangelhos (com 3 a força medida é a mesma; com 2 cai pela metade)

  // Buda, Desapego: antes de receber as ideias do momento de Reflexão, entrega uma a uma as que tem,
  // do colega com menos ideias para o com mais, e recomeça a volta se sobrar.
  function desapego(s, P) {
    var pl = s.players[P];
    pl.group.forEach(function (b) {
      if (b.id !== 'buda' || b.lib || !ativo(b) || b.ideas <= 0) return;
      var cs = semLib(pl).filter(function (x) { return x !== b && ativo(x) && acumula(x); }).sort(function (a, c) { return a.ideas - c.ideas; });
      if (!cs.length) return;
      var dado = 0, k = 0, voltas = 0;
      while (b.ideas > 0 && voltas < cs.length) {
        var t = cs[k % cs.length]; k++;
        if (t.ideas >= s.cfg.teto) { voltas++; continue; }
        voltas = 0; t.ideas++; b.ideas--; dado++;
      }
      if (dado) {
        pop(s, P, 'buda', 'Desapego · Buda', 'Entrega ' + nI(dado) + ' aos colegas, do que tem menos ao que tem mais.', 'con');
        log(s, 'Desapego: Buda entrega ' + nI(dado) + ' aos colegas antes de receber as suas.', 'con', P);
      }
    });
  }

  function reflexao0(s, P) {
    var pl = s.players[P], g, i, anunciadas = {};
    if (!pl.group.length) return;
    desapego(s, P);
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
      if (!acumula(g)) continue;   // Lao-Tsé: wu wei, não recebe ideias
      if (g.parado) {
        pop(s, P, g.id, C(g.id).nome + ' · Luta de Classes', 'Parado: não recebe ideias neste turno.', 'neg');
        continue;
      }
      if (g.bloq) {
        pop(s, P, g.id, C(g.id).nome + ' · Dogma', 'Não recebe ideias neste momento de Reflexão.', 'neg');
        log(s, 'Dogma: ' + C(g.id).nome + ' não recebe ideias neste momento de Reflexão.', 'neg', P);
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
    if (pl.banal) {   // Banalidade do Mal (Arendt, Poder 2 em teste): os poderes automáticos não funcionam neste momento de Reflexão
      delete pl.banal;
      log(s, 'Banalidade do Mal: os poderes automáticos de ' + pl.nome + ' não funcionam neste momento de Reflexão.', 'neg', P);
      fx(s, { k: 'banal', P: P });
    } else for (i = 0; i < pl.group.length; i++) if (!pl.group[i].parado) conceitoReflexao(s, P, pl.group[i], i);
    if (s.cfg.poder2) legadosReflexao(s, P);
    pl.group.forEach(function (x) { delete x.ferido; });   // Avicena olha só o que aconteceu desde o último turno
    checkInstant(s, P);
  }

  function conceitoReflexao(s, P, g, idx) {
    var pl = s.players[P], di, o, j, t, c = C(g.id), nome = c.c1.t;
    function diz(txt, tom) { pop(s, P, g.id, c.nome + ' · ' + nome, txt, tom); log(s, nome + ' (' + c.nome + '): ' + txt, tom === 'neg' ? 'neg' : 'con', P); }
    switch (g.id) {
      case 'descartes':   // Gênio Maligno (proposta de 20/11/2026)
        t = null; var tdono = -1;
        for (o = 0; o < s.players.length; o++) {
          if (o === P) continue;
          s.players[o].group.forEach(function (x) { if (!x.lib && !imune(x) && x.ideas > 0 && !x.duvida && (!t || x.ideas > t.ideas)) { t = x; tdono = o; } });
        }
        if (t) { t.duvida = true; diz(C(t.id).nome + ' (' + nomeJ(s, tdono) + ') cai em dúvida: não vai a debates de Lógica nem de Metafísica no próximo turno.'); }
        break;
      case 'jesus':   // Amem os seus inimigos
        var ajudou = [];
        pl.library += JESUS_BIB; ajudou.push('+' + JESUS_BIB + ' na sua Biblioteca, os quatro Evangelhos');
        for (o = 0; o < s.players.length; o++) {
          if (o === P) continue;
          t = null;
          s.players[o].group.forEach(function (x) { if (!x.lib && acumula(x) && ativo(x) && x.ideas < s.cfg.teto && (!t || x.ideas < t.ideas)) t = x; });
          if (!t) continue;
          poe(s, t, 1); ajudou.push(C(t.id).nome + ' (' + nomeJ(s, o) + ') +1');
          if (o !== P) pop(s, o, t.id, '+1 ideia', 'Amem os seus inimigos (Jesus, de ' + pl.nome + ')', 'con');
        }
        if (ajudou.length) diz(ajudou.join(', ') + '.');
        break;
      case 'buda':   // Desapego: feito antes, em desapego()
        break;
      case 'confucio':   // Respeito à Tradição
        t = null;
        semLib(pl).forEach(function (x) { if (ativo(x) && acumula(x) && x.ideas < s.cfg.teto && (!t || nascimento(x.id) < nascimento(t.id))) t = x; });
        if (t) { poe(s, t, 1); diz('+1 ideia para ' + C(t.id).nome + ', o mais antigo do grupo (' + C(t.id).datas + ').'); }
        break;
      case 'avicena':   // Cânone da Medicina
        var curou = [];
        semLib(pl).forEach(function (x) { if (x.ferido > 0) { var n2 = poe(s, x, Math.min(2, x.ferido)); if (n2) curou.push(C(x.id).nome + ' +' + n2); } });
        if (curou.length) diz('trata os feridos: ' + curou.join(', ') + '.');
        else { ganha(s, P, g, 1); diz('+1 ideia: ninguém se feriu, e Avicena estuda.'); }
        break;
      case 'zoroastro':   // Verdade contra Mentira
        if (!pl.mentiu) { ganha(s, P, g, 2); diz('+2 ideias: nenhuma falácia sua até aqui.'); }
        break;
      case 'laotse':   // Wu wei
        var foram = 0;
        s.debates.forEach(function (d, di2) {
          if (!livre(d)) return;
          d.stakes[P] += 1; marcaPart(s, di2, P, g.id); foram++;
        });
        if (foram) diz('+1 ideia em ' + (foram > 1 ? foram + ' debates' : 'um debate') + ', sem sair do lugar: age sem agir.');
        break;
      case 'agostinho':   // Graça
        if (g.ideas === 0 && !g.lib) { ganha(s, P, g, 3); diz('+3 ideias: a graça vem para quem nada tem.'); }
        break;
      case 'averrois':   // O Comentador
        if (s.players.some(function (x) { return inGroup(x, 'aristoteles'); })) { ganha(s, P, g, 2); diz('+2 ideias: Aristóteles está na mesa.'); }
        break;
      case 'camus':   // O Absurdo (e Sísifo, na vitória dos adversários)
        if (!s.debates.some(function (x, i) { return lidera(s, i, P); })) { ganha(s, P, g, 1); diz('+1 ideia: nenhum debate na mão, e mesmo assim é preciso continuar.'); }
        break;
      case 'lacan':   // O Grande Outro
        if (s.players.some(function (x, o) { return o !== P && x.points > pl.points; })) { ganha(s, P, g, 1); diz('+1 ideia: há um adversário à frente no placar.'); }
        break;
      case 'aristoteles':
        di = melhorDebate(s, P, function (q) { return q.area === 'logica'; });
        if (di >= 0) { s.debates[di].stakes[P] += 1; marcaPart(s, di, P, g.id); diz('+1 ideia em «' + DEB[s.debates[di].id].q + '».'); }
        break;
      case 'platao':
        t = null; semLib(pl).forEach(function (x) { if (acumula(x) && (!t || C(x.id).custo > C(t.id).custo)) t = x; });
        if (t) { poe(s, t, 1); diz('+1 ideia para ' + C(t.id).nome + ', o Rei Filósofo.'); }
        break;
      case 'socrates':
        t = null;
        semLib(pl).forEach(function (x) { if (x !== g && acumula(x) && (!t || x.ideas < t.ideas)) t = x; });
        if (t) { poe(s, t, 1); diz('+1 ideia para ' + C(t.id).nome + '.'); }
        break;
      case 'epicuro':
        if (s.cfg.poder2) {   // regra nova (26/11/2026): o vizinho é sempre o da direita; com o Jardim, +2 para cada um
          var vd = pl.group[idx + 1], ne = g.legado ? 2 : 1;
          if (vd && !vd.lib && acumula(vd)) { var r1 = poe(s, vd, ne); ganha(s, P, g, ne); if (g.legado) { s.rend = s.rend || {}; s.rend.epicuro = (s.rend.epicuro || 0) + r1 + 1; } diz('+' + nI(ne) + ' para ' + C(vd.id).nome + ' e para Epicuro' + (g.legado ? ' (Jardim).' : '.')); }
          break;
        }
        var viz = [];
        if (idx > 0 && !pl.group[idx - 1].lib && acumula(pl.group[idx - 1])) viz.push(pl.group[idx - 1]);
        if (idx < pl.group.length - 1 && !pl.group[idx + 1].lib && acumula(pl.group[idx + 1])) viz.push(pl.group[idx + 1]);
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
        if (t) { t.ideas -= 1; t.ferido = (t.ferido || 0) + 1; diz(C(t.id).nome + ' (' + nomeJ(s, dono) + ') perde 1 ideia.', 'neg'); pop(s, dono, t.id, '−1 ideia', 'Mais-Valia de Marx', 'neg'); }
        break;
      case 'hobbes':
        var bd = -1, bo = -1, bv = 0;
        for (di = 0; di < s.debates.length; di++) {
          if (!livre(s.debates[di])) continue;
          for (o = 0; o < s.players.length; o++) if (o !== P && s.debates[di].stakes[o] > bv) { bv = s.debates[di].stakes[o]; bd = di; bo = o; }
        }
        if (bd >= 0) { s.debates[bd].stakes[bo] -= 1; diz(nomeJ(s, bo) + ' perde 1 ideia em «' + DEB[s.debates[bd].id].q + '».', 'neg'); }
        break;
      case 'bacon':   // desde 20/11/2026: +1 na Biblioteca se houver debate de Lógica / Ciência na mesa
        if (s.debates.some(function (d) { return DEB[d.id].area === 'logica'; })) { pl.library += 1; diz('+1 ideia na Biblioteca: há debate de Lógica na mesa.'); }
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
          if (C(y.id).custo === 1 && ativo(y) && !y.lib && acumula(y)) { poe(s, y, 1); n++; }
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
      case 'maquiavel':   // desde 19/11/2026: o soberano é o filósofo de maior custo (Bibliotecário incluído); empate, a primeira cadeira
        t = null; pl.group.forEach(function (x) { if (!t || C(x.id).custo > C(t.id).custo) t = x; });
        if (t) {
          if (t.lib || t.ideas >= s.cfg.teto) { pl.library += 1; diz('+1 ideia na Biblioteca: ' + C(t.id).nome + (t.lib ? ', o soberano, é o Bibliotecário.' : ', o soberano, já tem ' + s.cfg.teto + ' ideias.')); }
          else { poe(s, t, 1); diz('+1 ideia para ' + C(t.id).nome + ', o soberano.'); }
        }
        break;
      case 'diogenes':
        if (g.ideas <= 2) { ganha(s, P, g, 1); diz('+1 ideia: vive com o mínimo.'); }
        break;
      case 'erasmo':
        var ed = -1, eo = -1, ev = 0;
        for (di = 0; di < s.debates.length; di++) {   // desde 20/11/2026: só o adversário que lidera (mais ideias que todos os outros)
          if (DEB[s.debates[di].id].area !== 'meta' || !livre(s.debates[di])) continue;
          for (o = 0; o < s.players.length; o++) if (o !== P && s.debates[di].stakes[o] > ev && s.debates[di].stakes[o] > oppMax(s.debates[di], o)) { ev = s.debates[di].stakes[o]; ed = di; eo = o; }
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
    if (pl.niil === 2 && c.escola === 'germ') return out;   // Niilismo
    if (g.id === 'laotse') return out;   // Wu wei: Lao-Tsé não vai a debates
    if (g.semPiloto) return out;   // O Fantasma na Máquina
    if (g.parado) return out;   // Luta de Classes (Marx, Poder 2)
    for (var i = 0; i < s.debates.length; i++) {
      if (!livre(s.debates[i])) continue;
      if (s.debates[i].prop && s.debates[i].prop.P !== P && s.cfg.varLocke !== 3) continue;   // Propriedade (Locke)
      if (pl.orient === 2 && c.escola === 'orient' && DEB[s.debates[i].id].area !== 'meta') continue;   // Orientalismo
      if (g.duvida && (DEB[s.debates[i].id].area === 'logica' || DEB[s.debates[i].id].area === 'meta')) continue;   // Gênio Maligno: dúvida sobre o conhecimento
      var cap = g.id === 'sartre' ? Math.max(c.vals.meta, c.vals.logica, c.vals.etica, c.vals.psico) : c.vals[DEB[s.debates[i].id].area];
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
    if (s.players[P].niil === 2 && C(g.id).escola === 'germ') return 'Niilismo: neste turno, os Germânicos não veem sentido em debater.';
    if (g.id === 'laotse') return 'Wu wei: Lao-Tsé não vai a debates. No momento de Reflexão, você ganha +1 ideia em cada debate aberto, sem que ele saia do lugar.';
    if (s.players[P].orient === 2 && C(g.id).escola === 'orient') return 'Orientalismo: neste turno, os Orientais só vão a debates de Metafísica / Religião.';
    if (g.duvida) return 'Gênio Maligno: em dúvida, não vai a debates de Lógica nem de Metafísica neste turno.';
    if (g.semPiloto) return 'O Fantasma na Máquina: sem a alma ao volante, ' + C(g.id).nome + ' não vai a debates neste turno.';
    if (g.ideas > 0 && !s.debates.some(livre)) return 'Os debates estão trancados pelo Paradoxo Lógico.';
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
    if (g.id === 'leibniz' && q.area === 'logica') { d.stakes[P] += 1; pop(s, P, 'leibniz', 'Cálculo', '+1 ideia em «' + q.q + '».'); }
    if (g.id === 'tomas' && (q.area === 'logica' || q.area === 'meta')) {
      var outra = q.area === 'logica' ? 'meta' : 'logica', dt = -1;
      s.debates.forEach(function (x, i) { if (DEB[x.id].area === outra && livre(x) && x.stakes[P] > 0 && (dt < 0 || DEB[x.id].valor > DEB[s.debates[dt].id].valor)) dt = i; });
      if (dt >= 0) { s.debates[dt].stakes[P] += 1; pop(s, P, 'tomas', 'Fé e Razão', '+1 ideia em «' + DEB[s.debates[dt].id].q + '».'); }
    }
    if (g.id === 'derrida') {
      var nd = 0;
      for (var od = 0; od < s.players.length; od++) if (od !== P && d.stakes[od] > d.stakes[P]) { d.stakes[od] -= 1; d.stakes[P] += 1; nd++; }
      if (nd) pop(s, P, 'derrida', 'Desconstrução', 'a hierarquia se inverte: ' + nd + ' ideia(s) passam para você em «' + q.q + '».');
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
      if (!s.deck.length && s.discard.length) { s.deck = shuffle(s, s.discard); s.discard = []; s.reemb = (s.reemb || 0) + 1; log(s, 'A pilha de descartes foi reembaralhada.', 'sis'); }
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
    limpa(s);
    return true;
  }

  function canGive(s, P, fi) {
    var pl = s.players[P], g = pl.group[fi];
    return !(s.over || s.turn !== P || !g || g.lib || g.parado || !acumula(g) || pl.library < 1 || !ativo(g) || g.ideas >= s.cfg.teto);
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
    limpa(s);
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

  // custo de uma carta temporária para um alvo (a Cicuta custa 1 contra Sócrates)
  function temAtivo(pl, id) { var g = inGroup(pl, id); return g && ativo(g) ? g : null; }
  function custoPraxis(s, P, cardId, prm) {
    var c = C(cardId);
    if (c.falacia && s && s.cfg.poder2 && temLegado(s, 'diogenes')) return c.custo + 1;   // Lanterna de Diógenes: falácias custam 1 a mais
    if ((c.fam === 'argumento' || c.fam === 'praxis') && s && temAtivo(s.players[P], 'voltaire')) return Math.max(1, c.custo - 1);   // Contra o Fanatismo
    if (c.id === 'cicuta' && prm && prm.o !== undefined) {
      var g = s.players[prm.o] && s.players[prm.o].group[prm.fi];
      if (g && g.id === 'socrates') return 1;
    }
    return c.custo;
  }
  function custoMin(cardId, s, P) {
    var c = C(cardId);
    if (c.falacia && s && s.cfg.poder2 && temLegado(s, 'diogenes')) return c.custo + 1;
    if (s && (c.fam === 'argumento' || c.fam === 'praxis') && temAtivo(s.players[P], 'voltaire')) return Math.max(1, c.custo - 1);
    return c.id === 'cicuta' ? 1 : c.custo;
  }
  function temporariaNaMao(id) { return C(id).tipo === 'P'; }

  function praxisOptions(s, P, base) {
    var out = [], pl = s.players[P], d, q, j;
    function ops(fn) { for (var x = 0; x < s.players.length; x++) if (x !== P) fn(x); }
    var M = [];   // debates livres dos quais você participa
    for (var i0 = 0; i0 < s.debates.length; i0++) if (s.debates[i0].stakes[P] > 0 && livre(s.debates[i0])) M.push(i0);
    switch (base) {
      case 'autoridade':
        M.forEach(function (i) { out.push({ label: '+5 em «' + DEB[s.debates[i].id].q + '»', prm: { d: i } }); });
        break;
      case 'espantalho': case 'sofisma': case 'reductio': case 'retorsio': case 'falseabilidade': case 'ceticismo':
        M.forEach(function (i) {
          d = s.debates[i]; q = DEB[d.id];
          if (base === 'falseabilidade' && q.area !== 'logica') return;
          if (base === 'ceticismo' && q.area !== 'meta') return;
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
        M.forEach(function (i) { var dd = s.debates[i]; if (!dd.petitio && dd.stakes[P] > oppMax(dd, P)) out.push({ label: 'Dar por provado «' + DEB[dd.id].q + '»', prm: { d: i } }); });
        break;
      case 'mutatio':
        M.forEach(function (i) {
          for (j = 0; j < s.debates.length; j++) if (j !== i && livre(s.debates[j])) {
            out.push({ label: Math.min(4, s.debates[i].stakes[P]) + ' de «' + DEB[s.debates[i].id].q + '» → «' + DEB[s.debates[j].id].q + '»', prm: { d: i, d2: j } });
          }
        });
        break;
      case 'nonsequitur':
        ops(function (x) {
          var n = s.players[x].hand.filter(temporariaNaMao).length;
          if (n) out.push({ label: nomeJ(s, x) + ' descarta ' + Math.min(3, n) + ' carta' + (n > 1 ? 's' : '') + ' temporária' + (n > 1 ? 's' : ''), prm: { o: x } });
        });
        break;
      case 'tautologia':
        pl.group.forEach(function (g, fi) { if (!g.lib && g.ideas < s.cfg.teto) out.push({ label: '2 ideias para ' + C(g.id).nome, prm: { fi: fi } }); });
        M.forEach(function (i) { out.push({ label: '+2 em «' + DEB[s.debates[i].id].q + '»', prm: { d: i } }); });
        break;
      case 'paradoxo':
        s.debates.forEach(function (dd, i) { if (livre(dd)) out.push({ label: 'Trancar «' + DEB[dd.id].q + '»', prm: { d: i } }); });
        break;
      case 'fantasma':
        for (var xo = 0; xo < s.players.length; xo++) s.players[xo].group.forEach(function (g, fi) {
          if (g.lib || !ativo(g) || DUALISTAS.indexOf(g.id) < 0) return;
          if (xo === P) { if (g.ideas < s.cfg.teto) out.push({ label: 'O fantasma pilota ' + C(g.id).nome + ': +3 ideias', prm: { o: P, fi: fi } }); }
          else if (!imune(g) && !g.semPiloto) out.push({ label: C(g.id).nome + ' sem piloto (' + nomeJ(s, xo) + ')', prm: { o: xo, fi: fi } });
        });
        break;
      case 'cicuta':
        ops(function (x) {
          s.players[x].group.forEach(function (g, fi) {
            if (g.lib || imune(g) || C(g.id).escola !== 'grega') return;
            out.push({ label: 'Eliminar ' + C(g.id).nome + ' (' + nomeJ(s, x) + ')' + (g.id === 'socrates' ? ' · custa 1' : ''), prm: { o: x, fi: fi } });
          });
        });
        break;
      case 'deusmorto':
        ops(function (x) {
          s.players[x].group.forEach(function (g, fi) {
            if (g.lib || imune(g) || C(g.id).escola !== 'teista' || C(g.id).custo > 2) return;
            out.push({ label: 'Remover ' + C(g.id).nome + ' (' + nomeJ(s, x) + ')', prm: { o: x, fi: fi } });
          });
        });
        break;
      case 'determinismo':
        ops(function (x) {
          var n = 0; s.players[x].group.forEach(function (g) { if (!g.lib && !imune(g) && (C(g.id).escola === 'fran' || g.id === 'agostinho') && g.ideas > 0) n++; });
          if (n) out.push({ label: nomeJ(s, x) + ': ' + n + ' filósofo(s) perdem ideias', prm: { o: x } });
        });
        break;
      case 'dogma':
        ops(function (x) {
          var alvos = alvosDogma(s, x);
          if (alvos.length) out.push({ label: alvos.map(function (g) { return C(g.id).nome; }).join(' e ') + ' (' + nomeJ(s, x) + ')', prm: { o: x } });
        });
        break;
      case 'orientalismo':
        ops(function (x) {
          if (s.players[x].orient) return;
          var gs = s.players[x].group.filter(function (g) { return !g.lib && C(g.id).escola === 'orient' && g.id !== 'laotse'; });
          if (gs.length) out.push({ label: 'Reduzir ' + gs.map(function (g) { return C(g.id).nome; }).join(', ') + ' à religião (' + nomeJ(s, x) + ')', prm: { o: x } });
        });
        break;
      case 'niilismo':
        ops(function (x) {
          if (s.players[x].niil) return;
          var gs = s.players[x].group.filter(function (g) { return !g.lib && C(g.id).escola === 'germ'; });
          if (gs.length) out.push({ label: 'Parar ' + gs.map(function (g) { return C(g.id).nome; }).join(', ') + ' (' + nomeJ(s, x) + ')', prm: { o: x } });
        });
        break;
    }
    return out.filter(function (o) { return custoPraxis(s, P, base, o.prm) <= pl.library; });
  }
  // Quem ficou fora do alcance de uma carta e por quê (para a dica da mesa; desde 20/11/2026)
  function foraDoAlcance(s, P, base) {
    var out = [], pl = s.players[P], x, gs;
    for (x = 0; x < s.players.length; x++) {
      if (x === P) continue;
      var op = s.players[x], nj = op.nome;
      if (base === 'cicuta') {
        op.group.forEach(function (g) {
          if (C(g.id).escola !== 'grega') return;
          if (imune(g)) out.push(C(g.id).nome + ' (' + nj + ') é imune.');
          else if (g.lib) out.push(C(g.id).nome + ' (' + nj + ') é o Bibliotecário: a Cicuta não chega à Biblioteca.');
          else if (custoPraxis(s, P, base, { o: x, fi: op.group.indexOf(g) }) > pl.library) out.push(C(g.id).nome + ' (' + nj + '): a Cicuta custa ' + nI(CARTAS.cicuta.custo) + '.');
        });
      } else if (base === 'niilismo') {
        gs = op.group.filter(function (g) { return C(g.id).escola === 'germ'; });
        if (op.niil) out.push(nj + ' já está sob o Niilismo.');
        else if (!gs.length) out.push(nj + ' não tem Germânicos.');
        else if (gs.every(function (g) { return g.lib; })) out.push(nj + ': o único Germânico é o Bibliotecário.');
      } else if (base === 'orientalismo') {
        gs = op.group.filter(function (g) { return C(g.id).escola === 'orient'; });
        if (op.orient) out.push(nj + ' já está sob o Orientalismo.');
        else if (!gs.length) out.push(nj + ' não tem Orientais.');
        else if (gs.every(function (g) { return g.lib || g.id === 'laotse'; })) out.push(nj + ': os Orientais dele não vão a debates (Bibliotecário ou Lao-Tsé).');
      } else if (base === 'deusmorto') {
        op.group.forEach(function (g) {
          if (C(g.id).escola !== 'teista') return;
          if (g.lib) out.push(C(g.id).nome + ' (' + nj + ') é o Bibliotecário.');
          else if (C(g.id).custo > 2) out.push(C(g.id).nome + ' (' + nj + ') custa ' + C(g.id).custo + ': a carta só alcança Teístas de custo 1 ou 2.');
        });
      } else if (base === 'determinismo') {
        gs = op.group.filter(function (g) { return C(g.id).escola === 'fran' || g.id === 'agostinho'; });
        if (!gs.length) out.push(nj + ' não tem Franceses nem Agostinho.');
        else if (gs.every(function (g) { return g.lib || !g.ideas; })) out.push(nj + ': os Franceses dele estão sem ideias' + (gs.some(function (g) { return g.lib; }) ? ' ou são o Bibliotecário.' : '.'));
      } else if (base === 'dogma') {
        gs = op.group.filter(function (g) { return C(g.id).escola === 'mat'; });
        if (!gs.length) out.push(nj + ' não tem Materialistas.');
        else if (!alvosDogma(s, x).length) out.push(nj + ': ' + (gs.some(function (g) { return g.dogma; }) ? 'os Materialistas já estão sob o Dogma.' : 'o único Materialista é o Bibliotecário.'));
      }
    }
    return out;
  }
  // Dogma: os dois Materialistas que mais receberiam no próximo momento de Reflexão
  function alvosDogma(s, o) {
    return s.players[o].group.filter(function (g) { return !g.lib && !g.dogma && C(g.id).escola === 'mat'; })
      .sort(function (a, b) { return C(b.id).custo - C(a.id).custo || a.ideas - b.ideas; }).slice(0, 2);
  }

  function applyPraxis(s, P, base, prm) {
    var d = prm.d !== undefined ? s.debates[prm.d] : null, n, g, op;
    switch (base) {
      case 'autoridade': d.stakes[P] += 5; break;
      case 'espantalho': d.stakes[P] += 4; d.stakes[prm.o] = Math.max(0, d.stakes[prm.o] - 4); break;
      case 'sofisma': d.stakes[P] += 2; d.stakes[prm.o] = Math.max(0, d.stakes[prm.o] - 3); break;
      case 'reductio': d.stakes[prm.o] = Math.ceil(d.stakes[prm.o] / 2); break;   // o oponente fica com a metade, arredondada para cima (9 → 5)
      case 'retorsio': d.stakes[prm.o] -= 3; d.stakes[P] += 3; break;
      case 'falseabilidade': d.stakes[prm.o] = Math.max(0, d.stakes[prm.o] - 5); break;
      case 'ceticismo':
        n = s.players[P].group.some(function (x) { return C(x.id).escola === 'mat'; }) ? 4 : 2;
        d.stakes[prm.o] = Math.max(0, d.stakes[prm.o] - n); break;
      case 'adhominem':
        g = s.players[prm.o].group[prm.fi]; n = Math.min(5, g.ideas); g.ideas -= n; g.ferido = (g.ferido || 0) + n; d.stakes[P] += n; break;   // até 5 (18/11/2026)
      case 'petitio': d.petitio = { P: P }; break;   // desde 20/11/2026: dá a conclusão por provada (vence abaixo do valor se ainda liderar)
      case 'mutatio':
        n = Math.min(4, d.stakes[P]); d.stakes[P] -= n; s.debates[prm.d2].stakes[P] += n; break;
      case 'nonsequitur':
        op = s.players[prm.o];
        var foi = [];
        for (n = 0; n < 3; n++) {   // até 3 desde 20/11/2026 (era 2)
          var ts = []; op.hand.forEach(function (id, k) { if (temporariaNaMao(id)) ts.push(k); });
          if (!ts.length) break;
          var k = ts[Math.floor(rnd(s) * ts.length)];
          foi.push(op.hand[k]); s.discard.push(op.hand.splice(k, 1)[0]);
        }
        prm.foram = foi;
        log(s, op.nome + ' descarta ' + foi.map(function (x) { return C(x).nome; }).join(' e ') + '.', 'neg', prm.o);
        break;
      case 'tautologia':
        if (d) d.stakes[P] += 2; else poe(s, s.players[P].group[prm.fi], 2);
        break;
      case 'paradoxo': d.tranca = { P: P }; break;
      case 'fantasma':
        var gf = s.players[prm.o].group[prm.fi];
        if (prm.o === P) poe(s, gf, 3); else gf.semPiloto = true;
        break;
      case 'cicuta':
        op = s.players[prm.o]; g = op.group.splice(prm.fi, 1)[0];
        s.discard.push(g.id); prm.morto = g.id;
        log(s, C(g.id).nome + ' (' + op.nome + ') bebe a cicuta e deixa a mesa' + (g.ideas ? ', com ' + nI(g.ideas) : '') + '.', 'neg', prm.o);
        break;
      case 'dogma':
        alvosDogma(s, prm.o).forEach(function (x) { x.dogma = true; });
        break;
      case 'deusmorto':
        op = s.players[prm.o]; g = op.group.splice(prm.fi, 1)[0];
        s.discard.push(g.id); prm.morto = g.id;
        log(s, C(g.id).nome + ' (' + op.nome + ') deixa a mesa: Deus está morto' + (g.ideas ? ', e leva ' + nI(g.ideas) : '') + '.', 'neg', prm.o);
        break;
      case 'determinismo':
        s.players[prm.o].group.forEach(function (x) {
          if (x.lib || imune(x)) return;
          var antes = x.ideas;
          if (x.id === 'agostinho') x.ideas = 0; else if (C(x.id).escola === 'fran') x.ideas = Math.max(0, x.ideas - 2);
          if (x.ideas < antes) x.ferido = (x.ferido || 0) + antes - x.ideas;
        });
        break;
      case 'niilismo': s.players[prm.o].niil = 1; break;
      case 'orientalismo': s.players[prm.o].orient = 1; break;
    }
  }

  function playPraxis(s, P, cardId, prm, label) {
    var pl = s.players[P], c = C(cardId), hi = pl.hand.indexOf(cardId), custo = custoPraxis(s, P, cardId, prm);
    if (s.over || s.turn !== P || hi < 0 || c.tipo !== 'P' || pl.library < custo) return false;
    pl.library -= custo;
    pl.hand.splice(hi, 1);
    // as falácias saem do jogo depois de usadas; as demais voltam com o descarte
    if (c.falacia) s.exiladas.push(cardId); else s.discard.push(cardId);
    prm = prm || {};
    // dados só para a coreografia (não alteram regra): debate-alvo e variação das torres
    var d0 = prm.d !== undefined ? s.debates[prm.d] : null, antes = d0 ? d0.stakes.slice() : null;
    applyPraxis(s, P, c.id, prm);
    log(s, pl.nome + ' usa ' + c.nome + (label ? ': ' + label : '') + '.', 'praxis', P);
    fx(s, { k: 'praxis', P: P, id: c.id, label: label || '', prm: prm, did: d0 ? d0.id : null, custo: custo,
      ganho: d0 ? d0.stakes[P] - antes[P] : 0, perda: d0 && prm.o !== undefined ? antes[prm.o] - d0.stakes[prm.o] : 0 });
    if (c.pen) {
      var vigia = s.players.some(function (x, o) { return o !== P && temAtivo(x, 'foucault'); });
      if (vigia) { c = Object.assign({}, c, { pen: c.pen + 1 }); log(s, 'Vigiar e Punir: Foucault cobra 1 ponto a mais pela falácia.', 'con'); }
      pl.points -= c.pen; pl.caveiras += c.pen;
      log(s, 'Falácia: ' + pl.nome + ' perde ' + c.pen + ' ponto' + (c.pen > 1 ? 's' : '') + ' (fica com ' + pl.points + '). ' + c.nome + ' sai do jogo.', 'neg', P);
      fx(s, { k: 'caveira', P: P, id: c.id, n: c.pen, total: pl.caveiras, pontos: pl.points });
    }
    if (c.falacia) pl.mentiu = true;   // Zoroastro: a partir daqui, sem o bônus da verdade
    if (s.cfg.poder2) legadosPraxis(s, P, c);
    gatilhoLocke(s, P, c.id);
    limpa(s);
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
    pl.group.forEach(function (g) { g.foiAnt = !!g.foi; g.foi = false; g.acted = false; g.given = 0; delete g.duvida; delete g.semPiloto; delete g.parado; delete g.p2usado; });
    if (pl.alem) pl.alem.acted = false;
    if (pl.niil === 2) pl.niil = 0;
    if (pl.orient === 2) pl.orient = 0;
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


  // ---------- Poder 2 (nível 2 com poderes pagos; em teste desde 27/11/2026, chave cfg.poder2) ----------
  // Decisões do Flavio (26 e 27/11/2026): custo único de 3 ideias, pagas pelo próprio filósofo (pode receber da
  // Biblioteca antes); usar o Poder 2 é a ação do filósofo no turno; Legado ligado ao filósofo (se ele sai, o Legado sai);
  // um Legado de cada tipo por jogador; o vizinho é sempre o da direita. Por ora só as três escolas originais.
  var LEGADO = {
    platao: { nome: 'Caverna', tipo: 'grupo' }, epicuro: { nome: 'Jardim', tipo: 'grupo' }, rousseau: { nome: 'Estado de natureza', tipo: 'grupo' },
    diogenes: { nome: 'Lanterna', tipo: 'universal' }, hobbes: { nome: 'Leviatã', tipo: 'universal' },
    freud: { nome: 'Divã', tipo: 'pessoal' }, nietzsche: { nome: 'Além-do-homem', tipo: 'pessoal' }
  };
  var PODER2 = {
    aristoteles: ['Termo Médio', 'Num debate de Lógica em que você já tem ideias, um adversário perde 5.'],
    platao: ['Caverna', 'Baixe o Legado Caverna: todos os Gregos da mesa ficam imunes a efeitos de adversários.'],
    socrates: ['Ironia socrática', 'Os filósofos adversários com mais ideias perdem, juntos, até 5 (uma de cada vez, sempre do mais rico).'],
    epicuro: ['Ataraxia', 'Baixe o Legado Jardim: o Laço de Amizade passa a dar +2 a Epicuro e ao vizinho da direita.'],
    pitagoras: ['Metempsicose', 'Pitágoras troca de grupo com um filósofo de custo até 3 de um adversário; os dois chegam sem ideias.'],
    diogenes: ['Cinismo', 'Baixe o Legado Lanterna: as falácias custam 1 ideia a mais; cada falácia de adversário dá +1 a Diógenes. Se você usar falácia, perde a Lanterna.'],
    marx: ['Luta de Classes', 'O filósofo de maior custo de um adversário fica parado no próximo turno do dono; as ideias dele são repartidas entre os filósofos mais pobres da mesa.'],
    hegel: ['Superação', 'Mova até 4 ideias suas de um debate para outro.'],
    hobbes: ['Leviatã', 'Baixe o Legado Leviatã: cada carta temporária jogada por um adversário dá +1 ideia à sua Biblioteca.'],
    bacon: ['Ídolos', 'Cada filósofo do seu grupo, inclusive Bacon, recebe +1 ideia.'],
    locke: ['Propriedade', 'Num debate de Ética / Política em que você já tem ideias: até o início do seu próximo turno, ninguém mais põe ideias ali (tirar pode) e ninguém o vence, nem você.'],
    rousseau: ['Estado de natureza', 'Baixe o Legado: na Reflexão, cada filósofo de custo 1 e 2 do seu grupo recebe +1.'],
    kant: ['Coisa em si', 'Um filósofo adversário perde 3 ideias, ou 5 se for Teísta ou Racionalista.'],
    nietzsche: ['Além-do-homem', 'Baixe o Legado: um filósofo extra, 2-2-2-2, que só recebe ideias da Biblioteca e é imune. Sai com Nietzsche.'],
    schopenhauer: ['Vontade', '+2 ideias em cada debate em que você já tem ideias.'],
    heidegger: ['Ser-para-a-morte', 'Heidegger sai do jogo e leva todas as ideias que lhe restam a um debate, sem o limite do valor.'],
    freud: ['Psicanálise', 'Baixe o Legado Divã: na Reflexão, o vizinho da direita de Freud recebe +1.'],
    arendt: ['Banalidade do Mal', 'No próximo momento de Reflexão dos adversários, os poderes automáticos dos filósofos deles não funcionam.']
  };
  function temLegado(s, id) {
    for (var o = 0; o < s.players.length; o++) { var g = inGroup(s.players[o], id); if (g && g.legado) return { o: o, g: g }; }
    return null;
  }
  function tipoLivre(pl, id) {
    var t = LEGADO[id].tipo;
    return !pl.group.some(function (x) { return x.legado && LEGADO[x.id] && LEGADO[x.id].tipo === t; });
  }
  // depois de cada mudança: Caverna (imunidade dos Gregos), Além-do-homem sem Nietzsche, cercas da Propriedade
  function limpa(s) {
    if (!s.cfg || !s.cfg.poder2) return;
    var cav = !!temLegado(s, 'platao');
    s.players.forEach(function (pl) {
      pl.group.forEach(function (g) { if (cav && C(g.id).escola === 'grega' && !g.lib) g.cav = true; else delete g.cav; });
      if (pl.alem && !inGroup(pl, 'nietzsche')) { delete pl.alem; log(s, 'Sem Nietzsche, o Além-do-homem sai da mesa.', 'sis'); }
    });
    s.debates.forEach(function (d) {
      if (!d.prop || s.cfg.varLocke === 3) return;
      for (var o = 0; o < d.stakes.length; o++) {
        if (o === d.prop.P) continue;
        if (d.stakes[o] > d.prop.cap[o]) d.stakes[o] = d.prop.cap[o]; else d.prop.cap[o] = d.stakes[o];
      }
    });
  }
  function legadosReflexao(s, P) {
    var pl = s.players[P];
    pl.group.forEach(function (g, idx) {
      if (!g.legado || g.lib) return;
      if (g.id === 'rousseau') {
        var n = 0; semLib(pl).forEach(function (x) { if (C(x.id).custo <= 2 && ativo(x) && !x.parado) n += poe(s, x, 1); });
        s.rend = s.rend || {}; s.rend.rousseau = (s.rend.rousseau || 0) + n;
        if (n) pop(s, P, 'rousseau', 'Estado de natureza', '+1 para cada filósofo de custo 1 e 2 do grupo.', 'con');
      }
      if (g.id === 'freud') {
        var vd = pl.group[idx + 1];
        if (vd && !vd.lib && !vd.parado && poe(s, vd, 1) && ((s.rend = s.rend || {}).freud = (s.rend.freud || 0) + 1)) pop(s, P, 'freud', 'Divã', '+1 ideia para ' + C(vd.id).nome + ', em análise.', 'con');
      }
    });
  }
  function legadosPraxis(s, P, c) {
    var o, lt;
    if (c.falacia) {
      lt = temLegado(s, 'diogenes');
      if (lt && lt.o === P) { delete lt.g.legado; log(s, s.players[P].nome + ' usou uma falácia e perde a Lanterna de Diógenes.', 'neg', P); fx(s, { k: 'semLegado', P: P, id: 'diogenes' }); }
      else if (lt && poe(s, lt.g, 1) && ((s.rend = s.rend || {}).diogenes = (s.rend.diogenes || 0) + 1)) pop(s, lt.o, 'diogenes', 'Lanterna', '+1 ideia: ' + s.players[P].nome + ' usou uma falácia.', 'con');
    }
    lt = temLegado(s, 'hobbes');
    if (lt && lt.o !== P) { s.players[lt.o].library += 1; (s.rend = s.rend || {}).hobbes = (s.rend.hobbes || 0) + 1; pop(s, lt.o, 'hobbes', 'Leviatã', '+1 ideia na Biblioteca: imposto sobre a carta de ' + s.players[P].nome + '.', 'con'); }
  }
  function podeP2(s, P, fi) {
    var pl = s.players[P], g = pl.group[fi];
    return !!(s.cfg.poder2 && !s.over && s.turn === P && g && PODER2[g.id] && !g.lib && ativo(g) && !g.p2usado && !(s.cfg.p2Acao && g.acted) && !g.parado && !g.semPiloto);
  }
  function alvosP2(s, P, o, f) { var out = []; s.players[o].group.forEach(function (h, k) { if (!h.lib && !imune(h) && f(h)) out.push(k); }); return out; }
  function poder2Options(s, P, fi) {
    var out = [], pl = s.players[P], g = pl.group[fi], o, i, j;
    if (!podeP2(s, P, fi)) return out;
    function dlab(i) { return '«' + DEB[s.debates[i].id].q + '»'; }
    if (LEGADO[g.id]) { if (!g.legado && tipoLivre(pl, g.id)) out.push({ label: 'Baixar ' + LEGADO[g.id].nome, prm: {} }); return out; }
    switch (g.id) {
      case 'aristoteles':
        s.debates.forEach(function (d, i) {
          if (!livre(d) || DEB[d.id].area !== 'logica' || d.stakes[P] <= 0) return;
          for (o = 0; o < s.players.length; o++) if (o !== P && d.stakes[o] > 0) out.push({ label: dlab(i) + ': ' + nomeJ(s, o) + ' perde ' + Math.min(5, d.stakes[o]), prm: { d: i, o: o } });
        });
        break;
      case 'socrates': case 'bacon': case 'schopenhauer': case 'arendt':
        out.push({ label: PODER2[g.id][0], prm: {} });
        break;
      case 'pitagoras':
        for (o = 0; o < s.players.length; o++) if (o !== P) alvosP2(s, P, o, function (h) { return trocavel(h) && C(h.id).custo <= 3; }).forEach(function (k) {
          out.push({ label: 'Trocar por ' + C(s.players[o].group[k].id).nome + ' (' + nomeJ(s, o) + ')', prm: { o: o, fi2: k } });
        });
        break;
      case 'marx':
        for (o = 0; o < s.players.length; o++) if (o !== P && alvoMarx(s, o) >= 0) out.push({ label: 'Contra ' + nomeJ(s, o), prm: { o: o } });
        break;
      case 'hegel':
        for (i = 0; i < s.debates.length; i++) {
          if (!livre(s.debates[i]) || s.debates[i].stakes[P] <= 0) continue;
          for (j = 0; j < s.debates.length; j++) if (j !== i && livre(s.debates[j]) && !(s.debates[j].prop && s.debates[j].prop.P !== P))
            out.push({ label: Math.min(4, s.debates[i].stakes[P]) + ' de ' + dlab(i) + ' para ' + dlab(j), prm: { d: i, d2: j } });
        }
        break;
      case 'locke':
        s.debates.forEach(function (d, i) { if (livre(d) && !d.prop && d.stakes[P] > 0 && DEB[d.id].area === 'etica') out.push({ label: 'Cercar ' + dlab(i), prm: { d: i } }); });
        break;
      case 'kant':
        for (o = 0; o < s.players.length; o++) if (o !== P) alvosP2(s, P, o, function (h) { return h.ideas > 0; }).forEach(function (k) {
          var h = s.players[o].group[k];
          out.push({ label: C(h.id).nome + ' (' + nomeJ(s, o) + ') perde ' + Math.min(C(h.id).escola === 'teista' ? 5 : 3, h.ideas), prm: { o: o, fi2: k } });
        });
        break;
      case 'heidegger':
        s.debates.forEach(function (d, i) { if (livre(d) && !(d.prop && d.prop.P !== P)) out.push({ label: 'Último ato em ' + dlab(i), prm: { d: i } }); });
        break;
    }
    return out;
  }
  function alvoMarx(s, o) {
    var best = -1, gs = s.players[o].group;
    gs.forEach(function (h, k) {
      if (h.lib || imune(h)) return;
      if (best < 0 || C(h.id).custo > C(gs[best].id).custo || (C(h.id).custo === C(gs[best].id).custo && h.ideas > gs[best].ideas)) best = k;
    });
    return best;
  }
  function usaPoder2(s, P, fi, prm) {
    var pl = s.players[P], g = pl.group[fi], custo = s.cfg.custoP2, o, d, n, h, k;
    prm = prm || {};
    if (!podeP2(s, P, fi) || g.ideas < custo) return false;
    var ok = poder2Options(s, P, fi).some(function (x) { return JSON.stringify(x.prm) === JSON.stringify(prm); });
    if (!ok) return false;
    var nome = PODER2[g.id][0], txt = '';
    g.ideas -= custo; g.p2usado = true; if (s.cfg.p2Acao) g.acted = true;
    s.p2 = s.p2 || {}; s.p2[g.id] = (s.p2[g.id] || 0) + 1;
    if (LEGADO[g.id]) {
      g.legado = true; (s.rodLeg = s.rodLeg || {})[g.id] = ((s.rodLeg || {})[g.id] || []).concat([s.round]);
      if (g.id === 'nietzsche') pl.alem = { ideas: 0, acted: false, novo: true };
      txt = 'baixa o Legado ' + LEGADO[g.id].nome + '.';
    } else switch (g.id) {
      case 'aristoteles':
        d = s.debates[prm.d]; n = Math.min(5, d.stakes[prm.o]); d.stakes[prm.o] -= n;
        txt = nomeJ(s, prm.o) + ' perde ' + nI(n) + ' em «' + DEB[d.id].q + '».'; break;
      case 'socrates':
        var tirou = 0;
        for (k = 0; k < 5; k++) {
          h = null;
          for (o = 0; o < s.players.length; o++) if (o !== P) s.players[o].group.forEach(function (x) { if (!x.lib && !imune(x) && x.ideas > 0 && (!h || x.ideas > h.ideas)) h = x; });
          if (!h) break;
          h.ideas -= 1; h.ferido = (h.ferido || 0) + 1; tirou++;
        }
        txt = 'os adversários mais ricos perdem ' + nI(tirou) + '.'; break;
      case 'pitagoras':
        var op = s.players[prm.o], b = op.group[prm.fi2];
        pl.group[fi] = { id: b.id, ideas: 0, novo: true, acted: false, given: 0, foi: false, foiAnt: false };
        op.group[prm.fi2] = { id: 'pitagoras', ideas: 0, novo: true, acted: true, given: 0, foi: false, foiAnt: false };
        txt = 'a alma de Pitágoras migra para o grupo de ' + op.nome + ', e ' + C(b.id).nome + ' vem para o seu.'; break;
      case 'marx':
        k = alvoMarx(s, prm.o); h = s.players[prm.o].group[k];
        var monte = h.ideas; h.ideas = 0; h.parado = true; h.ferido = (h.ferido || 0) + monte;
        var rep = 0;
        while (monte > 0) {
          var alvo = null;
          for (var q = 0; q < s.players.length; q++) {
            var oq = (P + q) % s.players.length;
            s.players[oq].group.forEach(function (x) { if (x !== h && !x.lib && acumula(x) && x.ideas < s.cfg.teto && (!alvo || x.ideas < alvo.ideas)) alvo = x; });
          }
          if (!alvo) { pl.library += monte; break; }
          alvo.ideas += 1; monte--; rep++;
        }
        txt = C(h.id).nome + ' (' + nomeJ(s, prm.o) + ') fica parado no próximo turno; ' + nI(rep) + ' repartidas entre os mais pobres da mesa.'; break;
      case 'hegel':
        d = s.debates[prm.d]; n = Math.min(4, d.stakes[P]); d.stakes[P] -= n; s.debates[prm.d2].stakes[P] += n; marcaPart(s, prm.d2, P, 'hegel');
        txt = nI(n) + ' passam de «' + DEB[d.id].q + '» para «' + DEB[s.debates[prm.d2].id].q + '».'; break;
      case 'bacon':
        n = 0; semLib(pl).forEach(function (x) { n += poe(s, x, 1); });
        txt = '+1 ideia para cada filósofo do grupo (' + n + ').'; break;
      case 'locke':
        d = s.debates[prm.d]; d.prop = { P: P, cap: d.stakes.slice() };
        txt = '«' + DEB[d.id].q + '» é propriedade sua até o seu próximo turno.'; break;
      case 'kant':
        h = s.players[prm.o].group[prm.fi2]; n = Math.min(C(h.id).escola === 'teista' ? 5 : 3, h.ideas); h.ideas -= n; h.ferido = (h.ferido || 0) + n;
        txt = C(h.id).nome + ' (' + nomeJ(s, prm.o) + ') perde ' + nI(n) + '.'; break;
      case 'schopenhauer':
        n = 0; s.debates.forEach(function (x, i) { if (livre(x) && x.stakes[P] > 0 && !(x.prop && x.prop.P !== P)) { x.stakes[P] += 2; n++; } });
        txt = '+2 ideias em ' + n + ' debate(s).'; break;
      case 'heidegger':
        d = s.debates[prm.d]; n = g.ideas; d.stakes[P] += n; marcaPart(s, prm.d, P, 'heidegger');
        pl.group.splice(fi, 1); s.discard.push('heidegger');
        txt = 'Heidegger sai do jogo e leva ' + nI(n) + ' a «' + DEB[d.id].q + '».'; break;
      case 'arendt':
        for (o = 0; o < s.players.length; o++) if (o !== P) s.players[o].banal = true;
        txt = 'na próxima Reflexão dos adversários, os poderes automáticos não funcionam.'; break;
    }
    log(s, nome + ' (' + C(g.id).nome + '): ' + txt, 'con', P);
    fx(s, { k: 'poder2', P: P, id: g.id, nome: nome, txt: txt });
    limpa(s);
    checkInstant(s, P);
    return true;
  }
  // Além-do-homem: filósofo extra 2-2-2-2, fora das cadeiras; só recebe ideias da Biblioteca; imune (não é alvo)
  function alemOptions(s, P) {
    var a = s.players[P].alem, out = [];
    if (!a || a.novo || a.acted || a.ideas < 2 || s.turn !== P || s.over) return out;
    s.debates.forEach(function (d, i) { if (livre(d) && !(d.prop && d.prop.P !== P)) out.push(i); });
    return out;
  }
  function moveAlem(s, P, di) {
    if (alemOptions(s, P).indexOf(di) < 0) return false;
    var a = s.players[P].alem, d = s.debates[di];
    a.ideas -= 2; a.acted = true; d.stakes[P] += 2;
    log(s, 'O Além-do-homem leva 2 ideias a «' + DEB[d.id].q + '».', 'mov', P);
    fx(s, { k: 'alem', P: P, di: di, did: d.id });
    checkInstant(s, P);
    return true;
  }
  function giveAlem(s, P) {
    var pl = s.players[P], a = pl.alem;
    if (!a || a.novo || pl.library < 1 || a.ideas >= s.cfg.teto || s.turn !== P || s.over) return false;
    pl.library -= 1; a.ideas += 1; return true;
  }
  // valor futuro de um Legado por turno (para a IA), em ideias
  function rendaLegado(s, pl, g) {
    switch (g.id) {
      case 'epicuro': return 2;
      case 'rousseau': return semLib(pl).filter(function (x) { return C(x.id).custo <= 2; }).length;
      case 'freud': return 1;
      case 'diogenes': return 0.7;
      case 'hobbes': return 0.9;
      case 'platao': return 0.6 + 0.3 * semLib(pl).filter(function (x) { return C(x.id).escola === 'grega'; }).length;
      case 'nietzsche': return 1.3;
    }
    return 0;
  }

  // ---------- IA ----------
  function horizonte(s) {   // 1 com a partida em curso; cai na penúltima e na última rodada
    var top = Math.max.apply(null, s.players.map(function (x) { return x.points; }));
    var resta = top >= s.cfg.pontos ? 0 : s.cfg.rodadas - s.round;
    return resta >= 2 ? 1 : resta === 1 ? 0.6 : 0.15;
  }

  function evalState(s, P) {
    var v = 0, i, o;
    for (i = 0; i < s.debates.length; i++) {
      var d = s.debates[i], val = DEB[d.id].valor, mine = d.stakes[P], om = oppMax(d, P);
      var pv = d.petitio ? d.petitio.P : -1, req = pv === P ? 1 : val, reqO = pv >= 0 && pv !== P ? 1 : val;   // Petitio: o limiar cai para 1
      // Debate perdido: um adversário já vence no turno dele e você não o alcança. As suas ideias ali vão se perder,
      // então não valem nada (antes valiam, e a IA despejava ideias em debates que o próximo jogador levaria).
      var perdido = om >= reqO && om > mine && !(d.tranca && d.tranca.P === P) && !(d.prop && d.prop.P === P);
      if (!perdido) {
        v += 0.6 * Math.min(mine, val);
        v += 0.25 * Math.max(-val, Math.min(val, mine - om));
      }
      if (mine >= req && mine > om) v += 0.8 * val;
      if (om >= reqO && om > mine) v -= 0.6 * val;
      if (d.tranca) {   // Paradoxo: liderança protegida (ou a do adversário adiada)
        if (d.tranca.P === P && mine >= val && mine > om) v += 0.7 * val;
        else if (d.tranca.P === P && om >= val && om > mine) v += 0.3 * val;
        else if (d.tranca.P !== P) v -= 0.1 * val;
      }
      if (d.prop) {   // Propriedade (Locke): o dono vence se liderar; os outros não entram nem vencem ali
        if (d.prop.P === P && mine >= val && mine > om) v += (s.cfg.varLocke === 2 ? 0.2 : 0.7) * val;
        else if (d.prop.P === P && om >= val && om > mine) v += 0.4 * val;
        else if (d.prop.P !== P) v -= 0.1 * val;
      }
    }
    var maxOpp = 0;
    for (o = 0; o < s.players.length; o++) {
      var pl = s.players[o];
      if (o === P) {
        // Ideia parada vale menos quanto mais sobra e quanto mais perto do fim: no fim da partida não vale nada.
        // (Antes, 0,4 por ideia sempre; a IA terminava a partida com 16 ideias na Biblioteca, em média.)
        var h = horizonte(s);
        v += pl.points * 3 + h * (0.4 * Math.min(pl.library, 8) + 0.15 * Math.max(0, pl.library - 8));
        pl.group.forEach(function (g) { v += h * 0.45 * g.ideas; });
        if (s.cfg.poder2) {
          var fut = Math.min(4, Math.max(0, s.cfg.rodadas - s.round));
          pl.group.forEach(function (g) {
            if (!g.lib) v += 0.9 * C(g.id).custo;   // perder um filósofo seu também pesa (Heidegger, Metempsicose)
            if (g.legado) v += h * 0.45 * rendaLegado(s, pl, g) * fut;
          });
          if (pl.alem) v += h * 0.45 * pl.alem.ideas;
        }
      }
      else {
        maxOpp = Math.max(maxOpp, pl.points);
        pl.group.forEach(function (g) {
          v -= (s.cfg.poder2 ? 0.3 : 0.15) * g.ideas;   // com o Poder 2, tirar ideias de filósofos adversários pesa mais (eles pagam poderes)
          if (!g.lib) v -= 0.9 * C(g.id).custo;                       // perder um filósofo pesa (Cicuta)
          if (g.dogma) v += 0.5 * (REFLEXAO[C(g.id).custo] + 1);      // Dogma: Reflexão perdida
          if (pl.niil === 1 && C(g.id).escola === 'germ' && !g.lib) v += 0.12 * g.ideas + 0.4;   // Niilismo
          if (pl.orient === 1 && C(g.id).escola === 'orient' && !g.lib && g.id !== 'laotse') v += 0.05 * g.ideas + 0.15;   // Orientalismo
          if (g.semPiloto) v += 0.12 * g.ideas + 0.3;   // O Fantasma na Máquina
          if (g.parado) v += 0.5 * (REFLEXAO[C(g.id).custo] + 1) + 0.3;   // Luta de Classes
          if (g.legado) v -= 0.25 * rendaLegado(s, pl, g) * Math.min(4, Math.max(0, s.cfg.rodadas - s.round));
        });
        if (pl.banal) v += 0.4 * semLib(pl).length;   // Banalidade do Mal
        if (pl.alem) v -= 0.15 * pl.alem.ideas + 1;
        v -= 1.2 * pl.hand.filter(temporariaNaMao).length;            // Non Sequitur
      }
    }
    return v - maxOpp * 1.5;
  }

  function aiStep(s) {
    if (s.over) return false;
    var P = s.turn, pl = s.players[P], mestre = pl.nivel === 'mestre', i, j, c;
    // Saturação (27/11/2026): com a Biblioteca cheia, o gargalo são as ações. O Bibliotecário só aumenta a sobra;
    // a IA o troca por um debatedor, compra cartas para ter o que fazer e aceita trocas e temporárias que rendem menos.
    var sat = s.cfg.iaSat && pl.library >= s.cfg.iaSat && horizonte(s) > 0.15;
    if (sat && s.cfg.iaSatBib && s.round >= s.cfg.iaSatBib && libIdx(pl) >= 0) {
      var li0 = libIdx(pl), bh = -1, bhv = -1;
      for (i = 0; i < pl.hand.length; i++) { c = C(pl.hand[i]); if (c.tipo === 'F' && c.custo <= pl.library && c.custo > bhv) { bhv = c.custo; bh = i; } }
      if (bh >= 0) { playPhilosopher(s, P, pl.hand[bh], li0); return true; }
    }
    // 0) Bibliotecário e troca
    if (libIdx(pl) < 0 && pl.group.length < 4 && pl.group.length >= 1 && s.round <= (s.cfg.iaSat ? s.cfg.iaBibRod : 6)) {
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
      if (meu >= 0 && bo >= 0 && bvv - mv >= (sat ? 2 : 3)) { trocar(s, P, meu, bo, bi); return true; }
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
      // Biblioteca sobrando: o gargalo são as ações, não as ideias. Troca o filósofo que leva menos aos debates
      // da mesa por um que leve bem mais (antes a IA guardava 15 ou 20 ideias sem ter onde pôr).
      if (pl.library >= 8 && horizonte(s) > 0.15) {
        var alcance = function (id) { var cc = C(id), m = 0; s.debates.forEach(function (d) { m = Math.max(m, cc.vals[DEB[d.id].area]); }); return m; };
        var mi = -1, mv2 = 1e9, ni = -1, nv = -1;
        for (i = 0; i < pl.group.length; i++) {
          if (pl.group[i].lib) continue;
          var a = alcance(pl.group[i].id) + 0.3 * pl.group[i].ideas;
          if (a < mv2) { mv2 = a; mi = i; }
        }
        for (i = 0; i < pl.hand.length; i++) {
          var ch = C(pl.hand[i]);
          if (ch.tipo !== 'F' || ch.custo > pl.library) continue;
          if (alcance(ch.id) > nv) { nv = alcance(ch.id); ni = i; }
        }
        if (mi >= 0 && ni >= 0 && nv >= mv2 + 2) { playPhilosopher(s, P, pl.hand[ni], mi); return true; }
      }
    }
    // 2) práxis
    var base = evalState(s, P);
    if (mestre || rnd(s) < 0.35) {
      var bestP = null, bpv = sat ? 0.15 : pl.library >= 8 ? 0.3 : 0.6;   // com ideias sobrando, a carta temporária precisa render menos
      for (i = 0; i < pl.hand.length; i++) {
        c = C(pl.hand[i]);
        if (c.tipo !== 'P' || custoMin(c.id, s, P) > pl.library) continue;
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
    if (s.cfg.poder2) {   // Poder 2: completa as 3 ideias se faltar e compara com ir a um debate
      for (i = 0; i < pl.group.length; i++) {
        var po2 = poder2Options(s, P, i);
        if (!po2.length) continue;
        var falta2 = Math.max(0, s.cfg.custoP2 - pl.group[i].ideas);
        if (falta2 > pl.library) continue;
        for (j = 0; j < po2.length; j++) {
          var t3 = clone(s); t3.mudo = true;
          for (var k3 = 0; k3 < falta2; k3++) giveIdea(t3, P, i, true);
          if (!usaPoder2(t3, P, i, po2[j].prm)) continue;
          var sc3 = evalState(t3, P) - base;
          lista.push({ fi: i, falta: falta2, sc: sc3, p2: po2[j].prm });
          if (sc3 > pv) { pv = sc3; plano = lista[lista.length - 1]; }
        }
      }
      if (pl.alem && !pl.alem.novo && !pl.alem.acted) {
        var faltaA = Math.max(0, 2 - pl.alem.ideas);
        if (faltaA <= pl.library) s.debates.forEach(function (d, di) {
          var t4 = clone(s); t4.mudo = true;
          for (var k4 = 0; k4 < faltaA; k4++) giveAlem(t4, P);
          if (!moveAlem(t4, P, di)) return;
          var sc4 = evalState(t4, P) - base;
          lista.push({ alem: true, di: di, falta: faltaA, sc: sc4 });
          if (sc4 > pv) { pv = sc4; plano = lista[lista.length - 1]; }
        });
      }
    }
    // Nível básico: às vezes escolhe uma jogada qualquer, mas só entre as que ajudam (antes podia despejar ideias num debate já perdido).
    var boas = lista.filter(function (x) { return x.sc > 0; });
    if (!mestre && boas.length && rnd(s) < 0.45) plano = boas[Math.floor(rnd(s) * boas.length)];
    if (plano && plano.alem) {
      for (i = 0; i < plano.falta; i++) giveAlem(s, P);
      moveAlem(s, P, plano.di);
      return true;
    }
    if (plano && plano.p2) {
      for (i = 0; i < plano.falta; i++) giveIdea(s, P, plano.fi, true);
      usaPoder2(s, P, plano.fi, plano.p2);
      return true;
    }
    if (plano) {
      for (i = 0; i < plano.falta; i++) giveIdea(s, P, plano.fi, true);
      if (plano.falta) fx(s, { k: 'dar', P: P, id: pl.group[plano.fi].id, n: plano.falta });
      moveToDebate(s, P, plano.fi, plano.di);
      return true;
    }
    // 4) carta extra
    // Com ideias sobrando, compra mais opções (antes só com a mão quase vazia, e a Biblioteca acumulava).
    if (!pl.boughtExtra && pl.library >= 4 && (pl.hand.length <= 2 || sat || (pl.library >= 7 && pl.hand.length <= 4 && horizonte(s) > 0.15))) { buyExtra(s, P); return true; }
    endTurn(s);
    return true;
  }

  var API = {
    AREAS: AREAS, AREA: AREA, ESCOLA: ESCOLA, FAMILIA: FAMILIA, FILOSOFOS: FILOSOFOS, PRAXIS: PRAXIS, DEBATES: DEBATES, DEB: DEB, RELACOES: RELACOES,
    DUPLAS: DUPLAS, BONUS_DUPLA: BONUS_DUPLA, duplasDe: duplasDe, imune: imune, trocavel: trocavel, REFLEXAO: REFLEXAO, FALAS: FALAS,
    C: C, newGame: newGame, temColega: temColega, moveOptions: moveOptions, porqueNao: porqueNao, moveToDebate: moveToDebate,
    playPhilosopher: playPhilosopher, trocar: trocar, podeTrocar: podeTrocar, libIdx: libIdx, nI: nI, canGive: canGive, giveIdea: giveIdea, buyExtra: buyExtra,
    praxisOptions: praxisOptions, playPraxis: playPraxis, PODER2: PODER2, LEGADO: LEGADO, poder2Options: poder2Options, usaPoder2: usaPoder2, podeP2: podeP2,
    alemOptions: alemOptions, moveAlem: moveAlem, giveAlem: giveAlem, temLegado: temLegado, nascimento: nascimento, acumula: acumula, endTurn: endTurn, aiStep: aiStep,
    oppMax: oppMax, lidera: lidera, ativo: ativo, evalState: evalState, livre: livre, custoPraxis: custoPraxis, custoMin: custoMin, foraDoAlcance: foraDoAlcance
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.BF = API;
})(typeof window !== 'undefined' ? window : this);
