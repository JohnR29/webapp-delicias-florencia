import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export const loadGoogleMapsScript = async () => {
  if (typeof window === 'undefined') return;
  if ((window as any).google && (window as any).google.maps && (window as any).google.maps.places) return;
  setOptions({
    key: GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
    language: 'es',
    region: 'CL',
  });
  await importLibrary('places');
};
