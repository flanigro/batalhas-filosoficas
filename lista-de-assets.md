# Lista de assets: o que substitui os provisórios da mesa 3D (17/11/2026; revista na rodada 4)

Acompanha a rodada visual 3 (mesa em Three.js). Hoje tudo o que se vê na mesa é provisório: texturas geradas por código, figuras desenhadas por código, retratos de banco. Este documento lista cada peça, com as medidas para produzir a definitiva.

## Convenções

- Luz: uma só, sol poente, vindo da direita de quem olha, baixo (cerca de 30° acima do horizonte) e um pouco pela frente. Tom quente. Nas texturas de material (mármore, madeira, bronze) NÃO pintar luz nem sombra: a cena ilumina. Em tudo o que é desenho plano (bonecos, coro, fundo, retratos) a luz pintada deve vir da direita, e a sombra projetada no chão fica por conta do programa.
- Unidade de cena: a placa de debate tem 3,95 unidades de largura e 3,5 de altura (com três jogadores); o pedestal, 2,1 de largura e 1,2 de altura. "Escala" abaixo diz quantas unidades de cena uma repetição da textura cobre.
- Mapas de um material: cor (albedo, sem luz pintada), normal (padrão OpenGL, verde para cima) e rugosidade (branco = fosco). Metais levam também o mapa de metal. Nos bancos gratuitos esses mapas já vêm prontos, com esses nomes.
- Formatos: cor e rugosidade em JPG (qualidade 85 a 90); normal em PNG; tudo o que tem recorte (transparência) em PNG ou WebP. Lados em potência de 2 (1024, 2048, 4096) sempre que a textura repete.
- Onde trocar: cada material tem uma linha na tabela ARQUIVOS de materiais.js (o nome do material e os três arquivos). Desenhos planos (coro, fundo, folhagem) trocam em mesa3d.js, nas funções indicadas em cada item. Sugestão de pastas: tex/ (materiais), fundo/, coro/, bonecos/, img/ (retratos).

## 1. O que o Flavio desenha

### 1.1 Bonecos dos filósofos (Rive)

- O que é: a figura de cada filósofo, de corpo inteiro, animada. Hoje só o Diógenes tem boneco (SVG de recorte, provisório, em bonecos.js); os outros 19 aparecem como carta de retrato em pé sobre o pedestal.
- Onde aparece: sobre o pedestal do jogador (frente da mesa) e andando pela plataforma na entrada em debate. Na tela, a figura tem de 110 a 170 px de altura no pedestal e diminui ao se afastar.
- Quantos: 20 nesta fase (as três escolas e os dois livres-pensadores); 38 no jogo completo.
- Formato: um arquivo .riv por filósofo (ou um só com 20 pranchetas). Prancheta de 520 × 600 px, fundo transparente, pés apoiados na borda de baixo, figura centrada. O pedestal NÃO entra no desenho: é da cena.
- Encaixe no programa: cada boneco ocupa um elemento .fig (um canvas do Rive por boneco), que a cena posiciona sobre o pedestal. Está preparado; falta só carregar o runtime do Rive.
- Partes (as mesmas do recorte atual): perna esquerda, perna direita, corpo (tronco), braço que lança, braço do adereço, o que pende do adereço (lanterna, balança, relógio), cabeça, pálpebras, e o animal ou objeto que fica no pedestal (com rabo ou parte móvel, se houver). Sobra nas articulações, para o giro não abrir buracos.
- Pontos de giro: quadril de cada perna, ombro de cada braço, base do pescoço, argola do que pende, raiz do rabo.
- Máquina de estados (nome sugerido: "boneco"), com uma entrada numérica "estado":
  - 0, em espera (laço de 3 a 5 s): respira, pisca, inclina a cabeça, o adereço balança.
  - 1, andando (laço de 0,7 s, dois passos): pernas alternam, corpo sobe e desce de leve.
  - 2, lançando (0,45 s por lançamento, pode repetir): o braço sobe e solta o papiro.
  - Gatilhos de reação, curtos (até 1 s): "aplauso" (comemora quando toma a frente), "espanto" (ergue a sobrancelha; usado no Ad Hominem), "desdem" (vira o rosto; Diógenes vira de costas).
- O companheiro que fica no pedestal (o cachorro do Diógenes) deve ser uma prancheta à parte ou uma camada que o programa possa manter no pedestal enquanto a figura anda.
- Vista: de frente ou três quartos. A figura anda para o fundo da cena e volta; uma vista só basta para começar. Uma segunda vista, de costas em três quartos, deixaria a ida mais convincente (decidir depois).
- Estilo: o traço do esboço do Flavio; contorno escuro, cores chapadas com uma sombra simples do lado esquerdo (a luz vem da direita). Sem sombra no chão.
- Substitui: BF_BONECOS.diogenes (bonecos.js) e, para os outros 19, a carta em pé sobre o pedestal.

### 1.2 Retratos para as cartas (mão, carta ampliada, telas centrais, bancos dos oponentes)

- O que é: um retrato por filósofo, usado em cinco lugares: carta pequena da mão (118 × 163 px), carta ampliada (foto de cerca de 680 × 560 px visíveis), retrato das telas centrais (210 × 236 px), carta em pé na galeria dos adversários (textura de 256 × 352 px) e busto sobre o pedestal do jogador (textura de 256 × 320 px, num nicho de topo em arco).
- Busto do pedestal: hoje é o retrato recortado num arco. O ideal, enquanto não houver boneco, é um busto recortado (cabeça e parte do tronco, fundo transparente), PNG de 512 × 640 px, ombros cortados na base; a prateleira de livros cobre a parte de baixo do peito.
- Formato: um arquivo-mestre por filósofo, JPG, 1200 × 1500 px (4:5), rosto no terço de cima, com folga dos lados para recorte. Sem transparência.
- Estilo: o mesmo para os 20 (hoje há foto, pintura a óleo e escultura misturadas). Luz da direita. Fundo neutro, sem texto.
- Substitui: img/<id>.jpg (20 arquivos, de 9 a 32 KB, provisórios de banco e de obras que podem ter proteção).
- Pode ser gerado (Firefly) a partir de um modelo de estilo definido pelo Flavio; ver seção 3.

### 1.3 Coro grego

- O que é: as figuras da arquibancada, em estilo de cerâmica de figuras negras, braços erguidos.
- Onde aparece: 19 figuras em duas fileiras, atrás do parapeito da galeria dos adversários, no alto da tela. Cada uma tem de 40 a 55 px de altura visível.
- Formato: PNG com transparência, 256 × 384 px cada. De 3 a 5 variações (poses e túnicas diferentes); o programa distribui e anima (pula no aplauso, nega na vaia, oscila no murmúrio).
- Estilo: silhueta preta (#1e130e) com incisões em terracota (#d98a52); nada de degradê.
- Substitui: a função coristaTex de mesa3d.js (duas poses desenhadas por código, 128 × 192 px).

### 1.4 Fundo: morro com templo (Acrópole) — adiado

- Com a câmera da rodada 4 o horizonte saiu de cena; o morro e o céu não aparecem. Fica registrado para uma eventual tela de abertura ou para uma vista mais aberta.

- O que é: o morro com o templo no alto, pequeno e apagado pela distância.
- Onde aparece: fundo, à esquerda, na linha do horizonte. Ocupa cerca de 330 × 130 px na tela.
- Formato: PNG com transparência, 2048 × 800 px. O morro deve se desfazer em névoa na base (transparência gradual).
- Estilo: tons de lilás e rosa do poente, pouca saturação, luz da direita no templo.
- Substitui: o desenho feito em criarFundo (mesa3d.js), 1024 × 400 px.

### 1.5 Peças das cenas de falácia

- O que são: os objetos das nove cenas (roteiros em rodada-visual-2.md). Hoje só o Espantalho existe, montado com formas simples em 3D.
- Lista: espantalho; busto solene com louros e placa "Magister dixit" (Autoridade); dedo de cerâmica (Ad Hominem); pano e três copos (Sofisma); cisne negro de cerâmica (Falseabilidade). As outras cenas usam só livros, torre e estela.
- Formato: PNG com transparência, 512 × 512 px cada, vista de frente, ou modelo 3D simples (seção 4). Luz da direita.
- Substitui: a função espantalho de mesa3d.js; as demais ainda não existem.

### 1.6 Coroa de louros e selos

- Coroa de louros da vitória: PNG com transparência, 512 × 400 px, dourada. Substitui lourosSVG (coreo.js).
- Selos "Falácia!", "Práxis!" e "Refutado": hoje são texto com moldura em CSS. Se quiser carimbo desenhado: PNG com transparência, 600 × 240 px cada, vinho (#9c2b35).

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

- marmore: mármore branco de veios cinzentos, pouco contraste. Onde: estelas, pedestais, bancos, cornija da plataforma e as lajes do piso. Escala: 3,2 unidades por repetição. Substitui o gerador "marmore" (512 px). Buscar por "white marble", "marble 01".
- calcario: calcário poroso bege (poros), fosco. Onde: degraus da plataforma, muro do fundo da arquibancada. Escala: 3. Substitui "calcario". Buscar por "limestone", "sandstone plain".
- silhar: parede de blocos de calcário com juntas, fiadas de cerca de 0,65 unidade. Onde: estrado dos oponentes e degraus da arquibancada. Escala: 2,6 (quatro fiadas por repetição). Substitui "silhar". Buscar por "stone block wall", "sandstone blocks".
- madeira: nogueira ou carvalho escuro, veio ao comprido. Onde: as três estantes; em tom claro, o verso das cartas em pé. Escala: 2,2. Substitui "madeira". Buscar por "dark wood", "walnut".
- bronze: bronze envelhecido com um pouco de pátina; precisa também do mapa de metal. Onde: postes da régua do valor, vara das estantes, apoios dos bancos. Escala: 1,2. Substitui "bronze". Buscar por "bronze", "brass worn".
- ouro: dourado liso, pouco riscado, com mapa de metal. Onde: corda do valor e remates dos postes. 1K (1024 px) basta. Substitui "ouro".
- couro: couro claro e neutro (o programa tinge na cor de cada jogador), grão fino. Onde: capa dos livros. 1K basta. Substitui "couro". Buscar por "leather white", "leather plain".
- paginas: corte de páginas de livro fechado. Onde: três lados de cada livro. 512 px basta. Substitui "paginas". Difícil de achar pronto; pode ficar o gerado.
- pergaminho: pergaminho ou papel antigo. Onde: papiros lançados e páginas da chuva da vitória. 1K. Substitui "pergaminho". Buscar por "parchment", "old paper".
- terra: chão de terra batida com pedrisco e capim seco. Onde: todo o terreno em volta. Escala: 7. Substitui "terra". Buscar por "dry ground", "rocky terrain", "sparse grass".
- casca: casca de oliveira ou de árvore velha. Onde: troncos. 1K. Substitui "casca". Buscar por "bark".
- estopa e palha: tecido de estopa e feixe de palha, para o espantalho. 1K cada. Substituem "estopa" e "palha".
- Céu para reflexos: um HDRI de poente (Poly Haven, 1K, arquivo .hdr), sol baixo à direita. Dá brilho mais rico ao bronze e ao mármore polido. Substitui o ambiente gerado em criarAmbiente (mesa3d.js). Buscar por "sunset", "golden hour".

## 3. O que pode ser gerado (Firefly) e depois retocado

- (Adiado: o céu e a serra não aparecem na composição da rodada 4.) Céu do poente. Onde: todo o fundo, atrás de tudo. Formato: JPG, 4096 × 2048 px, sem transparência; horizonte a 76% da altura a partir do topo, sol fora do quadro à direita (só o clarão), nuvens finas. Substitui o degradê de criarFundo.
- Serra distante. Onde: faixa no horizonte, de ponta a ponta. Formato: PNG com transparência, 4096 × 512 px, silhueta lilás que se desfaz em névoa embaixo. Substitui a serra de criarFundo.
- Piso da plataforma (opcional). Hoje o piso é composto por código: lajes de mármore de 1,3 unidade, juntas, faixa de borda com meandro e círculo da orquestra. Para trocar por uma peça única: cor, normal e rugosidade em 4096 × 3200 px (a plataforma tem 16,1 × 12,6 unidades), sem repetir, vista de cima, sem luz pintada. O meandro da borda e o círculo podem ser desenhados pelo Flavio em vetor e aplicados sobre o mármore de banco: nesse caso basta um PNG com transparência, 4096 × 3200 px, só com as incrustações. Substitui criarPiso (mesa3d.js).
- Faixa de caneluras da frente da plataforma. Formato: cor, normal e rugosidade, 1024 × 1024 px, repetindo só na horizontal, quatro caneluras por repetição, cobrindo 1,3 × 0,9 unidade. O mapa normal é o que dá o relevo; pode ser gerado a partir de um desenho em tons de cinza. Substitui "caneluras".
- Retratos dos filósofos (item 1.2), se o Flavio preferir gerar a partir de um estilo de referência. Vale a restrição do projeto: nada de imagem de banco ou de obra protegida na versão publicada.

## 4. Modelos 3D (opcionais; hoje são formas geométricas montadas por código)

Se o Flavio quiser trocar a geometria, o formato é glTF binário (.glb), com os materiais embutidos em 1K ou 2K, origem no centro da base, eixo Y para cima, medidas em unidades de cena.

- Biblioteca (3 na cena): móvel baixo de 1,7 (do jogador) ou 1,45 (dos adversários) de largura, 0,5 de altura e 0,72 de fundo, com um degrau atrás para a segunda fileira. Os livros são do programa e precisam ficar à vista: nada de portas, vãos fundos ou topo alto.
- Placa de debate: 3,95 de largura, 3,5 de altura (mais 0,5 por jogador além de três), 0,2 de espessura, com pilastras laterais e cornija. A face recebe cabeçalho, pergunta e fundo das prateleiras por programa; o modelo valeria pela moldura.
- Pedestal: 2,1 × 1,2 × 0,95, com tampo e beiral da prateleira; nome e valores são pintados por programa na face da frente.

## 5. O que continua sendo feito pelo programa (não precisa de asset)

- Texto das placas (área, medalhão do valor, pergunta, letras dos jogadores, marcas N e 2N) e dos pedestais (nome e os quatro valores em 2 × 2).
- Livros em pé (prateleiras das placas, prateleiras dos pedestais, Bibliotecas), friso dourado da prateleira que lidera, placas de identificação dos adversários, halos de alvo, contornos, sombras.
- Balões, faixas, telas centrais, diário, botões.

## 6. Ordem sugerida

1. Texturas de banco (seção 2): troca rápida, uma linha por material, e muda a cena inteira.
2. Céu, serra e morro (itens 3 e 1.4).
3. Bonecos no Rive, começando pelo Diógenes (item 1.1), e o coro (1.3).
4. Retratos (1.2), molduras (1.7) e fundos da carta grande (1.8).
5. Peças das falácias (1.5), conforme as cenas forem programadas.
