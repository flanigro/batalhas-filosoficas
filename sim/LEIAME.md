# Simulação de balanceamento

Cópia do motor (`engine-var.js`) com variantes de regra e medições, para testar propostas sem mexer no jogo. Sem variante, reproduz o `engine.js` partida a partida (`node sim/igual.js` confere, a partir da raiz).

- `node sim/exp.js nome '{"semLib":true}' 2000`: partidas só de IA com uma variante; acrescenta o resultado em `exp.jsonl`.
- `node sim/injeta.js kant 500 '{}' saida.json`: força de uma carta (posta na mão inicial de cada assento).
- Variantes (campo `v`): semLib, semLibP, semPraxisP, maoExtra, praxisPorTurno, praxisMais, praxisCusto, praxisExila, copiasPraxis, adhominem, espantalho, autoridade, falseabilidade, sofismaTira, bibAlta {id: n}, buff {marx, hegel, hegel1, hobbes, erasmo, epicuro, epicuro2, pitagoras, maquiavel, rousseau, diogenes, locke, baconCarta, baconLog}.

Relatório: `balanceamento.md` (também no projeto, em claude/balanceamento.md).
