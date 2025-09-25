import { useState } from 'react';
import { useAddresses, Address } from '../hooks/useAddresses';
import { useAuth } from '../hooks/useAuth';

interface AddressManagerProps {
  onSelect?: (address: Address) => void;
}

export default function AddressManager({ onSelect }: AddressManagerProps) {
  const { user } = useAuth();
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
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (editingId) {
      const res = await updateAddress(editingId, form);
      setMessage(res.message);
      setEditingId(null);
    } else {
      const res = await addAddress(form as Omit<Address, 'id' | 'created_at' | 'user_id'>);
      setMessage(res.message);
    }
    setForm({});
  };

  const handleEdit = (address: Address) => {
    setForm(address);
    setEditingId(address.id);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta dirección?')) {
      const res = await deleteAddress(id);
      setMessage(res.message);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold">Mis direcciones</h3>
      {message && <div className="text-green-600 text-sm">{message}</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
        <input name="nombre" value={form.nombre || ''} onChange={handleChange} placeholder="Nombre (Casa, Negocio...)" className="border p-2 rounded" required />
        <input name="contacto" value={form.contacto || ''} onChange={handleChange} placeholder="Persona de contacto" className="border p-2 rounded" />
        <input name="telefono" value={form.telefono || ''} onChange={handleChange} placeholder="Teléfono" className="border p-2 rounded" />
        <input name="tipo" value={form.tipo || ''} onChange={handleChange} placeholder="Tipo de negocio" className="border p-2 rounded" />
        <input name="comuna" value={form.comuna || ''} onChange={handleChange} placeholder="Comuna" className="border p-2 rounded" />
        <input name="direccion" value={form.direccion || ''} onChange={handleChange} placeholder="Dirección completa" className="border p-2 rounded md:col-span-2" />
        <button type="submit" className="bg-primary-600 text-white rounded px-4 py-2 col-span-1 md:col-span-2">
          {editingId ? 'Actualizar dirección' : 'Agregar dirección'}
        </button>
      </form>
      <div className="space-y-2">
        {loading && <div>Cargando direcciones...</div>}
        {addresses.map(addr => (
          <div key={addr.id} className="flex items-center justify-between bg-white border rounded p-3">
            <div className="flex-1 cursor-pointer" onClick={() => onSelect?.(addr)}>
              <span className="font-semibold">{addr.nombre}</span> — {addr.direccion} ({addr.comuna})
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(addr)} className="text-blue-600 text-sm">Editar</button>
              <button onClick={() => handleDelete(addr.id)} className="text-red-600 text-sm">Eliminar</button>
            </div>
          </div>
        ))}
        {addresses.length === 0 && !loading && <div className="text-gray-500">No tienes direcciones guardadas.</div>}
      </div>
    </div>
  );
}
