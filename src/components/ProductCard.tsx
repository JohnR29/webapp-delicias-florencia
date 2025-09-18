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

  const getQuantity = (formato: ProductFormat) => {
    return items[`${sabor.key}-${formato}`] || 0;
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
          <div className="bg-gray-50 rounded-lg p-3 flex-1">
            <div className="text-center mb-3">
              <div className="font-bold text-gray-800 text-lg">12oz</div>
              <div className="text-sm text-gray-600">
                ${getPrecioUnitario(total12oz, '12oz').toLocaleString('es-CL')} c/u
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => decrementQuantity('12oz')}
                disabled={getQuantity('12oz') === 0}
                className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 
                         flex items-center justify-center text-gray-700 font-bold
                         transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Restar 12oz"
              >
                −
              </button>
              
              <span className="min-w-[2rem] text-center font-bold text-gray-800 tabular-nums text-xl">
                {getQuantity('12oz')}
              </span>
              
              <button
                onClick={() => incrementQuantity('12oz')}
                className="w-8 h-8 rounded bg-red-500 hover:bg-red-600 
                         flex items-center justify-center text-white font-bold
                         transition-all duration-200"
                aria-label="Agregar 12oz"
              >
                +
              </button>
            </div>
          </div>

          {/* Formato 9oz */}
          <div className="bg-gray-50 rounded-lg p-3 flex-1">
            <div className="text-center mb-3">
              <div className="font-bold text-gray-800 text-lg">9oz</div>
              <div className="text-sm text-gray-600">
                ${getPrecioUnitario(total9oz, '9oz').toLocaleString('es-CL')} c/u
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => decrementQuantity('9oz')}
                disabled={getQuantity('9oz') === 0}
                className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 
                         flex items-center justify-center text-gray-700 font-bold
                         transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Restar 9oz"
              >
                −
              </button>
              
              <span className="min-w-[2rem] text-center font-bold text-gray-800 tabular-nums text-xl">
                {getQuantity('9oz')}
              </span>
              
              <button
                onClick={() => incrementQuantity('9oz')}
                className="w-8 h-8 rounded bg-red-500 hover:bg-red-600 
                         flex items-center justify-center text-white font-bold
                         transition-all duration-200"
                aria-label="Agregar 9oz"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}