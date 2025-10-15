"use client";

import { useEffect, useRef, useState } from 'react';
import { 
  TODAS_LAS_COMUNAS, 
  COLORES_COBERTURA, 
  COLORES_POR_COSTO,
  RESUMEN_COBERTURA,
  CoberturaComuna,
  agruparComunasPorCosto,
  obtenerCostosUnicos
} from '@/data/cobertura-mayorista';
import { FaMapMarkerAlt, FaTruck, FaGift, FaDollarSign, FaClock, FaCalendarAlt, FaInfoCircle, FaLocationArrow, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface MapaCoberturaGoogleMayoristaProps {
  className?: string;
}

// Tipos para Google Maps
type GoogleMapsType = any;

const MapaCoberturaGoogleMayorista: React.FC<MapaCoberturaGoogleMayoristaProps> = ({ 
  className = '' 
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [googleMaps, setGoogleMaps] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  
  // Estados para geolocalización y verificación de cobertura
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [coverageInfo, setCoverageInfo] = useState<{inCoverage: boolean, cost?: number} | null>(null);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  // Estados para dirección manual
  const [manualAddress, setManualAddress] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  // Cargar Google Maps API dinámicamente
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadGoogleMaps = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey || apiKey === 'TU_API_KEY_AQUI' || !apiKey.startsWith('AIza')) {
          console.warn('⚠️ Google Maps API Key no configurada, usando fallback');
          setMapLoaded(true);
          return;
        }

        // Si ya está cargado
        if ((window as any).google?.maps) {
          setGoogleMaps((window as any).google);
          setMapLoaded(true);
          return;
        }

        // Crear callback global
        (window as any).initGoogleMapsMayorista = () => {
          setGoogleMaps((window as any).google);
          setMapLoaded(true);
        };

        // Verificar si el script ya existe
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          // Si existe pero no está inicializado, esperar
          const checkLoaded = setInterval(() => {
            if ((window as any).google?.maps) {
              setGoogleMaps((window as any).google);
              setMapLoaded(true);
              clearInterval(checkLoaded);
            }
          }, 100);
          return;
        }

        // Cargar script de Google Maps
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMapsMayorista&libraries=places,geometry`;
        script.async = true;
        script.defer = true;
        script.id = 'google-maps-mayorista-script';
        
        script.onerror = () => {
          console.warn('❌ Error cargando Google Maps, usando fallback');
          setMapLoaded(true);
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error('Error inicializando Google Maps:', error);
        setMapLoaded(true);
      }
    };

    loadGoogleMaps();

    return () => {
      if ((window as any).initGoogleMapsMayorista) {
        delete (window as any).initGoogleMapsMayorista;
      }
    };
  }, []);

  // Inicializar mapa de Google
  useEffect(() => {
    if (!googleMaps || !mapRef.current || mapInstanceRef.current) return;

    try {
      // Estilo del mapa optimizado para mostrar zonas de cobertura
      const mapStyles = [
        // Reducir visibilidad de POIs innecesarios
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'poi.business',
          stylers: [{ visibility: 'off' }]
        },
        // Destacar límites administrativos (comunas)
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [
            { color: '#ea580c' },
            { weight: 'bold' }
          ]
        },
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.stroke',
          stylers: [
            { color: '#ffffff' },
            { weight: 2 }
          ]
        },
        // Hacer más visibles los nombres de barrios
        {
          featureType: 'administrative.neighborhood',
          elementType: 'labels.text.fill',
          stylers: [
            { color: '#92400e' },
            { visibility: 'on' }
          ]
        },
        // Personalizar colores de carreteras
        {
          featureType: 'road.highway',
          elementType: 'geometry.fill',
          stylers: [{ color: '#fed7aa' }]
        },
        {
          featureType: 'road.arterial',
          elementType: 'geometry',
          stylers: [{ color: '#fef3c7' }]
        },
        // Agua y paisaje en colores neutros
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#dbeafe' }]
        },
        {
          featureType: 'landscape',
          elementType: 'geometry',
          stylers: [{ color: '#fefce8' }]
        }
      ];

      const mapOptions = {
        center: { lat: -33.55, lng: -70.67 }, // Centro entre todas las comunas
        zoom: 11,
        mapTypeId: googleMaps.maps.MapTypeId.ROADMAP,
        styles: mapStyles,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'greedy',
        clickableIcons: false
      };

      const map = new googleMaps.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      console.log('🗺️ Mapa de cobertura mayorista inicializado');
    } catch (error) {
      console.error('❌ Error inicializando mapa:', error);
    }
  }, [googleMaps]);

  // Cargar y mostrar polígonos GeoJSON diferenciados por costo
  useEffect(() => {
    if (!googleMaps || !mapInstanceRef.current) return;

    const loadGeoJSON = async () => {
      try {
        const response = await fetch('/cobertura-costos.geojson');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setGeoJsonData(data); // Guardar datos para verificación de cobertura
        const bounds = new googleMaps.maps.LatLngBounds();
        
        // Procesar features del GeoJSON
        data.features.forEach((feature: any) => {
          if (feature.geometry.type === 'Polygon') {
            // Convertir coordenadas GeoJSON a formato Google Maps
            const paths = feature.geometry.coordinates.map((ring: number[][]) => 
              ring.map(([lng, lat]: number[]) => ({ lat, lng }))
            );

            // Obtener costo del feature
            const costo = feature.properties.cost || 1000;
            
            // Obtener colores según el costo
            const colores = COLORES_POR_COSTO[costo as keyof typeof COLORES_POR_COSTO] || COLORES_POR_COSTO[1000];

            // Crear el polígono con estilos según costo e interactividad
            const polygon = new googleMaps.maps.Polygon({
              paths: paths,
              strokeColor: colores.stroke,
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: colores.fill,
              fillOpacity: colores.fillOpacity,
              map: mapInstanceRef.current,
              clickable: true // Habilitar clicks
            });

            // Agregar efectos de hover y click
            polygon.addListener('mouseover', () => {
              polygon.setOptions({
                fillOpacity: 0.4, // Aumentar opacidad en hover
                strokeWeight: 3,   // Aumentar grosor del borde
                strokeOpacity: 1.0
              });
            });

            polygon.addListener('mouseout', () => {
              polygon.setOptions({
                fillOpacity: colores.fillOpacity, // Restaurar opacidad original
                strokeWeight: 2,   // Restaurar grosor original
                strokeOpacity: 0.8
              });
            });

            polygon.addListener('click', (event: any) => {
              // Efecto de "pulso" al hacer click
              polygon.setOptions({
                fillOpacity: 0.6,
                strokeWeight: 4
              });
              
              // Restaurar después de 200ms
              setTimeout(() => {
                polygon.setOptions({
                  fillOpacity: colores.fillOpacity,
                  strokeWeight: 2
                });
              }, 200);

              // Mostrar información del costo (opcional)
              const priceText = `Despacho: $${costo.toLocaleString('es-CL')}`;
              console.log(`📍 Zona seleccionada - ${priceText}`);
            });

            // Usar coordenadas personalizadas para la etiqueta o calcular el centro como fallback
            let labelPosition;
            if (feature.properties.labelPosition) {
              labelPosition = {
                lat: feature.properties.labelPosition.lat,
                lng: feature.properties.labelPosition.lng
              };
            } else {
              // Fallback: calcular el centro del polígono
              const polygonBounds = new googleMaps.maps.LatLngBounds();
              paths[0].forEach((point: any) => polygonBounds.extend(point));
              labelPosition = polygonBounds.getCenter();
            }

            // Crear etiqueta de precio más visible con fondo
            const priceText = `$${(costo / 1000).toFixed(0)}.000`;
            
            const priceLabel = new googleMaps.maps.Marker({
              position: labelPosition,
              map: mapInstanceRef.current,
              icon: {
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="65" height="24" viewBox="0 0 65 24">
                    <rect x="1" y="1" width="63" height="22" rx="11" fill="white" stroke="#ea580c" stroke-width="1.5"/>
                    <text x="32.5" y="15.5" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#ea580c">${priceText}</text>
                  </svg>
                `)}`,
                scaledSize: new googleMaps.maps.Size(65, 24),
                anchor: new googleMaps.maps.Point(32.5, 12)
              },
              clickable: false,
              zIndex: 1000
            });

            // No necesitamos tooltips ni modales
            /* Removido: ya no necesitamos infoWindow */
            /*
            const infoWindow = new googleMaps.maps.InfoWindow({
              content: `
                <div style="padding: 8px; font-family: system-ui, -apple-system, sans-serif;">
                  <div style="font-weight: 600; color: ${colores.stroke}; margin-bottom: 4px;">
                    ${costo === 0 ? '🎁 Despacho Gratuito' : `� Despacho $${costo.toLocaleString('es-CL')}`}
                  </div>
                  <div style="font-size: 12px; color: #666;">
                    Zona de cobertura mayorista
                  </div>
                </div>
              `
            });

            // Event listeners para el polígono
            polygon.addListener('mouseover', (event: any) => {
              infoWindow.setPosition(event.latLng);
              infoWindow.open(mapInstanceRef.current);
            });

            polygon.addListener('mouseout', () => {
              infoWindow.close();
            });
            */

            // Agregar puntos al bounds para ajustar vista
            paths[0].forEach((point: any) => bounds.extend(point));

            console.log(`🗺️ Polígono renderizado - Costo: $${costo.toLocaleString('es-CL')}`);
          }
        });

        // Ajustar vista para mostrar todos los polígonos
        if (!bounds.isEmpty()) {
          mapInstanceRef.current.fitBounds(bounds);
          
          // Limitar zoom
          const listener = googleMaps.maps.event.addListener(mapInstanceRef.current, 'bounds_changed', () => {
            const zoom = mapInstanceRef.current.getZoom();
            if (zoom > 13) {
              mapInstanceRef.current.setZoom(13);
            } else if (zoom < 10) {
              mapInstanceRef.current.setZoom(10);
            }
            googleMaps.maps.event.removeListener(listener);
          });
        }

      } catch (error) {
        console.error('❌ Error cargando polígonos GeoJSON:', error);
      }
    };

    loadGeoJSON();
  }, [googleMaps]);

  // Función para obtener ubicación del usuario
  const getUserLocation = () => {
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocalización no soportada por este navegador');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setUserLocation(userPos);
        setLocationLoading(false);
        
        // Verificar cobertura inmediatamente
        checkCoverage(userPos);
        
        // Mostrar ubicación en el mapa
        if (googleMaps && mapInstanceRef.current) {
          // Remover marcador anterior si existe
          if (userMarkerRef.current) {
            userMarkerRef.current.setMap(null);
          }

          // Crear nuevo marcador del usuario
          userMarkerRef.current = new googleMaps.maps.Marker({
            position: userPos,
            map: mapInstanceRef.current,
            title: 'Tu ubicación',
            icon: {
              path: googleMaps.maps.SymbolPath.CIRCLE,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 8
            }
          });

          // Centrar el mapa en la ubicación del usuario
          mapInstanceRef.current.setCenter(userPos);
          mapInstanceRef.current.setZoom(13);
        }
      },
      (error) => {
        let errorMessage = 'Error obteniendo ubicación';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado';
            break;
        }
        setLocationError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutos
      }
    );
  };

  // Función para verificar si el usuario está en zona de cobertura
  const checkCoverage = (location: {lat: number, lng: number}) => {
    if (!geoJsonData || !googleMaps || !googleMaps.maps.geometry) return;

    try {
      const point = new googleMaps.maps.LatLng(location.lat, location.lng);
      
      for (const feature of geoJsonData.features) {
        if (feature.geometry.type === 'Polygon') {
          const paths = feature.geometry.coordinates.map((ring: number[][]) => 
            ring.map(([lng, lat]: number[]) => new googleMaps.maps.LatLng(lat, lng))
          );
          
          const polygon = new googleMaps.maps.Polygon({ paths });
          
          if (googleMaps.maps.geometry.poly.containsLocation(point, polygon)) {
            const cost = feature.properties.cost || 1000;
            setCoverageInfo({ inCoverage: true, cost });
            return;
          }
        }
      }
      
      // Si no está en ningún polígono
      setCoverageInfo({ inCoverage: false });
    } catch (error) {
      console.error('Error verificando cobertura:', error);
      setCoverageInfo({ inCoverage: false });
    }
  };

  // Función para buscar dirección manual
  const searchManualAddress = async () => {
    if (!manualAddress.trim() || !googleMaps) return;
    
    setAddressLoading(true);
    setAddressError(null);

    try {
      const geocoder = new googleMaps.maps.Geocoder();
      
      const result = await new Promise((resolve, reject) => {
        geocoder.geocode(
          { 
            address: manualAddress,
            region: 'CL', // Limitar a Chile
            componentRestrictions: { country: 'CL' }
          },
          (results: any[], status: any) => {
            if (status === googleMaps.maps.GeocoderStatus.OK && results[0]) {
              resolve(results[0]);
            } else {
              reject(new Error('Dirección no encontrada'));
            }
          }
        );
      });

      const location = (result as any).geometry.location;
      const userPos = {
        lat: location.lat(),
        lng: location.lng()
      };

      setUserLocation(userPos);
      checkCoverage(userPos);

      // Mostrar ubicación en el mapa
      if (mapInstanceRef.current) {
        // Remover marcador anterior si existe
        if (userMarkerRef.current) {
          userMarkerRef.current.setMap(null);
        }

        // Crear nuevo marcador del usuario
        userMarkerRef.current = new googleMaps.maps.Marker({
          position: userPos,
          map: mapInstanceRef.current,
          title: `Dirección: ${manualAddress}`,
          icon: {
            path: googleMaps.maps.SymbolPath.CIRCLE,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 8
          }
        });

        // Centrar el mapa en la ubicación
        mapInstanceRef.current.setCenter(userPos);
        mapInstanceRef.current.setZoom(15);
      }

    } catch (error) {
      setAddressError('No se pudo encontrar la dirección. Verifica que sea una dirección válida en Chile.');
    } finally {
      setAddressLoading(false);
    }
  };

  // Configurar autocompletado de Google Places
  useEffect(() => {
    if (!googleMaps || !addressInputRef.current || autocompleteRef.current) return;

    try {
      const autocomplete = new googleMaps.maps.places.Autocomplete(addressInputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'cl' },
        fields: ['geometry', 'formatted_address', 'name']
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (!place.geometry) {
          setAddressError('Selecciona una dirección de la lista de sugerencias');
          return;
        }

        const userPos = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };

        setUserLocation(userPos);
        setManualAddress(place.formatted_address || place.name || '');
        checkCoverage(userPos);
        setAddressError(null);

        // Mostrar ubicación en el mapa
        if (mapInstanceRef.current) {
          // Remover marcador anterior si existe
          if (userMarkerRef.current) {
            userMarkerRef.current.setMap(null);
          }

          // Crear nuevo marcador del usuario
          userMarkerRef.current = new googleMaps.maps.Marker({
            position: userPos,
            map: mapInstanceRef.current,
            title: `Dirección: ${place.formatted_address || place.name}`,
            icon: {
              path: googleMaps.maps.SymbolPath.CIRCLE,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 8
            }
          });

          // Centrar el mapa en la ubicación
          mapInstanceRef.current.setCenter(userPos);
          mapInstanceRef.current.setZoom(15);
        }
      });

      autocompleteRef.current = autocomplete;
    } catch (error) {
      console.error('Error configurando autocompletado:', error);
    }
  }, [googleMaps, showManualInput]);

  // Actualizar verificación de cobertura cuando cambien los datos
  useEffect(() => {
    if (userLocation && geoJsonData) {
      checkCoverage(userLocation);
    }
  }, [userLocation, geoJsonData, googleMaps]);

  // Fallback si no hay Google Maps
  if (!mapLoaded) {
    return (
      <div className={`${className}`}>
        <div className="w-full h-96 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando mapa de cobertura...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!googleMaps) {
    // Fallback sin Google Maps - mostrar solo información de cobertura
    return (
      <div className={`${className} space-y-6`}>
        {/* Header con información de cobertura */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-200">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-orange-900 flex items-center justify-center">
              <FaTruck className="mr-2" />
              Zona de Cobertura de Distribución
            </h3>
            <p className="text-sm text-orange-700 mt-1">
              {RESUMEN_COBERTURA.totalComunas} comunas disponibles para entrega
            </p>
            <p className="text-xs text-gray-600 mt-2">
              (Mapa no disponible - Google Maps API no configurada)
            </p>
          </div>
        </div>

        {/* Leyenda de colores (sin mapa) */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">Costos por Zona</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(COLORES_POR_COSTO).map(([costo, colores]) => (
              <div key={costo} className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded border-2" 
                  style={{ 
                    backgroundColor: colores.fill, 
                    borderColor: colores.stroke,
                    opacity: colores.fillOpacity + 0.3
                  }}
                ></div>
                <span className="text-xs text-gray-700 font-medium">
                  {parseInt(costo) === 0 ? 'Gratuito' : `$${parseInt(costo).toLocaleString('es-CL')}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Listado de comunas por costo de despacho */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-6 text-center">
            Comunas y Costos de Despacho
          </h4>
          
          <div className="space-y-6">
            {(() => {
              const comunasPorCosto = agruparComunasPorCosto();
              const costosOrdenados = obtenerCostosUnicos();
              
              return costosOrdenados.map(costo => {
                const comunasDelCosto = comunasPorCosto[costo] || [];
                if (comunasDelCosto.length === 0) return null;
                
                return (
                  <div key={costo} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                    <div className="flex items-center mb-3">
                      {costo === 0 ? (
                        <>
                          <FaGift className="text-green-600 text-lg mr-2" />
                          <h5 className="text-md font-semibold text-green-800">
                            Comunas con despacho gratuito:
                          </h5>
                        </>
                      ) : (
                        <>
                          <FaDollarSign className="text-orange-600 text-lg mr-2" />
                          <h5 className="text-md font-semibold text-orange-800">
                            Comunas con despacho ${costo.toLocaleString('es-CL')}:
                          </h5>
                        </>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {comunasDelCosto.map(comuna => (
                        <span 
                          key={comuna.nombre}
                          className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                            costo === 0 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                          }`}
                          onClick={() => {/* Ya no necesitamos modal */}}
                          title="Haz clic para ver más detalles"
                        >
                          {comuna.nombre}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} space-y-4`}>
      {/* Panel de verificación de cobertura */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Información de verificación */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-1 flex items-center">
              <FaLocationArrow className="mr-2" />
              Verificar Cobertura en tu Ubicación
            </h3>
            <p className="text-sm text-blue-700">
              Usa tu GPS o ingresa tu dirección manualmente para saber el costo de despacho
            </p>
          </div>

          {/* Botones de ubicación */}
          <div className="flex flex-col gap-2">
            <button
              onClick={getUserLocation}
              disabled={locationLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center text-sm"
            >
              <FaLocationArrow className={`mr-2 ${locationLoading ? 'animate-spin' : ''}`} />
              {locationLoading ? 'Obteniendo...' : 'Mi Ubicación'}
            </button>
            
            <button
              onClick={() => setShowManualInput(!showManualInput)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center text-sm"
            >
              <FaMapMarkerAlt className="mr-2" />
              Ingresar Dirección
            </button>
          </div>
        </div>

        {/* Campo de dirección manual */}
        {showManualInput && (
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
            <label htmlFor="manual-address" className="block text-sm font-medium text-gray-700 mb-2">
              Ingresa tu dirección:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                ref={addressInputRef}
                id="manual-address"
                type="text"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder="Ej: Av. Libertador 123, San Bernardo, Chile"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    searchManualAddress();
                  }
                }}
              />
              <button
                onClick={searchManualAddress}
                disabled={addressLoading || !manualAddress.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap sm:w-auto w-full"
              >
                {addressLoading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Escribe tu dirección y selecciona una opción de las sugerencias que aparecen
            </p>
          </div>
        )}

        {/* Errores de verificación */}
        {locationError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <FaTimesCircle className="text-red-500 mr-2" />
            <span className="text-sm text-red-700">{locationError}</span>
          </div>
        )}

        {addressError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <FaTimesCircle className="text-red-500 mr-2" />
            <span className="text-sm text-red-700">{addressError}</span>
          </div>
        )}

        {coverageInfo && (
          <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
            {coverageInfo.inCoverage ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span className="text-sm font-medium text-gray-900">
                    ¡Tienes cobertura!
                  </span>
                </div>
                <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-bold">
                  Despacho: ${coverageInfo.cost?.toLocaleString('es-CL')}
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <FaTimesCircle className="text-red-500 mr-2" />
                <span className="text-sm text-gray-700">
                  Tu ubicación no está en zona de cobertura actual
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mapa principal - auto-explicativo */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-96 rounded-lg border border-gray-200 shadow-lg"
        />
      </div>
    </div>
  );
};

export default MapaCoberturaGoogleMayorista;