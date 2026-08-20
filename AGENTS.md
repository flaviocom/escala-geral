# AGENTS.md — escala-geral

> **Roteador do projeto.** Leia isto primeiro, sempre — é o que permite a qualquer IA (ou pessoa)
> assumir a sessão sem o Flavio reexplicar nada. Regra de portabilidade entre IAs:
> `D:\Antigravity\_padroes-globais\PORTABILIDADE_ENTRE_IAS.md`.

## O que é este projeto

Motor genérico de geração de escala de turnos — dias, horários e mensagens de lembrete
configuráveis **pela tela**, não por código. Nasceu como fork do `escala-porteiros` (escala de
porteiros de uma congregação, em produção desde 08/08/2026), no exato momento em que o Flavio
decidiu vender o motor para qualquer tipo de operação (portaria, segurança, plantão — "qualquer
tipo de propósito", palavras dele, 20/08/2026).

**Regra máxima de escopo:** nada de vocabulário ou dado específico de um cliente entra em `src/`.
O `escala-porteiros` provou isso com o portão `npm run generico` — este repositório NASCE já
limpo, a partir daquele ponto provado, e o mesmo portão continua ligado aqui.

## Onde roda

| | |
|---|---|
| Site (demonstração, escala zerada) | **https://flaviocom.github.io/escala-geral/** |
| Área administrativa | **https://flaviocom.github.io/escala-geral/#/admin** — sem senha nem token para gerar/ajustar/validar; token só é necessário para *publicar* de verdade |
| Repositório | [`flaviocom/escala-geral`](https://github.com/flaviocom/escala-geral) — público, marcado como **Template Repository** |
| Publicação | GitHub Pages, branch `main` + `/docs`, via `.github/workflows/publicar.yml` |
| Repositório-irmão (produção real, NÃO tocar a partir daqui) | [`flaviocom/escala-porteiros`](https://github.com/flaviocom/escala-porteiros) |

## Como retomar

1. Leia este arquivo, depois [`ESTADO.md`](ESTADO.md) e [`BACKLOG.md`](BACKLOG.md).
2. Pré-voo: `node D:/Antigravity/_padroes-globais/scripts/pre-voo.mjs .`
3. `npm install && npm run gate` — mesmo padrão de qualidade do `escala-porteiros` (typecheck,
   suíte completa, portões de método, build).

## Regra de arquitetura — o que É e o que NÃO É este repositório

- **É** o motor genérico, o codebase que um comprador futuro clona (via "Use this template" ou
  `POST /repos/flaviocom/escala-geral/generate`).
- **É** a prova viva de que as telas de malha e mensagem funcionam antes de decidir se valem a
  pena no `escala-porteiros` de produção.
- **NÃO É** um cliente disfarçado — a escala aqui é **zerada de propósito**, para teste.
- **NÃO muda o motor de produção.** Nenhuma mudança feita aqui é portada automaticamente para
  `escala-porteiros` — isso é decisão explícita e separada do dono, item a item.
- **NÃO resolve** onboarding sem credencial do GitHub para o comprador final — isso está registrado
  como pendência de pesquisa em `escala-porteiros/docs/FASE2.md` (P4.y), não neste repositório.

## Convenções herdadas do `escala-porteiros`

Mesmo domínio (`src/dominio/`), mesmo motor (GRASP + Jain + validador independente — pesquisa em
`escala-porteiros/docs/superpowers/specs/PESQUISA_2026-08-07-metodos-rostering.md`), mesmos
portões de gate, mesma disciplina de documentação (pt-BR, `arquivo:linha`, nada apagado). Diferença
principal: **uma trilha só** (não há mais bifurcação igreja/genérico — este repositório inteiro É
a trilha genérica).
