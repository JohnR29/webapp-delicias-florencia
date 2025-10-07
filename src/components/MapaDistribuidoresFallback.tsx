"use client";
import { useEffect, useRef, useState } from 'react';
import { SocioDistribuidor } from '@/hooks/useSociosDistribuidores';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';

interface MapaDistribuidoresFallbackProps {
  socios: SocioDistribuidor[];
  className?: string;
}

// Coordenadas de las comunas de cobertura
const COMUNAS_COORDS = {
  'San Bernardo': { lat: -33.606246, lng: -70.700462, color: '#3b82f6' },
  'La Pintana': { lat: -33.579463, lng: -70.648956, color: '#10b981' },
  'El Bosque': { lat: -33.559729, lng: -70.672550, color: '#f59e0b' },
  'La Cisterna': { lat: -33.528348, lng: -70.668608, color: '#ef4444' }
};

const MapaDistribuidoresFallback: React.FC<MapaDistribuidoresFallbackProps> = ({ 
  socios, 
  className = '' 
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [L, setL] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Cargar Leaflet dinámicamente
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadLeaflet = async () => {
      try {
        // Cargar CSS de Leaflet desde CDN
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement('link');
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.rel = 'stylesheet';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        // Cargar JavaScript de Leaflet
        const LeafletModule = await import('leaflet');
        const leaflet = LeafletModule.default;

        // Fix para iconos en Next.js
        delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
        leaflet.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        setL(leaflet);
        setMapLoaded(true);
      } catch (error) {
        console.error('Error cargando Leaflet:', error);
        setMapLoaded(false);
      }
    };

    loadLeaflet();
  }, []);

  // Inicializar mapa cuando Leaflet esté cargado
  useEffect(() => {
    if (!L || !mapRef.current || mapInstanceRef.current) return;

    try {
      // Crear mapa centrado en Santiago Sur
      const map = L.map(mapRef.current).setView([-33.55, -70.65], 12);

      // Agregar tiles de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Agregar marcadores de las comunas de cobertura
      Object.entries(COMUNAS_COORDS).forEach(([comuna, coords]) => {
        const sociosEnComuna = socios.filter(s => s.comuna === comuna);
        
        const marker = L.marker([coords.lat, coords.lng]).addTo(map);
        
        const popupContent = `
          <div style="padding: 12px; min-width: 200px; font-family: system-ui, -apple-system, sans-serif;">
            <h3 style="font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 8px 0;">${comuna}</h3>
            <div style="margin-bottom: 8px; color: #6b7280; font-size: 14px;">
              <strong>${sociosEnComuna.length}</strong> ${sociosEnComuna.length === 1 ? 'punto de venta' : 'puntos de venta'}
            </div>
            ${sociosEnComuna.length > 0 ? `
              <div style="margin-bottom: 12px;">
                ${sociosEnComuna.slice(0, 3).map(socio => `
                  <div style="margin-bottom: 6px; padding: 6px; background: #f9fafb; border-radius: 4px; font-size: 12px;">
                    <div style="font-weight: 500; color: #111827;">${socio.nombre_comercial}</div>
                    <div style="color: #6b7280;">${socio.direccion}</div>
                    ${socio.telefono_negocio ? `<div style="color: #2563eb;"><a href="tel:${socio.telefono_negocio}" style="text-decoration: none; color: inherit;">📞 ${socio.telefono_negocio}</a></div>` : ''}
                  </div>
                `).join('')}
                ${sociosEnComuna.length > 3 ? `<div style="font-size: 11px; color: #6b7280; text-align: center;">y ${sociosEnComuna.length - 3} más...</div>` : ''}
              </div>
            ` : `
              <div style="margin-bottom: 12px; padding: 8px; background: #fef3c7; border-radius: 4px; font-size: 12px; color: #92400e;">
                No hay puntos de venta activos en esta comuna por el momento.
              </div>
            `}
            <a 
              href="https://www.google.com/maps/search/Delicias+Florencia+${encodeURIComponent(comuna)}" 
              target="_blank" 
              rel="noopener noreferrer" 
              style="display: inline-flex; align-items: center; justify-content: center; width: 100%; background: #2563eb; color: white; text-decoration: none; font-size: 12px; font-weight: 500; padding: 6px 12px; border-radius: 4px;"
            >
              🗺️ Ver en Google Maps
            </a>
          </div>
        `;
        
        marker.bindPopup(popupContent, { maxWidth: 300 });
      });

      mapInstanceRef.current = map;
    } catch (error) {
      console.error('Error inicializando mapa:', error);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (error) {
          console.error('Error removiendo mapa:', error);
        }
      }
    };
  }, [L, socios]);

  // Mostrar fallback si no se puede cargar el mapa
  if (!mapLoaded) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full h-96 rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium mb-2">Cargando mapa interactivo...</p>
            <p className="text-gray-500 text-sm">Preparando vista de ubicaciones</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Información sobre el mapa */}
      <div className="absolute top-4 right-4 z-10 bg-white p-3 rounded-lg shadow-lg max-w-xs">
        <div className="text-xs text-gray-600 mb-2">
          <div className="flex items-center space-x-2 mb-1">
            <MapPin className="w-3 h-3 text-blue-500" />
            <span>Zonas de cobertura</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {Object.keys(COMUNAS_COORDS).map(comuna => (
              <div key={comuna} className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-1`} style={{ backgroundColor: COMUNAS_COORDS[comuna as keyof typeof COMUNAS_COORDS].color }}></div>
                <span className="truncate">{comuna}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs text-gray-500">
          📍 Click en los marcadores para detalles
        </div>
      </div>

      {/* Estadísticas */}
      <div className="absolute bottom-4 left-4 z-10 bg-white p-3 rounded-lg shadow-lg">
        <div className="text-sm font-medium text-gray-900 mb-1">
          {socios.length} puntos de venta activos
        </div>
        <div className="text-xs text-gray-600">
          En {Object.keys(COMUNAS_COORDS).length} comunas de cobertura
        </div>
      </div>

      {/* Mapa */}
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg border border-gray-200 bg-gray-50"
        style={{ minHeight: '400px' }}
      />

      {/* Información sobre datos gratuitos */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Vista de cobertura por comunas
            </h4>
            <p className="text-sm text-blue-800 mb-2">
              Este mapa muestra las zonas donde tenemos distribuidores activos. Click en cada marcador para ver los puntos de venta específicos de esa comuna.
            </p>
            <div className="text-xs text-blue-700">
              🗺️ Mapas gratuitos por OpenStreetMap • 📍 Navegación por Google Maps • 🆓 Sin costo
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapaDistribuidoresFallback;