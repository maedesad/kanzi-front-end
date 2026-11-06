import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return { plugins: [tailwindcss()], server: { proxy: {
    '/api': { target: env.KANZI_API_PROXY_TARGET || 'http://127.0.0.1:8000', changeOrigin: true },
  } } };
});
