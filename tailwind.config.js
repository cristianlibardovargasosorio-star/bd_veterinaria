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
          canvas: '#F8FAFC', // Fondo general gris hielo / blanco perlado
          card: '#FFFFFF', // Neutro añadido: tarjetas, modales y tablas
          border: '#E2E8F0', // Neutro añadido: bordes finos y discretos
          hover: '#F1F5F9', // Neutro añadido: realce sutil de filas e ítems
        },
        action: {
          DEFAULT: '#0D9488', // Verde esmeralda equilibrado: botones clave de acción
          hover: '#0F766E', // Estado hover/active oscuro (contraste WCAG AA con texto blanco)
          mint: '#10B981', // Variante menta equilibrada
        },
        warning: {
          DEFAULT: '#F59E0B', // Ámbar exclusivo para stock crítico y estados pendientes
          ink: '#92400E', // Neutro/ámbar oscuro añadido: texto AA (> 6:1) sobre fondo suave
          soft: '#FFFBEB', // Fondo suave derivado del ámbar para alertas legibles
        },

        // Tokens planos de compatibilidad (mismo origen de verdad)
        'vet-sidebar': '#0F172A',
        'vet-sidebar-surface': '#1E293B',
        'vet-ink': '#0F172A',
        'vet-ink-muted': '#475569',
        'vet-canvas': '#F8FAFC',
        'vet-surface': '#FFFFFF',
        'vet-border': '#E2E8F0',
        'vet-action': '#0D9488',
        'vet-action-hover': '#0F766E',
        'vet-action-mint': '#10B981',
        'vet-warning': '#F59E0B',
        'vet-warning-ink': '#92400E',
        'vet-warning-soft': '#FFFBEB',
        'vet-divider': '#E2E8F0',
        'vet-hover': '#F1F5F9',
        'vet-placeholder': '#64748B',
        'vet-danger': '#DC2626',
        'vet-danger-ink': '#B91C1C',
        'vet-danger-soft': '#FEF2F2',
        'vet-navy': '#0F172A',
        'vet-slate': '#1E293B',
        'vet-emerald': '#0D9488',
        'vet-emerald-hover': '#0F766E',
        'vet-mint': '#10B981',
        'vet-ice': '#F8FAFC',
        'vet-muted': '#475569',
        'vet-amber': '#F59E0B',
        'vet-amber-ink': '#92400E',
        'vet-amber-soft': '#FFFBEB',
      },
    },
  },
  plugins: [],
};
