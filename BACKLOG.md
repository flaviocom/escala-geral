# BACKLOG — escala-geral

> **O que falta fazer, em ordem.** Documento vivo.
>
> **Última atualização:** 20/08/2026 · **Roteador:** [`AGENTS.md`](AGENTS.md)

**Legenda:** 🔴 bloqueia o próximo marco · 🔵 método/infra · ⚪ produto
**Dono da decisão:** 👤 só o Flavio · 🤖 autônomo

---

## P0 — Decisões do dono 👤

### P0.1 — Onboarding sem credencial do GitHub para o comprador
Registrado (não deste repositório) em `escala-porteiros/docs/FASE2.md` §P4.y. Exige backend + banco
multi-tenant. Pesquisa própria necessária antes de qualquer código — não iniciar sem ela.

### P0.2 — Quando ligar a busca local como pós-otimização
`escala-porteiros` mediu (20/08) que a recusa de busca local pós-GRASP (07/08) não generaliza para
todo tamanho/forma de escala — 1 de 4 cenários sintéticos achou troca melhoradora. Decisão: ligar
sempre, acima de N pessoas, ou opt-in por cliente? Ver `escala-porteiros/BACKLOG.md` P8.2.

---

## P1 — Construído nesta rodada, aberto para revisão 🔵

| # | Item | Estado |
|---|---|---|
| P1.1 | Repositório criado, Template ativado, Pages configurado | ✅ 20/08 |
| P1.2 | Codebase copiado da trilha genérica já provada, dado zerado | ✅ 20/08 — 407 testes reaproveitados |
| P1.3 | `AbaMalha.tsx` — editor de malha pela tela | ✅ 20/08 — ver auditoria abaixo |
| P1.4 | `AbaMensagem.tsx` — editor de mensagem WhatsApp com pré-visualização | ✅ 20/08 — ver auditoria abaixo |
| P1.5 | Varredura de 200 malhas sintéticas, zero falhas | ✅ 20/08 — `malha.varredura.test.ts` |
| P1.6 | Auditoria independente (agente cego) das duas telas novas | ✅ 20/08 — achou 1 defeito real (`config.mensagens` sumia em silêncio ao recarregar), corrigido com 2 testes de regressão. Ver `src/dados/carregar.ts` |
| P1.7 | Comparação lado a lado: mensagem WhatsApp em produção × neste repositório | ✅ 20/08 |

## P2 — Declarado, não construído ⚪

| # | Item | Por quê fica pendente |
|---|---|---|
| P2.1 | Horário real decidindo o encaixe (hoje é só rótulo informativo) | Mudança de motor, não de dado — fora do escopo desta rodada. Ver nota em `RegraMalha` (tipos.ts) |
| P2.2 | Teste de componente (interação de tela) para AbaMalha/AbaMensagem | Cobertas por typecheck + varredura de domínio; falta teste de clique/preenchimento |
| P2.3 | Evento avulso numa data específica (não recorrente) | Estava no desenho original do P4.w (`escala-porteiros/docs/FASE2.md`), não construído ainda |

## Como usar este arquivo

- Item concluído sai daqui e vira registro no histórico (`DIARIO_DE_BORDO.md`, quando existir).
- Item de P0 nunca é decidido pelo assistente sozinho.
