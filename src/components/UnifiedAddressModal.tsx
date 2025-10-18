"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAddresses, Address } from '@/hooks/useAddresses';
import { DatosNegocio, TIPOS_NEGOCIO, COMUNAS_DISPONIBLES, PLACEHOLDERS } from '@/types/negocio';
import { 
  HiX, 
  HiLocationMarker, 
  HiHome, 
  HiStar,
  HiUser,
  HiCheckCircle,
  HiExclamationCircle,
  HiSave,
  HiOfficeBuilding
} from 'react-icons/hi';
import { 
  IoStorefront, 
  IoLocationOutline
} from 'react-icons/io5';

interface UnifiedAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (address?: Address) => void;
  editingAddress?: Address;
}

interface FormData extends DatosNegocio {
  nombre: string;
  contacto: string;
  telefono: string;
  guardar_como_direccion: boolean;
  es_punto_venta_publico: boolean;
}

export default function UnifiedAddressModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingAddress 
}: UnifiedAddressModalProps) {
  const { user } = useAuth();
  const { addAddress, updateAddress } = useAddresses(user?.id || '');
  
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error' | 'info', texto: string } | null>(null);
  
  const [formData, setFormData] = useState<FormData>(() => {
    if (editingAddress) {
      return {
        nombre: editingAddress.nombre || '',
        contacto: editingAddress.contacto || '',
        telefono: editingAddress.telefono || '',
        direccion: editingAddress.direccion || '',
        comuna: editingAddress.comuna || '',
        nombre_comercial: editingAddress.nombre_comercial || '',
        descripcion_negocio: editingAddress.descripcion_negocio || '',
        telefono_negocio: editingAddress.telefono_negocio || '',
        horario_atencion: editingAddress.horario_atencion || '',
        tipo_negocio: editingAddress.tipo_negocio,
        email_negocio: editingAddress.email_negocio || '',
        whatsapp_negocio: editingAddress.whatsapp_negocio || '',
        permite_pedidos_directos: editingAddress.permite_pedidos_directos || false,
        observaciones: editingAddress.observaciones || '',
        guardar_como_direccion: true,
        es_punto_venta_publico: editingAddress.es_punto_venta_publico || false,
      };
    }
    
    return {
      nombre: '',
      contacto: '',
      telefono: '',
      direccion: '',
      comuna: '',
      nombre_comercial: '',
      descripcion_negocio: '',
      telefono_negocio: '',
      horario_atencion: '',
      tipo_negocio: undefined,
      email_negocio: '',
      whatsapp_negocio: '',
      permite_pedidos_directos: false,
      observaciones: '',
      guardar_como_direccion: true,
      es_punto_venta_publico: false,
    };
  });

  const validateForm = () => {
    const baseValid = !!(formData.nombre && formData.contacto && formData.telefono && formData.direccion && formData.comuna);
    
    if (!formData.es_punto_venta_publico) {
      return baseValid;
    }
    
    // Si es punto de venta público, validar campos de negocio
    const businessValid = !!(formData.nombre_comercial && formData.descripcion_negocio && formData.telefono_negocio);
    return baseValid && businessValid;
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setMensaje(null);
  };

  const handleClose = () => {
    setMensaje(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setMensaje({ tipo: 'error', texto: 'Debes estar autenticado para guardar una dirección' });
      return;
    }

    if (!validateForm()) {
      setMensaje({ tipo: 'error', texto: 'Por favor completa todos los campos requeridos' });
      return;
    }

    setLoading(true);
    setMensaje(null);

    try {
      // Asegurar compatibilidad con ContactForm - usar fallbacks cuando sea necesario
      const addressData: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
        nombre: formData.nombre,
        contacto: formData.contacto,
        telefono: formData.telefono,
        direccion: formData.direccion,
        comuna: formData.comuna,
        // Asegurar que siempre tenga nombre_comercial (fallback a nombre si está vacío)
        nombre_comercial: formData.nombre_comercial || formData.nombre,
        descripcion_negocio: formData.descripcion_negocio,
        // Asegurar que siempre tenga telefono_negocio (fallback a telefono si está vacío)
        telefono_negocio: formData.telefono_negocio || formData.telefono,
        horario_atencion: formData.horario_atencion,
        // Asegurar que siempre tenga tipo_negocio (fallback a 'Almacén' si está vacío)
        tipo_negocio: formData.tipo_negocio || 'Almacén',
        email_negocio: formData.email_negocio,
        whatsapp_negocio: formData.whatsapp_negocio,
        permite_pedidos_directos: formData.permite_pedidos_directos,
        observaciones: formData.observaciones,
        es_punto_venta_publico: formData.es_punto_venta_publico,
      };

      console.log('🔄 Intentando guardar dirección:', addressData);
      console.log('👤 Usuario ID:', user?.id);

      if (editingAddress) {
        const result = await updateAddress(editingAddress.id, addressData);
        if (result.success) {
          setMensaje({ tipo: 'success', texto: 'Dirección actualizada exitosamente' });
        } else {
          throw new Error(result.message);
        }
      } else {
        const result = await addAddress(addressData);
        if (result.success) {
          setMensaje({ tipo: 'success', texto: 'Dirección guardada exitosamente' });
          if (onSuccess) onSuccess();
        } else {
          throw new Error(result.message);
        }
      }

      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (error) {
      console.error('Error al guardar la dirección:', error);
      setMensaje({ tipo: 'error', texto: 'Error al guardar la dirección' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const showBusinessFields = formData.es_punto_venta_publico;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl"
          >
            <HiX />
          </button>
          <div className="flex items-center gap-3">
            <IoLocationOutline className="text-3xl" />
            <div>
              <h2 className="text-2xl font-bold">
                {editingAddress ? 'Editar Dirección' : 'Agregar Dirección'}
              </h2>
              <p className="text-white/90 text-sm">
                Completa la información para tu nueva dirección
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
          {mensaje && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              mensaje.tipo === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
              mensaje.tipo === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
              'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {mensaje.tipo === 'success' ? <HiCheckCircle className="text-xl" /> : <HiExclamationCircle className="text-xl" />}
              {mensaje.texto}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Opciones principales */}
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <HiStar className="text-yellow-500" />
                ¿Cómo deseas usar esta dirección?
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.guardar_como_direccion}
                    onChange={(e) => handleInputChange('guardar_como_direccion', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <HiHome className="text-blue-500" />
                    <span className="font-medium text-gray-900">Guardar como dirección para pedidos futuros</span>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.es_punto_venta_publico}
                    onChange={(e) => handleInputChange('es_punto_venta_publico', e.target.checked)}
                    className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                  />
                  <div className="flex items-center gap-2">
                    <IoStorefront className="text-green-500" />
                    <span className="font-medium text-gray-900">Registrar como punto de venta en el mapa público</span>
                  </div>
                </label>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Puedes seleccionar ambas opciones si lo deseas
              </p>
            </div>

            {/* Información básica de contacto */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <HiUser className="text-blue-500" />
                Información de Contacto
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del contacto *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder={PLACEHOLDERS.nombre}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Persona de contacto *
                  </label>
                  <input
                    type="text"
                    value={formData.contacto}
                    onChange={(e) => handleInputChange('contacto', e.target.value)}
                    placeholder={PLACEHOLDERS.contacto}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono de contacto *
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  placeholder={PLACEHOLDERS.telefono}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Información de ubicación */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <HiLocationMarker className="text-red-500" />
                Ubicación
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección completa *
                </label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  placeholder={PLACEHOLDERS.direccion}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comuna *
                </label>
                <select
                  value={formData.comuna}
                  onChange={(e) => handleInputChange('comuna', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecciona una comuna</option>
                  {COMUNAS_DISPONIBLES.map((comuna) => (
                    <option key={comuna} value={comuna}>
                      {comuna}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Información básica del negocio - Siempre visible para compatibilidad con ContactForm */}
            <div className="space-y-4 bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <HiOfficeBuilding className="text-amber-600" />
                Información del Negocio
              </h3>
              <p className="text-sm text-amber-700">
                Estos datos se usarán para autocompletar futuros pedidos
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre comercial
                  </label>
                  <input
                    type="text"
                    value={formData.nombre_comercial}
                    onChange={(e) => handleInputChange('nombre_comercial', e.target.value)}
                    placeholder="Ej: Almacén Los Robles (si es diferente al nombre personal)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Si no se especifica, se usará el nombre personal
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono comercial
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono_negocio}
                    onChange={(e) => handleInputChange('telefono_negocio', e.target.value)}
                    placeholder="Ej: +56 9 1234 5678 (si es diferente al personal)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Si no se especifica, se usará el teléfono personal
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de negocio
                </label>
                <select
                  value={formData.tipo_negocio || ''}
                  onChange={(e) => handleInputChange('tipo_negocio', e.target.value || undefined)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Selecciona el tipo</option>
                  {TIPOS_NEGOCIO.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Información adicional para punto de venta público */}
            {showBusinessFields && (
              <div className="space-y-4 bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <IoStorefront className="text-green-600" />
                  Información Adicional para Punto de Venta Público
                </h3>
                <p className="text-sm text-green-700">
                  Esta información se mostrará en el mapa público de puntos de venta
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción del negocio *
                  </label>
                  <textarea
                    value={formData.descripcion_negocio}
                    onChange={(e) => handleInputChange('descripcion_negocio', e.target.value)}
                    placeholder={PLACEHOLDERS.descripcion_negocio}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    required={showBusinessFields}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp del negocio
                    </label>
                    <input
                      type="tel"
                      value={formData.whatsapp_negocio}
                      onChange={(e) => handleInputChange('whatsapp_negocio', e.target.value)}
                      placeholder={PLACEHOLDERS.whatsapp_negocio}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email del negocio
                    </label>
                    <input
                      type="email"
                      value={formData.email_negocio}
                      onChange={(e) => handleInputChange('email_negocio', e.target.value)}
                      placeholder={PLACEHOLDERS.email_negocio}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horario de atención
                    </label>
                    <input
                      type="text"
                      value={formData.horario_atencion}
                      onChange={(e) => handleInputChange('horario_atencion', e.target.value)}
                      placeholder={PLACEHOLDERS.horario_atencion}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permite_pedidos_directos}
                      onChange={(e) => handleInputChange('permite_pedidos_directos', e.target.checked)}
                      className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Permite pedidos directos (los clientes pueden contactar directamente)
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones adicionales
                  </label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                    placeholder={PLACEHOLDERS.observaciones}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button 
                type="submit" 
                disabled={loading || !validateForm()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg px-6 py-3 font-semibold hover:from-blue-600 hover:to-green-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <HiSave className="mr-2" />
                    {editingAddress 
                      ? 'Actualizar dirección'
                      : showBusinessFields 
                        ? 'Guardar dirección y negocio'
                        : 'Guardar dirección'
                    }
                  </>
                )}
              </button>
              <button
                type="button"
                className="sm:flex-none bg-gray-200 text-gray-700 rounded-lg px-6 py-3 font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center"
                onClick={handleClose}
              >
                <HiX className="mr-2" />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}