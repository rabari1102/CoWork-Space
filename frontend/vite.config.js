import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * The Phosphor icon package declares four font formats in its @font-face.
 * Every browser this app targets reads woff2 and never requests the rest, but
 * Vite still copies them into the build - including a 3 MB legacy SVG font.
 * Dropping the other sources before Vite resolves the urls keeps them out.
 */
function phosphorWoff2Only() {
  return {
    name: 'phosphor-woff2-only',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('@phosphor-icons') || !id.endsWith('.css')) return null;
      return code.replace(
        /,\s*url\(["']\.\/Phosphor\.(?:woff(?!2)|ttf|svg)[^)]*\)\s*format\([^)]+\)/g,
        '',
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), phosphorWoff2Only()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
