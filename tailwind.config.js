/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Tokens semánticos principales del sistema VetSoft
        'vet-sidebar': '#0F172A', // Azul petróleo profundo exclusivo para Sidebar y logotipos
        'vet-sidebar-surface': '#1E293B', // Gris carbón para tarjetas internas y estado activo en Sidebar
        'vet-ink': '#0F172A', // Tipografía principal de alto contraste sobre fondos claros
        'vet-ink-muted': '#475569', // Neutro añadido: texto secundario y subtítulos (contraste > 7:1 sobre #F8FAFC)
        'vet-canvas': '#F8FAFC', // Fondo general gris hielo / blanco perlado
        'vet-surface': '#FFFFFF', // Neutro añadido: superficie pura de tarjetas y contenedores
        'vet-border': '#E2E8F0', // Neutro añadido: bordes finos y discretos para tarjetas/tablas
        'vet-action': '#0D9488', // Verde esmeralda exclusivo para botones clave de acción
        'vet-action-hover': '#0F766E', // Estado hover/active oscuro para garantizar contraste AA con texto blanco
        'vet-action-mint': '#10B981', // Variante menta equilibrada del acento de acción
        'vet-warning': '#F59E0B', // Ámbar exclusivo para stock crítico y estados pendientes
        'vet-warning-ink': '#92400E', // Neutro/ámbar oscuro añadido: texto sobre fondo ámbar suave (contraste > 6:1, WCAG AA)
        'vet-warning-soft': '#FFFBEB', // Fondo suave derivado del ámbar para alertas legibles sin saturar
        'vet-divider': '#E2E8F0', // Neutro añadido: divisores de tablas y listas
        'vet-hover': '#F1F5F9', // Neutro añadido: realce sutil en filas e ítems secundarios
        'vet-placeholder': '#64748B', // Neutro añadido: placeholders legibles sobre #FFFFFF
        'vet-danger': '#DC2626', // Borde/acento de error o cancelación
        'vet-danger-ink': '#B91C1C', // Texto de error con contraste AA sobre fondo suave
        'vet-danger-soft': '#FEF2F2', // Fondo suave de error o cancelación

        // Alias de compatibilidad existentes
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
