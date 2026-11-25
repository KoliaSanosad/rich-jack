import { defineConfig } from 'vite';
export default defineConfig({
  base: './',
  // usePolling: dev-сервер замечает изменения файлов, записанных извне (при синхронизации),
  // и сам перезагружает игру в браузере.
  server: { port: 5173, strictPort: true, host: true, watch: { usePolling: true, interval: 300 } },
  test: { environment: 'node', include: ['tests/**/*.test.js'] },
});
