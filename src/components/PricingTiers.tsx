'use client';

import { PRICING_CONFIG } from '@/lib/types';

interface PricingTiersProps {
  tierActual?: number;
  unidadesHastaSiguienteTier?: number;
}

export default function PricingTiers({ tierActual, unidadesHastaSiguienteTier }: PricingTiersProps) {
  const tramos12oz = [
    {
      titulo: 'Tramo 1 - Inicial',
      rango: `${PRICING_CONFIG.MINIMO_PEDIDO} - ${PRICING_CONFIG.UMBRAL_TIER2 - 1} uds`,
      precio: PRICING_CONFIG.PRECIO_12OZ_TIER1,
      ahorro: null,
      formato: '12oz',
      badge: null
    },
    {
      titulo: 'Tramo 2 - Frecuente',
      rango: `${PRICING_CONFIG.UMBRAL_TIER2} - ${PRICING_CONFIG.UMBRAL_TIER3 - 1} uds`,
      precio: PRICING_CONFIG.PRECIO_12OZ_TIER2,
      ahorro: PRICING_CONFIG.PRECIO_12OZ_TIER1 - PRICING_CONFIG.PRECIO_12OZ_TIER2,
      formato: '12oz',
      badge: null
    },
    {
      titulo: 'Tramo 3 - Mayorista',
      rango: `${PRICING_CONFIG.UMBRAL_TIER3}+ uds`,
      precio: PRICING_CONFIG.PRECIO_12OZ_TIER3,
      ahorro: PRICING_CONFIG.PRECIO_12OZ_TIER2 - PRICING_CONFIG.PRECIO_12OZ_TIER3,
      formato: '12oz',
      badge: 'Mejor precio'
    }
  ];

  const tramos9oz = [
    {
      titulo: 'Tramo 1 - Inicial',
      rango: `${PRICING_CONFIG.MINIMO_PEDIDO} - ${PRICING_CONFIG.UMBRAL_TIER2 - 1} uds`,
      precio: PRICING_CONFIG.PRECIO_9OZ_TIER1,
      ahorro: null,
      formato: '9oz',
      badge: null
    },
    {
      titulo: 'Tramo 2 - Frecuente',
      rango: `${PRICING_CONFIG.UMBRAL_TIER2} - ${PRICING_CONFIG.UMBRAL_TIER3 - 1} uds`,
      precio: PRICING_CONFIG.PRECIO_9OZ_TIER2,
      ahorro: PRICING_CONFIG.PRECIO_9OZ_TIER1 - PRICING_CONFIG.PRECIO_9OZ_TIER2,
      formato: '9oz',
      badge: null
    },
    {
      titulo: 'Tramo 3 - Mayorista',
      rango: `${PRICING_CONFIG.UMBRAL_TIER3}+ uds`,
      precio: PRICING_CONFIG.PRECIO_9OZ_TIER3,
      ahorro: PRICING_CONFIG.PRECIO_9OZ_TIER2 - PRICING_CONFIG.PRECIO_9OZ_TIER3,
      formato: '9oz',
      badge: 'Mejor precio'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Precios Mayoristas
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Descuentos progresivos por volumen. Mejores precios para socios comerciales frecuentes.
          </p>
              {/* Imágenes alineadas con las tablas, sin nombres y con mínimo espaciado */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:gap-6 max-w-5xl mx-auto">
                <div className="flex justify-center">
                  <img
                    src="/images/vaso-12oz.png"
                    alt="Formato 12oz"
                    className="h-[110px] w-auto drop-shadow-lg transition-transform duration-300 ease-in-out hover:scale-110 hover:drop-shadow-2xl"
                    loading="lazy"
                  />
                </div>
                <div className="flex justify-center">
                  <img
                    src="/images/vaso-9oz.png"
                    alt="Formato 9oz"
                    className="h-[110px] w-auto drop-shadow-lg transition-transform duration-300 ease-in-out hover:scale-110 hover:drop-shadow-2xl"
                    loading="lazy"
                  />
                </div>
              </div>
        </div>

        {/* Tarjetas de precios por formato */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:gap-6 max-w-5xl mx-auto">
          {/* Tarjeta Formato 12oz */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden border-2 border-primary-200">
            {/* Encabezado 12oz */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm sm:text-base lg:text-lg font-bold">12</span>
                </div>
                <div className="text-center">
                  <h3 className="text-sm sm:text-lg lg:text-xl font-bold">Formato 12oz</h3>
                  <p className="text-xs sm:text-sm text-primary-100 hidden sm:block">Tamaño premium</p>
                </div>
              </div>
            </div>

            {/* Precios 12oz */}
            <div className="divide-y divide-gray-200">
              {[
                { index: 0, titulo: 'Tramo 1', rango: '6-14 uds', badge: null },
                { index: 1, titulo: 'Tramo 2', rango: '15-19 uds', badge: null },
                { index: 2, titulo: 'Tramo 3', rango: '20+ uds', badge: 'Mejor precio' }
              ].map(({ index, titulo, rango, badge }) => (
                <div key={index} className={`p-2 sm:p-4 lg:p-5 transition-all duration-200 hover:bg-gray-50 ${index === 2 ? 'bg-green-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1 mb-1">
                        <h4 className="font-bold text-xs sm:text-sm lg:text-base text-gray-800 truncate">{titulo}</h4>
                        {badge && (
                          <span className="bg-green-500 text-white text-xs px-1 py-0.5 rounded-full font-medium hidden sm:inline">
                            ⭐
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">{rango}</p>
                      {tramos12oz[index].ahorro && (
                        <p className="text-xs text-green-600 font-semibold mt-1 hidden sm:block">
                          ¡Ahorras ${tramos12oz[index].ahorro?.toLocaleString('es-CL')}!
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-1">
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-600">
                        ${tramos12oz[index].precio.toLocaleString('es-CL')}
                      </div>
                      <div className="text-xs text-gray-500 hidden sm:block">por unidad</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tarjeta Formato 9oz */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden border-2 border-secondary-200">
            {/* Encabezado 9oz */}
            <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 text-white p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm sm:text-base lg:text-lg font-bold">9</span>
                </div>
                <div className="text-center">
                  <h3 className="text-sm sm:text-lg lg:text-xl font-bold">Formato 9oz</h3>
                  <p className="text-xs sm:text-sm text-secondary-100 hidden sm:block">Tamaño personal</p>
                </div>
              </div>
            </div>

            {/* Precios 9oz */}
            <div className="divide-y divide-gray-200">
              {[
                { index: 0, titulo: 'Tramo 1', rango: '6-14 uds', badge: null },
                { index: 1, titulo: 'Tramo 2', rango: '15-19 uds', badge: null },
                { index: 2, titulo: 'Tramo 3', rango: '20+ uds', badge: 'Mejor precio' }
              ].map(({ index, titulo, rango, badge }) => (
                <div key={index} className={`p-2 sm:p-4 lg:p-5 transition-all duration-200 hover:bg-gray-50 ${index === 2 ? 'bg-green-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1 mb-1">
                        <h4 className="font-bold text-xs sm:text-sm lg:text-base text-gray-800 truncate">{titulo}</h4>
                        {badge && (
                          <span className="bg-green-500 text-white text-xs px-1 py-0.5 rounded-full font-medium hidden sm:inline">
                            ⭐
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">{rango}</p>
                      {tramos9oz[index].ahorro && (
                        <p className="text-xs text-green-600 font-semibold mt-1 hidden sm:block">
                          ¡Ahorras ${tramos9oz[index].ahorro?.toLocaleString('es-CL')}!
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-1">
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-secondary-600">
                        ${tramos9oz[index].precio.toLocaleString('es-CL')}
                      </div>
                      <div className="text-xs text-gray-500 hidden sm:block">por unidad</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nota sobre pedido mínimo */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 bg-accent-100 px-6 py-3 rounded-full">
            <span className="text-accent-600">📦</span>
            <span className="text-accent-700 font-medium">
              Pedido mínimo: {PRICING_CONFIG.MINIMO_PEDIDO} unidades (puedes combinar sabores y formatos)
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

interface PricingCardProps {
  titulo: string;
  rango: string;
  precio: number;
  ahorro: number | null;
  badge: string | null;
  colorClass: string;
  accentColor: string;
  badgeColor: string;
}

function PricingCard({ 
  titulo, 
  rango, 
  precio, 
  ahorro, 
  badge, 
  colorClass, 
  accentColor, 
  badgeColor 
}: PricingCardProps) {
  return (
    <div className={`relative bg-white border-2 rounded-xl p-4 transition-all duration-300 hover:shadow-lg ${colorClass}`}>
      {badge && (
        <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full z-10`}>
          {badge}
        </div>
      )}
      
      <div className="flex items-center justify-between">
        {/* Información del tramo */}
        <div className="flex-1">
          <h4 className={`text-base font-semibold mb-1 ${accentColor}`}>
            {titulo}
          </h4>
          <div className="text-sm text-gray-600 mb-2">{rango}</div>
          
          {ahorro && (
            <div className="inline-flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
              <span>💰</span>
              <span>Ahorras ${ahorro.toLocaleString('es-CL')}</span>
            </div>
          )}
        </div>
        
        {/* Precio */}
        <div className="text-right ml-4">
          <div className="text-2xl font-bold text-gray-800">
            ${precio.toLocaleString('es-CL')}
          </div>
          <div className="text-xs text-gray-500">por unidad</div>
        </div>
      </div>
    </div>
  );
}