/**
 * Resolve `config.identidade.logo` para uma URL que `<img src>` aceita — S-068/S-069, 20/08/2026.
 *
 * Duas convenções coexistem: `data:image/...;base64,...` (upload pela tela, `EditorDeLogo` em
 * `Admin.tsx`) e nome de arquivo em `dados/` (convenção antiga, publicado manualmente). Extraído
 * de `App.tsx` para ser testável sem montar o componente inteiro.
 */
export function resolverLogo(logoConfig: string, baseUrl: string): string {
  if (!logoConfig) return ''
  if (logoConfig.startsWith('data:')) return logoConfig
  return `${baseUrl}dados/${logoConfig}`
}
