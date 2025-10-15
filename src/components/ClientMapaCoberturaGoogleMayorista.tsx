'use client';
import dynamic from 'next/dynamic';

const MapaCoberturaGoogleMayorista = dynamic(() => import('./MapaCoberturaGoogleMayorista'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-96 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando mapa de cobertura...</p>
      </div>
    </div>
  )
});

export default function ClientMapaCoberturaGoogleMayorista(props: any) {
  return <MapaCoberturaGoogleMayorista {...props} />;
}