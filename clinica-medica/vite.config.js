import { sites } from '@openai/sites-vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === 'seatbelt';

export default defineConfig({
  plugins: [react(), sites()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: isCodexSeatbeltSandbox
      ? {
          useFsEvents: false,
          usePolling: true,
        }
      : undefined,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
});
