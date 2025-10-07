"use client";
import { SocioDistribuidor } from '../hooks/useSociosDistribuidores';

interface SociosListaProps {
  socios: SocioDistribuidor[];
  loading: boolean;
  error: string | null;
}

export default function SociosLista({ socios, loading, error }: SociosListaProps) {
  // Función para abrir Google Maps con la dirección
  const abrirEnGoogleMaps = (socio: SocioDistribuidor) => {
    const direccionCompleta = `${socio.direccion}, ${socio.comuna}, Chile`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionCompleta)}`;
    window.open(url, '_blank');
  };

  // Función para llamar por teléfono
  const llamarTelefono = (telefono: string) => {
    window.open(`tel:${telefono}`, '_self');
  };

  // Función para enviar email
  const enviarEmail = (email: string) => {
    window.open(`mailto:${email}`, '_self');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Skeleton loading */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-64"></div>
                <div className="h-4 bg-gray-200 rounded w-56"></div>
                <div className="h-4 bg-gray-200 rounded w-40"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="text-red-500 mr-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-red-800 font-medium">Error al cargar puntos de venta</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (socios.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="text-gray-400 text-6xl mb-6">🏪</div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          No hay puntos de venta disponibles
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          No encontramos puntos de venta que coincidan con tus criterios de búsqueda. 
          Intenta ajustar los filtros o buscar en otra comuna.
        </p>
        <div className="text-sm text-gray-500">
          <p>¿No encuentras un punto cerca de ti?</p>
          <p>Contáctanos para sugerir nuevos distribuidores en tu zona.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {socios.map((socio) => (
        <div
          key={`${socio.user_id}-${socio.address_id}`}
          className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200"
        >
          <div className="p-6">
            {/* Header del socio */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {socio.nombre_comercial}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {socio.tipo}
                  </span>
                </div>
                <p className="text-gray-600">
                  {socio.negocio}
                </p>
              </div>
              
              {/* Badge de pedidos directos */}
              {socio.permite_pedidos_directos && (
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    📞 Pedidos directos
                  </span>
                </div>
              )}
            </div>

            {/* Información principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna izquierda - Información de contacto */}
              <div className="space-y-3">
                {/* Dirección */}
                <div className="flex items-start">
                  <div className="text-gray-400 mr-3 mt-0.5">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">{socio.direccion}</p>
                    <p className="text-gray-600 text-sm">{socio.comuna}</p>
                  </div>
                </div>

                {/* Teléfono del negocio */}
                {socio.telefono_negocio && (
                  <div className="flex items-center">
                    <div className="text-gray-400 mr-3">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-900">{socio.telefono_negocio}</p>
                      {socio.contacto && (
                        <p className="text-gray-600 text-sm">Contacto: {socio.contacto}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Email del negocio */}
                {socio.email_negocio && (
                  <div className="flex items-center">
                    <div className="text-gray-400 mr-3">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <p className="text-gray-900">{socio.email_negocio}</p>
                  </div>
                )}
              </div>

              {/* Columna derecha - Horarios y descripción */}
              <div className="space-y-3">
                {/* Horarios */}
                {socio.horario_atencion && (
                  <div className="flex items-start">
                    <div className="text-gray-400 mr-3 mt-0.5">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">Horarios</p>
                      <p className="text-gray-600 text-sm whitespace-pre-line">{socio.horario_atencion}</p>
                    </div>
                  </div>
                )}

                {/* Descripción */}
                {socio.descripcion_negocio && (
                  <div className="flex items-start">
                    <div className="text-gray-400 mr-3 mt-0.5">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">Sobre el negocio</p>
                      <p className="text-gray-600 text-sm">{socio.descripcion_negocio}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-100">
              {/* Botón de ubicación (siempre disponible) */}
              <button
                onClick={() => abrirEnGoogleMaps(socio)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Cómo llegar
              </button>

              {/* Botón de teléfono */}
              {socio.telefono_negocio && (
                <button
                  onClick={() => llamarTelefono(socio.telefono_negocio!)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Llamar
                </button>
              )}

              {/* Botón de email */}
              {socio.email_negocio && (
                <button
                  onClick={() => enviarEmail(socio.email_negocio!)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  Email
                </button>
              )}

              {/* Indicador de pedidos directos */}
              {socio.permite_pedidos_directos && (
                <div className="flex items-center text-green-600 text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Acepta pedidos por teléfono
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}