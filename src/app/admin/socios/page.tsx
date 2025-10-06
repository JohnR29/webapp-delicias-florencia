"use client";

import AdminSociosPanel from '@/components/AdminSociosPanel';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { isAdminUser } from '@/lib/admin-config';

export default function AdminSociosPage() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Restringido</h1>
          <p className="text-gray-600 mb-4">Necesitas iniciar sesión para acceder a la gestión de socios.</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdminUser(user.email || '')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sin Permisos</h1>
          <p className="text-gray-600 mb-4">Tu cuenta no tiene permisos para acceder a la gestión de socios.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Socios Distribuidores</h1>
                <p className="text-sm sm:text-base text-gray-600">Aprobación y gestión de socios - Delicias Florencia</p>
                {user && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Administrador: {user.email}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Link
                  href="/admin"
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Volver a Pedidos
                </Link>
                <Link
                  href="/"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  Inicio
                </Link>
              </div>
            </div>
          </div>

          <div className="p-6">
            <AdminSociosPanel />
          </div>
        </div>
      </div>
    </div>
  );
}