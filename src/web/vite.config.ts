/* Human Tasks:
 * 1. Ensure .env file is created from .env.example with valid values
 * 2. Verify Auth0 configuration values are properly set in .env
 * 3. Confirm API proxy target matches your local API server configuration
 */

import { defineConfig } from 'vite'; // ^4.4.0
import react from '@vitejs/plugin-react'; // ^4.0.0
import tsconfigPaths from 'vite-tsconfig-paths'; // ^4.2.0
import { resolve } from 'path';
import type { UserConfig, ConfigEnv } from 'vite';

// Implements: Web Frontend (4.2.1 Core Components)
// Configures React-based web application with TypeScript support
export default defineConfig(({ mode, command }: ConfigEnv): UserConfig => {
  // Load environment variables based on mode
  const isDevelopment = mode === 'development';

  // Implements: Browser Support (5.1.1 Design Specifications)
  // Configure browser targets for modern browser support
  const browserTargets = [
    'chrome89',
    'firefox89',
    'safari15',
    'edge89'
  ];

  return {
    // Root directory configuration
    root: 'src',
    base: '/',
    publicDir: 'public',

    // Build configuration
    build: {
      outDir: '../dist',
      assetsDir: 'assets',
      sourcemap: true,
      // Implements: Browser Support (5.1.1 Design Specifications)
      target: browserTargets,
      minify: 'terser',
      rollupOptions: {
        output: {
          // Optimize chunk splitting for better caching
          manualChunks: {
            vendor: ['react', 'react-dom'],
            auth: ['@auth0/auth0-react']
          }
        }
      },
      // Enable reporting on chunk sizes
      reportCompressedSize: true,
      chunkSizeWarningLimit: 1000
    },

    // Development server configuration
    server: {
      port: 3000,
      strictPort: true,
      host: true,
      // Hot Module Replacement configuration
      hmr: {
        overlay: true
      },
      // API proxy configuration for local development
      proxy: {
        '/api': {
          target: process.env.VITE_API_BASE_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },

    // Path resolution configuration
    resolve: {
      alias: {
        // Implement path aliases from tsconfig.json
        '@': resolve(__dirname, 'src')
      }
    },

    // Plugin configuration
    plugins: [
      react({
        // Enable Fast Refresh for development
        fastRefresh: isDevelopment,
        // Enable babel for production optimizations
        babel: {
          plugins: [
            ['@babel/plugin-transform-runtime'],
            isDevelopment && 'react-refresh/babel'
          ].filter(Boolean)
        }
      }),
      tsconfigPaths()
    ],

    // Environment variable configuration
    envPrefix: 'VITE_',

    // Dependency optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom'
      ],
      exclude: []
    },

    // Preview server configuration for production builds
    preview: {
      port: 3000,
      strictPort: true,
      host: true
    },

    // Type checking and esbuild configuration
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' }
    },

    // CSS configuration
    css: {
      devSourcemap: true,
      modules: {
        localsConvention: 'camelCase'
      }
    }
  };
});