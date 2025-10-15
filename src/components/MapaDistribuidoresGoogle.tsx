"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import { SocioDistribuidor } from '@/hooks/useSociosDistribuidores';
import { SocioDistribuidorConDistancia } from '@/hooks/useSociosCercanos';
import { useGeolocationFree } from '@/hooks/useGeolocationFree';
import { useRankingDistancia } from '@/hooks/useRankingDistancia';
import PuntoVentaCard from './PuntoVentaCard';
import CallToActionSocios from './CallToActionSocios';
import { 
  FaMapMarkerAlt, 
  FaBullseye, 
  FaTimesCircle, 
  FaDollarSign, 
  FaTruck, 
  FaPhone, 
  FaCheckCircle, 
  FaRocket,
  FaMap,
  FaHandsHelping,
  FaMobile,
  FaBullhorn,
  FaHeadset,
  FaList,
  FaClock
} from 'react-icons/fa';
import { MdGpsFixed } from 'react-icons/md';
import { GiCakeSlice } from 'react-icons/gi';

interface MapaDistribuidoresGoogleProps {
  socios: SocioDistribuidor[];
  className?: string;
}

// Tipos para Google Maps
type GoogleMapsType = any;
type WindowWithGoogleMaps = typeof window & {
  google?: GoogleMapsType;
  initGoogleMaps?: () => void;
};

const MapaDistribuidoresGoogle: React.FC<MapaDistribuidoresGoogleProps> = ({ 
  socios, 
  className = '' 
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [googleMaps, setGoogleMaps] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  // Estado para la nueva vista
  const [socioSeleccionado, setSocioSeleccionado] = useState<SocioDistribuidorConDistancia | null>(null);
  
  // Estados para el modal "Ver todos"
  const [showAllModal, setShowAllModal] = useState(false);
  const [displayedSocios, setDisplayedSocios] = useState<SocioDistribuidorConDistancia[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const SOCIOS_PER_PAGE = 5;

  // Hook para obtener ubicación del usuario
  const { location: userLocation, getCurrentLocation, permissionState, calculateDistance, loading: geoLoading, error: geoError } = useGeolocationFree();

  // Obtener ubicación automáticamente si ya se tienen permisos
  useEffect(() => {
    if (permissionState === 'granted' && !userLocation && !geoLoading) {
      getCurrentLocation();
    }
  }, [permissionState, userLocation, geoLoading, getCurrentLocation]);

  // Coordenadas de referencia por comuna (backup)
  const COMUNAS_COORDS = {
    'San Bernardo': { lat: -33.606246, lng: -70.700462 },
    'La Pintana': { lat: -33.579463, lng: -70.648956 },
    'El Bosque': { lat: -33.559729, lng: -70.672550 },
    'La Cisterna': { lat: -33.528348, lng: -70.668608 }
  };

  // Estado para coordenadas geocodificadas
  const [sociosGeocodificados, setSociosGeocodificados] = useState<(SocioDistribuidor & { coordenadas?: { lat: number; lng: number } })[]>([]);
  const [geocodingLoading, setGeocodingLoading] = useState(false);

  // Hook para ranking por distancia
  const { sociosOrdenados, sociosCercanos } = useRankingDistancia(sociosGeocodificados, userLocation, 2);

  // Cargar Google Maps API dinámicamente
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadGoogleMaps = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey || apiKey === 'TU_API_KEY_AQUI' || !apiKey.startsWith('AIza')) {
          setMapLoaded(true);
          return;
        }

        // Si ya está cargado
        if ((window as any).google) {

          setGoogleMaps((window as any).google);
          setMapLoaded(true);
          return;
        }

        // Verificar si Google Maps ya está cargado
        if ((window as any).google?.maps) {
          setGoogleMaps((window as any).google);
          setMapLoaded(true);
          return;
        }

        // Crear callback global
        (window as any).initGoogleMaps = () => {
          setGoogleMaps((window as any).google);
          setMapLoaded(true);
        };

        // Verificar si el script ya existe
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          return;
        }

        // Cargar script de Google Maps
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMaps&libraries=places,geometry`;
        script.async = true;
        script.defer = true;
        script.id = 'google-maps-script';
        
        script.onerror = (error) => {
          setMapLoaded(true); // Continuar sin Google Maps
        };

        document.head.appendChild(script);
      } catch (error) {
        setMapLoaded(true); // Continuar sin Google Maps
      }
    };

    loadGoogleMaps();

    return () => {
      // Limpiar callback
      if ((window as any).initGoogleMaps) {
        delete (window as any).initGoogleMaps;
      }
    };
  }, []);

  // Inicializar mapa de Google
  useEffect(() => {
    if (!googleMaps || !mapRef.current || mapInstanceRef.current) return;

    try {
      // Estilo personalizado que combina con los colores de la app y muestra información útil
      const customMapStyles = [
        // Mantener POIs útiles pero con estilo personalizado
        {
          featureType: 'poi.business',
          stylers: [{ visibility: 'simplified' }] // Mostrar pero simplificado
        },
        {
          featureType: 'poi.attraction',
          elementType: 'labels',
          stylers: [
            { visibility: 'on' },
            { color: '#9a3412' }
          ]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [
            { visibility: 'on' },
            { color: '#ecfdf5' }, // Verde muy claro
            { lightness: 20 }
          ]
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [
            { color: '#059669' } // Verde para parques
          ]
        },
        // Mostrar estaciones de metro/transporte público
        {
          featureType: 'transit.station',
          stylers: [
            { visibility: 'on' },
            { color: '#fed7aa' }
          ]
        },
        {
          featureType: 'transit.station',
          elementType: 'labels.text.fill',
          stylers: [
            { color: '#9a3412' }
          ]
        },
        // Ocultar solo POIs específicos que no son útiles
        {
          featureType: 'poi.medical',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'poi.government',
          stylers: [{ visibility: 'off' }]
        },
        // Personalizar colores de agua
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [
            { color: '#fef3c7' }, // Amarillo muy claro
            { lightness: 17 }
          ]
        },
        // Personalizar paisaje
        {
          featureType: 'landscape',
          elementType: 'geometry',
          stylers: [
            { color: '#fef7ed' }, // Beige muy claro
            { lightness: 20 }
          ]
        },
        // Personalizar carreteras principales
        {
          featureType: 'road.highway',
          elementType: 'geometry.fill',
          stylers: [
            { color: '#fed7aa' }, // Naranja claro
            { lightness: 17 }
          ]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [
            { color: '#fb923c' }, // Naranja medio
            { lightness: 29 },
            { weight: 0.2 }
          ]
        },
        // Personalizar carreteras locales
        {
          featureType: 'road.arterial',
          elementType: 'geometry',
          stylers: [
            { color: '#fde68a' }, // Amarillo claro
            { lightness: 18 }
          ]
        },
        {
          featureType: 'road.local',
          elementType: 'geometry',
          stylers: [
            { color: '#fef3c7' }, // Amarillo muy claro
            { lightness: 16 }
          ]
        },
        // Personalizar y hacer más visibles los nombres de calles
        {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [
            { color: '#9a3412' }, // Naranja oscuro
            { weight: 'bold' }
          ]
        },
        {
          featureType: 'road.highway',
          elementType: 'labels.text.stroke',
          stylers: [
            { color: '#ffffff' },
            { weight: 3 }
          ]
        },
        {
          featureType: 'road.arterial',
          elementType: 'labels.text.fill',
          stylers: [
            { color: '#92400e' }, // Amarillo oscuro
            { weight: 'bold' }
          ]
        },
        {
          featureType: 'road.arterial',
          elementType: 'labels.text.stroke',
          stylers: [
            { color: '#ffffff' },
            { weight: 2 }
          ]
        },
        {
          featureType: 'road.local',
          elementType: 'labels.text.fill',
          stylers: [
            { color: '#78350f' }, // Marrón para calles locales
            { visibility: 'on' }
          ]
        },
        {
          featureType: 'road.local',
          elementType: 'labels.text.stroke',
          stylers: [
            { color: '#ffffff' },
            { weight: 1 }
          ]
        },
        // Personalizar áreas administrativas
        {
          featureType: 'administrative',
          elementType: 'geometry.fill',
          stylers: [
            { color: '#fef3c7' }, // Amarillo muy claro
            { lightness: 20 }
          ]
        },
        {
          featureType: 'administrative',
          elementType: 'geometry.stroke',
          stylers: [
            { color: '#fb923c' }, // Naranja medio
            { lightness: 17 },
            { weight: 1.2 }
          ]
        },
        // Hacer más prominentes los nombres de barrios y localidades
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [
            { color: '#9a3412' }, // Naranja oscuro
            { weight: 'bold' }
          ]
        },
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.stroke',
          stylers: [
            { color: '#ffffff' },
            { weight: 3 }
          ]
        },
        {
          featureType: 'administrative.neighborhood',
          elementType: 'labels.text.fill',
          stylers: [
            { color: '#92400e' }, // Amarillo oscuro para barrios
            { visibility: 'on' }
          ]
        },
        {
          featureType: 'administrative.neighborhood',
          elementType: 'labels.text.stroke',
          stylers: [
            { color: '#ffffff' },
            { weight: 2 }
          ]
        },
        // Personalizar parques y áreas verdes
        {
          featureType: 'landscape.natural',
          elementType: 'geometry',
          stylers: [
            { color: '#fef7ed' } // Beige muy claro
          ]
        },
        // Mejorar la visualización del transporte público
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [
            { color: '#fed7aa' }, // Naranja claro
            { lightness: 19 }
          ]
        },
        {
          featureType: 'transit.line',
          elementType: 'geometry',
          stylers: [
            { color: '#fb923c' },
            { weight: 2 }
          ]
        },
        {
          featureType: 'transit.line',
          elementType: 'labels.text.fill',
          stylers: [
            { color: '#9a3412' }
          ]
        },
        // Mostrar escuelas y universidades como puntos de referencia
        {
          featureType: 'poi.school',
          elementType: 'geometry',
          stylers: [
            { color: '#ddd6fe' }, // Púrpura claro
            { visibility: 'on' }
          ]
        },
        {
          featureType: 'poi.school',
          elementType: 'labels.text.fill',
          stylers: [
            { color: '#7c3aed' }, // Púrpura para escuelas
            { visibility: 'on' }
          ]
        },
        // Hacer más visibles los centros comerciales y supermercados
        {
          featureType: 'poi.establishment',
          elementType: 'labels.text.fill',
          stylers: [
            { color: '#78350f' },
            { visibility: 'simplified' }
          ]
        },
        // Mostrar lugares religiosos como puntos de referencia
        {
          featureType: 'poi.place_of_worship',
          stylers: [
            { visibility: 'on' },
            { color: '#fef3c7' }
          ]
        },
        {
          featureType: 'poi.place_of_worship',
          elementType: 'labels.text.fill',
          stylers: [
            { color: '#92400e' }
          ]
        }
      ];

      const mapOptions = {
        center: { lat: -33.6, lng: -70.65 }, // San Bernardo como centro por defecto
        zoom: 13, // Aumentamos el nivel de zoom para mostrar más detalles
        mapTypeId: googleMaps.maps.MapTypeId.ROADMAP,
        styles: customMapStyles,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'greedy',
        // Desactivar todos los tooltips del mapa
        clickableIcons: false, // Desactiva tooltips de POIs
        disableDefaultUI: false, // Mantener controles básicos
        // Personalizar controles
        zoomControlOptions: {
          position: googleMaps.maps.ControlPosition.RIGHT_CENTER
        },
        fullscreenControlOptions: {
          position: googleMaps.maps.ControlPosition.RIGHT_TOP
        }
      };

      const map = new googleMaps.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      // Crear geocoder
      geocoderRef.current = new googleMaps.maps.Geocoder();


    } catch (error) {

    }
  }, [googleMaps]);

  // Función para geocodificar dirección usando Google Geocoding API
  const geocodificarDireccion = useCallback(async (direccion: string, comuna: string): Promise<{ lat: number; lng: number } | null> => {
    if (!geocoderRef.current) return null;

    try {
      const direccionCompleta = `${direccion}, ${comuna}, Chile`;
      
      return new Promise((resolve) => {
        geocoderRef.current.geocode(
          { 
            address: direccionCompleta,
            region: 'CL',
            componentRestrictions: {
              country: 'CL'
            }
          },
          (results: any[], status: any) => {
            if (status === 'OK' && results.length > 0) {
              const location = results[0].geometry.location;
              resolve({
                lat: location.lat(),
                lng: location.lng()
              });
            } else {

              resolve(null);
            }
          }
        );
      });
    } catch (error) {

      return null;
    }
  }, []);

  // Geocodificar todos los socios cuando cambian
  useEffect(() => {
    if (!socios.length) {
      return;
    }

    const geocodificarSocios = async () => {
      setGeocodingLoading(true);

      const sociosConCoordenadas: (SocioDistribuidor & { coordenadas?: { lat: number; lng: number } })[] = [];

      for (const socio of socios) {
        try {
          let coordenadas = null;

          // Si tenemos Google Maps, usar su geocoder
          if (geocoderRef.current) {
            coordenadas = await geocodificarDireccion(socio.direccion, socio.comuna);
            
            // Si falla, intentar con solo el nombre comercial
            if (!coordenadas) {
              coordenadas = await geocodificarDireccion(socio.nombre_comercial, socio.comuna);
            }
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

          // Pausa entre requests para no sobrecargar la API
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {

          sociosConCoordenadas.push({
            ...socio
          });
        }
      }



      setSociosGeocodificados(sociosConCoordenadas);
      setGeocodingLoading(false);
    };

    geocodificarSocios();
  }, [socios, geocodificarDireccion]);

  // Crear marcador de ubicación del usuario
  useEffect(() => {
    if (!googleMaps || !mapInstanceRef.current || !userLocation) return;

    // Remover marcador anterior del usuario si existe
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
      userMarkerRef.current = null;
    }

    try {
      // SVG con React Icons para el marcador del usuario
      const userSvgIcon = `
        <svg width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="userShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
            </filter>
          </defs>
          
          <!-- Círculo de fondo -->
          <circle cx="12" cy="12" r="11" 
                  fill="#dc2626" 
                  stroke="#ffffff" 
                  stroke-width="2"
                  filter="url(#userShadow)"/>
          
          <!-- Ícono GPS Fixed -->
          <path d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M3.05,13H1V11H3.05C3.5,6.83 6.83,3.5 11,3.05V1H13V3.05C17.17,3.5 20.5,6.83 20.95,11H23V13H20.95C20.5,17.17 17.17,20.5 13,20.95V23H11V20.95C6.83,20.5 3.5,17.17 3.05,13M12,5A7,7 0 0,0 5,12A7,7 0 0,0 12,19A7,7 0 0,0 19,12A7,7 0 0,0 12,5Z" 
                fill="#ffffff"/>
        </svg>
      `;
      
      const encodedUserIcon = encodeURIComponent(userSvgIcon);

      // Crear marcador personalizado para el usuario
      const userMarker = new googleMaps.maps.Marker({
        position: { lat: userLocation.lat, lng: userLocation.lng },
        map: mapInstanceRef.current,
        title: 'Tu ubicación',
        icon: {
          url: 'data:image/svg+xml;charset=utf-8,' + encodedUserIcon,
          scaledSize: new googleMaps.maps.Size(28, 28),
          anchor: new googleMaps.maps.Point(14, 14),
          optimized: false
        },
        zIndex: 1000,
        animation: googleMaps.maps.Animation.DROP
      });

      // Info window simplificado para el usuario
      const userInfoWindow = new googleMaps.maps.InfoWindow({
        content: `
          <div style="padding: 8px; font-family: system-ui, -apple-system, sans-serif; text-align: center;">
            <h3 style="font-size: 14px; font-weight: 600; color: #dc2626; margin: 0 0 4px 0;">Tu ubicación</h3>
            <div style="font-size: 11px; color: #059669; font-weight: 500;">
              Las distancias se calculan desde aquí
            </div>
          </div>
        `
      });

      userMarker.addListener('click', () => {
        userInfoWindow.open(mapInstanceRef.current, userMarker);
      });

      userMarkerRef.current = userMarker;
      

    } catch (error) {

    }
  }, [googleMaps, userLocation]);



  // Crear marcadores de socios con Google Maps
  useEffect(() => {
    if (!googleMaps || !mapInstanceRef.current || !sociosGeocodificados.length) {
      return;
    }

    // Limpiar marcadores existentes
    markersRef.current.forEach(marker => {
      try {
        marker.setMap(null);
      } catch (error) {

      }
    });
    markersRef.current = [];

    const bounds = new googleMaps.maps.LatLngBounds();
    const newMarkers: any[] = [];

    sociosGeocodificados.forEach((socio, index) => {
      if (!socio.coordenadas) {
        return;
      }

      try {
        const position = { lat: socio.coordenadas.lat, lng: socio.coordenadas.lng };
        
        // Crear marcador personalizado con colores que combinen con la app
        const isDirectOrder = socio.permite_pedidos_directos;
        const markerColor = isDirectOrder ? '#ea580c' : '#f97316'; // Naranjas de la app
        
        // SVG directo del ícono FaMapMarkerAlt con el path correcto
        const svgIcon = `
          <svg width="32" height="32" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
              </filter>
            </defs>
            <path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" 
                  fill="${markerColor}" 
                  filter="url(#shadow)"/>
          </svg>
        `;
        
        // Convertir SVG a data URL
        const encodedIcon = encodeURIComponent(svgIcon);
        
        const marker = new googleMaps.maps.Marker({
          position: position,
          map: mapInstanceRef.current,
          title: socio.nombre_comercial,
          icon: {
            url: 'data:image/svg+xml;charset=utf-8,' + encodedIcon,
            scaledSize: new googleMaps.maps.Size(24, 30),
            anchor: new googleMaps.maps.Point(12, 30), // Anclar en la base del pin
            optimized: false // Para mejor renderizado de SVG personalizado
          },
          animation: googleMaps.maps.Animation.DROP // Animación de caída
        });

        // Al hacer clic en el marcador, abrir el modal con los detalles del socio
        marker.addListener('click', () => {

          setSocioSeleccionado(socio);
        });

        newMarkers.push(marker);
        bounds.extend(position);
      } catch (error) {

      }
    });

    markersRef.current = newMarkers;

    // Incluir ubicación del usuario en los bounds si está disponible
    if (userLocation) {
      bounds.extend({ lat: userLocation.lat, lng: userLocation.lng });
    }

    // Ajustar vista para mostrar todos los marcadores
    if (!bounds.isEmpty()) {
      try {
        mapInstanceRef.current.fitBounds(bounds);
        
        // Limitar el zoom máximo
        const listener = googleMaps.maps.event.addListener(mapInstanceRef.current, 'bounds_changed', () => {
          if (mapInstanceRef.current.getZoom() > 15) {
            mapInstanceRef.current.setZoom(15);
          }
          googleMaps.maps.event.removeListener(listener);
        });
      } catch (error) {

      }
    }
  }, [googleMaps, sociosGeocodificados, userLocation, calculateDistance]);

  // Funciones para el modal "Ver todos"
  const openAllModal = () => {
    setCurrentPage(0);
    setDisplayedSocios(sociosOrdenados.slice(0, SOCIOS_PER_PAGE));
    setShowAllModal(true);
  };

  const loadMoreSocios = () => {
    const nextPage = currentPage + 1;
    const startIndex = nextPage * SOCIOS_PER_PAGE;
    const endIndex = startIndex + SOCIOS_PER_PAGE;
    const newSocios = sociosOrdenados.slice(startIndex, endIndex);
    
    setDisplayedSocios(prev => [...prev, ...newSocios]);
    setCurrentPage(nextPage);
  };

  const hasMoreSocios = (currentPage + 1) * SOCIOS_PER_PAGE < sociosOrdenados.length;

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
      {/* Banner llamativo para nuevos socios */}
      <CallToActionSocios variant="banner" />

      {/* Header con botón de ubicación y estado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Puntos de venta disponibles</h2>
          <p className="text-sm text-gray-600 mt-1">
            {sociosGeocodificados.filter(s => s.coordenadas).length} puntos de venta encontrados
            {googleMaps && <span className="ml-2 text-green-600 font-medium"></span>}
          </p>
          
        </div>
        
        {/* Controles */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            {/* Botón ubicación */}
            <button
              onClick={() => {
                console.log('🎯 Obteniendo ubicación del usuario...');
                getCurrentLocation();
              }}
              disabled={geoLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                geoLoading 
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : userLocation 
                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-700 border border-gray-300'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {geoLoading ? '⏳ Obteniendo ubicación...' : 
               userLocation ? 'Actualizar ubicación' : 'Mostrar mi ubicación'}
            </button>
          </div>
        </div>
        
        {geoError && (
          <div className="text-sm text-red-600 font-medium flex items-center">
            <FaTimesCircle className="mr-1" />
            {geoError}
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
                <FaBullseye className="mr-2 text-orange-500" />
                Más cercanos a ti
              </h3>
              <div className="space-y-3">
                {sociosCercanos.map((socio, index) => (
                  <PuntoVentaCard
                    key={`mapa-socio-${socio.user_id}-${index}`}
                    socio={socio}
                    onVerDetalles={(socio) => setSocioSeleccionado(socio)}
                    compact={true}
                  />
                ))}
              </div>
              
              {/* Botón para ver todos */}
              {sociosOrdenados.length > sociosCercanos.length && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <button
                    onClick={openAllModal}
                    className="w-full flex items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors text-sm"
                  >
                    <FaList className="mr-2" />
                    Ver todos los puntos de venta ({sociosOrdenados.length})
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Estado de geocodificación y zona de cobertura */}
          {geocodingLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-blue-800">
                  {googleMaps ? 'Geocodificando con Google Maps...' : 'Ubicando direcciones...'}
                </span>
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
              

              
              {geocodingLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">
                      {googleMaps ? 'Geocodificando con Google Maps...' : 'Cargando ubicaciones...'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sección de beneficios para nuevos socios */}
      <div id="beneficios-socios" className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <FaHandsHelping className="text-orange-500 text-6xl" />
            Beneficios exclusivos para Socios
          </h3>
          <p className="text-gray-600">
            Al unirte a nuestra red, obtienes acceso a ventajas únicas para hacer crecer tu negocio
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-green-100 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                <FaDollarSign className="text-white-500 text-2xl" />
              </div>
              <h4 className="font-semibold text-gray-900">Precios mayoristas</h4>
            </div>
            <p className="text-sm text-gray-600">
              Accede a los mejores precios del mercado y aumenta tu margen de ganancia.
            </p>
          </div>
          
          <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                <FaMapMarkerAlt className="text-white-500 text-2xl" />
              </div>
              <h4 className="font-semibold text-gray-900">Aparece en el mapa</h4>
            </div>
            <p className="text-sm text-gray-600">
              Los clientes te encontrarán fácilmente en nuestro buscador de puntos de venta
            </p>
          </div>
          
          <div className="bg-purple-100 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                <FaMobile className="text-white text-2xl" />
              </div>
              <h4 className="font-semibold text-gray-900">Plataforma digital</h4>
            </div>
            <p className="text-sm text-gray-600">
              Haz pedidos 24/7 desde tu celular o computadora con entrega garantizada
            </p>
          </div>
          
          <div className="bg-orange-100 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                <FaTruck className="text-white text-2xl" />
              </div>
              <h4 className="font-semibold text-gray-900">Entregas programadas</h4>
            </div>
            <p className="text-sm text-gray-600">
              Recibe tus productos frescos todas las semanas.
            </p>
          </div>
        </div>
        
        <div className="text-center mt-6">
          <a
            href="/registro-punto-venta"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
          >
            ¡Quiero ser socio distribuidor!
          </a>
          <p className="text-xs text-gray-500 mt-2">
            Proceso de aprobación en 24-48 horas • Sin costos de inscripción
          </p>
        </div>
      </div>

      {/* Modal "Ver todos" con paginación */}
      {showAllModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  Todos los puntos de venta
                </h2>
                <button
                  onClick={() => setShowAllModal(false)}
                  className="w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors text-sm"
                >
                  ✕
                </button>
              </div>
              <p className="text-white/90 text-sm mt-1">
                Ordenados por distancia • {sociosOrdenados.length} puntos disponibles
              </p>
            </div>

            {/* Lista de socios con scroll */}
            <div className="max-h-[60vh] overflow-y-auto">
              <div className="p-4 space-y-3">
                {displayedSocios.map((socio, index) => (
                  <div
                    key={`modal-socio-${socio.user_id}-${index}`}
                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSocioSeleccionado(socio);
                      setShowAllModal(false);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {socio.nombre_comercial}
                        </h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-gray-400 text-xs" />
                            <span>{socio.direccion}, {socio.comuna}</span>
                          </div>
                          {socio.telefono_negocio && (
                            <div className="flex items-center gap-2">
                              <FaPhone className="text-gray-400 text-xs" />
                              <span>{socio.telefono_negocio}</span>
                            </div>
                          )}
                          {userLocation && socio.coordenadas && (
                            <div className="flex items-center gap-2">
                              <FaBullseye className="text-gray-400 text-xs" />
                              <span>{calculateDistance(
                                userLocation.lat,
                                userLocation.lng,
                                socio.coordenadas.lat,
                                socio.coordenadas.lng
                              )} km</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-3 flex flex-col items-end gap-1">
                        <span className="text-xs text-gray-400">
                          Toca para ver detalles
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer con botón cargar más */}
            {hasMoreSocios && (
              <div className="border-t border-gray-200 p-4">
                <button
                  onClick={loadMoreSocios}
                  className="w-full flex items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors text-sm"
                >
                  <FaList className="mr-2" />
                  Cargar 5 más ({sociosOrdenados.length - displayedSocios.length} restantes)
                </button>
              </div>
            )}

            {/* Información adicional */}
            {!hasMoreSocios && displayedSocios.length === sociosOrdenados.length && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <p className="text-center text-sm text-gray-600">
                  ✅ Mostrando todos los puntos de venta disponibles
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal simplificado para usuarios finales */}
      {socioSeleccionado && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            {/* Header simple */}
            <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-t-xl">
              <button
                onClick={() => setSocioSeleccionado(null)}
                className="absolute top-3 right-3 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors text-sm"
              >
                ✕
              </button>
              
              <div className="text-white pr-8">
                <h2 className="text-lg font-bold mb-1">{socioSeleccionado.nombre_comercial}</h2>
                {userLocation && socioSeleccionado?.coordenadas && (
                  <p className="text-white/90 text-sm flex items-center">
                    <FaBullseye className="mr-1" />
                    A {calculateDistance(
                      userLocation.lat, 
                      userLocation.lng, 
                      socioSeleccionado.coordenadas.lat, 
                      socioSeleccionado.coordenadas.lng
                    )} km de distancia
                  </p>
                )}
              </div>
            </div>

            {/* Contenido simplificado */}
            <div className="p-4 space-y-3">
              {/* Dirección */}
              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-orange-500" />
                <div>
                  <p className="font-medium text-gray-900">{socioSeleccionado.direccion}</p>
                  <p className="text-sm text-gray-600">{socioSeleccionado.comuna}</p>
                </div>
              </div>

              {/* Teléfono */}
              {socioSeleccionado.telefono_negocio && (
                <div className="flex items-center gap-3">
                  <FaPhone className="text-green-500" />
                  <a 
                    href={`tel:${socioSeleccionado.telefono_negocio}`}
                    className="font-medium text-green-600 hover:text-green-700"
                  >
                    {socioSeleccionado.telefono_negocio}
                  </a>
                </div>
              )}

              {/* Horarios */}
              {socioSeleccionado.horario_atencion && (
                <div className="flex items-center gap-3">
                  <FaClock className="text-blue-500" />
                  <p className="text-gray-700">{socioSeleccionado.horario_atencion}</p>
                </div>
              )}

              {/* Información del negocio */}
              <div className="bg-orange-50 rounded-lg p-3 mt-3">
                <div className="flex items-center gap-2">
                  <GiCakeSlice className="text-orange-600" />
                  <div>
                    <p className="text-sm text-orange-800">
                      <span className="font-semibold">Tortas artesanales</span><br/>
                      Productos de Delicias Florencia disponibles
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 pt-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${socioSeleccionado.direccion}, ${socioSeleccionado.comuna}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Cómo llegar
                </a>
                
                {socioSeleccionado.telefono_negocio && (
                  <a
                    href={`tel:${socioSeleccionado.telefono_negocio}`}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Llamar
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    
    </div>
  );
};

export default MapaDistribuidoresGoogle;