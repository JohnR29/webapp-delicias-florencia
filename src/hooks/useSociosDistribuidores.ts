import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface SocioDistribuidor {
  user_id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  es_punto_venta_publico: boolean;
  nombre_comercial: string;
  descripcion_negocio?: string;
  horario_atencion?: string;
  permite_pedidos_directos: boolean;
  telefono_negocio?: string;
  email_negocio?: string;
  address_id: string;
  nombre_direccion: string;
  negocio: string;
  contacto: string;
  telefono_direccion: string;
  tipo: string;
  comuna: string;
  direccion: string;
  direccion_punto_venta: boolean;
  visible_en_mapa: boolean;
}

export function useSociosDistribuidores() {
  const [socios, setSocios] = useState<SocioDistribuidor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener todos los socios distribuidores activos
  const fetchSocios = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('socios_distribuidores_activos')
        .select('*')
        .order('comuna', { ascending: true })
        .order('nombre_comercial', { ascending: true });
      
      if (error) {
        setError(error.message);
      } else {
        setSocios(data || []);
      }
    } catch (err) {
      setError('Error al cargar socios distribuidores');
    } finally {
      setLoading(false);
    }
  };

  // Obtener socios por comuna específica
  const fetchSociosByComuna = async (comuna: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('socios_distribuidores_activos')
        .select('*')
        .eq('comuna', comuna)
        .order('nombre_comercial', { ascending: true });
      
      if (error) {
        setError(error.message);
      } else {
        setSocios(data || []);
      }
    } catch (err) {
      setError('Error al cargar socios distribuidores por comuna');
    } finally {
      setLoading(false);
    }
  };

  // Buscar socios por texto (nombre comercial, descripción, etc.)
  const searchSocios = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      await fetchSocios();
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('socios_distribuidores_activos')
        .select('*')
        .or(`nombre_comercial.ilike.%${searchTerm}%,descripcion_negocio.ilike.%${searchTerm}%,negocio.ilike.%${searchTerm}%`)
        .order('nombre_comercial', { ascending: true });
      
      if (error) {
        setError(error.message);
      } else {
        setSocios(data || []);
      }
    } catch (err) {
      setError('Error al buscar socios distribuidores');
    } finally {
      setLoading(false);
    }
  };

  // Obtener un socio específico por ID de dirección
  const getSocioByAddressId = async (addressId: string): Promise<SocioDistribuidor | null> => {
    try {
      const { data, error } = await supabase
        .from('socios_distribuidores_activos')
        .select('*')
        .eq('address_id', addressId)
        .single();
      
      if (error) {
        console.error('Error al obtener socio:', error.message);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('Error al obtener socio:', err);
      return null;
    }
  };

  // Obtener estadísticas básicas
  const getEstadisticas = async () => {
    try {
      const { data, error } = await supabase
        .from('socios_distribuidores_activos')
        .select('comuna, permite_pedidos_directos');
      
      if (error) return null;
      
      // Contar por comuna
      const porComuna = data.reduce((acc, socio) => {
        acc[socio.comuna] = (acc[socio.comuna] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Contar los que permiten pedidos directos
      const conPedidosDirectos = data.filter(s => s.permite_pedidos_directos).length;
      
      return {
        total: data.length,
        porComuna,
        conPedidosDirectos,
        sinPedidosDirectos: data.length - conPedidosDirectos
      };
    } catch (err) {
      console.error('Error al obtener estadísticas:', err);
      return null;
    }
  };

  // Cargar socios al montar el componente
  useEffect(() => {
    fetchSocios();
  }, []);

  return {
    socios,
    loading,
    error,
    fetchSocios,
    fetchSociosByComuna,
    searchSocios,
    getSocioByAddressId,
    getEstadisticas,
    // Datos derivados útiles
    totalSocios: socios.length,
    comunasDisponibles: Array.from(new Set(socios.map(s => s.comuna))).sort(),
    sociosConPedidosDirectos: socios.filter(s => s.permite_pedidos_directos),
  };
}