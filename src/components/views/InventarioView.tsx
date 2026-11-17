import React, { useState } from 'react';
import { useStore } from '../../db/store';
import { Producto, Lote } from '../../types';
import {
  Boxes,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpDown,
  History,
  ShieldAlert,
  Search,
} from 'lucide-react';

export const InventarioView: React.FC = () => {
  const {
    productos,
    lotes,
    vwExistencias,
    vwAlertasStock,
    movimientos,
    crearProducto,
    crearLote,
    ajustarStockLote,
    currentUser,
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'lotes' | 'existencias' | 'alertas' | 'movimientos'>('lotes');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [showLoteModal, setShowLoteModal] = useState(false);
  const [showAjusteModal, setShowAjusteModal] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  // Forms
  const [prodForm, setProdForm] = useState({
    sku: `MED-${Math.floor(100 + Math.random() * 900)}`,
    nombre: '',
    precio_venta: 25.0,
    stock_minimo: 8,
    requiere_vencimiento: true,
    activo: true,
  });

  const [loteForm, setLoteForm] = useState({
    id_producto: productos[0]?.id_producto || 1,
    codigo_lote: `LOT-${Math.floor(1000 + Math.random() * 9000)}`,
    fecha_vencimiento: '2027-12-31',
    stock_actual: 20,
  });

  const [ajusteForm, setAjusteForm] = useState({
    id_lote: lotes[0]?.id_lote || 101,
    cantidad_delta: 5,
    motivo: 'Ajuste físico tras conteo de inventario',
    tipo: 'AJUSTE' as 'APERTURA' | 'AJUSTE',
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Handlers
  const handleCreateProd = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const res = crearProducto(prodForm);
    if (res.success) {
      setFeedback({ text: res.message, isError: false });
      setTimeout(() => {
        setShowProductModal(false);
        setFeedback(null);
      }, 1000);
    } else {
      setFeedback({ text: res.message, isError: true });
    }
  };

  const handleCreateLote = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    // Emulates trigger trg_lote_vencimiento_bi
    const res = crearLote({
      id_producto: loteForm.id_producto,
      codigo_lote: loteForm.codigo_lote,
      fecha_vencimiento: loteForm.fecha_vencimiento ? loteForm.fecha_vencimiento : null,
      stock_actual: loteForm.stock_actual,
    });

    if (res.success) {
      setFeedback({ text: res.message, isError: false });
      setTimeout(() => {
        setShowLoteModal(false);
        setFeedback(null);
      }, 1000);
    } else {
      setFeedback({ text: res.message, isError: true });
    }
  };

  const handleAjuste = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const res = ajustarStockLote(
      ajusteForm.id_lote,
      ajusteForm.cantidad_delta,
      ajusteForm.motivo,
      ajusteForm.tipo
    );
    if (res.success) {
      setFeedback({ text: res.message, isError: false });
      setTimeout(() => {
        setShowAjusteModal(false);
        setFeedback(null);
      }, 1000);
    } else {
      setFeedback({ text: res.message, isError: true });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1f2937] tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-[#1e40af]" />
            <span>Inventario por Lotes y Vencimientos (Script 02)</span>
          </h2>
          <p className="text-xs text-[#4b5563] mt-0.5">
            Triggers de vencimiento (trg_lote_vencimiento_bi), vistas SQL automáticas (vw_existencias, vw_alertas_stock) y kárdex.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAjusteModal(true)}
            className="px-3.5 py-2 rounded-xl border border-[#e2e2e5] bg-[#ffffff] hover:bg-[#ffffff] text-[#4b5563] text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <ArrowUpDown className="w-4 h-4 text-[#4b5563]" />
            <span>Ajuste Kárdex</span>
          </button>

          <button
            onClick={() => setShowLoteModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#1d4ed8] hover:opacity-90 text-[#ffffff] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#1e40af]" />
            <span>Nuevo Lote</span>
          </button>

          <button
            onClick={() => setShowProductModal(true)}
            className="px-4 py-2 rounded-xl bg-[#1d4ed8] text-[#ffffff] hover:bg-[#1d4ed8] text-[#ffffff] text-xs font-bold flex items-center gap-1.5 shadow-md  transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            feedback.isError
              ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/25'
              : 'bg-[#dbeafe] text-[#1e40af] border border-[#1e40af]/25'
          }`}
        >
          {feedback.isError ? (
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#DC2626]" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#1e40af]" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#d1d5db] pb-2">
        <button
          onClick={() => setActiveSubTab('lotes')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeSubTab === 'lotes' ? 'bg-[#1d4ed8] text-[#ffffff] shadow-xs' : 'text-[#4b5563] hover:bg-[#e5e7eb]'
          }`}
        >
          Lotes y Catálogo
        </button>

        <button
          onClick={() => setActiveSubTab('existencias')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'existencias'
              ? 'bg-[#1d4ed8] text-[#ffffff] shadow-xs'
              : 'text-[#4b5563] hover:bg-[#e5e7eb]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Vista: vw_existencias</span>
        </button>

        <button
          onClick={() => setActiveSubTab('alertas')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'alertas'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-[#4b5563] hover:bg-[#e5e7eb]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Alertas de Stock ({vwAlertasStock.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('movimientos')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'movimientos'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-[#4b5563] hover:bg-[#e5e7eb]'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Kárdex Movimientos ({movimientos.length})</span>
        </button>
      </div>

      {/* Subtab 1: Lotes y Catálogo */}
      {activeSubTab === 'lotes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#ffffff] rounded-[20px] border border-[#d1d5db] p-5 shadow-xs">
              <h3 className="font-bold text-sm text-[#1f2937] mb-3">Lotes Activos en Bodega</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#d1d5db] text-[#4b5563] bg-[#ffffff]">
                      <th className="py-2.5 px-3">Producto / SKU</th>
                      <th className="py-2.5 px-3 font-mono">Código Lote</th>
                      <th className="py-2.5 px-3">Fecha Vencimiento</th>
                      <th className="py-2.5 px-3 text-center">Stock Actual</th>
                      <th className="py-2.5 px-3">Condición</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lotes.map((l) => {
                      const prod = productos.find((p) => p.id_producto === l.id_producto);
                      const isExpired = l.fecha_vencimiento && l.fecha_vencimiento < todayStr;
                      const isNear =
                        l.fecha_vencimiento &&
                        !isExpired &&
                        new Date(l.fecha_vencimiento).getTime() - new Date().getTime() < 60 * 24 * 3600 * 1000;

                      return (
                        <tr key={l.id_lote} className={isExpired ? 'bg-[#FEF2F2]/60' : 'hover:bg-[#ffffff]'}>
                          <td className="py-3 px-3">
                            <span className="font-bold text-[#1f2937] block">{prod?.nombre}</span>
                            <span className="text-[10px] text-[#4b5563] font-mono">{prod?.sku}</span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-[#1e40af]">{l.codigo_lote}</td>
                          <td className="py-3 px-3 font-medium text-[#4b5563] whitespace-nowrap">
                            {l.fecha_vencimiento ? l.fecha_vencimiento : 'No aplica'}
                          </td>
                          <td className="py-3 px-3 text-center font-black text-[#1f2937] text-sm">
                            {l.stock_actual}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            {isExpired ? (
                              <span className="inline-flex items-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/25">
                                Vencido (No vendible)
                              </span>
                            ) : isNear ? (
                              <span className="inline-flex items-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/25">
                                Próximo a vencer
                              </span>
                            ) : (
                              <span className="inline-flex items-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0FDFA] text-[#0D9488] border border-[#0D9488]/25">
                                Vigente
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Products Sidebar Catalog */}
          <div className="space-y-4">
            <div className="bg-[#ffffff] rounded-[20px] border border-[#d1d5db] p-5 shadow-xs">
              <h3 className="font-bold text-sm text-[#1f2937] mb-3">Catálogo de Productos ({productos.length})</h3>
              <div className="space-y-2 max-h-[440px] overflow-y-auto">
                {productos.map((p) => (
                  <div key={p.id_producto} className="p-3 rounded-xl border border-[#d1d5db] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1f2937]">{p.nombre}</span>
                      <strong className="text-[#1e40af] font-mono">${p.precio_venta.toFixed(2)}</strong>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#4b5563]">
                      <span className="font-mono">{p.sku}</span>
                      <span>Mínimo: {p.stock_minimo}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-0.5 text-[10px]">
                      <span
                        className={`px-1.5 py-0.2 rounded font-semibold ${
                          p.requiere_vencimiento ? 'bg-amber-100 text-amber-800' : 'bg-[#e5e7eb] text-[#4b5563]'
                        }`}
                      >
                        {p.requiere_vencimiento ? 'Requiere Vencimiento' : 'Sin Vencimiento'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Vista vw_existencias */}
      {activeSubTab === 'existencias' && (
        <div className="bg-[#ffffff] rounded-[20px] border border-[#d1d5db] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#1f2937]">Vista Calculada: vw_existencias</h3>
              <p className="text-xs text-[#4b5563]">
                Consolidación de stock físico en bodega vs stock vendible (vigente) vs stock vencido descartado.
              </p>
            </div>
            <code className="px-2.5 py-1 rounded bg-[#ffffff] text-[#1e40af] font-mono text-xs">
              VIEW vw_existencias
            </code>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#d1d5db] text-[#4b5563] bg-[#ffffff]">
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Nombre Producto</th>
                  <th className="py-2.5 px-3 text-center">Stock Mínimo</th>
                  <th className="py-2.5 px-3 text-center">Stock Físico Total</th>
                  <th className="py-2.5 px-3 text-center font-bold text-[#1e40af]">Stock Vendible</th>
                  <th className="py-2.5 px-3 text-center font-bold text-red-600">Stock Vencido</th>
                  <th className="py-2.5 px-3">Estado Alerta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vwExistencias.map((e) => {
                  const isAlert = e.stock_vendible <= e.stock_minimo;
                  return (
                    <tr key={e.id_producto} className={isAlert ? 'bg-amber-50/40' : ''}>
                      <td className="py-3 px-3 font-mono font-bold text-[#4b5563]">{e.sku}</td>
                      <td className="py-3 px-3 font-bold text-[#1f2937]">{e.nombre}</td>
                      <td className="py-3 px-3 text-center">{e.stock_minimo}</td>
                      <td className="py-3 px-3 text-center font-bold">{e.stock_fisico}</td>
                      <td className="py-3 px-3 text-center font-black text-[#1e40af] text-sm">
                        {e.stock_vendible}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-red-600">
                        {e.stock_vencido > 0 ? e.stock_vencido : '-'}
                      </td>
                      <td className="py-3 px-3">
                        {isAlert ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 w-max">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Stock Crítico
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#dbeafe] text-[#1e40af]">
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 3: Vista vw_alertas_stock */}
      {activeSubTab === 'alertas' && (
        <div className="bg-[#ffffff] rounded-[20px] border-2 border-amber-300 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#1f2937]">Vista: vw_alertas_stock</h3>
                <p className="text-xs text-[#4b5563]">
                  Filtro automático de productos donde <code>stock_vendible &lt;= stock_minimo</code>.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              {vwAlertasStock.length} Insumos en Alerta
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vwAlertasStock.map((item) => (
              <div
                key={item.id_producto}
                className="p-4 rounded-xl border border-amber-300 bg-amber-50/50 space-y-2 shadow-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-[#1f2937]">{item.nombre}</h4>
                    <span className="font-mono text-[10px] text-[#4b5563]">SKU: {item.sku}</span>
                  </div>
                  <span className="text-[10px] uppercase font-black text-red-600 bg-red-100 px-2 py-0.5 rounded">
                    Reorden
                  </span>
                </div>

                <div className="p-3 bg-[#ffffff] rounded-lg border border-amber-200 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#4b5563] block text-[10px]">Stock Vendible</span>
                    <strong className="text-amber-800 text-base">{item.stock_vendible}</strong>
                  </div>
                  <div>
                    <span className="text-[#4b5563] block text-[10px]">Stock Mínimo</span>
                    <strong className="text-[#1f2937] text-base">{item.stock_minimo}</strong>
                  </div>
                </div>

                <p className="text-[11px] text-amber-900">
                  Déficit de al menos <strong>{Math.max(1, item.stock_minimo - item.stock_vendible + 10)}</strong> unidades para reabastecimiento seguro.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 4: Movimientos de Inventario */}
      {activeSubTab === 'movimientos' && (
        <div className="bg-[#ffffff] rounded-[20px] border border-[#d1d5db] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#1f2937]">
                Kárdex de Movimientos (movimientos_inventario)
              </h3>
              <p className="text-xs text-[#4b5563]">
                Auditoría inmutable de ingresos de lote (APERTURA), deducciones POS (VENTA) y conteos físicos (AJUSTE).
              </p>
            </div>
            <button
              onClick={() => setShowAjusteModal(true)}
              className="px-3 py-1.5 bg-[#1d4ed8] hover:opacity-90 text-[#ffffff] rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Movimiento</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#d1d5db] text-[#4b5563] bg-[#ffffff]">
                  <th className="py-2.5 px-3">Fecha y Hora</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3 font-mono">Lote</th>
                  <th className="py-2.5 px-3 text-center">Delta (Cantidad)</th>
                  <th className="py-2.5 px-3">Motivo / Factura Vinculada</th>
                  <th className="py-2.5 px-3">Usuario Responsable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movimientos.map((mov) => {
                  const lote = lotes.find((l) => l.id_lote === mov.id_lote);
                  const prod = lote ? productos.find((p) => p.id_producto === lote.id_producto) : null;

                  const typeColors = {
                    APERTURA: 'bg-blue-100 text-blue-800',
                    VENTA: 'bg-[#dbeafe] text-[#1e40af]',
                    AJUSTE: 'bg-purple-100 text-purple-800',
                  };

                  return (
                    <tr key={mov.id_movimiento} className="hover:bg-[#ffffff]">
                      <td className="py-2.5 px-3 text-[#4b5563]">
                        {new Date(mov.fecha).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${typeColors[mov.tipo]}`}>
                          {mov.tipo}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        <strong className="text-[#1f2937]">{prod?.nombre}</strong> ({lote?.codigo_lote})
                      </td>
                      <td
                        className={`py-2.5 px-3 text-center font-black ${
                          mov.cantidad_delta > 0 ? 'text-[#1e40af]' : 'text-rose-600'
                        }`}
                      >
                        {mov.cantidad_delta > 0 ? `+${mov.cantidad_delta}` : mov.cantidad_delta}
                      </td>
                      <td className="py-2.5 px-3 text-[#4b5563] font-medium">{mov.motivo}</td>
                      <td className="py-2.5 px-3 text-[#4b5563] font-mono text-[11px]">
                        ID #{mov.id_usuario_responsable || 1}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Nuevo Producto */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#ffffff]/60 backdrop-blur-xs p-4">
          <div className="bg-[#ffffff] rounded-[20px] shadow-2xl max-w-md w-full border border-[#d1d5db] overflow-hidden">
            <div className="px-6 py-4 bg-[#e5e7eb] text-[#1f2937] border-b border-[#d1d5db] flex items-center justify-between">
              <h3 className="font-bold text-base">Crear Producto (Catálogo)</h3>
              <button onClick={() => setShowProductModal(false)} className="text-[#4b5563] hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProd} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#4b5563] mb-1">SKU (Único)</label>
                <input
                  type="text"
                  required
                  value={prodForm.sku}
                  onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value })}
                  className="w-full p-2 border border-[#e2e2e5] rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#4b5563] mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  required
                  value={prodForm.nombre}
                  onChange={(e) => setProdForm({ ...prodForm, nombre: e.target.value })}
                  placeholder="ej. Enrofloxacina 50mg"
                  className="w-full p-2 border border-[#e2e2e5] rounded-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#4b5563] mb-1">Precio Venta (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodForm.precio_venta}
                    onChange={(e) => setProdForm({ ...prodForm, precio_venta: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#4b5563] mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    required
                    value={prodForm.stock_minimo}
                    onChange={(e) => setProdForm({ ...prodForm, stock_minimo: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="requiereVencimiento"
                  checked={prodForm.requiere_vencimiento}
                  onChange={(e) => setProdForm({ ...prodForm, requiere_vencimiento: e.target.checked })}
                  className="rounded border-[#e2e2e5] text-[#1e40af] focus:ring-emerald-500"
                />
                <label htmlFor="requiereVencimiento" className="font-semibold text-[#4b5563]">
                  Requiere control de fecha de vencimiento por lote (trg_lote_vencimiento_bi)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border border-[#e2e2e5] text-[#4b5563] rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1d4ed8] text-[#ffffff] hover:bg-[#1d4ed8] text-[#ffffff] rounded-lg font-bold"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nuevo Lote (con Trigger Demo) */}
      {showLoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#ffffff]/60 backdrop-blur-xs p-4">
          <div className="bg-[#ffffff] rounded-[20px] shadow-2xl max-w-md w-full border border-[#d1d5db] overflow-hidden">
            <div className="px-6 py-4 bg-[#e5e7eb] text-[#1f2937] border-b border-[#d1d5db] flex items-center justify-between">
              <h3 className="font-bold text-base">Crear Lote (Validación de Triggers)</h3>
              <button onClick={() => setShowLoteModal(false)} className="text-[#4b5563] hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLote} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#4b5563] mb-1">Producto</label>
                <select
                  value={loteForm.id_producto}
                  onChange={(e) => setLoteForm({ ...loteForm, id_producto: Number(e.target.value) })}
                  className="w-full p-2 border border-[#e2e2e5] rounded-lg bg-[#ffffff]"
                >
                  {productos.map((p) => (
                    <option key={p.id_producto} value={p.id_producto}>
                      {p.nombre} ({p.sku}) - {p.requiere_vencimiento ? '[Requiere Vencimiento]' : '[Sin Venc.]'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#4b5563] mb-1">Código de Lote</label>
                <input
                  type="text"
                  required
                  value={loteForm.codigo_lote}
                  onChange={(e) => setLoteForm({ ...loteForm, codigo_lote: e.target.value })}
                  className="w-full p-2 border border-[#e2e2e5] rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#4b5563] mb-1">
                  Fecha de Vencimiento (Prueba dejar vacía si requiere vencimiento)
                </label>
                <input
                  type="date"
                  value={loteForm.fecha_vencimiento}
                  onChange={(e) => setLoteForm({ ...loteForm, fecha_vencimiento: e.target.value })}
                  className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#4b5563] mb-1">Stock Inicial de Apertura</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={loteForm.stock_actual}
                  onChange={(e) => setLoteForm({ ...loteForm, stock_actual: parseInt(e.target.value) || 0 })}
                  className="w-full p-2 border border-[#e2e2e5] rounded-lg font-bold"
                />
              </div>

              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-950">
                <strong>Trigger trg_lote_vencimiento_bi:</strong> Si el producto tiene{' '}
                <code>requiere_vencimiento = TRUE</code> y la fecha está en blanco, el trigger SQL aborta la operación con SIGNAL SQLSTATE '45000'.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLoteModal(false)}
                  className="px-4 py-2 border border-[#e2e2e5] text-[#4b5563] rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1d4ed8] text-[#ffffff] hover:bg-[#1d4ed8] text-[#ffffff] rounded-lg font-bold"
                >
                  Crear Lote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ajuste Manual de Inventario */}
      {showAjusteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#ffffff]/60 backdrop-blur-xs p-4">
          <div className="bg-[#ffffff] rounded-[20px] shadow-2xl max-w-md w-full border border-[#d1d5db] overflow-hidden">
            <div className="px-6 py-4 bg-[#e5e7eb] text-[#1f2937] border-b border-[#d1d5db] flex items-center justify-between">
              <h3 className="font-bold text-base">Ajuste de Kárdex Manual (Auditoría)</h3>
              <button onClick={() => setShowAjusteModal(false)} className="text-[#4b5563] hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAjuste} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#4b5563] mb-1">Lote a Modificar</label>
                <select
                  value={ajusteForm.id_lote}
                  onChange={(e) => setAjusteForm({ ...ajusteForm, id_lote: Number(e.target.value) })}
                  className="w-full p-2 border border-[#e2e2e5] rounded-lg bg-[#ffffff]"
                >
                  {lotes.map((l) => {
                    const prod = productos.find((p) => p.id_producto === l.id_producto);
                    return (
                      <option key={l.id_lote} value={l.id_lote}>
                        {prod?.nombre} - Lote: {l.codigo_lote} (Stock actual: {l.stock_actual})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#4b5563] mb-1">Tipo de Movimiento</label>
                  <select
                    value={ajusteForm.tipo}
                    onChange={(e) => setAjusteForm({ ...ajusteForm, tipo: e.target.value as any })}
                    className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                  >
                    <option value="AJUSTE">AJUSTE</option>
                    <option value="APERTURA">APERTURA</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#4b5563] mb-1">Delta (+ ó -)</label>
                  <input
                    type="number"
                    required
                    value={ajusteForm.cantidad_delta}
                    onChange={(e) => setAjusteForm({ ...ajusteForm, cantidad_delta: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-[#e2e2e5] rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#4b5563] mb-1">Motivo Justificado (Auditoría)</label>
                <input
                  type="text"
                  required
                  value={ajusteForm.motivo}
                  onChange={(e) => setAjusteForm({ ...ajusteForm, motivo: e.target.value })}
                  className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAjusteModal(false)}
                  className="px-4 py-2 border border-[#e2e2e5] text-[#4b5563] rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold"
                >
                  Aplicar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
