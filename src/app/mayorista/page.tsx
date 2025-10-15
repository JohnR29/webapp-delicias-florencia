"use client";

import ClientOnly from '@/components/ClientOnly';
import HeaderMayorista from '@/components/HeaderMayorista';
import BannerMayorista from '@/components/BannerMayorista';
import PricingTiers from '@/components/PricingTiers';
import ProductCard from '@/components/ProductCard';
import ClientContactForm from '@/components/ClientContactForm';
import ClientMapaCoberturaGoogleMayorista from '@/components/ClientMapaCoberturaGoogleMayorista';
import MobileCartBar from '@/components/MobileCartBar';
import ClientScrollToCart from '@/components/ClientScrollToCart';
import { UserStatusMessage } from '@/components/UserStatusMessage';
import { ApprovalNotification } from '@/components/ApprovalNotification';
import { UserDebugInfo } from '@/components/UserDebugInfo';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { saboresData, saboresUnicos } from '@/data/productos';
import { useAddresses } from '@/hooks/useAddresses';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaBolt, FaMapMarkerAlt, FaCheckCircle, FaStore } from 'react-icons/fa';

export default function MayoristaPage() {
  const { user, profile, loading: authLoading, isEmailVerified, isApproved } = useAuth();
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
      <ApprovalNotification />
      <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        
        <HeaderMayorista />
        <BannerMayorista />
        
        {/* Welcome Section */}
        <section className="py-6 bg-pink-100">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Bienvenido{profile?.nombre ? `, ${profile.nombre}` : ''}
              </h2>
            </div>
          </div>
        </section>

        {/* Coverage Information - Nuevo mapa de cobertura con Google Maps */}
        <section id="cobertura" className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Zonas de Distribución Mayorista
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                ¡Ampliamos nuestra cobertura! Despacho en la mayoría de las comunas de la RM.
              </p>
            </div>
            
            {/* Nuevo componente de mapa con Google Maps */}
            <div className="animate-fade-in">
              <ClientMapaCoberturaGoogleMayorista className="max-w-6xl mx-auto" />
            </div>

            {/* Información adicional */}
            <div className="mt-8 text-center">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  ¿Tu comuna no está en el mapa?
                </h3>
                <p className="text-blue-700 mb-4">
                  Contáctanos para evaluar nuevas rutas de distribución.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action - Registro de Punto de Venta (solo para usuarios aprobados) */}
        {isApproved && (
          <section className="py-8 bg-gradient-to-r from-orange-50 to-yellow-50">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-orange-200">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaStore className="text-4xl text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      ¿Ya tienes tu negocio listo?
                    </h3>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      ¡Registra tu local y deja que los clientes te encuentren fácilmente!
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="flex justify-center mb-2">
                        <FaBolt className="text-4xl text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">Proceso rápido</h4>
                      <p className="text-sm text-gray-600">Solo 5 minutos</p>
                    </div>
                    
                    <div className="text-center p-4 bg-blue-50 rounded-lg">  
                      <div className="flex justify-center mb-2">
                        <FaMapMarkerAlt className="text-4xl text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">Visibilidad</h4>
                      <p className="text-sm text-gray-600">Aparece en el mapa</p>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="flex justify-center mb-2">
                        <FaCheckCircle className="text-4xl text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">Aprobación</h4>
                      <p className="text-sm text-gray-600">24-48 horas</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <a
                      href="/registro-punto-venta"
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
                    >
                      Registrar mi punto de venta
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}


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
              <p className="text-lg text-gray-600">
                {isApproved ? 'Elige los sabores y cantidades para tu pedido' : 'Explora nuestros productos (compras disponibles después de la aprobación)'}
              </p>
            </div>
            
            {!isApproved && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
                <p className="text-amber-800">
                  <strong>📋 Catálogo de referencia:</strong> Estos productos estarán disponibles para compra una vez que tu cuenta sea aprobada.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {saboresUnicos.map((sabor, index) => (
                <ProductCard
                  key={sabor.key}
                  sabor={sabor}
                  items={items}
                  total12oz={cartState.total12oz}
                  total9oz={cartState.total9oz}
                  onUpdateQuantity={isApproved ? updateQuantity : () => {}}
                  priority={index <= 2}
                  disabled={!isApproved}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        {isApproved && (
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
        )}

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