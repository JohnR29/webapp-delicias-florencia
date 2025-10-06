import { useState, useEffect } from 'react';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface LocationError {
  code: number;
  message: string;
}

export function useGeolocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');

  // Verificar soporte de geolocalización
  const isSupported = 'geolocation' in navigator;

  // Solicitar ubicación del usuario
  const getCurrentLocation = async (options?: PositionOptions) => {
    if (!isSupported) {
      setError({
        code: -1,
        message: 'La geolocalización no está soportada en este navegador'
      });
      return;
    }

    setLoading(true);
    setError(null);

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutos
      ...options
    };

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          setLocation(userLocation);
          setPermission('granted');
          setLoading(false);
        },
        (error) => {
          let errorMessage = 'Error desconocido';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Acceso a la ubicación denegado por el usuario';
              setPermission('denied');
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Información de ubicación no disponible';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tiempo de espera agotado para obtener la ubicación';
              break;
          }

          setError({
            code: error.code,
            message: errorMessage
          });
          setLoading(false);
        },
        defaultOptions
      );
    } catch (err) {
      setError({
        code: -1,
        message: 'Error inesperado al obtener la ubicación'
      });
      setLoading(false);
    }
  };

  // Calcular distancia entre dos puntos (fórmula Haversine)
  const calculateDistance = (
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number => {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance * 100) / 100; // Redondear a 2 decimales
  };

  // Obtener dirección legible a partir de coordenadas (geocoding inverso)
  const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
      // Usar API de geocoding de Google Maps (requiere API key)
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Error en la solicitud de geocoding');
      }

      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        return data.results[0].formatted_address;
      } else {
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }
    } catch (error) {
      console.error('Error en geocoding inverso:', error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  // Verificar permisos de geolocalización
  const checkPermission = async () => {
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setPermission(result.state);
        
        result.addEventListener('change', () => {
          setPermission(result.state);
        });
      } catch (error) {
        console.warn('No se pudo verificar el permiso de geolocalización');
      }
    }
  };

  // Verificar permisos al montar el componente
  useEffect(() => {
    checkPermission();
  }, []);

  return {
    location,
    loading,
    error,
    permission,
    isSupported,
    getCurrentLocation,
    calculateDistance,
    getAddressFromCoordinates,
    checkPermission
  };
}