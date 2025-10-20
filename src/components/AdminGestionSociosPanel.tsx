import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

interface Socio {
  id: string;
  email: string;
  created_at: string;
  user_metadata: {
    full_name?: string;
    display_name?: string;
  };
  direcciones_count: number;
  ultimo_pedido?: string;
  estado: 'activo' | 'inactivo';
}

interface Direccion {
  id: string;
  nombre: string;
  nombre_comercial?: string;
  contacto: string;
  telefono: string;
  telefono_negocio?: string;
  comuna: string;
  direccion: string;
  tipo_negocio?: string;
  es_punto_venta_publico: boolean;
  estado_aprobacion?: string;
  created_at: string;
}

export function AdminGestionSociosPanel() {
  const { user } = useAuth();
  const [socios, setSocios] = useState<Socio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSocio, setSelectedSocio] = useState<Socio | null>(null);
  const [direccionesSocio, setDireccionesSocio] = useState<Direccion[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<{ full_name: string; email: string }>({ full_name: '', email: '' });
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    fetchSocios();
  }, []);

  const fetchSocios = async () => {
    try {
      setLoading(true);
      setError(null);

      // Llamar a la API para obtener socios
      const response = await fetch('/api/admin/socios');
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error cargando socios');
      }

      setSocios(data.socios || []);
    } catch (err: any) {
      console.error('Error fetching socios:', err);
      setError(err.message || 'Error cargando socios');
    } finally {
      setLoading(false);
    }
  };

  const fetchDireccionesSocio = async (socioId: string) => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', socioId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDireccionesSocio(data || []);
    } catch (err: any) {
      console.error('Error fetching direcciones:', err);
      setError(err.message || 'Error cargando direcciones del socio');
    }
  };

  const handleViewDetails = async (socio: Socio) => {
    setSelectedSocio(socio);
    await fetchDireccionesSocio(socio.id);
    setShowDetailModal(true);
  };

  const handleEditSocio = (socio: Socio) => {
    setSelectedSocio(socio);
    setEditForm({
      full_name: socio.user_metadata?.full_name || socio.user_metadata?.display_name || '',
      email: socio.email
    });
    setShowEditModal(true);
  };

  const handleUpdateSocio = async () => {
    if (!selectedSocio) {
      window.alert('No hay socio seleccionado para editar.');
      return;
    }
    if (!editForm.full_name || !editForm.email) {
      window.alert('Completa todos los campos obligatorios: nombre completo y email.');
      return;
    }
    setProcesando(true);
    try {
      // Por ahora, solo mostrar mensaje ya que la actualización requiere auth.admin
      window.alert('Funcionalidad de edición temporalmente deshabilitada. Requiere configuración adicional de permisos.');
      setShowEditModal(false);
      setSelectedSocio(null);
    } catch (err: any) {
      console.error('Error updating socio:', err);
      window.alert('Error actualizando socio: ' + err.message);
    } finally {
      setProcesando(false);
    }
  };

  const handleDeleteSocio = async (socio: Socio) => {
    if (!window.confirm(`¿Estás seguro de eliminar todas las direcciones del socio ${socio.email}? Esta acción no se puede deshacer.`)) {
      return;
    }
    setProcesando(true);
    try {
      const { error: addressError } = await supabase
        .from('addresses')
        .delete()
        .eq('user_id', socio.id);
      if (addressError) throw addressError;
      window.alert('Direcciones del socio eliminadas exitosamente');
      await fetchSocios();
    } catch (err: any) {
      console.error('Error deleting socio addresses:', err);
      window.alert('Error eliminando direcciones del socio: ' + err.message);
    } finally {
      setProcesando(false);
    }
  };

  const handleDeleteDireccion = async (direccionId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta dirección?')) return;
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', direccionId);
      if (error) throw error;
      window.alert('Dirección eliminada exitosamente');
      if (selectedSocio) {
        await fetchDireccionesSocio(selectedSocio.id);
        await fetchSocios();
      }
    } catch (err: any) {
      console.error('Error deleting direccion:', err);
      window.alert('Error eliminando dirección: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Gestión de Socios Distribuidores</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Gestión de Socios Distribuidores</h2>
        <button
          onClick={fetchSocios}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Total Socios</p>
          <p className="text-2xl font-bold text-blue-800">{socios.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Con Direcciones</p>
          <p className="text-2xl font-bold text-green-800">
            {socios.filter(s => s.direcciones_count > 0).length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-600 font-medium">Total Direcciones</p>
          <p className="text-2xl font-bold text-yellow-800">
            {socios.reduce((acc, s) => acc + s.direcciones_count, 0)}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Tabla de socios */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Socio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Direcciones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {socios.map((socio) => (
                <tr key={socio.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {socio.user_metadata?.full_name || 'Socio Distribuidor'}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {socio.id.substring(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{socio.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {socio.direcciones_count} direcciones
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(socio.created_at).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800"
                      aria-label="Estado: Activo"
                      role="status"
                    >
                      Activo
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleViewDetails(socio)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Ver Detalles
                    </button>
                    <button
                      onClick={() => handleDeleteSocio(socio)}
                      className="text-red-600 hover:text-red-900"
                      disabled={procesando}
                      title="Eliminar direcciones del socio"
                    >
                      Eliminar Direcciones
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {socios.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay socios registrados</p>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {showDetailModal && selectedSocio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold">Detalles del Socio</h3>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
              <div className="space-y-6">
                {/* Información del socio */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Información Personal</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><span className="font-medium">Nombre:</span> {selectedSocio.user_metadata?.full_name || 'No registrado'}</p>
                      <p><span className="font-medium">Email:</span> {selectedSocio.email}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">Registro:</span> {new Date(selectedSocio.created_at).toLocaleDateString('es-CL')}</p>
                      <p><span className="font-medium">ID:</span> {selectedSocio.id}</p>
                    </div>
                  </div>
                </div>

                {/* Direcciones del socio */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Direcciones ({direccionesSocio.length})
                  </h4>
                  
                  {direccionesSocio.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No tiene direcciones registradas</p>
                  ) : (
                    <div className="space-y-3">
                      {direccionesSocio.map((direccion) => (
                        <div key={direccion.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h5 className="font-medium text-gray-900">
                                {direccion.nombre_comercial || direccion.nombre}
                              </h5>
                              {direccion.es_punto_venta_publico && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  Punto de venta público
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteDireccion(direccion.id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Eliminar
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                            <div>
                              <p><span className="font-medium">Dirección:</span> {direccion.direccion}</p>
                              <p><span className="font-medium">Comuna:</span> {direccion.comuna}</p>
                              <p><span className="font-medium">Contacto:</span> {direccion.contacto}</p>
                            </div>
                            <div>
                              <p><span className="font-medium">Teléfono:</span> {direccion.telefono}</p>
                              {direccion.telefono_negocio && (
                                <p><span className="font-medium">Tel. Negocio:</span> {direccion.telefono_negocio}</p>
                              )}
                              {direccion.tipo_negocio && (
                                <p><span className="font-medium">Tipo:</span> {direccion.tipo_negocio}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición */}
      {showEditModal && selectedSocio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold">Editar Socio</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={procesando}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateSocio}
                  disabled={procesando}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  {procesando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}