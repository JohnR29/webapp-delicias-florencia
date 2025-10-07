"use client";
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { SocioDistribuidor } from '@/hooks/useSociosDistribuidores';
import { useSociosCercanosFree } from '@/hooks/useSociosCercanosFree';

// Fix para los iconos de Leaflet en Next.js
import 'leaflet/dist/leaflet.css';

interface MapaDistribuidoresLeafletProps {
  socios: SocioDistribuidor[];
  className?: string;
}

const MapaDistribuidoresLeaflet: React.FC<MapaDistribuidoresLeafletProps> = ({ 
  socios, 
  className = '' 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Hook para geocodificación gratuita
  const { sociosCercanos, loading, geocodificarSocios } = useSociosCercanosFree();

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Crear mapa centrado en Santiago
    const map = L.map(mapRef.current).setView([-33.45, -70.65], 11);

    // Agregar tiles de OpenStreetMap (gratis)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Opcional: Usar CartoDB para un look más profesional
    // L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    //   attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
    //   maxZoom: 20
    // }).addTo(map);

    mapInstanceRef.current = map;
    setMapLoaded(true);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Función para crear popup con información del socio
  const createPopupContent = (socio: SocioDistribuidor & { coordenadas?: { lat: number; lng: number }, distancia?: number }) => {
    const direccionCompleta = `${socio.direccion}, ${socio.comuna}`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(direccionCompleta)}`;
    
    return `
      <div class="p-3 min-w-64">
        <div class="flex items-start justify-between mb-2">
          <h3 class="font-semibold text-lg text-gray-900 leading-tight">${socio.nombre_comercial}</h3>
          ${socio.permite_pedidos_directos ? 
            '<span class="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full whitespace-nowrap">Pedidos directos</span>' : 
            ''
          }
        </div>
        
        <div class="space-y-2 text-sm">
          <div class="flex items-center text-gray-600">
            <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span class="break-all">${direccionCompleta}</span>
          </div>
          
          ${socio.distancia ? 
            `<div class="flex items-center text-gray-600">
              <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
              <span>A ${socio.distancia} km de distancia</span>
            </div>` : 
            ''
          }
          
          ${socio.telefono_negocio ? 
            `<div class="flex items-center text-gray-600">
              <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              <a href="tel:${socio.telefono_negocio}" class="text-blue-600 hover:text-blue-800">${socio.telefono_negocio}</a>
            </div>` : 
            ''
          }
          
          ${socio.horario_atencion ? 
            `<div class="flex items-center text-gray-600">
              <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>${socio.horario_atencion}</span>
            </div>` : 
            ''
          }
          
          ${socio.descripcion_negocio ? 
            `<div class="mt-2 p-2 bg-gray-50 rounded text-gray-700 text-xs">
              ${socio.descripcion_negocio}
            </div>` : 
            ''
          }
        </div>
        
        <div class="mt-4 pt-2 border-t border-gray-200">
          <a 
            href="${googleMapsUrl}" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Cómo llegar (Google Maps)
          </a>
        </div>
      </div>
    `;
  };

  // Crear marcadores cuando tenemos socios geocodificados
  useEffect(() => {
    if (!mapInstanceRef.current || !sociosCercanos.length) return;

    // Limpiar marcadores existentes
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Crear nuevos marcadores
    const newMarkers: L.Marker[] = [];
    const bounds = L.latLngBounds([]);

    sociosCercanos.forEach(socio => {
      if (!socio.coordenadas) return;

      // Crear icono personalizado basado en características del socio
      const iconColor = socio.permite_pedidos_directos ? '#10b981' : '#3b82f6'; // Verde si acepta pedidos directos
      
      const customIcon = L.divIcon({
        html: `
          <div class="relative">
            <div class="w-6 h-6 bg-white rounded-full border-2 flex items-center justify-center shadow-lg" style="border-color: ${iconColor}">
              <div class="w-3 h-3 rounded-full" style="background-color: ${iconColor}"></div>
            </div>
            ${socio.permite_pedidos_directos ? 
              '<div class="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>' : 
              ''
            }
          </div>
        `,
        className: 'custom-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24]
      });

      const marker = L.marker([socio.coordenadas.lat, socio.coordenadas.lng], {
        icon: customIcon
      })
        .bindPopup(createPopupContent(socio), {
          maxWidth: 320,
          className: 'custom-popup'
        });

      marker.addTo(mapInstanceRef.current!);
      newMarkers.push(marker);
      bounds.extend([socio.coordenadas.lat, socio.coordenadas.lng]);
    });

    markersRef.current = newMarkers;

    // Ajustar vista para mostrar todos los marcadores
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { 
        padding: [20, 20],
        maxZoom: 15 
      });
    }

  }, [sociosCercanos]);

  // Geocodificar socios cuando cambian
  useEffect(() => {
    if (socios.length > 0) {
      geocodificarSocios();
    }
  }, [socios, geocodificarSocios]);

  return (
    <div className={`relative ${className}`}>
      {/* Estado de carga */}
      {loading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Procesando ubicaciones...</span>
          </div>
        </div>
      )}

      {/* Información sobre el mapa */}
      <div className="absolute top-4 right-4 z-10 bg-white p-3 rounded-lg shadow-lg max-w-xs">
        <div className="text-xs text-gray-600 mb-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span>Punto de venta</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Pedidos directos</span>
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          📍 Click en los marcadores para más información
        </div>
      </div>

      {/* Estadísticas */}
      <div className="absolute bottom-4 left-4 z-10 bg-white p-3 rounded-lg shadow-lg">
        <div className="text-sm font-medium text-gray-900 mb-1">
          {sociosCercanos.filter(s => s.coordenadas).length} puntos mostrados
        </div>
        <div className="text-xs text-gray-600">
          {sociosCercanos.filter(s => s.permite_pedidos_directos && s.coordenadas).length} aceptan pedidos directos
        </div>
      </div>

      {/* Mapa */}
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg border border-gray-200"
        style={{ minHeight: '400px' }}
      />

      {/* Información sobre datos gratuitos */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        Mapas por OpenStreetMap • Navegación por Google Maps • 100% Gratuito
      </div>

      {/* Estilos CSS personalizados */}
      <style jsx global>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .custom-popup .leaflet-popup-content {
          margin: 0;
          line-height: 1.4;
        }
        
        .custom-popup .leaflet-popup-tip {
          border-top-color: white;
        }

        .custom-marker {
          background: transparent !important;
          border: none !important;
        }

        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
    </div>
  );
};

export default MapaDistribuidoresLeaflet;