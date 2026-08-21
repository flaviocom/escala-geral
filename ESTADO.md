# ESTADO — escala-geral

> **Onde o projeto está agora.** Documento vivo: sobrescrito, não acumulado.
>
> **Última atualização:** 20/08/2026 · **Fuso:** America/São_Paulo
>
> **Roteador:** [`AGENTS.md`](AGENTS.md) · **Pendências:** [`BACKLOG.md`](BACKLOG.md)

## Em uma frase

**Nasceu hoje** (S-068/S-069, escala-porteiros), a partir da trilha genérica já provada sem texto
de cliente. Site e área administrativa no ar, escala zerada. Duas telas que faltavam no produto
original (malha e mensagem configuráveis) já construídas, testadas e publicadas. **Horário real**
(regra máxima do dono) implementado, coexistindo com o período — 5 rodadas de auditoria
independente já rodadas sobre este repositório (a 4ª achou 4 defeitos, a 5ª achou 1 regressão da
própria correção da 4ª + 1 lacuna), a 6ª em andamento.

## Onde ficou hoje, ao final desta sessão

`Horário real, sempre Brasília` (P2.1/P2.5) — o dono não aceita "período fixo" nem "horário
fixo": tela pode registrar hora exata (`HH:mm`, texto puro, nunca `Date`), e o motor bloqueia por
SOBREPOSIÇÃO de intervalo, inclusive quando o horário atravessa a meia-noite (plantão 22h–06h,
por exemplo). **4ª auditoria independente** (cega, mandada a refutar) achou 4 defeitos reais nesse
refactor — todos corrigidos, com teste de regressão reproduzindo o cenário exato de cada um:

1. 🔴 CRÍTICO — `turnoNaJanela` (`malha.ts`) colapsava a janela quando o horário virava a noite
   (23h–01h): a checagem de sobreposição assumia `fim > ini`. Corrigido com partição do intervalo
   em pedaços que não cruzam meia-noite (`segmentosDoIntervalo`).
2. 🔴 CRÍTICO — `Admin.tsx` aceitava a entrada que detonava o item 1, sem validação nenhuma.
   Corrigido: `horaFim < horaInicio` (vira a noite) é aceito de propósito; `horaFim === horaInicio`
   (sem leitura sensata) é rejeitado com mensagem visível.
3. 🟡 MÉDIO — `conferencia-independente.ts` usava `.some()` para "dia marcado", enquanto a regra D9
   (`regras.ts`) usa `.every()` — assimetria que fazia a régua "independente" não ver um furo que a
   régua principal via. Corrigido: mesmo critério nas duas.
4. 🟡 MÉDIO — `AbaAjustar.tsx` tinha "SANTA CEIA" cravado em vez do nome editável do evento
   (`turno.rotulo`). Corrigido.

432/432 testes (era 428), typecheck limpo, `npm run generico` limpo, build limpo.

**5ª auditoria** (verificação cética das 4 correções acima) achou 2 coisas reais — uma delas é uma
**regressão introduzida pela própria correção do item 1**: o comentário da correção do vira-a-noite
assumia que `fim === ini` era impossível porque a tela impedia — verdade só para `EventoSemEscala`
(`Admin.tsx`), falsa para `RegraMalha` (`AbaMalha.tsx`, campo de texto livre, sem validação nenhuma).
Provado ao vivo: uma regra de malha com início igual a fim bloqueava o dia inteiro em qualquer outro
evento, sem relação nenhuma. **Corrigido na ORIGEM** (`segmentosDoIntervalo` em `malha.ts` agora
trata início-igual-a-fim como intervalo vazio, não importa de onde o dado vem — não depende mais de
nenhuma validação de tela específica), mais defesa em profundidade em `AbaMalha.tsx` (`type="time"`
+ aviso inline). Também fechada a paridade D9×conferência independente que faltava na direção
contrária (evento removido da config depois de gerar). 435/435 testes (era 432), typecheck/gate/
build limpos. **6ª auditoria** (verificação cética desta correção) disparada — resultado ainda
pendente no momento deste registro; ver `BACKLOG.md` P1.15 para o veredito quando sair.

## O que foi feito nesta sessão de fundação

1. **Repositório criado**, público, marcado como Template Repository.
2. **Codebase copiado** do `escala-porteiros` (mesmo `src/dominio`, mesmos testes, mesmo motor de
   geração) — 407 testes reaproveitados, todos verdes desde o primeiro build.
3. **Dado zerado**: `pessoas.json` e `blocos.json` vazios; `config.json` com identidade genérica
   ("Escala de plantões", vocabulário "Plantonista").
4. **`AbaMalha.tsx`** — tela nova: dias, turnos, horário informativo, recorrência (semanal / a cada
   N dias / N-ésima ocorrência do mês), rótulo, vagas por evento. Edita `config.malhaPadrao.regras`
   direto, sem tocar código.
5. **`AbaMensagem.tsx`** — tela nova: dois modelos de lembrete (resumo semanal, véspera), barra de
   formatação (negrito/itálico/riscado + emojis) e pré-visualização que renderiza a sintaxe oficial
   do WhatsApp de verdade, não só mostra o texto cru.
6. **`malha.varredura.test.ts`** — 200 malhas sintéticas semeadas (dias esparsos, 1-3 turnos por
   dia, as três formas de recorrência, elencos de 6 a 26 pessoas): **zero falhas** nas duas réguas
   (catálogo duro + conferência independente). Onde impossível, declara com motivo — nunca
   meia-escala.
7. **Publicado**: site e admin ao vivo, build limpo, 409/409 testes.
8. **Auditoria independente** disparada (agente cego, mandado a refutar) — ver o resultado no
   próximo registro deste arquivo ou em `BACKLOG.md` se achou algo.

## O que NÃO foi feito ainda (fora de escopo, registrado)

- **Onboarding sem credencial do GitHub para o comprador.** Exige backend + banco multi-tenant —
  pendência de pesquisa registrada em `escala-porteiros/docs/FASE2.md` (P4.y), não neste repo.
- **Componente de teste para as telas** (React, clique/preenchimento) — cobertas por typecheck e
  pela varredura de domínio, mas sem teste de interação de tela ainda. Ver `BACKLOG.md` P2.2.

## Como retomar

1. Leia [`AGENTS.md`](AGENTS.md) e [`BACKLOG.md`](BACKLOG.md).
2. `npm install && npm run gate`.
3. Site: https://flaviocom.github.io/escala-geral/ · Admin: .../#/admin (sem token para testar).
