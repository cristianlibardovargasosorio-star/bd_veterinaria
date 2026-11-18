/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'vet-navy': '#0F172A',
        'vet-slate': '#1E293B',
        'vet-emerald': '#0D9488',
        'vet-emerald-hover': '#0F766E',
        'vet-mint': '#10B981',
        'vet-ice': '#F8FAFC',
        'vet-surface': '#FFFFFF',
        'vet-border': '#E2E8F0',
        'vet-muted': '#475569',
        'vet-amber': '#F59E0B',
        'vet-amber-ink': '#92400E',
        'vet-amber-soft': '#FFFBEB',
      },
    },
  },
  plugins: [],
};
