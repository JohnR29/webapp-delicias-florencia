'use client';

import dynamic from 'next/dynamic';
import { useCart } from '@/hooks/useCart';
import { saboresData } from '@/data/productos';
const MobileCartBar = dynamic(() => import('@/components/MobileCartBar'), { ssr: false });

export default function ClientScrollToCart({ cartState, cumpleMinimoMayorista }: any) {
  // Usar useCart para obtener productosSeleccionados y clearCart
  const { productosSeleccionados, clearCart } = useCart(saboresData);
  return (
    <MobileCartBar
      cartState={cartState}
      cumpleMinimoMayorista={cumpleMinimoMayorista}
      productosSeleccionados={productosSeleccionados}
      clearCart={clearCart}
      onOpenCart={() => {
        const cotizarElement = document.getElementById('cotizar');
        if (cotizarElement) {
          cotizarElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }}
    />
  );
}
