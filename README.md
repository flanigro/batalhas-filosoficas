# Batalha dos Filósofos

Jogo digital de cartas em que filósofos disputam as grandes perguntas da filosofia. Protótipo web do nível 2, adaptado do protótipo impresso "Batalha dos Cabeções" v4.

Para jogar, abra o endereço do GitHub Pages (a página usa módulos ES; aberta direto do disco, sem servidor, o navegador recusa carregá-los). Precisa de WebGL. Acrescente `#diogenes` ao endereço para começar com o Diógenes já no seu grupo (ativo, com 4 ideias). A marionete dele fica desligada nesta etapa: todos os filósofos aparecem como imagem da carta atrás do púlpito.

- `engine.js`: motor de regras e dados das cartas (roda também em Node, sem navegador)
- `mesa3d.js`: a mesa em 3D (Three.js, carregado do CDN jsDelivr): arena semicircular de mármore, faixa dos adversários (púlpitos compactos e Bibliotecas), placas dos debates com prateleiras de livros, púlpitos do jogador, luz e câmera
- `materiais.js`: materiais e texturas da mesa (hoje geradas por código; cada uma troca por textura real com uma linha)
- `ui.js`: interface em HTML sobre a cena: emblemas e placares, faixa inferior (Minha Biblioteca, mão, comandos), telas de texto
- `coreo.js`: coreografia das animações
- `bonecos.js`: marionetes de recorte (desligadas por ora; ver USAR_BONECOS em ui.js e mesa3d.js)
- `falas_*.js`: falas dos filósofos sobre cada pergunta (a verificar)
- `img/`: retratos provisórios, que serão refeitos

Projeto de Flávio Nigro Rodrigues. Citações e relações históricas ainda em revisão.
