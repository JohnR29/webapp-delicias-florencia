import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { TipoNegocio } from '@/types/negocio';

export interface Address {
  id: string;
  user_id: string;
  nombreDireccion: string;
  nombrePersona: string;
  telefonoPersona: string;
  nombreLocal: string;
  direccion: string;
  horario: string;
  notas?: string;
  aparecerEnMapa: boolean;
  mostrarTelefonoMapa: boolean;
  created_at: string;
}

export function useAddresses(userId: string | null) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener direcciones del usuario
  const fetchAddresses = useCallback(async () => {
    if (!userId) {
      setAddresses([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) {
        setError(error.message);
      }
      setAddresses(data || []);
    } catch (err: any) {
      setError(err.message);
      setAddresses([]);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchAddresses();
    // Solo depende de userId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Agregar dirección
  const addAddress = useCallback(async (address: Omit<Address, 'id' | 'created_at' | 'user_id'>) => {
    if (!userId) {
      return { success: false, message: 'Usuario no autenticado' };
    }
    const { data, error } = await supabase
      .from('addresses')
      .insert({ ...address, user_id: userId })
      .select();
    if (error) {
      return { success: false, message: error.message };
    }
    await fetchAddresses();
    return { success: true, message: 'Dirección agregada' };
  }, [userId, fetchAddresses]);

  // Editar dirección
  const updateAddress = useCallback(async (id: string, address: Partial<Address>) => {
    const { error } = await supabase
      .from('addresses')
      .update(address)
      .eq('id', id);
    if (error) return { success: false, message: error.message };
    await fetchAddresses();
    return { success: true, message: 'Dirección actualizada' };
  }, [fetchAddresses]);

  // Eliminar dirección
  const deleteAddress = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id);
    if (error) return { success: false, message: error.message };
    await fetchAddresses();
    return { success: true, message: 'Dirección eliminada' };
  }, [fetchAddresses]);

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
