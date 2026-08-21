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
| P1.14 | 4ª auditoria — motor de hora real (P2.1/P2.5), agente cego mandado a refutar | ✅ 20/08 — achou **4 defeitos reais**, todos corrigidos com teste de regressão reproduzindo o cenário exato de cada um. Ver "4ª auditoria — hora real" abaixo. 432/432 testes, typecheck/gate/build limpos. **5ª auditoria** (verificação cética das correções) disparada, resultado pendente |

## P2 — Declarado, não construído ⚪

| # | Item | Por quê fica pendente |
|---|---|---|
| P2.1 | ✅ Horário real decidindo o encaixe do evento sem escala | Feito 20/08 — regra máxima do dono. `RegraMalha.horaInicio/horaFim` propaga para `Turno`, evento sem escala pode bloquear DIA TODO ou só um HORÁRIO (sobreposição de intervalo, sempre Brasília). Ver "Regra máxima — hora real" abaixo. **O que NÃO mudou de propósito:** o período (Manhã/Tarde/Noite) continua decidindo `turnosPermitidos` de restrição de pessoa — as duas formas coexistem, como pedido |
| P2.2 | Teste de componente (interação de tela) para AbaMalha/AbaMensagem/EditorDeLogo/formulário de evento | Cobertas por typecheck + varredura de domínio + lógica extraída testável (`logo.ts`); falta teste de clique/preenchimento em si |
| P2.3 | Evento avulso numa data específica (não recorrente) — para a MALHA (não confundir com evento SEM escala, que já é por data) | Estava no desenho original do P4.w (`escala-porteiros/docs/FASE2.md`), não construído ainda |
| P2.4 | ✅ Validação visual autônoma ao vivo — feita em 20/08. Ver "Validação visual" abaixo | Elenco (8 pessoas), identidade custom ("Segurança Alfa"/"Vigilante"), logo, geração real (133 turnos, 17/17 regras), Ajustar, Conferir por fora — todos testados no navegador, não só em teste unitário |
| P2.5 | ✅ **"Santa Ceia" generalizado para `EventoSemEscala`** (nome editável por evento, data editável, dia todo ou horário específico) | Feito 20/08, junto com P2.1 — mesma rodada, mesmo pedido. `construirGrade`, D9 (`regras.ts`), conferência independente, `ScheduleTable.tsx`, `EscalaImagem.tsx` todos generalizados. 428/428 testes, 2 bugs reais achados pelo teste novo (`evento-sem-escala.test.ts`) e corrigidos antes de publicar: semântica de sobreposição errada, e D9 com falso positivo em dia de horário específico |
| P2.6 | Campo de horário da MALHA (`AbaMalha.tsx`, `RegraMalha.horaInicio/horaFim`) é texto livre — sem validação de formato `HH:mm` nem de igualdade `horaInicio === horaFim` | Notado ao corrigir os achados da 4ª auditoria (ela auditou o campo do EVENTO em `Admin.tsx`, que já ganhou essa validação; não cobriu este). Não é o mesmo bug reproduzido — é a mesma classe, num campo diferente. Baixo risco hoje (entrada malformada vira `NaN` na comparação de minutos, que `segmentosDoIntervalo` sempre lê como falso — silencioso, não quebra, mas também não bloqueia o turno que deveria). Registrado, não corrigido |

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

## Regra máxima — hora real, sempre Brasília (20/08/2026)

Palavras do dono, textuais: *"eu não quero um horário fixo ou período fixo. Eu quero que você
controle horas mesmo, com data e hora de Brasília, Brasil, sempre. Entenda isso. Isso é uma regra
máxima."* — e, depois de eu confirmar o desenho: *"se eu colocar um período (manhã, tarde ou
noite), é o período. Se eu colocar hora, você tem que conseguir controlar a hora exata, exibir na
escala e assim por diante."*

**O que existe agora:**
- Cada evento de "dias sem escala" tem **nome editável** (não mais "Santa Ceia" cravado), **data
  editável**, e a escolha **dia todo × só um horário**. Horário real bloqueia só os turnos que se
  SOBREPÕEM à janela — os outros, no mesmo dia, seguem normais.
- `RegraMalha.horaInicio/horaFim` deixaram de ser só informativos: propagam para cada `Turno`
  gerado e aparecem na tela (`ScheduleTable.tsx`), na imagem exportada (`EscalaImagem.tsx`).
- **`HH:mm`, texto puro, nunca `Date`** — decisão de arquitetura, não só estilo: elimina o defeito
  clássico de fuso horário (não há conversão nenhuma para errar). "Sempre Brasília" sai de graça,
  por construção, não por configuração de fuso que alguém possa errar.
- Período (Manhã/Tarde/Noite) **continua existindo e decidindo** `turnosPermitidos` (restrição de
  pessoa) — as duas formas coexistem, como o dono confirmou explicitamente.

**Testado antes de publicar:** `evento-sem-escala.test.ts` (7 casos) achou 2 bugs reais nesta
própria sessão, antes de qualquer auditoria externa — a disciplina de teste funcionou como
desenhada: (1) a primeira versão de `turnoNaJanela` bloqueava só turnos que COMEÇAM dentro da
janela, não que se SOBREPÕEM — um evento 07h-09h não atingia a Manhã padrão (06h-12h) mesmo a
cobrindo inteira; (2) a regra D9 disparava falso positivo num dia de horário específico, porque o
turno comum sobrando (correto) parecia "marcado no bloco mas fora do calendário".

## 4ª auditoria — hora real (20/08/2026)

Agente independente, cego, mandado a refutar o refactor de "hora real" (P2.1/P2.5) acima. Achou 4
defeitos reais — nenhum hipotético, todos provados ao vivo pelo próprio auditor antes de reportar.

1. 🔴 **CRÍTICO — vira-a-noite colapsava a janela em silêncio.** `turnoNaJanela`
   (`src/dominio/malha.ts`) convertia `HH:mm` em minutos e comparava sobreposição assumindo
   `fim > ini`. Um horário que atravessa meia-noite (23:00–01:00 — plantão comum em operação 24h)
   vira `fim < ini` em minutos, e o intervalo colapsava: o evento não bloqueava NADA, sem exceção,
   sem aviso. Provado com dois casos: evento 23h–01h contra turno NOITE padrão (18h–24h, que cobre
   exatamente 23h-24h) não bloqueava; plantão 23h-01h da malha contra evento 00h-02h (deveria
   colidir em 00h-01h) também não bloqueava. **Corrigido:** `segmentosDoIntervalo` parte um
   intervalo que cruza meia-noite em dois pedaços (`[ini,1440)` e `[0,fim)`); `turnoNaJanela` agora
   testa sobreposição pedaço-a-pedaço. 3 testes novos em `evento-sem-escala.test.ts` reproduzem os
   2 cenários do auditor mais um caso "não vaza pro resto do dia".
2. 🔴 **CRÍTICO — a tela aceitava a entrada que detonava o item 1.** `Admin.tsx` só validava campos
   vazios, nunca a relação entre `horaInicio` e `horaFim` — "22:00 às 06:00" (o caso mais natural de
   vira-a-noite) passava direto. **Corrigido, sem proibir o vira-a-noite de propósito:**
   `horaFim < horaInicio` continua sendo aceito (é matematicamente correto agora, pelo item 1);
   só `horaFim === horaInicio` (sem leitura sensata como intervalo) é rejeitado, com mensagem
   visível (`erroEvento`) e uma dica na tela ("Até" pode ser menor que "Das" — vira a noite).
3. 🟡 **MÉDIO — a régua "independente" tinha um ponto cego que a régua principal não tem.**
   `conferencia-independente.ts` §8 usava `.some()` para decidir se um dia estava "coberto" pelo
   evento — bastava UM turno do dia estar marcado. A regra D9 (`regras.ts`) usa `.every()` — exige
   TODOS os turnos do dia marcados, por causa do horário específico (que marca só parte do dia de
   propósito). Provado: dia de evento DIA TODO com um turno marcado certo e outro turno do mesmo
   dia com 2 pessoas escaladas (dado editado à mão) — D9 acusava, `conferirPorFora` não via furo
   nenhum. **Corrigido:** mesmo critério `.every()` nas duas réguas. Teste novo comparando as duas
   no cenário exato.
4. 🟡 **MÉDIO — rótulo cravado sobrou fora da lista corrigida.** `AbaAjustar.tsx` ainda tinha
   "SANTA CEIA" fixo em vez de `turno.rotulo` (o nome editável do evento) — esta tela não estava na
   lista das telas que a rodada anterior disse ter corrigido (`Admin.tsx`, `ScheduleTable.tsx`,
   `EscalaImagem.tsx`). **Corrigido:** `{turno.rotulo || 'DIA SEM ESCALA'}`. Grep no repo inteiro
   confirmou que não sobra mais nenhum rótulo cravado fora de comentários/testes/fixtures.

**Resultado:** 432/432 testes (era 428), typecheck limpo, `npm run generico` limpo, build limpo.
5ª auditoria (verificação cética das 4 correções acima) disparada — resultado ainda pendente no
momento deste registro.

## Como usar este arquivo

- Item concluído sai daqui e vira registro no histórico (`DIARIO_DE_BORDO.md`, quando existir).
- Item de P0 nunca é decidido pelo assistente sozinho.
