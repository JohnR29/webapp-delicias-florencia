import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Address } from './useAddresses';

export interface PuntoVentaPendiente extends Address {
  // Información del usuario que solicitó
  user_email?: string;
  user_name?: string;
}

export function useAdminPuntosVenta() {
  const [puntosPendientes, setPuntosPendientes] = useState<PuntoVentaPendiente[]>([]);
  const [puntosAprobados, setPuntosAprobados] = useState<PuntoVentaPendiente[]>([]);
  const [puntosRechazados, setPuntosRechazados] = useState<PuntoVentaPendiente[]>([]);
  const [todosPuntos, setTodosPuntos] = useState<PuntoVentaPendiente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener información de usuarios para los puntos
  const enrichPuntosWithUserInfo = async (addresses: Address[]) => {
    if (!addresses || addresses.length === 0) return [];

    try {
      const userIds = addresses.map(addr => addr.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, nombre, email')
        .in('id', userIds);

      if (profileError) {
        throw profileError;
      }

      // Mapear los datos combinando dirección con información del usuario
      return addresses.map(punto => {
        const userProfile = profiles?.find(p => p.id === punto.user_id);
        return {
          ...punto,
          user_email: userProfile?.email || 'No disponible',
          user_name: userProfile?.nombre || userProfile?.email || 'Usuario desconocido'
        };
      });
    } catch (profileError) {
      // Tabla profiles no disponible, usar información básica como fallback
      return addresses.map(punto => ({
        ...punto,
        user_email: punto.contacto || 'No disponible',
        user_name: punto.nombre || 'Usuario desconocido'
      }));
    }
  };

  // Obtener todos los puntos de venta por estado
  const fetchPuntosByEstado = async (estado: 'pendiente' | 'aprobado' | 'rechazado') => {
    try {
      const { data: addresses, error: addressError } = await supabase
        .from('addresses')
        .select('*')
        .eq('es_punto_venta_publico', true)
        .eq('estado_aprobacion', estado)
        .order('created_at', { ascending: false });
      
      if (addressError) {
        throw addressError;
      }

      return await enrichPuntosWithUserInfo(addresses || []);
    } catch (err) {
      console.error(`Error fetching puntos ${estado}:`, err);
      return [];
    }
  };

  // Obtener puntos de venta pendientes de aprobación
  const fetchPuntosPendientes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const puntos = await fetchPuntosByEstado('pendiente');
      setPuntosPendientes(puntos);
    } catch (err) {
      setError('Error al cargar puntos de venta pendientes');
      console.error('Error fetching puntos pendientes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Obtener puntos de venta aprobados
  const fetchPuntosAprobados = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const puntos = await fetchPuntosByEstado('aprobado');
      setPuntosAprobados(puntos);
    } catch (err) {
      setError('Error al cargar puntos de venta aprobados');
      console.error('Error fetching puntos aprobados:', err);
    } finally {
      setLoading(false);
    }
  };

  // Obtener puntos de venta rechazados
  const fetchPuntosRechazados = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const puntos = await fetchPuntosByEstado('rechazado');
      setPuntosRechazados(puntos);
    } catch (err) {
      setError('Error al cargar puntos de venta rechazados');
      console.error('Error fetching puntos rechazados:', err);
    } finally {
      setLoading(false);
    }
  };

  // Obtener todos los puntos de venta
  const fetchTodosPuntos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: addresses, error: addressError } = await supabase
        .from('addresses')
        .select('*')
        .eq('es_punto_venta_publico', true)
        .order('created_at', { ascending: false });
      
      if (addressError) {
        throw addressError;
      }

      const puntos = await enrichPuntosWithUserInfo(addresses || []);
      setTodosPuntos(puntos);
      
      // También actualizar listas por estado
      setPuntosPendientes(puntos.filter(p => p.estado_aprobacion === 'pendiente'));
      setPuntosAprobados(puntos.filter(p => p.estado_aprobacion === 'aprobado'));
      setPuntosRechazados(puntos.filter(p => p.estado_aprobacion === 'rechazado'));
    } catch (err) {
      setError('Error al cargar puntos de venta');
      console.error('Error fetching todos puntos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado de punto de venta
  const cambiarEstadoPuntoVenta = async (
    addressId: string, 
    nuevoEstado: 'pendiente' | 'aprobado' | 'rechazado',
    adminId: string, 
    comentarios?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const updateData: any = {
        estado_aprobacion: nuevoEstado,
        aprobado_por: adminId,
        fecha_aprobacion: new Date().toISOString(),
        comentarios_admin: comentarios
      };

      const { error } = await supabase
        .from('addresses')
        .update(updateData)
        .eq('id', addressId);

      if (error) {
        setError(error.message);
        return { success: false, message: error.message };
      }

      // Actualizar todas las listas locales
      const punto = todosPuntos.find(p => p.id === addressId);
      if (punto) {
        const puntoActualizado = { ...punto, ...updateData };
        
        // Remover de listas actuales
        setPuntosPendientes(prev => prev.filter(p => p.id !== addressId));
        setPuntosAprobados(prev => prev.filter(p => p.id !== addressId));
        setPuntosRechazados(prev => prev.filter(p => p.id !== addressId));
        
        // Agregar a nueva lista
        if (nuevoEstado === 'pendiente') {
          setPuntosPendientes(prev => [puntoActualizado, ...prev]);
        } else if (nuevoEstado === 'aprobado') {
          setPuntosAprobados(prev => [puntoActualizado, ...prev]);
        } else if (nuevoEstado === 'rechazado') {
          setPuntosRechazados(prev => [puntoActualizado, ...prev]);
        }

        // Actualizar lista completa
        setTodosPuntos(prev => 
          prev.map(p => p.id === addressId ? puntoActualizado : p)
        );
      }

      const mensajes = {
        aprobado: 'Punto de venta aprobado exitosamente',
        rechazado: 'Punto de venta rechazado',
        pendiente: 'Punto de venta marcado como pendiente'
      };

      return { success: true, message: mensajes[nuevoEstado] };
    } catch (err) {
      const errorMessage = `Error al cambiar estado del punto de venta`;
      setError(errorMessage);
      console.error('Error cambiando estado:', err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Aprobar punto de venta (mantener compatibilidad)
  const aprobarPuntoVenta = async (addressId: string, adminId: string, comentarios?: string) => {
    return await cambiarEstadoPuntoVenta(addressId, 'aprobado', adminId, comentarios);
  };

  // Rechazar punto de venta (mantener compatibilidad)
  const rechazarPuntoVenta = async (addressId: string, adminId: string, comentarios?: string) => {
    return await cambiarEstadoPuntoVenta(addressId, 'rechazado', adminId, comentarios);
  };

  // Editar punto de venta
  const editarPuntoVenta = async (addressId: string, datosActualizados: Partial<Address>) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('addresses')
        .update(datosActualizados)
        .eq('id', addressId);

      if (error) {
        setError(error.message);
        return { success: false, message: error.message };
      }

      // Actualizar en todas las listas locales
      const actualizarPunto = (punto: PuntoVentaPendiente) => 
        punto.id === addressId ? { ...punto, ...datosActualizados } : punto;

      setPuntosPendientes(prev => prev.map(actualizarPunto));
      setPuntosAprobados(prev => prev.map(actualizarPunto));
      setPuntosRechazados(prev => prev.map(actualizarPunto));
      setTodosPuntos(prev => prev.map(actualizarPunto));

      return { success: true, message: 'Punto de venta actualizado exitosamente' };
    } catch (err) {
      const errorMessage = 'Error al actualizar punto de venta';
      setError(errorMessage);
      console.error('Error editando punto de venta:', err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Eliminar punto de venta
  const eliminarPuntoVenta = async (addressId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) {
        setError(error.message);
        return { success: false, message: error.message };
      }

      // Remover de todas las listas locales
      const filtrarPunto = (puntos: PuntoVentaPendiente[]) => 
        puntos.filter(punto => punto.id !== addressId);

      setPuntosPendientes(filtrarPunto);
      setPuntosAprobados(filtrarPunto);
      setPuntosRechazados(filtrarPunto);
      setTodosPuntos(filtrarPunto);

      return { success: true, message: 'Punto de venta eliminado exitosamente' };
    } catch (err) {
      const errorMessage = 'Error al eliminar punto de venta';
      setError(errorMessage);
      console.error('Error eliminando punto de venta:', err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Obtener estadísticas
  const getEstadisticas = async () => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('estado_aprobacion')
        .eq('es_punto_venta_publico', true);

      if (error) return null;

      const stats = {
        total: data.length,
        pendientes: data.filter(p => p.estado_aprobacion === 'pendiente').length,
        aprobados: data.filter(p => p.estado_aprobacion === 'aprobado').length,
        rechazados: data.filter(p => p.estado_aprobacion === 'rechazado').length
      };

      return stats;
    } catch (err) {
      console.error('Error obteniendo estadísticas:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchTodosPuntos();
  }, []);

  return {
    // Estados
    puntosPendientes,
    puntosAprobados,
    puntosRechazados,
    todosPuntos,
    loading,
    error,
    
    // Funciones de fetch
    fetchPuntosPendientes,
    fetchPuntosAprobados,
    fetchPuntosRechazados,
    fetchTodosPuntos,
    
    // Funciones de gestión
    aprobarPuntoVenta,
    rechazarPuntoVenta,
    cambiarEstadoPuntoVenta,
    editarPuntoVenta,
    eliminarPuntoVenta,
    getEstadisticas
  };
}