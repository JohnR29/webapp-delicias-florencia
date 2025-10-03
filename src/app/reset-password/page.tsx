'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState('');
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        // Obtener los parámetros de la URL según documentación de Supabase
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');
        
        console.log('🔍 PASSWORD RESET DEBUG - DETAILED:');
        console.log('📍 Full URL:', window.location.href);
        console.log('� URL Search:', window.location.search);
        console.log('🎯 All available params:');
        
        // Mostrar TODOS los parámetros disponibles
        const allParams = new URLSearchParams(window.location.search);
        console.log('📝 All URL params:');
        allParams.forEach((value, key) => {
          console.log(`  ${key}: ${value.substring(0, 20)}... (${value.length} chars)`);
        });
        
        console.log('📋 Specific params:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken, 
          type,
          accessTokenLength: accessToken?.length || 0,
          refreshTokenLength: refreshToken?.length || 0
        });

        // Supabase resetPasswordForEmail envía access_token y refresh_token
        if (accessToken && refreshToken && type === 'recovery') {
          console.log('✅ Valid reset tokens found');
          
          // Establecer la sesión con los tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('❌ Session error:', error);
            setIsValidToken(false);
            setErrors('Error al validar el enlace de recuperación.');
            return;
          }
          
          if (data.session) {
            console.log('✅ Session established successfully');
            setIsValidToken(true);
          } else {
            console.log('❌ No session created');
            setIsValidToken(false);
            setErrors('Error al establecer la sesión.');
          }
        } else {
          console.log('❌ MISSING REQUIRED PARAMETERS:');
          console.log('  - access_token present:', !!accessToken);
          console.log('  - refresh_token present:', !!refreshToken);
          console.log('  - type value:', type);
          console.log('  - type is recovery:', type === 'recovery');
          
          if (!accessToken) console.log('  🚨 Missing access_token');
          if (!refreshToken) console.log('  🚨 Missing refresh_token');
          if (type !== 'recovery') console.log('  🚨 Type is not "recovery":', type);
          
          // Revisar si hay errores de Supabase en el hash
          if (window.location.hash && window.location.hash.includes('error=')) {
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const error = hashParams.get('error');
            const errorCode = hashParams.get('error_code');
            const errorDescription = hashParams.get('error_description');
            
            console.log('🚨 SUPABASE ERROR DETECTED:');
            console.log('  - error:', error);
            console.log('  - error_code:', errorCode);
            console.log('  - error_description:', errorDescription);
            
            if (errorCode === 'otp_expired') {
              setErrors('El enlace de recuperación ha expirado. Por favor, solicita un nuevo enlace.');
            } else {
              setErrors('Error en el enlace de recuperación. Por favor, solicita un nuevo enlace.');
            }
          } else {
            setErrors('Enlace de recuperación inválido o expirado. Por favor, solicita un nuevo enlace.');
          }
          
          setIsValidToken(false);
        }

      } catch (error) {
        console.error('💥 Unexpected error:', error);
        setIsValidToken(false);
        setErrors('Error inesperado al validar el enlace.');
      }
    };

    handlePasswordReset();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
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
      console.log('🔄 Attempting to update password...');
      
      // Verificar que tenemos una sesión válida
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        console.error('❌ No valid session when trying to update password');
        setErrors('Sesión expirada. Por favor, solicita un nuevo enlace de recuperación.');
        return;
      }

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

  if (isValidToken === null) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    const isExpiredToken = errors.includes('expirado') || errors.includes('expired');
    
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">
            {isExpiredToken ? '⏰' : '⚠️'}
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {isExpiredToken ? 'Enlace Expirado' : 'Enlace no válido'}
          </h2>
          <p className="text-gray-600 mb-6">{errors}</p>
          
          {isExpiredToken && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <h4 className="font-semibold text-blue-800 mb-2">💡 ¿Qué puedo hacer?</h4>
              <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
                <li>Los enlaces expiran rápidamente por seguridad</li>
                <li>Solicita un nuevo enlace desde la página principal</li>
                <li>Haz clic inmediatamente cuando recibas el correo</li>
              </ul>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/?show-login=true')}
              className="flex-1 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              {isExpiredToken ? 'Solicitar Nuevo Enlace' : 'Volver e Intentar'}
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium rounded-lg transition-colors"
            >
              Ir al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

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
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Delicias Florencia</h1>
          <p className="text-gray-600">Restablecer Contraseña</p>
        </div>
        
        <Suspense fallback={
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}