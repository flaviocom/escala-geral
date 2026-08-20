import { describe, expect, it } from 'vitest'
import { resolverLogo } from './logo'

describe('resolverLogo — as duas convenções de logo', () => {
  it('vazio: sem logotipo, string vazia', () => {
    expect(resolverLogo('', '/escala-geral/')).toBe('')
  })

  it('data URI (upload pela tela): usada como veio, sem prefixo de pasta', () => {
    const dataUri = 'data:image/png;base64,iVBORw0KGgo='
    expect(resolverLogo(dataUri, '/escala-geral/')).toBe(dataUri)
  })

  it('nome de arquivo (convenção antiga): prefixado com BASE_URL + dados/', () => {
    expect(resolverLogo('logo.png', '/escala-geral/')).toBe('/escala-geral/dados/logo.png')
  })

  it('BASE_URL diferente por repositório — cada cliente aponta para o próprio', () => {
    expect(resolverLogo('logo.png', '/outro-cliente/')).toBe('/outro-cliente/dados/logo.png')
  })
})
