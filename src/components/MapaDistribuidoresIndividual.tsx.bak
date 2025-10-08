"use client";
import { useEffect, useRef, useState } from 'react';
import { SocioDistribuidor } from '@/hooks/useSociosDistribuidores';
import { useGeolocationFree } from '@/hooks/useGeolocationFree';
import { useRankingDistancia } from '@/hooks/useRankingDistancia';
import PuntoVentaCard from './PuntoVentaCard';

interface MapaDistribuidoresIndividualProps {
  socios: SocioDistribuidor[];
  className?: string;
}

const MapaDistribuidoresIndividual: React.FC<MapaDistribuidoresIndividualProps> = ({ 
  socios, 
  className = '' 
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [L, setL] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);

  // Estado para la nueva vista
  const [socioSeleccionado, setSocioSeleccionado] = useState<SocioDistribuidor | null>(null);

  // Hook para obtener ubicación del usuario
  const { location: userLocation, getCurrentLocation, permissionState, calculateDistance, loading: geoLoading, error: geoError } = useGeolocationFree();

  // Obtener ubicación automáticamente si ya se tienen permisos
  useEffect(() => {
    if (permissionState === 'granted' && !userLocation && !geoLoading) {
      getCurrentLocation();
    }
  }, [permissionState, userLocation, geoLoading, getCurrentLocation]);

  // Coordenadas de referencia por comuna
  const COMUNAS_COORDS = {
    'San Bernardo': { lat: -33.606246, lng: -70.700462 },
    'La Pintana': { lat: -33.579463, lng: -70.648956 },
    'El Bosque': { lat: -33.559729, lng: -70.672550 },
    'La Cisterna': { lat: -33.528348, lng: -70.668608 }
  };

  // Cargar Leaflet dinámicamente
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadLeaflet = async () => {
      try {
        // Cargar CSS de Leaflet
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
      }
    };

    loadLeaflet();
  }, []);

  // Inicializar mapa
  useEffect(() => {
    if (!L || !mapRef.current || mapInstanceRef.current) return;

    try {
      const map = L.map(mapRef.current).setView([-33.55, -70.65], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

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
  }, [L]);

  // Función para crear contenido del popup
  const createPopupContent = (socio: SocioDistribuidor & { coordenadas?: { lat: number; lng: number } }) => {
    const direccionCompleta = `${socio.direccion}, ${socio.comuna}`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(direccionCompleta)}`;
    
    // Calcular distancia si tenemos ubicación del usuario
    let distanciaTexto = '';
    if (userLocation && socio.coordenadas) {
      const distancia = calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        socio.coordenadas.lat, 
        socio.coordenadas.lng
      );
      distanciaTexto = `
        <div style="display: flex; align-items: center; margin-bottom: 6px; color: #059669; font-size: 14px; font-weight: 500;">
          <span style="margin-right: 6px;">📏</span>
          <span>A ${distancia} km de tu ubicación</span>
        </div>
      `;
    }
    
    return `
      <div style="padding: 0; min-width: 280px; max-width: 350px; font-family: system-ui, -apple-system, sans-serif; border-radius: 12px; overflow: hidden; background: white;">
        <!-- Header del negocio -->
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 16px; position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div style="display: flex; align-items: center;">
              <span style="font-size: 24px; margin-right: 8px;">🏪</span>
              <h3 style="font-size: 18px; font-weight: 700; color: #92400e; margin: 0; line-height: 1.2;">${socio.nombre_comercial}</h3>
            </div>
            ${socio.permite_pedidos_directos ? 
              '<div style="background: #059669; color: white; font-size: 10px; padding: 4px 8px; border-radius: 20px; white-space: nowrap; display: flex; align-items: center;"><span style="margin-right: 4px;">📞</span>Pedidos directos</div>' : 
              '<div style="background: #6b7280; color: white; font-size: 10px; padding: 4px 8px; border-radius: 20px; white-space: nowrap;">🏪 Punto de venta</div>'
            }
          </div>
          
          ${distanciaTexto ? `
            <div style="display: flex; align-items: center; color: #059669; font-size: 13px; font-weight: 600; margin-top: 8px;">
              <span style="margin-right: 6px;">🎯</span>
              <span>A ${userLocation && socio.coordenadas ? calculateDistance(userLocation.lat, userLocation.lng, socio.coordenadas.lat, socio.coordenadas.lng) : '?'} km de tu ubicación</span>
            </div>
          ` : ''}
        </div>
        
        <!-- Información del negocio -->
        <div style="padding: 16px;">
          <div style="margin-bottom: 12px;">
            <div style="display: flex; align-items: flex-start; margin-bottom: 8px; color: #374151; font-size: 14px;">
              <span style="margin-right: 8px; color: #f59e0b;">📍</span>
              <span style="line-height: 1.4;"><strong>${direccionCompleta}</strong></span>
            </div>
            
            ${socio.telefono_negocio ? 
              `<div style="display: flex; align-items: center; margin-bottom: 8px; color: #374151; font-size: 14px;">
                <span style="margin-right: 8px; color: #10b981;">📞</span>
                <a href="tel:${socio.telefono_negocio}" style="color: #059669; text-decoration: none; font-weight: 500; border-bottom: 1px dashed #059669;">${socio.telefono_negocio}</a>
              </div>` : 
              ''
            }
            
            ${socio.horario_atencion ? 
              `<div style="display: flex; align-items: center; margin-bottom: 8px; color: #374151; font-size: 14px;">
                <span style="margin-right: 8px; color: #3b82f6;">🕒</span>
                <span><strong>Horarios:</strong> ${socio.horario_atencion}</span>
              </div>` : 
              ''
            }
          </div>
          
          ${socio.descripcion_negocio ? 
            `<div style="background: #f8fafc; border-left: 4px solid #e2e8f0; padding: 12px; margin-bottom: 16px; font-size: 13px; color: #475569; line-height: 1.5; border-radius: 0 6px 6px 0;">
              <div style="display: flex; align-items: flex-start;">
                <span style="margin-right: 8px; color: #64748b;">💬</span>
                <span style="font-style: italic;">"${socio.descripcion_negocio}"</span>
              </div>
            </div>` : 
            ''
          }
          
          <!-- Botones de acción -->
          <div style="display: flex; gap: 8px;">
            <a 
              href="${googleMapsUrl}" 
              target="_blank" 
              rel="noopener noreferrer" 
              style="flex: 1; display: inline-flex; align-items: center; justify-content: center; background: #2563eb; color: white; text-decoration: none; font-size: 13px; font-weight: 600; padding: 10px 12px; border-radius: 8px; transition: all 0.2s;"
              onmouseover="this.style.background='#1d4ed8'; this.style.transform='translateY(-1px)'"
              onmouseout="this.style.background='#2563eb'; this.style.transform='translateY(0)'"
            >
              <span style="margin-right: 6px;">🧭</span>
              Cómo llegar
            </a>
            
            ${socio.telefono_negocio ? `
              <a 
                href="tel:${socio.telefono_negocio}" 
                style="flex: 1; display: inline-flex; align-items: center; justify-content: center; background: #059669; color: white; text-decoration: none; font-size: 13px; font-weight: 600; padding: 10px 12px; border-radius: 8px; transition: all 0.2s;"
                onmouseover="this.style.background='#047857'; this.style.transform='translateY(-1px)'"
                onmouseout="this.style.background='#059669'; this.style.transform='translateY(0)'"
              >
                <span style="margin-right: 6px;">📞</span>
                Llamar
              </a>
            ` : ''}
          </div>
        </div>
        
        <!-- Footer con especialidad -->
        <div style="background: #f1f5f9; padding: 12px 16px; border-top: 1px solid #e2e8f0;">
          <div style="display: flex; align-items: center; justify-content: center; color: #64748b; font-size: 12px;">
            <span style="margin-right: 6px;">🎂</span>
            <span style="font-weight: 500;">Productos Delicias Florencia disponibles</span>
          </div>
        </div>
      </div>
    `;
  };

  // Estado para coordenadas geocodificadas
  const [sociosGeocodificados, setSociosGeocodificados] = useState<(SocioDistribuidor & { coordenadas?: { lat: number; lng: number } })[]>([]);
  const [geocodingLoading, setGeocodingLoading] = useState(false);

  // Hook para ranking por distancia
  const { sociosOrdenados, sociosCercanos } = useRankingDistancia(sociosGeocodificados, userLocation, 2);

  // Función para geocodificar dirección usando Nominatim (gratis)
  const geocodificarDireccion = async (direccion: string, comuna: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const direccionCompleta = `${direccion}, ${comuna}, Chile`;
      const encodedAddress = encodeURIComponent(direccionCompleta);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=cl`,
        {
          headers: {
            'User-Agent': 'Delicias-Florencia-WebApp/1.0'
          }
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error en geocodificación:', error);
      return null;
    }
  };

  // Geocodificar todos los socios cuando cambian
  useEffect(() => {
    if (!socios.length) return;

    const geocodificarSocios = async () => {
      setGeocodingLoading(true);
      const sociosConCoordenadas: (SocioDistribuidor & { coordenadas?: { lat: number; lng: number } })[] = [];

      for (const socio of socios) {
        try {
          // Intentar geocodificar dirección real
          let coordenadas = await geocodificarDireccion(socio.direccion, socio.comuna);
          
          // Si falla, intentar con solo el nombre comercial
          if (!coordenadas) {
            coordenadas = await geocodificarDireccion(socio.nombre_comercial, socio.comuna);
          }
          
          // Si aún falla, usar coordenadas de comuna como fallback
          if (!coordenadas) {
            const coordsComuna = COMUNAS_COORDS[socio.comuna as keyof typeof COMUNAS_COORDS];
            if (coordsComuna) {
              // Agregar pequeño offset aleatorio para no superponer
              const randomOffset = 0.003;
              coordenadas = {
                lat: coordsComuna.lat + (Math.random() - 0.5) * randomOffset,
                lng: coordsComuna.lng + (Math.random() - 0.5) * randomOffset
              };
            }
          }

          sociosConCoordenadas.push({
            ...socio,
            coordenadas: coordenadas || undefined
          });

          // Pausa entre requests para ser respetuosos con Nominatim
          await new Promise(resolve => setTimeout(resolve, 300));
          
        } catch (error) {
          // Error geocodificando, se omite del mapa
          sociosConCoordenadas.push({
            ...socio
          });
        }
      }

      setSociosGeocodificados(sociosConCoordenadas);
      setGeocodingLoading(false);
    };

    geocodificarSocios();
  }, [socios]);

  // Crear marcador de ubicación del usuario
  useEffect(() => {
    if (!L || !mapInstanceRef.current || !userLocation) return;

    // Remover marcador anterior del usuario si existe
    if (userMarkerRef.current) {
      mapInstanceRef.current.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    try {
      // Crear icono personalizado para el usuario
      const userIcon = L.divIcon({
        html: `
          <div style="position: relative; z-index: 1000;">
            <div class="user-marker-pulse" style="position: absolute; top: 0; left: 0; width: 30px; height: 30px; background: rgba(220, 38, 38, 0.3); border-radius: 50%; animation: pulse-ring 2s ease-out infinite;"></div>
            <div style="position: relative; width: 30px; height: 30px; background: #dc2626; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
              <div style="color: white; font-size: 16px; font-weight: bold;">📍</div>
            </div>
            <div style="position: absolute; top: -3px; right: -3px; width: 10px; height: 10px; background: #16a34a; border-radius: 50%; border: 2px solid white; animation: pulse-dot 1.5s ease-in-out infinite;"></div>
          </div>
        `,
        className: 'user-marker-container',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1000 // Asegurar que esté encima de otros marcadores
      }).bindPopup(`
        <div style="padding: 12px; font-family: system-ui, -apple-system, sans-serif; text-align: center;">
          <h3 style="font-size: 16px; font-weight: 600; color: #dc2626; margin: 0 0 8px 0;">📍 Tu ubicación</h3>
          <div style="color: #6b7280; font-size: 12px; margin-bottom: 8px;">
            Lat: ${userLocation.lat.toFixed(6)}<br>
            Lng: ${userLocation.lng.toFixed(6)}
          </div>
          <div style="font-size: 11px; color: #059669; font-weight: 500;">
            🎯 Las distancias se calculan desde aquí
          </div>
        </div>
      `, {
        maxWidth: 200,
      });

      userMarker.addTo(mapInstanceRef.current);
      userMarkerRef.current = userMarker;
      
      console.log('Marcador de usuario creado exitosamente:', {
        coords: [userLocation.lat, userLocation.lng],
        marker: userMarker
      });
    } catch (error) {
      console.error('Error creando marcador de usuario:', error);
    }
  }, [L, userLocation]);

  // Crear marcadores con coordenadas reales
  useEffect(() => {
    if (!L || !mapInstanceRef.current || !sociosGeocodificados.length) return;

    // Limpiar marcadores existentes
    markersRef.current.forEach(marker => {
      try {
        mapInstanceRef.current?.removeLayer(marker);
      } catch (error) {
        console.warn('Error removiendo marcador:', error);
      }
    });
    markersRef.current = [];

    const newMarkers: any[] = [];
    const bounds = L.latLngBounds([]);

    sociosGeocodificados.forEach((socio) => {
      if (!socio.coordenadas) return;

      try {
        // Crear icono de pin personalizado con tema de panadería/pastelería
        const pinColor = socio.permite_pedidos_directos ? '#10b981' : '#3b82f6';
        const shadowColor = socio.permite_pedidos_directos ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)';
        
        const customIcon = L.divIcon({
          html: `
            <div style="position: relative; transform: translateY(-5px);">
              <!-- Sombra del pin -->
              <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 20px; height: 8px; background: ${shadowColor}; border-radius: 50%; filter: blur(2px);"></div>
              
              <!-- Pin principal -->
              <div style="width: 32px; height: 40px; background: ${pinColor}; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.2); position: relative;">
                <!-- Icono de torta/pastel centrado -->
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg); font-size: 16px; line-height: 1;">
                  🎂
                </div>
              </div>
              
              <!-- Indicador de pedidos directos -->
              ${socio.permite_pedidos_directos ? `
                <div style="position: absolute; top: -2px; right: 2px; width: 12px; height: 12px; background: #059669; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 8px; z-index: 10;">
                  📞
                </div>
              ` : ''}
              
              <!-- Efecto de pulso sutil -->
              <div style="position: absolute; top: 6px; left: 6px; width: 20px; height: 20px; border: 2px solid ${pinColor}; border-radius: 50%; opacity: 0.6; animation: ping 2s infinite;"></div>
            </div>
          `,
          className: 'bakery-pin-marker',
          iconSize: [32, 45],
          iconAnchor: [16, 40],
          popupAnchor: [0, -45]
        });

        const marker = L.marker([socio.coordenadas.lat, socio.coordenadas.lng], {
          icon: customIcon
        }).bindPopup(createPopupContent(socio), {
          maxWidth: 320,
        });

        marker.addTo(mapInstanceRef.current);
        newMarkers.push(marker);
        bounds.extend([socio.coordenadas.lat, socio.coordenadas.lng]);
      } catch (error) {
        console.error('Error creando marcador:', error);
      }
    });

    markersRef.current = newMarkers;

    // Incluir ubicación del usuario en los bounds si está disponible
    if (userLocation) {
      bounds.extend([userLocation.lat, userLocation.lng]);
    }

    // Ajustar vista para mostrar todos los marcadores
    if (bounds.isValid()) {
      try {
        mapInstanceRef.current.fitBounds(bounds, { 
          padding: [30, 30],
          maxZoom: 15 
        });
      } catch (error) {
        console.error('Error ajustando bounds:', error);
      }
    }
  }, [L, sociosGeocodificados, userLocation]);

  if (!mapLoaded) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full h-96 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando mapa interactivo...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con botón de ubicación y estado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Puntos de venta disponibles</h2>
          <p className="text-sm text-gray-600 mt-1">
            {sociosGeocodificados.filter(s => s.coordenadas).length} puntos ubicados
            {userLocation && ` • Ordenados por cercanía`}
          </p>
        </div>
        
        {/* Botón para obtener ubicación */}
        {!userLocation && (
          <button
            onClick={() => {
              console.log('Solicitando ubicación...');
              getCurrentLocation();
            }}
            disabled={geoLoading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              geoLoading 
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {geoLoading ? '⏳ Obteniendo ubicación...' : '📍 Mostrar mi ubicación'}
          </button>
        )}
        
        {userLocation && (
          <div className="flex items-center text-sm text-green-600 font-medium">
            <span className="mr-2">✅</span>
            Ubicación detectada
          </div>
        )}
        
        {geoError && (
          <div className="text-sm text-red-600 font-medium">
            ❌ {geoError}
          </div>
        )}
      </div>

      {/* Vista híbrida: Layout adaptativo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sección de tarjetas - Móvil primero */}
        <div className="order-2 lg:order-1 space-y-4">
          
          {/* Puntos de venta más cercanos */}
          {sociosCercanos.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <span className="mr-2">🎯</span>
                Más cercanos a ti
              </h3>
              <div className="space-y-3">
                {sociosCercanos.map((socio) => (
                  <PuntoVentaCard
                    key={socio.user_id}
                    socio={socio}
                    onVerDetalles={(socio) => setSocioSeleccionado(socio)}
                    compact={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Resumen de puntos de venta */}
          {sociosOrdenados.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {sociosOrdenados.length}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Puntos de venta disponibles
                    </p>
                    <p className="text-xs text-gray-600">
                      {sociosOrdenados.filter(s => s.permite_pedidos_directos).length} aceptan pedidos directos
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Cobertura en</p>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {Array.from(new Set(sociosOrdenados.map(s => s.comuna))).map(comuna => (
                      <span key={comuna} className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                        {comuna}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Estado de geocodificación */}
          {geocodingLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-blue-800">Ubicando direcciones reales...</span>
              </div>
            </div>
          )}
        </div>

        {/* Sección del mapa */}
        <div className="order-1 lg:order-2">
          <div className="sticky top-4">
            <div className="relative">
              {/* Mapa */}
              <div 
                ref={mapRef} 
                className="w-full h-80 lg:h-96 rounded-lg border border-gray-200"
              />
              
              {/* Información del mapa - Simplificada */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm">
                <div className="text-xs text-gray-600">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                      <span>Puntos</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-600 rounded-full mr-1"></div>
                      <span>Tu ubicación</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Estadísticas del mapa */}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm">
                <div className="text-xs text-gray-700 font-medium">
                  {sociosGeocodificados.filter(s => s.coordenadas).length} puntos en el mapa
                </div>
                {userLocation && (
                  <div className="text-xs text-green-600 mt-1">
                    📍 Con tu ubicación
                  </div>
                )}
              </div>
              
              {geocodingLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Cargando ubicaciones...</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Información sobre datos gratuitos - Simplificada */}
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-xs text-green-800">
                🗺️ Ubicaciones reales usando OpenStreetMap • 📍 Navegación gratuita • 🆓 Sin costo
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalles del socio */}
      {socioSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {socioSeleccionado.nombre_comercial}
              </h3>
              <button
                onClick={() => setSocioSeleccionado(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600 mb-1">📍 Dirección</div>
                <div className="text-sm font-medium">{socioSeleccionado.direccion}, {socioSeleccionado.comuna}</div>
              </div>
              
              {socioSeleccionado.telefono_negocio && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">📞 Teléfono</div>
                  <a 
                    href={`tel:${socioSeleccionado.telefono_negocio}`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    {socioSeleccionado.telefono_negocio}
                  </a>
                </div>
              )}
              
              {socioSeleccionado.horario_atencion && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">🕒 Horario</div>
                  <div className="text-sm font-medium">{socioSeleccionado.horario_atencion}</div>
                </div>
              )}
              
              {socioSeleccionado.descripcion_negocio && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">ℹ️ Descripción</div>
                  <div className="text-sm">{socioSeleccionado.descripcion_negocio}</div>
                </div>
              )}
              
              {socioSeleccionado.permite_pedidos_directos && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-sm text-green-800 font-medium">
                    ✅ Este punto de venta acepta pedidos directos
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${socioSeleccionado.direccion}, ${socioSeleccionado.comuna}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <span className="mr-2">🧭</span>
                Cómo llegar (Google Maps)
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Estilos CSS personalizados */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.3;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        @keyframes pulse-dot {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.2);
          }
        }

        @keyframes ping {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          75% {
            opacity: 0.3;
            transform: scale(1.5);
          }
          100% {
            opacity: 0;
            transform: scale(2);
          }
        }

        .user-marker-container {
          background: transparent !important;
          border: none !important;
        }

        .user-marker {
          background: transparent !important;
          border: none !important;
        }

        .bakery-pin-marker {
          background: transparent !important;
          border: none !important;
          transition: all 0.3s ease;
        }

        .bakery-pin-marker:hover {
          transform: scale(1.1) translateY(-2px);
          filter: drop-shadow(0 8px 16px rgba(0,0,0,0.3));
        }

        .leaflet-container {
          font-family: inherit;
        }

        /* Asegurar que el marcador del usuario esté siempre encima */
        .leaflet-marker-pane .user-marker-container {
          z-index: 1000 !important;
        }

        /* Estilo para los popups personalizados */
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15) !important;
          padding: 0 !important;
        }

        .leaflet-popup-content {
          margin: 0 !important;
          border-radius: 12px !important;
        }

        .leaflet-popup-tip {
          background: white !important;
        }
      `}</style>
    </div>
  );
};

export default MapaDistribuidoresIndividual;