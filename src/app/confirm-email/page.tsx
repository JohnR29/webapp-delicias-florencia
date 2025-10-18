"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import HeaderPublico from '@/components/HeaderPublico';

function ConfirmEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const confirmEmail = async () => {
      // Obtener el token de la URL
      const token = searchParams.get('token') || searchParams.get('token_hash');
      
      if (!token) {
        setStatus('error');
        setMessage('Token de confirmación no válido');
        return;
      }

      try {
        const response = await fetch('/api/confirm-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.message || 'Error al confirmar el email');
        }
      } catch (error) {
        console.error('Error confirmando email:', error);
        setStatus('error');
        setMessage('Error de conexión. Por favor intenta nuevamente.');
      }
    };

    confirmEmail();
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="h-20"></div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {status === 'loading' && (
              <>
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                  Confirmando tu email...
                </h1>
                <p className="text-gray-600">
                  Por favor espera mientras verificamos tu correo electrónico.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="text-6xl mb-6">✅</div>
                <h1 className="text-3xl font-bold text-green-700 mb-4">
                  ¡Email Confirmado!
                </h1>
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-lg mb-2">
                    {message}
                  </p>
                  <p className="text-green-700 text-sm">
                    Tu cuenta está ahora en proceso de revisión. Recibirás un correo cuando sea aprobada.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">Próximos pasos:</h3>
                    <ul className="text-blue-700 text-sm space-y-1 text-left">
                      <li>• Nuestro equipo revisará tu solicitud</li>
                      <li>• El proceso suele tomar 1-2 días hábiles</li>
                      <li>• Recibirás un correo de confirmación cuando sea aprobada</li>
                      <li>• Una vez aprobada, podrás acceder a precios mayoristas</li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => router.push('/')}
                      className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Volver al Inicio
                    </button>
                    <button
                      onClick={() => router.push('/login')}
                      className="flex-1 px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                    >
                      Intentar Iniciar Sesión
                    </button>
                  </div>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="text-6xl mb-6">❌</div>
                <h1 className="text-3xl font-bold text-red-700 mb-4">
                  Error de Confirmación
                </h1>
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">
                    {message}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 mb-2">¿Qué puedes hacer?</h3>
                    <ul className="text-yellow-700 text-sm space-y-1 text-left">
                      <li>• Verifica que el enlace esté completo</li>
                      <li>• Revisa si el token no ha expirado</li>
                      <li>• Intenta registrarte nuevamente si es necesario</li>
                      <li>• Contacta al soporte si el problema persiste</li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => router.push('/registro')}
                      className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Registrarse Nuevamente
                    </button>
                    <button
                      onClick={() => router.push('/')}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Volver al Inicio
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ConfirmEmailPage() {
  return (
    <>
      <HeaderPublico />
      <Suspense fallback={
        <main className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="h-20"></div>
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                  Cargando...
                </h1>
                <p className="text-gray-600">
                  Preparando la verificación de email.
                </p>
              </div>
            </div>
          </div>
        </main>
      }>
        <ConfirmEmailContent />
      </Suspense>
    </>
  );
}