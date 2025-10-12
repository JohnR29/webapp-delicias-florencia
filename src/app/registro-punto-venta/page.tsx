"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import ClientHeaderPublico from '@/components/ClientHeaderPublico';
import HeaderMayorista from '@/components/HeaderMayorista';

interface FormData {
  nombre_comercial: string;
  descripcion_negocio: string;
  direccion: string;
  comuna: string;
  telefono_negocio: string;
  horario_atencion: string;
  permite_pedidos_directos: boolean;
  observaciones: string;
}

const COMUNAS_DISPONIBLES = [
  'San Bernardo',
  'La Pintana', 
  'El Bosque',
  'La Cisterna',
  'Lo Espejo',
  'Pedro Aguirre Cerda',
  'Maipú',
  'Cerrillos'
];

export default function RegistroPuntoVentaPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    nombre_comercial: '',
    descripcion_negocio: '',
    direccion: '',
    comuna: '',
    telefono_negocio: '',
    horario_atencion: '',
    permite_pedidos_directos: false,
    observaciones: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      setMensaje({ tipo: 'error', texto: 'Debes iniciar sesión para registrar tu punto de venta' });
      return;
    }

    setLoading(true);
    setMensaje(null);

    try {
      // Insertar la solicitud de punto de venta
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          email: user.email,
          nombre_comercial: formData.nombre_comercial,
          descripcion_negocio: formData.descripcion_negocio,
          direccion: formData.direccion,
          comuna: formData.comuna,
          telefono_negocio: formData.telefono_negocio,
          horario_atencion: formData.horario_atencion,
          permite_pedidos_directos: formData.permite_pedidos_directos,
          observaciones: formData.observaciones,
          status_aprobacion: 'pendiente', // Pendiente de aprobación por admin
          es_socio_distribuidor: false, // Se activará cuando el admin apruebe
          fecha_solicitud: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error registrando punto de venta:', error);
        setMensaje({ 
          tipo: 'error', 
          texto: 'Error al enviar tu solicitud. Por favor intenta nuevamente.' 
        });
        return;
      }

      // Éxito
      setMensaje({ 
        tipo: 'success', 
        texto: '¡Solicitud enviada exitosamente! Revisaremos tu información en las próximas 24-48 horas.' 
      });
      
      // Limpiar formulario
      setFormData({
        nombre_comercial: '',
        descripcion_negocio: '',
        direccion: '',
        comuna: '',
        telefono_negocio: '',
        horario_atencion: '',
        permite_pedidos_directos: false,
        observaciones: ''
      });

      // Redirigir después de 3 segundos
      setTimeout(() => {
        router.push('/mayorista');
      }, 3000);

    } catch (error) {
      console.error('Error inesperado:', error);
      setMensaje({ 
        tipo: 'error', 
        texto: 'Error inesperado. Por favor intenta nuevamente.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Si no está autenticado, redirigir al registro normal
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
              <span className="mr-2">🚀</span>
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
      {isAuthenticated ? <HeaderMayorista /> : <ClientHeaderPublico />}
      
      {/* Spacer for fixed header */}
      <div className="h-20"></div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">🏪</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Registra tu Punto de Venta
            </h1>
            <p className="text-gray-600 mb-4">
              Completa la información de tu negocio para aparecer en nuestro mapa de puntos de venta
            </p>
            
            {/* Usuario actual */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <div className="flex items-center justify-center text-sm text-blue-800">
                <span className="mr-2">👤</span>
                <span>Registrando como: <strong>{user?.email}</strong></span>
              </div>
            </div>
          </div>

          {/* Mensajes */}
          {mensaje && (
            <div className={`mb-6 p-4 rounded-lg ${
              mensaje.tipo === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center">
                <span className="mr-2">
                  {mensaje.tipo === 'success' ? '✅' : '❌'}
                </span>
                <span className="font-medium">{mensaje.texto}</span>
              </div>
            </div>
          )}

          {/* Formulario */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Información básica */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🏪</span>
                  Información del Negocio
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label htmlFor="nombre_comercial" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Comercial *
                    </label>
                    <input
                      type="text"
                      id="nombre_comercial"
                      name="nombre_comercial"
                      value={formData.nombre_comercial}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Ej: Panadería El Trigo"
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="descripcion_negocio" className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción del Negocio
                    </label>
                    <textarea
                      id="descripcion_negocio"
                      name="descripcion_negocio"
                      value={formData.descripcion_negocio}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Breve descripción de tu negocio y lo que ofreces..."
                    />
                  </div>
                </div>
              </div>

              {/* Ubicación */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">📍</span>
                  Ubicación
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección Completa *
                    </label>
                    <input
                      type="text"
                      id="direccion"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Ej: Av. Los Morros 1234"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="comuna" className="block text-sm font-medium text-gray-700 mb-2">
                      Comuna *
                    </label>
                    <select
                      id="comuna"
                      name="comuna"
                      value={formData.comuna}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Selecciona una comuna</option>
                      {COMUNAS_DISPONIBLES.map(comuna => (
                        <option key={comuna} value={comuna}>{comuna}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="telefono_negocio" className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono del Negocio *
                    </label>
                    <input
                      type="tel"
                      id="telefono_negocio"
                      name="telefono_negocio"
                      value={formData.telefono_negocio}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Ej: +56 9 1234 5678"
                    />
                  </div>
                </div>
              </div>

              {/* Horarios y servicios */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🕐</span>
                  Horarios y Servicios
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="horario_atencion" className="block text-sm font-medium text-gray-700 mb-2">
                      Horario de Atención
                    </label>
                    <input
                      type="text"
                      id="horario_atencion"
                      name="horario_atencion"
                      value={formData.horario_atencion}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Ej: Lunes a Viernes 8:00 - 18:00, Sábados 9:00 - 14:00"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="permite_pedidos_directos"
                      name="permite_pedidos_directos"
                      checked={formData.permite_pedidos_directos}
                      onChange={handleChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="permite_pedidos_directos" className="ml-2 block text-sm text-gray-700">
                      <span className="font-medium">Mi negocio acepta pedidos directos</span>
                      <p className="text-gray-500 text-xs mt-1">
                        Los clientes podrán contactarte directamente para hacer pedidos
                      </p>
                    </label>
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones Adicionales
                </label>
                <textarea
                  id="observaciones"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Información adicional que consideres relevante para tu punto de venta..."
                />
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transform hover:scale-105'
                  }`}
                >
                  {loading ? (
                    <>
                      <span className="mr-2">⏳</span>
                      Enviando solicitud...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🚀</span>
                      Enviar solicitud de registro
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => router.push('/mayorista')}
                  className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Volver al área mayorista
                </button>
              </div>
            </form>
          </div>

          {/* Información adicional */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
              <span className="mr-2">ℹ️</span>
              ¿Qué sucede después?
            </h4>
            <div className="text-sm text-blue-800 space-y-2">
              <div className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">1</span>
                <span>Revisaremos tu solicitud en las próximas 24-48 horas</span>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">2</span>
                <span>Te contactaremos por email para confirmar los detalles</span>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">3</span>
                <span>Una vez aprobado, aparecerás en nuestro mapa de puntos de venta</span>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">4</span>
                <span>Tendrás acceso completo a precios mayoristas y pedidos online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}