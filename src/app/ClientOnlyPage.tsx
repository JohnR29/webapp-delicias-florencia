"use client";

import ClientHeaderPublico from '@/components/ClientHeaderPublico';
import Banner from '@/components/Banner';
import { saboresUnicos } from '@/data/productos';
import MapaDistribuidoresIndividual from '@/components/MapaDistribuidoresIndividual';
import { useSociosDistribuidores } from '@/hooks/useSociosDistribuidores';

export default function ClientOnlyPage() {
  const { socios, loading, error } = useSociosDistribuidores();

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      
      <ClientHeaderPublico />
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
                <div className="aspect-w-16 aspect-h-12 bg-gray-100">
                  <img 
                    src={sabor.imagen} 
                    alt={sabor.nombre}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {sabor.nombre}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    {sabor.descripcion}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Tamaños: Personal y Familiar</span>
                    <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-medium">
                      ⭐ Favorita
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Información adicional */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-3">🍰</div>
              <h3 className="font-semibold text-gray-800 mb-2">Siempre Frescas</h3>
              <p className="text-gray-600 text-sm">Tortas preparadas diariamente con ingredientes frescos</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-3">👨‍🍳</div>
              <h3 className="font-semibold text-gray-800 mb-2">100% Artesanal</h3>
              <p className="text-gray-600 text-sm">Elaboradas a mano con recetas tradicionales</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-3">⭐</div>
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
                <MapaDistribuidoresIndividual socios={socios} />
              )}
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-3">🍰</div>
              <h3 className="font-semibold text-gray-800 mb-2">Siempre Frescas</h3>
              <p className="text-gray-600 text-sm">Tortas preparadas diariamente con ingredientes frescos</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-3">👨‍🍳</div>
              <h3 className="font-semibold text-gray-800 mb-2">100% Artesanal</h3>
              <p className="text-gray-600 text-sm">Elaboradas a mano con recetas tradicionales</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-3">⭐</div>
              <h3 className="font-semibold text-gray-800 mb-2">Calidad Premium</h3>
              <p className="text-gray-600 text-sm">Solo los mejores ingredientes en cada torta</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Única para Socios Distribuidores */}
      <section id="socios-distribuidores" className="py-16 bg-gradient-to-br from-secondary-50 to-accent-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Header de la sección */}
            <div className="mb-12">
              <div className="text-5xl mb-6">🥤</div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                ¿Tienes una Tienda, Cafetería o Restaurante?
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed mb-8">
                Somos <strong>distribuidores mayoristas especializados en tortas en vasos artesanales</strong>. 
                Únete a nuestra red exclusiva de socios y transforma tu negocio ofreciendo el formato 
                más innovador, práctico e higiénico de tortas de la región.
              </p>
            </div>

            {/* Beneficios destacados */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="text-3xl mb-4">💰</div>
                <h3 className="font-bold text-gray-800 mb-2">Precios Mayoristas</h3>
                <p className="text-gray-600 text-sm">Hasta 40% de descuento en todos nuestros productos</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="text-3xl mb-4">🚚</div>
                <h3 className="font-bold text-gray-800 mb-2">Entregas Programadas</h3>
                <p className="text-gray-600 text-sm">Rutas fijas lunes y viernes, siempre puntual</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="text-3xl mb-4">🥤</div>
                <h3 className="font-bold text-gray-800 mb-2">Formato Innovador</h3>
                <p className="text-gray-600 text-sm">Tortas en vasos: prácticas, higiénicas y perfectas para tu negocio</p>
              </div>
            </div>

            {/* CTA Principal */}
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Conviértete en Socio Distribuidor de Tortas en Vasos
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Accede a nuestra plataforma exclusiva de distribución mayorista, precios preferenciales 
                y soporte personalizado. Impulsa las ventas de tu negocio con el formato más innovador: 
                <strong>tortas en vasos artesanales</strong>.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/registro" 
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-secondary-600 to-secondary-700 text-white rounded-lg hover:from-secondary-700 hover:to-secondary-800 transition-all font-bold text-lg shadow-lg transform hover:scale-105"
                >
                  🚀 Quiero ser Socio
                  <span className="ml-2">→</span>
                </a>
                <a 
                  href="/login" 
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-secondary-600 border-2 border-secondary-600 rounded-lg hover:bg-secondary-50 transition-colors font-semibold text-lg"
                >
                  🔑 Ya soy Socio
                </a>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-secondary-600 mb-1">50+</div>
                <div className="text-gray-600 text-sm">Socios Distribuidores</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-secondary-600 mb-1">100%</div>
                <div className="text-gray-600 text-sm">Productos Frescos</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-secondary-600 mb-1">5⭐</div>
                <div className="text-gray-600 text-sm">Calidad Garantizada</div>
              </div>
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
                <p>Email: <a href="mailto:johnrojas297@gmail.com" className="text-primary-300 hover:underline">johnrojas297@gmail.com</a></p>
                <p>WhatsApp: <a href="https://wa.me/56912345678" className="text-primary-300 hover:underline">+56 9 1234 5678</a></p>
              </div>
            </div>
            <div className="text-center">
              <h4 className="font-semibold mb-4 text-lg">Entregas</h4>
              <div className="space-y-2 text-gray-300">
                <p>Rutas programadas: Lunes y Viernes</p>
                <p>Pedidos con 48 horas de anticipación</p>
                <p>Cobertura: San Bernardo y alrededores</p>
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
            <p>&copy; 2025 Delicias Florencia. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}