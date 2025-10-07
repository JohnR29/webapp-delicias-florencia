import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { UserProfile, UserProfileForm } from '../lib/types';

export function useProfile(userId: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener perfil del usuario
  const fetchProfile = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      setError(error.message);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Crear o actualizar perfil
  const saveProfile = async (profileData: UserProfileForm) => {
    if (!userId) return { success: false, message: 'Usuario no autenticado' };
    
    setLoading(true);
    setError(null);

    try {
      const dataToSave = {
        ...profileData,
        // Asegurar valores por defecto para campos boolean
        es_punto_venta_publico: profileData.es_punto_venta_publico || false,
        permite_pedidos_directos: profileData.permite_pedidos_directos || false,
        updated_at: new Date().toISOString()
      };

      if (profile) {
        // Actualizar perfil existente
        const { error } = await supabase
          .from('user_profiles')
          .update(dataToSave)
          .eq('user_id', userId);
        
        if (error) {
          setLoading(false);
          return { success: false, message: error.message };
        }
      } else {
        // Crear nuevo perfil
        const { error } = await supabase
          .from('user_profiles')
          .insert({
            ...dataToSave,
            user_id: userId,
            created_at: new Date().toISOString()
          });
        
        if (error) {
          setLoading(false);
          return { success: false, message: error.message };
        }
      }

      await fetchProfile();
      setLoading(false);
      return { success: true, message: 'Perfil guardado correctamente' };
      
    } catch (err) {
      setLoading(false);
      setError('Error al guardar el perfil');
      return { success: false, message: 'Error al guardar el perfil' };
    }
  };

  // Eliminar perfil
  const deleteProfile = async () => {
    if (!userId || !profile) return { success: false, message: 'No hay perfil para eliminar' };
    
    setLoading(true);
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      setLoading(false);
      return { success: false, message: error.message };
    }
    
    setProfile(null);
    setLoading(false);
    return { success: true, message: 'Perfil eliminado correctamente' };
  };

  return {
    profile,
    loading,
    error,
    fetchProfile,
    saveProfile,
    deleteProfile,
  };
}