'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState('');

  const { requestPasswordReset } = useAuth();

  const resetForm = () => {
    setStep('email');
    setEmail('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage('');
    setErrors('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors('');
    setMessage('');

    if (!validateEmail(email)) {
      setErrors('Por favor ingresa un email válido');
      return;
    }

    setIsSubmitting(true);

    try {
      // Usar la API de Supabase para envío de OTP por email
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: false // Solo para usuarios existentes
        }
      });

      if (!error) {
        setMessage('Hemos enviado un código de 6 dígitos a tu email. Revisa tu bandeja de entrada.');
        setStep('code');
      } else {
        setErrors('Error al enviar código. Verifica que el email esté registrado.');
      }
    } catch (error) {
      setErrors('Error inesperado. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors('');
    setMessage('');

    if (code.length !== 6) {
      setErrors('El código debe tener 6 dígitos');
      return;
    }

    setIsSubmitting(true);

    try {
      // Verificar el código OTP
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: 'email'
      });

      if (!error && data?.session) {
        setMessage('¡Código verificado! Ahora ingresa tu nueva contraseña.');
        setStep('password');
      } else {
        setErrors('Código inválido o expirado. Verifica que lo hayas ingresado correctamente.');
      }
    } catch (error) {
      setErrors('Error inesperado. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors('');
    setMessage('');

    if (newPassword.length < 6) {
      setErrors('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors('Las contraseñas no coinciden');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (!error) {
        setMessage('¡Contraseña restablecida exitosamente!');
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setErrors(error.message || 'Error al restablecer contraseña');
      }
    } catch (error) {
      setErrors('Error inesperado. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto my-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Recuperar Contraseña
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>

          {step === 'email' && (
            /* Step 1: Request Email */
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Te enviaremos un código de 6 dígitos a tu email para restablecer tu contraseña.
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email registrado <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="tu-email@ejemplo.com"
                  required
                />
              </div>

              {errors && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{errors}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  isSubmitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
              >
                {isSubmitting ? 'Enviando código...' : 'Enviar Código de 6 Dígitos'}
              </button>
            </form>
          )}

          {step === 'code' && (
            /* Step 2: Enter Code */
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <div className="text-blue-500 text-4xl mb-2">�</div>
                <p className="text-sm text-gray-600">
                  Hemos enviado un código de 6 dígitos a <strong>{email}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de 6 dígitos <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center text-2xl font-mono tracking-widest"
                  placeholder="123456"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Revisa tu email y copia el código de 6 dígitos
                </p>
              </div>

              {message && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-600 text-sm">{message}</p>
                </div>
              )}

              {errors && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{errors}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ← Cambiar Email
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || code.length !== 6}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    isSubmitting || code.length !== 6
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }`}
                >
                  {isSubmitting ? 'Verificando...' : 'Verificar Código'}
                </button>
              </div>
            </form>
          )}

          {step === 'password' && (
            /* Step 3: Set New Password */
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <div className="text-green-500 text-4xl mb-2">🔐</div>
                <p className="text-sm text-gray-600">
                  ¡Código verificado! Ahora ingresa tu nueva contraseña
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Repite tu nueva contraseña"
                  minLength={6}
                  required
                />
              </div>

              {message && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-600 text-sm">{message}</p>
                </div>
              )}

              {errors && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{errors}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  isSubmitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
              >
                {isSubmitting ? 'Cambiando...' : 'Cambiar Contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}