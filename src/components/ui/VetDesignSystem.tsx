import React from 'react';

interface VetPageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Contenedor general de página con fondo gris hielo (#F8FAFC) y tipografía oscura (#0F172A).
 */
export const VetPageLayout: React.FC<VetPageLayoutProps> = ({ children, className = '' }) => (
  <div className={`min-h-screen bg-vet-canvas text-vet-ink antialiased ${className}`}>
    {children}
  </div>
);

interface VetSurfaceCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Tarjeta blanca (#FFFFFF) con borde fino y discreto (#E2E8F0).
 */
export const VetSurfaceCard: React.FC<VetSurfaceCardProps> = ({ children, className = '' }) => (
  <div className={`bg-vet-surface border border-vet-border rounded-[20px] shadow-xs ${className}`}>
    {children}
  </div>
);

interface VetActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

/**
 * Botón de acción principal en esmeralda equilibrado (#0D9488) con contraste WCAG AA y estados hover/focus/disabled.
 */
export const VetActionButton: React.FC<VetActionButtonProps> = ({
  children,
  className = '',
  type = 'button',
  ...props
}) => (
  <button
    type={type}
    className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-vet-action hover:bg-vet-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vet-action/40 disabled:opacity-45 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors cursor-pointer ${className}`}
    {...props}
  >
    {children}
  </button>
);

interface VetWarningAlertProps {
  title: string;
  detail?: string;
  badge?: string;
  className?: string;
}

/**
 * Alerta / estado pendiente o stock crítico (#F59E0B) con tinta accesible (#92400E sobre #FFFBEB, WCAG AA).
 */
export const VetWarningAlert: React.FC<VetWarningAlertProps> = ({
  title,
  detail,
  badge,
  className = '',
}) => (
  <div
    role="status"
    className={`p-3 rounded-xl border border-vet-warning/35 bg-vet-warning-soft text-vet-warning-ink flex items-center justify-between gap-2 text-xs ${className}`}
  >
    <div className="min-w-0">
      <div className="font-bold text-vet-ink truncate">{title}</div>
      {detail && <div className="text-[11px] text-vet-ink-muted truncate">{detail}</div>}
    </div>
    {badge && (
      <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-vet-warning text-vet-ink whitespace-nowrap">
        {badge}
      </span>
    )}
  </div>
);
