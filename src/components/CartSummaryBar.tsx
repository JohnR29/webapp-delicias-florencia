
import { useState, useRef, useEffect } from 'react';

export default function CartSummaryBar({
  cartState,
  productosSeleccionados,
  clearCart
}: {
  cartState: any;
  productosSeleccionados: Array<{ producto: any; cantidad: number }>;
  clearCart: () => void;
}) {
  const [showResumen, setShowResumen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Cerrar con Escape
  useEffect(() => {
    if (!showResumen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowResumen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showResumen]);

  if (cartState.totalCantidad === 0) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <div className="bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-3 flex gap-4 items-center pointer-events-auto animate-fade-in">
        <button
          className="bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg px-4 py-2 text-sm transition-all"
          onClick={() => setShowResumen(true)}
        >
          Ver resumen
        </button>
        <button
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg px-4 py-2 text-sm transition-all"
          onClick={clearCart}
        >
          Limpiar pedido
        </button>
      </div>
      {/* Modal resumen */}
      {showResumen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in"
          tabIndex={-1}
          onClick={() => setShowResumen(false)}
        >
          <div
            ref={modalRef}
            className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowResumen(false)}
              aria-label="Cerrar"
              tabIndex={0}
              autoFocus
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-4 text-gray-800">Resumen del pedido</h3>
            <ul className="mb-4 max-h-60 overflow-y-auto divide-y divide-gray-100">
              {Object.entries(
                productosSeleccionados.reduce((acc, { producto, cantidad }) => {
                  if (!acc[producto.nombre]) acc[producto.nombre] = [];
                  acc[producto.nombre].push({ formato: producto.formato, cantidad, precio: producto.precio });
                  return acc;
                }, {} as Record<string, Array<{ formato: string; cantidad: number; precio: number }>>)
              ).map(([nombre, formatos], idx, arr) => (
                <li key={nombre} className={"py-2 text-gray-700 " + (idx < arr.length - 1 ? 'border-b' : '')}>
                  {formatos.length === 1 ? (
                    <>
                      <div className="font-semibold mb-1">{nombre} <span className="text-gray-500">({formatos[0].formato})</span></div>
                      <div className="flex items-center text-sm ml-2">
                        <span className="text-gray-500">- {formatos[0].formato}:</span>
                        <span className="font-bold ml-1">x{formatos[0].cantidad}</span>
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="tabular-nums">${(formatos[0].cantidad * formatos[0].precio).toLocaleString('es-CL')}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-semibold mb-1">{nombre}</div>
                      <ul className="ml-2">
                        {formatos.map(f => (
                          <li key={f.formato} className="flex items-center text-sm mb-1">
                            <span className="text-gray-500">- {f.formato}:</span>
                            <span className="font-bold ml-1">x{f.cantidad}</span>
                            <span className="mx-2 text-gray-300">|</span>
                            <span className="tabular-nums">${(f.cantidad * f.precio).toLocaleString('es-CL')}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </li>
              ))}
            </ul>
            <div className="border-t pt-3 mt-2">
              <span className="flex justify-end font-bold text-lg text-gray-800">Total: ${cartState.totalMonto.toLocaleString('es-CL')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
