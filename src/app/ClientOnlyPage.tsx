"use client";

import HeaderPublico from '@/components/HeaderPublico';
import Banner from '@/components/Banner';
import { saboresUnicos } from '@/data/productos';
import MapaDistribuidoresGoogle from '@/components/MapaDistribuidoresGoogle';
import CallToActionSocios from '@/components/CallToActionSocios';
import Image from 'next/image';
import { useSociosDistribuidores } from '@/hooks/useSociosDistribuidores';
import { FaUserTie, FaMedal, FaHeart } from 'react-icons/fa';
import { GiCakeSlice, GiChefToque } from 'react-icons/gi';

export default function ClientOnlyPage() {
  const { socios, loading, error } = useSociosDistribuidores();

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      
      <HeaderPublico />
      <Banner />

      {/* Catálogo de Productos */}
      <section id="productos" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Nuestras Deliciosas Tortas
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cada torta es preparada artesanalmente con ingredientes frescos y de la más alta calidad. 
              Perfectas para cualquier ocasión especial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {saboresUnicos.map((sabor, index) => (
              <div 
                key={sabor.nombre}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="bg-gray-100 relative h-48 overflow-hidden flex items-center justify-center">
                  <Image 
                    src={sabor.imagen} 
                    alt={sabor.nombre}
                    fill
                    className="object-scale-down"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index <= 2}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {sabor.nombre}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    {sabor.descripcion}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Información adicional */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                  <GiCakeSlice className="text-white text-4xl" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Siempre Frescas</h3>
              <p className="text-gray-600 text-sm">Tortas preparadas diariamente con ingredientes frescos</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center">
                  <GiChefToque className="text-white text-5xl" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">100% Artesanal</h3>
              <p className="text-gray-600 text-sm">Elaboradas a mano con recetas tradicionales</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center">
                  <FaMedal className="text-white text-5xl" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Calidad Premium</h3>
              <p className="text-gray-600 text-sm">Solo los mejores ingredientes en cada torta</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mapa de Distribuidores */}
      <section id="donde-comprar" className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              ¿Dónde Puedes Comprar Nuestras Tortas?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Encuentra la tienda más cercana donde puedes disfrutar de nuestras deliciosas tortas artesanales.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {loading ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-gray-500">Cargando puntos de venta...</div>
                </div>
              ) : error ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-red-500">Error al cargar los puntos de venta</div>
                </div>
              ) : (
                <MapaDistribuidoresGoogle socios={socios} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-secondary-600 mb-1">4+</div>
              <div className="text-gray-600 text-sm">Puntos de ventas registrados</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary-600 mb-1">100%</div>
              <div className="text-gray-600 text-sm">Productos Frescos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary-600 mb-1">⭐</div>
              <div className="text-gray-600 text-sm">Calidad Garantizada</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <div className="text-center md:text-left">
              <h4 className="font-semibold mb-4 text-lg">Contacto</h4>
              <div className="space-y-2">
                <p>Email: <a href="mailto:contacto@deliciasflorencia.cl" className="text-primary-300 hover:underline">contacto@deliciasflorencia.cl</a></p>
                <p>WhatsApp: <a href="https://wa.me/56959587663" className="text-primary-300 hover:underline">+56 9 5958 7663</a></p>
              </div>
            </div>
            <div className="text-center">
              <h4 className="font-semibold mb-4 text-lg">Entregas</h4>
              <div className="space-y-2 text-gray-300">
                <p>Rutas programadas:</p>
                <p>Pedidos sujeto a confirmación</p>
                <p>Cobertura: Región Metropolitana</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <h4 className="font-semibold mb-4 text-lg">Delicias Florencia</h4>
              <div className="space-y-2 text-gray-300">
                <p>Tortas en vasos artesanales</p>
                <p>Calidad premium</p>
                <p>Distribución mayorista</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-4 text-center text-gray-400">
            <p>&copy; 2025 Delicias Florencia.</p>
            <p>Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}