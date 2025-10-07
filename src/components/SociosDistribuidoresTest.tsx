"use client";
import { useSociosDistribuidores } from '../hooks/useSociosDistribuidores';

export default function SociosDistribuidoresTest() {
  const { 
    socios, 
    loading, 
    error, 
    totalSocios, 
    comunasDisponibles,
    sociosConPedidosDirectos,
    fetchSociosByComuna,
    searchSocios,
    getEstadisticas 
  } = useSociosDistribuidores();

  const handleTestEstadisticas = async () => {
    const stats = await getEstadisticas();
    console.log('Estadísticas:', stats);
    alert(`Total socios: ${stats?.total}, Comunas: ${Object.keys(stats?.porComuna || {}).join(', ')}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
          <span>Cargando socios distribuidores...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error al cargar socios:</h3>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            🧪 Prueba: Socios Distribuidores
          </h1>
          <p className="text-gray-600 mt-2">
            Componente de prueba para verificar el sistema de socios distribuidores
          </p>
        </div>

        {/* Estadísticas */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{totalSocios}</div>
              <div className="text-sm text-blue-800">Total Socios</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{comunasDisponibles.length}</div>
              <div className="text-sm text-green-800">Comunas</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{sociosConPedidosDirectos.length}</div>
              <div className="text-sm text-purple-800">Con Pedidos Directos</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">{totalSocios - sociosConPedidosDirectos.length}</div>
              <div className="text-sm text-orange-800">Solo Venta Presencial</div>
            </div>
          </div>
        </div>

        {/* Controles de prueba */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium mb-4">Controles de Prueba</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleTestEstadisticas}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Probar Estadísticas
            </button>
            <button
              onClick={() => searchSocios('almacén')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Buscar &quot;almacén&quot;
            </button>
            {comunasDisponibles.length > 0 && (
              <button
                onClick={() => fetchSociosByComuna(comunasDisponibles[0])}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Filtrar por {comunasDisponibles[0]}
              </button>
            )}
          </div>
        </div>

        {/* Lista de socios */}
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">
            Socios Distribuidores Encontrados ({socios.length})
          </h3>
          
          {socios.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">🏪</div>
              <p className="text-gray-500">No hay socios distribuidores activos</p>
              <p className="text-gray-400 text-sm mt-2">
                Asegúrate de tener al menos un usuario configurado como socio distribuidor
                con una dirección marcada como punto de venta público y visible en mapa.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {socios.map((socio) => (
                <div
                  key={`${socio.user_id}-${socio.address_id}`}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {/* Header del socio */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {socio.nombre_comercial}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {socio.nombre} {socio.apellido}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {socio.permite_pedidos_directos && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          📞 Pedidos directos
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Información del negocio */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <span className="w-4 h-4 mr-2">🏢</span>
                      {socio.negocio}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="w-4 h-4 mr-2">📍</span>
                      {socio.direccion}, {socio.comuna}
                    </div>
                    {socio.telefono_negocio && (
                      <div className="flex items-center text-gray-600">
                        <span className="w-4 h-4 mr-2">📞</span>
                        {socio.telefono_negocio}
                      </div>
                    )}
                    {socio.horario_atencion && (
                      <div className="flex items-center text-gray-600">
                        <span className="w-4 h-4 mr-2">🕒</span>
                        {socio.horario_atencion}
                      </div>
                    )}
                  </div>

                  {/* Descripción */}
                  {socio.descripcion_negocio && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {socio.descripcion_negocio}
                      </p>
                    </div>
                  )}

                  {/* Footer con tipo de negocio */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {socio.tipo}
                    </span>
                    <div className="text-xs text-gray-400">
                      ID: {socio.address_id.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Información de debug */}
        <div className="bg-gray-50 p-4 border-t border-gray-200">
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
              Ver información de debug
            </summary>
            <div className="mt-2 space-y-2 text-gray-600">
              <p><strong>Comunas disponibles:</strong> {comunasDisponibles.join(', ') || 'Ninguna'}</p>
              <p><strong>Hook loading:</strong> {loading ? 'true' : 'false'}</p>
              <p><strong>Hook error:</strong> {error || 'null'}</p>
              <p><strong>Datos en consola:</strong> Abre DevTools para ver más detalles</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}