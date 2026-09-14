import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['apps/**/test/**/*.test.{ts,tsx}'],
    environment: 'node',
    restoreMocks: true
  }
});
