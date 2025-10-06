import { useState } from 'react';
import { useAddresses, Address } from '../hooks/useAddresses';
import { BUSINESS_CONFIG } from '../lib/types';
import { useAuthContext } from '../context/AuthContext';

interface AddressManagerProps {
  onSelect?: (address?: Address) => void;
  onlyAdd?: boolean;
  showTitle?: boolean;
  userProfile?: any; // Para verificar si es socio distribuidor
}

export default function AddressManager({ onSelect, onlyAdd = false, showTitle = false, userProfile }: AddressManagerProps) {
  const { user } = useAuthContext();
  const userId = user?.id || null;
  const {
    addresses,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    fetchAddresses,
  } = useAddresses(userId);

  const [form, setForm] = useState<Partial<Address>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (editingId && !isCreating) {
      // Actualizar dirección existente
      const res = await updateAddress(editingId, form);
      setMessage(res.message);
      setEditingId(null);
    } else {
      // Crear nueva dirección
      const res = await addAddress(form as Omit<Address, 'id' | 'created_at' | 'user_id'>);
      setMessage(res.message);
      setIsCreating(false);
    }
    setForm({});
  };

  const handleEdit = (address: Address) => {
    setForm(address);
    setEditingId(address.id);
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta dirección?')) {
      const res = await deleteAddress(id);
      setMessage(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {showTitle && <h3 className="text-lg font-bold">Mis direcciones</h3>}
      
      {/* Mensajes de estado */}
      {message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-green-800 text-sm">{message}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
      {/* Botón para agregar nueva dirección */}
      {!onlyAdd && !isCreating && !editingId && (
        <button
          onClick={() => setIsCreating(true)}
          className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span className="mr-2">+</span>
          Agregar nueva dirección
        </button>
      )}

      {/* Formulario solo si es alta o edición */}
      {(onlyAdd || isCreating || editingId) && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4">
            {(isCreating || onlyAdd) ? 'Nueva dirección' : 'Editar dirección'}
          </h4>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="nombre" value={form.nombre || ''} onChange={handleChange} placeholder="Nombre de la dirección" className="border p-2 rounded" required />
          <input name="negocio" value={form.negocio || ''} onChange={handleChange} placeholder="Nombre del negocio" className="border p-2 rounded" required />
          <input name="contacto" value={form.contacto || ''} onChange={handleChange} placeholder="Persona de contacto" className="border p-2 rounded" />
          <input name="telefono" value={form.telefono || ''} onChange={handleChange} placeholder="Teléfono" className="border p-2 rounded" />
          <select
            name="tipo"
            value={form.tipo || ''}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          >
            <option value="" disabled>Tipo de negocio</option>
            {BUSINESS_CONFIG.TIPOS_NEGOCIO.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
          <select
            name="comuna"
            value={form.comuna || ''}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          >
            <option value="" disabled>Comuna</option>
            {BUSINESS_CONFIG.COMUNAS_PERMITIDAS.map(comuna => (
              <option key={comuna} value={comuna}>{comuna}</option>
            ))}
          </select>
          <input name="direccion" value={form.direccion || ''} onChange={handleChange} placeholder="Dirección completa" className="border p-2 rounded md:col-span-2" />
          
          {/* Campos para socio distribuidor */}
          {userProfile?.es_punto_venta_publico && (
            <div className="md:col-span-2 space-y-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900">Configuración de Punto de Venta</h5>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="es_punto_venta_publico"
                  name="es_punto_venta_publico"
                  checked={form.es_punto_venta_publico || false}
                  onChange={(e) => setForm({ ...form, es_punto_venta_publico: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="es_punto_venta_publico" className="ml-3 text-sm text-blue-900">
                  Esta dirección es un punto de venta público
                </label>
              </div>
              
              {form.es_punto_venta_publico && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="visible_en_mapa"
                    name="visible_en_mapa"
                    checked={form.visible_en_mapa || false}
                    onChange={(e) => setForm({ ...form, visible_en_mapa: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="visible_en_mapa" className="ml-3 text-sm text-blue-900">
                    Mostrar en el mapa público para clientes finales
                  </label>
                </div>
              )}
              
              <p className="text-xs text-blue-700">
                Los clientes finales podrán encontrar este punto de venta en nuestro mapa
              </p>
            </div>
          )}
            <div className="md:col-span-2 flex flex-col md:flex-row gap-2">
              <button 
                type="submit" 
                className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {(isCreating || onlyAdd) ? 'Agregar dirección' : 'Actualizar dirección'}
              </button>
              <button
                type="button"
                className="bg-gray-300 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                onClick={() => {
                  setEditingId(null);
                  setIsCreating(false);
                  setForm({});
                  if (onlyAdd) onSelect?.(undefined);
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Listado solo si no es solo alta */}
      {!onlyAdd && (
        <div className="space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600">Cargando direcciones...</span>
              </div>
            </div>
          )}
          
          {addresses.map(addr => (
            <div key={addr.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex-1 cursor-pointer" onClick={() => onSelect?.(addr)}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">{addr.nombre}</h4>
                      {addr.es_punto_venta_publico && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          🏪 Punto de venta
                        </span>
                      )}
                      {addr.visible_en_mapa && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          🗺️ En mapa
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{addr.negocio}</p>
                    <p className="text-sm text-gray-500">
                      {addr.direccion}, {addr.comuna}
                    </p>
                    {addr.contacto && (
                      <p className="text-sm text-gray-500">
                        Contacto: {addr.contacto} {addr.telefono && `- ${addr.telefono}`}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-3 md:mt-0">
                  <button 
                    onClick={() => handleEdit(addr)} 
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(addr.id)} 
                    className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {addresses.length === 0 && !loading && !editingId && !isCreating && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">📍</div>
              <p className="text-gray-500 mb-4">No tienes direcciones guardadas</p>
              <button
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Agregar tu primera dirección
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
