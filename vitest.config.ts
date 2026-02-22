import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    environmentMatchGlobs: [
      // Use jsdom for component tests
      ['**/*.{test,spec}.{ts,tsx}', 'jsdom'],
      // Use node for lib tests
      ['lib/**/*.{test,spec}.ts', 'node'],
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
