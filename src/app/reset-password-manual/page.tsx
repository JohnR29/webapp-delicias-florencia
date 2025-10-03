'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ResetPasswordManualPage() {
  const [step, setStep] = useState<'token' | 'password'>('token');
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState('');

  const router = useRouter();

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors('');
    setIsSubmitting(true);

    try {
      console.log('🔍 Verifying manual token...');
      
      // Verificar el token con Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: 'recovery'
      });

      if (error) {
        console.error('❌ Token verification failed:', error);
        setErrors('Código inválido o expirado. Verifica que lo hayas copiado correctamente.');
      } else if (data?.session) {
        console.log('✅ Token verified, proceeding to password step');
        setStep('password');
        setMessage('¡Código verificado! Ahora ingresa tu nueva contraseña.');
      } else {
        console.log('❌ Token verified but no session');
        setErrors('Error al verificar el código. Intenta solicitar uno nuevo.');
      }
    } catch (error) {
      console.error('💥 Unexpected error:', error);
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
      console.log('🔄 Updating password...');
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (!error) {
        console.log('✅ Password updated successfully');
        setMessage('¡Contraseña restablecida exitosamente! Redirigiendo...');
        setTimeout(() => router.push('/'), 2000);
      } else {
        console.error('❌ Password update error:', error);
        setErrors(error.message || 'Error al restablecer contraseña');
      }
    } catch (error) {
      console.error('💥 Unexpected error updating password:', error);
      setErrors('Error inesperado. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Delicias Florencia</h1>
          <p className="text-gray-600">
            {step === 'token' ? 'Verificar Código' : 'Nueva Contraseña'}
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {step === 'token' ? (
            /* Step 1: Verify Token */
            <>
              <div className="text-center mb-6">
                <div className="text-blue-500 text-4xl mb-4">🔑</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Ingresa tu código</h2>
                <p className="text-gray-600 text-sm">
                  Copia el código del email y pégalo aquí
                </p>
              </div>

              <form onSubmit={handleTokenSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código de recuperación <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-center"
                    placeholder="Pega aquí el código del email"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Copia el código completo del email, incluyendo números y letras
                  </p>
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
                  {isSubmitting ? 'Verificando...' : 'Verificar Código'}
                </button>
              </form>
            </>
          ) : (
            /* Step 2: Set New Password */
            <>
              <div className="text-center mb-6">
                <div className="text-green-500 text-4xl mb-4">🔐</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Nueva Contraseña</h2>
                <p className="text-gray-600 text-sm">
                  Ingresa tu nueva contraseña para completar el restablecimiento
                </p>
              </div>

              {message && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-green-600 text-sm">{message}</p>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    isSubmitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }`}
                >
                  {isSubmitting ? 'Restableciendo...' : 'Cambiar Contraseña'}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}