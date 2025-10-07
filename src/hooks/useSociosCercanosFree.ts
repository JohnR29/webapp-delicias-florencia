"use client";
import { useState, useEffect, useCallback } from 'react';
import { useSociosDistribuidores, SocioDistribuidor } from './useSociosDistribuidores';
import { useGeolocationFree } from './useGeolocationFree';

interface SocioConDistancia extends SocioDistribuidor {
  distancia?: number;
  coordenadas?: {
    lat: number;
    lng: number;
  };
}

interface UseSociosCercanosReturn {
  sociosCercanos: SocioConDistancia[];
  loading: boolean;
  error: string | null;
  location: { lat: number; lng: number } | null;
  permissionState: PermissionState | null;
  getSociosMasCercanos: (limite?: number) => SocioConDistancia[];
  geocodificarSocios: () => Promise<void>;
}

/**
 * Hook especializado para encontrar socios distribuidores cercanos
 * usando geolocalización GRATUITA (sin API keys)
 */
export function useSociosCercanosFree(): UseSociosCercanosReturn {
  const { socios } = useSociosDistribuidores();
  const { 
    location, 
    loading: geoLoading, 
    error: geoError, 
    permissionState,
    getCurrentLocation, 
    calculateDistance, 
    geocodeAddress 
  } = useGeolocationFree();
  
  const [sociosConCoordenadas, setSociosConCoordenadas] = useState<SocioConDistancia[]>([]);
  const [geocodingLoading, setGeocodingLoading] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);

  /**
   * Geocodificar direcciones de socios usando Nominatim (gratis)
   */
  const geocodificarSocios = useCallback(async () => {
    if (!socios || socios.length === 0) return;

    setGeocodingLoading(true);
    setGeocodingError(null);

    try {
      const sociosGeocodificados: SocioConDistancia[] = [];

      // Procesar socios de a uno para evitar rate limiting
      for (const socio of socios) {
        try {
          // Usar dirección completa del socio
          const direccionCompleta = socio.direccion || `${socio.negocio}, Chile`;
          
          const coordenadas = await geocodeAddress(direccionCompleta);
          
          if (coordenadas) {
            sociosGeocodificados.push({
              ...socio,
              coordenadas
            });
          } else {
            // Si no se pudo geocodificar, intentar solo con el negocio
            const coordenadasBackup = await geocodeAddress(socio.negocio);
            if (coordenadasBackup) {
              sociosGeocodificados.push({
                ...socio,
                coordenadas: coordenadasBackup
              });
            } else {
              // Agregar sin coordenadas para que aparezca en la lista
              sociosGeocodificados.push({
                ...socio
              });
              // No se pudo geocodificar esta dirección, continuamos con las siguientes
            }
          }

          // Pausa pequeña entre requests para ser respetuosos con Nominatim
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          // Error geocodificando, se omite del mapa
          // Agregar sin coordenadas
          sociosGeocodificados.push({
            ...socio
          });
        }
      }

      setSociosConCoordenadas(sociosGeocodificados);
      
    } catch (error) {
      console.error('Error en geocodificación masiva:', error);
      setGeocodingError('Error al procesar ubicaciones de socios');
    } finally {
      setGeocodingLoading(false);
    }
  }, [socios, geocodeAddress]);

  /**
   * Calcular distancias cuando tenemos ubicación del usuario y socios geocodificados
   */
  useEffect(() => {
    if (!location || !sociosConCoordenadas.length) return;

    const sociosConDistancia = sociosConCoordenadas.map(socio => {
      if (!socio.coordenadas) {
        return { ...socio, distancia: undefined };
      }

      const distancia = calculateDistance(
        location.lat,
        location.lng,
        socio.coordenadas.lat,
        socio.coordenadas.lng
      );

      return {
        ...socio,
        distancia
      };
    });

    setSociosConCoordenadas(sociosConDistancia);
  }, [location, calculateDistance]);

  /**
   * Geocodificar automáticamente cuando cambian los socios
   */
  useEffect(() => {
    if (socios && socios.length > 0) {
      geocodificarSocios();
    }
  }, [socios, geocodificarSocios]);

  /**
   * Obtener los socios más cercanos ordenados por distancia
   */
  const getSociosMasCercanos = useCallback((limite: number = 3): SocioConDistancia[] => {
    return sociosConCoordenadas
      .filter(socio => socio.distancia !== undefined)
      .sort((a, b) => (a.distancia || 0) - (b.distancia || 0))
      .slice(0, limite);
  }, [sociosConCoordenadas]);

  /**
   * Obtener todos los socios cercanos ordenados
   */
  const sociosCercanos = getSociosMasCercanos(50); // Todos, máximo 50

  return {
    sociosCercanos,
    loading: geoLoading || geocodingLoading,
    error: geoError || geocodingError,
    location,
    permissionState,
    getSociosMasCercanos,
    geocodificarSocios
  };
}