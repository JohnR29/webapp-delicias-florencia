import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Address {
  id: string;
  user_id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  tipo: string;
  comuna: string;
  direccion: string;
  created_at: string;
}

export function useAddresses(userId: string | null) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener direcciones del usuario
  const fetchAddresses = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    setAddresses(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Agregar dirección
  const addAddress = async (address: Omit<Address, 'id' | 'created_at' | 'user_id'>) => {
    if (!userId) return { success: false, message: 'Usuario no autenticado' };
    const { error } = await supabase
      .from('addresses')
      .insert({ ...address, user_id: userId });
    if (error) return { success: false, message: error.message };
    await fetchAddresses();
    return { success: true, message: 'Dirección agregada' };
  };

  // Editar dirección
  const updateAddress = async (id: string, address: Partial<Address>) => {
    const { error } = await supabase
      .from('addresses')
      .update(address)
      .eq('id', id);
    if (error) return { success: false, message: error.message };
    await fetchAddresses();
    return { success: true, message: 'Dirección actualizada' };
  };

  // Eliminar dirección
  const deleteAddress = async (id: string) => {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id);
    if (error) return { success: false, message: error.message };
    await fetchAddresses();
    return { success: true, message: 'Dirección eliminada' };
  };

  return {
    addresses,
    loading,
    error,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
  };
}
