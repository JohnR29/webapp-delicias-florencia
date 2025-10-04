
"use client";



// Badge animado para comuna
interface AnimatedComunaBadgeProps {
  nombre: string;
  delay?: number;
}

function AnimatedComunaBadge({ nombre, delay = 0 }: AnimatedComunaBadgeProps) {
  // Abre el tooltip del mapa al hacer click/tap/enter
  const handleClick = () => {
    if (typeof window !== 'undefined' && (window as any).openComunaTooltip) {
      (window as any).openComunaTooltip(nombre);
    }
  };
  return (
    <button
      type="button"
      className={
        `relative inline-flex items-center px-4 py-2 rounded-full bg-accent-100 border border-accent-300 text-accent-800 font-semibold text-sm shadow-sm transition-all overflow-hidden min-w-[110px] group
        hover:bg-accent-200 hover:ring-2 hover:ring-accent-400 focus:bg-accent-200 focus:ring-2 focus:ring-accent-400`
      }
      style={{ touchAction: 'manipulation', transitionDelay: `${delay}ms` }}
      onClick={handleClick}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      tabIndex={0}
    >
      <span
        className="absolute left-2 top-1/2 -translate-y-1/2 text-lg"
        style={{ willChange: 'transform' }}
      >🚚</span>
      <span
        className="block w-full text-center"
        style={{ minWidth: 60, marginLeft: 32 }}
      >
        {nombre}
      </span>
    </button>
  );
}


import ClientHeader from '@/components/ClientHeader';
import Banner from '@/components/Banner';
import ClientCoverageMap from '@/components/ClientCoverageMap';
import PricingTiers from '@/components/PricingTiers';
import ProductCard from '@/components/ProductCard';
import ClientContactForm from '@/components/ClientContactForm';
import ClientScrollToCart from '@/components/ClientScrollToCart';
import MobileCartBar from '@/components/MobileCartBar';
import { useCart } from '@/hooks/useCart';
import { saboresData, saboresUnicos } from '@/data/productos';
import { useState, useEffect, useRef } from 'react';
import AddressManager from '@/components/AddressManager';

import { Address } from '@/hooks/useAddresses';


export default function ClientOnlyPage() {
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
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

  // Handler para autocompletar el formulario con la dirección seleccionada
  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
    // Scroll al formulario de cotización
    const el = document.getElementById('cotizar');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      
      <ClientHeader />
      <Banner />
      {/* Hero Section */}
      <section id="inicio" className="py-8 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Tu Socio Comercial en Repostería
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4 leading-relaxed">
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
      {/* Coverage Information */}
      <section id="cobertura" className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Zonas de Distribución
            </h2>
            <p className="text-lg text-gray-600">
              Rutas de entrega programadas para tu negocio
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8 mb-6">
            <div className="animate-fade-in">
              <ClientCoverageMap className="h-96 shadow-lg" />
            </div>
            <div className="flex flex-col justify-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-2xl font-semibold mb-4 text-primary-700">Cobertura actual</h3>
              <div className="flex flex-wrap gap-3 justify-center mb-4">
                {['San Bernardo', 'La Pintana', 'El Bosque', 'La Cisterna'].map((comuna, idx) => (
                  <AnimatedComunaBadge key={comuna} nombre={comuna} delay={idx * 100} />
                ))}
              </div>


              <p className="text-gray-500 text-sm text-center">¿Tu comuna no aparece? <span className="text-primary-600 font-semibold">¡Contáctanos</span> para evaluar nuevas rutas!</p>
            </div>
          </div>
        </div>
      </section>
      {/* Pricing Tiers */}
      <section id="precios" className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <PricingTiers tierActual={tierActual} unidadesHastaSiguienteTier={unidadesHastaSiguienteTier} />
        </div>
      </section>
      {/* Product Catalog */}
      <section id="catalogo" className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Catálogo de Tortas</h2>
            <p className="text-lg text-gray-600">Elige los sabores y formatos para tu negocio</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {saboresUnicos.map((sabor) => (
              <ProductCard
                key={sabor.key}
                sabor={sabor}
                items={items}
                total12oz={cartState.total12oz}
                total9oz={cartState.total9oz}
                onUpdateQuantity={updateQuantity}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="cotizar" className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto animate-fade-in">
            <ClientContactForm
              cartState={cartState}
              productosSeleccionados={productosSeleccionados}
              clearCart={clearCart}
              selectedAddress={selectedAddress}
            />
          </div>
        </div>
      </section>
  {/* Footer */}
  <footer className="bg-gray-900 text-white py-6 mt-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-4">
            <div className="text-center md:text-left animate-fade-in">
              <h4 className="font-semibold mb-4">Contacto</h4>
              <p>Email: <a href="mailto:johnrojas297@gmail.com" className="underline">johnrojas297@gmail.com</a></p>
              <p>WhatsApp: <a href="https://wa.me/56912345678" className="underline">+56 9 1234 5678</a></p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <h4 className="font-semibold mb-4">Entregas</h4>
              <div className="space-y-2 text-gray-300">
                <p>Rutas programadas: Lunes y Viernes</p>
                <p>Pedidos con 48 horas de anticipación</p>
              </div>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <p>&copy; 2025 Delicias Florencia. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
      {/* Barra flotante móvil */}
      <ClientScrollToCart
        cartState={cartState}
        cumpleMinimoMayorista={cumpleMinimoMayorista}
      />
      {/* Barra flotante móvil con detalle expandible */}
      <MobileCartBar
        cartState={cartState}
        cumpleMinimoMayorista={cumpleMinimoMayorista}
        onOpenCart={() => {
          const el = document.getElementById('cotizar');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}
        productosSeleccionados={productosSeleccionados}
        clearCart={clearCart}
      />
    </main>
  );
}