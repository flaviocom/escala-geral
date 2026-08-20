/**
 * MENSAGEM — texto e formatação do lembrete no WhatsApp, editáveis pela tela — S-068/S-069,
 * 20/08/2026 (P4.w).
 *
 * No `escala-porteiros` de produção o texto vive cravado em Python, na VPS
 * (`scripts/vps/lembrete_individual.py`) — mudar uma palavra exige editar código e reimplantar.
 * Aqui o texto é DADO (`config.mensagens`), editado e pré-visualizado na hora.
 *
 * A formatação segue a sintaxe OFICIAL do WhatsApp (confirmada contra o Help Center oficial na
 * pesquisa do S-065): negrito `*texto*`, itálico `_texto_`, riscado `~texto~`, monoespaçado
 * ```texto``` (3 crases). A pré-visualização abaixo RENDERIZA essa sintaxe — não é o texto cru.
 */
import React, { useRef } from 'react'
import { Bold, Italic, Smile, Strikethrough } from 'lucide-react'
import type { Configuracao } from '../dominio/tipos'

const MODELO_PADRAO = {
  resumoSemanal:
    'Olá, {{nome}}! 👋\n\nAqui está a sua escala desta semana:\n{{dias}}\n\nQualquer imprevisto, avise com antecedência. Obrigado por servir! 🙏',
  vespera:
    'Oi, {{nome}}! Passando para lembrar: *amanhã, {{data}}*, é o seu dia. Contamos com você! 🙂',
}

const EMOJIS_RESPEITOSOS = ['🙏', '👋', '🙂', '✅', '📅', '⏰', '💙']

/** Sintaxe oficial do WhatsApp → HTML, só para a pré-visualização (nunca enviado assim). */
function renderizarWhatsApp(texto: string): React.ReactNode[] {
  const linhas = texto.split('\n')
  return linhas.map((linha, i) => {
    const partes: React.ReactNode[] = []
    // ordem importa: riscado, negrito, itálico, monoespaçado — sem sobreposição de marcador
    const regex = /(~[^~]+~|\*[^*]+\*|_[^_]+_|```[^`]+```)/g
    let ultimo = 0
    let m: RegExpExecArray | null
    let chave = 0
    while ((m = regex.exec(linha))) {
      if (m.index > ultimo) partes.push(linha.slice(ultimo, m.index))
      const t = m[0]
      chave++
      if (t.startsWith('~')) partes.push(<s key={chave}>{t.slice(1, -1)}</s>)
      else if (t.startsWith('*')) partes.push(<strong key={chave}>{t.slice(1, -1)}</strong>)
      else if (t.startsWith('_')) partes.push(<em key={chave}>{t.slice(1, -1)}</em>)
      else if (t.startsWith('```')) partes.push(<code key={chave} className="bg-black/5 px-1 rounded">{t.slice(3, -3)}</code>)
      ultimo = m.index + t.length
    }
    if (ultimo < linha.length) partes.push(linha.slice(ultimo))
    return (
      <React.Fragment key={i}>
        {partes}
        {i < linhas.length - 1 && <br />}
      </React.Fragment>
    )
  })
}

const Cartao: React.FC<{ titulo: string; subtitulo?: string; children: React.ReactNode }> = ({ titulo, subtitulo, children }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-5">
    <h3 className="text-base font-semibold text-gray-900">{titulo}</h3>
    {subtitulo && <p className="text-sm text-gray-500 mt-1 mb-4">{subtitulo}</p>}
    {children}
  </div>
)

const EditorDeModelo: React.FC<{
  id: string
  rotulo: string
  ajuda: string
  valor: string
  aoMudar: (v: string) => void
}> = ({ id, rotulo, ajuda, valor, aoMudar }) => {
  const areaRef = useRef<HTMLTextAreaElement>(null)

  const envolver = (marcador: string, fechamento = marcador) => {
    const area = areaRef.current
    if (!area) return
    const [ini, fim] = [area.selectionStart, area.selectionEnd]
    const selecionado = valor.slice(ini, fim) || 'texto'
    const novo = valor.slice(0, ini) + marcador + selecionado + fechamento + valor.slice(fim)
    aoMudar(novo)
    requestAnimationFrame(() => {
      area.focus()
      area.setSelectionRange(ini + marcador.length, ini + marcador.length + selecionado.length)
    })
  }

  const inserirEmoji = (e: string) => {
    const area = areaRef.current
    const pos = area?.selectionStart ?? valor.length
    aoMudar(valor.slice(0, pos) + e + valor.slice(pos))
  }

  return (
    <div className="mb-6">
      <label htmlFor={id} className="text-sm font-medium text-gray-800">{rotulo}</label>
      <p className="text-xs text-gray-500 mb-2">{ajuda}</p>

      <div className="flex items-center gap-1 mb-1.5" role="toolbar" aria-label={`Formatação de ${rotulo}`}>
        <button type="button" title="Negrito — *texto*" onClick={() => envolver('*')} className="p-1.5 rounded hover:bg-gray-100 text-gray-600">
          <Bold size={15} />
        </button>
        <button type="button" title="Itálico — _texto_" onClick={() => envolver('_')} className="p-1.5 rounded hover:bg-gray-100 text-gray-600">
          <Italic size={15} />
        </button>
        <button type="button" title="Riscado — ~texto~" onClick={() => envolver('~')} className="p-1.5 rounded hover:bg-gray-100 text-gray-600">
          <Strikethrough size={15} />
        </button>
        <span className="w-px h-4 bg-gray-200 mx-1" />
        <span className="text-xs text-gray-400 inline-flex items-center gap-1"><Smile size={13} /> respeitosos:</span>
        {EMOJIS_RESPEITOSOS.map((e) => (
          <button key={e} type="button" onClick={() => inserirEmoji(e)} className="text-base leading-none px-1 hover:scale-110 transition-transform" title={`Inserir ${e}`}>
            {e}
          </button>
        ))}
      </div>

      <textarea
        ref={areaRef}
        id={id}
        name={id}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        rows={5}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />

      <p className="text-xs text-gray-400 mt-1">
        Use <code className="bg-gray-100 px-1 rounded">{'{{nome}}'}</code>,{' '}
        <code className="bg-gray-100 px-1 rounded">{'{{dias}}'}</code> ou{' '}
        <code className="bg-gray-100 px-1 rounded">{'{{data}}'}</code> — trocados pela informação real de cada pessoa na hora de enviar.
      </p>

      <div className="mt-3 flex justify-end">
        <div className="max-w-xs bg-[#dcf8c6] rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm text-gray-900 shadow-sm whitespace-pre-wrap">
          {renderizarWhatsApp(
            valor
              .replaceAll('{{nome}}', 'Maria')
              .replaceAll('{{dias}}', '• domingo, 24/08 (manhã)\n• quarta, 27/08 (noite)')
              .replaceAll('{{data}}', 'quarta, 27/08'),
          )}
        </div>
      </div>
    </div>
  )
}

export const AbaMensagem: React.FC<{ config: Configuracao; aoMudarConfig: (c: Configuracao) => void }> = ({
  config,
  aoMudarConfig,
}) => {
  const mensagens = config.mensagens ?? MODELO_PADRAO

  const mudar = (campo: 'resumoSemanal' | 'vespera', v: string) =>
    aoMudarConfig({ ...config, mensagens: { ...mensagens, [campo]: v } })

  return (
    <Cartao
      titulo="Mensagem do WhatsApp"
      subtitulo="Dois modelos: o resumo semanal e o lembrete de véspera. A pré-visualização (fundo verde) mostra exatamente como a formatação chega no telefone."
    >
      <EditorDeModelo
        id="mensagem-semanal"
        rotulo="Resumo semanal"
        ajuda="Enviado uma vez por semana, com todos os dias em que a pessoa está escalada."
        valor={mensagens.resumoSemanal}
        aoMudar={(v) => mudar('resumoSemanal', v)}
      />
      <EditorDeModelo
        id="mensagem-vespera"
        rotulo="Lembrete de véspera"
        ajuda="Enviado no dia anterior a cada turno da pessoa."
        valor={mensagens.vespera}
        aoMudar={(v) => mudar('vespera', v)}
      />
    </Cartao>
  )
}
