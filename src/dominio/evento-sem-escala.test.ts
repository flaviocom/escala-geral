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

describe('evento sem escala — VIRA A NOITE (S-068/S-069, quarta auditoria externa, 20/08/2026)', () => {
  it('evento 23h–01h bloqueia a NOITE (faixa padrão 18h–24h) — o intervalo colide, mesmo cruzando a meia-noite', () => {
    const malha: Malha = { regras: [{ diaSemana: 2, turnos: ['NOITE'] }] } // sem hora real: usa a faixa padrão
    const { bloco } = gerarComEvento(malha, [
      { nome: 'Vistoria noturna', data: '2026-09-08', diaTodo: false, horaInicio: '23:00', horaFim: '01:00' },
    ])
    const noite = bloco.turnos.find((t) => t.data === '2026-09-08' && t.tipo === 'NOITE')!
    expect(noite.santaCeia).toBe(true)
    expect(noite.capacidade).toBe(0)
  })

  it('plantão da malha 23h–01h × evento 00h–02h: colidem em 00h–01h, mesmo os dois cruzando a meia-noite', () => {
    const malha: Malha = { regras: [{ diaSemana: 2, turnos: ['NOITE'], horaInicio: '23:00', horaFim: '01:00' }] }
    const { bloco } = gerarComEvento(malha, [
      { nome: 'Bloqueio de madrugada', data: '2026-09-08', diaTodo: false, horaInicio: '00:00', horaFim: '02:00' },
    ])
    const noite = bloco.turnos.find((t) => t.data === '2026-09-08' && t.tipo === 'NOITE')!
    expect(noite.santaCeia).toBe(true)
    expect(noite.capacidade).toBe(0)
  })

  it('plantão 22h–06h × evento 08h–09h da manhã seguinte: NÃO colidem — o vira-noite não vaza pro resto do dia', () => {
    const malha: Malha = { regras: [{ diaSemana: 2, turnos: ['NOITE'], horaInicio: '22:00', horaFim: '06:00' }] }
    const { bloco } = gerarComEvento(malha, [
      { nome: 'Reunião de manhã', data: '2026-09-08', diaTodo: false, horaInicio: '08:00', horaFim: '09:00' },
    ])
    const noite = bloco.turnos.find((t) => t.data === '2026-09-08' && t.tipo === 'NOITE')!
    expect(noite.santaCeia).toBeUndefined()
    expect(noite.capacidade).toBeGreaterThan(0)
  })

  it('🔴 5ª auditoria: RegraMalha com horaInicio === horaFim (erro de digitação) NÃO bloqueia um evento em outra hora do dia', () => {
    // `AbaMalha.tsx` é texto livre, sem a validação que `Admin.tsx` tem para EventoSemEscala — um
    // horário igual nos dois campos da malha chegava aqui e virava "o dia inteiro menos um
    // instante" (mesmo defeito do vira-a-noite, ao contrário). Provado ao vivo pelo 5º auditor:
    // TARDE 10:00–10:00 e um evento de madrugada, sem relação nenhuma, zerava a capacidade da TARDE.
    const malha: Malha = { regras: [{ diaSemana: 2, turnos: ['TARDE'], horaInicio: '10:00', horaFim: '10:00' }] }
    const { bloco } = gerarComEvento(malha, [
      { nome: 'Bloqueio de madrugada', data: '2026-09-08', diaTodo: false, horaInicio: '02:00', horaFim: '03:00' },
    ])
    const tarde = bloco.turnos.find((t) => t.data === '2026-09-08' && t.tipo === 'TARDE')!
    expect(tarde.santaCeia).toBeUndefined()
    expect(tarde.capacidade).toBeGreaterThan(0)
  })

  it('🔴 5ª auditoria: EventoSemEscala com horaInicio === horaFim também fica inerte — não bloqueia turno nenhum', () => {
    const malha: Malha = { regras: [{ diaSemana: 2, turnos: ['MANHA', 'TARDE', 'NOITE'] }] }
    const { bloco } = gerarComEvento(malha, [
      { nome: 'Digitação errada', data: '2026-09-08', diaTodo: false, horaInicio: '10:00', horaFim: '10:00' },
    ])
    const doDia = bloco.turnos.filter((t) => t.data === '2026-09-08')
    expect(doDia).toHaveLength(3)
    for (const t of doDia) {
      expect(t.santaCeia).toBeUndefined()
      expect(t.capacidade).toBeGreaterThan(0)
    }
  })
})

describe('dia todo com turno comum sobrando no mesmo dia (dado editado à mão) — quarta auditoria externa, 20/08/2026', () => {
  it('D9 e conferirPorFora CONCORDAM — a assimetria (.some vs .every) foi corrigida', () => {
    const malha: Malha = { regras: [{ diaSemana: 2, turnos: ['MANHA'] }] }
    const { bloco, config } = gerarComEvento(malha, [{ nome: 'Manutenção', data: '2026-09-08', diaTodo: true }])
    // construirGrade nunca produz isto sozinho (dia todo = um marcador só) — simula edição manual
    // que deixou um turno comum extra, com gente escalada, no dia do evento. Foi este o cenário que
    // o auditor usou para provar a assimetria: D9 acusava, `conferirPorFora` não via furo nenhum.
    const blocoEditado = {
      ...bloco,
      turnos: [...bloco.turnos, { data: '2026-09-08', tipo: 'TARDE' as const, pessoas: ['p1', 'p2'], capacidade: 2 }],
    }
    const rel = validar({ bloco: blocoEditado, pessoas: pessoas(10), ultimaEscalaAnterior: {}, config })
    const porFora = conferirPorFora(blocoEditado, pessoas(10), config)
    expect(rel.falhasDuras.length).toBeGreaterThan(0)
    expect(porFora.comFuro.length).toBeGreaterThan(0)
  })

  it('🔴 5ª auditoria: evento REMOVIDO da config depois de gerar — D9 e conferirPorFora concordam na direção contrária', () => {
    // Gera com o evento presente (marca o turno), depois simula a config editada SEM aquele
    // evento — cenário real: bloco já publicado, dono edita a config depois. A direção "bloco →
    // calendário" (D9, item 3) existia; a mesma direção em `conferirPorFora` não existia até esta
    // rodada.
    const malha: Malha = { regras: [{ diaSemana: 2, turnos: ['MANHA'] }] }
    const { bloco, config } = gerarComEvento(malha, [{ nome: 'Manutenção', data: '2026-09-08', diaTodo: true }])
    const configSemEvento = { ...config, eventosSemEscala: [] }
    const rel = validar({ bloco, pessoas: pessoas(10), ultimaEscalaAnterior: {}, config: configSemEvento })
    const porFora = conferirPorFora(bloco, pessoas(10), configSemEvento)
    expect(rel.falhasDuras.length).toBeGreaterThan(0)
    expect(porFora.comFuro.length).toBeGreaterThan(0)
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
