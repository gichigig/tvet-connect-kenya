import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  esbuild: {
    target: 'esnext',
    // Completely disable type checking in esbuild
    minifyWhitespace: false,
    minifyIdentifiers: false,
    minifySyntax: false,
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false
    },
    watch: {
      // More aggressive file watching exclusions to prevent excessive reloads
      ignored: [
        '**/node_modules/**', 
        '**/dist/**',
        '**/.git/**',
        '**/coverage/**',
        '**/.nyc_output/**',
        '**/test-results/**',
        '**/playwright-report/**'
      ],
      // Reduce polling frequency
      usePolling: false
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
