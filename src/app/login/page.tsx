"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import HeaderPublico from '@/components/HeaderPublico';
import AuthModal from '@/components/AuthModal';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  let redirect = '/mayorista';
  if (searchParams) {
    redirect = searchParams.get('redirect') || '/mayorista';
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(redirect);
    }
  }, [isAuthenticated, user, router, redirect]);

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <HeaderPublico />
      
      {/* Spacer for fixed header */}
      <div className="h-20"></div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Acceso Mayorista
            </h1>
            <p className="text-gray-600">
              Inicia sesión para acceder a precios mayoristas y realizar pedidos
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <AuthModal 
              isOpen={true}
              onClose={() => router.push('/')}
            />
          </div>
          
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => router.push('/registro')}
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Regístrate como distribuidor
              </button>
            </p>
          </div>
          
          <div className="text-center mt-4">
            <button
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ← Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}