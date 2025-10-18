"use client";

import { useState } from 'react';
import { useAddresses, Address } from '../hooks/useAddresses';
import { useAuthContext } from '../context/AuthContext';
import UnifiedAddressModal from '@/components/UnifiedAddressModal';
import { 
  HiLocationMarker, 
  HiPencil, 
  HiTrash, 
  HiPlus,
  HiOfficeBuilding,
  HiUser,
  HiPhone,
  HiCheckCircle,
  HiClock,
  HiExclamationCircle
} from 'react-icons/hi';
import { IoStorefront } from 'react-icons/io5';

interface AddressManagerV2Props {
  onSelect?: (address?: Address) => void;
  onlyAdd?: boolean;
  showTitle?: boolean;
  userProfile?: any;
}

export default function AddressManagerV2({ 
  onSelect, 
  onlyAdd = false, 
  showTitle = false, 
  userProfile 
}: AddressManagerV2Props) {
  const { user } = useAuthContext();
  const userId = user?.id || null;
  const {
    addresses,
    loading,
    error,
    deleteAddress,
  } = useAddresses(userId);

  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>(undefined);
  const [message, setMessage] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingAddress(undefined);
    setShowModal(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta dirección?')) {
      const res = await deleteAddress(id);
      setMessage(res.message);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingAddress(undefined);
  };

  const handleModalSuccess = () => {
    setMessage('Dirección guardada exitosamente');
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {showTitle && (
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <HiLocationMarker className="mr-2 text-blue-600" />
          Mis direcciones
        </h3>
      )}
      
      {/* Mensajes de estado */}
      {message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
          <HiCheckCircle className="text-green-600" />
          <p className="text-green-800 text-sm font-medium">{message}</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
          <HiExclamationCircle className="text-red-600" />
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Botón para agregar nueva dirección */}
      {!onlyAdd && (
        <button
          onClick={handleAdd}
          className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <HiPlus className="mr-2 text-lg" />
          Agregar nueva dirección
        </button>
      )}

      {/* Modal unificado */}
      <UnifiedAddressModal
        isOpen={showModal || onlyAdd}
        onClose={onlyAdd ? () => onSelect?.(undefined) : handleModalClose}
        editingAddress={editingAddress}
        onSuccess={onlyAdd ? onSelect : handleModalSuccess}
      />

      {/* Listado de direcciones - solo si no es solo para agregar */}
      {!onlyAdd && (
        <div className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600 font-medium">Cargando direcciones...</span>
              </div>
            </div>
          )}
          
          {addresses.map(addr => (
            <div 
              key={addr.id} 
              className={`bg-white border-2 rounded-xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                addr.es_punto_venta_publico 
                  ? 'border-green-200 bg-gradient-to-r from-green-50 via-white to-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => onSelect?.(addr)}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between">
                
                {/* Información principal */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        addr.es_punto_venta_publico 
                          ? 'bg-gradient-to-r from-green-400 to-blue-400' 
                          : 'bg-gradient-to-r from-gray-400 to-gray-500'
                      }`}>
                        {addr.es_punto_venta_publico ? (
                          <IoStorefront className="text-xl text-white" />
                        ) : (
                          <HiLocationMarker className="text-xl text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg flex items-center">
                          {addr.nombre}
                          {addr.es_punto_venta_publico && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                              Punto de venta
                            </span>
                          )}
                        </h4>
                        {addr.es_punto_venta_publico && addr.nombre_comercial && (
                          <p className="text-base font-semibold text-green-700 flex items-center">
                            <HiOfficeBuilding className="mr-1" />
                            {addr.nombre_comercial}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Estado de aprobación */}
                    {addr.es_punto_venta_publico && (
                      <div className="flex flex-wrap gap-2">
                        {addr.estado_aprobacion === 'pendiente' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                            <HiClock className="mr-1" />
                            Pendiente de aprobación
                          </span>
                        )}
                        {addr.estado_aprobacion === 'aprobado' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                            <HiCheckCircle className="mr-1" />
                            Aprobado
                          </span>
                        )}
                        {addr.estado_aprobacion === 'rechazado' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                            <HiExclamationCircle className="mr-1" />
                            Rechazado
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Detalles en grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 flex items-center">
                        <HiLocationMarker className="mr-2 text-gray-500" />
                        Dirección
                      </p>
                      <p className="text-sm text-gray-600 ml-6">
                        {addr.direccion}, {addr.comuna}
                      </p>
                    </div>
                    
                    {addr.contacto && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 flex items-center">
                          <HiUser className="mr-2 text-gray-500" />
                          Contacto
                        </p>
                        <p className="text-sm text-gray-600 ml-6">
                          {addr.contacto}
                          {addr.telefono && <span className="ml-2">• {addr.telefono}</span>}
                        </p>
                      </div>
                    )}
                    
                    {addr.es_punto_venta_publico && addr.telefono_negocio && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 flex items-center">
                          <HiPhone className="mr-2 text-gray-500" />
                          Teléfono del negocio
                        </p>
                        <p className="text-sm text-gray-600 ml-6">
                          {addr.telefono_negocio}
                        </p>
                      </div>
                    )}
                    
                    {addr.es_punto_venta_publico && addr.horario_atencion && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 flex items-center">
                          <HiClock className="mr-2 text-gray-500" />
                          Horarios
                        </p>
                        <p className="text-sm text-gray-600 ml-6">
                          {addr.horario_atencion}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Descripción del negocio */}
                  {addr.es_punto_venta_publico && addr.descripcion_negocio && (
                    <div className="bg-white bg-opacity-70 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        📝 Descripción del negocio
                      </p>
                      <p className="text-sm text-gray-600 italic">
                        &quot;{addr.descripcion_negocio}&quot;
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Botones de acción */}
                <div className="flex gap-2 mt-4 lg:mt-0 lg:ml-4">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(addr);
                    }}
                    className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors flex items-center justify-center"
                    title="Editar dirección"
                  >
                    <HiPencil className="text-lg" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(addr.id);
                    }}
                    className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors flex items-center justify-center"
                    title="Eliminar dirección"
                  >
                    <HiTrash className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Estado vacío */}
          {addresses.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiLocationMarker className="text-2xl text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg mb-4">No tienes direcciones guardadas</p>
              <button
                onClick={handleAdd}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center mx-auto font-medium"
              >
                <HiPlus className="mr-2" />
                Agregar tu primera dirección
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}