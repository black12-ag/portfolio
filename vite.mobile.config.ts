import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// Mobile-only Vite config. Uses a mobile-specific HTML entry that loads main-mobile.tsx
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      util: 'util',
      buffer: 'buffer',
      events: 'events',
      url: 'url',
      vm: 'vm-browserify',
    },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    modulePreload: false, // avoid preloading unrelated chunks
    rollupOptions: {
      // Emit dist/index.html from index.mobile.html
      input: {
        index: path.resolve(__dirname, 'index.mobile.html')
      },
      treeshake: true,
      output: {
        manualChunks: undefined,
      }
    },
    chunkSizeWarningLimit: 500,
    reportCompressedSize: false
  },
  define: {
    'import.meta.env.VITE_MOBILE_BUILD': '"true"',
    global: 'globalThis',
    'process.env': {},
    Buffer: ['buffer', 'Buffer'],
  }
}));


