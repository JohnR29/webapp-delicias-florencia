"use client";
import { useState } from 'react';
import { BUSINESS_CONFIG } from '../lib/types';

interface SociosFiltersProps {
  comunasDisponibles: string[];
  onFilterByComuna: (comuna: string) => void;
  onSearch: (searchTerm: string) => void;
  onReset: () => void;
  totalResultados: number;
}

export default function SociosFilters({
  comunasDisponibles,
  onFilterByComuna,
  onSearch,
  onReset,
  totalResultados
}: SociosFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComuna, setSelectedComuna] = useState('');
  const [onlyPedidosDirectos, setOnlyPedidosDirectos] = useState(false);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    onSearch(term);
  };

  const handleComunaFilter = (comuna: string) => {
    setSelectedComuna(comuna);
    if (comuna) {
      onFilterByComuna(comuna);
    } else {
      onReset();
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedComuna('');
    setOnlyPedidosDirectos(false);
    onReset();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Filtrar puntos de venta</h3>
          {(searchTerm || selectedComuna) && (
            <button
              onClick={handleReset}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Búsqueda por texto */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Buscar por nombre
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: almacén, minimarket..."
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Busca por nombre del negocio o descripción
          </p>
        </div>

        {/* Filtro por comuna */}
        <div>
          <label htmlFor="comuna" className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por comuna
          </label>
          <select
            id="comuna"
            value={selectedComuna}
            onChange={(e) => handleComunaFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas las comunas</option>
            {comunasDisponibles.map((comuna) => (
              <option key={comuna} value={comuna}>
                {comuna}
              </option>
            ))}
          </select>
          {comunasDisponibles.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {comunasDisponibles.length} {comunasDisponibles.length === 1 ? 'comuna disponible' : 'comunas disponibles'}
            </p>
          )}
        </div>

        {/* Filtro por pedidos directos */}
        <div>
          <div className="flex items-center">
            <input
              id="pedidos-directos"
              type="checkbox"
              checked={onlyPedidosDirectos}
              onChange={(e) => setOnlyPedidosDirectos(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="pedidos-directos" className="ml-3 text-sm text-gray-700">
              Solo puntos que aceptan pedidos directos
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1 ml-7">
            Puedes llamar y hacer pedidos por teléfono
          </p>
        </div>

        {/* Información de cobertura */}
        <div className="border-t border-gray-100 pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Cobertura actual</h4>
          <div className="space-y-2">
            {BUSINESS_CONFIG.COMUNAS_PERMITIDAS.map((comuna) => {
              const disponible = comunasDisponibles.includes(comuna);
              return (
                <div key={comuna} className="flex items-center justify-between text-sm">
                  <span className={disponible ? 'text-gray-900' : 'text-gray-400'}>
                    {comuna}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    disponible 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {disponible ? '✓ Disponible' : 'Próximamente'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resultados */}
        <div className="border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Resultados encontrados</span>
            <span className="text-lg font-semibold text-blue-600">{totalResultados}</span>
          </div>
          
          {totalResultados === 0 && (searchTerm || selectedComuna) && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex">
                <div className="text-yellow-400 mr-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-yellow-800">
                    No encontramos puntos de venta con estos criterios.
                  </p>
                  <button
                    onClick={handleReset}
                    className="text-sm text-yellow-800 underline hover:text-yellow-900 mt-1"
                  >
                    Limpiar filtros y ver todos
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Call to action para distribuidores */}
        <div className="border-t border-gray-100 pt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="text-blue-500 mr-3 mt-0.5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h5 className="text-blue-900 text-sm font-medium mb-1">
                  ¿No hay puntos cerca de ti?
                </h5>
                <p className="text-blue-800 text-xs">
                  Recomiéndanos negocios en tu zona o únete como distribuidor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}