"use client";
import { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, Clock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useSociosCercanosFree } from '@/hooks/useSociosCercanosFree';

const SugerenciasSociosFree: React.FC = () => {
  const { 
    sociosCercanos, 
    loading, 
    error, 
    location, 
    permissionState,
    getSociosMasCercanos 
  } = useSociosCercanosFree();

  const [showPermissionBanner, setShowPermissionBanner] = useState(false);
  const [permissionRequested, setPermissionRequested] = useState(false);

  // Mostrar banner de permisos si no se han concedido
  useEffect(() => {
    if (permissionState === 'prompt' && !permissionRequested) {
      setShowPermissionBanner(true);
    } else if (permissionState === 'granted') {
      setShowPermissionBanner(false);
    }
  }, [permissionState, permissionRequested]);

  // Solicitar permisos de ubicación
  const handleRequestLocation = async () => {
    setPermissionRequested(true);
    setShowPermissionBanner(false);
    
    try {
      await navigator.geolocation.getCurrentPosition(() => {}, () => {});
    } catch (error) {
      console.warn('Error solicitando ubicación:', error);
    }
  };

  // No mostrar nada si no hay socios cercanos
  const sociosMasCercanos = getSociosMasCercanos(3);
  if (!sociosMasCercanos.length && !loading && !showPermissionBanner) {
    return null;
  }

  // Generar URL de Google Maps para navegación
  const getGoogleMapsUrl = (direccion: string, comuna: string) => {
    const direccionCompleta = `${direccion}, ${comuna}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(direccionCompleta)}`;
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Banner de permisos de ubicación */}
        {showPermissionBanner && (
          <div className="mb-6 bg-blue-600 text-white rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <MapPin className="w-6 h-6 text-blue-200 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    ¿Quieres ver los puntos más cercanos a ti?
                  </h3>
                  <p className="text-blue-100 text-sm mb-3">
                    Permítenos acceder a tu ubicación para mostrarte los distribuidores más cercanos y calcular distancias exactas.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleRequestLocation}
                      className="inline-flex items-center bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Permitir ubicación
                    </button>
                    <button
                      onClick={() => setShowPermissionBanner(false)}
                      className="text-blue-200 hover:text-white px-4 py-2 text-sm font-medium transition-colors"
                    >
                      Continuar sin ubicación
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowPermissionBanner(false)}
                className="text-blue-200 hover:text-white p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Título de la sección */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Puntos de Venta Cercanos
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {location 
              ? 'Basado en tu ubicación actual, estos son los distribuidores más cercanos a ti'
              : 'Descubre nuestros puntos de venta autorizados para comprar productos Delicias Florencia'
            }
          </p>
        </div>

        {/* Estado de carga */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-3 text-blue-600">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="font-medium">Calculando distancias...</span>
            </div>
          </div>
        )}

        {/* Error de geolocalización */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-800 font-medium">Información de ubicación</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Lista de socios más cercanos */}
        {sociosMasCercanos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sociosMasCercanos.map((socio, index) => (
              <div
                key={socio.user_id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow p-6"
              >
                {/* Header con distancia */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1 leading-tight">
                      {socio.nombre_comercial}
                    </h3>
                    {index === 0 && socio.distancia && (
                      <div className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Más cercano
                      </div>
                    )}
                  </div>
                  {socio.distancia && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {socio.distancia}
                      </div>
                      <div className="text-xs text-gray-500">km</div>
                    </div>
                  )}
                </div>

                {/* Información del negocio */}
                <div className="space-y-3 mb-4">
                  {/* Ubicación */}
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="text-gray-900">{socio.direccion}</div>
                      <div className="text-gray-500">{socio.comuna}</div>
                    </div>
                  </div>

                  {/* Teléfono del negocio */}
                  {socio.telefono_negocio && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <a
                        href={`tel:${socio.telefono_negocio}`}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {socio.telefono_negocio}
                      </a>
                    </div>
                  )}

                  {/* Horario */}
                  {socio.horario_atencion && (
                    <div className="flex items-start space-x-2">
                      <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{socio.horario_atencion}</span>
                    </div>
                  )}

                  {/* Características */}
                  <div className="flex flex-wrap gap-2">
                    {socio.permite_pedidos_directos && (
                      <span className="inline-flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        <Phone className="w-3 h-3 mr-1" />
                        Pedidos directos
                      </span>
                    )}
                    <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      <MapPin className="w-3 h-3 mr-1" />
                      {socio.tipo}
                    </span>
                  </div>
                </div>

                {/* Descripción si existe */}
                {socio.descripcion_negocio && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{socio.descripcion_negocio}</p>
                  </div>
                )}

                {/* Botón de navegación */}
                <div className="pt-2 border-t border-gray-100">
                  <a
                    href={getGoogleMapsUrl(socio.direccion, socio.comuna)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Cómo llegar
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mensaje cuando no hay ubicación */}
        {!loading && sociosMasCercanos.length === 0 && !location && !showPermissionBanner && (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Activa tu ubicación para ver puntos cercanos
            </h3>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              Permítenos acceder a tu ubicación para mostrarte los distribuidores más cercanos y calcular distancias.
            </p>
            <button
              onClick={() => setShowPermissionBanner(true)}
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Activar ubicación
            </button>
          </div>
        )}

        {/* Información gratuita */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🗺️ Mapas gratuitos por OpenStreetMap • 📍 Navegación por Google Maps • 🆓 Sin costo para ti
          </p>
        </div>
      </div>
    </div>
  );
};

export default SugerenciasSociosFree;