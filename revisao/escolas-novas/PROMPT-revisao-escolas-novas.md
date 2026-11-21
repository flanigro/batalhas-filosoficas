# Pedido de revisão: conteúdo das três escolas novas da Batalha dos Filósofos

Versão 2, de 21/11/2026. Cole este texto na conversa com a IA revisora e anexe os arquivos indicados. Ele substitui o pedido da primeira rodada, que pedia texto corrigido.

---

## 1. O que é o trabalho, em uma frase

Você vai **apontar problemas**, sem reescrever nada. Leia cada fala, relação, carta e bordão, verifique contra as fontes e diga, com evidência, o que está errado ou duvidoso. Quem decide e escreve a versão final é a equipe do jogo.

## 2. O jogo e onde o texto aparece

Batalha dos Filósofos é um jogo de cartas educativo, digital, para estudantes do Ensino Médio. Filósofos disputam 24 grandes perguntas da filosofia ("Deus existe?", "O que é o Bem?", "O Estado é necessário?"). Quando um filósofo entra num debate, aparece no centro da mesa um **balão com a fala dele** sobre a pergunta. Embaixo, pequenos, vêm o rótulo e a fonte. O balão é lido em poucos segundos, no meio da partida.

Nesta rodada entram três escolas, com 18 filósofos:

- **Teístas e Racionalistas:** Descartes, Tomás de Aquino, Agostinho, Leibniz, Averróis e Espinoza.
- **Franceses:** Sartre, Foucault, Voltaire, Derrida, Camus e Lacan.
- **Orientais:** Jesus de Nazaré, Buda, Confúcio, Avicena, Zoroastro e Lao-Tsé.

## 3. Arquivos anexos

- `falas-escolas-novas.csv`: 432 falas (18 filósofos × 24 perguntas), com rótulo, texto, número de caracteres e fonte indicada.
- `relacoes-escolas-novas.csv`: 29 relações históricas entre filósofos (o que um disse ou fez sobre o outro) e as frases de 6 duplas clássicas.
- `cartas-escolas-novas.csv`: as 18 cartas, com datas, local, obra de referência, citação da carta e sua fonte, e os títulos dos poderes.
- `temporarias-escolas-novas.csv`: as 3 cartas de escola ("Deus está morto", Determinismo, Orientalismo), com o texto que explica o conceito.
- `bordoes-escolas-novas.csv`: 78 bordões, os gritos curtos que o filósofo dá ao entrar no debate, com tradução quando estão em outra língua.
- `conteudo-escolas-novas.md`: o mesmo conteúdo em texto corrido, só para leitura.

## 4. O que deu errado na primeira rodada (e não deve se repetir)

Na revisão das 20 primeiras escolas, a revisora acertou muitas fontes e corrigiu erros reais. Mas, ao reescrever, piorou o texto:

- Reescreveu 398 de 480 falas. As falas cresceram de 137 para 178 caracteres em média, e 72 passaram de 220.
- 276 falas passaram a citar o próprio filósofo na terceira pessoa ("Para Aristóteles…", "Nietzsche pergunta se…"). No balão, isso soa como narrador, não como o filósofo falando.
- Cerca de 50 começaram com rodeios: "Uma resposta inspirada em…", "Pela tradição…", "No Timeu,…", "Segundo Xenofonte…".
- Frases fortes e autênticas viraram paráfrases mornas. A definição de verdade de Aristóteles virou uma explicação escolar; o "querer o nada" de Nietzsche foi diluído.
- Uma frase célebre foi retirada porque vinha de um caderno póstumo, quando bastava corrigir a fonte.
- A mesma anedota apareceu em duas perguntas do mesmo filósofo.

Por isso, desta vez: **nenhum texto novo**. Aponte o problema e mostre a evidência. Quando a correção for óbvia (uma fonte errada), dê só a referência certa.

## 5. Como o texto foi escrito de propósito (não marque como problema)

Estas escolhas são do projeto. Não as aponte como defeito:

1. **A fala é do filósofo:** em primeira pessoa ou impessoal, nunca "Para Descartes…". Isso vale também para as falas com rótulo "A partir de suas ideias". **Atenção:** o pedido da primeira rodada dizia o contrário ("não deve soar como se fosse dita por ele"), e foi uma das causas do problema. O rótulo já avisa o leitor; a fala continua na voz do filósofo.
2. **Clareza e força antes de literalidade.** Uma paráfrase pode mudar bastante as palavras do original, desde que mantenha a ideia. Uma frase célebre e fiel ao espírito do autor vale mais que uma tradução exata e morna.
3. **Português de hoje.** As falas evitam o ranço das traduções antigas: nada de "vós", "amai", "conhecereis", mesóclises ou inversões solenes. Os Evangelhos, os Analectos e o Tao Te Ching aparecem em português atual. Por isso uma "Tradução livre" pode não bater palavra por palavra com a tradução que você conhece: confira o sentido.
4. **Frases curtas, até cerca de 200 caracteres,** para um aluno do Ensino Médio ler em poucos segundos.
5. **Simplicidade quando ela é a melhor resposta.** Na pergunta "Deus existe?", Jesus responde só "É meu Pai." Não aponte falta de desenvolvimento numa fala curta que acerta.
6. **Caricatura leve e humor.** A fala pode forçar um pouco um traço que o filósofo de fato tem (a ironia de Voltaire, a radicalidade de Sartre, o paradoxo de Lao-Tsé) e tirar humor da própria ideia. O limite é a deturpação, e o humor nunca vem de piada externa à filosofia.
7. **Anedotas em primeira pessoa** ("Quando empacava num problema, eu ia rezar…"), desde que a anedota exista nas fontes antigas.
8. **Rótulos.** "Tradução livre": o texto segue de perto uma passagem, em português atual. "Em outras palavras": paráfrase fiel a uma passagem identificada. "A partir de suas ideias": síntese da doutrina, sem passagem única.

## 6. O que verificar

Para cada linha, nesta ordem:

1. **Existe e é dele?** A frase ou a ideia está no autor e na obra indicada? Ou é apócrifa, de um discípulo, de um comentador, de outro autor, ou só "atribuída" na internet? Frases de efeito que circulam sem fonte são o primeiro suspeito.
2. **Está no contexto certo?** Este é o ponto principal desta rodada. Muitas frases famosas foram tiradas do contexto e viraram frase de impacto com outro sentido. Exemplos do tipo: uma fala de personagem de teatro usada como tese do autor; uma pergunta retórica lida como afirmação; uma ironia lida a sério; uma frase que o próprio autor depois explicou ou corrigiu; uma tradução que mudou o sentido. Se a fala usa a frase no sentido deturpado, aponte, explique o sentido original e diga onde está.
3. **Representa a posição dele sobre esta pergunta?** A fala responde à pergunta da linha? Atribui ao filósofo uma tese que ele não sustenta, ou que é de outra fase da obra? A simplificação distorce?
4. **A fonte está certa?** Obra, livro, capítulo, parágrafo ou versículo. Use a referência padrão quando existir (abaixo).
5. **O rótulo está certo?** Uma "Tradução livre" que na verdade é paráfrase solta deve virar "Em outras palavras"; uma "Em outras palavras" sem passagem identificável deve virar "A partir de suas ideias".
6. **Repetição.** A mesma anedota, citação ou ideia central em duas falas do mesmo filósofo (indique os dois ids).
7. **Linguagem.** Frase confusa para um aluno do Ensino Médio; termo técnico sem necessidade; resto de tradução antiquada; fala em terceira pessoa ou com rodeio; mais de 220 caracteres.
8. **Oportunidade.** Se existe, no próprio autor, uma frase mais célebre, mais simples ou mais exata para aquela pergunta, indique a passagem. Não escreva a fala; só mostre onde está.
9. **Sensibilidade.** Nos conteúdos religiosos (Jesus, Buda, Agostinho, Tomás, Averróis, Avicena, Zoroastro, "Deus está morto"), aponte erro teológico, desrespeito ou algo que possa ofender uma família de qualquer crença. O jogo é laico e educativo: apresenta o que cada um ensinou, sem tomar partido.

Nas relações, cartas e bordões, valem os mesmos pontos, mais os **fatos**: datas, locais, obras, episódios, títulos dos poderes (correspondem a um conceito ou expressão do filósofo?) e traduções dos bordões em outras línguas (o significado está certo? a grafia ou a transliteração é aceitável?).

**Referências padrão.** Bíblia: livro, capítulo, versículo (Mateus 5, 44). Analectos: livro em romano e seção (XV, 24). Tao Te Ching: capítulo. Dhammapada: verso. Cânone Páli: coleção e número (Majjhima Nikaya 63). Gathas: Yasna, capítulo e estrofe. Agostinho: obra, livro e capítulo (Confissões X, 27). Tomás: Suma Teológica, parte, questão, artigo (I, q. 2, a. 3). Descartes: obra e parte ou meditação; se possível, a paginação Adam-Tannery (AT). Espinoza: Ética, parte, proposição, escólio. Leibniz: obra e parágrafo (Monadologia § 53). Voltaire: obra e capítulo ou verbete. Autores do século XX: obra, capítulo ou seção.

**Autores do século XX** (Sartre, Camus, Foucault, Derrida, Lacan) ainda estão protegidos por direito autoral. Aponte com a categoria `CITACAO_LONGA` toda citação literal que passe de cerca de 25 palavras.

## 7. Como devolver

Devolva os CSV com as cinco colunas de revisão preenchidas. Não mude as colunas originais nem a coluna `id`. Não acrescente linhas.

- `veredito`: um destes quatro.
  - `OK`: nada a apontar. As outras colunas ficam vazias. É o veredito esperado para a maioria das linhas.
  - `APONTAR`: há um problema que você verificou.
  - `DÚVIDA`: há algo suspeito que você não conseguiu confirmar nem descartar.
  - `NÃO VERIFICÁVEL`: você não tem acesso à fonte para conferir.
- `categorias`: um ou mais códigos, separados por ponto e vírgula:
  - `ATRIBUICAO`: a frase não é do filósofo (apócrifa, de outro autor, de discípulo).
  - `CONTEXTO`: tirada do contexto ou com sentido deturpado.
  - `DOUTRINA`: atribui tese que ele não sustenta, ou simplifica até distorcer.
  - `PERTINENCIA`: não responde à pergunta da linha.
  - `FONTE`: obra ou passagem errada, incompleta ou inexistente.
  - `ROTULO`: o rótulo não corresponde ao que o texto é.
  - `FATO`: data, local, obra ou episódio errado.
  - `REPETICAO`: repete outra fala do mesmo filósofo.
  - `LINGUAGEM`: confusa, técnica demais, antiquada, em terceira pessoa ou longa.
  - `TRADUCAO`: o bordão ou termo em outra língua está mal traduzido ou mal grafado.
  - `CITACAO_LONGA`: citação literal longa de autor do século XX.
  - `SENSIVEL`: risco para o público escolar.
  - `OPORTUNIDADE`: existe frase melhor do próprio autor para esta pergunta.
- `apontamento`: o problema, em uma a três frases. Diga o que está errado e por quê. **Não escreva uma nova versão da fala**, nem "sugiro: …" seguido de texto pronto.
- `evidencia`: o que a fonte diz de fato, com a passagem. Pode trazer um trecho curto do original (até cerca de 25 palavras) entre aspas. Em `OPORTUNIDADE`, o trecho da frase melhor e onde ela está.
- `fonte_correta`: só a referência certa, quando a indicada estiver errada ou incompleta.

## 8. Exemplos

Os exemplos mostram o formato; nem todos correspondem a linhas do arquivo.

**Bom apontamento (contexto):**

- veredito: `APONTAR`
- categorias: `CONTEXTO`
- apontamento: "O inferno são os outros" é fala do personagem Garcin, não uma tese de Sartre. Sartre explicou depois que quis dizer que, quando a relação com os outros é viciada, os outros se tornam um inferno. Usada como bordão, reforça a leitura deturpada.
- evidencia: Entre Quatro Paredes (1944), cena final; comentário falado de Sartre que abre a gravação da peça em disco, nos anos 1960.

**Bom apontamento (oportunidade):**

- veredito: `APONTAR`
- categorias: `OPORTUNIDADE`
- apontamento: A fala está certa, mas genérica. Confúcio tem uma resposta direta e conhecida para esta pergunta.
- evidencia: "Quando os nomes não estão corretos, a linguagem não está de acordo com a verdade das coisas" (Analectos XIII, 3).

**Bom apontamento (fonte):**

- veredito: `APONTAR`
- categorias: `FONTE`
- apontamento: A passagem existe, mas está em outro capítulo.
- fonte_correta: Confissões XI, 14

**Mau apontamento (não faça assim):**

- "Sugiro reescrever: 'Para Descartes, o mundo pode ser conhecido pela razão, como ele explica nos Princípios.'" Isso reescreve, usa terceira pessoa e enfraquece a fala.
- "A fala poderia ser mais completa e citar também o argumento ontológico." Falta de desenvolvimento não é defeito num balão de 200 caracteres.
- "Linguagem informal demais para um filósofo." O português atual é escolha do projeto.

## 9. Regras de honestidade

- Nunca invente citação, obra, passagem ou episódio. Se não conseguir verificar, use `NÃO VERIFICÁVEL` ou `DÚVIDA` e diga o que tentou.
- Não confunda "não conheço esta passagem" com "a passagem não existe".
- Quando discordar só por gosto, não aponte. O que importa é verdade, contexto, clareza e pertinência.

## 10. Ordem de trabalho

Trabalhe por escola, na ordem do arquivo: Teístas, Franceses, Orientais. Se o arquivo for grande demais para uma resposta, devolva um CSV por filósofo, com todas as colunas. Depois das falas, revise relações e duplas, cartas, cartas de escola e bordões. No fim, escreva um parágrafo com os padrões que você notou (por exemplo, "as fontes de Lacan indicam só o número do Seminário, sem a sessão").

---

## Para a equipe: como as respostas serão tratadas

Esta parte não vai para a revisora.

- Claude lê cada apontamento e confere a evidência. Quando o apontamento é verificável e procede (fonte, rótulo, fato, atribuição, contexto), aplica a correção no próprio texto, mantendo a voz, a força e o tamanho, com os critérios da seção 5.
- Quando há escolha real entre versões, ou escolha estética (trocar uma frase célebre deturpada por outra menos conhecida, mudar o tom de um filósofo, assunto religioso delicado), o caso vai para o Flavio em lote, com as opções lado a lado.
- `OPORTUNIDADE` é sugestão: entra quando a frase indicada é melhor pelos critérios do projeto.
- Tudo continua marcado "a verificar" até a conferência final de obra e passagem.
