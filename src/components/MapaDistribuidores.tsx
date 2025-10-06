"use client";

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { SocioDistribuidorConDistancia } from '@/hooks/useSociosCercanos';
import { UserLocation } from '@/hooks/useGeolocation';

// Declaración global para Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}

interface MapaDistribuidoresProps {
  socios: SocioDistribuidorConDistancia[];
  userLocation?: UserLocation | null;
  className?: string;
  height?: string;
  zoom?: number;
  onSocioClick?: (socio: SocioDistribuidorConDistancia) => void;
}

const MapaDistribuidores: React.FC<MapaDistribuidoresProps> = ({
  socios,
  userLocation,
  className = '',
  height = '400px',
  zoom = 11,
  onSocioClick
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null);

  // Cargar Google Maps script
  useEffect(() => {
    const loadGoogleMaps = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.google && window.google.maps) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Error cargando Google Maps'));
        document.head.appendChild(script);
      });
    };

    const initMap = async () => {
      try {
        await loadGoogleMaps();
        
        if (!mapRef.current) return;

        // Configuración del mapa
        let mapCenter = { lat: -33.5209, lng: -70.7691 }; // San Bernardo por defecto
        
        // Si tenemos ubicación del usuario, centrar ahí
        if (userLocation) {
          mapCenter = {
            lat: userLocation.latitude,
            lng: userLocation.longitude
          };
        }

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: mapCenter,
          zoom: zoom,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        setMap(mapInstance);
        setLoading(false);
      } catch (err) {
        console.error('Error cargando Google Maps:', err);
        setError('Error al cargar el mapa. Verifica la configuración de la API key.');
        setLoading(false);
      }
    };

    initMap();
  }, [zoom, userLocation]);

  // Agregar marcador del usuario
  useEffect(() => {
    if (!map || !userLocation) return;

    // Limpiar marcador previo del usuario
    if (userMarker) {
      userMarker.setMap(null);
    }

    const marker = new google.maps.Marker({
      position: {
        lat: userLocation.latitude,
        lng: userLocation.longitude
      },
      map: map,
      title: 'Tu ubicación',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="#FFFFFF" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="#FFFFFF"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(24, 24),
        anchor: new google.maps.Point(12, 12)
      }
    });

    // Info window para el usuario
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div class="p-2">
          <h3 class="font-semibold text-blue-900">Tu ubicación</h3>
          <p class="text-sm text-gray-600">Precisión: ${Math.round(userLocation.accuracy)} metros</p>
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });

    setUserMarker(marker);
  }, [map, userLocation]);

  // Agregar marcadores de socios distribuidores
  useEffect(() => {
    if (!map || !socios.length) return;

    // Limpiar marcadores previos
    markers.forEach(marker => marker.setMap(null));

    const newMarkers: google.maps.Marker[] = [];

    socios.forEach((socio) => {
      if (!socio.coordenadas) return;

      // Crear marcador
      const marker = new google.maps.Marker({
        position: {
          lat: socio.coordenadas.lat,
          lng: socio.coordenadas.lng
        },
        map: map,
        title: socio.nombre_comercial,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2C10.48 2 6 6.48 6 12C6 20 16 30 16 30C16 30 26 20 26 12C26 6.48 21.52 2 16 2Z" fill="#EF4444" stroke="#FFFFFF" stroke-width="2"/>
              <circle cx="16" cy="12" r="4" fill="#FFFFFF"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 30)
        }
      });

      // Crear info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-3 max-w-sm">
            <h3 class="font-semibold text-lg text-gray-900 mb-2">${socio.nombre_comercial}</h3>
            <div class="space-y-1 text-sm text-gray-600">
              <p><strong>Dirección:</strong> ${socio.direccion}, ${socio.comuna}</p>
              <p><strong>Contacto:</strong> ${socio.contacto}</p>
              <p><strong>Teléfono:</strong> ${socio.telefono}</p>
              ${socio.horario_atencion ? `<p><strong>Horario:</strong> ${socio.horario_atencion}</p>` : ''}
              ${socio.distancia ? `<p><strong>Distancia:</strong> ${socio.distancia} km</p>` : ''}
              ${socio.permite_pedidos_directos ? '<p class="text-green-600"><strong>✓ Acepta pedidos directos</strong></p>' : ''}
            </div>
            <div class="mt-3 flex gap-2">
              <a 
                href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(socio.direccionCompleta || socio.direccion + ', ' + socio.comuna)}" 
                target="_blank" 
                class="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              >
                Cómo llegar
              </a>
              ${socio.telefono ? `
                <a 
                  href="tel:${socio.telefono}" 
                  class="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                >
                  Llamar
                </a>
              ` : ''}
            </div>
          </div>
        `
      });

      // Event listeners
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        if (onSocioClick) {
          onSocioClick(socio);
        }
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // Ajustar vista para mostrar todos los marcadores
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      
      // Incluir ubicación del usuario si existe
      if (userLocation) {
        bounds.extend({
          lat: userLocation.latitude,
          lng: userLocation.longitude
        });
      }
      
      // Incluir todos los socios
      newMarkers.forEach(marker => {
        const position = marker.getPosition();
        if (position) {
          bounds.extend(position);
        }
      });

      map.fitBounds(bounds);
      
      // Asegurar un zoom mínimo
      const listener = google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() && map.getZoom()! > 15) {
          map.setZoom(15);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [map, socios, onSocioClick]);

  if (loading) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-red-50 border border-red-200 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center p-4">
          <p className="text-red-800">{error}</p>
          <p className="text-red-600 text-sm mt-2">
            Asegúrate de que la API key de Google Maps esté configurada correctamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className={`rounded-lg overflow-hidden shadow-md ${className}`}
      style={{ height }}
    />
  );
};

export default MapaDistribuidores;