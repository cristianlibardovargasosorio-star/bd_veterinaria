import React from 'react';

interface VetPageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Contenedor general de página con fondo gris hielo (surface.canvas) y tipografía oscura (brand.ink).
 */
export const VetPageLayout: React.FC<VetPageLayoutProps> = ({ children, className = '' }) => (
  <div className={`min-h-screen bg-surface-canvas text-brand-ink antialiased ${className}`}>
    {children}
  </div>
);

interface VetSurfaceCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Tarjeta blanca (surface.card) con borde fino y discreto (surface.border).
 */
export const VetSurfaceCard: React.FC<VetSurfaceCardProps> = ({ children, className = '' }) => (
  <div className={`bg-surface-card border border-surface-border rounded-[20px] shadow-xs ${className}`}>
    {children}
  </div>
);

interface VetActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

/**
 * Botón de acción principal en esmeralda equilibrado (action.DEFAULT) con contraste WCAG AA y estados hover/focus/disabled.
 */
export const VetActionButton: React.FC<VetActionButtonProps> = ({
  children,
  className = '',
  type = 'button',
  ...props
}) => (
  <button
    type={type}
    className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-action hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40 disabled:opacity-45 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors cursor-pointer ${className}`}
    {...props}
  >
    {children}
  </button>
);

interface VetInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Input clínico estándar sobre superficie blanca con foco oscuro sobrio (brand.DEFAULT).
 */
export const VetInput: React.FC<VetInputProps> = ({ className = '', ...props }) => (
  <input
    className={`w-full px-4 py-2.5 rounded-xl bg-surface-card border border-surface-border text-brand-ink placeholder:text-brand-muted/70 text-sm focus:border-brand focus:outline-none transition-colors ${className}`}
    {...props}
  />
);

interface VetBadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'warning';
  className?: string;
}

/**
 * Badge compartido: neutro institucional o ámbar exclusivo para pendiente/stock crítico.
 */
export const VetBadge: React.FC<VetBadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
}) => {
  const styles =
    variant === 'warning'
      ? 'bg-warning-soft text-warning-ink border-warning/35'
      : 'bg-surface-canvas text-brand-ink border-surface-border';

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${styles} ${className}`}
    >
      {children}
    </span>
  );
};

interface VetWarningAlertProps {
  title: string;
  detail?: string;
  badge?: string;
  className?: string;
}

/**
 * Alerta de estado pendiente o stock crítico con tinta accesible WCAG AA (warning.ink sobre warning.soft).
 */
export const VetWarningAlert: React.FC<VetWarningAlertProps> = ({
  title,
  detail,
  badge,
  className = '',
}) => (
  <div
    role="status"
    className={`p-3 rounded-xl border border-warning/35 bg-warning-soft text-warning-ink flex items-center justify-between gap-2 text-xs ${className}`}
  >
    <div className="min-w-0">
      <div className="font-bold text-brand-ink truncate">{title}</div>
      {detail && <div className="text-[11px] text-brand-muted truncate">{detail}</div>}
    </div>
    {badge && (
      <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-warning text-brand-ink whitespace-nowrap">
        {badge}
      </span>
    )}
  </div>
);
