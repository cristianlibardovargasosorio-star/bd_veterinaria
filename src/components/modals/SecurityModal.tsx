import React, { useState } from 'react';
import { useStore } from '../../db/store';
import { ShieldCheck, Lock, AlertTriangle, KeyRound, CheckCircle2, RotateCcw } from 'lucide-react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({ isOpen, onClose }) => {
  const { usuarios, login, currentUser, verificarOtp } = useStore();

  const [selectedEmail, setSelectedEmail] = useState(currentUser.correo);
  const [testPassword, setTestPassword] = useState('vetsoft123');
  const [loginMessage, setLoginMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const targetUser = usuarios.find((u) => u.correo === selectedEmail) || usuarios[0];

  const handleTestLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpVerified(null);
    const result = login(selectedEmail, testPassword);
    setLoginMessage({
      text: result.message,
      isError: !result.success,
    });
    if (result.otp) {
      setOtpInput(result.otp);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = verificarOtp(otpInput);
    setOtpVerified(ok);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">RF01: Demostrador de Autenticación, BCrypt y OTP</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
          {/* Theory & SRS Spec */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Garantía Tecnológica RF01 & RNF03 (Seguridad):
            </div>
            <p>
              • Hash <strong>BCrypt</strong> almacenado en base de datos (campo <code>contrasena</code>).
            </p>
            <p>
              • Bloqueo automático de cuenta al alcanzar <strong>3 intentos fallidos consecutivos</strong>.
            </p>
            <p>
              • Código de doble factor <strong>OTP</strong> de 6 dígitos con validez de 5 minutos y registro en auditoría.
            </p>
          </div>

          {/* Test form */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Simulador de Inicio de Sesión
            </div>

            <form onSubmit={handleTestLogin} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Usuario / Correo</label>
                <select
                  value={selectedEmail}
                  onChange={(e) => {
                    setSelectedEmail(e.target.value);
                    setLoginMessage(null);
                  }}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                >
                  {usuarios.map((u) => (
                    <option key={u.id_usuario} value={u.correo}>
                      {u.correo} ({u.rol_nombre}) - {u.estado}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contraseña (Prueba errónea &lt; 4 letras)
                </label>
                <input
                  type="text"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="ej. vetsoft123 o 'mal'"
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Simular Verificación
                </button>
                <button
                  type="button"
                  onClick={() => setTestPassword('err')}
                  className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-xs font-medium"
                >
                  Probar contraseña errónea
                </button>
                <button
                  type="button"
                  onClick={() => setTestPassword('vetsoft2026')}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium"
                >
                  Probar válida
                </button>
              </div>
            </form>

            {loginMessage && (
              <div
                className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                  loginMessage.isError
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {loginMessage.isError ? (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                )}
                <span>{loginMessage.text}</span>
              </div>
            )}
          </div>

          {/* User state in DB */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Estado en Base de Datos (Tabla usuarios)</span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  targetUser.estado === 'ACTIVO'
                    ? 'bg-emerald-100 text-emerald-800'
                    : targetUser.estado === 'BLOQUEADO'
                    ? 'bg-red-100 text-red-800 animate-pulse'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {targetUser.estado}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Intentos fallidos:</span>
                <span className="font-bold text-slate-800 text-sm">
                  {targetUser.intentos_fallidos} / 3
                </span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Código OTP Activo:</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  {targetUser.otp_code || 'Ninguno'}
                </span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200 col-span-2 sm:col-span-1">
                <span className="text-slate-500 block text-[10px]">Rol Asignado:</span>
                <span className="font-bold text-purple-700">{targetUser.rol_nombre}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] mb-1">Hash BCrypt (RNF03):</span>
              <code className="block p-2 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded break-all">
                {targetUser.contrasena}
              </code>
            </div>

            {/* OTP verification */}
            {targetUser.otp_code && (
              <form onSubmit={handleVerifyOtp} className="pt-2 border-t border-slate-100 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Validar Código OTP (Doble Factor)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="6 dígitos"
                    className="w-36 text-center font-mono font-bold tracking-widest text-base p-1.5 border border-slate-300 rounded-lg"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Confirmar OTP
                  </button>
                </div>
                {otpVerified !== null && (
                  <p
                    className={`text-xs font-medium ${
                      otpVerified ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {otpVerified
                      ? '✓ OTP validado con éxito. Sesión autenticada.'
                      : '✕ Código OTP incorrecto o expirado.'}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Cerrar Demostrador
          </button>
        </div>
      </div>
    </div>
  );
};
