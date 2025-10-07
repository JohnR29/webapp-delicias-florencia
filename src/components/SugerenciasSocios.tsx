"use client";

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, Clock, CheckCircle } from 'lucide-react';
import { useSociosCercanos } from '@/hooks/useSociosCercanos';

interface SugerenciasSociosProps {
  limite?: number;
  radioKm?: number;
  mostrarMapa?: boolean;
  className?: string;
}

const SugerenciasSocios: React.FC<SugerenciasSociosProps> = ({
  limite = 5,
  radioKm = 10,
  mostrarMapa = false,
  className = ''
}) => {
  const {
    sociosCercanos,
    location,
    loading,
    error,
    buscarSociosCercanos,
    getSociosMasCercanos,
    getSociosEnRadio,
    getSocioMasCercano,
    haLocation,
    sociosConDistancia
  } = useSociosCercanos();

  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [solicitandoUbicacion, setSolicitandoUbicacion] = useState(false);

  // Obtener sugerencias según los filtros
  const sociosSugeridos = mostrarTodos 
    ? getSociosEnRadio(radioKm)
    : getSociosMasCercanos(limite);

  const socioMasCercano = getSocioMasCercano();

  const handleSolicitarUbicacion = async () => {
    setSolicitandoUbicacion(true);
    try {
      await buscarSociosCercanos();
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
    } finally {
      setSolicitandoUbicacion(false);
    }
  };

  const formatearDistancia = (distancia: number) => {
    if (distancia < 1) {
      return `${Math.round(distancia * 1000)} m`;
    }
    return `${distancia} km`;
  };

  const abrirNavegacion = (direccion: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(direccion)}`;
    window.open(url, '_blank');
  };

  // Si no hay ubicación, mostrar botón para solicitarla
  if (!haLocation && !loading) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-6 text-center ${className}`}>
        <div className="mb-4">
          <MapPin className="h-12 w-12 text-blue-500 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            ¿Dónde estás ubicado?
          </h3>
          <p className="text-blue-700 text-sm">
            Permítenos acceder a tu ubicación para mostrarte los puntos de venta más cercanos.
          </p>
        </div>
        
        <button
          onClick={handleSolicitarUbicacion}
          disabled={solicitandoUbicacion}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {solicitandoUbicacion ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Obteniendo ubicación...
            </span>
          ) : (
            <span className="flex items-center">
              <Navigation className="h-4 w-4 mr-2" />
              Encontrar puntos cercanos
            </span>
          )}
        </button>
        
        <p className="text-xs text-blue-600 mt-3">
          Necesitamos tu ubicación para calcular distancias. No la almacenamos.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 text-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Buscando puntos de venta cercanos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-red-800 text-sm">{error}</p>
        <button
          onClick={handleSolicitarUbicacion}
          className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
        >
          Intentar nuevamente
        </button>
      </div>
    );
  }

  if (!sociosSugeridos.length) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center ${className}`}>
        <MapPin className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">
          No hay puntos de venta cercanos
        </h3>
        <p className="text-yellow-700 text-sm">
          No encontramos puntos de venta en un radio de {radioKm} km de tu ubicación.
        </p>
        <p className="text-yellow-600 text-xs mt-2">
          Puedes ver todos los puntos disponibles en la sección &quot;Dónde Comprar&quot;.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Punto más cercano destacado */}
      {socioMasCercano && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="font-semibold text-green-900">Punto más cercano</h3>
              </div>
              
              <h4 className="text-lg font-bold text-gray-900 mb-1">
                {socioMasCercano.nombre_comercial}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {formatearDistancia(socioMasCercano.distancia!)} - {socioMasCercano.comuna}
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  {socioMasCercano.telefono}
                </div>
                {socioMasCercano.horario_atencion && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {socioMasCercano.horario_atencion}
                  </div>
                )}
                {socioMasCercano.permite_pedidos_directos && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Acepta pedidos directos
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => abrirNavegacion(socioMasCercano.direccionCompleta || `${socioMasCercano.direccion}, ${socioMasCercano.comuna}`)}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                >
                  Cómo llegar
                </button>
                <a
                  href={`tel:${socioMasCercano.telefono}`}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                >
                  Llamar
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de puntos cercanos */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Puntos de venta cercanos ({sociosConDistancia})
          </h3>
          {sociosConDistancia > limite && (
            <button
              onClick={() => setMostrarTodos(!mostrarTodos)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {mostrarTodos ? 'Mostrar menos' : `Ver todos (${sociosConDistancia})`}
            </button>
          )}
        </div>

        <div className="space-y-3">
          {sociosSugeridos.map((socio, index) => (
            <div key={socio.user_id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {socio.nombre_comercial}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm text-gray-600 mb-2">
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {socio.distancia ? formatearDistancia(socio.distancia) : 'Distancia no disponible'} - {socio.comuna}
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {socio.telefono}
                    </div>
                  </div>

                  {socio.permite_pedidos_directos && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Acepta pedidos directos
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col gap-1 ml-4">
                  <button
                    onClick={() => abrirNavegacion(socio.direccionCompleta || `${socio.direccion}, ${socio.comuna}`)}
                    className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  >
                    Ir
                  </button>
                  <a
                    href={`tel:${socio.telefono}`}
                    className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors text-center"
                  >
                    📞
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sociosConDistancia === 0 && sociosCercanos.length > 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            Hay {sociosCercanos.length} puntos de venta disponibles, pero no pudimos calcular las distancias.
          </div>
        )}
      </div>
    </div>
  );
};

export default SugerenciasSocios;