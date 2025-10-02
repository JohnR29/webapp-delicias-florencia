'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const { requestPasswordReset } = useAuth();

  const resetForm = () => {
    setEmail('');
    setMessage('');
    setErrors('');
    setEmailSent(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        setMessage('Hemos enviado un enlace de recuperación a tu correo. Revisa tu bandeja de entrada (y spam) y haz clic en el enlace para restablecer tu contraseña.');
        setEmailSent(true);
      } else {
        setErrors(result && result.error ? result.error.message : 'Error al solicitar restablecimiento');
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

          {!emailSent ? (
            /* Step 1: Request Email */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Ingresa tu email y te enviaremos un enlace seguro para restablecer tu contraseña.
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
                {isSubmitting ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
              </button>
            </form>
          ) : (
            /* Step 2: Email Sent Confirmation */
            <div className="text-center space-y-4">
              <div className="text-green-500 text-5xl mb-4">📧</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                ¡Correo enviado!
              </h3>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 text-sm">{message}</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h4 className="font-semibold text-blue-800 mb-2">📋 Instrucciones:</h4>
                <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                  <li>Revisa tu bandeja de entrada</li>
                  <li>Busca el correo de &ldquo;Delicias Florencia&rdquo;</li>
                  <li>Haz clic en &ldquo;Restablecer contraseña&rdquo;</li>
                  <li>Crea tu nueva contraseña</li>
                </ol>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>💡 No encuentras el correo? Revisa tu carpeta de spam</p>
                <p>⏰ El enlace expira en 1 hora por seguridad</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEmailSent(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Enviar Nuevo Correo
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}