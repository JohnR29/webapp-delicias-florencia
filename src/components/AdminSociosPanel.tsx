"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminSocios } from '@/hooks/useAdminSocios';

const AdminSociosPanel = () => {
  const { user } = useAuth();
  const { 
    sociosPendientes, 
    loading: sociosLoading, 
    error: sociosError,
    aprobarSocio,
    rechazarSocio,
    fetchSociosPendientes,
  } = useAdminSocios();

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAprobar = async (userId: string) => {
    if (!user?.id) return;
    
    const result = await aprobarSocio(userId, user.id);
    setMessage({
      type: result.success ? 'success' : 'error',
      text: result.message
    });
    
    // Limpiar mensaje después de 5 segundos
    setTimeout(() => setMessage(null), 5000);
  };

  const handleRechazar = async (userId: string) => {
    if (!user?.id) return;
    
    if (confirm('¿Estás seguro de rechazar este socio distribuidor?')) {
      const result = await rechazarSocio(userId, user.id);
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.message
      });
      
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mensaje de estado */}
      {message && (
        <div className={`border rounded-lg p-4 ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Estadísticas de socios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-blue-500 mr-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{sociosPendientes.length}</p>
              <p className="text-blue-700 text-sm">Pendientes de Aprobación</p>
            </div>
          </div>
        </div>
      </div>

      {sociosError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{sociosError}</p>
        </div>
      )}

      {sociosLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Cargando socios...</p>
        </div>
      ) : sociosPendientes.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay socios pendientes</h3>
          <p className="text-gray-500">Todos los socios distribuidores han sido procesados.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Socios Pendientes de Aprobación ({sociosPendientes.length})
            </h2>
            <button
              onClick={fetchSociosPendientes}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Actualizar
            </button>
          </div>

          <div className="grid gap-4">
            {sociosPendientes.map((socio) => (
              <div key={socio.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {socio.nombre_comercial}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pendiente
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          <strong>Propietario:</strong> {socio.nombre} {socio.apellido}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Teléfono:</strong> {socio.telefono}
                        </p>
                        {socio.telefono_negocio && (
                          <p className="text-sm text-gray-600">
                            <strong>Tel. Negocio:</strong> {socio.telefono_negocio}
                          </p>
                        )}
                        {socio.email_negocio && (
                          <p className="text-sm text-gray-600">
                            <strong>Email:</strong> {socio.email_negocio}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          <strong>Dirección:</strong> {socio.direccion}, {socio.comuna}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Negocio:</strong> {socio.negocio}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Contacto:</strong> {socio.contacto}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Tipo:</strong> {socio.tipo}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Solicitud:</strong> {new Date(socio.created_at).toLocaleDateString('es-CL')}
                        </p>
                      </div>
                    </div>

                    {socio.descripcion_negocio && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">
                          <strong>Descripción:</strong> {socio.descripcion_negocio}
                        </p>
                      </div>
                    )}

                    {socio.horario_atencion && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">
                          <strong>Horario:</strong> {socio.horario_atencion}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center mb-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        socio.permite_pedidos_directos 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {socio.permite_pedidos_directos ? '✓ Acepta pedidos directos' : 'No acepta pedidos directos'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleAprobar(socio.user_id)}
                    disabled={sociosLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    ✓ Aprobar
                  </button>
                  <button
                    onClick={() => handleRechazar(socio.user_id)}
                    disabled={sociosLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    ✗ Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSociosPanel;