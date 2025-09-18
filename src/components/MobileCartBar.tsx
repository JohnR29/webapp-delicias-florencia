'use client';

import { CartState } from '@/lib/types';

interface MobileCartBarProps {
  cartState: CartState;
  cumpleMinimoMayorista: boolean;
  onOpenCart: () => void;
}

export default function MobileCartBar({ 
  cartState, 
  cumpleMinimoMayorista, 
  onOpenCart 
}: MobileCartBarProps) {
  const isVisible = cartState.totalCantidad > 0;

  if (!isVisible) return null;

  return (
    <>
      {/* Espacio para evitar que la barra tape contenido */}
      <div className="h-20 md:hidden" />
      
      {/* Barra flotante móvil */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-50 md:hidden">
        <div className="flex items-center justify-between p-4">
          {/* Información del total */}
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div className="text-lg font-bold text-gray-800">
                {cartState.totalCantidad} uds
              </div>
              <div className="w-1 h-6 bg-gray-300"></div>
              <div className="text-lg font-bold text-primary-600">
                ${cartState.totalMonto.toLocaleString('es-CL')}
              </div>
            </div>
            
            {!cumpleMinimoMayorista && (
              <div className="text-xs text-gray-500 mt-1">
                Mínimo 6 unidades para mayorista
              </div>
            )}
          </div>

          {/* Botón de solicitar */}
          <button
            onClick={onOpenCart}
            disabled={!cumpleMinimoMayorista}
            className={`px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 touch-target ${
              cumpleMinimoMayorista
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 active:scale-95'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {cumpleMinimoMayorista ? 'Solicitar' : 'Mínimo 6'}
          </button>
        </div>
      </div>
    </>
  );
}