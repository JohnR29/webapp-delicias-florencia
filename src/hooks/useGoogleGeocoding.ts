"use client";
import { useState, useEffect, useCallback } from 'react';

interface Coordinates {
  lat: number;
  lng: number;
}

interface UseGoogleGeocodingResult {
  geocode: (address: string, fallback?: Coordinates) => Promise<Coordinates | null>;
  isLoading: boolean;
  error: string | null;
  isGoogleMapsAvailable: boolean;
}

export const useGoogleGeocoding = (): UseGoogleGeocodingResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geocoder, setGeocoder] = useState<any>(null);
  const [isGoogleMapsAvailable, setIsGoogleMapsAvailable] = useState(false);

  // Inicializar geocoder cuando Google Maps esté disponible
  useEffect(() => {
    const checkGoogleMaps = () => {
      if ((window as any).google?.maps?.Geocoder) {
        setGeocoder(new (window as any).google.maps.Geocoder());
        setIsGoogleMapsAvailable(true);
      } else {
        setIsGoogleMapsAvailable(false);
      }
    };

    // Verificar inmediatamente
    checkGoogleMaps();

    // Escuchar cuando Google Maps se cargue
    const interval = setInterval(() => {
      if ((window as any).google?.maps?.Geocoder && !geocoder) {
        checkGoogleMaps();
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [geocoder]);

  const geocode = useCallback(async (
    address: string, 
    fallback?: Coordinates
  ): Promise<Coordinates | null> => {
    if (!geocoder) {
      console.warn('Google Geocoder no disponible');
      return fallback || null;
    }

    setIsLoading(true);
    setError(null);

    try {
      return new Promise((resolve) => {
        geocoder.geocode(
          { 
            address: address,
            region: 'CL',
            componentRestrictions: {
              country: 'CL'
            }
          },
          (results: any[], status: any) => {
            setIsLoading(false);
            
            if (status === 'OK' && results.length > 0) {
              const location = results[0].geometry.location;
              resolve({
                lat: location.lat(),
                lng: location.lng()
              });
            } else {
              console.warn(`Geocodificación fallida para ${address}: ${status}`);
              setError(`Error geocodificando: ${status}`);
              resolve(fallback || null);
            }
          }
        );
      });
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error en geocodificación:', err);
      return fallback || null;
    }
  }, [geocoder]);

  return {
    geocode,
    isLoading,
    error,
    isGoogleMapsAvailable
  };
};