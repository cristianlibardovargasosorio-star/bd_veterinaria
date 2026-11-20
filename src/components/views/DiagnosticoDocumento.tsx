import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

interface DiagnosticoDocumentoProps {
  consultaId: number;
  mascota: string;
  fecha: string;
  diagnostico: string;
}

export async function crearPdfDiagnostico(mascota: string, fecha: string, diagnostico: string) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 22;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;

  const drawHeader = () => {
    pdf.setFillColor('#0d9488');
    pdf.rect(0, 0, pageWidth, 4, 'F');
    pdf.setTextColor('#0f172a');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('VetSoft', margin, 22);
  };

  drawHeader();
  pdf.setProperties({ title: 'Diagnóstico veterinario', author: 'VetSoft' });
  pdf.setFontSize(23);
  pdf.text('Diagnóstico veterinario', margin, 42);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  const patientLines: string[] = pdf.splitTextToSize(`Mascota: ${mascota}`, contentWidth);
  let y = 55;
  for (const line of [...patientLines, `Fecha de consulta: ${fecha}`]) {
    pdf.text(line, margin, y);
    y += 6;
  }
  pdf.setDrawColor('#cbd5e1');
  pdf.line(margin, y, pageWidth - margin, y);
  y += 11;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Diagnóstico', margin, y);
  y += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);

  const lines: string[] = pdf.splitTextToSize(diagnostico, contentWidth);
  for (const line of lines) {
    if (y > pageHeight - margin) {
      pdf.addPage();
      drawHeader();
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      y = 38;
    }
    pdf.text(line, margin, y);
    y += 6;
  }

  return pdf.output('arraybuffer');
}

export function DiagnosticoDocumento({ consultaId, mascota, fecha, diagnostico }: DiagnosticoDocumentoProps) {
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer>();
  const [pdfError, setPdfError] = useState(false);

  useEffect(() => {
    let active = true;
    setPdfBytes(undefined);
    setPdfError(false);

    crearPdfDiagnostico(mascota, fecha, diagnostico)
      .then((bytes) => {
        if (active) setPdfBytes(bytes);
      })
      .catch(() => {
        if (active) setPdfError(true);
      });

    return () => {
      active = false;
    };
  }, [mascota, fecha, diagnostico]);

  const descargar = () => {
    if (!pdfBytes) return;
    const url = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `vetsoft-diagnostico-consulta-${consultaId}.pdf`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
  };

  return (
    <section className="max-w-2xl overflow-hidden rounded-[20px] border border-vet-border bg-vet-surface shadow-xs">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-vet-border px-5 py-4">
        <h3 className="text-base font-bold text-vet-navy">Vista previa del diagnóstico</h3>
        {pdfBytes && (
          <button
            type="button"
            onClick={descargar}
            className="inline-flex items-center gap-2 rounded-lg bg-vet-emerald px-4 py-2 text-sm font-semibold text-white hover:bg-vet-emerald-hover"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Descargar PDF
          </button>
        )}
      </header>
      <div className="bg-vet-ice px-4 py-3 sm:px-5">
        <article className="rounded-md border border-vet-border border-t-2 border-t-vet-emerald bg-white px-4 py-3 text-vet-navy">
          <p className="text-xs font-bold text-vet-emerald-hover">VetSoft</p>
          <h4 className="mt-1 text-base font-bold">Diagnóstico veterinario</h4>
          <p className="mt-2 text-xs text-vet-muted">Mascota: {mascota}</p>
          <p className="text-xs text-vet-muted">Fecha de consulta: {fecha}</p>
          <div className="mt-3 border-t border-vet-border pt-2 text-sm">
            <h5 className="font-bold">Diagnóstico</h5>
            <p className="mt-1 whitespace-pre-wrap break-words leading-relaxed">{diagnostico}</p>
          </div>
        </article>
        {!pdfBytes && (
          <p role="status" className="mt-3 text-center text-sm text-vet-muted">
            {pdfError ? 'No se pudo preparar el PDF.' : 'Preparando PDF…'}
          </p>
        )}
      </div>
    </section>
  );
}
