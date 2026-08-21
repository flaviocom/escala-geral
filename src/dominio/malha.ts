/**
 * MALHA — quais dias têm culto, e com que turnos.
 *
 * No site anterior isto era código: um `if (diaDaSemana === 0) …` dentro do gerador. E a malha
 * **já mudou uma vez** — na versão da reforma virou terça e sexta à noite, com domingos de manhã a
 * cada 14 dias. Trocar a malha exigiu reescrever o gerador e refazer o deploy.
 *
 * Aqui a malha é **dado**. Trocar dias e turnos é editar configuração, não código.
 */
import { diaDaSemana, diferencaEmDias, ehDataValida, intervaloDeDatas, ocorrenciaNoMes, type DataISO } from './datas'
import type { EventoSemEscala, Malha, TipoTurno, Turno } from './tipos'

export interface OpcoesMalha {
  inicio: DataISO
  fim: DataISO
  malha: Malha
  capacidadePadrao: number
  /** Dias sem escala — dia inteiro ou só um horário. Nome editável por evento. */
  eventosSemEscala?: EventoSemEscala[]
}

/**
 * `HH:mm` → minutos desde meia-noite, só para COMPARAR horários — nunca para exibir nem para
 * construir `Date`. Texto puro entra, número puro sai; nenhum fuso horário é consultado em nenhum
 * passo, então não há fuso para errar (regra máxima: sempre Brasília, sempre horário de parede).
 */
function minutosDoDia(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/**
 * Faixa padrão de cada período, só para decidir se um evento de HORÁRIO ESPECÍFICO atinge um turno
 * que só tem período (sem hora real própria) — ex.: "bloquear 14h-16h" precisa saber se isso cai
 * dentro do que a tela chama de "Tarde". Convenção de casa, declarada aqui, não pesquisada: sem
 * fonte de mercado para "que horas começa a tarde" de um produto que pode ser qualquer operação.
 */
const FAIXA_PADRAO_DO_PERIODO: Record<TipoTurno, [number, number]> = {
  MANHA: [6 * 60, 12 * 60],
  TARDE: [12 * 60, 18 * 60],
  NOITE: [18 * 60, 24 * 60],
}

/**
 * Um intervalo `[ini, fim)` em minutos, partido em pedaços que não atravessam a meia-noite.
 *
 * 🔴 VIRA-NOITE COLAPSAVA A JANELA — quarta auditoria externa, 20/08/2026. `23:00–01:00` (plantão
 * ou evento comum em operação 24h) tem `fim < ini` em minutos — a comparação de sobreposição, que
 * assume `ini < fim`, via consequência tratava o intervalo como vazio, e o bloqueio não bloqueava
 * NADA, em silêncio, sem erro. Provado ao vivo pelo auditor com dois casos: NOITE padrão (18h–24h)
 * contra evento 23h–01h, e plantão 23h–01h contra evento 00h–02h — os dois deveriam colidir e
 * nenhum colidia.
 *
 * `fim > ini`: intervalo comum, um pedaço só. `fim < ini`: atravessa a meia-noite, vira dois
 * pedaços — `[ini, 1440)` e `[0, fim)`.
 *
 * 🔴 `fim === ini` VIROU O MESMO DEFEITO, AO CONTRÁRIO — quinta auditoria externa, 20/08/2026. A
 * primeira versão deste comentário tratava `fim === ini` como vira-a-noite (`[ini,1440)` + `[0,ini)`
 * = o dia INTEIRO menos um instante) e confiava que `Admin.tsx` nunca deixaria essa entrada chegar
 * aqui. Verdade só para `EventoSemEscala` (a tela usa `<input type="time">`, e valida). **Falsa**
 * para `RegraMalha.horaInicio/horaFim` (`AbaMalha.tsx`): campo de texto livre, sem validação
 * nenhuma, que alimenta esta MESMA função via `construirGrade`. Provado ao vivo: uma `RegraMalha`
 * com `horaInicio === horaFim === "10:00"` (erro de digitação plausível — copiar o mesmo horário
 * nos dois campos) bloqueava um evento de horário específico em QUALQUER outra hora do dia, sem
 * relação nenhuma com 10:00 — silencioso, generalizado, exatamente a classe de defeito que esta
 * função inteira existe para não ter. Corrigido tratando `fim === ini` como intervalo VAZIO — zero
 * pedaços, nunca colide com nada. Não há confiança nenhuma numa porta de entrada específica: o
 * caso degenerado agora é inofensivo não importa de onde o dado vem.
 */
function segmentosDoIntervalo(iniMin: number, fimMin: number): Array<[number, number]> {
  if (fimMin === iniMin) return []
  return fimMin > iniMin ? [[iniMin, fimMin]] : [[iniMin, 24 * 60], [0, fimMin]]
}

function segmentosSeSobrepoem(aIni: number, aFim: number, bIni: number, bFim: number): boolean {
  return aIni < bFim && aFim > bIni
}

/**
 * Este turno (com hora real, ou só período) SE SOBREPÕE à janela do evento de horário específico?
 *
 * 🔴 Era "o turno COMEÇA dentro da janela" — bloquear 07h-09h não atingia a Manhã (faixa padrão
 * 06h-12h, começa às 06h) mesmo a Manhã cobrindo o horário inteiro do bloqueio. Achado pelo próprio
 * teste (`evento-sem-escala.test.ts`), não em produção — sobreposição de intervalo é a semântica
 * certa: dois intervalos colidem quando um começa antes do outro terminar, nos dois sentidos.
 */
function turnoNaJanela(tipo: TipoTurno, horaInicioTurno: string | undefined, horaFimTurno: string | undefined, evento: EventoSemEscala): boolean {
  if (evento.horaInicio == null || evento.horaFim == null) return false
  const segmentosEvento = segmentosDoIntervalo(minutosDoDia(evento.horaInicio), minutosDoDia(evento.horaFim))
  const [inicioTurno, fimTurno] =
    horaInicioTurno != null && horaFimTurno != null
      ? [minutosDoDia(horaInicioTurno), minutosDoDia(horaFimTurno)]
      : FAIXA_PADRAO_DO_PERIODO[tipo]
  const segmentosTurno = segmentosDoIntervalo(inicioTurno, fimTurno)
  return segmentosTurno.some(([tIni, tFim]) => segmentosEvento.some(([eIni, eFim]) => segmentosSeSobrepoem(tIni, tFim, eIni, eFim)))
}

/** Uma regra vale nesta data? */
function regraValeEm(regra: Malha['regras'][number], data: DataISO): boolean {
  if (diaDaSemana(data) !== regra.diaSemana) return false

  if (regra.somenteOcorrencia != null && ocorrenciaNoMes(data) !== regra.somenteOcorrencia) return false

  if (regra.cadaNDias != null) {
    if (!regra.ancora) return false
    const delta = diferencaEmDias(regra.ancora, data)
    if (delta < 0 || delta % regra.cadaNDias !== 0) return false
  }
  return true
}

/**
 * Este dia teria culto nesta malha?
 *
 * Exportado para o guarda de continuidade (`conferirBuracoNaEscala`): sem ele, o guarda teria de
 * reimplementar a malha, e fonte dupla é o que produziu metade dos defeitos deste projeto.
 */
export function diaTemCulto(data: DataISO, malha: Malha): boolean {
  return malha.regras.some((r) => regraValeEm(r, data))
}

/**
 * Constrói a grade vazia de turnos do período.
 *
 * Dia de Santa Ceia entra como **um** turno marcado, sem vagas, substituindo os turnos que aquele
 * dia teria. É o que o Flavio descreveu: *"vêm irmãos de outra igreja atender à Santa Ceia, no lugar
 * dos irmãos escalados"*.
 */
export function construirGrade(op: OpcoesMalha): Turno[] {
  /*
    🔴 DATA QUE NÃO EXISTE ENTRAVA E VIRAVA TURNO — quinta auditoria externa, 05/08/2026.

    `ehDataValida` estava escrita, exportada e provada em quatro testes — e não tinha **um único
    chamador em produção**. Medido: com `inicio = "2026-02-31"`, o produto gerava um turno em 31 de
    fevereiro, pulava 01 a 03 de março, e o veredito era *"Aprovada, sem ressalvas."* Nenhuma das
    dezesseis regras confere se a data existe no calendário, e nenhuma tem por quê: isso é conferência
    de ENTRADA, e ela pertence à porta por onde a entrada passa.

    Aqui é essa porta — a única por onde toda geração passa, tanto a da tela quanto a dos scripts.
  */
  if (!ehDataValida(op.inicio)) throw new Error(`Data inicial "${op.inicio}" não existe no calendário.`)
  if (!ehDataValida(op.fim)) throw new Error(`Data final "${op.fim}" não existe no calendário.`)
  for (const e of op.eventosSemEscala ?? [])
    if (!ehDataValida(e.data)) throw new Error(`Data de "${e.nome}" ("${e.data}") não existe no calendário.`)

  // Um evento por data — a última entrada vence se houver duas no mesmo dia (a tela impede isso).
  const eventoPorData = new Map((op.eventosSemEscala ?? []).map((e) => [e.data, e]))
  const turnos: Turno[] = []

  for (const data of intervaloDeDatas(op.inicio, op.fim)) {
    const evento = eventoPorData.get(data)

    if (evento?.diaTodo) {
      // Só marca o dia se ele teria expediente — um evento de dia todo numa data sem
      // nenhum turno previsto não precisa aparecer na escala.
      const teriaExpediente = op.malha.regras.some((r) => regraValeEm(r, data))
      if (teriaExpediente) {
        turnos.push({ data, tipo: 'MANHA', pessoas: [], capacidade: 0, santaCeia: true, rotulo: evento.nome })
      }
      continue
    }

    for (const regra of op.malha.regras) {
      if (!regraValeEm(regra, data)) continue
      for (const tipo of regra.turnos) {
        const bloqueadoPeloEvento = evento != null && turnoNaJanela(tipo, regra.horaInicio, regra.horaFim, evento)
        turnos.push({
          data,
          tipo,
          pessoas: [],
          capacidade: bloqueadoPeloEvento ? 0 : (regra.capacidade ?? op.capacidadePadrao),
          ...(bloqueadoPeloEvento ? { santaCeia: true as const, rotulo: evento!.nome } : regra.rotulo ? { rotulo: regra.rotulo } : {}),
          ...(regra.horaInicio ? { horaInicio: regra.horaInicio } : {}),
          ...(regra.horaFim ? { horaFim: regra.horaFim } : {}),
        })
      }
    }
  }

  // Ordem cronológica estável: por data e, no mesmo dia, manhã → tarde → noite.
  const peso: Record<Turno['tipo'], number> = { MANHA: 0, TARDE: 1, NOITE: 2 }
  return turnos.sort((a, b) => (a.data === b.data ? peso[a.tipo] - peso[b.tipo] : a.data < b.data ? -1 : 1))
}

/**
 * A malha que a congregação usa hoje: dom manhã+noite · qua noite · sáb noite · 1º sáb tarde.
 *
 * 🔴 ESTA CONSTANTE É A FRONTEIRA DA FASE 2 — requisito do dono, 07/08/2026 (S-048):
 * *"é muito importante ser parametrizável (…) o dia da semana e o horário de início e fim; pode se
 * repetir no mesmo dia (…) escala ampla, não religiosa: porteiros de prédio, segurança."*
 *
 * O MODELO (`RegraMalha`) já cobre quase tudo — dois eventos no mesmo dia, "1º sábado do mês"
 * (`somenteOcorrencia`), rótulo livre, capacidade por regra. O que falta, e mora AQUI: (1) a malha
 * é CRAVADA nesta constante em vez de vir da configuração editável na tela; (2) o evento é um TIPO
 * fixo (MANHA/TARDE/NOITE) em vez de horário real de início e fim; (3) não há evento avulso em data
 * específica; (4) o vocabulário (culto/ensaio/Santa Ceia) não é configurável. O desenho completo,
 * com o mapa "já existe × falta", está em `docs/FASE2.md` (§ malha parametrizável).
 */
export const MALHA_ATUAL: Malha = {
  regras: [
    { diaSemana: 0, turnos: ['MANHA', 'NOITE'] },
    { diaSemana: 3, turnos: ['NOITE'] },
    { diaSemana: 6, turnos: ['NOITE'] },
    { diaSemana: 6, turnos: ['TARDE'], somenteOcorrencia: 1, rotulo: 'ENSAIO' },
  ],
}
