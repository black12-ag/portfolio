import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/mobile/__tests__/setup.ts'],
    include: ['src/mobile/__tests__/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'build'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/mobile/__tests__/setup.ts',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        'dist/',
        'build/'
      ]
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    reporter: ['verbose', 'json'],
    outputFile: {
      json: './test-results/mobile-test-results.json'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'import.meta.env.VITE_NODE_ENV': '"test"'
  }
});
