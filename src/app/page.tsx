'use client';

import { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import PricingTiers from '@/components/PricingTiers';
import MobileCartBar from '@/components/MobileCartBar';
import CoverageMap from '@/components/CoverageMap';
import ContactForm from '@/components/ContactForm';
import Header from '@/components/Header';
import Banner from '@/components/Banner';
import { useCart } from '@/hooks/useCart';
import { saboresData, saboresUnicos } from '@/data/productos';

export default function Home() {
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  
  const { 
    items, 
    cartState, 
    updateQuantity, 
    clearCart,
    cumpleMinimoMayorista,
    unidadesHastaSiguienteTier,
    tierActual,
    productosSeleccionados
  } = useCart(saboresData);

  const scrollToCart = () => {
    const cotizarElement = document.getElementById('cotizar');
    if (cotizarElement) {
      cotizarElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <Header />
      
      {/* Banner Section */}
      <Banner />
      
      {/* Hero Section - "Tu socio comercial en repostería" */}
      <section id="inicio" className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Tu Socio Comercial en Repostería
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Amplia tu oferta con nuestras tortas artesanales de alta rotación y excelente margen
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <span className="w-2 h-2 bg-primary-400 rounded-full"></span>
                <span>Productos artesanales</span>
              </div>
              <div className="flex items-center space-x-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <span className="w-2 h-2 bg-secondary-400 rounded-full"></span>
                <span>Entrega programada</span>
              </div>
              <div className="flex items-center space-x-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <span className="w-2 h-2 bg-accent-400 rounded-full"></span>
                <span>Precios mayoristas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage Information - Zona de distribución */}
      <section id="cobertura" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Zonas de Distribución
            </h2>
            <p className="text-lg text-gray-600">
              Rutas de entrega programadas para tu negocio
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Mapa de cobertura */}
            <div className="animate-fade-in">
              <CoverageMap className="h-96 shadow-lg" />
            </div>

            {/* Lista de comunas */}
            <div className="space-y-6">
              <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Comunas con entrega programada:</h3>
                
                {/* Información de entregas */}
                <div className="bg-accent-100 rounded-xl p-4 text-center mb-6">
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    <span className="text-2xl">📅</span>
                    <h4 className="text-lg font-semibold text-accent-800">Entregas Programadas</h4>
                  </div>
                  <p className="text-accent-600 font-medium">Lunes y Viernes</p>
                </div>

                {/* Lista de comunas en 2 columnas */}
                <div className="grid grid-cols-2 gap-3">
                  {['San Bernardo', 'La Pintana', 'El Bosque', 'La Cisterna'].map((comuna, index) => (
                    <div 
                      key={comuna} 
                      className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-3 flex items-center space-x-3 animate-slide-up hover:shadow-md transition-all duration-300"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm">🚚</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{comuna}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers - Precios */}
      <section id="precios">
        <PricingTiers />
      </section>

      {/* Product Catalog - Nuestra línea de productos */}
      <section id="catalogo" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Nuestra Línea de Productos
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tortas premium en formatos 12oz y 9oz con presentación única que atraen a tus clientes
            </p>
          </div>

          {/* Catálogo de productos */}
          <div className="space-y-6">
            {saboresUnicos.map((sabor, index) => (
              <div 
                key={sabor.key} 
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard
                  sabor={sabor}
                  items={items}
                  total12oz={cartState.total12oz}
                  total9oz={cartState.total9oz}
                  onUpdateQuantity={updateQuantity}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section - Formulario de pedido */}
      <section id="cotizar" className="py-16 bg-gradient-to-br from-gray-50 to-primary-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Hacer un Pedido
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Completa tus datos y el detalle de tu pedido. Te contactaremos para confirmar y coordinar la entrega
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="animate-slide-up">
              <ContactForm 
                cartState={cartState}
                productosSeleccionados={productosSeleccionados}
                clearCart={clearCart}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ¿Por qué elegir Delicias Florencia? */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              ¿Por qué elegir Delicias Florencia?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-6 animate-slide-up">
              <div className="flex items-start space-x-4">
                <span className="text-primary-500 text-2xl flex-shrink-0">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-2">Productos artesanales</h3>
                  <p className="text-gray-600">Tortas caseras de alta calidad con ingredientes premium</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <span className="text-primary-500 text-2xl flex-shrink-0">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-2">Entregas programadas</h3>
                  <p className="text-gray-600">Rutas fijas lunes y viernes para garantizar frescura</p>
                </div>
              </div>
            </div>
            <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-start space-x-4">
                <span className="text-primary-500 text-2xl flex-shrink-0">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-2">Precios competitivos</h3>
                  <p className="text-gray-600">Descuentos por volumen desde 6 unidades</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <span className="text-primary-500 text-2xl flex-shrink-0">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-2">Soporte comercial</h3>
                  <p className="text-gray-600">Asesoramiento personalizado para tu negocio</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Condiciones mayoristas */}
      <section className="py-16 bg-accent-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-accent-800 mb-4">
              Condiciones Mayoristas
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg animate-slide-up">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-accent-600 text-lg">📦</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">Pedido mínimo</h3>
                      <p className="text-gray-600 text-sm">6 unidades (puedes combinar sabores y formatos)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-accent-600 text-lg">💳</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">Pagos</h3>
                      <p className="text-gray-600 text-sm">Efectivo contra entrega o transferencia</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-accent-600 text-lg">📅</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">Pedidos</h3>
                      <p className="text-gray-600 text-sm">Con 48 horas de anticipación mínimo</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-accent-600 text-lg">🚚</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">Entregas</h3>
                      <p className="text-gray-600 text-sm">Lunes y Viernes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-16 safe-area-bottom">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-block bg-white rounded-2xl p-6 mb-6">
              <img 
                src="/images/logo-delicias-florencia.png" 
                alt="Logo Delicias Florencia" 
                className="w-24 h-24 mx-auto"
              />
            </div>
            <h3 className="font-dancing-script text-3xl text-primary-400 mb-4">Delicias Florencia</h3>
            <p className="text-gray-300 max-w-md mx-auto">
              Distribuidor mayorista de tortas artesanales en vaso para el canal tradicional
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">            
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <h4 className="font-semibold mb-4">Contacto Comercial</h4>
              <div className="space-y-2 text-gray-300">
                <p>📧 ventas@deliciasflorencia.cl</p>
                <p>📱 +56 9 XXXX XXXX</p>
                <p>📍 Región Metropolitana</p>
              </div>
            </div>
            
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <h4 className="font-semibold mb-4">Entregas</h4>
              <div className="space-y-2 text-gray-300">
                <p>Rutas programadas: Lunes y Viernes</p>
                <p>Pedidos con 48 horas de anticipación</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <p>&copy; 2024 Delicias Florencia. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Barra flotante móvil */}
      <MobileCartBar
        cartState={cartState}
        cumpleMinimoMayorista={cumpleMinimoMayorista}
        onOpenCart={scrollToCart}
      />
    </main>
  );
}