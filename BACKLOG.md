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
| P1.13 | 3ª auditoria — varredura total de `localStorage`/`sessionStorage`/cookies/IndexedDB no repositório inteiro | ✅ 20/08 — **FECHADO.** Só 4 arquivos usam `localStorage`, todos namespaced; zero uso de sessionStorage/cookies/IndexedDB/service worker; teste de regressão simulado e confirmado que detecta a volta do bug |

## P2 — Declarado, não construído ⚪

| # | Item | Por quê fica pendente |
|---|---|---|
| P2.1 | Horário real decidindo o encaixe (hoje é só rótulo informativo) | Mudança de motor, não de dado — fora do escopo desta rodada. Ver nota em `RegraMalha` (tipos.ts) |
| P2.2 | Teste de componente (interação de tela) para AbaMalha/AbaMensagem/EditorDeLogo | Cobertas por typecheck + varredura de domínio + lógica extraída testável (`logo.ts`); falta teste de clique/preenchimento em si |
| P2.3 | Evento avulso numa data específica (não recorrente) | Estava no desenho original do P4.w (`escala-porteiros/docs/FASE2.md`), não construído ainda |
| P2.4 | ✅ Validação visual autônoma ao vivo — feita em 20/08. Ver "Validação visual" abaixo | Elenco (8 pessoas), identidade custom ("Segurança Alfa"/"Vigilante"), logo, geração real (133 turnos, 17/17 regras), Ajustar, Conferir por fora — todos testados no navegador, não só em teste unitário |
| P2.5 | 🔴 **"Santa Ceia" é conceito de igreja cravado em ~20 pontos** (`Admin.tsx`, `blocos.ts`, `regras.ts`…) — "vêm vigilantes de outra congregação" apareceu literalmente numa escala de segurança predial, testando ao vivo. Já registrado em `escala-porteiros/docs/FASE2.md` P4.z-1 desde 07/08, nunca corrigido | Maior lacuna real de "genérico" hoje — o CONCEITO já é genérico ("dia sem expediente"/feriado), só o rótulo na tela não é. Consertar é reescrever ~20 pontos, não uma tela nova — decisão de prioridade do dono |

## Validação visual — o que foi provado ao vivo em 20/08 (não só teste automatizado)

Gerado um cenário de teste completo, diferente da igreja (identidade "Segurança Alfa · Torre
Comercial — Bloco B", vocabulário "Vigilante"/"vigilantes", 8 pessoas, uma com nome completo e
telefone preenchidos) e confirmado NO NAVEGADOR, com captura de tela:

- ✅ Elenco: acrescentar pessoa, campo "nome completo para o WhatsApp" (vazio por padrão, como pedido)
- ✅ Identidade: título/subtítulo/vocabulário mudam e **aparecem na tabela gerada** ("VIGILANTE" na coluna, não "IRMÃO")
- ✅ Logotipo: upload, pré-visualização, remoção
- ✅ Gerar escala: **133 turnos reais gerados**, piso 6 dias, 17/17 regras conferidas, aprovada sem ressalvas
- ✅ Ajustar: lista de 133 turnos reais, clicável
- ✅ Conferir por fora: segunda régua independente concorda — "nenhum furo nesta escala"
- ✅ Mensagem: pré-visualização com formatação WhatsApp renderizada

**Não testado** (depende de token real do GitHub — limite de segurança, não aberto sem o dono):
Publicar de verdade, e o site PÚBLICO mostrando os dados gerados (só mostra o que foi publicado).

## Como usar este arquivo

- Item concluído sai daqui e vira registro no histórico (`DIARIO_DE_BORDO.md`, quando existir).
- Item de P0 nunca é decidido pelo assistente sozinho.
