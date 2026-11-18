/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Grupos semánticos principales del sistema de diseño VetSoft
        brand: {
          DEFAULT: '#0F172A', // Azul petróleo profundo: Sidebar, logotipos y títulos principales
          elevated: '#1E293B', // Gris carbón: contenedores internos e ítem activo del Sidebar
          ink: '#0F172A', // Texto principal antracita/marino de alto contraste
          muted: '#475569', // Neutro añadido: texto secundario legible (> 7:1 sobre #F8FAFC)
        },
        surface: {
          canvas: '#E2E8F0', // Fondo general gris pizarra suave (anti-fatiga visual, sin deslumbramiento)
          card: '#F1F5F9', // Tarjetas y contenedores gris perlado suave (sin blanco puro agresivo)
          border: '#B8C5D6', // Bordes finos y serenos para separar tarjetas y tablas
          hover: '#DCE4EE', // Realce sutil de filas e ítems secundarios
        },
        action: {
          DEFAULT: '#0D9488', // Verde esmeralda equilibrado: botones clave de acción
          hover: '#0F766E', // Estado hover/active oscuro (contraste WCAG AA con texto blanco)
          mint: '#10B981', // Variante menta equilibrada
        },
        warning: {
          DEFAULT: '#F59E0B', // Ámbar exclusivo para stock crítico y estados pendientes
          ink: '#92400E', // Neutro/ámbar oscuro añadido: texto AA (> 6:1) sobre fondo suave
          soft: '#FEF3C7', // Fondo ámbar mate suave para alertas sin brillo excesivo
        },

        // Tokens planos de compatibilidad (mismo origen de verdad)
        'vet-sidebar': '#0F172A',
        'vet-sidebar-surface': '#1E293B',
        'vet-ink': '#0F172A',
        'vet-ink-muted': '#475569',
        'vet-canvas': '#E2E8F0',
        'vet-surface': '#F1F5F9',
        'vet-border': '#B8C5D6',
        'vet-action': '#0D9488',
        'vet-action-hover': '#0F766E',
        'vet-action-mint': '#10B981',
        'vet-warning': '#F59E0B',
        'vet-warning-ink': '#92400E',
        'vet-warning-soft': '#FEF3C7',
        'vet-divider': '#B8C5D6',
        'vet-hover': '#DCE4EE',
        'vet-placeholder': '#64748B',
        'vet-danger': '#DC2626',
        'vet-danger-ink': '#B91C1C',
        'vet-danger-soft': '#FEE2E2',
        'vet-navy': '#0F172A',
        'vet-slate': '#1E293B',
        'vet-emerald': '#0D9488',
        'vet-emerald-hover': '#0F766E',
        'vet-mint': '#10B981',
        'vet-ice': '#E2E8F0',
        'vet-muted': '#475569',
        'vet-amber': '#F59E0B',
        'vet-amber-ink': '#92400E',
        'vet-amber-soft': '#FEF3C7',
      },
    },
  },
  plugins: [],
};
