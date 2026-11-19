# Balanceamento do nível 2: diagnóstico e propostas (19/11/2026)

Estudo pedido pelo Flavio em 19/11/2026: o que funciona e o que não funciona nas cartas, se as cartas altas precisam de bônus, se o Bibliotecário é útil, se a mão inicial deve encolher e se as Práxis desequilibram o jogo. **Nada foi alterado no jogo.** As variantes rodaram numa cópia do motor feita só para a simulação, e cada proposta abaixo espera a decisão do Flavio.

## Como foi medido

- O motor de regras do branch `mesa-3d` roda no Node. A cópia com as variantes e as medições está em `sim/` (`engine-var.js`). Sem variante, ela reproduz o motor original partida a partida (conferido em 300 sementes).
- As partidas são só de IA, com os três jogadores no nível "mestre". Cada variante teve entre 2.000 e 4.000 partidas; somando a força das cartas, foram mais de 300 mil partidas.
- **Força de uma carta:** a carta é posta na mão inicial de um jogador, no lugar de uma carta sorteada, e a chance de vitória desse jogador é comparada com a das mesmas partidas sem a troca. Foram 500 partidas por assento, 1.500 por carta. A referência é 33% (um em três). Diferenças menores que 2,5 pontos percentuais (p.p.) estão dentro da margem de erro.
- **Peso de um recurso** (Práxis, Bibliotecário): um dos jogadores é proibido de usá-lo, os outros não. A queda na chance de vitória dele mede quanto o recurso vale.
- **Limite importante:** tudo mede o jogo nas mãos da IA. Ela é gulosa: olha um passo à frente, vira Bibliotecário a carta mais cara que puder nas primeiras rodadas e usa Práxis sempre que melhoram a posição imediata. O Flavio vence todas as partidas, então os números mostram tendências e cartas fora da curva, e não o valor exato de cada carta nas mãos de um bom jogador. As propostas precisam de teste em partidas humanas.

## Retrato do jogo hoje

- Duração média de 11,1 rodadas e 6,1 debates vencidos por partida. O vencedor faz em média 30 pontos.
- Vitórias por assento: 39% para o primeiro jogador, 31% para o segundo e 28% para o terceiro (1,5% de empates).
- Quem lidera no fim da rodada 6 vence 53% das vezes. O jogo continua aberto na segunda metade, o que é bom.
- São usadas cerca de 23 Práxis por partida. Como a pilha de descarte é reembaralhada, cada uma das 9 cartas volta duas ou três vezes.
- A IA nomeia 1,6 Bibliotecário por partida, que produzem 52 ideias por partida. Para comparar: a Biblioteca recebe ao todo 99 ideias básicas por partida (3 por turno). O Bibliotecário aumenta em mais da metade o dinheiro em circulação.

## 1. Práxis (falácias e técnicas)

**Diagnóstico: o Flavio tem razão, elas pesam demais.** Um jogador que nunca usa Práxis perde 13 p.p. de chance de vitória (de 33% para cerca de 20%). Nenhuma carta de filósofo pesa tanto.

O motivo está na conversão. Uma ideia da Biblioteca dada a um filósofo vira, no máximo, uma ideia no debate, e só no turno em que ele vai. As Práxis rendem mais por ideia gasta, contando o que você ganha e o que o adversário perde:
- **Ad Hominem:** cerca de 4 ideias de efeito por ideia gasta. É a mais desproporcional.
- **Sofisma e Falseabilidade:** 2,5 por ideia.
- **Reductio:** 2,2.
- **Retorsio:** 2.
- **Petitio:** 1,7.
- **Espantalho:** 1,6.
- **Argumento de Autoridade:** 1,25.
- **Mutatio:** só desloca ideias; vale pela posição.

Como as cartas voltam com o descarte, o jogador com ideias sobrando usa uma ou duas por turno.

**O que foi testado, mudando só as Práxis** (peso medido como a queda de quem não as usa):
- uma Práxis por turno: 13,0 p.p. Quase não muda.
- todas custando +1: 10,6 p.p.
- as duas coisas juntas: 10,9 p.p.
- preços revistos carta a carta: 13,2 p.p. Não muda nada; a Autoridade e o Espantalho ficaram 1 mais baratos, o Ad Hominem 1 mais caro e limitado a 4, e o Sofisma passou a tirar 2.
- **Práxis saem do jogo depois de usadas** (não voltam com o descarte): 4,2 p.p. É a mudança mais forte. As Práxis caem de 23 para 8 por partida, sobram mais debates decididos pelos filósofos (6,6 por partida) e a vantagem do primeiro jogador cai para 37%.
- **Sem o Bibliotecário**, sem mexer nas Práxis: 4,5 p.p. **Este é o achado principal.** O que torna as Práxis dominantes é o dinheiro extra que o Bibliotecário põe na Biblioteca. Sem ele, as Práxis continuam úteis, mas deixam de decidir o jogo sozinhas.

**Sugestões:**
1. Resolver primeiro pelo Bibliotecário (seção 2) e manter as Práxis como estão. No pacote completo da seção 5, elas valem cerca de 3 p.p.: continuam importantes, como o Flavio quer, sem dominar.
2. Se, nas partidas humanas, elas ainda parecerem fortes, a regra seguinte é "a Práxis usada sai do jogo". É simples, fácil de explicar ("um truque não funciona duas vezes") e transforma cada falácia num momento escolhido. O risco é exagerar: com o pacote completo, elas quase deixam de valer para a IA.
3. Mesmo sem mudança geral, vale baixar o Ad Hominem para "até 4 ideias", por coerência de preço com as outras. Isso não muda o equilíbrio medido.

## 2. Bibliotecário

**Diagnóstico: é forte, mas pouco intuitivo.** Nas mãos da IA, quem não o usa enquanto os outros usam perde 10,6 p.p. de chance de vitória. Um Bibliotecário de custo 4 ou 5 rende 4 ou 5 ideias por turno para a Biblioteca, mais do que o mesmo filósofo renderia refletindo (2 ou 3), e essas ideias podem ir para qualquer lugar. O Flavio quase não o usa e vence assim mesmo. Isso não contradiz os números: diz que a IA não sabe punir quem dispensa o Bibliotecário, e que o recurso não é necessário para jogar bem.

**Sem o Bibliotecário para ninguém:**
- a duração continua a mesma (11,2 rodadas);
- a vantagem do primeiro jogador cai de 39% para 38%;
- as Práxis caem de 23 para 21 por partida e pesam um terço do que pesavam.

**Sugestão:** tirar o Bibliotecário do nível 2. O jogo fica mais simples (uma regra a menos, uma exceção a menos em vários poderes) e mais equilibrado. Ele pode voltar no nível 3, mais fraco: por exemplo, rendendo 2 ideias fixas por turno, ou como carta de Legado.

**Atenção:** a IA perde o seu recurso mais forte, e ela já perde todas para o Flavio. Fortalecer a IA passa a ser mais urgente (pendência já registrada).

## 3. Mão inicial: o filósofo de custo 1 e mais 3 cartas

A regra atual já garante o filósofo de custo 1. A proposta é dar 3 cartas além dele, em vez de 4.
- **Só essa mudança:** 11,0 rodadas; vitórias por assento de 38%, 31% e 30% (hoje 39%, 31% e 28%). O equilíbrio melhora um pouco e o ritmo não muda.
- **Junto com a saída do Bibliotecário:** 36,5%, 32,4% e 29,7%, a menor vantagem do primeiro jogador entre todas as variantes testadas.
- **Efeito na mão:** começar com menos cartas reduz a escolha nas primeiras rodadas, mas o filósofo de custo 1 continua garantido. Com 3 ideias na rodada 1 e 5 na rodada 2, a carta de custo 5 continua cabendo na segunda rodada, como o Flavio costuma jogar.

**Sugestão:** adotar.

## 4. As cartas

### Força medida hoje (regras atuais, com o Bibliotecário)

Diferença em relação a uma carta média, em pontos percentuais de chance de vitória:
- **Fortes:** Nietzsche +8,3; Platão +5,5; Schopenhauer +3,4; Kant +3,3; Sócrates +2,6.
- **Na média:** Marx +1,1; Aristóteles +0,7; Hobbes 0; Hegel −0,3; Arendt −0,9; Freud −0,9; Heidegger −1,0; Pitágoras −2,0.
- **Fracas:** Erasmo −2,7; Rousseau −2,8; Diógenes −3,3; Epicuro −4,1; Maquiavel −4,1; Locke −5,0; **Bacon −11,4**.

Sem o Bibliotecário, as cartas altas perdem o uso que a IA dava a elas (virar Bibliotecário). Ficam um pouco abaixo da média Aristóteles (−1,3), Marx (−1,5) e Hegel (−2,4). Kant fica na média (+0,5). Sócrates sobe para +8,0, Nietzsche fica em +3,7 e Platão em +2,9. O Bacon continua o mais fraco (−8,4).

### Cartas altas

O Flavio tem razão: no geral elas não estão defasadas. Uma carta de custo 5 se paga em dois turnos (rende 3 por turno, contra 1 da carta de custo 1) e leva 4 ou 5 ideias por ida a debate. A pendência antiga "cartas de custo 4 e 5 fracas" não se confirma. Abaixo da média ficam só Aristóteles, Marx e Hegel, e por pouco.

**Sugestão 1: as cartas de custo 5 rendem também +1 ideia para a Biblioteca a cada turno.** São Aristóteles, Marx e Kant. A ideia é do Flavio e funciona como regra geral, sem texto novo nas cartas ("a obra de uma vida inteira"). Efeito medido, sem o Bibliotecário:
- Aristóteles: de 31,4% para 35,1%;
- Kant: de 33,2% para 37,0%;
- Marx: de 31,2% para 33,3%.

**Sugestão 2: Hegel, Dialética, ganha a Síntese.** Ao entrar num debate em que um adversário tem mais ideias que você, +1 ideia sua. Ele deixa de ser só "pode ir com menos": a tese encontra a antítese e gera a síntese. Sem o Bibliotecário e sem ajuste, ele fica em −2,4; no pacote da seção 5, com a Síntese, fica em +2,1. A versão com +2 ficou forte demais (+12 numa versão anterior do pacote).

**Marx e Hegel:** já formam uma dupla clássica (+1 para cada um quando estão juntos). Se o Flavio quiser um vínculo mais forte, a opção natural é a Mais-Valia: "a ideia tirada vai para a sua Biblioteca". Medida, rende +2 p.p. Num jogo em que as duas cartas de custo 4 e 5 raramente estão juntas, não vale como prioridade.

### Cartas fracas e propostas

- **Bacon, "Conhecimento é poder":** é o caso mais claro. Espiar cartas não faz nada para a IA, e para o jogador humano é só informação. **Proposta:** se houver debate de Lógica / Ciência na Ágora, +1 ideia na Biblioteca. Medido: de 24,3% para 31,9%, perto da média, e o poder ensina algo de Bacon (a ciência). Duas alternativas testadas: +1 na Biblioteca sempre ficou forte demais (40,5%); comprar uma carta extra por turno ficou em 30,5%.
- **Locke, Tábula Rasa:** +1 também quando um adversário baixa uma carta ("a experiência vem de fora"). Medido: de 31,7% para 35,9%.
- **Diógenes, Barrica:** além da imunidade, +1 ideia na Reflexão se tiver 2 ideias ou menos ("vive com o mínimo"). Medido: de 32,3% para 35,9%.
- **Epicuro, Laço de Amizade:** amizade recíproca, em que o vizinho recebe +1 e Epicuro também. No pacote da seção 5 ficou acima da média (35,9%, contra 32,8% de referência). Numa versão anterior do pacote, sem o ajuste, tinha ficado em 25,9%. Dar +1 aos dois vizinhos não mudou nada.
- **Hobbes:** o poder atual depende de haver debate de Lógica na mesa e rende pouco (0,55 ideia tirada por turno). **Proposta:** o adversário com mais ideias em qualquer debate perde 1 ("a guerra de todos contra todos"). No pacote, foi de −5,5 para −2,2.
- **Maquiavel:** dar +2 em vez de +1 ao filósofo com mais ideias ajuda pouco, porque esse filósofo bate no teto de 10. Ficou na média no pacote (33,3%). Prioridade baixa.
- **Erasmo:** fazer a ideia tirada passar para você, no mesmo debate de Metafísica, quase não muda nada (+1 p.p.). Prioridade baixa. Continua pendente a divergência entre o texto da carta e o motor.
- **Rousseau:** se o Contrato Social valesse só para os seus filósofos de custo 1, ele subiria muito (de 34% para 40%), mas o poder perderia o sentido de "vontade geral". **Proposta:** manter como está.
- **Pitágoras:** não precisa de ajuste. Valer em debates de valor ímpar (5, 7, 9 e 15) o deixaria forte (38%).

### Cartas fortes a acompanhar

- **Nietzsche** é a carta mais forte em todas as configurações, entre +3,5 e +8 p.p. Proposta: não mexer agora. Se, nas partidas humanas, ele parecer obrigatório, a primeira opção é o martelo tirar 1 em vez de 2.
- **Sócrates** sobe muito sem o Bibliotecário (+8) e cai para +1,5 no pacote. Acompanhar.
- **Kant e Freud** ficaram acima da média no pacote (+4,8 e +4,1), dentro do aceitável.

## 5. O pacote testado

O pacote junta todas as propostas acima e mantém as Práxis como estão:
- sem Bibliotecário;
- mão inicial com o filósofo de custo 1 e mais 3 cartas;
- cartas de custo 5 com +1 ideia na Biblioteca;
- Hegel com a Síntese (+1);
- Bacon com o novo poder;
- Locke com o gatilho também nas cartas dos adversários;
- Diógenes com o mínimo;
- Epicuro com a amizade recíproca.

**Resultado** (2.000 partidas, comparado com o jogo atual):
- **Vitórias por assento:** 37%, 33% e 29% (hoje 39%, 31% e 28%).
- **Duração:** 10,9 rodadas (11,1 hoje); 6,3 debates vencidos (6,1 hoje).
- **Práxis:** 18,5 usos por partida (23 hoje); quem não as usa perde cerca de 3 p.p. (13 hoje).
- **Força das cartas:** variam entre −5,5 e +4,8 (hoje entre −11,4 e +8,3). Com o Hobbes ajustado, ficam entre −3,2 e +4,8.

**Leitura:** o jogo fica mais equilibrado e mais simples. As Práxis continuam valendo, mas deixam de ser o centro da estratégia, e nenhuma carta fica fora da curva.

## 6. Decisões para o Flavio

1. Tirar o Bibliotecário do nível 2? (Recomendado.)
2. Mão inicial com o filósofo de custo 1 e mais 3 cartas? (Recomendado.)
3. Cartas de custo 5 rendem +1 ideia na Biblioteca por turno? (Recomendado.)
4. Novos poderes: Hegel (Síntese +1), Bacon (+1 na Biblioteca com debate de Lógica), Locke (também nas cartas dos adversários), Diógenes (o mínimo), Epicuro (amizade recíproca), Hobbes (qualquer debate). Aprovar todos, alguns ou nenhum?
5. Práxis: manter como estão e observar? Ou já adotar "a Práxis usada sai do jogo"? Ad Hominem até 4?
6. Nietzsche: manter forte e observar?

Depois das decisões: aplicar no `mesa-3d`, rodar os testes do motor e uma partida inteira no navegador, atualizar os dois manuais e a planilha "Cartas v5" (do lado do Flavio), e publicar no artifact de desenvolvimento. Em paralelo, fortalecer a IA.

## Arquivos

- `sim/` no branch `mesa-3d`:
  - `engine-var.js`: o motor com as variantes, controladas pelo campo `v` de newGame;
  - `roda.js` e `par.js`: rodam as partidas em dois processos;
  - `exp.js`: os experimentos gerais;
  - `injeta.js`: a força de cada carta.
- Resultados brutos em `sim/resultados/`.

## 7. Cartas temporárias (19/11/2026, noite; commit aad520d do `mesa-3d`)

Primeira leva programada: as quatro famílias, as 7 cartas novas, as falácias saindo do jogo e tirando pontos. Medido com `sim/temporarias.js`, direto no `engine.js` (o `engine-var.js` é anterior a esta mudança).

**Retrato do jogo** (600 partidas só de IA, comparadas com o motor de antes, nas mesmas sementes):
- **Vitórias por assento:** 37%, 30% e 32% (antes, 34%, 31% e 35%).
- **Duração:** 11,5 rodadas (antes, 11,2). Pontos médios por jogador no fim: 14,7 (antes, 18,2). Mais partidas chegam à 12ª rodada sem ninguém alcançar 30.
- **Cartas temporárias usadas:** cerca de 17,5 por partida (antes, 22,5 Práxis). Cada falácia sai na primeira vez em que é usada, então aparece no máximo uma vez por partida; os argumentos são agora as cartas mais usadas (Retorsio 2,4; Tautologia 2,4; Reductio 1,9; Paradoxo 1,8; Cicuta 1,7).
- **Caveiras:** 2,2 pontos perdidos em falácias por jogador e partida. Placar final negativo: 10% dos jogadores.

**Força de cada carta** (a carta posta na mão inicial de um assento, no lugar de uma carta sorteada; diferença de vitórias em p.p.). Uma carta que não faz nada fica por volta de −3, porque toma o lugar de uma carta útil; a margem de erro é de cerca de 2 p.p.
- Paradoxo Lógico +2,8 (1.000 partidas por assento) e +4,0 (400): a carta mais forte do conjunto.
- Reductio +0,1 e +1,8; Autoridade −0,3; Falseabilidade −0,6; Ceticismo −0,4; Niilismo −0,6; Cicuta −0,7; Retorsio −1,0; Sofisma −1,3.
- Espantalho −2,2; Ad Hominem −2,6; Tautologia −3,5; Mutatio −4,1; Dogma −4,5.
- Petitio −2,8 e Non Sequitur −4,7: a IA **nunca** as usa, porque a penalidade supera o ganho. A Petitio era usada 1,65 vez por partida antes da penalidade: pagar 3 e receber 5 ideias num filósofo é só +2 líquido, e −1 ponto torna a troca ruim.
- Sem penalidade nenhuma (só saindo do jogo), as falácias ficam entre +1,4 (Sofisma) e −2,8; a Petitio e a Non Sequitur passam a ser usadas (75% e 100% das partidas). A penalidade pesa menos que a saída do jogo.

**Leitura:**
- As falácias deixaram de ser o centro do jogo: usadas uma vez e cobrando pontos, viraram cartas de ocasião, com força perto de uma carta comum.
- O Paradoxo, sem trava, é a carta mais forte, como previsto. Acompanhar com jogadores reais.
- Dogma e Tautologia rendem pouco. O Dogma custa 4 para tirar a Reflexão de dois filósofos de um só adversário, e o terceiro jogador lucra junto. A Tautologia é neutra por desenho (paga 2, recebe 2).
- Petitio e Non Sequitur, com −1, ficam sem uso pela IA. Opções: penalidade 0 para as falácias mais fracas, ou reforçar o efeito (Petitio com 6 ideias, Non Sequitur com 3 cartas).
- A IA decide as cartas novas pela mesma avaliação de estado, com pesos acrescentados para filósofos eliminados, Dogma, Niilismo, cartas na mão do adversário e debates trancados. Os números dependem desses pesos.
