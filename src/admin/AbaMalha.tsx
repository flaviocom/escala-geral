/**
 * MALHA — quais dias têm evento, com que turnos e horário — S-068/S-069, 20/08/2026 (P4.w).
 *
 * Até aqui a malha vivia cravada em `src/dominio/malha.ts` — trocar um dia de culto exigia editar
 * código e refazer o deploy (`docs/FASE2.md`, P4.w). Esta tela torna isso dado: cada regra descreve
 * um dia da semana, os turnos daquele dia, a recorrência (toda semana / a cada N dias a partir de
 * uma âncora / só na N-ésima ocorrência do mês — "1º sábado", por exemplo) e um rótulo livre.
 *
 * O horário (`horaInicio`/`horaFim`) é hora REAL, sempre Brasília — regra máxima do dono, S-068/S-069,
 * 20/08/2026: viaja para cada `Turno` gerado e decide o encaixe de todo evento de horário específico
 * (ver a nota em `RegraMalha`, tipos.ts, e `turnoNaJanela` em `malha.ts`). O motor de geração não
 * muda nesta tela: ela edita o DADO que ele consome (`config.malhaPadrao`), nunca o algoritmo.
 */
import React, { useState } from 'react'
import { Clock, Plus, Trash2 } from 'lucide-react'
import type { Configuracao, RegraMalha, TipoTurno } from '../dominio/tipos'
import { ROTULO_TURNO } from '../dominio/tipos'
import { NOMES_DIA } from '../dominio/datas'

const TURNOS_POSSIVEIS: TipoTurno[] = ['MANHA', 'TARDE', 'NOITE']

type Recorrencia = 'semanal' | 'quinzenal' | 'ocorrencia'

function recorrenciaDe(r: RegraMalha): Recorrencia {
  if (r.somenteOcorrencia != null) return 'ocorrencia'
  if (r.cadaNDias != null) return 'quinzenal'
  return 'semanal'
}

function regraVazia(): RegraMalha {
  return { diaSemana: 0, turnos: ['NOITE'] }
}

const Cartao: React.FC<{ titulo: string; subtitulo?: string; children: React.ReactNode }> = ({ titulo, subtitulo, children }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-5">
    <h3 className="text-base font-semibold text-gray-900">{titulo}</h3>
    {subtitulo && <p className="text-sm text-gray-500 mt-1 mb-4">{subtitulo}</p>}
    {children}
  </div>
)

export const AbaMalha: React.FC<{ config: Configuracao; aoMudarConfig: (c: Configuracao) => void }> = ({
  config,
  aoMudarConfig,
}) => {
  const regras = config.malhaPadrao.regras
  const [aberta, setAberta] = useState<number | null>(null)

  const mudarRegras = (novas: RegraMalha[]) =>
    aoMudarConfig({ ...config, malhaPadrao: { ...config.malhaPadrao, regras: novas } })

  const mudarRegra = (i: number, muda: (r: RegraMalha) => RegraMalha) =>
    mudarRegras(regras.map((r, j) => (i === j ? muda(r) : r)))

  const acrescentar = () => {
    mudarRegras([...regras, regraVazia()])
    setAberta(regras.length)
  }

  const remover = (i: number) => {
    mudarRegras(regras.filter((_, j) => j !== i))
    if (aberta === i) setAberta(null)
  }

  return (
    <Cartao
      titulo="Malha — dias, turnos e horários"
      subtitulo={`Cada linha é um evento recorrente. "${config.identidade.pessoa.plural}" só é convocado(a) nos dias e turnos daqui — editar aqui não muda nenhuma escala já gerada, só as próximas.`}
    >
      <div className="space-y-2 mb-4">
        {regras.length === 0 && (
          <p className="text-sm text-gray-500 italic">Nenhum evento cadastrado ainda. Acrescente o primeiro abaixo.</p>
        )}
        {regras.map((r, i) => (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setAberta(aberta === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
            >
              <span className="text-sm font-medium text-gray-800">
                {NOMES_DIA[r.diaSemana]}
                {' · '}
                {r.turnos.map((t) => ROTULO_TURNO[t]).join(', ')}
                {r.horaInicio && <span className="text-gray-500 font-normal"> · {r.horaInicio}{r.horaFim ? `–${r.horaFim}` : ''}</span>}
                {r.rotulo && <span className="text-indigo-600 font-normal"> · {r.rotulo}</span>}
              </span>
              <span className="text-xs text-gray-400">{aberta === i ? 'fechar' : 'editar'}</span>
            </button>

            {aberta === i && (
              <div className="px-4 pb-4 pt-1 border-t border-gray-100 grid grid-cols-2 gap-4">
                <label className="text-xs text-gray-600 col-span-2 sm:col-span-1">
                  Dia da semana
                  <select
                    id={`malha-dia-${i}`}
                    name={`malha-dia-${i}`}
                    value={r.diaSemana}
                    onChange={(e) => mudarRegra(i, (x) => ({ ...x, diaSemana: Number(e.target.value) }))}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {NOMES_DIA.map((n, d) => (
                      <option key={d} value={d}>{n}</option>
                    ))}
                  </select>
                </label>

                <label className="text-xs text-gray-600 col-span-2 sm:col-span-1">
                  Recorrência
                  <select
                    id={`malha-recorrencia-${i}`}
                    name={`malha-recorrencia-${i}`}
                    value={recorrenciaDe(r)}
                    onChange={(e) => {
                      const v = e.target.value as Recorrencia
                      mudarRegra(i, (x) => {
                        const { somenteOcorrencia, cadaNDias, ancora, ...resto } = x
                        if (v === 'ocorrencia') return { ...resto, somenteOcorrencia: 1 }
                        if (v === 'quinzenal') return { ...resto, cadaNDias: 14, ancora: hojeISO() }
                        return resto
                      })
                    }}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="semanal">Toda semana</option>
                    <option value="quinzenal">A cada N dias, a partir de uma data</option>
                    <option value="ocorrencia">Só na N-ésima ocorrência do mês (ex.: 1º sábado)</option>
                  </select>
                </label>

                {recorrenciaDe(r) === 'ocorrencia' && (
                  <label className="text-xs text-gray-600">
                    Qual ocorrência do mês
                    <input
                      id={`malha-ocorrencia-${i}`}
                      name={`malha-ocorrencia-${i}`}
                      type="number"
                      min={1}
                      max={5}
                      value={r.somenteOcorrencia ?? 1}
                      onChange={(e) => mudarRegra(i, (x) => ({ ...x, somenteOcorrencia: Number(e.target.value) }))}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </label>
                )}

                {recorrenciaDe(r) === 'quinzenal' && (
                  <>
                    <label className="text-xs text-gray-600">
                      A cada quantos dias
                      <input
                        id={`malha-cadaNDias-${i}`}
                        name={`malha-cadaNDias-${i}`}
                        type="number"
                        min={2}
                        value={r.cadaNDias ?? 14}
                        onChange={(e) => mudarRegra(i, (x) => ({ ...x, cadaNDias: Number(e.target.value) }))}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </label>
                    <label className="text-xs text-gray-600">
                      A partir de qual data (âncora)
                      <input
                        id={`malha-ancora-${i}`}
                        name={`malha-ancora-${i}`}
                        type="date"
                        value={r.ancora ?? ''}
                        onChange={(e) => mudarRegra(i, (x) => ({ ...x, ancora: e.target.value }))}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </label>
                  </>
                )}

                <div className="col-span-2">
                  <span className="text-xs text-gray-600">Turnos deste dia</span>
                  <div className="flex gap-2 mt-1">
                    {TURNOS_POSSIVEIS.map((t) => {
                      const ligado = r.turnos.includes(t)
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() =>
                            mudarRegra(i, (x) => ({
                              ...x,
                              turnos: ligado ? x.turnos.filter((v) => v !== t) : [...x.turnos, t],
                            }))
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                            ligado ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300'
                          }`}
                        >
                          {ROTULO_TURNO[t]}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <label className="text-xs text-gray-600">
                  <span className="inline-flex items-center gap-1"><Clock size={12} /> Horário — início</span>
                  <input
                    id={`malha-inicio-${i}`}
                    name={`malha-inicio-${i}`}
                    type="text"
                    placeholder="09:00"
                    value={r.horaInicio ?? ''}
                    onChange={(e) => mudarRegra(i, (x) => ({ ...x, horaInicio: e.target.value || undefined }))}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </label>
                <label className="text-xs text-gray-600">
                  Horário — fim
                  <input
                    id={`malha-fim-${i}`}
                    name={`malha-fim-${i}`}
                    type="text"
                    placeholder="11:30"
                    value={r.horaFim ?? ''}
                    onChange={(e) => mudarRegra(i, (x) => ({ ...x, horaFim: e.target.value || undefined }))}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </label>

                <label className="text-xs text-gray-600">
                  Rótulo (opcional) — ex.: "TROCA DE TURNO"
                  <input
                    id={`malha-rotulo-${i}`}
                    name={`malha-rotulo-${i}`}
                    type="text"
                    value={r.rotulo ?? ''}
                    onChange={(e) => mudarRegra(i, (x) => ({ ...x, rotulo: e.target.value || undefined }))}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </label>
                <label className="text-xs text-gray-600">
                  Vagas neste evento (vazio = padrão geral)
                  <input
                    id={`malha-capacidade-${i}`}
                    name={`malha-capacidade-${i}`}
                    type="number"
                    min={1}
                    value={r.capacidade ?? ''}
                    onChange={(e) => mudarRegra(i, (x) => ({ ...x, capacidade: e.target.value ? Number(e.target.value) : undefined }))}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </label>

                <div className="col-span-2">
                  <button
                    type="button"
                    onClick={() => remover(i)}
                    className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    <Trash2 size={13} /> Remover este evento da malha
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={acrescentar}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-100"
      >
        <Plus size={15} /> Acrescentar evento à malha
      </button>
    </Cartao>
  )
}

function hojeISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
