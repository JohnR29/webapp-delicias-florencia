"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import HeaderPublico from '@/components/HeaderPublico';
import AuthModal from '@/components/AuthModal';

export default function RegistroPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirigir al registro de punto de venta después del registro
      router.push('/registro-punto-venta');
    }
  }, [isAuthenticated, user, router]);

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo al registro de punto de venta...</p>
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
              Conviértete en Socio Distribuidor
            </h1>
            <p className="text-gray-600 mb-4">
              Únete a nuestra exclusiva red de <strong>Socios Distribuidores</strong> y transforma tu negocio con nuestras tortas artesanales
            </p>
            
            {/* Proceso de aprobación */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                <span className="mr-2">📋</span>
                Proceso de Registro y Aprobación
              </h4>
              <div className="space-y-2 text-xs text-blue-700">
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">1</span>
                  <span><strong>Registro:</strong> Completa tus datos de contacto y ubicación del negocio</span>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">2</span>
                  <span><strong>Revisión:</strong> Nuestro equipo evaluará tu solicitud (24-48 horas)</span>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">3</span>
                  <span><strong>Aprobación:</strong> Una vez aprobado, aparecerás en nuestro mapa de puntos de venta</span>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">4</span>
                  <span><strong>Activación:</strong> Accede a precios mayoristas y la plataforma de pedidos</span>
                </div>
              </div>
            </div>
            
            {/* Beneficios */}
            <div className="bg-gradient-to-r from-secondary-50 to-accent-50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Beneficios Exclusivos para Socios:</h3>
              <ul className="text-sm text-gray-700 space-y-3 text-left">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2 font-bold">✓</span>
                  <strong>Precios mayoristas preferenciales</strong> - Hasta 40% de descuento
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2 font-bold">✓</span>
                  <strong>Entregas programadas garantizadas</strong> - Lunes y viernes
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2 font-bold">✓</span>
                  <strong>Plataforma digital exclusiva</strong> - Pedidos online 24/7
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2 font-bold">✓</span>
                  <strong>Soporte personalizado</strong> - Asesor dedicado
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2 font-bold">✓</span>
                  <strong>Productos siempre frescos</strong> - Elaboración diaria
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2 font-bold">✓</span>
                  <strong>Material promocional</strong> - Apoya tus ventas
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <AuthModal 
              isOpen={true}
              onClose={() => router.push('/')}
            />
          </div>
          
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Inicia sesión aquí
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