"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { isAdminUser } from '@/lib/admin-config';

export default function AdminSociosPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirigir al panel principal con la tab de puntos de venta
  useEffect(() => {
    if (isAuthenticated && isAdminUser(user?.email)) {
      // Redirigir al panel principal después de un breve delay para mostrar el mensaje
      const timer = setTimeout(() => {
        router.push('/admin');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user?.email, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Restringido</h1>
          <p className="text-gray-600 mb-4">Necesitas iniciar sesión para acceder al panel de administración.</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (!user || !isAdminUser(user.email || '')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sin Permisos</h1>
          <p className="text-gray-600 mb-4">Tu cuenta no tiene permisos para acceder al panel de administración.</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-3">Funcionalidad Migrada</h2>
          <p className="text-gray-600 mb-4">
            La gestión de socios se ha integrado al panel principal como <strong>"🏪 Puntos de Venta"</strong>.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-blue-800">
              🎉 <strong>Mejora del Sistema:</strong> Ahora puedes gestionar tanto pedidos como puntos de venta desde un solo lugar.
            </p>
          </div>
          
          <p className="text-sm text-gray-500 mb-4">
            Redirigiendo al panel principal en unos segundos...
          </p>
          
          <div className="flex gap-3">
            <Link
              href="/admin"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
            >
              Ir al Panel Principal
            </Link>
            <Link
              href="/"
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-center"
            >
              Inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}