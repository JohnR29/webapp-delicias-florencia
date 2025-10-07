import { useState } from 'react';
import { useAddresses, Address } from '../hooks/useAddresses';
import { useAuthContext } from '../context/AuthContext';

// Lista de comunas disponibles
const COMUNAS_PERMITIDAS = [
  'San Bernardo',
  'La Pintana', 
  'El Bosque',
  'La Cisterna'
];

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    // Si están marcando como punto de venta público, establecer estado de aprobación
    if (name === 'es_punto_venta_publico' && checked) {
      setForm({ 
        ...form, 
        [name]: checked,
        estado_aprobacion: 'pendiente' // Automáticamente pendiente de aprobación
      });
    } else if (name === 'es_punto_venta_publico' && !checked) {
      // Si desmarcan punto de venta, limpiar campos de aprobación
      setForm({ 
        ...form, 
        [name]: checked,
        estado_aprobacion: undefined,
        aprobado_por: undefined,
        fecha_aprobacion: undefined,
        comentarios_admin: undefined
      });
    } else {
      setForm({ 
        ...form, 
        [name]: type === 'checkbox' ? checked : value 
      });
    }
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

      {/* Formulario con scroll optimizado */}
      {(onlyAdd || isCreating || editingId) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h4 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">📍</span>
                {(isCreating || onlyAdd) ? 'Nueva dirección' : 'Editar dirección'}
              </h4>
              <button
                onClick={() => {
                  setEditingId(null);
                  setIsCreating(false);
                  setForm({});
                  if (onlyAdd) onSelect?.(undefined);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica de la dirección */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🏠</span>
                Información de la dirección
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  name="nombre" 
                  value={form.nombre || ''} 
                  onChange={handleChange} 
                  placeholder="Nombre de la dirección (ej: Casa, Oficina)" 
                  className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  required 
                />
                <input 
                  name="contacto" 
                  value={form.contacto || ''} 
                  onChange={handleChange} 
                  placeholder="Persona de contacto" 
                  className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                />
                <input 
                  name="telefono" 
                  value={form.telefono || ''} 
                  onChange={handleChange} 
                  placeholder="Teléfono de contacto" 
                  className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                />
                <select
                  name="comuna"
                  value={form.comuna || ''}
                  onChange={handleChange}
                  className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="" disabled>Seleccionar comuna</option>
                  {COMUNAS_PERMITIDAS.map((comuna: string) => (
                    <option key={comuna} value={comuna}>{comuna}</option>
                  ))}
                </select>
                <input 
                  name="direccion" 
                  value={form.direccion || ''} 
                  onChange={handleChange} 
                  placeholder="Dirección completa (calle, número)" 
                  className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors md:col-span-2" 
                  required
                />
              </div>
            </div>

            {/* Checkbox principal para punto de venta */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="es_punto_venta_publico"
                  name="es_punto_venta_publico"
                  checked={form.es_punto_venta_publico || false}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="es_punto_venta_publico" className="text-base font-semibold text-gray-900 cursor-pointer">
                    🏪 Usar como punto de venta público
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    Marca esta opción si quieres que esta dirección aparezca en nuestro mapa de puntos de venta donde los clientes pueden comprar productos Delicias Florencia.
                  </p>
                </div>
              </div>
            </div>

            {/* Información del negocio - Solo si es punto de venta */}
            {form.es_punto_venta_publico && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200 space-y-4 animate-fadeIn">
                <h5 className="font-semibold text-green-900 mb-4 flex items-center">
                  <span className="mr-2">🏬</span>
                  Información del negocio
                </h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    name="nombre_comercial" 
                    value={form.nombre_comercial || ''} 
                    onChange={handleChange} 
                    placeholder="Nombre comercial del negocio" 
                    className="border border-green-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors md:col-span-2" 
                    required={form.es_punto_venta_publico}
                  />
                  
                  <input 
                    name="telefono_negocio" 
                    value={form.telefono_negocio || ''} 
                    onChange={handleChange} 
                    placeholder="Teléfono del negocio" 
                    className="border border-green-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" 
                  />
                  
                  <select
                    name="tipo_negocio"
                    value={form.tipo_negocio || ''}
                    onChange={handleChange}
                    className="border border-green-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  >
                    <option value="" disabled>Tipo de negocio</option>
                    <option value="Almacén">Almacén</option>
                    <option value="Minimarket">Minimarket</option>
                    <option value="Pastelería">Pastelería</option>
                    <option value="Cafetería">Cafetería</option>
                    <option value="Otro">Otro</option>
                  </select>
                  
                  <input 
                    name="email_negocio" 
                    value={form.email_negocio || ''} 
                    onChange={handleChange} 
                    placeholder="Email del negocio (opcional)" 
                    type="email"
                    className="border border-green-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" 
                  />
                  
                  <input 
                    name="whatsapp_negocio" 
                    value={form.whatsapp_negocio || ''} 
                    onChange={handleChange} 
                    placeholder="WhatsApp del negocio (opcional)" 
                    className="border border-green-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" 
                  />
                  
                  <input 
                    name="horario_atencion" 
                    value={form.horario_atencion || ''} 
                    onChange={handleChange} 
                    placeholder="Horarios de atención (ej: Lun-Vie 9:00-18:00)" 
                    className="border border-green-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" 
                  />
                </div>
                
                <textarea 
                  name="descripcion_negocio" 
                  value={form.descripcion_negocio || ''} 
                  onChange={handleChange} 
                  placeholder="Descripción del negocio (opcional) - Cuéntanos sobre tu negocio, especialidades, etc." 
                  rows={3}
                  className="w-full border border-green-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none" 
                />
                
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>🎂 ¡Perfecto!</strong> Al marcar esta dirección como punto de venta, automáticamente aparecerá en nuestro mapa público para que los clientes puedan encontrarte y comprar productos Delicias Florencia.
                    </p>
                  </div>
                </div>
              </div>
            )}

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 text-white rounded-lg px-6 py-3 font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
                >
                  <span className="mr-2">
                    {(isCreating || onlyAdd) ? '➕' : '💾'}
                  </span>
                  {(isCreating || onlyAdd) ? 'Agregar dirección' : 'Actualizar dirección'}
                </button>
                <button
                  type="button"
                  className="flex-1 sm:flex-none bg-gray-200 text-gray-700 rounded-lg px-6 py-3 font-semibold hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center"
                  onClick={() => {
                    setEditingId(null);
                    setIsCreating(false);
                    setForm({});
                    if (onlyAdd) onSelect?.(undefined);
                  }}
                >
                  <span className="mr-2">❌</span>
                  Cancelar
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
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
            <div key={addr.id} className={`bg-white border-2 rounded-xl p-5 hover:shadow-lg transition-all duration-200 ${
              addr.es_punto_venta_publico 
                ? 'border-green-200 bg-gradient-to-r from-green-50 to-blue-50' 
                : 'border-gray-200 hover:border-blue-200'
            }`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                <div className="flex-1 cursor-pointer" onClick={() => onSelect?.(addr)}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {addr.es_punto_venta_publico ? '🏪' : '📍'}
                        </span>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">{addr.nombre}</h4>
                          {addr.es_punto_venta_publico && addr.nombre_comercial && (
                            <p className="text-sm font-semibold text-green-700">
                              {addr.nombre_comercial}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {addr.es_punto_venta_publico && (
                          <>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                              🏪 Punto de venta público
                            </span>
                            {addr.estado_aprobacion === 'pendiente' && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                                ⏳ Pendiente de aprobación
                              </span>
                            )}
                            {addr.estado_aprobacion === 'aprobado' && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                ✅ Aprobado
                              </span>
                            )}
                            {addr.estado_aprobacion === 'rechazado' && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                                ❌ Rechazado
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-700 flex items-center">
                          <span className="mr-2">📍</span>
                          Dirección
                        </p>
                        <p className="text-sm text-gray-600 ml-6">
                          {addr.direccion}, {addr.comuna}
                        </p>
                      </div>
                      
                      {addr.contacto && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700 flex items-center">
                            <span className="mr-2">👤</span>
                            Contacto
                          </p>
                          <p className="text-sm text-gray-600 ml-6">
                            {addr.contacto}
                            {addr.telefono && <span className="ml-2">• {addr.telefono}</span>}
                          </p>
                        </div>
                      )}
                      
                      {addr.es_punto_venta_publico && addr.telefono_negocio && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700 flex items-center">
                            <span className="mr-2">📞</span>
                            Teléfono del negocio
                          </p>
                          <p className="text-sm text-gray-600 ml-6">
                            {addr.telefono_negocio}
                          </p>
                        </div>
                      )}
                      
                      {addr.es_punto_venta_publico && addr.horario_atencion && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700 flex items-center">
                            <span className="mr-2">🕒</span>
                            Horarios
                          </p>
                          <p className="text-sm text-gray-600 ml-6">
                            {addr.horario_atencion}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {addr.es_punto_venta_publico && addr.descripcion_negocio && (
                      <div className="bg-white bg-opacity-70 rounded-lg p-3 border border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <span className="mr-2">💬</span>
                          Descripción del negocio
                        </p>
                        <p className="text-sm text-gray-600 italic ml-6">
                          &quot;{addr.descripcion_negocio}&quot;
                        </p>
                      </div>
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
