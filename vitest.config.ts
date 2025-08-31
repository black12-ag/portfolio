import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'android/',
        'ios/',
        'backend/',
      ],
      thresholds: {
        global: {
          branches: 50,
          functions: 50,
          lines: 60,
          statements: 60
        }
      }
    },
    // Mock browser APIs that don't exist in Node.js
    alias: {
      '@/': path.resolve(__dirname, './src/')
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    target: 'node18'
  }
})
