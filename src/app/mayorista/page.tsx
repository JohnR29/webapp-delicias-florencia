"use client";

import ClientOnly from '@/components/ClientOnly';
import HeaderMayorista from '@/components/HeaderMayorista';
import BannerMayorista from '@/components/BannerMayorista';
import PricingTiers from '@/components/PricingTiers';
import ProductCard from '@/components/ProductCard';
import ClientContactForm from '@/components/ClientContactForm';
import ClientCoverageMap from '@/components/ClientCoverageMap';
import MobileCartBar from '@/components/MobileCartBar';
import ClientScrollToCart from '@/components/ClientScrollToCart';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { saboresData, saboresUnicos } from '@/data/productos';
import { useAddresses } from '@/hooks/useAddresses';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MayoristaPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const {
    items,
    cartState,
    updateQuantity,
    clearCart,
    cumpleMinimoMayorista,
    tierActual,
    unidadesHastaSiguienteTier,
    productosSeleccionados
  } = useCart(saboresData);

  const { addresses, loading: addressesLoading } = useAddresses(user?.id || '');
  
  // For now, use the first address as selected (you can enhance this later)
  const selectedAddress = addresses.length > 0 ? addresses[0] : null;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/mayorista');
    }
  }, [user, authLoading, router]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return null;
  }

  return (
    <ClientOnly>
      <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        
        <HeaderMayorista />
        <BannerMayorista />
        
        {/* Welcome Section */}
        <section className="py-6 bg-pink-100">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Bienvenido,
              </h2>
              <p className="text-lg md:text-xl text-gray-700">
                {user.email}
              </p>
            </div>
          </div>
        </section>

        {/* Coverage Information */}
        <section id="cobertura" className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-6 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Rutas de Distribución
              </h2>
              <p className="text-lg text-gray-600">
                Zonas de entrega programadas para tu negocio
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
                    <div key={comuna} className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium animate-bounce" style={{ animationDelay: `${idx * 0.1}s` }}>
                      {comuna}
                    </div>
                  ))}
                </div>
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
                <p className="text-gray-500 text-sm text-center mt-4">¿Tu comuna no aparece? <span className="text-primary-600 font-semibold">¡Contáctanos</span> para evaluar nuevas rutas!</p>
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
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Catálogo Mayorista</h2>
              <p className="text-lg text-gray-600">Elige los sabores y cantidades para tu pedido</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {saboresUnicos.map((sabor, index) => (
                <ProductCard
                  key={sabor.key}
                  sabor={sabor}
                  items={items}
                  total12oz={cartState.total12oz}
                  total9oz={cartState.total9oz}
                  onUpdateQuantity={updateQuantity}
                  priority={index <= 2}
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

        {/* Mobile Cart Bars */}
        <ClientScrollToCart
          cartState={cartState}
          cumpleMinimoMayorista={cumpleMinimoMayorista}
        />
        
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
    </ClientOnly>
  );
}