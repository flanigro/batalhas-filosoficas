# Lista de assets: o que substitui os provisórios da mesa 3D (17/11/2026; revista nas rodadas 5 e 6)

Acompanha a mesa em Three.js (rodadas 3 a 5). Na rodada 5 a mesa virou uma arena semicircular de mármore: faixa dos adversários no alto, placas no centro, púlpitos do jogador na frente e a faixa inferior em HTML. Hoje tudo o que se vê na mesa é provisório: texturas geradas por código, figuras desenhadas por código, retratos de banco. Este documento lista cada peça, com as medidas para produzir a definitiva.

## Convenções

- Luz: uma só, sol poente, vindo da direita de quem olha, baixo (cerca de 30° acima do horizonte) e um pouco pela frente. Tom quente. Nas texturas de material (mármore, madeira, bronze) NÃO pintar luz nem sombra: a cena ilumina. Em tudo o que é desenho plano (bonecos, coro, fundo, retratos) a luz pintada deve vir da direita, e a sombra projetada no chão fica por conta do programa.
- Unidade de cena: a placa de debate tem 3,95 unidades de largura e 3,5 de altura (com três jogadores); o púlpito do jogador, 2,3 de largura e 0,92 de altura; o púlpito compacto do adversário, 1,28 × 0,52. "Escala" abaixo diz quantas unidades de cena uma repetição da textura cobre.
- Mapas de um material: cor (albedo, sem luz pintada), normal (padrão OpenGL, verde para cima) e rugosidade (branco = fosco). Metais levam também o mapa de metal. Nos bancos gratuitos esses mapas já vêm prontos, com esses nomes.
- Formatos: cor e rugosidade em JPG (qualidade 85 a 90); normal em PNG; tudo o que tem recorte (transparência) em PNG ou WebP. Lados em potência de 2 (1024, 2048, 4096) sempre que a textura repete.
- Onde trocar: cada material tem uma linha na tabela ARQUIVOS de materiais.js (o nome do material e os três arquivos). Desenhos planos (coro, bustos) trocam em mesa3d.js, nas funções indicadas em cada item. Sugestão de pastas: tex/ (materiais), fundo/, coro/, bonecos/, img/ (retratos).

## 1. O que o Flavio desenha

### 1.1 Bonecos dos filósofos (Rive)

- O que é: a figura de cada filósofo, de corpo inteiro, animada. Hoje só o Diógenes tem boneco (SVG de recorte, provisório, em bonecos.js), desligado nesta etapa; todos os 20 aparecem como a imagem da carta atrás do púlpito.
- Onde aparece: atrás do púlpito do jogador (só cabeça, ombros e peito à vista) e, na etapa de animação, saltando do púlpito até a faixa livre diante das placas, depositando os livros e voltando. Na tela, a figura tem de 110 a 170 px de altura no pedestal e diminui ao se afastar.
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
- Substitui: BF_BONECOS.diogenes (bonecos.js) e, para os outros 19, a imagem da carta atrás do púlpito. Nesta etapa a marionete está desligada (USAR_BONECOS); os bonecos entram junto com os saltos e as animações de espera.

### 1.2 Retratos (mão, carta ampliada, telas centrais, figuras atrás dos púlpitos)

- O que é: um retrato por filósofo, usado em cinco lugares: carta pequena da mão (118 × 163 px), carta ampliada (foto de cerca de 680 × 560 px visíveis), retrato das telas centrais (210 × 236 px) e, desde a rodada 5, a figura atrás dos púlpitos, tanto do jogador quanto dos adversários (textura de 320 × 428 px, proporção 3:4, com o custo pintado no canto de cima; o púlpito esconde o terço de baixo).
- Figura atrás do púlpito: hoje é o retrato num retângulo com moldura na cor da escola. O ideal, enquanto não houver boneco, é um busto recortado até a cintura (fundo transparente), PNG de 600 × 800 px, rosto no quarto de cima; o púlpito esconde a parte de baixo, então cabeça, ombros e peito têm de caber nos 60% de cima. Substitui texFig (mesa3d.js).
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

- marmore: mármore branco de veios cinzentos, pouco contraste. Onde: hoje é o material principal da arena e, desde a rodada 6, dos púlpitos, módulos, Bibliotecas e prateleiras (tingido de cinza nas laterais): lajes do piso, bancos e espelhos dos degraus (tingidos um pouco mais escuros), parapeito, terraço, painel da faixa dos adversários, capitéis, cornijas e pódios das placas. Escala: 3,2 unidades por repetição. Substitui o gerador "marmore" (512 px). Buscar por "white marble", "marble 01".
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

- Biblioteca dos adversários (2 na cena; a do jogador agora é HTML, na faixa inferior): móvel baixo de 1,42 de largura, 0,36 de altura e 0,5 de fundo, com um degrau atrás para a segunda fileira. Os livros são do programa e precisam ficar à vista: nada de portas, vãos fundos ou topo alto.
- Placa de debate: 3,95 de largura, 3,5 de altura (mais 0,5 por jogador além de três), 0,2 de espessura, com pilastras laterais e cornija. A face recebe cabeçalho, pergunta e fundo das prateleiras por programa; o modelo valeria pela moldura.
- Púlpito do jogador: 2,3 × 0,92 × 0,62, com tampo e beiral da prateleira; púlpito compacto do adversário: 1,28 × 0,52 × 0,44. Nome e valores são pintados por programa na face da frente; a carta (ou o busto) fica atrás, escondida em parte pelo púlpito.
- Arquibancada: hoje montada por código (meia elipse, cinco degraus de 0,8 × 0,3); um modelo só valeria para dar relevo às quinas e às escadinhas.

## 5. O que continua sendo feito pelo programa (não precisa de asset)

- Texto das placas (área, medalhão do valor, pergunta, letras dos jogadores, marcas N e 2N; versão cinza do debate a abrir) e dos púlpitos (nome e os quatro valores, 2 × 2 no do jogador, em fila no do adversário).
- Livros em pé (prateleiras das placas, dos púlpitos e das Bibliotecas; os de Minha Biblioteca em HTML), friso dourado da prateleira que lidera, emblemas e placares, ampulheta do botão, halos de alvo, contornos, sombras.
- Balões, faixas, telas centrais, diário, botões.

## 6. Ordem sugerida

1. Texturas de banco (seção 2): troca rápida, uma linha por material, e muda a cena inteira.
2. Bustos recortados até a cintura para trás dos púlpitos (1.2), enquanto não houver bonecos.
3. Bonecos no Rive, começando pelo Diógenes (item 1.1); o coro (1.3) só quando houver público nas arquibancadas.
4. Retratos (1.2), molduras (1.7) e fundos da carta grande (1.8).
5. Peças das falácias (1.5), conforme as cenas forem programadas.
