import React, { useState } from 'react';
import { useStore } from '../../db/store';
import { OperacionAuditoria } from '../../types';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  Database,
  FileCheck2,
  Sparkles,
} from 'lucide-react';

export const AuditoriaSRSView: React.FC = () => {
  const { auditoria } = useStore();

  const [filterTabla, setFilterTabla] = useState<string>('TODAS');
  const [filterOp, setFilterOp] = useState<string>('TODAS');
  const [searchTerm, setSearchTerm] = useState('');

  const tableList = [
    'TODAS',
    'usuarios',
    'propietarios',
    'mascotas',
    'citas',
    'consultas',
    'historia_vacunacion',
    'fichas_ia',
    'facturas',
    'lotes',
    'movimientos_inventario',
    'productos',
  ];

  const filteredLogs = auditoria.filter((log) => {
    const matchesTable = filterTabla === 'TODAS' || log.tabla_afectada === filterTabla;
    const matchesOp = filterOp === 'TODAS' || log.operacion === filterOp;
    const matchesSearch =
      log.detalles.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.usuario_nombre && log.usuario_nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTable && matchesOp && matchesSearch;
  });

  const opBadges: Record<OperacionAuditoria, { bg: string; text: string }> = {
    INSERT: { bg: 'bg-vet-ice text-vet-navy', text: 'text-vet-navy' },
    UPDATE: { bg: 'bg-blue-100', text: 'text-blue-800' },
    DELETE: { bg: 'bg-red-100', text: 'text-red-800' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-vet-navy tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-vet-navy" />
            <span>Auditoría del Sistema y Garantías ACID</span>
          </h2>
          <p className="text-xs text-vet-muted mt-0.5">
            Registro cronológico inmutable de operaciones (INSERT, UPDATE, DELETE) en la tabla <code>auditoria_sistema</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-vet-ice text-vet-navy border border-vet-border text-xs font-bold">
            <Database className="w-4 h-4 text-vet-navy" />
            <span>{auditoria.length} Eventos Auditados</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-vet-surface rounded-[20px] border border-vet-border shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-vet-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar en detalles o usuario..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-vet-border text-xs focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
          <span className="text-vet-muted font-semibold">Tabla:</span>
          <select
            value={filterTabla}
            onChange={(e) => setFilterTabla(e.target.value)}
            className="p-1.5 border border-vet-border rounded-lg bg-vet-surface"
          >
            {tableList.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <span className="text-vet-muted font-semibold ml-2">Operación:</span>
          <select
            value={filterOp}
            onChange={(e) => setFilterOp(e.target.value)}
            className="p-1.5 border border-vet-border rounded-lg bg-vet-surface"
          >
            <option value="TODAS">TODAS</option>
            <option value="INSERT">INSERT</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-vet-surface rounded-[20px] border border-vet-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-vet-border text-vet-muted bg-vet-surface font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Tabla Afectada</th>
                <th className="py-3 px-4">Operación</th>
                <th className="py-3 px-4">Detalle del Evento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => {
                const badge = opBadges[log.operacion] || { bg: 'bg-vet-ice', text: 'text-vet-navy' };

                return (
                  <tr key={log.id_auditoria} className="hover:bg-vet-surface/80">
                    <td className="py-3 px-4 font-mono font-bold text-vet-muted">
                      #{log.id_auditoria}
                    </td>
                    <td className="py-3 px-4 text-vet-muted font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.fecha).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-vet-navy whitespace-nowrap">
                      {log.usuario_nombre || `ID #${log.id_usuario}`}
                    </td>
                    <td className="py-3 px-4">
                      <code className="px-2 py-0.5 rounded bg-vet-ice text-vet-navy font-mono font-bold text-[11px]">
                        {log.tabla_afectada}
                      </code>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badge.bg} ${badge.text}`}>
                        {log.operacion}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-vet-muted leading-relaxed max-w-lg">
                      {log.detalles}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="p-8 text-center text-xs text-vet-muted">
            No hay registros de auditoría que coincidan con los filtros.
          </div>
        )}
      </div>
    </div>
  );
};
