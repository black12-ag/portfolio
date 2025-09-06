import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const debugProxy = env.DEBUG_LITEAPI === '1';
  const apiKey = env.VITE_LITEAPI_PRIVATE_KEY || '';

  return ({
  plugins: [
    react(),
    false && env.VITE_ENABLE_SERVICE_WORKER !== 'false' && VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
      manifest: {
        name: 'METAH Travel Platform',
        short_name: 'METAH Travel',
        description: 'Your comprehensive travel booking platform for hotels and experiences',
        theme_color: '#667eea',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      devOptions: {
        enabled: mode === 'development' && env.VITE_PWA_DEV === 'true'
      }
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      ...(env.VITE_MOBILE_BUILD === 'true' ? {
        'react-leaflet': path.resolve(__dirname, './src/stubs/react-leaflet-stub.tsx'),
        'leaflet': path.resolve(__dirname, './src/stubs/leaflet-stub.ts'),
        'react-leaflet-cluster': path.resolve(__dirname, './src/stubs/react-leaflet-cluster-stub.tsx')
      } : {}),
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      util: 'util',
      buffer: 'buffer',
      events: 'events',
      url: 'url',
      vm: 'vm-browserify',
    },
    dedupe: ['react', 'react-dom'],
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  build: {
    target: env.VITE_MOBILE_BUILD === 'true' ? 'es2015' : 'es2020',
    minify: env.VITE_MOBILE_BUILD === 'true' ? 'terser' : 'esbuild',
    terserOptions: env.VITE_MOBILE_BUILD === 'true' ? {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
        pure_funcs: mode === 'production' ? ['console.log', 'console.debug'] : [],
        passes: 2,
        // Prevent renaming of important globals
        keep_infinity: true,
        keep_classnames: true,
        keep_fnames: true
      },
      mangle: {
        safari10: true,
        keep_classnames: true,
        keep_fnames: true,
        // Reserve important names to prevent mangling
        reserved: ['Array', 'Object', 'String', 'Number', 'Boolean', 'Function', 'Symbol', 'Buffer', 'React', 'ReactDOM']
      },
      format: {
        comments: false,
        safari10: true,
        // Preserve important wrapper functions
        wrap_func_args: false
      }
    } : undefined,
    cssMinify: true,
    sourcemap: false,
    modulePreload: { polyfill: true },
    cssCodeSplit: env.VITE_MOBILE_BUILD === 'true' ? false : true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        inlineDynamicImports: true,
        format: 'es'
      }
    },
    chunkSizeWarningLimit: 10000, // Increased since we're bundling everything together
    reportCompressedSize: false,
    assetsInlineLimit: 4096
  },
  preview: {
    port: 8080,
  },
  server: {
    host: "localhost",
    port: 8082,
    strictPort: true,
    cors: {
      origin: process.env.NODE_ENV === 'development' ? [
        "http://localhost:8082", 
        "https://localhost:8082",
        "http://127.0.0.1:8082"
      ] : false,
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: false,
      optionsSuccessStatus: 200
    },
    hmr: { 
      overlay: false,
      port: 8082,
      host: "localhost",
      clientPort: 8082
    },
    proxy: {
      '/api/liteapi': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.warn('LiteAPI backend proxy error:', err.message);
          });
        },
      },
      '/liteapi': {
        target: 'https://api.liteapi.travel',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/liteapi/, '/v3.0'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            if (debugProxy) console.warn('LiteAPI proxy error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            if (apiKey) proxyReq.setHeader('X-API-Key', apiKey);
            proxyReq.setHeader('Accept', 'application/json');
            if (debugProxy) console.log('Proxy →', req.method, req.url, '→', proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            if (debugProxy) console.log('Proxy ←', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react',
      '@radix-ui/react-slot',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-dropdown-menu'
    ],
    exclude: ['speakeasy'],
    force: true
  },
  define: {
    global: 'globalThis',
    'process.env': '{}',
    'process.platform': '"browser"',
    'process.version': '"v18.0.0"',
    'process.browser': 'true',
    Buffer: ['buffer', 'Buffer']
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    drop: env.VITE_MOBILE_BUILD !== 'true' && mode === 'production' ? ['console', 'debugger'] : [],
    keepNames: true,
    treeShaking: true,
    legalComments: 'none',
    target: env.VITE_MOBILE_BUILD === 'true' ? 'es2017' : 'es2020'
  }
  });
});
