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
| P1.8 | 🔴 **Cofre e rascunho vazavam entre repositórios** — achado AO VIVO pelo Flavio: `localStorage` cravado como `escala-porteiros:*` colidia por serem a mesma origem (`flaviocom.github.io`) | ✅ 20/08 — chave agora nasce de `import.meta.env.BASE_URL`, isolamento automático por repositório |
| P1.9 | Upload de logotipo pela tela (`EditorDeLogo`) — estava no desenho original (P4.w-5) e tinha ficado fora da primeira rodada | ✅ 20/08 — pesquisa (uploadcare.com, saasui.design) antes de construir; `data:` URI direto em `config.identidade.logo`, publica atômico |
| P1.10 | Botão "Tirar da escala" confundia com "fechar o cartão" (X solto = convenção de fechar) | ✅ 20/08 — ícone pessoa-com-menos + rótulo visível |
| P1.11 | Varredura de malha ampliada — 2000 cenários (era 200), elenco até 60 (era 26), + 6 casos-limite explícitos | ✅ 20/08 — pedido explícito: "muito mais parrudo, exaustivamente testado" |
| P1.12 | 🔴 **2ª auditoria achou uma SEGUNDA colisão da mesma classe** — `App.tsx` gravava `myBrotherId`/`showMyShiftsOnly` sem namespace, mesmo depois da correção do P1.8 | ✅ 20/08 — corrigido dentro das 3 funções de preferência (não em cada chamada); teste `cofre.test.ts` que tinha virado vazio também corrigido, com guarda contra regressão silenciosa |
| P1.13 | 3ª auditoria — varredura total de `localStorage`/`sessionStorage`/cookies/IndexedDB no repositório inteiro | 🔶 em andamento |

## P2 — Declarado, não construído ⚪

| # | Item | Por quê fica pendente |
|---|---|---|
| P2.1 | Horário real decidindo o encaixe (hoje é só rótulo informativo) | Mudança de motor, não de dado — fora do escopo desta rodada. Ver nota em `RegraMalha` (tipos.ts) |
| P2.2 | Teste de componente (interação de tela) para AbaMalha/AbaMensagem/EditorDeLogo | Cobertas por typecheck + varredura de domínio + lógica extraída testável (`logo.ts`); falta teste de clique/preenchimento em si |
| P2.3 | Evento avulso numa data específica (não recorrente) | Estava no desenho original do P4.w (`escala-porteiros/docs/FASE2.md`), não construído ainda |
| P2.4 | Validação de "diferentes tipos de escala completos" além da varredura de malha sintética | A varredura testa FORMA de malha (2000×) com nomes genéricos incrementais ("Pessoa N"); não testa perfis de identidade DISTINTOS (ex.: hospital, segurança, delivery) gerando e publicando escalas completas de ponta a ponta cada um. Honestidade: não foi feito ainda, não só "malha diferente" |

## Como usar este arquivo

- Item concluído sai daqui e vira registro no histórico (`DIARIO_DE_BORDO.md`, quando existir).
- Item de P0 nunca é decidido pelo assistente sozinho.
