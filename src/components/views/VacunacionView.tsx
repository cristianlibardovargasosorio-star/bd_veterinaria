import React, { useState } from 'react';
import { useStore } from '../../db/store';
import { ActiveTab } from '../Sidebar';
import {
  Syringe,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  QrCode,
  Printer,
  ShieldCheck,
  Clock,
  PawPrint,
} from 'lucide-react';

interface VacunacionViewProps {
  initialPetId?: number | null;
}

export const VacunacionView: React.FC<VacunacionViewProps> = ({ initialPetId }) => {
  const {
    mascotas,
    propietarios,
    veterinarios,
    vacunas,
    historiaVacunas,
    aplicarVacuna,
    currentRole,
    currentUser,
  } = useStore();

  const [selectedPetId, setSelectedPetId] = useState<number>(() => {
    if (initialPetId) return initialPetId;
    return mascotas[0]?.id_mascota || 1;
  });

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  // Form
  const todayStr = new Date().toISOString().split('T')[0];
  const [vacForm, setVacForm] = useState({
    id_mascota: selectedPetId,
    id_vacuna: vacunas[0]?.id_vacuna || 1,
    id_veterinario: veterinarios[0]?.id_veterinario || 1,
    lote: 'BIO-2026-09X',
    fecha_aplicacion: todayStr,
    fecha_refuerzo: '',
    observaciones: 'Buena tolerancia al biológico.',
  });

  // Calculate booster date helper
  const calculateBooster = (idVacuna: number, appDate: string) => {
    const vac = vacunas.find((v) => v.id_vacuna === idVacuna);
    if (!vac || !appDate) return '';
    const d = new Date(appDate);
    d.setDate(d.getDate() + (vac.dias_refuerzo_sugeridos || 365));
    return d.toISOString().split('T')[0];
  };

  const handleVacunaSelect = (idVacuna: number) => {
    const booster = calculateBooster(idVacuna, vacForm.fecha_aplicacion);
    setVacForm((prev) => ({
      ...prev,
      id_vacuna: idVacuna,
      fecha_refuerzo: booster,
    }));
  };

  const handleAppDateChange = (dateStr: string) => {
    const booster = calculateBooster(vacForm.id_vacuna, dateStr);
    setVacForm((prev) => ({
      ...prev,
      fecha_aplicacion: dateStr,
      fecha_refuerzo: booster,
    }));
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!vacForm.lote.trim()) {
      setFeedback({ text: 'El número de lote es obligatorio (RF09)', isError: true });
      return;
    }

    const boosterDate = vacForm.fecha_refuerzo || calculateBooster(vacForm.id_vacuna, vacForm.fecha_aplicacion);

    const res = aplicarVacuna({
      id_mascota: selectedPetId,
      id_vacuna: vacForm.id_vacuna,
      id_veterinario: vacForm.id_veterinario,
      lote: vacForm.lote,
      fecha_aplicacion: vacForm.fecha_aplicacion,
      fecha_refuerzo: boosterDate,
      observaciones: vacForm.observaciones,
    });

    if (res.success) {
      setFeedback({ text: res.message, isError: false });
      setTimeout(() => {
        setShowApplyModal(false);
        setFeedback(null);
      }, 1000);
    } else {
      setFeedback({ text: res.message, isError: true });
    }
  };

  const activePet = mascotas.find((m) => m.id_mascota === selectedPetId) || mascotas[0];
  const activeOwner = activePet ? propietarios.find((p) => p.id_propietario === activePet.id_propietario) : null;
  const petDoses = historiaVacunas.filter((h) => h.id_mascota === selectedPetId);

  const today = new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#17191c] tracking-tight flex items-center gap-2">
            <Syringe className="w-6 h-6 text-[#5d2a1a]" />
            <span>Control de Vacunas y Carné Digital (RF09)</span>
          </h2>
          <p className="text-xs text-[#979799] mt-0.5">
            Registro de biológicos con trazabilidad por lote, cálculo automático de refuerzo y carné exportable.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-xl border border-[#e2e2e5] bg-[#ffffff] hover:bg-[#ffffff] text-[#777b86] text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4 text-[#979799]" />
            <span>Imprimir Carné</span>
          </button>

          {currentRole !== 'PROPIETARIO' && (
            <button
              onClick={() => {
                setVacForm({
                  id_mascota: selectedPetId,
                  id_vacuna: vacunas[0]?.id_vacuna || 1,
                  id_veterinario: veterinarios[0]?.id_veterinario || 1,
                  lote: `BIO-2026-${Math.floor(100 + Math.random() * 900)}`,
                  fecha_aplicacion: todayStr,
                  fecha_refuerzo: calculateBooster(vacunas[0]?.id_vacuna || 1, todayStr),
                  observaciones: 'Buena tolerancia al biológico.',
                });
                setShowApplyModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#17191c] text-[#ffffff] hover:bg-[#17191c] text-[#ffffff] text-xs font-bold flex items-center gap-1.5 shadow-md "
            >
              <Plus className="w-4 h-4" />
              <span>Aplicar Vacuna</span>
            </button>
          )}
        </div>
      </div>

      {/* Pet Selector */}
      <div className="p-4 bg-[#ffffff] rounded-[20px] border border-[#ececec] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <PawPrint className="w-4 h-4 text-[#5d2a1a]" />
          <span className="text-xs font-bold text-[#777b86]">Seleccionar Paciente para Carné:</span>
        </div>

        <select
          value={selectedPetId}
          onChange={(e) => setSelectedPetId(Number(e.target.value))}
          className="w-full md:w-96 text-xs p-2 rounded-xl border border-[#e2e2e5] bg-[#ffffff] font-medium"
        >
          {mascotas.map((m) => (
            <option key={m.id_mascota} value={m.id_mascota}>
              {m.nombre} ({m.especie} - {m.raza}) [{m.codigo_expediente}]
            </option>
          ))}
        </select>
      </div>

      {/* Digital Vaccination Card Presentation */}
      {activePet && (
        <div className="bg-[#ffffff] rounded-[24px] border-2 border-emerald-400 p-6 md:p-8 shadow-lg relative overflow-hidden">
          {/* Watermark badge */}
          <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
            <Syringe className="w-48 h-48 text-[#5d2a1a]" />
          </div>

          {/* Card Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-emerald-100 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-[20px] bg-linear-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black text-2xl shadow-md ">
                {activePet.especie === 'Canino' ? '🐕' : '🐈'}
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#5d2a1a] bg-[#fbe1d1] text-[#5d2a1a] px-2.5 py-0.5 rounded-full border border-[#ececec]">
                  Carné Oficial Digital de Inmunización
                </span>
                <h3 className="text-2xl font-black text-[#17191c] mt-1">{activePet.nombre}</h3>
                <p className="text-xs text-[#979799] font-mono">
                  Expediente: <strong className="text-[#17191c]">{activePet.codigo_expediente}</strong> • Microchip:{' '}
                  <strong className="text-[#17191c]">{activePet.microchip_id || 'Sin microchip'}</strong>
                </p>
              </div>
            </div>

            {/* QR Simulation & Status */}
            <div className="flex items-center gap-4 bg-[#ffffff] p-3 rounded-[20px] border border-[#ececec]">
              <div className="w-14 h-14 bg-[#ffffff] p-1 rounded-xl border border-[#e2e2e5] flex items-center justify-center shadow-xs">
                <QrCode className="w-12 h-12 text-[#17191c]" />
              </div>
              <div className="text-xs">
                <span className="text-[#979799] block text-[10px]">Tutor Registrado:</span>
                <span className="font-bold text-[#17191c]">
                  {activeOwner ? `${activeOwner.nombres} ${activeOwner.apellidos}` : 'N/A'}
                </span>
                <span className="text-[10px] text-[#979799] block">CC: {activeOwner?.cedula_documento}</span>
              </div>
            </div>
          </div>

          {/* Doses Table */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[#17191c] uppercase tracking-wider">
                Registro de Dosis y Biológicos Aplicados
              </h4>
              <span className="text-xs text-[#979799] font-semibold">{petDoses.length} dosis registradas</span>
            </div>

            {petDoses.length === 0 ? (
              <div className="p-8 text-center bg-[#ffffff] rounded-[20px] border border-[#ececec] text-xs text-[#979799]">
                Este paciente no registra vacunas aplicadas en el sistema.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#ececec] text-[11px] font-bold text-[#979799] uppercase tracking-wider bg-[#ffffff]">
                      <th className="py-2.5 px-3">Biológico / Vacuna</th>
                      <th className="py-2.5 px-3">Laboratorio / Marca</th>
                      <th className="py-2.5 px-3 font-mono">Lote</th>
                      <th className="py-2.5 px-3">Fecha Aplicación</th>
                      <th className="py-2.5 px-3">Próximo Refuerzo</th>
                      <th className="py-2.5 px-3">Estado Refuerzo</th>
                      <th className="py-2.5 px-3">Médico Tratante</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {petDoses.map((dose) => {
                      const vac = vacunas.find((v) => v.id_vacuna === dose.id_vacuna);
                      const vet = veterinarios.find((v) => v.id_veterinario === dose.id_veterinario);

                      // Status of booster
                      let statusBadge = { label: 'Al Día', bg: 'bg-[#fbe1d1] text-[#5d2a1a]' };
                      if (dose.fecha_refuerzo) {
                        const boosterDate = new Date(dose.fecha_refuerzo);
                        const diffDays = Math.ceil((boosterDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

                        if (diffDays < 0) {
                          statusBadge = { label: 'Vencida', bg: 'bg-red-100 text-red-800' };
                        } else if (diffDays <= 30) {
                          statusBadge = {
                            label: `Vence en ${diffDays} días`,
                            bg: 'bg-amber-100 text-amber-800 animate-pulse',
                          };
                        }
                      }

                      return (
                        <tr key={dose.id_historia_vacuna} className="hover:bg-[#ffffff]/60">
                          <td className="py-3 px-3 font-bold text-[#17191c]">{vac?.nombre || 'Vacuna'}</td>
                          <td className="py-3 px-3 text-[#979799]">{vac?.marca || 'N/A'}</td>
                          <td className="py-3 px-3 font-mono font-bold text-[#5d2a1a]">{dose.lote}</td>
                          <td className="py-3 px-3 text-[#777b86]">{dose.fecha_aplicacion}</td>
                          <td className="py-3 px-3 font-bold text-[#17191c]">{dose.fecha_refuerzo || 'N/A'}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge.bg}`}>
                              {statusBadge.label}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[#979799] font-medium">
                            {vet?.nombres} ({vet?.tarjeta_profesional})
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Professional Seal / Footer */}
          <div className="mt-8 pt-6 border-t border-[#ececec] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#979799]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#5d2a1a]" />
              <span>Certificado digital avalado por la Dirección Médica de VETSOFT.</span>
            </div>
            <div className="text-right">
              <span className="block font-bold text-[#17191c]">Clínica Veterinaria Central</span>
              <span className="text-[10px] text-[#979799]">Generado el: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Aplicar Vacuna */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#ffffff]/60 backdrop-blur-xs p-4">
          <div className="bg-[#ffffff] rounded-[20px] shadow-2xl max-w-lg w-full border border-[#ececec] overflow-hidden">
            <div className="px-6 py-4 bg-[#17191c] text-[#ffffff] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-[#5d2a1a]" />
                <h3 className="font-bold text-base">RF09: Aplicación de Vacuna</h3>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-[#979799] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApply} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#777b86] mb-1">Paciente</label>
                <div className="p-2 bg-[#ffffff] border border-[#ececec] rounded-lg font-bold text-[#17191c]">
                  {activePet?.nombre} ({activePet?.especie}) - {activePet?.codigo_expediente}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#777b86] mb-1">Biológico / Vacuna</label>
                <select
                  value={vacForm.id_vacuna}
                  onChange={(e) => handleVacunaSelect(Number(e.target.value))}
                  className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                >
                  {vacunas.map((v) => (
                    <option key={v.id_vacuna} value={v.id_vacuna}>
                      {v.nombre} ({v.marca}) - Refuerzo sugerido cada {v.dias_refuerzo_sugeridos} días
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#777b86] mb-1">Número de Lote (RF09)</label>
                  <input
                    type="text"
                    required
                    value={vacForm.lote}
                    onChange={(e) => setVacForm({ ...vacForm, lote: e.target.value })}
                    className="w-full p-2 border border-[#e2e2e5] rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#777b86] mb-1">Médico Veterinario</label>
                  <select
                    value={vacForm.id_veterinario}
                    onChange={(e) => setVacForm({ ...vacForm, id_veterinario: Number(e.target.value) })}
                    className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                  >
                    {veterinarios.map((v) => (
                      <option key={v.id_veterinario} value={v.id_veterinario}>
                        {v.nombres} ({v.tarjeta_profesional})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#777b86] mb-1">Fecha de Aplicación</label>
                  <input
                    type="date"
                    required
                    value={vacForm.fecha_aplicacion}
                    onChange={(e) => handleAppDateChange(e.target.value)}
                    className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#777b86] mb-1">
                    Próximo Refuerzo (Cálculo Automático)
                  </label>
                  <input
                    type="date"
                    required
                    value={vacForm.fecha_refuerzo}
                    onChange={(e) => setVacForm({ ...vacForm, fecha_refuerzo: e.target.value })}
                    className="w-full p-2 border border-[#ececec] rounded-lg bg-[#fbe1d1] text-[#5d2a1a]/50 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#777b86] mb-1">Observaciones</label>
                <input
                  type="text"
                  value={vacForm.observaciones}
                  onChange={(e) => setVacForm({ ...vacForm, observaciones: e.target.value })}
                  placeholder="ej. Aplicación subcutánea sin reacciones inmediatas"
                  className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                />
              </div>

              {feedback && (
                <div
                  className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                    feedback.isError
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-[#fbe1d1] text-[#5d2a1a] border border-[#ececec]'
                  }`}
                >
                  {feedback.isError ? (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#5d2a1a]" />
                  )}
                  <span>{feedback.text}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 border border-[#e2e2e5] text-[#777b86] rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#17191c] text-[#ffffff] hover:bg-[#17191c] text-[#ffffff] rounded-lg font-bold"
                >
                  Registrar en Carné
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
