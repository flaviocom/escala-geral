/**
 * 🧪 EVENTO SEM ESCALA — dia todo × horário específico, com hora real (S-068/S-069, 20/08/2026).
 *
 * 🔴 POR QUE ESTE ARQUIVO EXISTE. Regra máxima do dono: *"eu não quero um horário fixo ou período
 * fixo. Eu quero que você controle horas mesmo, com data e hora de Brasília, Brasil, sempre."* E,
 * depois: *"se eu colocar um período (manhã, tarde ou noite), é o período. Se eu colocar hora, você
 * tem que conseguir controlar a hora exata, exibir na escala."*
 *
 * Generalização de "Santa Ceia" (nome cravado) para `EventoSemEscala` (nome editável, data
 * editável, dia todo OU horário específico). Este arquivo prova as duas formas, e que elas
 * COEXISTEM sem uma quebrar a outra.
 */
import { describe, expect, it } from 'vitest'
import { gerar } from './gerador'
import { construirGrade } from './malha'
import { validar } from './validacao'
import { conferirPorFora } from './conferencia-independente'
import type { Configuracao, EventoSemEscala, Malha, Pessoa } from './tipos'

const pessoas = (n: number): Pessoa[] =>
  Array.from({ length: n }, (_, i) => ({ id: `p${i + 1}`, nome: `Pessoa ${i + 1}`, ativo: true, restricoes: {} }))

const CONFIG_BASE: Omit<Configuracao, 'malhaPadrao' | 'eventosSemEscala'> = {
  versao: 1,
  capacidadePadrao: 2,
  identidade: { titulo: 'Teste', subtitulo: 'Teste', logo: '', pessoa: { singular: 'Pessoa', plural: 'pessoas' } },
}

function gerarComEvento(malha: Malha, eventos: EventoSemEscala[], elenco = pessoas(10)) {
  const inicio = '2026-09-01'
  const fim = '2026-09-30'
  const grade = construirGrade({ inicio, fim, malha, capacidadePadrao: 2, eventosSemEscala: eventos })
  const config: Configuracao = { ...CONFIG_BASE, malhaPadrao: malha, eventosSemEscala: eventos }
  const r = gerar({
    inicio, fim, grade, pessoas: elenco, elenco: elenco.map((p) => p.id), malha,
    ultimaEscalaAnterior: {}, escalasPorMesAnterior: {},
  })
  if (!r.ok) throw new Error(r.motivo)
  return { bloco: r.bloco, config }
}

describe('evento sem escala — DIA TODO (comportamento original, preservado)', () => {
  const malha: Malha = { regras: [{ diaSemana: 2, turnos: ['MANHA', 'TARDE', 'NOITE'] }] } // toda terça

  it('bloqueia os 3 turnos daquele dia, com o NOME DO EVENTO (não "Santa Ceia" cravado)', () => {
    const { bloco } = gerarComEvento(malha, [{ nome: 'Manutenção elétrica', data: '2026-09-08', diaTodo: true }])
    const doDia = bloco.turnos.filter((t) => t.data === '2026-09-08')
    expect(doDia).toHaveLength(1) // dia todo = UM marcador, não um por turno
    expect(doDia[0].santaCeia).toBe(true)
    expect(doDia[0].rotulo).toBe('Manutenção elétrica')
    expect(doDia[0].pessoas).toEqual([])
  })

  it('duas datas, dois nomes diferentes — cada evento é independente', () => {
    const { bloco } = gerarComEvento(malha, [
      { nome: 'Santa Ceia', data: '2026-09-01', diaTodo: true },
      { nome: 'Manutenção do gerador', data: '2026-09-08', diaTodo: true },
    ])
    expect(bloco.turnos.find((t) => t.data === '2026-09-01')?.rotulo).toBe('Santa Ceia')
    expect(bloco.turnos.find((t) => t.data === '2026-09-08')?.rotulo).toBe('Manutenção do gerador')
  })
})

describe('evento sem escala — HORÁRIO ESPECÍFICO (novo, regra máxima)', () => {
  it('malha com hora real: bloqueia só o turno cuja hora cai na janela, o resto do dia segue normal', () => {
    const malha: Malha = {
      regras: [
        { diaSemana: 2, turnos: ['MANHA'], horaInicio: '08:00', horaFim: '10:00' },
        { diaSemana: 2, turnos: ['NOITE'], horaInicio: '20:00', horaFim: '22:00' },
      ],
    }
    // Bloqueia só das 08h às 10h — atinge a MANHÃ (08h), não a NOITE (20h).
    const { bloco, config } = gerarComEvento(malha, [
      { nome: 'Vistoria do corpo de bombeiros', data: '2026-09-08', diaTodo: false, horaInicio: '08:00', horaFim: '10:00' },
    ])
    const doDia = bloco.turnos.filter((t) => t.data === '2026-09-08')
    expect(doDia).toHaveLength(2) // os DOIS turnos sobrevivem como registros — um bloqueado, um normal
    const manha = doDia.find((t) => t.tipo === 'MANHA')!
    const noite = doDia.find((t) => t.tipo === 'NOITE')!
    expect(manha.santaCeia).toBe(true)
    expect(manha.rotulo).toBe('Vistoria do corpo de bombeiros')
    expect(manha.capacidade).toBe(0)
    expect(noite.santaCeia).toBeUndefined() // NOITE não foi tocada — está fora da janela 08h-10h
    expect(noite.capacidade).toBeGreaterThan(0)

    // As duas réguas concordam: nenhum furo, mesmo com turno comum sobrando no dia do evento —
    // isso é o esperado para horário específico, não um sinal de marca perdida (D9 generalizada).
    const rel = validar({ bloco, pessoas: pessoas(10), ultimaEscalaAnterior: {}, config })
    expect(rel.falhasDuras).toEqual([])
    expect(conferirPorFora(bloco, pessoas(10), config).comFuro).toEqual([])
  })

  it('turno SEM hora real usa a faixa padrão do período para decidir se a janela o atinge', () => {
    // Sem horaInicio/horaFim na regra: MANHA usa a faixa padrão 06h-12h (ver FAIXA_PADRAO_DO_PERIODO).
    const malha: Malha = { regras: [{ diaSemana: 2, turnos: ['MANHA', 'NOITE'] }] }
    const { bloco } = gerarComEvento(malha, [
      { nome: 'Bloqueio da manhã', data: '2026-09-08', diaTodo: false, horaInicio: '07:00', horaFim: '09:00' },
    ])
    const doDia = bloco.turnos.filter((t) => t.data === '2026-09-08')
    const manha = doDia.find((t) => t.tipo === 'MANHA')!
    const noite = doDia.find((t) => t.tipo === 'NOITE')!
    expect(manha.santaCeia).toBe(true) // 07h-09h cai dentro da faixa padrão da manhã (06h-12h)
    expect(noite.santaCeia).toBeUndefined()
  })

  it('janela que não atinge NENHUM turno do dia: o dia segue 100% normal, nada quebra', () => {
    const malha: Malha = { regras: [{ diaSemana: 2, turnos: ['NOITE'] }] } // só noite, sem hora real (18h-24h padrão)
    const { bloco } = gerarComEvento(malha, [
      { nome: 'Reunião de manhã', data: '2026-09-08', diaTodo: false, horaInicio: '08:00', horaFim: '09:00' },
    ])
    const doDia = bloco.turnos.filter((t) => t.data === '2026-09-08')
    expect(doDia).toHaveLength(1)
    expect(doDia[0].santaCeia).toBeUndefined()
    expect(doDia[0].capacidade).toBeGreaterThan(0)
  })
})

describe('hora real da malha propaga para o turno gerado — S-068/S-069', () => {
  it('RegraMalha com horaInicio/horaFim: o Turno gerado carrega a MESMA hora', () => {
    const malha: Malha = { regras: [{ diaSemana: 2, turnos: ['TARDE'], horaInicio: '14:00', horaFim: '16:30' }] }
    const grade = construirGrade({ inicio: '2026-09-01', fim: '2026-09-30', malha, capacidadePadrao: 2 })
    const doDia = grade.filter((t) => t.data === '2026-09-08')
    expect(doDia).toHaveLength(1)
    expect(doDia[0].horaInicio).toBe('14:00')
    expect(doDia[0].horaFim).toBe('16:30')
  })

  it('RegraMalha SEM hora: o Turno gerado não ganha hora nenhuma — só o período, como sempre', () => {
    const malha: Malha = { regras: [{ diaSemana: 2, turnos: ['TARDE'] }] }
    const grade = construirGrade({ inicio: '2026-09-01', fim: '2026-09-30', malha, capacidadePadrao: 2 })
    const doDia = grade.filter((t) => t.data === '2026-09-08')
    expect(doDia[0].horaInicio).toBeUndefined()
    expect(doDia[0].horaFim).toBeUndefined()
  })
})
