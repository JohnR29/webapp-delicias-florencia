"use client";
import { useState, useEffect } from 'react';
import { UserProfile, UserProfileForm } from '../lib/types';

interface SocioDistribuidorFormProps {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  onSave: (data: UserProfileForm) => Promise<{ success: boolean; message: string }>;
  userEmail: string;
}

export default function SocioDistribuidorForm({ 
  profile, 
  loading, 
  error, 
  onSave, 
  userEmail 
}: SocioDistribuidorFormProps) {
  const [formData, setFormData] = useState<Partial<UserProfileForm>>({
    es_punto_venta_publico: false,
    nombre_comercial: '',
    descripcion_negocio: '',
    horario_atencion: '',
    permite_pedidos_directos: false,
    telefono_negocio: '',
    email_negocio: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cargar datos del perfil existente
  useEffect(() => {
    if (profile) {
      setFormData({
        // Datos personales (necesarios para el save)
        nombre: profile.nombre || '',
        apellido: profile.apellido || '',
        telefono: profile.telefono || '',
        documento_identidad: profile.documento_identidad || '',
        tipo_documento: profile.tipo_documento || 'RUT',
        fecha_nacimiento: profile.fecha_nacimiento || '',
        direccion_personal: profile.direccion_personal || '',
        comuna_personal: profile.comuna_personal || '',
        // Datos de socio distribuidor
        es_punto_venta_publico: profile.es_punto_venta_publico || false,
        nombre_comercial: profile.nombre_comercial || '',
        descripcion_negocio: profile.descripcion_negocio || '',
        horario_atencion: profile.horario_atencion || '',
        permite_pedidos_directos: profile.permite_pedidos_directos || false,
        telefono_negocio: profile.telefono_negocio || '',
        email_negocio: profile.email_negocio || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await onSave(formData as UserProfileForm);
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.message
      });

      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Error inesperado al guardar'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-gray-600">Cargando configuración...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mostrar error general */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Mostrar mensaje de resultado */}
      {message && (
        <div className={`border rounded-lg p-4 ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Estado de aprobación por administrador */}
      {profile?.es_punto_venta_publico && (
        <div className={`border rounded-lg p-4 ${
          profile.aprobado_por_admin 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start">
            <div className={`mr-3 mt-1 ${
              profile.aprobado_por_admin ? 'text-green-500' : 'text-yellow-500'
            }`}>
              {profile.aprobado_por_admin ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div>
              <h3 className={`font-medium mb-2 ${
                profile.aprobado_por_admin ? 'text-green-900' : 'text-yellow-900'
              }`}>
                {profile.aprobado_por_admin 
                  ? '✅ Socio Distribuidor Aprobado' 
                  : '⏳ Esperando Aprobación de Administrador'
                }
              </h3>
              <p className={`text-sm ${
                profile.aprobado_por_admin ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {profile.aprobado_por_admin ? (
                  <>
                    ¡Felicitaciones! Tu negocio ha sido aprobado y ya aparece en el mapa público de "Dónde Comprar". 
                    Los consumidores pueden encontrarte y contactarte directamente.
                    {profile.fecha_aprobacion && (
                      <span className="block mt-1 opacity-75">
                        Aprobado el: {new Date(profile.fecha_aprobacion).toLocaleDateString('es-CL')}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    Tu solicitud para ser socio distribuidor está pendiente de revisión por parte de nuestro equipo. 
                    Te notificaremos una vez que sea aprobada. Mientras tanto, puedes seguir editando tu información.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Información explicativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="text-blue-500 mr-3 mt-1">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-blue-900 font-medium mb-2">¿Qué es ser un Socio Distribuidor?</h3>
            <p className="text-blue-800 text-sm">
              Como socio distribuidor, tu negocio aparecerá en nuestro mapa público para que consumidores finales 
              puedan encontrarte y comprar nuestros productos directamente en tu local. 
              Es una excelente forma de aumentar tu visibilidad y ventas.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Activar como socio distribuidor */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="es_punto_venta_publico"
              name="es_punto_venta_publico"
              checked={formData.es_punto_venta_publico || false}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="es_punto_venta_publico" className="ml-3 text-sm font-medium text-gray-900">
              Quiero ser un Socio Distribuidor público
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2 ml-7">
            Tu negocio aparecerá en el mapa para que clientes finales puedan encontrarte
          </p>
        </div>

        {/* Campos solo si está activado */}
        {formData.es_punto_venta_publico && (
          <div className="space-y-4 border-l-4 border-blue-500 pl-4">
            {/* Nombre comercial */}
            <div>
              <label htmlFor="nombre_comercial" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre comercial *
              </label>
              <input
                type="text"
                id="nombre_comercial"
                name="nombre_comercial"
                value={formData.nombre_comercial || ''}
                onChange={handleChange}
                required={formData.es_punto_venta_publico}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Almacén Don Juan"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nombre que verán los clientes en el mapa
              </p>
            </div>

            {/* Descripción del negocio */}
            <div>
              <label htmlFor="descripcion_negocio" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción del negocio
              </label>
              <textarea
                id="descripcion_negocio"
                name="descripcion_negocio"
                value={formData.descripcion_negocio || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Almacén familiar con productos frescos y de calidad..."
              />
            </div>

            {/* Horario de atención */}
            <div>
              <label htmlFor="horario_atencion" className="block text-sm font-medium text-gray-700 mb-2">
                Horario de atención
              </label>
              <input
                type="text"
                id="horario_atencion"
                name="horario_atencion"
                value={formData.horario_atencion || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Lun-Vie 8:00-20:00, Sáb 9:00-19:00"
              />
            </div>

            {/* Contacto del negocio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="telefono_negocio" className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono del negocio
                </label>
                <input
                  type="tel"
                  id="telefono_negocio"
                  name="telefono_negocio"
                  value={formData.telefono_negocio || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+56 9 1234 5678"
                />
              </div>

              <div>
                <label htmlFor="email_negocio" className="block text-sm font-medium text-gray-700 mb-2">
                  Email del negocio
                </label>
                <input
                  type="email"
                  id="email_negocio"
                  name="email_negocio"
                  value={formData.email_negocio || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="contacto@minegocio.cl"
                />
              </div>
            </div>

            {/* Permite pedidos directos */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="permite_pedidos_directos"
                  name="permite_pedidos_directos"
                  checked={formData.permite_pedidos_directos || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="permite_pedidos_directos" className="ml-3 text-sm font-medium text-gray-900">
                  Acepto recibir pedidos directos de consumidores finales
                </label>
              </div>
              <p className="text-xs text-gray-600 mt-2 ml-7">
                Los clientes podrán contactarte directamente para hacer pedidos (opcional)
              </p>
            </div>
          </div>
        )}

        {/* Botón guardar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              isSubmitting
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar configuración'}
          </button>
        </div>
      </form>

      {/* Nota informativa */}
      <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
        <p><strong>Importante:</strong> Una vez activado como socio distribuidor, podrás marcar tus direcciones como puntos de venta públicos en la sección de Direcciones.</p>
        <p className="mt-1">Los clientes podrán encontrarte en nuestro mapa y contactarte directamente.</p>
      </div>
    </div>
  );
}