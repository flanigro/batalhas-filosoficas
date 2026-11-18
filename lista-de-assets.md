# Lista de assets: o que substitui os provisórios da mesa 3D (17/11/2026; revista nas rodadas 5 e 6 e no contrato dos personagens)

Acompanha a mesa em Three.js (rodadas 3 a 6). Na rodada 5 a mesa virou uma arena semicircular de mármore: faixa dos adversários no alto, placas no centro, púlpitos do jogador na frente e a faixa inferior em HTML. Hoje tudo o que se vê na mesa é provisório: texturas geradas por código, figuras desenhadas por código, retratos de banco. Este documento lista cada peça, com as medidas para produzir a definitiva.

## Convenções

- Luz: uma só, sol poente, vindo da direita de quem olha, baixo (cerca de 30° acima do horizonte) e um pouco pela frente. Tom quente. Nas texturas de material (mármore, madeira, bronze) NÃO pintar luz nem sombra: a cena ilumina. Em tudo o que é desenho plano (bonecos, coro, fundo, retratos) a luz pintada deve vir da direita, e a sombra projetada no chão fica por conta do programa.
- Unidade de cena: a placa de debate tem 3,95 unidades de largura e 3,5 de altura (com três jogadores); o púlpito do jogador, 2,3 de largura e 1,22 de altura; o púlpito compacto do adversário, 1,34 × 0,64 (a faixa dos adversários é ampliada 1,24 vez na cena). "Escala" abaixo diz quantas unidades de cena uma repetição da textura cobre.
- Mapas de um material: cor (albedo, sem luz pintada), normal (padrão OpenGL, verde para cima) e rugosidade (branco = fosco). Metais levam também o mapa de metal. Nos bancos gratuitos esses mapas já vêm prontos, com esses nomes.
- Formatos: cor e rugosidade em JPG (qualidade 85 a 90); normal em PNG; tudo o que tem recorte (transparência) em PNG ou WebP. Lados em potência de 2 (1024, 2048, 4096) sempre que a textura repete.
- Onde trocar: cada material tem uma linha na tabela ARQUIVOS de materiais.js (o nome do material e os três arquivos). Desenhos planos trocam em mesa3d.js, nas funções indicadas em cada item; os personagens entram por arquivo (item 1.1). Sugestão de pastas: tex/ (materiais), personagens/ (ilustrações dos filósofos), coro/, img/ (retratos).

## 1. O que o Flavio desenha

### 1.1 Personagens dos filósofos (contrato do piloto; tecnologia de animação em aberto)

Decisão de 17/11/2026 (parecer técnico aprovado): separar como desenhar os filósofos de como animá-los. A arte começa agora; a tecnologia de animação será escolhida depois de testar o Nietzsche. Ficam em aberto, decididas por teste: **Rive** desenhando todos os personagens num canvas compartilhado, usado como textura na cena; ou **marionete de recorte montada no Three.js**, com as partes em planos e as animações por programa. O Rive continua como possibilidade artística, sobretudo para movimentos expressivos e individualizados. Custo a confirmar na contratação: a exportação gratuita do Rive mostra uma abertura do Rive, e a página oficial informa plano pago a partir de US$ 9 por usuário por mês.

- **O que é:** uma ilustração-mestre por filósofo, de corpo inteiro, caricatural, simples, de contorno orgânico, no traço dos desenhos do Flavio (como o Diógenes no barril). A iconografia das cartas é referência de identidade, não de estilo.
- **Piloto, nesta ordem:** Nietzsche (estudo visual e estilo), depois Diógenes (anatomia fora do comum e acessórios) e Aristóteles (figura convencional, para padronizar). Nada de produzir os 20 de uma vez.
- **Primeira entrega estática.** O estudo do Nietzsche vem sem articulação e sem animação, para avaliar a arte e testar a escala na cena. Só depois de aprovado se prepara o rig.
- **Prancheta:** personagem com cerca de 2000 px de altura, numa prancheta de cerca de 1500 × 2200 px, fundo transparente, com folga em cima e nos lados para os braços erguidos no salto. Pés apoiados numa linha de chão a 4% da borda de baixo; figura centrada; uma vista só (de frente ou três quartos).
- **Guia do púlpito:** linha horizontal a 48% da altura da figura, medida a partir dos pés (na prancheta acima, a 47,6% da altura da prancheta, a partir da borda de baixo). Na cena, os pés ficam no chão atrás do púlpito e a guia coincide com o tampo: tudo abaixo dela fica escondido. Rosto, ombros e mãos em repouso ficam acima da guia. Com cerca de três cabeças de altura, a linha cai perto da cintura. A mesma arte serve, em escala menor, nos púlpitos compactos dos adversários.
- **Camadas desde o estudo estático** (não precisa articular, mas desenhar separado evita redesenho), com nomes fixos que se mantêm entre versões:
  - cabeça, olhos ou pálpebras, sobrancelhas, boca (opcional);
  - tronco e quadril;
  - braço e antebraço com a mão, de cada lado;
  - coxa e perna com o pé, de cada lado;
  - acessórios soltos (bigode do Nietzsche na cabeça; barril e lanterna do Diógenes à parte; o cachorro é opcional).
  - Sobra nas juntas: cada parte avança por baixo da vizinha, para o giro não abrir buraco.
- **Pivôs e âncoras:** uma camada de guias com uma cruzinha nomeada em cada ponto. Pivôs: base do pescoço, ombros, cotovelos, quadris, joelhos. Âncoras: "base" (no chão, entre os pés), "mão-que-deposita" (onde o programa encaixa o livro durante o gesto), "topo-da-cabeça" (etiquetas e balões).
- **Arquivos:** PSD em 8 bits (há relatos de PSD em 16 bits que o Rive não importa) e um PNG achatado com transparência. Na arte não entram custo, nome, valores nem livros; os estados "recém-baixado" e "já debateu" são feitos pelo programa.
- **Encaixe estático pronto (branch `mesa-3d`):** o PNG achatado vai em `personagens/<id>.png` (por exemplo `personagens/nietzsche.png`) e substitui a imagem da carta atrás do púlpito, com os pés no chão e a guia no tampo; se o arquivo faltar, volta a carta. As frações da linha do chão e da guia ficam no registro PERSONAGENS de mesa3d.js, caso a arte use outras. Entradas de teste: `#nietzsche` (Nietzsche no seu grupo), `#doze` (o personagem nas doze vagas), `#medir` (painel de desempenho); combinam com hífen, como `#nietzsche-medir`.
- **Contrato de movimentos** (para a etapa animada): repouso (laço de 3 a 5 s: respira, pisca), impulso (cerca de 0,25 s), voo (pose mantida durante a trajetória, que é do Three.js), pouso (cerca de 0,25 s), depositar (cerca de 0,5 s, com o evento "solta" no quadro em que a mão solta os livros), volta (impulso, voo, pouso e repouso no púlpito). A coreografia (coreo.js) manda no tempo; o personagem toca os clipes e avisa o fim de cada um e o "solta". Os livros são da engine e da cena: um gesto serve para qualquer quantidade.
- **Fora do contrato:** caminhada, lançamento de papiros, reações elaboradas e animações de personalidade (ficam para depois). O encaixe antigo em HTML (`.fig`) sai: não deixa o púlpito esconder o personagem.
- **Desempenho:** até 12 filósofos visíveis ao mesmo tempo. Metas: 45 quadros por segundo ou mais em notebook com vídeo integrado, 30 ou mais em tablet, medidas com `#medir` (gravação de 20 s: parado, durante um salto, com a câmera em foco).
- **Substitui:** a imagem da carta atrás dos púlpitos (texFig) e o boneco provisório do Diógenes em bonecos.js (desligado; fica como referência).

### 1.2 Retratos (mão, carta ampliada, telas centrais, figuras atrás dos púlpitos)

- O que é: um retrato por filósofo, usado em cinco lugares: carta pequena da mão (118 × 163 px), carta ampliada (foto de cerca de 680 × 560 px visíveis), retrato das telas centrais (210 × 236 px) e, desde a rodada 5, a figura atrás dos púlpitos, tanto do jogador quanto dos adversários (textura de 320 × 428 px, proporção 3:4, com o custo pintado no canto de cima; o púlpito esconde o terço de baixo).
- Figura atrás do púlpito: hoje é o retrato num retângulo com moldura na cor da escola. Será substituída pela ilustração de corpo inteiro do item 1.1 (encaixe pronto em `personagens/<id>.png`); o busto recortado deixa de ser necessário.
- Formato: um arquivo-mestre por filósofo, JPG, 1200 × 1500 px (4:5), rosto no terço de cima, com folga dos lados para recorte. Sem transparência.
- Estilo: o mesmo para os 20 (hoje há foto, pintura a óleo e escultura misturadas). Luz da direita. Fundo neutro, sem texto.
- Substitui: img/<id>.jpg (20 arquivos, de 9 a 32 KB, provisórios de banco e de obras que podem ter proteção).
- Pode ser gerado (Firefly) a partir de um modelo de estilo definido pelo Flavio; ver seção 3.

### 1.3 Coro grego (adiado: arquibancadas vazias nesta fase)

- Na rodada 5 as figuras saíram da cena; fica registrado para quando houver público nas laterais da arena, se a poluição visual permitir.

- O que é: as figuras da arquibancada, em estilo de cerâmica de figuras negras, braços erguidos.
- Onde aparece: 19 figuras em duas fileiras, atrás do parapeito da galeria dos adversários, no alto da tela. Cada uma tem de 40 a 55 px de altura visível.
- Formato: PNG com transparência, 256 × 384 px cada. De 3 a 5 variações (poses e túnicas diferentes); o programa distribui e anima (pula no aplauso, nega na vaia, oscila no murmúrio).
- Estilo: silhueta preta (#1e130e) com incisões em terracota (#d98a52); nada de degradê.
- Substitui: as duas poses desenhadas por código da rodada 4 (a função coristaTex saiu de mesa3d.js na rodada 5).

### 1.4 Fundo: morro com templo (Acrópole) — adiado

- Com a câmera das rodadas 4 e 5 o horizonte saiu de cena; o morro e o céu não aparecem (a função criarFundo saiu do código na rodada 5). Fica registrado para uma eventual tela de abertura ou para uma vista mais aberta.

- O que é: o morro com o templo no alto, pequeno e apagado pela distância.
- Onde aparece: fundo, à esquerda, na linha do horizonte. Ocupa cerca de 330 × 130 px na tela.
- Formato: PNG com transparência, 2048 × 800 px. O morro deve se desfazer em névoa na base (transparência gradual).
- Estilo: tons de lilás e rosa do poente, pouca saturação, luz da direita no templo.
- Substitui: o desenho feito em criarFundo (mesa3d.js), 1024 × 400 px.

### 1.5 Peças das cenas de falácia

- O que são: os objetos das nove cenas (roteiros em rodada-visual-2.md). Hoje só o Espantalho existe, montado com formas simples em 3D.
- Lista: espantalho; busto solene com louros e placa "Magister dixit" (Autoridade); dedo de cerâmica (Ad Hominem); pano e três copos (Sofisma); cisne negro de cerâmica (Falseabilidade). As outras cenas usam só livros, prateleiras e a própria placa.
- Formato: PNG com transparência, 512 × 512 px cada, vista de frente, ou modelo 3D simples (seção 4). Luz da direita.
- Substitui: a função espantalho de mesa3d.js; as demais ainda não existem.

### 1.6 Coroa de louros e selos

- Coroa de louros da vitória: PNG com transparência, 512 × 400 px, dourada. Substitui lourosSVG (coreo.js).
- Selos "Falácia!", "Práxis!" e "Refutado": hoje são texto com moldura em CSS. Se quiser carimbo desenhado: PNG com transparência, 600 × 240 px cada, vinho (#9c2b35).

### 1.6a Emblemas dos jogadores (rodada 5)

- O que é: a inicial do jogador no centro de uma coroa de louros, com uma fita na cor dele, e um pergaminho com o nome completo. Hoje é desenhado em SVG (ui.js, LOUROS e emblema) e aparece no alto, para cada adversário, e na faixa inferior, para o jogador.
- Se o Flavio quiser desenhar: a coroa de louros sem a letra (o programa escreve a inicial e o nome), PNG com transparência, 400 × 400 px, vazada no centro; e o pergaminho vazio, PNG 600 × 140 px, com as pontas enroladas.

### 1.7 Verso e moldura das cartas

- Verso das cartas dos oponentes (hoje um retângulo listrado de 13 × 18 px no placar): PNG 256 × 352 px.
- Moldura da carta de filósofo por escola (4 escolas) e da carta de Práxis: PNG com transparência, 512 × 704 px, com a janela do retrato vazada. Hoje a moldura é uma borda na cor da escola.

### 1.8 Carta grande (carta ampliada)

- O que é: a carta inteira vista de perto (botão direito numa carta, ou "Ver carta"). Hoje é montada em HTML: retrato na metade esquerda, custo no canto, nome no alto, as quatro áreas em pílulas coloridas à direita, os três Poderes em caixas brancas, citação, datas, local e obra no pé, nome da escola no canto.
- Tamanho na tela: até 680 × 560 px. Produzir em dobro para telas de alta densidade: 1360 × 1120 px (paisagem, cerca de 6:5).
- O que o Flavio desenha: um fundo-moldura por escola (Grécia Clássica, Materialistas e Empiristas, Germânicos, Livres-Pensadores; depois Teístas e Racionalistas) e um para as cartas de Práxis. PNG com transparência na janela do retrato (metade esquerda, 680 × 1120 px na arte em dobro) e áreas lisas onde entram os textos (o programa escreve nome, valores, Poderes e citação; nada de texto na arte).
- Zonas a deixar livres (arte em dobro): custo, quadrado de 88 px no canto superior esquerdo; nome, faixa de 132 px no alto, à direita do custo; pílulas das áreas, coluna de 600 px à direita, do topo até 420 px; corpo dos Poderes, de 410 px abaixo do topo até 116 px acima da base, começando a 34% da largura; pé (datas, local, obra), canto inferior esquerdo, 31% da largura.
- Estilo: o mesmo material da mesa (mármore, bronze, pergaminho), com a cor da escola em filete ou faixa; luz da direita.
- Substitui: o fundo em degradê da classe .big (index.html) e o fundo bege da .bigP (Práxis).

## 2. O que pode vir de bancos gratuitos (Poly Haven, ambientCG; licença CC0)

Para cada material, baixar em 2K (2048 × 2048 px) os mapas de cor, normal (OpenGL) e rugosidade; todos repetem sem emenda.

- marmore: mármore branco de veios cinzentos, pouco contraste. Onde: hoje é o material principal da arena e, desde a rodada 6, dos púlpitos, módulos, Bibliotecas e prateleiras (tingido de cinza nas laterais): lajes do piso, bancos e espelhos dos degraus (tingidos um pouco mais escuros), terraço, soleira da faixa dos adversários, bases das pilastras e pódios das placas (parapeito, painel de fundo e cornijas saíram na rodada 6). Escala: 3,2 unidades por repetição. Substitui o gerador "marmore" (512 px). Buscar por "white marble", "marble 01".
- calcario: calcário poroso bege (poros), fosco. Onde: hoje quase não aparece (a arena da rodada 5 é toda de mármore). Escala: 3. Substitui "calcario". Buscar por "limestone", "sandstone plain".
- silhar: não é mais usado (o Flavio pediu para tirar os tijolinhos na rodada 5).
- madeira: desde a rodada 6 só nos adereços das cenas (rolos dos papiros, espantalho); prateleiras, púlpitos e Bibliotecas passaram a mármore e cinza. Escala: 2,2. Substitui "madeira". Buscar por "dark wood", "walnut".
- bronze: bronze envelhecido com um pouco de pátina; precisa também do mapa de metal. Onde: hoje, só detalhes (pouco uso depois da rodada 4). Escala: 1,2. Substitui "bronze". Buscar por "bronze", "brass worn".
- ouro: dourado liso, pouco riscado, com mapa de metal. Onde: hoje, só detalhes. 1K (1024 px) basta. Substitui "ouro".
- couro: couro claro e neutro (o programa tinge na cor de cada jogador), grão fino. Onde: capa dos livros. 1K basta. Substitui "couro". Buscar por "leather white", "leather plain".
- paginas: corte de páginas de livro fechado. Onde: três lados de cada livro. 512 px basta. Substitui "paginas". Difícil de achar pronto; pode ficar o gerado.
- pergaminho: pergaminho ou papel antigo. Onde: papiros lançados e páginas da chuva da vitória. 1K. Substitui "pergaminho". Buscar por "parchment", "old paper".
- terracota: não é mais usada (rodada 6: púlpitos em mármore claro e cinza, sem vermelho estrutural).
- terra: não aparece mais (a arena de mármore cobre o chão).
- estopa e palha: tecido de estopa e feixe de palha, para o espantalho. 1K cada. Substituem "estopa" e "palha".
- Céu para reflexos: um HDRI de poente (Poly Haven, 1K, arquivo .hdr), sol baixo à direita. Dá brilho mais rico ao bronze e ao mármore polido. Substitui o ambiente gerado em criarAmbiente (mesa3d.js). Buscar por "sunset", "golden hour".

## 3. O que pode ser gerado (Firefly) e depois retocado

- (Adiado: o céu e a serra não aparecem nas composições das rodadas 4 e 5.) Céu do poente. Onde: todo o fundo, atrás de tudo. Formato: JPG, 4096 × 2048 px, sem transparência; horizonte a 76% da altura a partir do topo, sol fora do quadro à direita (só o clarão), nuvens finas. Substitui o degradê de criarFundo.
- Serra distante. Onde: faixa no horizonte, de ponta a ponta. Formato: PNG com transparência, 4096 × 512 px, silhueta lilás que se desfaz em névoa embaixo. Substitui a serra de criarFundo.
- Piso da arena (opcional). Hoje o piso é composto por código: lajes de mármore de 1,32 unidade, juntas, canaleta escura em meia elipse ao pé da arquibancada e faixa de borda (escondida sob a faixa inferior). Para trocar por uma peça única: cor, normal e rugosidade em 4096 × 3550 px (o piso tem 30 × 26 unidades), sem repetir, vista de cima, sem luz pintada. A canaleta e a borda podem ser desenhadas pelo Flavio em vetor e aplicados sobre o mármore de banco: nesse caso basta um PNG com transparência, 4096 × 3200 px, só com as incrustações. Substitui criarPiso (mesa3d.js).
- (Sem uso desde a rodada 5.) Faixa de caneluras da frente da plataforma. Formato: cor, normal e rugosidade, 1024 × 1024 px, repetindo só na horizontal, quatro caneluras por repetição, cobrindo 1,3 × 0,9 unidade. O mapa normal é o que dá o relevo; pode ser gerado a partir de um desenho em tons de cinza. Substitui "caneluras".
- Retratos dos filósofos (item 1.2), se o Flavio preferir gerar a partir de um estilo de referência. Vale a restrição do projeto: nada de imagem de banco ou de obra protegida na versão publicada.

## 4. Modelos 3D (opcionais; hoje são formas geométricas montadas por código)

Se o Flavio quiser trocar a geometria, o formato é glTF binário (.glb), com os materiais embutidos em 1K ou 2K, origem no centro da base, eixo Y para cima, medidas em unidades de cena.

- Biblioteca dos adversários (2 na cena; a do jogador agora é HTML, na faixa inferior): móvel baixo de 1,7 de largura, 0,36 de altura e 0,5 de fundo, com um degrau atrás para a segunda fileira. Os livros são do programa e precisam ficar à vista: nada de portas, vãos fundos ou topo alto.
- Placa de debate: 3,95 de largura, 3,5 de altura (mais 0,5 por jogador além de três), 0,2 de espessura, com pilastras laterais finas e filete no alto, na cor da área (sem cornija desde a rodada 6). A face recebe cabeçalho, pergunta e fundo das prateleiras por programa; o modelo valeria pela moldura.
- Púlpito do jogador: 2,3 × 1,22 × 0,62, com tampo e beiral da prateleira; púlpito compacto do adversário: 1,34 × 0,64 × 0,46. Mármore claro no tampo, cinza nas laterais. Nome e valores são pintados por programa na face da frente; a carta (ou o personagem do item 1.1) fica atrás, escondida em parte pelo púlpito.
- Arquibancada: hoje montada por código (meia elipse, quatro degraus de 0,8 × 0,3, sem parapeito); um modelo só valeria para dar relevo às quinas e às escadinhas.

## 5. O que continua sendo feito pelo programa (não precisa de asset)

- Texto das placas (área, medalhão do valor, pergunta, letras dos jogadores, marcas N e 2N; versão cinza do debate a abrir) e dos púlpitos (nome e os quatro valores, 2 × 2 no do jogador, em fila no do adversário).
- Livros em pé (prateleiras das placas, dos púlpitos e das Bibliotecas; os de Minha Biblioteca em HTML), friso dourado da prateleira que lidera, emblemas e placares, ampulheta do botão, halos de alvo, contornos, sombras.
- Balões, faixas, telas centrais, diário, botões.

## 6. Ordem sugerida

1. Estudo estático do Nietzsche (item 1.1), em camadas nomeadas, com a guia do púlpito.
2. Teste de escala na cena: o PNG em `personagens/nietzsche.png`, visto atrás do seu púlpito, no púlpito compacto dos adversários e no salto até o debate (`#nietzsche`, `#doze`).
3. Aprovação do estilo; depois, os estudos estáticos do Diógenes e do Aristóteles.
4. Nietzsche articulado e o teste das duas tecnologias (Rive num canvas compartilhado × marionete no Three.js), com doze cópias e as medições do `#medir`.
5. Escolha da tecnologia de animação; só então os demais filósofos, em lotes.
6. Em paralelo, quando houver tempo: texturas de banco (seção 2), retratos das cartas (1.2), molduras (1.7) e fundos da carta grande (1.8), peças das falácias (1.5) conforme as cenas forem programadas; o coro (1.3) só quando houver público nas arquibancadas.
