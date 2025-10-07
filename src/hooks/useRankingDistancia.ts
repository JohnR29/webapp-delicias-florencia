"use client";
import { useMemo } from 'react';
import { SocioDistribuidor } from '@/hooks/useSociosDistribuidores';

interface Coordenadas {
  lat: number;
  lng: number;
}

interface SocioConDistancia extends SocioDistribuidor {
  coordenadas?: Coordenadas;
  distancia?: number;
}

interface UseRankingDistanciaReturn {
  sociosOrdenados: SocioConDistancia[];
  sociosCercanos: SocioConDistancia[];
  calcularDistancia: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
}

/**
 * Hook para ordenar socios distribuidores por distancia desde la ubicación del usuario
 */
export function useRankingDistancia(
  sociosGeocodificados: (SocioDistribuidor & { coordenadas?: Coordenadas })[],
  userLocation: Coordenadas | null,
  limiteCercanos: number = 2
): UseRankingDistanciaReturn {

  /**
   * Calcular distancia entre dos puntos usando fórmula de Haversine
   */
  const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Redondear a 1 decimal
  };

  /**
   * Calcular distancias y ordenar socios
   */
  const sociosOrdenados = useMemo((): SocioConDistancia[] => {
    if (!userLocation) {
      // Sin ubicación del usuario, devolver tal como están
      return sociosGeocodificados.map(socio => ({
        ...socio,
        distancia: undefined
      }));
    }

    // Calcular distancias y ordenar
    const sociosConDistancia = sociosGeocodificados
      .map(socio => {
        if (!socio.coordenadas) {
          return {
            ...socio,
            distancia: undefined
          };
        }

        const distancia = calcularDistancia(
          userLocation.lat,
          userLocation.lng,
          socio.coordenadas.lat,
          socio.coordenadas.lng
        );

        return {
          ...socio,
          distancia
        };
      })
      .sort((a, b) => {
        // Priorizar socios con coordenadas y distancia
        if (a.distancia === undefined && b.distancia === undefined) return 0;
        if (a.distancia === undefined) return 1;
        if (b.distancia === undefined) return -1;
        
        // Ordenar por distancia ascendente
        return a.distancia - b.distancia;
      });

    return sociosConDistancia;
  }, [sociosGeocodificados, userLocation]);

  /**
   * Obtener los socios más cercanos
   */
  const sociosCercanos = useMemo((): SocioConDistancia[] => {
    return sociosOrdenados
      .filter(socio => socio.coordenadas && socio.distancia !== undefined)
      .slice(0, limiteCercanos);
  }, [sociosOrdenados, limiteCercanos]);

  return {
    sociosOrdenados,
    sociosCercanos,
    calcularDistancia
  };
}