'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Product, ProductFormat } from '@/lib/types';
import { getPrecioUnitario } from '@/lib/types';

interface ProductCardProps {
  sabor: {
    key: string;
    nombre: string;
    ingredientes: string[];
    imagen: string;
    descripcion: string;
  };
  items: Record<string, number>;
  total12oz: number;
  total9oz: number;
  onUpdateQuantity: (productKey: string, cantidad: number) => void;
}

export default function ProductCard({ 
  sabor, 
  items, 
  total12oz, 
  total9oz, 
  onUpdateQuantity 
}: ProductCardProps) {

  const [imageError, setImageError] = useState(false);
  const [openMenu, setOpenMenu] = useState<null | ProductFormat>(null);
  const [customInput, setCustomInput] = useState<{ [key in ProductFormat]?: string }>({});
  const [inputError, setInputError] = useState<{ [key in ProductFormat]?: string }>({});


  const getQuantity = (formato: ProductFormat) => {
    return items[`${sabor.key}-${formato}`] || 0;
  };

  const handleMenuSelect = (formato: ProductFormat, value: number | 'custom') => {
    if (value === 'custom') {
      setOpenMenu(formato);
      setCustomInput((prev) => ({ ...prev, [formato]: '' }));
      setInputError((prev) => ({ ...prev, [formato]: '' }));
    } else {
      setOpenMenu(null);
      onUpdateQuantity(`${sabor.key}-${formato}`, value);
    }
  };

  const handleCustomInputChange = (formato: ProductFormat, val: string) => {
    // Solo permitir números enteros positivos
    if (/^\d*$/.test(val)) {
      setCustomInput((prev) => ({ ...prev, [formato]: val }));
      setInputError((prev) => ({ ...prev, [formato]: '' }));
    }
  };

  const handleCustomInputSubmit = (formato: ProductFormat) => {
    const val = customInput[formato];
    const num = Number(val);
    if (!val || isNaN(num) || num <= 0 || !Number.isInteger(num)) {
      setInputError((prev) => ({ ...prev, [formato]: 'Ingrese un número entero positivo' }));
      return;
    }
    setOpenMenu(null);
    onUpdateQuantity(`${sabor.key}-${formato}`, num);
  };

  const incrementQuantity = (formato: ProductFormat) => {
    const productKey = `${sabor.key}-${formato}`;
    const currentQuantity = getQuantity(formato);
    onUpdateQuantity(productKey, currentQuantity + 1);
  };

  const decrementQuantity = (formato: ProductFormat) => {
    const productKey = `${sabor.key}-${formato}`;
    const currentQuantity = getQuantity(formato);
    if (currentQuantity > 0) {
      onUpdateQuantity(productKey, currentQuantity - 1);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 transition-all duration-300 hover:shadow-xl">
      <div className="flex flex-col">
        {/* Título del producto - ocupa todo el ancho */}
        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          {sabor.nombre}
        </h3>

        {/* Fila media: Imagen e Ingredientes */}
        <div className="flex gap-6 mb-4">
          {/* Imagen del producto */}
          <div className="w-32 h-32 relative rounded-xl overflow-hidden shadow-md flex-shrink-0">
            {!imageError ? (
              <Image
                src={sabor.imagen}
                alt={`${sabor.nombre} - Torta artesanal`}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                sizes="128px"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl mb-1">🍰</div>
                  <div className="text-xs text-gray-600">{sabor.nombre}</div>
                </div>
              </div>
            )}
          </div>

          {/* Ingredientes */}
          <div className="flex-1">
            <h4 className="font-semibold text-gray-700 mb-2 text-sm">Ingredientes:</h4>
            <ul className="space-y-1">
              {sabor.ingredientes.map((ingrediente, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="mr-2 mt-1.5">•</span>
                  {ingrediente}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Fila inferior: Controles de formato que ocupan todo el ancho */}
        <div className="flex gap-3">
          {/* Formato 12oz */}
          <div className="bg-gray-50 rounded-lg p-2 flex-1 min-w-0">
            <div className="text-center mb-2">
              <div className="font-bold text-gray-800 text-base">12oz</div>
              {/* Precio eliminado */}
            </div>
            <div className="flex items-center justify-center gap-2 relative">
              <button
                onClick={() => decrementQuantity('12oz')}
                disabled={getQuantity('12oz') === 0}
                className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 
                         flex items-center justify-center text-gray-700 font-bold
                         transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                aria-label="Restar 12oz"
              >
                −
              </button>
              <span
                className="min-w-[1.5rem] text-center font-bold text-gray-800 tabular-nums text-lg cursor-pointer border-b border-dotted border-gray-400 hover:text-red-500"
                onClick={() => setOpenMenu(openMenu === '12oz' ? null : '12oz')}
                tabIndex={0}
                role="button"
                aria-label="Seleccionar cantidad 12oz"
              >
                {getQuantity('12oz')}
              </span>
              <button
                onClick={() => incrementQuantity('12oz')}
                className="w-7 h-7 rounded bg-red-500 hover:bg-red-600 
                         flex items-center justify-center text-white font-bold
                         transition-all duration-200 text-base"
                aria-label="Agregar 12oz"
              >
                +
              </button>
              {/* Menú desplegable */}
              {openMenu === '12oz' && (
                <div className="absolute z-20 top-10 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-32 animate-fade-in">
                  {[5, 10, 15, 20].map((opt) => (
                    <button
                      key={opt}
                      className="block w-full text-left px-3 py-1.5 rounded hover:bg-red-100 text-gray-800 text-sm"
                      onClick={() => handleMenuSelect('12oz', opt)}
                    >
                      {opt}
                    </button>
                  ))}
                  <button
                    className="block w-full text-left px-3 py-1.5 rounded hover:bg-red-100 text-gray-800 text-sm"
                    onClick={() => handleMenuSelect('12oz', 'custom')}
                  >
                    Personalizado
                  </button>
                  {customInput['12oz'] !== undefined && (
                    <div className="mt-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                        placeholder="Cantidad"
                        value={customInput['12oz']}
                        onChange={e => handleCustomInputChange('12oz', e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleCustomInputSubmit('12oz'); }}
                        autoFocus
                      />
                      <button
                        className="mt-1 w-full bg-red-500 text-white rounded px-2 py-1 text-xs hover:bg-red-600"
                        onClick={() => handleCustomInputSubmit('12oz')}
                      >
                        Aceptar
                      </button>
                      {inputError['12oz'] && <div className="text-xs text-red-500 mt-1">{inputError['12oz']}</div>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Formato 9oz */}
          <div className="bg-gray-50 rounded-lg p-2 flex-1 min-w-0">
            <div className="text-center mb-2">
              <div className="font-bold text-gray-800 text-base">9oz</div>
              {/* Precio eliminado */}
            </div>
            <div className="flex items-center justify-center gap-2 relative">
              <button
                onClick={() => decrementQuantity('9oz')}
                disabled={getQuantity('9oz') === 0}
                className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 
                         flex items-center justify-center text-gray-700 font-bold
                         transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                aria-label="Restar 9oz"
              >
                −
              </button>
              <span
                className="min-w-[1.5rem] text-center font-bold text-gray-800 tabular-nums text-lg cursor-pointer border-b border-dotted border-gray-400 hover:text-red-500"
                onClick={() => setOpenMenu(openMenu === '9oz' ? null : '9oz')}
                tabIndex={0}
                role="button"
                aria-label="Seleccionar cantidad 9oz"
              >
                {getQuantity('9oz')}
              </span>
              <button
                onClick={() => incrementQuantity('9oz')}
                className="w-7 h-7 rounded bg-red-500 hover:bg-red-600 
                         flex items-center justify-center text-white font-bold
                         transition-all duration-200 text-base"
                aria-label="Agregar 9oz"
              >
                +
              </button>
              {/* Menú desplegable */}
              {openMenu === '9oz' && (
                <div className="absolute z-20 top-10 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-32 animate-fade-in">
                  {[5, 10, 15, 20].map((opt) => (
                    <button
                      key={opt}
                      className="block w-full text-left px-3 py-1.5 rounded hover:bg-red-100 text-gray-800 text-sm"
                      onClick={() => handleMenuSelect('9oz', opt)}
                    >
                      {opt}
                    </button>
                  ))}
                  <button
                    className="block w-full text-left px-3 py-1.5 rounded hover:bg-red-100 text-gray-800 text-sm"
                    onClick={() => handleMenuSelect('9oz', 'custom')}
                  >
                    Personalizado
                  </button>
                  {customInput['9oz'] !== undefined && (
                    <div className="mt-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                        placeholder="Cantidad"
                        value={customInput['9oz']}
                        onChange={e => handleCustomInputChange('9oz', e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleCustomInputSubmit('9oz'); }}
                        autoFocus
                      />
                      <button
                        className="mt-1 w-full bg-red-500 text-white rounded px-2 py-1 text-xs hover:bg-red-600"
                        onClick={() => handleCustomInputSubmit('9oz')}
                      >
                        Aceptar
                      </button>
                      {inputError['9oz'] && <div className="text-xs text-red-500 mt-1">{inputError['9oz']}</div>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}