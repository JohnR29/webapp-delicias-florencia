'use client';
import dynamic from 'next/dynamic';
const MobileCartBar = dynamic(() => import('@/components/MobileCartBar'), { ssr: false });

export default function ClientScrollToCart({ cartState, cumpleMinimoMayorista }: any) {
  return (
    <MobileCartBar
      cartState={cartState}
      cumpleMinimoMayorista={cumpleMinimoMayorista}
      onOpenCart={() => {
        const cotizarElement = document.getElementById('cotizar');
        if (cotizarElement) {
          cotizarElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }}
    />
  );
}
