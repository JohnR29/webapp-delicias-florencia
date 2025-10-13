"use client";
import { useState } from 'react';
import Link from 'next/link';
import SociosFilters from '@/components/SociosFilters';
import SugerenciasSociosFree from '@/components/SugerenciasSociosFree';
import MapaDistribuidoresGoogle from '@/components/MapaDistribuidoresGoogle';
import { useSociosDistribuidores } from '@/hooks/useSociosDistribuidores';

export default function DondeComprarPage() {
  const {
    socios,
    loading,
    error,
    totalSocios,
    comunasDisponibles,
    sociosConPedidosDirectos,
    fetchSociosByComuna,
    searchSocios,
    fetchSocios
  } = useSociosDistribuidores();



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Inicio
              </Link>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-900 font-medium">Dónde Comprar</span>
            </nav>

            {/* Header principal */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  🏪 Encuentra tu punto de venta más cercano
                </h1>
                <p className="text-gray-600 max-w-2xl">
                  Descubre todos los lugares donde puedes comprar los deliciosos productos de Delicias Florencia. 
                  Nuestros socios distribuidores están listos para atenderte en tu comuna.
                </p>
              </div>
              
              {/* Botón para volver a comprar */}
              <div className="flex-shrink-0">
                <Link
                  href="/"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  Comprar al por mayor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="bg-blue-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start">
              <div className="bg-blue-500 text-white rounded-full p-2 mr-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-900">{totalSocios}</div>
                <div className="text-sm text-blue-700">Puntos de venta</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center sm:justify-start">
              <div className="bg-green-500 text-white rounded-full p-2 mr-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-900">{comunasDisponibles.length}</div>
                <div className="text-sm text-green-700">Comunas cubiertas</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center sm:justify-start">
              <div className="bg-purple-500 text-white rounded-full p-2 mr-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <div>
                <div className="text-lg font-semibold text-purple-900">{sociosConPedidosDirectos.length}</div>
                <div className="text-sm text-purple-700">Aceptan pedidos directos</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sugerencias inteligentes basadas en ubicación */}
      <SugerenciasSociosFree />

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar con filtros */}
          <div className="lg:w-80 flex-shrink-0">
            <SociosFilters
              comunasDisponibles={comunasDisponibles}
              onFilterByComuna={fetchSociosByComuna}
              onSearch={searchSocios}
              onReset={fetchSocios}
              totalResultados={socios.length}
            />
          </div>

          {/* Contenido principal */}
          <div className="flex-1">
            {/* Header de la sección */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                🗺️ Mapa de puntos de venta
                {socios.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({socios.length} {socios.length === 1 ? 'resultado' : 'resultados'})
                  </span>
                )}
              </h2>
              <p className="text-gray-600 mt-1">
                Encuentra el punto de venta más cercano a tu ubicación
              </p>
            </div>

            {/* Vista de mapa única */}
            <MapaDistribuidoresGoogle socios={socios} />
          </div>
        </div>
      </div>

      {/* Footer informativo */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              ¿Tienes un negocio y quieres ser distribuidor?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Únete a nuestra red de socios distribuidores y aumenta tus ventas ofreciendo 
              los productos de Delicias Florencia en tu local.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/registro-punto-venta"
                className="inline-flex items-center px-6 py-3 text-base font-medium rounded-md text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                ¡Regístrate como socio!
              </Link>
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 border border-blue-600 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors"
              >
                <span className="mr-2">🛒</span>
                Conocer más sobre distribución
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}