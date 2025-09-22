
"use client";

// Ajustar el tamaño del mapa cuando la ventana cambie de tamaño
// (el useEffect correspondiente debe ir después de declarar los refs)

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import * as turf from '@turf/turf';

// Fix para los iconos de Leaflet en Next.js
import 'leaflet/dist/leaflet.css';

// Configuración de comunas permitidas
const COMUNAS_PERMITIDAS = ['San Bernardo', 'La Pintana', 'El Bosque', 'La Cisterna', 'Zona de cobertura'];

// Coordenadas aproximadas de comunas (centroides simplificados)
const COMUNAS_COORDS = {
  'San Bernardo': { lat: -33.606246, lng: -70.700462 },
  'La Pintana': { lat: -33.579463, lng: -70.648956 },
  'El Bosque': { lat: -33.559729, lng: -70.672550 },
  'La Cisterna': { lat: -33.528348, lng: -70.668608 }
};

interface CoverageMapProps {
  className?: string;
}

const CoverageMap: React.FC<CoverageMapProps> = ({ className = '' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Ajustar el tamaño del mapa cuando la ventana cambie de tamaño
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);
    // También forzar ajuste al montar por si el contenedor cambia
    setTimeout(handleResize, 400);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || mapInstanceRef.current) return;

    // Fix para los iconos de marcadores de Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    const centro: [number, number] = [-33.585, -70.67];
    
    // Crear el mapa
    const map = L.map(mapRef.current, {
      scrollWheelZoom: false,
      attributionControl: true
    }).setView(centro, 12);

    mapInstanceRef.current = map;

    // Agregar la capa base
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // Cargar y procesar el GeoJSON
    const loadGeoData = async () => {
      try {
        console.log('Cargando datos del mapa...');
        const response = await fetch('/comunas.geojson');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Datos GeoJSON cargados:', data);

        // Filtrar solo las comunas permitidas
        const featuresPermitidas = data.features.filter((f: any) =>
          COMUNAS_PERMITIDAS.includes(f.properties.NOMBRE)
        );

        console.log('Features permitidas:', featuresPermitidas.map((f: any) => f.properties.NOMBRE));

        if (featuresPermitidas.length === 0) {
          console.warn('No se encontraron comunas permitidas en el GeoJSON');
          return;
        }

        // Separar la zona de cobertura de las comunas individuales
        const zonaCobertura = featuresPermitidas.find((f: any) => f.properties.NOMBRE === 'Zona de cobertura');
        const comunasIndividuales = featuresPermitidas.filter((f: any) => f.properties.NOMBRE !== 'Zona de cobertura');

        // Agregar zona de cobertura principal si existe
        if (zonaCobertura) {
          L.geoJSON(zonaCobertura, {
            style: {
              color: '#ff6600',
              weight: 3,
              fillColor: '#ffcc99',
              fillOpacity: 0.25,
              dashArray: '5, 5'
            }
          }).addTo(map).bindTooltip('Área de Distribución Mayorista', {
            permanent: false,
            direction: 'center',
            className: 'custom-tooltip'
          });
        }

        // Crear polígono unificado usando Turf.js solo si no hay zona de cobertura definida
        let union: any = null;
        if (!zonaCobertura && comunasIndividuales.length > 0) {
          comunasIndividuales.forEach((f: any) => {
            union = union ? turf.union(union, f) : f;
          });

          if (union) {
            // Agregar el polígono unificado (área de cobertura general)
            L.geoJSON(union, {
              style: {
                color: '#ff6600',
                weight: 2,
                fillColor: '#ffcc99',
                fillOpacity: 0.15
              }
            }).addTo(map);
          }
        }

        // Agregar polígonos individuales de cada comuna
        if (comunasIndividuales.length > 0) {
          const capaComunas = L.geoJSON(comunasIndividuales, {
            style: () => ({
              color: '#0077cc',
              weight: 1.5,
              fillColor: '#66b3ff',
              fillOpacity: 0.35
            }),
            onEachFeature: (feature, layer) => {
              layer.bindTooltip(feature.properties.NOMBRE, {
                permanent: false,
                direction: 'center'
              });
            }
          }).addTo(map);

          // Ajustar mapa al área total
          if (zonaCobertura) {
            map.fitBounds(L.geoJSON(zonaCobertura).getBounds());
          } else if (union) {
            map.fitBounds(L.geoJSON(union).getBounds());
          } else {
            map.fitBounds(capaComunas.getBounds());
          }
        } else if (zonaCobertura) {
          // Si solo hay zona de cobertura, ajustar a ella
          map.fitBounds(L.geoJSON(zonaCobertura).getBounds());
        }

        // Ocultar el loader una vez que el mapa esté listo
        setTimeout(() => {
          const loader = mapRef.current?.parentElement?.querySelector('.absolute');
          if (loader) {
            (loader as HTMLElement).style.opacity = '0';
            setTimeout(() => {
              (loader as HTMLElement).style.display = 'none';
            }, 500);
          }
        }, 1000);

        console.log('Mapa cargado exitosamente');

        // Detectar si es móvil para ajustar el tamaño del ícono
        const isMobile = window.innerWidth < 640;
        const iconOptions = isMobile
          ? {
              iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
              iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
              iconSize: [18, 28] as [number, number], // más pequeño
              iconAnchor: [9, 28] as [number, number],
              popupAnchor: [1, -24] as [number, number],
              tooltipAnchor: [0, -18] as [number, number],
            }
          : undefined;

        Object.entries(COMUNAS_COORDS).forEach(([nombre, { lat, lng }]) => {
          if (COMUNAS_PERMITIDAS.includes(nombre)) {
            const marker = L.marker([lat, lng], {
              title: nombre,
              icon: iconOptions ? L.icon(iconOptions) : undefined,
            })
              .addTo(map)
              .bindTooltip(nombre, { direction: 'top', offset: [0, -6] });
          }
        });

      } catch (error) {
        console.error('Error cargando datos del mapa:', error);
        // Mostrar fallback en caso de error SOLO en cliente
        if (typeof window !== 'undefined' && mapRef.current) {
          const fallbackDiv = document.createElement('div');
          fallbackDiv.className = 'flex items-center justify-center h-full text-gray-500';
          fallbackDiv.innerHTML = `
            <div class="text-center">
              <div class="text-2xl mb-2">🗺️</div>
              <p>Error cargando el mapa</p>
            </div>
          `;
          mapRef.current.appendChild(fallbackDiv);
        }
      }
    };

    loadGeoData();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div
        ref={mapRef}
        className="w-full min-h-[320px] h-[400px] max-h-[60vh] sm:min-h-[400px] sm:h-[400px] sm:max-h-[500px] rounded-md"
      />
      {/* Loader inicial - se ocultará automáticamente cuando el mapa cargue */}
      <div
        className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 pointer-events-none transition-opacity duration-500"
        style={{ zIndex: 1000 }}
      >
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🗺️</div>
          <p className="text-lg font-medium text-gray-700 mb-2">Cargando mapa de cobertura</p>
          <p className="text-sm text-gray-500">Zonas de distribución mayorista</p>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverageMap;