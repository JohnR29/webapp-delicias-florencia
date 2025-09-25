'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState('');

  const { requestPasswordReset, resetPassword } = useAuth();

  const resetForm = () => {
    setStep('email');
    setEmail('');
    setToken('');
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
      const result = await requestPasswordReset(email);
      if (result && !result.error) {
        setMessage('Si el email existe, recibirás instrucciones para restablecer tu contraseña.');
        setStep('reset');
      } else {
        setErrors(result && result.error ? result.error.message : 'Error al solicitar restablecimiento');
      }
    } catch (error) {
      setErrors('Error inesperado. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors('');
    setMessage('');

    if (!token.trim()) {
      setErrors('Por favor ingresa el token recibido por email');
      return;
    }

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
      const result = await resetPassword(token, newPassword);
      if (result && !result.error) {
        setMessage('¡Contraseña restablecida exitosamente! Ya puedes iniciar sesión.');
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setErrors(result && result.error ? result.error.message : 'Error al restablecer contraseña');
      }
    } catch (error) {
      setErrors('Error inesperado. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {step === 'email' ? 'Recuperar Contraseña' : 'Nueva Contraseña'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Ingresa tu email y te enviaremos un token para restablecer tu contraseña.
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

              {message && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-600 text-sm">{message}</p>
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
                {isSubmitting ? 'Enviando...' : 'Enviar Token'}
              </button>
            </form>
          )}

          {/* Step 2: Reset */}
          {step === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Revisa tu email e ingresa el token recibido junto con tu nueva contraseña.
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Token de recuperación <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono"
                  placeholder="Pega aquí el token del email"
                  required
                />
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
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar nueva contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Repite tu nueva contraseña"
                  required
                  minLength={6}
                />
              </div>

              {errors && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{errors}</p>
                </div>
              )}

              {message && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-600 text-sm">{message}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    isSubmitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }`}
                >
                  {isSubmitting ? 'Restableciendo...' : 'Cambiar Contraseña'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}