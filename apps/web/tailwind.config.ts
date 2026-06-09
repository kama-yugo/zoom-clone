import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#1a1a2e',
        panel: '#16213e',
        card: '#0f3460',
        accent: '#533483',
      },
    },
  },
  plugins: [],
};

export default config;
