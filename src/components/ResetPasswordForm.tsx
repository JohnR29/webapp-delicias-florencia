'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState('');
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const { resetPassword } = useAuth();

  // Verificar si hay tokens válidos en la URL
  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');

    if (type === 'recovery' && accessToken && refreshToken) {
      setIsValidToken(true);
      // Establecer la sesión con los tokens de Supabase
      const { supabase } = require('@/lib/supabaseClient');
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
    } else {
      setIsValidToken(false);
      setErrors('Enlace de recuperación inválido o expirado. Por favor solicita uno nuevo.');
    }
  }, [searchParams]);

  const validatePasswords = (): boolean => {
    if (newPassword.length < 6) {
      setErrors('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setErrors('Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors('');
    setMessage('');

    if (!validatePasswords()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Usar el método actualizado de Supabase para cambiar contraseña
      const { supabase } = require('@/lib/supabaseClient');
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (!error) {
        setMessage('¡Contraseña restablecida exitosamente! Redirigiendo...');
        setTimeout(() => {
          router.push('/');
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

  const handleRequestNewLink = () => {
    router.push('/');
  };

  // Loading state
  if (isValidToken === null) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando enlace de recuperación...</p>
        </div>
      </div>
    );
  }

  // Invalid token
  if (!isValidToken) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Enlace no válido</h2>
          <p className="text-gray-600 mb-6">
            Este enlace de recuperación ha expirado o no es válido.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{errors}</p>
          </div>
          <button
            onClick={handleRequestNewLink}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Solicitar nuevo enlace
          </button>
        </div>
      </div>
    );
  }

  // Valid token - show reset form
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="text-center mb-6">
        <div className="text-green-500 text-4xl mb-4">🔐</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Nueva Contraseña</h2>
        <p className="text-gray-600 text-sm">
          Ingresa tu nueva contraseña para completar el restablecimiento
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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

      <div className="mt-6 pt-4 border-t border-gray-200 text-center">
        <button
          onClick={handleRequestNewLink}
          className="text-primary-600 hover:text-primary-700 text-sm underline"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}