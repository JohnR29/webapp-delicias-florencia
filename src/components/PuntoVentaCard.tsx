"use client";
import { SocioDistribuidor } from '@/hooks/useSociosDistribuidores';

interface PuntoVentaCardProps {
  socio: SocioDistribuidor & { coordenadas?: { lat: number; lng: number }; distancia?: number };
  onVerDetalles?: (socio: SocioDistribuidor) => void;
  compact?: boolean;
}

const PuntoVentaCard: React.FC<PuntoVentaCardProps> = ({ 
  socio, 
  onVerDetalles,
  compact = false 
}) => {
  const direccionCompleta = `${socio.direccion}, ${socio.comuna}`;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(direccionCompleta)}`;

  const formatearDistancia = (distancia?: number): string => {
    if (!distancia) return '';
    if (distancia < 1) {
      return `${Math.round(distancia * 1000)}m`;
    }
    return `${distancia.toFixed(1)}km`;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${
      compact ? 'p-3' : 'p-4'
    }`}>
      {/* Header con nombre y distancia */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-gray-900 truncate ${
            compact ? 'text-sm' : 'text-base'
          }`}>
            {socio.nombre_comercial}
          </h3>
          <div className="flex items-center mt-1">
            <span className="text-xs text-gray-500 mr-2">📍 {socio.comuna}</span>
            {socio.permite_pedidos_directos && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                Pedidos directos
              </span>
            )}
          </div>
        </div>
        
        {socio.distancia && (
          <div className="ml-3 text-right">
            <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
              📏 {formatearDistancia(socio.distancia)}
            </div>
          </div>
        )}
      </div>

      {/* Información rápida */}
      <div className="space-y-1 mb-3">
        {socio.telefono_negocio && (
          <div className="flex items-center text-xs text-gray-600">
            <span className="mr-2">📞</span>
            <a 
              href={`tel:${socio.telefono_negocio}`}
              className="hover:text-blue-600 transition-colors"
            >
              {socio.telefono_negocio}
            </a>
          </div>
        )}
        
        {socio.horario_atencion && (
          <div className="flex items-center text-xs text-gray-600">
            <span className="mr-2">🕒</span>
            <span className="truncate">{socio.horario_atencion}</span>
          </div>
        )}
        
        {!compact && socio.descripcion_negocio && (
          <div className="text-xs text-gray-500 mt-2" style={{ 
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {socio.descripcion_negocio}
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className={`flex gap-2 ${compact ? 'flex-col' : 'flex-row'}`}>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-2 rounded-md transition-colors ${
            compact ? 'flex-1' : 'flex-1'
          }`}
        >
          <span className="mr-1">🧭</span>
          Cómo llegar
        </a>
        
        {onVerDetalles && (
          <button
            onClick={() => onVerDetalles(socio)}
            className={`flex items-center justify-center border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 text-xs font-medium px-3 py-2 rounded-md transition-colors ${
              compact ? 'flex-1' : 'flex-1'
            }`}
          >
            <span className="mr-1">👁️</span>
            Ver detalles
          </button>
        )}
      </div>
    </div>
  );
};

export default PuntoVentaCard;