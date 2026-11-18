import React, { useState } from 'react';
import { useStore } from '../../db/store';
import { Factura, DetalleFactura, Lote, Producto } from '../../types';
import confetti from 'canvas-confetti';
import {
  Receipt,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Printer,
  DollarSign,
  Boxes,
  Clock,
  User,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const FacturacionPOSView: React.FC = () => {
  const {
    facturas,
    detallesFactura,
    productos,
    lotes,
    propietarios,
    currentUser,
    spCrearFactura,
    spAgregarDetalle,
    spConfirmarFactura,
    anularFactura,
  } = useStore();

  const [activeFacturaId, setActiveFacturaId] = useState<number | null>(() => {
    // If there is an existing draft, select it
    const draft = facturas.find((f) => f.estado === 'BORRADOR');
    return draft ? draft.id_factura : null;
  });

  const [selectedClienteId, setSelectedClienteId] = useState<number>(propietarios[0]?.id_propietario || 1);
  const [selectedLoteId, setSelectedLoteId] = useState<number>(lotes[0]?.id_lote || 101);
  const [selectedCantidad, setSelectedCantidad] = useState<number>(1);
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<Factura | null>(null);

  // Active Invoice
  const activeFactura = facturas.find((f) => f.id_factura === activeFacturaId);
  const activeDetalles = activeFactura
    ? detallesFactura.filter((d) => d.id_factura === activeFactura.id_factura)
    : [];

  const activeCliente = activeFactura
    ? propietarios.find((p) => p.id_propietario === activeFactura.id_cliente)
    : null;

  const todayStr = new Date().toISOString().split('T')[0];

  // Actions
  const handleNuevaFactura = () => {
    const newId = spCrearFactura(selectedClienteId);
    setActiveFacturaId(newId);
    setFeedback({ text: `Factura #${newId} iniciada en BORRADOR (sp_crear_factura)`, isError: false });
  };

  const handleAgregarItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFacturaId) return;
    setFeedback(null);

    const res = spAgregarDetalle(activeFacturaId, selectedLoteId, selectedCantidad);
    if (res.success) {
      setFeedback({ text: res.message, isError: false });
      setSelectedCantidad(1);
    } else {
      setFeedback({ text: res.message, isError: true });
    }
  };

  const handleConfirmarVenta = () => {
    if (!activeFacturaId) return;
    setFeedback(null);

    const res = spConfirmarFactura(activeFacturaId);
    if (res.success) {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      const fact = facturas.find((f) => f.id_factura === activeFacturaId);
      if (fact) {
        setShowReceiptModal(fact);
      }
      setActiveFacturaId(null);
    } else {
      setFeedback({ text: res.message, isError: true });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#0f172a] tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-[#0369A1]" />
            <span>Módulo de Facturación POS e Inventario (Script 02)</span>
          </h2>
          <p className="text-xs text-[#475569] mt-0.5">
            Procedimientos almacenados transaccionales (sp_crear_factura, sp_agregar_detalle, sp_confirmar_factura) con deducción de stock en lotes vigentes.
          </p>
        </div>

        {!activeFactura && (
          <button
            onClick={handleNuevaFactura}
            className="px-4 py-2 rounded-xl bg-[#0D9488] text-[#ffffff] hover:bg-[#0D9488] text-[#ffffff] text-xs font-bold flex items-center gap-1.5 shadow-md "
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Factura POS</span>
          </button>
        )}
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            feedback.isError
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-[#E0F2FE] text-[#0369A1] border border-[#cbd5e1]'
          }`}
        >
          {feedback.isError ? (
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0369A1]" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* POS Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Active Invoice Detail or Setup */}
        <div className="lg:col-span-2 space-y-6">
          {activeFactura ? (
            <div className="bg-[#ffffff] rounded-[20px] border-2 border-[#cbd5e1] p-6 shadow-sm space-y-6">
              {/* Invoice Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-[#0f172a]">
                      Factura #{activeFactura.id_factura}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      {activeFactura.estado}
                    </span>
                  </div>
                  <p className="text-xs text-[#475569] mt-0.5">
                    Cliente:{' '}
                    <strong className="text-[#0f172a]">
                      {activeCliente ? `${activeCliente.nombres} ${activeCliente.apellidos}` : 'N/A'} (CC: {activeCliente?.cedula_documento})
                    </strong>
                  </p>
                </div>

                <div className="text-right text-xs">
                  <span className="text-[#475569] block text-[10px]">Cajero Responsable:</span>
                  <span className="font-bold text-[#0f172a]">{currentUser.correo}</span>
                </div>
              </div>

              {/* Add item to invoice form (sp_agregar_detalle) */}
              <form
                onSubmit={handleAgregarItem}
                className="p-4 bg-[#ffffff] rounded-xl border border-[#cbd5e1] space-y-3 text-xs"
              >
                <div className="font-bold text-[#475569] uppercase tracking-wider text-[11px] flex items-center justify-between">
                  <span>Agregar Producto por Lote Específico (sp_agregar_detalle)</span>
                  <span className="text-[#475569] font-normal">Validación FIFO / Vencimiento</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[#475569] mb-1 font-semibold">
                      Seleccionar Lote de Producto
                    </label>
                    <select
                      value={selectedLoteId}
                      onChange={(e) => setSelectedLoteId(Number(e.target.value))}
                      className="w-full p-2 border border-[#e2e2e5] rounded-lg bg-[#ffffff]"
                    >
                      {lotes.map((l) => {
                        const prod = productos.find((p) => p.id_producto === l.id_producto);
                        const isExpired = l.fecha_vencimiento && l.fecha_vencimiento < todayStr;
                        return (
                          <option key={l.id_lote} value={l.id_lote}>
                            {prod?.nombre} - Lote: {l.codigo_lote} (Disp: {l.stock_actual} | Vence:{' '}
                            {l.fecha_vencimiento || 'No expira'}) {isExpired ? '⚠️ [VENCIDO]' : ''} - $
                            {prod?.precio_venta.toFixed(2)}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#475569] mb-1 font-semibold">Cantidad a Vender</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        required
                        value={selectedCantidad}
                        onChange={(e) => setSelectedCantidad(parseInt(e.target.value) || 1)}
                        className="w-full p-2 border border-[#e2e2e5] rounded-lg bg-[#ffffff] font-bold text-center"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#0D9488] hover:opacity-90 text-[#ffffff] rounded-lg font-bold shrink-0 transition-colors"
                      >
                        + Agregar
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Items Table */}
              <div className="space-y-2">
                <span className="font-bold text-[#475569] uppercase tracking-wider text-xs">
                  Detalle de la Factura (detalle_factura)
                </span>

                {activeDetalles.length === 0 ? (
                  <div className="p-6 text-center bg-[#ffffff] rounded-xl text-xs text-[#475569]">
                    Aún no has agregado productos a esta factura.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#cbd5e1] text-[#475569] bg-[#ffffff]">
                          <th className="py-2 px-3">Producto</th>
                          <th className="py-2 px-3 font-mono">Lote</th>
                          <th className="py-2 px-3 text-center">Cantidad</th>
                          <th className="py-2 px-3 text-right">Precio Unit.</th>
                          <th className="py-2 px-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeDetalles.map((det) => {
                          const lote = lotes.find((l) => l.id_lote === det.id_lote);
                          const prod = lote ? productos.find((p) => p.id_producto === lote.id_producto) : null;

                          return (
                            <tr key={det.id_detalle}>
                              <td className="py-2.5 px-3 font-bold text-[#0f172a]">{prod?.nombre}</td>
                              <td className="py-2.5 px-3 font-mono text-[#0369A1]">{lote?.codigo_lote}</td>
                              <td className="py-2.5 px-3 text-center font-bold">{det.cantidad}</td>
                              <td className="py-2.5 px-3 text-right">${det.precio_unitario.toFixed(2)}</td>
                              <td className="py-2.5 px-3 text-right font-bold text-[#0f172a]">
                                ${det.subtotal.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Total & Confirmation */}
              <div className="pt-4 border-t border-[#cbd5e1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-left">
                  <span className="text-xs text-[#475569] uppercase tracking-wider font-semibold block">
                    Total a Cobrar
                  </span>
                  <div className="text-3xl font-black text-[#0f172a]">
                    ${activeDetalles.reduce((sum, d) => sum + d.subtotal, 0).toFixed(2)}{' '}
                    <span className="text-xs text-[#475569] font-normal">USD</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => anularFactura(activeFactura.id_factura)}
                    className="px-4 py-2.5 border border-red-300 text-red-700 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors"
                  >
                    Anular Factura
                  </button>

                  <button
                    onClick={handleConfirmarVenta}
                    disabled={activeDetalles.length === 0}
                    className="px-6 py-2.5 bg-[#0D9488] text-[#ffffff] hover:bg-[#0D9488] text-[#ffffff] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg  transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar Venta y Cobrar (sp_confirmar_factura)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Create new invoice start card */
            <div className="bg-[#ffffff] rounded-[20px] border border-[#cbd5e1] p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-[20px] bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center mx-auto">
                <Receipt className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#0f172a]">No hay factura en curso</h3>
                <p className="text-xs text-[#475569] max-w-sm mx-auto mt-1">
                  Selecciona el cliente y presiona "Iniciar Factura POS" para comenzar a vender medicamentos y servicios.
                </p>
              </div>

              <div className="max-w-xs mx-auto text-left space-y-2">
                <label className="block text-xs font-semibold text-[#475569]">Cliente / Propietario</label>
                <select
                  value={selectedClienteId}
                  onChange={(e) => setSelectedClienteId(Number(e.target.value))}
                  className="w-full text-xs p-2 border border-[#e2e2e5] rounded-xl bg-[#ffffff]"
                >
                  {propietarios.map((p) => (
                    <option key={p.id_propietario} value={p.id_propietario}>
                      {p.nombres} {p.apellidos} (CC: {p.cedula_documento})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleNuevaFactura}
                className="px-6 py-3 bg-[#0D9488] text-[#ffffff] hover:bg-[#0D9488] text-[#ffffff] text-xs font-bold rounded-xl shadow-md  inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Iniciar Factura POS (sp_crear_factura)</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column (1 col): Invoices History & ACID Summary */}
        <div className="space-y-6">
          <div className="bg-[#ffffff] rounded-[20px] border border-[#cbd5e1] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-[#0f172a]">Historial de Facturas</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#475569]">
                {facturas.length} registradas
              </span>
            </div>

            <div className="space-y-2.5 max-h-[480px] overflow-y-auto">
              {facturas.map((f) => {
                const client = propietarios.find((p) => p.id_propietario === f.id_cliente);
                const isSelected = f.id_factura === activeFacturaId;

                const statusColors = {
                  BORRADOR: 'bg-amber-100 text-amber-800 border-amber-200',
                  PAGADA: 'bg-[#E0F2FE] text-[#0369A1] border-[#cbd5e1]',
                  ANULADA: 'bg-red-100 text-red-800 border-red-200',
                };

                return (
                  <div
                    key={f.id_factura}
                    onClick={() => {
                      if (f.estado === 'BORRADOR') setActiveFacturaId(f.id_factura);
                      else setShowReceiptModal(f);
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#0f172a] bg-[#E0F2FE] text-[#0369A1]/30'
                        : 'border-[#cbd5e1] hover:border-[#e2e2e5] hover:bg-[#ffffff]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[#0f172a]">#{f.id_factura}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${statusColors[f.estado]}`}>
                        {f.estado}
                      </span>
                    </div>
                    <div className="text-[#475569] mt-1">
                      {client ? `${client.nombres} ${client.apellidos}` : 'Cliente'}
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px]">
                      <span className="text-[#475569]">{new Date(f.fecha).toLocaleDateString()}</span>
                      <strong className="text-[#0f172a] text-xs">${f.total.toFixed(2)}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Comprobante Térmico / Factura Fiscal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#ffffff]/60 backdrop-blur-xs p-4">
          <div className="bg-[#ffffff] rounded-[20px] shadow-2xl max-w-md w-full border border-[#cbd5e1] overflow-hidden font-mono text-xs">
            {/* Ticket Header */}
            <div className="p-6 bg-[#ffffff] border-b border-dashed border-[#e2e2e5] text-center space-y-1">
              <h3 className="font-black text-base tracking-tight text-[#0f172a]">VETSOFT CLINICAL S.A.S.</h3>
              <p className="text-[10px] text-[#475569]">NIT: 901.849.201-4 • IVA Régimen Común</p>
              <p className="text-[10px] text-[#475569]">Carrera 45 # 128 - 22, Bogotá</p>
              <div className="pt-2">
                <span className="px-2 py-0.5 rounded bg-[#E0F2FE] text-[#0369A1] font-bold text-[10px]">
                  FACTURA DE VENTA #{showReceiptModal.id_factura}
                </span>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="p-6 space-y-3">
              <div className="text-[11px] space-y-1 border-b border-dashed border-[#cbd5e1] pb-3">
                <div className="flex justify-between">
                  <span className="text-[#475569]">Fecha y Hora:</span>
                  <span>{new Date(showReceiptModal.fecha).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#475569]">Cliente:</span>
                  <span>
                    {(() => {
                      const c = propietarios.find((p) => p.id_propietario === showReceiptModal.id_cliente);
                      return c ? `${c.nombres} ${c.apellidos}` : 'Consumidor Final';
                    })()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#475569]">Estado:</span>
                  <span className="font-bold text-[#0369A1]">{showReceiptModal.estado}</span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-1.5 border-b border-dashed border-[#cbd5e1] pb-3">
                {detallesFactura
                  .filter((d) => d.id_factura === showReceiptModal.id_factura)
                  .map((det) => {
                    const lote = lotes.find((l) => l.id_lote === det.id_lote);
                    const prod = lote ? productos.find((p) => p.id_producto === lote.id_producto) : null;
                    return (
                      <div key={det.id_detalle} className="flex justify-between text-[11px]">
                        <div>
                          <div className="font-bold text-[#0f172a]">{prod?.nombre}</div>
                          <span className="text-[10px] text-[#475569]">
                            Lote: {lote?.codigo_lote} x {det.cantidad}
                          </span>
                        </div>
                        <span className="font-bold text-[#0f172a]">${det.subtotal.toFixed(2)}</span>
                      </div>
                    );
                  })}
              </div>

              {/* Total */}
              <div className="flex justify-between text-sm font-black pt-1">
                <span>TOTAL PAGADO:</span>
                <span className="text-[#0369A1]">${showReceiptModal.total.toFixed(2)} USD</span>
              </div>

              <div className="p-2 bg-[#F1F5F9] rounded text-center text-[10px] text-[#475569]">
                Transacción ACID confirmada con deducción en movimientos_inventario.
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-[#ffffff] border-t border-[#cbd5e1] flex justify-end gap-2">
              <button
                onClick={() => setShowReceiptModal(null)}
                className="px-4 py-2 border border-[#e2e2e5] text-[#475569] rounded-lg text-xs font-bold"
              >
                Cerrar
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#0D9488] text-[#ffffff] rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
