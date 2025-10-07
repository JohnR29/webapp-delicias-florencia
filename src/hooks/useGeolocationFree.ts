"use client";
import { useState, useCallback, useEffect } from 'react';

interface Coordenadas {
  lat: number;
  lng: number;
}

interface GeolocationError {
  code: number;
  message: string;
}

interface UseGeolocationFreeReturn {
  location: Coordenadas | null;
  loading: boolean;
  error: string | null;
  permissionState: PermissionState | null;
  getCurrentLocation: () => Promise<Coordenadas | null>;
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
  geocodeAddress: (address: string) => Promise<Coordenadas | null>;
}

/**
 * Hook de geolocalización completamente GRATUITO usando:
 * - Browser Geolocation API (ubicación del usuario)
 * - Nominatim/OpenStreetMap (geocodificación de direcciones)
 * - Fórmula de Haversine (cálculo de distancias)
 */
export function useGeolocationFree(): UseGeolocationFreeReturn {
  const [location, setLocation] = useState<Coordenadas | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null);

  // Verificar permisos al montar el componente
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionState(result.state);
        
        result.addEventListener('change', () => {
          setPermissionState(result.state);
        });
      });
    }
  }, []);

  /**
   * Obtener ubicación actual del usuario usando Browser Geolocation API
   */
  const getCurrentLocation = useCallback((): Promise<Coordenadas | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        const errorMsg = 'Geolocalización no está disponible en este navegador';
        setError(errorMsg);
        resolve(null);
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          setLocation(coords);
          setLoading(false);
          resolve(coords);
        },
        (error: GeolocationPositionError) => {
          let errorMessage: string;
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Acceso a la ubicación denegado por el usuario';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Información de ubicación no disponible';
              break;
            case error.TIMEOUT:
              errorMessage = 'La solicitud de ubicación ha caducado';
              break;
            default:
              errorMessage = 'Error desconocido al obtener la ubicación';
              break;
          }
          
          console.error('Error de geolocalización:', error.code, errorMessage);
          setError(errorMessage);
          setLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutos de cache
        }
      );
    });
  }, []);

  /**
   * Calcular distancia entre dos puntos usando fórmula de Haversine
   * @param lat1 Latitud del primer punto
   * @param lon1 Longitud del primer punto
   * @param lat2 Latitud del segundo punto
   * @param lon2 Longitud del segundo punto
   * @returns Distancia en kilómetros
   */
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
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
  }, []);

  /**
   * Geocodificar dirección usando Nominatim (OpenStreetMap) - GRATUITO
   * @param address Dirección a geocodificar
   * @returns Coordenadas o null si no se encuentra
   */
  const geocodeAddress = useCallback(async (address: string): Promise<Coordenadas | null> => {
    try {
      // Preparar dirección para Chile
      const addressQuery = `${address}, Chile`;
      const encodedAddress = encodeURIComponent(addressQuery);
      
      // Usar Nominatim (servicio gratuito de OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=cl`,
        {
          headers: {
            'User-Agent': 'Delicias-Florencia-WebApp/1.0' // Nominatim requiere User-Agent
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

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
  }, []);

  return {
    location,
    loading,
    error,
    permissionState,
    getCurrentLocation,
    calculateDistance,
    geocodeAddress
  };
}