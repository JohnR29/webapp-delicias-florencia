import { useState, useEffect, useCallback } from 'react';
import { useGeolocation, UserLocation } from './useGeolocation';
import { useSociosDistribuidores, SocioDistribuidor } from './useSociosDistribuidores';

export interface SocioDistribuidorConDistancia extends SocioDistribuidor {
  distancia?: number;
  direccionCompleta?: string;
  coordenadas?: {
    lat: number;
    lng: number;
  };
}

export function useSociosCercanos() {
  const { location, loading: locationLoading, getCurrentLocation, calculateDistance } = useGeolocation();
  const { socios, loading: sociosLoading, fetchSocios } = useSociosDistribuidores();
  
  const [sociosCercanos, setSociosCercanos] = useState<SocioDistribuidorConDistancia[]>([]);
  const [loadingDistancias, setLoadingDistancias] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Geocodificar direcciones de socios para obtener coordenadas
  const geocodificarDirecciones = async (sociosLista: SocioDistribuidor[]) => {
    const sociosConCoordenadas: SocioDistribuidorConDistancia[] = [];
    
    for (const socio of sociosLista) {
      try {
        const direccionCompleta = `${socio.direccion}, ${socio.comuna}, Chile`;
        
        // Usar Google Geocoding API
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(direccionCompleta)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );

        if (response.ok) {
          const data = await response.json();
          
          if (data.status === 'OK' && data.results.length > 0) {
            const coords = data.results[0].geometry.location;
            sociosConCoordenadas.push({
              ...socio,
              coordenadas: {
                lat: coords.lat,
                lng: coords.lng
              },
              direccionCompleta: data.results[0].formatted_address
            });
          } else {
            // Si no se puede geocodificar, incluir sin coordenadas
            sociosConCoordenadas.push({
              ...socio,
              direccionCompleta
            });
          }
        } else {
          sociosConCoordenadas.push({
            ...socio,
            direccionCompleta: `${socio.direccion}, ${socio.comuna}`
          });
        }
      } catch (error) {
        console.error(`Error geocodificando ${socio.nombre_comercial}:`, error);
        sociosConCoordenadas.push({
          ...socio,
          direccionCompleta: `${socio.direccion}, ${socio.comuna}`
        });
      }
    }

    return sociosConCoordenadas;
  };

  // Calcular distancias a todos los socios
  const calcularDistancias = useCallback(async (userLocation: UserLocation) => {
    if (!socios.length) return;

    setLoadingDistancias(true);
    setError(null);

    try {
      // Primero geocodificar todas las direcciones
      const sociosConCoordenadas = await geocodificarDirecciones(socios);
      
      // Calcular distancias para socios con coordenadas
      const sociosConDistancias = sociosConCoordenadas.map(socio => {
        if (socio.coordenadas) {
          const distancia = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            socio.coordenadas.lat,
            socio.coordenadas.lng
          );
          
          return {
            ...socio,
            distancia
          };
        }
        
        return socio;
      });

      // Ordenar por distancia (socios sin coordenadas van al final)
      const sociosOrdenados = sociosConDistancias.sort((a, b) => {
        if (a.distancia === undefined && b.distancia === undefined) return 0;
        if (a.distancia === undefined) return 1;
        if (b.distancia === undefined) return -1;
        return a.distancia - b.distancia;
      });

      setSociosCercanos(sociosOrdenados);
    } catch (error) {
      console.error('Error calculando distancias:', error);
      setError('Error al calcular distancias a los puntos de venta');
    } finally {
      setLoadingDistancias(false);
    }
  }, [socios, calculateDistance]);

  // Obtener los N socios más cercanos
  const getSociosMasCercanos = (limite: number = 5) => {
    return sociosCercanos
      .filter(socio => socio.distancia !== undefined)
      .slice(0, limite);
  };

  // Obtener socios dentro de un radio específico (en km)
  const getSociosEnRadio = (radioKm: number) => {
    return sociosCercanos.filter(socio => 
      socio.distancia !== undefined && socio.distancia <= radioKm
    );
  };

  // Obtener el socio más cercano
  const getSocioMasCercano = () => {
    return sociosCercanos.find(socio => socio.distancia !== undefined);
  };

  // Buscar socios cercanos automáticamente
  const buscarSociosCercanos = async () => {
    try {
      // Obtener ubicación del usuario
      await getCurrentLocation();
      
      // Cargar socios si no están cargados
      if (!socios.length) {
        await fetchSocios();
      }
    } catch (error) {
      setError('Error al obtener la ubicación o cargar socios');
    }
  };

  // Calcular distancias cuando cambie la ubicación o los socios
  useEffect(() => {
    if (location && socios.length > 0) {
      calcularDistancias(location);
    }
  }, [location, socios, calcularDistancias]);

  return {
    // Estados
    sociosCercanos,
    location,
    loading: locationLoading || sociosLoading || loadingDistancias,
    error,
    
    // Funciones
    buscarSociosCercanos,
    getSociosMasCercanos,
    getSociosEnRadio,
    getSocioMasCercano,
    calcularDistancias,
    
    // Información adicional
    haLocation: !!location,
    totalSocios: socios.length,
    sociosConDistancia: sociosCercanos.filter(s => s.distancia !== undefined).length
  };
}