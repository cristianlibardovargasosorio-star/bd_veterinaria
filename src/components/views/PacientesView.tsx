import React, { useState } from 'react';
import { useStore } from '../../db/store';
import { Mascota, Propietario } from '../../types';
import { ActiveTab } from '../Sidebar';
import {
  PawPrint,
  Search,
  Plus,
  UserPlus,
  QrCode,
  Calendar,
  FileText,
  Syringe,
  Sparkles,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Phone,
  MapPin,
  IdCard,
} from 'lucide-react';

interface PacientesViewProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectPetForCard?: (idMascota: number) => void;
}

export const PacientesView: React.FC<PacientesViewProps> = ({
  onNavigateTab,
  onSelectPetForCard,
}) => {
  const {
    mascotas,
    propietarios,
    consultas,
    historiaVacunas,
    fichasIA,
    currentUser,
    currentRole,
    registrarMascota,
    registrarPropietario,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEspecie, setFilterEspecie] = useState('TODAS');
  const [selectedPet, setSelectedPet] = useState<Mascota | null>(null);

  // Modals state
  const [showNewPetModal, setShowNewPetModal] = useState(false);
  const [showNewOwnerModal, setShowNewOwnerModal] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  // Form New Pet
  const [petForm, setPetForm] = useState({
    id_propietario: propietarios[0]?.id_propietario || 1,
    codigo_expediente: `EXP-2026-${String(mascotas.length + 1).padStart(3, '0')}`,
    nombre: '',
    especie: 'Canino',
    raza: '',
    fecha_nacimiento: '2024-01-01',
    genero: 'MACHO' as Mascota['genero'],
    peso_kg: 10,
    microchip_id: '',
    estado_salud: 'SANO',
    activo: true,
  });

  // Form New Owner
  const [ownerForm, setOwnerForm] = useState({
    cedula_documento: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    direccion: '',
    id_usuario: null as number | null,
  });

  // Filter for Owner Role
  const ownerRecord = propietarios.find((p) => p.id_usuario === currentUser.id_usuario);
  const displayedPets = (
    currentRole === 'PROPIETARIO' && ownerRecord
      ? mascotas.filter((m) => m.id_propietario === ownerRecord.id_propietario)
      : mascotas
  ).filter((m) => {
    const owner = propietarios.find((p) => p.id_propietario === m.id_propietario);
    const matchesSearch =
      m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.codigo_expediente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.microchip_id && m.microchip_id.includes(searchTerm)) ||
      (owner &&
        (owner.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
          owner.cedula_documento.includes(searchTerm)));

    const matchesEspecie = filterEspecie === 'TODAS' || m.especie === filterEspecie;
    return matchesSearch && matchesEspecie;
  });

  // Handlers
  const handleCreatePet = (e: React.FormEvent) => {
    e.preventDefault();
    setModalFeedback(null);
    if (!petForm.nombre.trim()) {
      setModalFeedback({ text: 'El nombre del paciente es obligatorio', isError: true });
      return;
    }

    const res = registrarMascota(petForm);
    if (res.success) {
      setModalFeedback({ text: res.message, isError: false });
      setTimeout(() => {
        setShowNewPetModal(false);
        setModalFeedback(null);
        setPetForm({
          id_propietario: propietarios[0]?.id_propietario || 1,
          codigo_expediente: `EXP-2026-${String(mascotas.length + 2).padStart(3, '0')}`,
          nombre: '',
          especie: 'Canino',
          raza: '',
          fecha_nacimiento: '2024-01-01',
          genero: 'MACHO',
          peso_kg: 10,
          microchip_id: '',
          estado_salud: 'SANO',
          activo: true,
        });
      }, 1000);
    } else {
      setModalFeedback({ text: res.message, isError: true });
    }
  };

  const handleCreateOwner = (e: React.FormEvent) => {
    e.preventDefault();
    setModalFeedback(null);
    if (!ownerForm.nombres || !ownerForm.cedula_documento) {
      setModalFeedback({ text: 'Cédula y Nombres son requeridos', isError: true });
      return;
    }

    const res = registrarPropietario(ownerForm);
    if (res.success) {
      setModalFeedback({ text: res.message, isError: false });
      setTimeout(() => {
        setShowNewOwnerModal(false);
        setModalFeedback(null);
        setOwnerForm({
          cedula_documento: '',
          nombres: '',
          apellidos: '',
          telefono: '',
          direccion: '',
          id_usuario: null,
        });
      }, 1000);
    } else {
      setModalFeedback({ text: res.message, isError: true });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#0f172a] tracking-tight flex items-center gap-2">
            <PawPrint className="w-6 h-6 text-[#0369A1]" />
            <span>Gestión de Pacientes y Expedientes (RF05 & RF06)</span>
          </h2>
          <p className="text-xs text-[#475569] mt-0.5">
            Registro unificado con código único de expediente, microchip y vinculación a tutor legal.
          </p>
        </div>

        {currentRole !== 'PROPIETARIO' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewOwnerModal(true)}
              className="px-3.5 py-2 rounded-xl border border-[#e2e2e5] bg-[#ffffff] hover:bg-[#ffffff] text-[#475569] text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4 text-[#475569]" />
              <span>Nuevo Tutor (RF06)</span>
            </button>

            <button
              onClick={() => setShowNewPetModal(true)}
              className="px-4 py-2 rounded-xl bg-[#0D9488] text-[#ffffff] hover:bg-[#0D9488] text-[#ffffff] text-xs font-bold flex items-center gap-1.5 shadow-md  transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Paciente (RF05)</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-[#ffffff] rounded-[20px] border border-[#cbd5e1] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#475569] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, expediente, microchip o cédula..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#cbd5e1] text-xs focus:outline-hidden focus:border-[#0f172a] focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-[#475569] font-semibold shrink-0">Especie:</span>
          {['TODAS', 'Canino', 'Felino'].map((esp) => (
            <button
              key={esp}
              onClick={() => setFilterEspecie(esp)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterEspecie === esp
                  ? 'bg-[#0D9488] text-[#ffffff]'
                  : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#F1F5F9]'
              }`}
            >
              {esp}
            </button>
          ))}
        </div>
      </div>

      {/* Pacientes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedPets.map((pet) => {
          const owner = propietarios.find((p) => p.id_propietario === pet.id_propietario);
          const petConsultas = consultas.filter((c) => c.id_mascota === pet.id_mascota);
          const petVacunas = historiaVacunas.filter((v) => v.id_mascota === pet.id_mascota);

          return (
            <div
              key={pet.id_mascota}
              onClick={() => setSelectedPet(pet)}
              className="bg-[#ffffff] rounded-[20px] border border-[#cbd5e1] hover:border-emerald-400 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-linear-to-tr from-emerald-100 to-teal-50 border border-[#cbd5e1] text-[#0369A1] flex items-center justify-center font-black text-lg">
                      {pet.especie === 'Canino' ? '🐶' : pet.especie === 'Felino' ? '🐱' : '🐾'}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[#0f172a] group-hover:text-[#0369A1] transition-colors">
                        {pet.nombre}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-[#475569]">
                        <span>{pet.especie}</span>
                        <span>•</span>
                        <span>{pet.raza}</span>
                      </div>
                    </div>
                  </div>

                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#ffffff] text-[#0369A1]">
                    {pet.codigo_expediente}
                  </span>
                </div>

                <div className="p-3 bg-[#ffffff] rounded-xl space-y-1.5 text-xs text-[#475569]">
                  <div className="flex justify-between">
                    <span className="text-[#475569]">Tutor:</span>
                    <span className="font-bold text-[#0f172a]">
                      {owner ? `${owner.nombres} ${owner.apellidos}` : 'No asignado'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#475569]">Microchip:</span>
                    <span className="font-mono font-medium text-[#475569]">
                      {pet.microchip_id || 'Sin microchip'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#475569]">Peso actual:</span>
                    <span className="font-bold text-[#0f172a]">{pet.peso_kg} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#475569]">Estado de salud:</span>
                    <span className="px-1.5 py-0.2 rounded font-bold text-[10px] bg-[#E0F2FE] text-[#0369A1]">
                      {pet.estado_salud}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#475569]">
                <div className="flex items-center gap-3">
                  <span title="Consultas registradas">🩺 {petConsultas.length}</span>
                  <span title="Dosis de vacunas aplicadas">💉 {petVacunas.length}</span>
                </div>
                <span className="text-[#0369A1] font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  Ver expediente <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {displayedPets.length === 0 && (
        <div className="p-12 text-center bg-[#ffffff] rounded-[20px] border border-[#cbd5e1]">
          <PawPrint className="w-12 h-12 text-[#475569] mx-auto mb-2" />
          <h3 className="font-bold text-[#475569]">No se encontraron pacientes</h3>
          <p className="text-xs text-[#475569] mt-1">Prueba con otro término de búsqueda o registra uno nuevo.</p>
        </div>
      )}

      {/* Selected Pet Drawer / Modal */}
      {selectedPet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#ffffff]/60 backdrop-blur-xs p-4">
          <div className="bg-[#ffffff] rounded-[20px] shadow-2xl max-w-2xl w-full border border-[#cbd5e1] overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-[#F1F5F9] text-[#0f172a] border-b border-[#cbd5e1] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {selectedPet.especie === 'Canino' ? '🐶' : '🐱'}
                </span>
                <div>
                  <h3 className="font-black text-lg">{selectedPet.nombre}</h3>
                  <p className="text-xs text-[#0369A1] font-mono">
                    Expediente {selectedPet.codigo_expediente} • Microchip: {selectedPet.microchip_id || 'N/A'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPet(null)}
                className="text-[#475569] hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Pet Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-[#ffffff] rounded-xl border border-[#cbd5e1]">
                  <span className="text-[#475569] block text-[10px]">Especie / Raza</span>
                  <span className="font-bold text-[#0f172a]">{selectedPet.especie} - {selectedPet.raza}</span>
                </div>
                <div className="p-3 bg-[#ffffff] rounded-xl border border-[#cbd5e1]">
                  <span className="text-[#475569] block text-[10px]">Género</span>
                  <span className="font-bold text-[#0f172a]">{selectedPet.genero}</span>
                </div>
                <div className="p-3 bg-[#ffffff] rounded-xl border border-[#cbd5e1]">
                  <span className="text-[#475569] block text-[10px]">Peso Actual</span>
                  <span className="font-bold text-[#0f172a]">{selectedPet.peso_kg} kg</span>
                </div>
                <div className="p-3 bg-[#ffffff] rounded-xl border border-[#cbd5e1]">
                  <span className="text-[#475569] block text-[10px]">Nacimiento</span>
                  <span className="font-bold text-[#0f172a]">{selectedPet.fecha_nacimiento}</span>
                </div>
              </div>

              {/* Owner info */}
              {(() => {
                const owner = propietarios.find((p) => p.id_propietario === selectedPet.id_propietario);
                return (
                  <div className="p-4 rounded-xl border border-[#cbd5e1] bg-[#ffffff]/50 space-y-2">
                    <div className="text-xs font-bold text-[#475569] uppercase tracking-wider flex items-center gap-1.5">
                      <IdCard className="w-4 h-4 text-[#0369A1]" />
                      <span>Datos del Tutor Legal (RF06)</span>
                    </div>
                    {owner ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[#475569]">Nombre: </span>
                          <strong className="text-[#0f172a]">{owner.nombres} {owner.apellidos}</strong>
                        </div>
                        <div>
                          <span className="text-[#475569]">Cédula/Documento: </span>
                          <strong className="text-[#0f172a] font-mono">{owner.cedula_documento}</strong>
                        </div>
                        <div className="flex items-center gap-1 text-[#475569]">
                          <Phone className="w-3.5 h-3.5 text-[#475569]" />
                          <span>{owner.telefono}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[#475569]">
                          <MapPin className="w-3.5 h-3.5 text-[#475569]" />
                          <span className="truncate">{owner.direccion}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-red-500">Sin tutor asociado</p>
                    )}
                  </div>
                );
              })()}

              {/* Quick Clinical History */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                  Historial de Consultas Médicas
                </div>
                {consultas.filter((c) => c.id_mascota === selectedPet.id_mascota).length === 0 ? (
                  <div className="p-4 text-center bg-[#ffffff] rounded-xl text-xs text-[#475569]">
                    No registra consultas médicas previas.
                  </div>
                ) : (
                  consultas
                    .filter((c) => c.id_mascota === selectedPet.id_mascota)
                    .map((con) => (
                      <div
                        key={con.id_consulta}
                        className="p-3.5 rounded-xl border border-[#cbd5e1] bg-[#ffffff] space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[#0369A1]">Consulta #{con.id_consulta}</span>
                          <span className="text-[#475569]">{new Date(con.fecha_consulta).toLocaleDateString()}</span>
                        </div>
                        <p className="font-semibold text-[#0f172a]">Dx: {con.diagnostico}</p>
                        <p className="text-[#475569] text-[11px]">Tx: {con.tratamiento_recetado}</p>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="px-6 py-3 bg-[#F1F5F9] border-t border-[#cbd5e1] flex flex-wrap items-center justify-between gap-2 shrink-0">
              <button
                onClick={() => {
                  if (onSelectPetForCard) onSelectPetForCard(selectedPet.id_mascota);
                  onNavigateTab('vacunacion');
                }}
                className="px-3 py-1.5 bg-[#ffffff] hover:bg-[#F1F5F9] text-[#0f172a] rounded-lg text-xs font-bold border border-[#e2e2e5] flex items-center gap-1.5"
              >
                <Syringe className="w-3.5 h-3.5 text-[#0369A1]" />
                <span>Ver Carné de Vacunas (RF09)</span>
              </button>

              {currentRole !== 'PROPIETARIO' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onNavigateTab('citas');
                    }}
                    className="px-3.5 py-1.5 bg-[#ffffff] hover:bg-[#E0F2FE] text-[#0f172a] hover:text-[#0369A1] border border-[#cbd5e1] rounded-full text-xs font-medium transition-colors"
                  >
                    Agendar Cita
                  </button>
                  <button
                    onClick={() => {
                      onNavigateTab('consultas');
                    }}
                    className="px-3.5 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-[#ffffff] rounded-full text-xs font-medium transition-colors"
                  >
                    Iniciar Consulta
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Registrar Paciente (RF05) */}
      {showNewPetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#ffffff]/60 backdrop-blur-xs p-4">
          <div className="bg-[#ffffff] rounded-[20px] shadow-2xl max-w-xl w-full border border-[#cbd5e1] overflow-hidden">
            <div className="px-6 py-4 bg-[#F1F5F9] text-[#0f172a] border-b border-[#cbd5e1] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PawPrint className="w-5 h-5 text-[#0369A1]" />
                <h3 className="font-bold text-base">RF05: Registrar Nuevo Paciente</h3>
              </div>
              <button
                onClick={() => setShowNewPetModal(false)}
                className="text-[#475569] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePet} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#475569] mb-1">
                    Código de Expediente (Único)
                  </label>
                  <input
                    type="text"
                    required
                    value={petForm.codigo_expediente}
                    onChange={(e) => setPetForm({ ...petForm, codigo_expediente: e.target.value })}
                    className="w-full p-2 border border-[#e2e2e5] rounded-lg font-mono font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#475569] mb-1">Tutor / Propietario (FK)</label>
                  <select
                    value={petForm.id_propietario}
                    onChange={(e) => setPetForm({ ...petForm, id_propietario: Number(e.target.value) })}
                    className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                  >
                    {propietarios.map((p) => (
                      <option key={p.id_propietario} value={p.id_propietario}>
                        {p.nombres} {p.apellidos} (CC: {p.cedula_documento})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#475569] mb-1">Nombre del Paciente</label>
                  <input
                    type="text"
                    required
                    value={petForm.nombre}
                    onChange={(e) => setPetForm({ ...petForm, nombre: e.target.value })}
                    placeholder="ej. Bruno"
                    className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#475569] mb-1">Especie</label>
                  <select
                    value={petForm.especie}
                    onChange={(e) => setPetForm({ ...petForm, especie: e.target.value })}
                    className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                  >
                    <option value="Canino">Canino</option>
                    <option value="Felino">Felino</option>
                    <option value="Ave">Ave</option>
                    <option value="Roedor">Roedor</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#475569] mb-1">Raza</label>
                  <input
                    type="text"
                    required
                    value={petForm.raza}
                    onChange={(e) => setPetForm({ ...petForm, raza: e.target.value })}
                    placeholder="ej. Labrador, Mestizo, etc."
                    className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#475569] mb-1">Género</label>
                  <select
                    value={petForm.genero}
                    onChange={(e) => setPetForm({ ...petForm, genero: e.target.value as any })}
                    className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                  >
                    <option value="MACHO">MACHO</option>
                    <option value="HEMBRA">HEMBRA</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#475569] mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={petForm.peso_kg}
                    onChange={(e) => setPetForm({ ...petForm, peso_kg: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#475569] mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    required
                    value={petForm.fecha_nacimiento}
                    onChange={(e) => setPetForm({ ...petForm, fecha_nacimiento: e.target.value })}
                    className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#475569] mb-1">Microchip ID (Opcional)</label>
                  <input
                    type="text"
                    value={petForm.microchip_id}
                    onChange={(e) => setPetForm({ ...petForm, microchip_id: e.target.value })}
                    placeholder="ej. 985141002948123"
                    className="w-full p-2 border border-[#e2e2e5] rounded-lg font-mono"
                  />
                </div>
              </div>

              {modalFeedback && (
                <div
                  className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                    modalFeedback.isError
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-[#E0F2FE] text-[#0369A1] border border-[#cbd5e1]'
                  }`}
                >
                  {modalFeedback.isError ? (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0369A1]" />
                  )}
                  <span>{modalFeedback.text}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewPetModal(false)}
                  className="px-4 py-2 border border-[#e2e2e5] text-[#475569] rounded-lg text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0D9488] text-[#ffffff] hover:bg-[#0D9488] text-[#ffffff] rounded-lg text-xs font-bold"
                >
                  Guardar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registrar Tutor (RF06) */}
      {showNewOwnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#ffffff]/60 backdrop-blur-xs p-4">
          <div className="bg-[#ffffff] rounded-[20px] shadow-2xl max-w-lg w-full border border-[#cbd5e1] overflow-hidden">
            <div className="px-6 py-4 bg-[#F1F5F9] text-[#0f172a] border-b border-[#cbd5e1] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#0369A1]" />
                <h3 className="font-bold text-base">RF06: Registrar Propietario / Tutor Legal</h3>
              </div>
              <button
                onClick={() => setShowNewOwnerModal(false)}
                className="text-[#475569] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOwner} className="p-6 space-y-4">
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#475569] mb-1">
                    Cédula / Documento de Identidad (Único)
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerForm.cedula_documento}
                    onChange={(e) => setOwnerForm({ ...ownerForm, cedula_documento: e.target.value })}
                    placeholder="ej. 1098472910"
                    className="w-full p-2 border border-[#e2e2e5] rounded-lg font-mono font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">Nombres</label>
                    <input
                      type="text"
                      required
                      value={ownerForm.nombres}
                      onChange={(e) => setOwnerForm({ ...ownerForm, nombres: e.target.value })}
                      placeholder="ej. María José"
                      className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">Apellidos</label>
                    <input
                      type="text"
                      required
                      value={ownerForm.apellidos}
                      onChange={(e) => setOwnerForm({ ...ownerForm, apellidos: e.target.value })}
                      placeholder="ej. Rojas Gómez"
                      className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#475569] mb-1">Teléfono de Contacto</label>
                  <input
                    type="tel"
                    required
                    value={ownerForm.telefono}
                    onChange={(e) => setOwnerForm({ ...ownerForm, telefono: e.target.value })}
                    placeholder="ej. +57 312 900 1234"
                    className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#475569] mb-1">Dirección de Residencia</label>
                  <input
                    type="text"
                    required
                    value={ownerForm.direccion}
                    onChange={(e) => setOwnerForm({ ...ownerForm, direccion: e.target.value })}
                    placeholder="ej. Carrera 15 # 85 - 20"
                    className="w-full p-2 border border-[#e2e2e5] rounded-lg"
                  />
                </div>
              </div>

              {modalFeedback && (
                <div
                  className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                    modalFeedback.isError
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-[#E0F2FE] text-[#0369A1] border border-[#cbd5e1]'
                  }`}
                >
                  {modalFeedback.isError ? (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0369A1]" />
                  )}
                  <span>{modalFeedback.text}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewOwnerModal(false)}
                  className="px-4 py-2 border border-[#e2e2e5] text-[#475569] rounded-lg text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0D9488] text-[#ffffff] hover:bg-[#0D9488] text-[#ffffff] rounded-lg text-xs font-bold"
                >
                  Guardar Propietario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
