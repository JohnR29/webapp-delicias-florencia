import { useState } from 'react';
import { getPrecioUnitario } from '@/lib/types';

export default function MobileCartBarDetail({ productosSeleccionados, cartState, clearCart, onClose }: {
  productosSeleccionados: Array<{ producto: any; cantidad: number }>;
  cartState: any;
  clearCart: () => void;
  onClose: () => void;
}) {
  // Calcular precios correctos por formato
  const precio12oz = getPrecioUnitario(cartState.total12oz, '12oz');
  const precio9oz = getPrecioUnitario(cartState.total9oz, '9oz');
  return (
    <div className="fixed inset-0 z-50 flex items-end md:hidden">
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-2xl shadow-2xl p-6 max-h-[70vh] overflow-y-auto animate-slide-up">
        <button
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <h3 className="text-xl font-bold mb-4 text-gray-800">Resumen del pedido</h3>
        <ul className="mb-4 max-h-60 overflow-y-auto divide-y divide-gray-100">
          {Object.entries(
            productosSeleccionados.reduce((acc, { producto, cantidad }) => {
              // Extraer nombre base (sin formato ni paréntesis)
              const baseName = producto.nombre.replace(/\s*\(.*\)/, '').trim();
              if (!acc[baseName]) acc[baseName] = [];
              acc[baseName].push({ formato: producto.formato, cantidad });
              return acc;
            }, {} as Record<string, Array<{ formato: string; cantidad: number }>>)
          ).map(([baseName, formatos], idx, arr) => (
            <li key={baseName} className={"py-2 text-gray-700 " + (idx < arr.length - 1 ? 'border-b' : '')}>
              <div className="font-semibold mb-1">{baseName}</div>
              <ul className="ml-2">
                {formatos.map(f => {
                  const precioUnitario = f.formato === '12oz' ? precio12oz : precio9oz;
                  return (
                    <li key={f.formato} className="flex items-center text-sm mb-1">
                      <span className="text-gray-500">- {f.formato}:</span>
                      <span className="font-bold ml-1">x{f.cantidad}</span>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="tabular-nums">${(f.cantidad * precioUnitario).toLocaleString('es-CL')}</span>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
        <div className="border-t pt-3 mt-2">
          <span className="flex justify-end font-bold text-lg text-gray-800">Total: ${cartState.totalMonto.toLocaleString('es-CL')}</span>
        </div>
        <button
          className="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg px-4 py-2 text-sm transition-all"
          onClick={clearCart}
        >
          Limpiar pedido
        </button>
      </div>
    </div>
  );
}
