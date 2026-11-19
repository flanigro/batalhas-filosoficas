# Pedido de revisão: conteúdo filosófico do jogo Batalha dos Filósofos

Cole este texto na conversa com a IA revisora e anexe os arquivos indicados.

---

Você vai revisar o conteúdo filosófico de um jogo educativo de cartas, Batalha dos Filósofos, para estudantes do Ensino Médio. No jogo, 20 filósofos disputam 24 grandes perguntas da filosofia. Quando um filósofo entra num debate, aparece uma fala dele sobre a pergunta. Essas falas foram escritas por outra IA e precisam de checagem independente.

**Arquivos anexos**

- `falas-para-revisao.csv`: 480 falas, uma por linha (filósofo × pergunta). Cada fala tem um tipo: "citação (tradução livre)", "paráfrase" ou "inferência a partir da doutrina".
- `relacoes-para-revisao.csv`: 42 relações históricas entre filósofos (o que um disse ou fez sobre o outro).
- `cartas-para-revisao.csv`: as 20 cartas, com citação, fonte, obra de referência, datas, local e títulos dos poderes.
- `conteudo-para-revisao.md`: o mesmo conteúdo em texto corrido, para leitura.

**O que verificar em cada linha**

1. **Pertinência ao tema.** A fala responde à pergunta da linha, do ponto de vista daquele filósofo? Ela representa com justiça a posição dele sobre o tema, sem atribuir a ele ideias de outro autor ou de outra época?
2. **Citação.** Se o tipo é "citação": o trecho existe? A tradução é fiel? A obra e a passagem indicadas estão corretas? Se não for possível confirmar que é citação literal, recomende mudar o tipo para "paráfrase".
3. **Paráfrase.** Se o tipo é "paráfrase": ela é fiel ao que está na passagem indicada? A fonte aponta para o lugar certo?
4. **Inferência.** Se o tipo é "inferência": a conclusão decorre de forma razoável da doutrina do filósofo? Não deve soar como se fosse dita por ele.
5. **Fatos.** Nas relações e nas cartas: datas, locais, obras, episódios e atribuições estão corretos? Os títulos dos poderes atribuídos ao filósofo correspondem a conceitos ou expressões dele?

**Regras**

- Nunca invente citação, obra ou passagem. Se não tiver certeza, diga que não conseguiu verificar.
- Prefira indicar a passagem com a referência padrão quando existir (por exemplo, numeração Bekker para Aristóteles, Stephanus para Platão, A/B para a Crítica da Razão Pura).
- Para autores do século XX (Freud, Heidegger, Arendt), citações literais devem ser curtas.
- O texto vai para estudantes: aponte também frases confusas ou simplificações que distorçam a ideia.

**Como devolver**

Devolva os três CSV com as colunas de revisão preenchidas, sem mudar as colunas originais nem a coluna `id`:

- `veredito`: OK, AJUSTAR, TROCAR TIPO, ERRADO ou NÃO VERIFICÁVEL.
- `texto_corrigido`: só se o texto precisar mudar.
- `tipo_corrigido`: só nas falas, se o tipo precisar mudar.
- `fonte_corrigida`: obra e passagem corretas, se a indicada estiver errada ou incompleta.
- `observacao`: o motivo, em uma ou duas frases.

Se o arquivo for grande demais para uma resposta, trabalhe por filósofo, na ordem do arquivo, e devolva um CSV por lote com as mesmas colunas.
