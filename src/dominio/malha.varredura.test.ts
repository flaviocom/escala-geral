/**
 * 🧪 VARREDURA DE MALHA — toda forma de dias/turnos/recorrência, não só a da igreja.
 *
 * 🔴 POR QUE ESTE ARQUIVO EXISTE. S-068/S-069, 20/08/2026 — o Flavio pediu "zero margem de erro de
 * variação de dias/turnos/horários" antes de vender o motor para qualquer tipo de operação.
 * `variacoes.test.ts` já varre toda combinação de RESTRIÇÃO DE PESSOA contra a malha fixa da
 * igreja; este arquivo varre o eixo que faltava: a MALHA em si, agora que ela é dado editável
 * (`AbaMalha.tsx`) e pode assumir qualquer forma que um comprador desenhar.
 *
 * Mesmo contrato de `variacoes.test.ts`: o gerador devolve `ok:true` com escala que passa nas DUAS
 * réguas (`validar`, o catálogo duro; `conferirPorFora`, que nem importa `regras.ts`), OU declara
 * `ok:false` — nunca uma meia-escala com cara de sucesso.
 */
import { describe, expect, it } from 'vitest'
import { gerar } from './gerador'
import { construirGrade } from './malha'
import { validar } from './validacao'
import { conferirPorFora } from './conferencia-independente'
import type { Configuracao, Malha, Pessoa, RegraMalha, TipoTurno } from './tipos'

const TURNOS: TipoTurno[] = ['MANHA', 'TARDE', 'NOITE']

/** PRNG semeado — mesma técnica de `gerador.ts` (mulberry32), para a varredura ser reproduzível. */
function sorteioSemeado(semente: number): () => number {
  let a = semente >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Uma malha sintética aleatória — subconjunto de dias, turnos e recorrência variados. */
function malhaAleatoria(rnd: () => number): Malha {
  const regras: RegraMalha[] = []
  for (let dia = 0; dia < 7; dia++) {
    if (rnd() < 0.35) continue // nem todo dia tem evento — malha esparsa é o caso comum
    const nTurnos = 1 + Math.floor(rnd() * 3)
    const turnos = [...TURNOS].sort(() => rnd() - 0.5).slice(0, nTurnos)
    const regra: RegraMalha = { diaSemana: dia, turnos }
    const forma = rnd()
    if (forma < 0.25) regra.somenteOcorrencia = 1 + Math.floor(rnd() * 4) // ex.: "1º sábado"
    else if (forma < 0.5) { regra.cadaNDias = 7 * (1 + Math.floor(rnd() * 4)); regra.ancora = '2026-09-01' }
    if (rnd() < 0.3) regra.capacidade = 1 + Math.floor(rnd() * 5)
    regras.push(regra)
  }
  // Malha vazia (todo dia pulado) não é um caso interessante de testar aqui — força ao menos 1 dia.
  if (regras.length === 0) regras.push({ diaSemana: Math.floor(rnd() * 7), turnos: ['NOITE'] })
  return { regras }
}

function elencoAleatorio(rnd: () => number, n: number): Pessoa[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `p${i + 1}`,
    nome: `Pessoa ${i + 1}`,
    ativo: true,
    restricoes: rnd() < 0.15 ? { tetoMensal: 2 + Math.floor(rnd() * 3) } : {},
  }))
}

const CONFIG_BASE: Omit<Configuracao, 'malhaPadrao'> = {
  versao: 1,
  capacidadePadrao: 2,
  eventosSemEscala: [],
  identidade: { titulo: 'Teste', subtitulo: 'Teste', logo: '', pessoa: { singular: 'Pessoa', plural: 'pessoas' } },
}

describe('varredura SEMEADA de malha — 2000 formas sintéticas, o mesmo contrato de sempre', () => {
  // 🔴 "Este motor deve ser exaustivamente testado e muito mais parrudo que o do escala-porteiros"
  // — o Flavio, 20/08/2026. Subido de 200 para 2000 no mesmo pedido; elenco até 60 (era 26).
  const N = 2000
  const rnd = sorteioSemeado(20260820)
  const falhas: string[] = []
  let geradas = 0
  let declaradasImpossiveis = 0

  for (let i = 0; i < N; i++) {
    const malha = malhaAleatoria(rnd)
    const elenco = elencoAleatorio(rnd, 6 + Math.floor(rnd() * 55))
    const inicio = '2026-09-01'
    const fim = '2026-11-30'
    const grade = construirGrade({ inicio, fim, malha, capacidadePadrao: CONFIG_BASE.capacidadePadrao })
    const config: Configuracao = { ...CONFIG_BASE, malhaPadrao: malha }

    const r = gerar({
      inicio, fim, grade, pessoas: elenco,
      elenco: elenco.map((p) => p.id), malha,
      ultimaEscalaAnterior: {}, escalasPorMesAnterior: {},
    })

    if (!r.ok) {
      // Declarar impossível é uma saída LEGÍTIMA (elenco pequeno demais para a malha sorteada) —
      // o que este teste proíbe é uma escala PARCIAL disfarçada de sucesso.
      declaradasImpossiveis++
      expect(r.motivo).toBeTruthy()
      continue
    }
    geradas++

    const rel = validar({ bloco: r.bloco, pessoas: elenco, ultimaEscalaAnterior: {}, config })
    if (rel.falhasDuras.length > 0) {
      falhas.push(`malha #${i}: régua dura reprovou — ${rel.falhasDuras.map((f) => f.id).join(',')}`)
    }
    const fora = conferirPorFora(r.bloco, elenco, config)
    if (fora.comFuro.length > 0) {
      falhas.push(`malha #${i}: conferência independente achou furo — ${fora.comFuro.map((a) => a.promessa).join(',')}`)
    }
  }

  it(`${N} malhas sintéticas: gera por inteiro E passa nas duas réguas, ou declara impossível — nunca meia-escala`, () => {
    expect(falhas).toEqual([])
  })

  it('a varredura testou de verdade (não só declarou impossível o tempo todo)', () => {
    expect(geradas).toBeGreaterThan(N * 0.5)
    expect(declaradasImpossiveis).toBeLessThan(N)
  })
})

/**
 * CASOS-LIMITE EXPLÍCITOS — não sorteados, escolhidos por serem a classe de entrada que costuma
 * quebrar geradores gulosos (ver `PESQUISA_2026-08-07-metodos-rostering.md` §4). A varredura
 * semeada acima cobre a MÉDIA; estes cobrem as PONTAS.
 */
describe('casos-limite — as pontas que a varredura semeada não visita por acaso', () => {
  function rodar(elenco: Pessoa[], malha: Malha, inicio: string, fim: string, capacidadePadrao = 2) {
    const grade = construirGrade({ inicio, fim, malha, capacidadePadrao })
    const config: Configuracao = { ...CONFIG_BASE, capacidadePadrao, malhaPadrao: malha }
    const r = gerar({
      inicio, fim, grade, pessoas: elenco, elenco: elenco.map((p) => p.id), malha,
      ultimaEscalaAnterior: {}, escalasPorMesAnterior: {},
    })
    return { r, grade, config }
  }

  it('malha MÁXIMA — os 7 dias, os 3 turnos, todo dia — não trava nem estoura', () => {
    const malha: Malha = { regras: [0, 1, 2, 3, 4, 5, 6].map((d) => ({ diaSemana: d, turnos: TURNOS as TipoTurno[] })) }
    const elenco = elencoAleatorio(sorteioSemeado(1), 40)
    const { r, config } = rodar(elenco, malha, '2026-09-01', '2026-09-30')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(validar({ bloco: r.bloco, pessoas: elenco, ultimaEscalaAnterior: {}, config }).falhasDuras).toEqual([])
    }
  })

  it('elenco de 1 pessoa só — ou gera (ela cobre tudo) ou declara impossível, nunca quebra', () => {
    const malha: Malha = { regras: [{ diaSemana: 0, turnos: ['NOITE'] }] }
    const elenco = elencoAleatorio(sorteioSemeado(2), 1)
    const { r } = rodar(elenco, malha, '2026-09-01', '2026-09-30', 1)
    expect(typeof r.ok).toBe('boolean')
    if (!r.ok) expect(r.motivo).toBeTruthy()
  })

  it('elenco vazio — declara impossível, nunca gera turno fantasma', () => {
    const malha: Malha = { regras: [{ diaSemana: 0, turnos: ['NOITE'] }] }
    const { r } = rodar([], malha, '2026-09-01', '2026-09-30', 1)
    expect(r.ok).toBe(false)
  })

  it('período PLURIANUAL (3 anos) com malha esparsa — não trava o processo', () => {
    const malha: Malha = { regras: [{ diaSemana: 6, turnos: ['NOITE'], somenteOcorrencia: 1 }] } // só 1º sábado do mês
    const elenco = elencoAleatorio(sorteioSemeado(3), 12)
    const t0 = performance.now()
    const { r, config } = rodar(elenco, malha, '2026-01-01', '2028-12-31', 2)
    expect(performance.now() - t0).toBeLessThan(15_000) // não é sobre velocidade ótima, é sobre NÃO TRAVAR
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(conferirPorFora(r.bloco, elenco, config).comFuro).toEqual([])
    }
  })

  it('capacidade 1 (o mínimo que faz sentido) — gera sem dividir por zero em lugar nenhum', () => {
    const malha: Malha = { regras: [{ diaSemana: 0, turnos: ['NOITE'], capacidade: 1 }] }
    const elenco = elencoAleatorio(sorteioSemeado(4), 8)
    const { r, config } = rodar(elenco, malha, '2026-09-01', '2026-12-31', 1)
    expect(r.ok).toBe(true)
    if (r.ok) expect(validar({ bloco: r.bloco, pessoas: elenco, ultimaEscalaAnterior: {}, config }).falhasDuras).toEqual([])
  })

  it('malha com UM dia só (evento único da semana) — o caso mais esparso, real em muitos clientes', () => {
    const malha: Malha = { regras: [{ diaSemana: 2, turnos: ['MANHA'] }] }
    const elenco = elencoAleatorio(sorteioSemeado(5), 10)
    const { r, config } = rodar(elenco, malha, '2026-09-01', '2027-02-28', 2)
    expect(r.ok).toBe(true)
    if (r.ok) expect(conferirPorFora(r.bloco, elenco, config).comFuro).toEqual([])
  })
})
