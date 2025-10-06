import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { SocioDistribuidorPendiente, AprobacionSocioData } from '../lib/types';

export function useAdminSocios() {
  const [sociosPendientes, setSociosPendientes] = useState<SocioDistribuidorPendiente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener socios pendientes de aprobación
  const fetchSociosPendientes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('socios_distribuidores_pendientes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        setError(error.message);
      } else {
        setSociosPendientes(data || []);
      }
    } catch (err) {
      setError('Error al cargar socios pendientes');
      console.error('Error fetching socios pendientes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Aprobar socio distribuidor
  const aprobarSocio = async (userId: string, adminId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Usar la función SQL para aprobar
      const { data, error } = await supabase.rpc('aprobar_socio_distribuidor', {
        socio_user_id: userId,
        admin_user_id: adminId
      });

      if (error) {
        setError(error.message);
        return { success: false, message: error.message };
      }

      // Actualizar la lista local
      await fetchSociosPendientes();
      
      return { success: true, message: 'Socio distribuidor aprobado correctamente' };
    } catch (err) {
      const errorMsg = 'Error al aprobar socio distribuidor';
      setError(errorMsg);
      console.error('Error aproving socio:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Rechazar socio distribuidor
  const rechazarSocio = async (userId: string, adminId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Usar la función SQL para rechazar
      const { data, error } = await supabase.rpc('rechazar_socio_distribuidor', {
        socio_user_id: userId,
        admin_user_id: adminId
      });

      if (error) {
        setError(error.message);
        return { success: false, message: error.message };
      }

      // Actualizar la lista local
      await fetchSociosPendientes();
      
      return { success: true, message: 'Socio distribuidor rechazado' };
    } catch (err) {
      const errorMsg = 'Error al rechazar socio distribuidor';
      setError(errorMsg);
      console.error('Error rejecting socio:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Obtener estadísticas de socios
  const getEstadisticasSocios = async () => {
    try {
      // Contar socios aprobados
      const { count: aprobados, error: errorAprobados } = await supabase
        .from('socios_distribuidores_activos')
        .select('*', { count: 'exact', head: true });

      // Contar socios pendientes
      const { count: pendientes, error: errorPendientes } = await supabase
        .from('socios_distribuidores_pendientes')
        .select('*', { count: 'exact', head: true });

      if (errorAprobados || errorPendientes) {
        throw new Error('Error al obtener estadísticas');
      }

      return {
        aprobados: aprobados || 0,
        pendientes: pendientes || 0,
        total: (aprobados || 0) + (pendientes || 0)
      };
    } catch (err) {
      console.error('Error getting estadisticas:', err);
      return { aprobados: 0, pendientes: 0, total: 0 };
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchSociosPendientes();
  }, []);

  return {
    sociosPendientes,
    loading,
    error,
    fetchSociosPendientes,
    aprobarSocio,
    rechazarSocio,
    getEstadisticasSocios,
  };
}