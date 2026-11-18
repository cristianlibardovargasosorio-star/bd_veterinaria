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
          muted: '#334155', // Neutro oscuro suave: texto secundario de alto descanso visual (> 7:1)
        },
        surface: {
          canvas: '#CBD5E1', // Fondo general pizarra medio mate (anti-fatiga visual, sin brillo excesivo)
          card: '#E2E8F0', // Tarjetas y contenedores gris pizarra claro mate (cero deslumbramiento)
          border: '#94A3B8', // Bordes nítidos y serenos para separar tarjetas y tablas
          hover: '#CBD5E1', // Realce sutil de filas e ítems secundarios
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
        info: {
          DEFAULT: '#0284C7', // Azul médico informativo para contraste clínico sereno
          ink: '#075985', // Azul petróleo oscuro con contraste WCAG AA sobre fondo suave
          soft: '#DBEAFE', // Azul hielo suave para KPIs y bloques informativos
        },

        // Tokens planos de compatibilidad (mismo origen de verdad)
        'vet-sidebar': '#0F172A',
        'vet-sidebar-surface': '#1E293B',
        'vet-ink': '#0F172A',
        'vet-ink-muted': '#334155',
        'vet-canvas': '#CBD5E1',
        'vet-surface': '#E2E8F0',
        'vet-border': '#94A3B8',
        'vet-action': '#0D9488',
        'vet-action-hover': '#0F766E',
        'vet-action-mint': '#10B981',
        'vet-warning': '#F59E0B',
        'vet-warning-ink': '#92400E',
        'vet-warning-soft': '#FEF3C7',
        'vet-divider': '#94A3B8',
        'vet-hover': '#CBD5E1',
        'vet-placeholder': '#475569',
        'vet-danger': '#DC2626',
        'vet-danger-ink': '#B91C1C',
        'vet-danger-soft': '#FEE2E2',
        'vet-navy': '#0F172A',
        'vet-slate': '#1E293B',
        'vet-emerald': '#0D9488',
        'vet-emerald-hover': '#0F766E',
        'vet-mint': '#10B981',
        'vet-ice': '#CBD5E1',
        'vet-muted': '#334155',
        'vet-amber': '#F59E0B',
        'vet-amber-ink': '#92400E',
        'vet-amber-soft': '#FEF3C7',
      },
    },
  },
  plugins: [],
};
