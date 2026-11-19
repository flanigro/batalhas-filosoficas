# Batalha dos Filósofos — Manual detalhado das regras (nível 2)

Versão de 19/11/2026. Conferido contra o motor de regras (`engine.js`, branch `mesa-3d`), que é a fonte de verdade. **As regras do digital valem também para o jogo impresso** (decisão de 19/11/2026); onde o impresso v4 era diferente, vale o digital.

Este manual é a referência completa: serve para revisar o jogo, arbitrar dúvidas e programar. Para aprender a jogar, use o **Manual do jogador**, mais curto.

---

## 1. O jogo

Batalha dos Filósofos é um jogo de cartas em que filósofos disputam as grandes perguntas da filosofia. Cada jogador forma um grupo de pensadores, junta ideias e as leva aos debates abertos na Ágora. Quem sustenta um debate vence a pergunta e marca o valor dela em pontos.

O jogo tem três níveis com as mesmas cartas:

- **Nível 1 (Ensino Fundamental):** Super Trunfo com as quatro áreas.
- **Nível 2 (Ensino Médio):** debates com os valores das áreas e o poder gratuito de cada filósofo. **É o nível descrito neste manual.**
- **Nível 3 (avançado):** Poder 2 e Poder 3 (pagos), Catedrático e Legados. As cartas já mostram esses poderes, marcados como nível 3; no nível 2 eles não valem.

No digital, a partida tem três jogadores: você contra dois adversários controlados pelo computador.

---

## 2. Componentes

### 2.1 Ideias

A ideia é o único recurso do jogo. Serve para baixar cartas, comprar a carta extra, fazer a troca e, sobretudo, para disputar os debates. No digital, cada ideia aparece como um livro.

As ideias ficam em três lugares:

- **na Biblioteca** do jogador (o seu estoque);
- **nos filósofos** do grupo (ideias que cada filósofo acumulou);
- **nos debates** (ideias que o jogador já pôs em cada pergunta).

As ideias só andam num sentido: Biblioteca → filósofo → debate. Ideias da Biblioteca nunca vão direto a um debate, salvo quando uma carta diz o contrário.

**As ideias num debate pertencem ao jogador, e não ao filósofo que as levou.** Depois que chegam ao debate, ninguém sabe mais de quem vieram. Por isso, um efeito que tira ideias de um debate atinge o jogador, nunca um filósofo em particular. (No digital, as ideias de cada jogador num debate aparecem numa prateleira da placa; o nome serve só para descrever a tela.)

A Biblioteca não tem teto. **Cada filósofo pode ter no máximo 10 ideias**: o que passaria disso se perde, venha de onde vier (Reflexão, escola, duplas, poderes, Petitio), e a Biblioteca não pode dar ideias a quem já tem 10.

### 2.2 Cartas de filósofo (20)

Cada carta traz:

- **custo** (de 1 a 5): quantas ideias da Biblioteca se pagam para baixá-la; define também a Reflexão (seção 5.4);
- **escola**: Grécia Clássica, Materialistas e Empiristas, Germânicos ou Livres-Pensadores;
- **quatro valores de área**, de 1 a 5: Metafísica e Religião; Lógica, Ciência e Matemática; Ética e Política; Psicologia e Estética;
- **Poder** (gratuito): o efeito que vale no nível 2 (seção 8);
- Poder 2 e Poder 3: só no nível 3.

Os 20 filósofos, por escola (custo entre parênteses):

- **Grécia Clássica:** Aristóteles (5), Platão (4), Sócrates (3), Epicuro (2), Pitágoras (1), Diógenes (1).
- **Materialistas e Empiristas:** Marx (5), Hegel (4), Hobbes (3), Bacon (2), Locke (1), Rousseau (1).
- **Germânicos:** Kant (5), Nietzsche (4), Schopenhauer (3), Heidegger (2), Freud (1), Arendt (1).
- **Livres-Pensadores:** Maquiavel (1), Erasmo (1).

### 2.3 Cartas temporárias (16)

São cartas de efeito único: pagas, aplicadas e tiradas da mão. Há uma cópia de cada, e todas têm a mesma textura de borda, que as distingue dos filósofos. Dividem-se em quatro famílias:

- **Falácias (7):** Argumento de Autoridade, Espantalho, Ad Hominem, Sofisma, Petitio Principii, Mutatio Controversiae, Non Sequitur. Borda vermelho-escura, caveira e o rótulo FALÁCIA. Depois de usadas, **saem do jogo** e tiram 1 ou 2 pontos de quem as usou.
- **Argumentos (5):** Retorsio Argumenti, Reductio ad Absurdum, Falseabilidade, Tautologia, Paradoxo Lógico. Técnicas legítimas de prova e refutação.
- **Cartas de escola (3):** Cicuta (contra os Gregos), Dogma (contra os Materialistas e Empiristas), Niilismo (contra os Germânicos). Cada uma só entra no baralho quando a escola que ela ataca está em jogo.
- **Práxis (1):** Ceticismo. Ideias filosóficas que viram manobra.

Argumentos, cartas de escola e Práxis vão para o descarte e voltam ao monte quando ele é reembaralhado. A família importa para o poder de Freud, que só reage a falácias. Efeitos na seção 9.

### 2.4 Debates (24)

Cada debate é uma pergunta de uma das quatro áreas, com um **valor**: 15, 12, 10, 9, 7 ou 5. Há seis perguntas por área (lista no Apêndice A). O valor é a meta para vencer e também os pontos que a vitória rende.

### 2.5 A mesa

- **Ágora:** onde ficam os debates abertos (no máximo três).
- **Grupo:** quatro cadeiras por jogador. Todo filósofo baixado ocupa uma cadeira. A ordem das cadeiras importa para alguns poderes (vizinhos de Epicuro, ordem em que os poderes disparam).
- **Biblioteca:** o estoque de ideias do jogador.
- **Pilha e descarte:** uma pilha comum, com filósofos e cartas temporárias misturados. As falácias usadas não vão para o descarte: saem do jogo. Quando a pilha acaba, o descarte é embaralhado e vira pilha nova.

---

## 3. Vocabulário

- **Em ação:** filósofo que pode agir (receber ideias da Biblioteca, ir a debates e disparar poderes que dependem de estar em ação).
- **Recém-chegado:** filósofo que acabou de entrar num grupo, por baixa ou por troca. Fica fora de ação até o início do próximo turno do seu dono (seção 6.6). No digital, aparece semitransparente.
- **Já debateu:** filósofo que já foi a um debate neste turno. No digital, aparece acinzentado.
- **Participar de um debate:** ter pelo menos 1 ideia nele. Quem perde todas as ideias num debate deixa de participar dele.
- **Liderar um debate:** ter ali ideias em número igual ou maior que o valor **e** pelo menos uma a mais que cada adversário.
- **Colega:** outro filósofo do mesmo grupo. **Colega de escola:** colega da mesma escola.
- **Vizinho:** filósofo da cadeira imediatamente ao lado.
- **Adversário** (ou **oponente**): qualquer outro jogador, ou um filósofo de outro jogador.
- **Bibliotecário:** filósofo nomeado para produzir ideias para a Biblioteca (seção 6.2).

---

## 4. Preparação

1. Embaralhe a pilha: os 20 filósofos e as 16 cartas temporárias (as cartas de escola só se a escola que atacam estiver em jogo).
2. Cada jogador recebe um filósofo de custo 1, tirado ao acaso da pilha, e mais 3 cartas do topo. Todos começam com 4 cartas na mão. O filósofo de custo 1 garante que todos baixem uma carta na primeira rodada.
3. Embaralhe os 24 debates e abra 2 na Ágora.
4. As Bibliotecas começam vazias. Os grupos começam vazios.
5. Defina a ordem de jogo. No digital, você é sempre o primeiro, seguido de Hipátia e Sêneca (nomes provisórios).

A **rodada** termina quando os três jogadores tiverem jogado um turno cada.

---

## 5. O turno: abertura automática

O turno tem três partes: a **abertura** (automática), as **ações** (à escolha do jogador) e o **fim**. A abertura segue sempre esta ordem:

### 5.1 Os recém-chegados entram em ação

Todo filósofo do seu grupo que estava recém-chegado passa a estar em ação. Os debates que **você** trancou com o Paradoxo Lógico destrancam agora, antes da sustentação. Se um adversário jogou Niilismo contra você no turno dele, o efeito começa agora e vale até o fim deste turno.

### 5.2 Vitórias por sustentação

Para cada debate que você **lidera** neste momento, você vence o debate (seção 7). Debate trancado por um adversário não é vencido enquanto estiver trancado. Isso acontece antes de qualquer outra coisa do turno: antes da compra, da Biblioteca e da Reflexão.

### 5.3 Compra e Biblioteca

- Você compra 1 carta da pilha.
- A sua Biblioteca recebe **3 ideias**. A Biblioteca acumula: o que sobra de um turno fica para o seguinte.

### 5.4 Reflexão

Cada filósofo do grupo recebe ideias, conforme o custo da carta:

- custo 1 ou 2: **+1 ideia**;
- custo 3 ou 4: **+2 ideias**;
- custo 5: **+3 ideias**.

Somam-se a isso:

- **Escola:** +1 para o filósofo que tem pelo menos um colega da mesma escola no grupo (é +1 só, qualquer que seja o número de colegas).
- **Dupla clássica:** +1 para cada filósofo de uma dupla completa no grupo. As duplas são cinco: Platão e Sócrates; Aristóteles e Platão; Marx e Hegel; Schopenhauer e Kant; Arendt e Heidegger. Os dois membros recebem +1. Platão, que está em duas duplas, recebe +1 por dupla completa (com Sócrates e Aristóteles no grupo, +2). As cinco duplas são de colegas de escola, então cada membro recebe também o bônus de escola.

**Dogma:** os dois filósofos atingidos pela carta não recebem nada neste momento de Reflexão (seção 9).

**Teto de 10:** se a Reflexão levaria um filósofo acima de 10 ideias, ele fica com 10 e o resto se perde.

O **Bibliotecário** não faz a Reflexão: em vez disso, produz para a Biblioteca tantas ideias quanto o seu custo (seção 6.2). Ele não recebe bônus de escola nem de dupla, mas conta como colega de escola e como parceiro de dupla para os outros.

### 5.5 Poderes da Reflexão

Depois da Reflexão, disparam os poderes que agem "no momento de Reflexão", um por filósofo, **na ordem das cadeiras**. O Bibliotecário também dispara o seu; o que ele ganharia para si vai para a Biblioteca.

### 5.6 Vitória imediata

Por fim, se você tiver, em algum debate, **o dobro do valor** ou mais, vence esse debate na hora (seção 7.2).

> **Regra fundamental: o que entra na abertura só vence no turno seguinte.** A vitória por sustentação (5.2) é conferida antes da Reflexão e dos poderes (5.4 e 5.5). Ideias que um poder põe num debate durante a abertura (por exemplo, Aristóteles ou Pitágoras) só contam para a sustentação no seu próximo turno, depois que todos os adversários tiverem jogado. A única exceção é o dobro do valor, que vence na hora. Assim, toda liderança precisa resistir a uma volta inteira da mesa: os outros filósofos sempre têm a chance de responder ao argumento.

---

## 6. O turno: ações

Depois da abertura, o jogador faz, **em qualquer ordem e quantas vezes puder**, as ações abaixo. Os limites de cada uma estão indicados.

### 6.1 Baixar um filósofo

- Pague o custo da carta com ideias da Biblioteca.
- Se houver cadeira livre, o filósofo ocupa a próxima cadeira.
- Com o grupo cheio (quatro cadeiras ocupadas), o novo filósofo **substitui** um dos quatro, à escolha do jogador. O substituído vai para o descarte com todas as ideias que tinha (elas se perdem).
- O filósofo chega **recém-chegado**: não recebe ideias da Biblioteca, não vai a debates e não usa poderes que dependem de estar em ação. Entra em ação no início do seu próximo turno.
- Pode-se baixar mais de um filósofo por turno.

### 6.2 Nomear o Bibliotecário

- Em vez de baixar um filósofo normalmente, o jogador pode nomeá-lo **Bibliotecário** (no digital: soltar a carta na Biblioteca). Paga o custo normal.
- O Bibliotecário ocupa uma das quatro cadeiras. Com o grupo cheio, substitui um filósofo.
- Só há um Bibliotecário por jogador. Nomear outro substitui o atual, que vai para o descarte.
- Não vai a debates e não recebe ideias (nem da Biblioteca, nem de poderes).
- A partir do início do seu próximo turno, produz na abertura tantas ideias quanto o seu custo, direto para a Biblioteca.
- Mantém o poder ligado: o que o poder daria a ele mesmo vai para a Biblioteca. Poderes que só disparam ao debater (Kant, Nietzsche, Hegel) ficam sem efeito.
- Conta como colega para o bônus de escola e como parceiro para as duplas clássicas.
- Não pode ser trocado (seção 6.6).
- Pode ser substituído por outro filósofo, baixado normalmente na cadeira dele.

### 6.3 Dar ideias a um filósofo

- Passe ideias da Biblioteca para um filósofo **em ação** do seu grupo, uma a uma.
- Não há limite por turno, mas nenhum filósofo passa de **10 ideias** (o teto): com 10, ele não recebe mais.
- Recém-chegados e o Bibliotecário não recebem.

### 6.4 Levar um filósofo a um debate

- O filósofo precisa estar **em ação**, não ser o Bibliotecário e não ter debatido neste turno.
- Ele leva ao debate **exatamente** o seu valor na área da pergunta. Se tiver menos ideias que isso, não vai. Se tiver mais, as que sobram ficam com ele.
- Exemplo: Platão tem 5 em Ética. Para ir a um debate de Ética, precisa ter pelo menos 5 ideias, e leva 5.
- Cada filósofo vai a **um debate por turno**.
- Pode ir a um debate de qualquer valor, mesmo que já tenha ido a ele em turnos anteriores.
- As ideias levadas passam a ser do jogador naquele debate (seção 2.1).
- Exceções, nos poderes de Hegel, Kant e Nietzsche (seção 8).
- Nenhum filósofo vai a um debate trancado pelo Paradoxo Lógico. No turno sob Niilismo, os Germânicos não vão a debates.
- Depois de cada ida a um debate, confere-se a vitória imediata (dobro do valor) para quem jogou.

### 6.5 Usar uma carta temporária

- Pague o custo com ideias da Biblioteca e aplique o efeito.
- Argumentos, cartas de escola e Práxis vão para o descarte.
- **Falácias saem do jogo** e cobram pontos de quem as usou: −2 por Ad Hominem e Espantalho, −1 pelas demais. O placar pode ficar **negativo**. Ao lado dos troféus, as caveiras registram quantos pontos as falácias já custaram (caveira ×3, por exemplo).
- A maioria exige que você **participe** do debate escolhido (seção 9).
- Não há limite de cartas temporárias por turno.
- Depois de cada carta: Locke reage (se estiver no seu grupo e em ação); Freud reage, se estiver no grupo de um adversário e a carta for uma falácia; confere-se a vitória imediata para quem jogou.

### 6.6 Trocar um filósofo

- Custa **5 ideias** da Biblioteca. **Uma vez por partida** para cada jogador.
- Troque um filósofo do seu grupo por um filósofo do grupo de um adversário. Cada um ocupa a cadeira do outro.
- Podem ser trocados filósofos recém-chegados.
- **Não podem ser trocados:** o Bibliotecário (de nenhum dos lados) e Diógenes (nem o seu, nem o do adversário).
- Os dois filósofos perdem todas as ideias que tinham.
- Os dois chegam como **recém-chegados**: cada um entra em ação no início do próximo turno do seu novo dono. Assim, o filósofo que o adversário recebeu já está em ação no turno dele, e já faz a Reflexão nesse turno.

### 6.7 Comprar a carta extra

- Custa **2 ideias** da Biblioteca. **Uma vez por turno.**

### 6.8 Encerrar o turno

O jogador encerra o turno quando quiser. Não é obrigado a gastar as ideias da Biblioteca: elas ficam para o turno seguinte.

---

## 7. Debates

### 7.1 A Ágora

- A partida começa com **2 debates** abertos.
- Ao fim da **rodada 4**, abre-se o terceiro debate.
- A Ágora tem no máximo **3 debates**.
- Quando um debate é vencido, outro, tirado da pilha de debates, entra no lugar imediatamente. Se a pilha de debates acabar, a vaga fica vazia.

### 7.2 Como se vence

Há dois modos:

- **Por sustentação:** no início do seu turno (seção 5.2), você vence todo debate que **lidera**: tem ali ideias em número igual ou maior que o valor **e pelo menos uma a mais que cada adversário**. **Empate não vence**, nem para quem chegou primeiro.
- **Vitória imediata:** se, durante o seu turno, você chegar ao **dobro do valor** ou mais num debate, vence na hora. Ela é conferida no fim da abertura, depois de cada ida a um debate e depois de cada carta temporária, sempre só para o jogador da vez. O primeiro a chegar ao dobro leva o debate (dois jogadores nunca chegam juntos).

Exemplo. Debate de valor 10. Você tem 12; Hipátia, 11; Sêneca, 4. No início do seu turno, você lidera (12 ≥ 10 e 12 > 11) e vence. Se Hipátia tivesse 12, ninguém venceria: empate não vence. Se você tivesse 20 em qualquer momento do seu turno, venceria na hora.

### 7.3 O que acontece na vitória

- O vencedor marca em pontos o valor do debate.
- A carta do debate vai para os troféus do vencedor.
- **Todas as ideias desse debate, de todos os jogadores, se perdem.**
- Um novo debate entra na mesma vaga.

---

## 8. Os poderes dos 20 filósofos

Os poderes valem enquanto o filósofo está no grupo. Os que agem "no momento de Reflexão" disparam uma vez por turno do dono, na ordem das cadeiras (seção 5.5). Quando o poder pede uma escolha (um alvo, um debate, um vizinho), **no digital quem escolhe é o computador**, pelo critério indicado; **no impresso, escolhe o dono do filósofo**. Em empates, o computador fica com o primeiro na ordem das cadeiras ou dos jogadores.

### Grécia Clássica

- **Aristóteles — Silogismo – Premissa.** No momento de Reflexão, põe +1 ideia sua num debate de Lógica, mesmo que você ainda não participe dele. Computador: o debate de Lógica em que você tem mais ideias (empate: o de maior valor). Sem debate de Lógica na Ágora, nada acontece. Essa ideia entra depois da conferência de sustentação: só conta no turno seguinte (seção 5).
- **Platão — A República.** No momento de Reflexão, o filósofo de maior custo do seu grupo, o Rei Filósofo, recebe +1 ideia. Pode ser o próprio Platão. O Bibliotecário não entra na escolha.
- **Sócrates — Maiêutica.** No momento de Reflexão, o colega com menos ideias recebe +1. Não vale para o próprio Sócrates nem para o Bibliotecário.
- **Epicuro — Laço de Amizade.** No momento de Reflexão, um vizinho de cadeira recebe +1 ideia, e Epicuro também: a amizade é recíproca. Sem vizinho, nada acontece. Computador: o vizinho com menos ideias (empate: o da cadeira anterior). O Bibliotecário não recebe.
- **Pitágoras — Harmonia das Esferas.** No momento de Reflexão, põe +1 ideia sua num debate cujo valor seja número primo (5 ou 7). Computador: o debate de valor primo em que você tem mais ideias (empate: o de maior valor). Só conta para a sustentação no turno seguinte.
- **Diógenes — Barrica de Diógenes.** Nenhum adversário pode escolher Diógenes como alvo nem tirar ideias dele. Não pode ser trocado: nem tomado por um adversário, nem dado pelo dono. Continua recebendo efeitos favoráveis gerais (como o Contrato Social de Rousseau) e os efeitos do próprio grupo (Sócrates e Platão podem lhe dar ideias; Kant pode puxar uma ideia dele). A proteção vale para Diógenes e para as ideias **que estão nele**; as que ele já levou a um debate pertencem ao jogador e não são protegidas. Hoje a proteção afasta a Mais-Valia de Marx, a falácia Ad Hominem e a troca; vale também para as cartas que vierem. **Vive com o mínimo:** no momento de Reflexão, se tiver 2 ideias ou menos (já contada a Reflexão), recebe +1.

### Materialistas e Empiristas

- **Marx — Mais-Valia.** No momento de Reflexão, o filósofo adversário com mais ideias perde 1. Ignora Diógenes e os Bibliotecários.
- **Hegel — Dialética.** Hegel é o único que pode ir a um debate com menos ideias que o seu valor na área: leva o que tiver, até esse valor. Precisa ter pelo menos 1 ideia. No digital, ele sempre leva o máximo possível. **Síntese:** ao entrar num debate em que um adversário tem mais ideias que você (antes de Hegel chegar), +1 ideia sua nesse debate. A tese encontra a antítese.
- **Hobbes — Guerra de todos contra todos.** No momento de Reflexão, o adversário com mais ideias num debate, de qualquer área, perde 1 ideia nesse debate. Computador: o maior número de ideias de um adversário entre todos os debates (empate: o primeiro debate). Nome do poder tirado do Leviatã, cap. XIII (a verificar); até 18/11/2026 o poder valia só para debates de Lógica e se chamava "Tudo no Universo é físico".
- **Bacon — "Conhecimento é poder".** No momento de Reflexão, você espia duas cartas da mão de um adversário. Computador: o adversário com mais cartas, duas cartas ao acaso. No digital, por enquanto, só tem efeito quando é do jogador humano.
- **Locke — Tábula Rasa.** Locke recebe +1 ideia sempre que você baixa uma carta, um filósofo (inclusive como Bibliotecário, exceto o próprio Locke) ou uma carta temporária, e sempre que um adversário baixa um filósofo (as cartas temporárias dos adversários não contam). Locke precisa estar em ação. As ideias vêm da experiência.
- **Rousseau — Contrato Social.** No momento de Reflexão, todos os filósofos de custo 1 da mesa recebem +1 ideia, inclusive os dos adversários e o próprio Rousseau. Ficam de fora os recém-chegados e os Bibliotecários.

### Germânicos

- **Kant — Imperativo Categórico.** Quando Kant leva ideias a um debate de Ética / Política, cada colega em ação que tenha ideias põe 1 delas no mesmo debate, **queira ou não**. A ideia sai do próprio colega. Vale também para colegas que já debateram neste turno, e não gasta a ação deles. O Bibliotecário fica de fora. É um poder difícil de usar: pode desfazer a jogada de um colega que estava juntando ideias para outro debate.
- **Nietzsche — Filosofar com o martelo.** Toda vez que Nietzsche entra num debate, o adversário com mais ideias nesse debate perde 2 (ou o que tiver, se tiver menos). Nome tirado do subtítulo de *Crepúsculo dos Ídolos* (a verificar).
- **Schopenhauer — Negação da Vontade.** No momento de Reflexão, recebe +1 ideia se não foi a nenhum debate no turno anterior do dono. Como Bibliotecário, rende +1 por turno para a Biblioteca.
- **Heidegger — Ser-no-mundo.** No momento de Reflexão, recebe +1 ideia para cada debate em que você tem ideias.
- **Freud — Ato Falho.** Freud recebe +1 ideia sempre que um adversário usa uma **falácia** (as sete da seção 2.3; as outras famílias não contam). Freud precisa estar em ação. O ganho acontece no turno do adversário.
- **Arendt — A Condição Humana.** No momento de Reflexão, recebe +1 ideia se houver um debate de Ética / Política na Ágora.

### Livres-Pensadores

- **Maquiavel — O Príncipe.** No momento de Reflexão, o filósofo com mais ideias do seu grupo recebe +1. Pode ser o próprio Maquiavel. O Bibliotecário não entra na escolha.
- **Erasmo — Elogio da Loucura.** No momento de Reflexão, um adversário perde 1 ideia num debate de Metafísica / Religião. Computador: o adversário com mais ideias num debate dessa área. (O texto da carta diz "o adversário que lidera"; o motor escolhe o adversário com mais ideias, mesmo que ele não lidere. Ver Apêndice C.)

---

## 9. As 16 cartas temporárias

Em todas, "debate do qual você participa" quer dizer: debate em que você tem pelo menos 1 ideia. Efeitos que tiram ideias nunca deixam ninguém abaixo de zero. Nenhuma carta age num debate trancado pelo Paradoxo Lógico (nem como origem, nem como destino). Cada carta tem dois textos: o **Jogo**, com a mecânica, e o **O que é**, um parágrafo curto que explica a ideia (referências a verificar).

### Falácias

Saem do jogo depois de usadas e tiram pontos de quem as usa (seção 6.5).

- **Argumento de Autoridade** (custo 4; −1 ponto). Num debate do qual você participa: +5 ideias suas.
- **Espantalho** (custo 5; −2 pontos). Num debate do qual você e um oponente participam: +4 para você e −4 para ele.
- **Ad Hominem** (custo 2; −2 pontos). Tire **até 5** ideias de um filósofo adversário e acrescente a mesma quantidade num debate do qual você participa. Não pode mirar Diógenes. Você precisa participar de algum debate.
- **Sofisma** (custo 2; −1 ponto). Num debate do qual você e um oponente participam: +2 para você e −3 para ele.
- **Petitio Principii** (custo 3; −1 ponto). Coloque 5 ideias num filósofo seu que já esteja em ação e não tenha ideias. Não vale para recém-chegados nem para o Bibliotecário.
- **Mutatio Controversiae** (custo 3; −1 ponto). Retire até 4 ideias suas de um debate e ponha-as em outro debate da Ágora. No digital, move sempre 4 (ou todas, se tiver menos).
- **Non Sequitur** (custo 2; −1 ponto). Um oponente descarta até 2 cartas temporárias da mão, sorteadas. Os filósofos da mão ficam.

### Argumentos

Técnicas legítimas de prova e refutação. Voltam ao monte pelo descarte.

- **Retorsio Argumenti** (custo 3). Num debate do qual você participa e em que um oponente tenha pelo menos 3 ideias: 3 ideias dele passam para você.
- **Reductio ad Absurdum** (custo 3). Num debate do qual você participa, um oponente com 2 ou mais ideias fica com a metade, arredondada para cima (9 → 5; 15 → 8; 2 → 1).
- **Falseabilidade** (custo 2). Num debate de Lógica / Ciência do qual você participa: um oponente perde 5 ideias.
- **Tautologia** (custo 2). Pague 2 e receba 2 ideias. Ponha-as num filósofo seu, mesmo recém-chegado (não no Bibliotecário), ou num debate do qual você participa. O teto de 10 vale para o filósofo.
- **Paradoxo Lógico** (custo 4). Tranque um debate, qualquer um, até o início do seu próximo turno. Enquanto estiver trancado, ninguém põe nem tira ideias dele (filósofos, cartas e poderes da Reflexão) e ninguém o vence por sustentação. No início do seu próximo turno, o debate destranca **antes** da sustentação: se você o lidera, vence. Serve para proteger uma liderança ou para impedir que um adversário que lidera vença no turno dele. Não há exceção: a carta pode garantir uma vitória.

### Cartas de escola

Cada uma ataca uma escola e só entra no baralho quando essa escola está em jogo. Voltam ao monte pelo descarte.

- **Cicuta** (Gregos; custo 3, ou **1** se o alvo for Sócrates). Elimine um filósofo grego do grupo de um adversário. Ele vai para o descarte; as ideias que tinha se perdem (as que já levou a debates ficam). Diógenes é imune. O Bibliotecário não é alvo.
- **Dogma** (Materialistas; custo 4). Escolha um adversário: dois Materialistas e Empiristas do grupo dele não recebem ideias no próximo momento de Reflexão dele (nem da Reflexão, nem de bônus, nem de poderes de colegas). Os poderes deles continuam agindo. No digital, a carta atinge os dois de maior custo; no impresso, quem joga escolhe.
- **Niilismo** (Germânicos; custo 3). No próximo turno de um adversário, nenhum filósofo Germânico dele leva ideias a debates. Continuam recebendo ideias e usando poderes da Reflexão.

### Práxis

Ideias filosóficas que viram manobra. Voltam ao monte pelo descarte.

- **Ceticismo** (custo 1). Num debate de Metafísica / Religião do qual você participa, um oponente perde 2 ideias, ou 4 se você tiver um Materialista e Empirista no grupo (o Bibliotecário conta).

### Próximas cartas

Segunda leva (textos prontos em claude/textos-temporarias.md, mecânica a confirmar): Em busca do mestre, Reciclagem Cultural, Condenado à liberdade, Verdades. Nível 3: Estoicismo e Limpando a Estante. As cartas das escolas Teístas, Franceses e Orientais entram com as escolas. Arqueologia do Saber ficou fora.

---

## 10. Fim do turno

1. **Limite da mão:** ao encerrar, o jogador fica com no máximo **5 cartas**, descartando as que escolher. Durante o turno, a mão pode ter mais (6 com a compra, 7 com a carta extra).
2. Os filósofos do grupo deixam de estar "já debateu".
3. Os recém-chegados continuam recém-chegados durante os turnos dos adversários; entram em ação no início do próximo turno do dono.
4. A vez passa ao jogador seguinte.

---

## 11. Fim da partida

- O fim é conferido **quando a rodada se completa** (depois do turno do terceiro jogador).
- A partida acaba se algum jogador tiver **30 pontos** ou mais, ou ao fim da **12ª rodada**. Mesmo que o primeiro jogador passe de 30 pontos, os outros completam a rodada.
- Vence quem tiver mais pontos. Em caso de empate, vence quem venceu mais debates. Persistindo o empate, a partida termina empatada.

---

## 12. Casos especiais e perguntas frequentes

- **Dois alvos empatados num poder automático?** No digital, o computador fica com o primeiro na ordem das cadeiras (do grupo) ou dos jogadores. No impresso, o dono escolhe.
- **Um filósofo substituído ou trocado perde as ideias?** Sim, todas as ideias que estão nele. As ideias que ele levou a debates continuam lá, porque são do jogador.
- **Posso pôr ideias da Biblioteca direto num debate?** Não. Só por meio de um filósofo, ou de uma carta que diga o contrário.
- **Posso ir a um debate em que não tenho chance?** Sim. Não há restrição de valor do debate; a única exigência é ter as ideias do valor da área.
- **O que acontece com as ideias de quem perdeu um debate?** Somem junto com o debate vencido.
- **Um adversário pode vencer no meu turno?** Não. A sustentação é conferida no início do turno de cada um, e a vitória imediata só para o jogador da vez.
- **Se eu liderar no fim da abertura, por causa de Aristóteles ou Pitágoras, já venci?** Não, salvo se chegou ao dobro. A liderança precisa sobreviver aos turnos dos adversários (seção 5).
- **E as ideias que passariam de 10?** Se perdem. Isso vale também para os poderes que dão ideias a um colega: se o Maquiavel der +1 ao filósofo com mais ideias e ele já tiver 10, o ponto se perde.
- **Se Kant for a um debate de Ética, um colega sem ideias também contribui?** Não. Só quem tem pelo menos 1 ideia.
- **O Bibliotecário pode ser alvo da Mais-Valia ou do Ad Hominem?** Na prática, não: ele nunca tem ideias (tudo o que ganharia vai para a Biblioteca).
- **Recém-chegado faz a Reflexão?** Não há recém-chegado na Reflexão do dono: ele entra em ação no início do turno, antes dela (seção 5.1). Durante os turnos dos adversários, continua fora de ação (não recebe o +1 do Contrato Social de Rousseau, e Freud recém-chegado não reage a falácias).
- **A pilha acabou e o descarte também.** Ninguém compra; o resto do turno segue normalmente.
- **Com pontos negativos, ainda posso vencer?** Sim. Os pontos dos debates somam-se ao placar negativo normalmente.
- **Descartei uma falácia sem usá-la (limite da mão, Non Sequitur).** Ela vai para o descarte como qualquer carta. Só sai do jogo a falácia usada.
- **Um debate trancado pode ser vencido com o dobro do valor?** Não há como: ninguém põe ideias nele enquanto está trancado.

---

## 13. Diferenças em relação ao impresso v4 ("Batalha dos Cabeções")

Para quem conhece o protótipo de papel. O digital mudou de propósito, e estas mudanças passam a valer também para o impresso:

- A Biblioteca recebe sempre 3 ideias por turno e **acumula**; no v4, recebia o número da rodada (até 8) e era zerada ao fim do turno.
- Não há limite de 4 ideias repassadas por turno; em vez disso, cada filósofo tem um teto de 10 ideias.
- Não há Catedrático no nível 2; o grupo tem quatro cadeiras iguais. Entrou o Bibliotecário.
- Reflexão pelo custo (1, 2 ou 3 ideias), com bônus de escola e de dupla clássica; no v4, 1 ideia por filósofo.
- A Ágora começa com 2 debates e abre o terceiro ao fim da rodada 4.
- Empate não vence debate.
- Fim com 30 pontos ou 12 rodadas.
- Mão inicial: o filósofo de custo 1 e mais 3 cartas (no v4, mais 4).
- Entraram a troca e os poderes gratuitos reescritos para o digital.
- "Conceito" passou a se chamar "Poder"; "Permanente", "Legado" (nível 3).

---

## Apêndice A — Os 24 debates

**Metafísica e Religião:** Deus existe? (15) · Temos uma alma? (12) · Temos livre-arbítrio? (10) · Existe um propósito para o ser humano? (9) · Por que existe algo em vez de nada? (7) · Como distinguir verdade de ilusão? (5)

**Lógica, Ciência e Matemática:** O Universo é conhecível? (15) · O Universo é matemático? (12) · Como podemos conhecer a verdade? (10) · O que é o tempo? (9) · Existem leis no Universo? (7) · Como explicar os paradoxos? (5)

**Ética e Política:** O que é o Bem? (15) · Qual a melhor forma de governo? (12) · Somos todos iguais? (10) · O Estado é necessário? (9) · Quando se pode fazer o mal? (7) · Quem dita a moral? (5)

**Psicologia e Estética:** O que é o Belo? (15) · O que é o Amor? (12) · É possível separar emoção da razão? (10) · O que move o ser humano? (9) · Para que serve a arte? (7) · Por que agimos contra nossos interesses? (5)

## Apêndice B — Valores das áreas

Ordem: Metafísica, Lógica, Ética, Psicologia.

- Aristóteles 4, 5, 4, 4 · Platão 5, 3, 5, 3 · Sócrates 4, 4, 3, 2 · Epicuro 3, 1, 3, 3 · Pitágoras 1, 5, 1, 2 · Diógenes 2, 1, 3, 2
- Marx 4, 3, 5, 2 · Hegel 4, 4, 3, 3 · Hobbes 3, 4, 4, 2 · Bacon 1, 4, 2, 2 · Locke 1, 4, 3, 1 · Rousseau 1, 1, 4, 2
- Kant 3, 5, 5, 4 · Nietzsche 5, 1, 4, 5 · Schopenhauer 3, 2, 3, 4 · Heidegger 4, 2, 2, 2 · Freud 2, 1, 1, 5 · Arendt 1, 1, 4, 3
- Maquiavel 1, 1, 5, 2 · Erasmo 2, 1, 3, 2

## Apêndice C — Pendências de regra registradas

- **Erasmo:** texto da carta ("o adversário que lidera") e motor ("o adversário com mais ideias") divergem. Decidir qual vale.
- **Bacon:** sem efeito para os jogadores do computador.
- **Hegel:** no digital, leva sempre o máximo; no impresso, o jogador poderia escolher quanto levar.
- **Vantagem por assento:** ainda irregular nas simulações.
- **Cartas de custo 4 e 5:** rendem pouco com a economia atual.
- **Planilha "Cartas v5":** atualizar Reductio, Nietzsche, Diógenes, Petitio, famílias e penalidades das cartas temporárias, as cartas novas e as duplas.
