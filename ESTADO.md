# ESTADO — escala-geral

> **Onde o projeto está agora.** Documento vivo: sobrescrito, não acumulado.
>
> **Última atualização:** 20/08/2026 · **Fuso:** America/São_Paulo
>
> **Roteador:** [`AGENTS.md`](AGENTS.md) · **Pendências:** [`BACKLOG.md`](BACKLOG.md)

## Em uma frase

**Nasceu hoje** (S-068/S-069, escala-porteiros), a partir da trilha genérica já provada sem texto
de cliente. Site e área administrativa no ar, escala zerada. Duas telas que faltavam no produto
original (malha e mensagem configuráveis) já construídas, testadas e publicadas.

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

## O que NÃO foi feito nesta rodada (fora de escopo, registrado)

- **Onboarding sem credencial do GitHub para o comprador.** Exige backend + banco multi-tenant —
  pendência de pesquisa registrada em `escala-porteiros/docs/FASE2.md` (P4.y), não neste repo.
- **Horário real decidindo o encaixe** (hoje é só informativo — o motor ainda encaixa por
  MANHA/TARDE/NOITE). Mudar isso é mudança de motor, não desta rodada.
- **Componente de teste para as duas telas novas** (React) — cobertas por typecheck e pela
  varredura de domínio, mas sem teste de interação de tela ainda.

## Como retomar

1. Leia [`AGENTS.md`](AGENTS.md) e [`BACKLOG.md`](BACKLOG.md).
2. `npm install && npm run gate`.
3. Site: https://flaviocom.github.io/escala-geral/ · Admin: .../#/admin (sem token para testar).
