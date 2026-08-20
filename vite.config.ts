/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ⚠️ `base` NÃO é detalhe: o GitHub Pages serve este projeto sob /escala-geral/. Sem isto, todo
// caminho de asset funciona no localhost e quebra no ar.
export default defineConfig({
  base: '/escala-geral/',
  publicDir: 'public',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5174,
  },
  build: {
    outDir: 'docs',
    // Ver a nota equivalente no escala-porteiros: `docs/` também guarda o pré-voo, o índice de
    // solicitações e o histórico — limpeza automática do Vite apagaria esses documentos.
    emptyOutDir: false,
    sourcemap: false,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
