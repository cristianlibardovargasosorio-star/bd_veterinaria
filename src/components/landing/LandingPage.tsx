import React, { useState } from 'react';
import { LazyScrollSection } from '../common/LazyScrollSection';
import { SkeletonCard, SkeletonKPI, SkeletonTable, SkeletonText } from '../common/Skeleton';
import {
  Stethoscope,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Syringe,
  Boxes,
  Receipt,
  FileCheck2,
  Heart,
  Thermometer,
  Scale,
  QrCode,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lock,
  Layers,
  Activity,
  BotMessageSquare,
  TrendingUp,
} from 'lucide-react';

interface LandingPageProps {
  onEnterERP: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterERP }) => {
  const [showSkeletonMode, setShowSkeletonMode] = useState(false);
  const [activeDemoTab, setActiveDemoTab] = useState<'ia' | 'carne' | 'lotes' | 'pos'>('ia');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Images generated via generate_image tool
  const heroImg = '/src/assets/images/landing_vet_hero_1794425108227.jpg';
  const aiTabletImg = '/src/assets/images/landing_ai_diagnostics_1794425109106.jpg';
  const petCareImg = '/src/assets/images/landing_pet_care_1794425109279.jpg';

  const faqs = [
    {
      q: '¿Cómo funciona la generación dual de fichas médicas con Gemini 3.8 Flash (RF10)?',
      a: 'Al registrar una consulta médica, VETSOFT envía las constantes vitales, anamnesis y diagnóstico al motor Gemini 3.8 Flash. La IA procesa y genera automáticamente dos salidas en una sola respuesta: 1) Un resumen claro, empático y explicativo para el tutor del paciente con instrucciones de medicación; 2) Una síntesis médica concisa en terminología técnica para el expediente clínico oficial, la cual requiere firma y aprobación del veterinario tratante.',
    },
    {
      q: '¿Cómo previene el sistema que se despache un medicamento vencido en el POS?',
      a: 'A través de los triggers de base de datos (trg_lote_vencimiento_bi) y los procedimientos almacenados (sp_confirmar_factura). El sistema verifica atómicamente que el lote seleccionado tenga fecha_vencimiento >= fecha actual. Si el lote ha expirado o no tiene stock vendible, la transacción se revierte con SIGNAL SQLSTATE 45000.',
    },
    {
      q: '¿Qué mecanismos de seguridad protegen las historias clínicas (RF01 y RNF03)?',
      a: 'Las credenciales se resguardan mediante hashing BCrypt. El sistema incorpora bloqueo automático de la cuenta tras 3 intentos fallidos consecutivos, doble factor de autenticación mediante código OTP de 6 dígitos con validez de 5 minutos y registro inmutable en auditoria_sistema de cada operación realizada.',
    },
    {
      q: '¿Los propietarios pueden acceder al carné digital de sus mascotas?',
      a: 'Sí. VETSOFT incluye un rol nativo para Propietarios donde pueden visualizar sus pacientes, su carné digital de vacunación con cálculo de próximos refuerzos y los resúmenes empáticos generados por el médico tratante.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-600 selection:text-white scroll-smooth">
      {/* Top Bar Contract: [Brand wordmark] - [Nav links] - [Primary Action] */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a href="#" className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">VETSOFT</span>
          </a>

          {/* Zone 2: Concise single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a href="#capacidades" className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0">
              Capacidades
            </a>
            <a href="#ia-clinica" className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0">
              Motor IA
            </a>
            <a href="#demo" className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0">
              Demostración
            </a>
            <a href="#planes" className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0">
              Planes
            </a>
            <a href="#faq" className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0">
              Preguntas
            </a>
          </nav>

          {/* Zone 3: Skeleton mode toggle + Primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowSkeletonMode(!showSkeletonMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                showSkeletonMode
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
              title="Alternar vista skeleton para verificar estados de carga"
            >
              {showSkeletonMode ? 'Modo Normal' : 'Modo Skeleton'}
            </button>

            <button
              onClick={onEnterERP}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Ingresar al Sistema Clínico</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* SKELETON MODE PREVIEW BANNER (IF ACTIVE) */}
      {showSkeletonMode && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold text-center">
          Modo Skeleton Activado: Previsualización de estados de carga y esqueletos shimmer en toda la interfaz.
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-linear-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LazyScrollSection className="max-w-3xl mx-auto text-center space-y-6">
            {/* Metadata kicker */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
              <span className="font-bold text-emerald-700">VETSOFT ERP 2026</span>
              <span aria-hidden="true">·</span>
              <span>Gemini 3.8 Flash Integrado</span>
              <span aria-hidden="true">·</span>
              <span>Auditoría Relacional ACID</span>
            </div>

            {/* Display headline with balance to prevent orphans */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08] text-balance">
              El Sistema Operativo para la Veterinaria Moderna y la Inteligencia Clínica
            </h1>

            {/* Value Proposition */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed text-balance">
              Expedientes médicos unificados con constantes vitales, carné digital de vacunas, trazabilidad
              estricta de inventario por lotes y síntesis clínica dual con inteligencia artificial.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={onEnterERP}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Acceder al Sistema VETSOFT</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#demo"
                className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-xl border border-slate-300 shadow-xs transition-colors"
              >
                Ver Demostración en Vivo
              </a>
            </div>
          </LazyScrollSection>

          {/* Hero Visual Showcase */}
          <LazyScrollSection delay={150} className="mt-12 max-w-5xl mx-auto">
            {showSkeletonMode ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
                <div className="w-full h-80 md:h-[460px] bg-slate-200 rounded-2xl animate-pulse flex items-center justify-center text-slate-400 font-mono text-xs">
                  [Skeleton Shimmer Image: 16:9 Hero Viewport]
                </div>
                <div className="grid grid-cols-4 gap-4 pt-2">
                  <SkeletonKPI />
                  <SkeletonKPI />
                  <SkeletonKPI />
                  <SkeletonKPI />
                </div>
              </div>
            ) : (
              <div className="relative rounded-3xl overflow-hidden border-2 border-slate-200/80 shadow-2xl bg-slate-900 group">
                <img
                  src={heroImg}
                  alt="Instalaciones del Hospital Veterinario VETSOFT con veterinario examinando paciente canino"
                  referrerPolicy="no-referrer"
                  className="w-full h-80 md:h-[480px] object-cover object-center group-hover:scale-[1.01] transition-transform duration-700"
                />

                {/* Scrim Overlay with Active Clinical Badge */}
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-950/20 to-transparent flex items-end p-6 sm:p-8">
                  <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
                        <span>CONSULTA ACTIVA: EXP-2026-001</span>
                        <span>·</span>
                        <span>LUCAS (GOLDEN RETRIEVER)</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-200">
                        Constantes: FC 95 lpm · Temp 39.1°C · Peso 28.5 kg · Diagnóstico: Gastritis aguda
                      </p>
                    </div>

                    <button
                      onClick={onEnterERP}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 self-start sm:self-auto shrink-0 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Abrir Ficha en el ERP</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Proof Metrics Strip */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs text-center">
                <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">+14,200</span>
                <span className="block text-xs text-slate-500 mt-0.5">Pacientes Atendidos</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs text-center">
                <span className="text-2xl font-black text-emerald-700 font-mono tabular-nums">99.9%</span>
                <span className="block text-xs text-slate-500 mt-0.5">Disponibilidad ACID</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs text-center">
                <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">0%</span>
                <span className="block text-xs text-slate-500 mt-0.5">Medicamentos Vencidos en POS</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs text-center">
                <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">2.4 seg</span>
                <span className="block text-xs text-slate-500 mt-0.5">Tiempo de Respuesta IA</span>
              </div>
            </div>
          </LazyScrollSection>
        </div>
      </section>

      {/* CORE CAPABILITIES (BENTO GRID) */}
      <section id="capacidades" className="py-20 md:py-28 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LazyScrollSection className="max-w-2xl mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
              Capacidades Principales
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Ingeniería Clínica para Toda la Operación Hospitalaria
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Cumplimiento riguroso de los requisitos del SRS (RF01 a RF11), garantizando trazabilidad
              médica inmutable y control financiero transaccional.
            </p>
          </LazyScrollSection>

          {showSkeletonMode ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Expedientes y Vitals */}
              <LazyScrollSection delay={50} className="p-6 rounded-3xl border border-slate-200 bg-slate-50/50 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">01. Expedientes y Constantes Vitales</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Registro estructurado de frecuencia cardíaca, temperatura corporal, evolución de peso y
                    anamnesis por paciente con código de expediente único y microchip.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-700 space-y-1">
                  <div className="flex justify-between">
                    <span>FC habitual:</span>
                    <strong className="text-emerald-700">70 - 120 lpm</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Temp normotermia:</span>
                    <strong className="text-emerald-700">38.0 - 39.2 °C</strong>
                  </div>
                </div>
              </LazyScrollSection>

              {/* Card 2: Motor IA Dual Gemini 3.8 */}
              <LazyScrollSection delay={100} className="md:col-span-2 p-6 rounded-3xl border-2 border-emerald-300 bg-linear-to-br from-emerald-50/60 to-teal-50/30 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-mono">
                      Gemini 3.8 Flash
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">02. Fichas Clínicas con IA Dual (RF10)</h3>
                  <p className="text-xs text-slate-700 leading-relaxed max-w-xl">
                    Generación simultánea de un resumen empático y educativo para el tutor del paciente junto a
                    una síntesis médica condensada en terminología veterinaria para el expediente interno.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-emerald-200">
                    <span className="font-bold text-emerald-900 block mb-1">Para el Tutor:</span>
                    <p className="text-slate-600 text-[11px]">
                      "Le explicamos cómo suministrar el antibiótico en ayunas y signos de alerta claros."
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-200">
                    <span className="font-bold text-slate-900 block mb-1">Para el Expediente:</span>
                    <p className="text-slate-600 text-[11px] font-mono">
                      "Dx definitivo, clasificación etiológica y evolución clínica estandarizada."
                    </p>
                  </div>
                </div>
              </LazyScrollSection>

              {/* Card 3: Control de Lotes y Vencimientos */}
              <LazyScrollSection delay={150} className="md:col-span-2 p-6 rounded-3xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Boxes className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">03. Control Estricto de Lotes y Vencimientos</h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                    Protección por trigger SQL <code>trg_lote_vencimiento_bi</code>. Monitorea existencias en
                    tiempo real a través de las vistas <code>vw_existencias</code> y <code>vw_alertas_stock</code>.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-slate-600">Stock Vendible: Lotes no caducados</span>
                  <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    Bloqueo de Venta Inmediato a Caducidad
                  </span>
                </div>
              </LazyScrollSection>

              {/* Card 4: Facturación POS Transaccional */}
              <LazyScrollSection delay={200} className="p-6 rounded-3xl border border-slate-200 bg-slate-50/50 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">04. Facturación POS Transaccional</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Procedimientos almacenados controlados <code>sp_confirmar_factura</code> con deducción
                    atómica de inventario y generación de comprobantes térmicos.
                  </p>
                </div>
                <div className="text-xs font-bold text-emerald-700">Deducción en movimientos_inventario</div>
              </LazyScrollSection>

              {/* Card 5: Carné Digital */}
              <LazyScrollSection delay={250} className="p-6 rounded-3xl border border-slate-200 bg-slate-50/50 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                    <Syringe className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">05. Carné Digital de Inmunización</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Registro de biológicos con número de lote, cálculo automático de fecha de refuerzo y carné
                    con código QR oficial para viajes y controles.
                  </p>
                </div>
                <div className="text-xs font-bold text-teal-700">Refuerzos con alerta automática 30 días</div>
              </LazyScrollSection>

              {/* Card 6: Auditoría Inmutable */}
              <LazyScrollSection delay={300} className="md:col-span-2 p-6 rounded-3xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">06. Auditoría Inmutable del Sistema</h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                    Registro cronológico completo en <code>auditoria_sistema</code> para cada inserción,
                    modificación o eliminación, garantizando total transparencia médico-legal y financiera.
                  </p>
                </div>
                <div className="text-xs font-mono text-purple-800">
                  Tablas auditadas: usuarios, mascotas, consultas, facturas, lotes, fichas_ia
                </div>
              </LazyScrollSection>
            </div>
          )}
        </div>
      </section>

      {/* INTERACTIVE FEATURE SHOWCASE / DEMO */}
      <section id="demo" className="py-20 md:py-28 bg-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LazyScrollSection className="max-w-2xl mx-auto text-center space-y-3 mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
              Demostración Interactiva
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Experimenta los Módulos de VETSOFT
            </h2>
            <p className="text-sm text-slate-600">
              Explora cómo se visualizan las herramientas clínicas antes de entrar al sistema de gestión.
            </p>
          </LazyScrollSection>

          {/* Demo Navigation Tabs */}
          <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto pb-2">
            {[
              { id: 'ia', label: 'Ficha Clínica IA (RF10)' },
              { id: 'carne', label: 'Carné Digital (RF09)' },
              { id: 'lotes', label: 'Control de Lotes (SQL)' },
              { id: 'pos', label: 'Facturación POS' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveDemoTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeDemoTab === tab.id
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Demo Content Container */}
          <LazyScrollSection className="max-w-4xl mx-auto">
            {showSkeletonMode ? (
              <SkeletonTable rows={4} />
            ) : (
              <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl p-6 sm:p-8">
                {activeDemoTab === 'ia' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          RESPUESTA IA CERTIFICADA
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-1">
                          Caso Clínico: Lucas (Golden Retriever, 28.5 kg)
                        </h4>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">Gemini 3.8 Flash</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                        <strong className="text-emerald-950 block">1. Para el Tutor (Resumen Empático):</strong>
                        <p className="text-slate-700 leading-relaxed">
                          "Estimado tutor de Lucas: Durante la consulta evaluamos su estado físico general. Presenta
                          un cuadro de inflamación estomacal (gastritis) debido a algo que ingirió. Es fundamental
                          suministrar Omeprazol 20mg cada 24h por 5 días en ayunas y ofrecerle dieta blanda fraccionada."
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 font-mono">
                        <strong className="text-slate-900 block font-sans">2. Expediente Médico (Técnico):</strong>
                        <p className="text-slate-700 leading-relaxed text-[11px]">
                          "Paciente canino con gastritis aguda manifestada por hipertermia leve (39.1°C) y emesis. Plan
                          de manejo sintomático mediante antisecretores gástricos y soporte nutricional blando sin
                          evidencia radiográfica de obstrucción intestinal."
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Firma del Veterinario: Dr. Camilo Restrepo (TP 19823-VET)</span>
                      </div>
                      <button
                        onClick={onEnterERP}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                      >
                        Generar en el ERP →
                      </button>
                    </div>
                  </div>
                )}

                {activeDemoTab === 'carne' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                          CARNÉ OFICIAL DIGITAL
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-1">
                          Pasaporte de Vacunación con Código QR
                        </h4>
                      </div>
                      <QrCode className="w-8 h-8 text-slate-700" />
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
                      <div className="flex justify-between font-bold text-slate-800 pb-2 border-b border-slate-200">
                        <span>Biológico / Lote</span>
                        <span>Aplicación</span>
                        <span>Próximo Refuerzo</span>
                        <span>Estado</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-700">
                        <span>Antirrábica Rabisin-I (Lote: RAB-2025-99B)</span>
                        <span>2025-11-20</span>
                        <span className="font-bold">2026-11-20</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Al Día
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-700">
                        <span>Séxtuple Canina Vanguard (Lote: SEX-2025-11X)</span>
                        <span>2025-12-05</span>
                        <span className="font-bold">2026-12-05</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Al Día
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={onEnterERP}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                      >
                        Abrir Módulo de Vacunación →
                      </button>
                    </div>
                  </div>
                )}

                {activeDemoTab === 'lotes' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          VISTA SQL: vw_existencias
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-1">
                          Control de Existencias Físicas vs Vendibles vs Vencidas
                        </h4>
                      </div>
                    </div>

                    <div className="overflow-x-auto text-xs">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 font-mono">
                            <th className="py-2">SKU</th>
                            <th className="py-2">Producto</th>
                            <th className="py-2 text-center">Físico</th>
                            <th className="py-2 text-center text-emerald-700 font-bold">Vendible</th>
                            <th className="py-2 text-center text-red-600 font-bold">Vencido</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr>
                            <td className="py-2.5 font-mono">MED-OME-20MG</td>
                            <td className="py-2.5 font-bold">Omeprazol 20mg x 30</td>
                            <td className="py-2.5 text-center">24</td>
                            <td className="py-2.5 text-center font-bold text-emerald-700">24</td>
                            <td className="py-2.5 text-center text-slate-400">0</td>
                          </tr>
                          <tr className="bg-red-50/50">
                            <td className="py-2.5 font-mono">VAC-RAB-01</td>
                            <td className="py-2.5 font-bold">Dosis Antirrábica Rabisin-I</td>
                            <td className="py-2.5 text-center">26</td>
                            <td className="py-2.5 text-center font-bold text-emerald-700">18</td>
                            <td className="py-2.5 text-center font-bold text-red-600">8 (Lote caducado)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={onEnterERP}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                      >
                        Gestionar Bodega y Lotes →
                      </button>
                    </div>
                  </div>
                )}

                {activeDemoTab === 'pos' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          STORED PROCEDURE POS
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-1">
                          sp_confirmar_factura(p_factura, p_responsable)
                        </h4>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-xs space-y-1">
                      <p>START TRANSACTION;</p>
                      <p>UPDATE lotes SET stock_actual = stock_actual - 1 WHERE id_lote = 101;</p>
                      <p>INSERT INTO movimientos_inventario (tipo, cantidad_delta) VALUES ('VENTA', -1);</p>
                      <p>UPDATE facturas SET estado = 'PAGADA', total = 39.00 WHERE id_factura = 1001;</p>
                      <p>COMMIT; /* Transacción ACID Exitosa */</p>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={onEnterERP}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                      >
                        Abrir Punto de Venta POS →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </LazyScrollSection>
        </div>
      </section>

      {/* PRICING & PLANS */}
      <section id="planes" className="py-20 md:py-28 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LazyScrollSection className="max-w-2xl mx-auto text-center space-y-3 mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
              Planes y Suscripción
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Precios Transparentes para Cada Escala
            </h2>
            <p className="text-sm text-slate-600">
              Desde consultorios veterinarios individuales hasta hospitales veterinarios de alta complejidad.
            </p>
          </LazyScrollSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plan Consultorio */}
            <LazyScrollSection delay={50} className="p-8 rounded-3xl border border-slate-200 bg-white flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Plan Consultorio
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">$39</span>
                  <span className="text-xs text-slate-500">/ mes</span>
                </div>
                <p className="text-xs text-slate-600">
                  Para profesionales independientes o consultorios individuales.
                </p>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Hasta 500 expedientes activos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Carné digital con código QR</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Agenda y recordatorios</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onEnterERP}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
              >
                Probar Consultorio
              </button>
            </LazyScrollSection>

            {/* Plan Clínica Especializada (Marquee) */}
            <LazyScrollSection delay={100} className="p-8 rounded-3xl border-2 border-emerald-500 bg-linear-to-b from-emerald-50/40 via-white to-white flex flex-col justify-between space-y-6 shadow-xl relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                Más Elegido por Clínicas
              </div>

              <div className="space-y-4 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 font-mono">
                  Clínica Especializada
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">$89</span>
                  <span className="text-xs text-slate-500">/ mes</span>
                </div>
                <p className="text-xs text-slate-600">
                  Para clínicas con equipo veterinario, quirófano y farmacia con lotes.
                </p>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Expedientes ilimitados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <strong className="text-emerald-900">Motor Gemini 3.8 Flash (RF10 y RF11)</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Control de lotes y vencimiento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Punto de Venta POS transaccional</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onEnterERP}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                Comenzar con Clínica Especializada
              </button>
            </LazyScrollSection>

            {/* Plan Hospital Veterinario 24/7 */}
            <LazyScrollSection delay={150} className="p-8 rounded-3xl border border-slate-200 bg-white flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Hospital 24/7 & Multi-Sede
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">$179</span>
                  <span className="text-xs text-slate-500">/ mes</span>
                </div>
                <p className="text-xs text-slate-600">
                  Para centros de urgencias, hospitalización y múltiples sedes veterinarias.
                </p>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Usuarios y sedes ilimitadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Auditoría forense inmutable total</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>SLA de disponibilidad 99.95%</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onEnterERP}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Solicitar Demostración Hospital
              </button>
            </LazyScrollSection>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 md:py-28 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <LazyScrollSection className="text-center space-y-3 mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
              Resolución de Preguntas
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Preguntas Frecuentes sobre VETSOFT
            </h2>
          </LazyScrollSection>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <LazyScrollSection key={idx} delay={idx * 60}>
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              </LazyScrollSection>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION BANNER */}
      <section className="py-20 bg-linear-to-r from-slate-900 via-emerald-950 to-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">
            DISPONIBLE AHORA
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Eleva el Estándar Médico y Administrativo de tu Clínica Veterinaria
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Sin instalaciones complejas. Ingresa directamente al sistema con perfiles preconfigurados de
            Administrador, Veterinario, Recepcionista y Propietario.
          </p>

          <div className="pt-2">
            <button
              onClick={onEnterERP}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-600/30 inline-flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Ingresar al Sistema de Gestión VETSOFT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* QUIET FOOTER */}
      <footer className="py-12 bg-slate-950 text-slate-400 text-xs border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              V
            </div>
            <span className="font-bold text-slate-200">VETSOFT Clinical Systems</span>
            <span className="text-slate-600">·</span>
            <span>Estándar SRS & Motor Gemini 3.8 Flash</span>
          </div>

          <div className="flex items-center gap-6 text-slate-500">
            <a href="#capacidades" className="hover:text-slate-300 transition-colors">Capacidades</a>
            <a href="#demo" className="hover:text-slate-300 transition-colors">Demostración</a>
            <a href="#planes" className="hover:text-slate-300 transition-colors">Planes</a>
            <button onClick={onEnterERP} className="text-emerald-400 font-bold hover:underline">
              Acceder al ERP
            </button>
          </div>

          <div>
            <span>© {new Date().getFullYear()} VETSOFT. Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
