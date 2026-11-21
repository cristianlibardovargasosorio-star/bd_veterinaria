const KILOGRAMOS_POR_LIBRA = 0.45359237;

export function kilosALibras(kilos: number): number {
  return Number((kilos / KILOGRAMOS_POR_LIBRA).toFixed(2));
}

export function librasAKilos(libras: number): number {
  return Number((libras * KILOGRAMOS_POR_LIBRA).toFixed(2));
}

const formatoLibras = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 });

export function mostrarPesoEnLibras(kilos: number | null | undefined): string {
  return typeof kilos === 'number' && Number.isFinite(kilos) && kilos > 0
    ? `${formatoLibras.format(kilosALibras(kilos))} lb`
    : 'Sin peso registrado';
}
