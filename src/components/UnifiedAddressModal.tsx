"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAddresses, Address } from '@/hooks/useAddresses';
import { COMUNAS_DISPONIBLES } from '@/types/negocio';
import { loadGoogleMapsScript } from '@/lib/googleMaps';
import { HiX, HiCheckCircle, HiExclamationCircle, HiSave } from 'react-icons/hi';
import { IoLocationOutline } from 'react-icons/io5';

interface UnifiedAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (address?: Address) => void;
  editingAddress?: Address;
}

interface FormData {
  nombreDireccion: string;
  nombrePersona: string;
  telefonoPersona: string;
  nombreLocal: string;
  direccion: string;
  horario: string;
  notas: string;
  aparecerEnMapa: boolean;
  mostrarTelefonoMapa: boolean;
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
  const [formData, setFormData] = useState<FormData>(() =>
    editingAddress ? {
      nombreDireccion: editingAddress.nombreDireccion || '',
      nombrePersona: editingAddress.nombrePersona || '',
      telefonoPersona: editingAddress.telefonoPersona || '',
      nombreLocal: editingAddress.nombreLocal || '',
      direccion: editingAddress.direccion || '',
      horario: editingAddress.horario || '',
      notas: editingAddress.notas || '',
      aparecerEnMapa: (editingAddress as any).aparecerEnMapa ?? false,
      mostrarTelefonoMapa: (editingAddress as any).mostrarTelefonoMapa ?? false,
    } : {
      nombreDireccion: '',
      nombrePersona: '',
      telefonoPersona: '',
      nombreLocal: '',
      direccion: '',
      horario: '',
      notas: '',
      aparecerEnMapa: false,
      mostrarTelefonoMapa: false,
    }
  );

  // Google Autocomplete
  const direccionInputRef = useRef<HTMLInputElement>(null);
  const [autocompleteReady, setAutocompleteReady] = useState(false);
  useEffect(() => {
    if (!isOpen) return;
    let autocomplete: google.maps.places.Autocomplete | null = null;
    let listener: google.maps.MapsEventListener | null = null;
    let ignore = false;
    const initAutocomplete = async () => {
      await loadGoogleMapsScript();
      if (direccionInputRef.current && (window as any).google?.maps?.places) {
        autocomplete = new (window as any).google.maps.places.Autocomplete(
          direccionInputRef.current,
          { types: ['address'], componentRestrictions: { country: 'cl' } }
        );
        setAutocompleteReady(true);
        listener = autocomplete!.addListener('place_changed', () => {
          if (ignore) return;
          const place = autocomplete!.getPlace();
          if (place && place.formatted_address) {
            setFormData((prev) => ({ ...prev, direccion: place.formatted_address || '' }));
          }
        });
      }
    };
    initAutocomplete();
    return () => {
      ignore = true;
      if (listener) listener.remove();
    };
  }, [isOpen]);

  const validateForm = () => (
    !!(
      formData.nombreDireccion &&
      formData.nombrePersona &&
      formData.telefonoPersona &&
      formData.nombreLocal &&
      formData.direccion &&
      formData.horario
    )
  );

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      const addressData: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
        nombreDireccion: formData.nombreDireccion,
        nombrePersona: formData.nombrePersona,
        telefonoPersona: formData.telefonoPersona,
        nombreLocal: formData.nombreLocal,
        direccion: formData.direccion,
        horario: formData.horario,
        notas: formData.notas,
        aparecerEnMapa: formData.aparecerEnMapa,
        mostrarTelefonoMapa: formData.mostrarTelefonoMapa,
      };
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
      setMensaje({ tipo: 'error', texto: 'Error al guardar la dirección' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl"
            aria-label="Cerrar modal"
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
            {/* Nombre para identificar la dirección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre para identificar la dirección *
              </label>
              <input
                type="text"
                value={formData.nombreDireccion}
                onChange={(e) => handleInputChange('nombreDireccion', e.target.value)}
                placeholder="Ej: Casa, Local, Oficina"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                aria-label="Nombre para identificar la dirección"
              />
            </div>
            {/* Nombre y teléfono de la persona */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la persona *
                </label>
                <input
                  type="text"
                  value={formData.nombrePersona}
                  onChange={(e) => handleInputChange('nombrePersona', e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  aria-label="Nombre de la persona"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono de la persona *
                </label>
                <input
                  type="tel"
                  value={formData.telefonoPersona}
                  onChange={(e) => handleInputChange('telefonoPersona', e.target.value)}
                  placeholder="Ej: +56 9 1234 5678"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  aria-label="Teléfono de la persona"
                />
              </div>
            </div>
            {/* Nombre del local */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del local *
              </label>
              <input
                type="text"
                value={formData.nombreLocal}
                onChange={(e) => handleInputChange('nombreLocal', e.target.value)}
                placeholder="Ej: Almacén Los Robles"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                aria-label="Nombre del local"
              />
            </div>
            {/* Dirección con autocompletado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección completa *
              </label>
              <input
                ref={direccionInputRef}
                type="text"
                value={formData.direccion}
                onChange={(e) => handleInputChange('direccion', e.target.value)}
                placeholder="Ej: Av. Providencia 1234"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                aria-label="Dirección completa"
                autoComplete="off"
                disabled={!autocompleteReady}
              />
            </div>
            {/* Horario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horario de atención *
              </label>
              <input
                type="text"
                value={formData.horario}
                onChange={(e) => handleInputChange('horario', e.target.value)}
                placeholder="Ej: Lunes a viernes 10:00-19:00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                aria-label="Horario de atención"
              />
            </div>
            {/* Notas adicionales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas adicionales
              </label>
              <textarea
                value={formData.notas}
                onChange={(e) => handleInputChange('notas', e.target.value)}
                placeholder="Observaciones, indicaciones, etc."
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                aria-label="Notas adicionales"
              />
            </div>
            {/* Opción para aparecer en el mapa */}
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.aparecerEnMapa}
                  onChange={(e) => handleInputChange('aparecerEnMapa', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  aria-label="Aparecer en el mapa público"
                />
                <span className="text-sm font-medium text-gray-700">
                  Quiero que mi dirección aparezca en el mapa público
                </span>
              </label>
              <p className="text-xs text-gray-500 ml-8">Si no seleccionas esta opción, tu dirección solo se usará para tus pedidos y no será visible en el mapa.</p>
              <label className="flex items-center gap-3 cursor-pointer ml-8">
                <input
                  type="checkbox"
                  checked={formData.mostrarTelefonoMapa}
                  onChange={(e) => handleInputChange('mostrarTelefonoMapa', e.target.checked)}
                  className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                  aria-label="Mostrar teléfono en el mapa"
                  disabled={!formData.aparecerEnMapa}
                />
                <span className="text-sm font-medium text-gray-700">
                  Mostrar mi teléfono en el mapa público
                </span>
              </label>
              <p className="text-xs text-gray-500 ml-16">Solo si tu dirección aparece en el mapa, puedes mostrar tu teléfono para clientes finales.</p>
            </div>
            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button 
                type="submit" 
                disabled={loading || !validateForm()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg px-6 py-3 font-semibold hover:from-blue-600 hover:to-green-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                aria-label="Guardar dirección"
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
                      : 'Guardar dirección'
                    }
                  </>
                )}
              </button>
              <button
                type="button"
                className="sm:flex-none bg-gray-200 text-gray-700 rounded-lg px-6 py-3 font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center"
                onClick={handleClose}
                aria-label="Cancelar"
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

