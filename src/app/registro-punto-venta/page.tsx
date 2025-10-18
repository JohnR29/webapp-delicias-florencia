"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import HeaderPublico from '@/components/HeaderPublico';
import HeaderMayorista from '@/components/HeaderMayorista';
import UnifiedAddressModal from '@/components/UnifiedAddressModal';

export default function RegistroPuntoVentaPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(true);

  const handleModalClose = () => {
    setShowModal(false);
    router.push('/mayorista');
  };

  const handleModalSuccess = () => {
    // Redirigir después de éxito
    setTimeout(() => {
      router.push('/mayorista');
    }, 2000);
  };

  // Si no está autenticado, mostrar página de login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔐</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Inicia sesión requerido
          </h1>
          <p className="text-gray-600 mb-6">
            Para registrar tu punto de venta necesitas tener una cuenta activa en nuestra plataforma.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/registro')}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
            >
              Crear cuenta y registrar punto de venta
            </button>
            <button
              onClick={() => router.push('/login')}
              className="w-full border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="mr-2">👤</span>
              Ya tengo cuenta - Iniciar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <HeaderMayorista />
      
      {/* Contenido de respaldo mientras se carga el modal */}
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white">🏪</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Registra tu Punto de Venta
          </h1>
          <p className="text-gray-600 mb-8">
            Completa la información de tu negocio para aparecer en nuestro mapa de puntos de venta
          </p>
          
          {!showModal && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
            >
              Abrir formulario de registro
            </button>
          )}
        </div>
      </div>

      {/* Modal Unificado de Punto de Venta */}
      <UnifiedAddressModal 
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </main>
  );
}