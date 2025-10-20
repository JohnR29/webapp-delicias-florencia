'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface UserProfile {
  id: string;
  nombre: string;
  email: string;
  phone?: string;
  business_name?: string;
  business_type?: string;
  email_verified: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  approval_date?: string;
  rejection_reason?: string;
  registered_at: string;
  approved_by_admin?: string;
  approval_history_count: number;
}

interface UserStats {
  total_users: number;
  pending_approval: number;
  approved_users: number;
  rejected_users: number;
  verified_emails: number;
  unverified_emails: number;
}

export const AdminUsuariosPanel: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total_users: 0,
    pending_approval: 0,
    approved_users: 0,
    rejected_users: 0,
    verified_emails: 0,
    unverified_emails: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | 'modify' | 'delete'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const [userUpdates, setUserUpdates] = useState<Partial<UserProfile>>({});
  const [processing, setProcessing] = useState(false);

  const { user } = useAuth();

  const fetchUsers = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
        setStats(data.stats);
      } else {
        alert('Error cargando usuarios: ' + data.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Error conectando con el servidor');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(u => {
    if (filter === 'all') return true;
    return u.approval_status === filter;
  });

  const handleAction = (user: UserProfile, action: 'approve' | 'reject' | 'modify' | 'delete') => {
    setSelectedUser(user);
    setModalAction(action);
    setRejectionReason('');
    setUserUpdates({
      nombre: user.nombre,
      phone: user.phone,
      business_name: user.business_name,
      business_type: user.business_type
    });
    setShowModal(true);
  };

  const executeAction = async () => {
    if (!selectedUser) {
      window.alert('No hay usuario seleccionado.');
      return;
    }
    if (!user) {
      window.alert('No tienes permisos de administrador para esta acción.');
      return;
    }
    if (modalAction === 'reject' && !rejectionReason.trim()) {
      window.alert('Debes ingresar una razón de rechazo.');
      return;
    }
    if (modalAction === 'modify' && (!userUpdates.nombre || !userUpdates.business_name)) {
      window.alert('Nombre y nombre de negocio son obligatorios.');
      return;
    }
    setProcessing(true);
    try {
      const endpoint = '/api/admin/users';
      const method = modalAction === 'delete' ? 'DELETE' : 'POST';
      const body = modalAction === 'delete'
        ? { userId: selectedUser.id, adminId: user.id }
        : {
            userId: selectedUser.id,
            adminId: user.id,
            action: modalAction,
            reason: rejectionReason,
            userUpdates: modalAction === 'modify' ? userUpdates : undefined
          };
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (result.success) {
        window.alert(result.message);
        setShowModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        window.alert('Error: ' + (result.message || 'Error desconocido.'));
      }
    } catch (error) {
      console.error('Error executing action:', error);
      window.alert('Error ejecutando la acción. Verifica tu conexión o permisos.');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string, verified: boolean) => {
    const verifiedIcon = verified ? '✓' : '✗';
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300'
    };
    const labels = {
      pending: 'Pendiente',
      approved: 'Aprobado',
      rejected: 'Rechazado'
    };
    return (
      <div className="flex items-center gap-2" role="status" aria-label={`Estado: ${labels[status as keyof typeof labels]}`}> 
        <span className={`px-2 py-1 text-xs rounded-full border ${styles[status as keyof typeof styles]}`}>{labels[status as keyof typeof labels]}</span>
        <span className={`text-xs ${verified ? 'text-green-600' : 'text-red-600'}`} title={verified ? 'Email verificado' : 'Email no verificado'} aria-label={verified ? 'Email verificado' : 'Email no verificado'}>
          {verifiedIcon}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="mt-2 text-gray-600">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">{stats.total_users}</div>
          <div className="text-sm text-blue-600">Total</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-700">{stats.pending_approval}</div>
          <div className="text-sm text-yellow-600">Pendientes</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-700">{stats.approved_users}</div>
          <div className="text-sm text-green-600">Aprobados</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-700">{stats.rejected_users}</div>
          <div className="text-sm text-red-600">Rechazados</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">{stats.verified_emails}</div>
          <div className="text-sm text-blue-600">Verificados</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-700">{stats.unverified_emails}</div>
          <div className="text-sm text-gray-600">Sin verificar</div>
        </div>
      </div>

      {/* Filtros y controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Todos los usuarios</option>
            <option value="pending">Pendientes de aprobación</option>
            <option value="approved">Usuarios aprobados</option>
            <option value="rejected">Usuarios rechazados</option>
          </select>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Actualizar
          </button>
        </div>
        <div className="text-sm text-gray-600">
          Mostrando {filteredUsers.length} de {users.length} usuarios
        </div>
      </div>

      {/* Lista de usuarios */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay usuarios {filter === 'all' ? '' : filter === 'pending' ? 'pendientes' : filter === 'approved' ? 'aprobados' : 'rechazados'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white shadow rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Negocio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.nombre || 'Sin nombre'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.email}
                    </div>
                    {user.phone && (
                      <div className="text-sm text-gray-500">
                        📞 {user.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.business_name || 'No especificado'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.business_type || 'Tipo no especificado'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.approval_status, user.email_verified)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{new Date(user.registered_at).toLocaleDateString('es-CL')}</div>
                    {user.approval_date && (
                      <div className="text-xs text-gray-400">
                        Procesado: {new Date(user.approval_date).toLocaleDateString('es-CL')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col sm:flex-row gap-1">
                      {user.approval_status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction(user, 'approve')}
                            className="text-green-600 hover:text-green-900 text-xs px-2 py-1 border border-green-200 rounded hover:bg-green-50"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleAction(user, 'reject')}
                            className="text-red-600 hover:text-red-900 text-xs px-2 py-1 border border-red-200 rounded hover:bg-red-50"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleAction(user, 'modify')}
                        className="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
                      >
                        Modificar
                      </button>
                      <button
                        onClick={() => handleAction(user, 'delete')}
                        className="text-gray-600 hover:text-gray-900 text-xs px-2 py-1 border border-gray-200 rounded hover:bg-gray-50"
                      >
                        Eliminar
                      </button>
                    </div>
                    {user.rejection_reason && (
                      <div className="mt-1 text-xs text-red-600 max-w-xs truncate" title={user.rejection_reason}>
                        Razón: {user.rejection_reason}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de acciones */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">
              {modalAction === 'approve' && 'Aprobar Usuario'}
              {modalAction === 'reject' && 'Rechazar Usuario'}
              {modalAction === 'modify' && 'Modificar Usuario'}
              {modalAction === 'delete' && 'Eliminar Usuario'}
            </h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p><strong>Nombre:</strong> {selectedUser.nombre}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Negocio:</strong> {selectedUser.business_name}</p>
              <p><strong>Estado actual:</strong> {selectedUser.approval_status}</p>
            </div>

            {modalAction === 'reject' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razón del rechazo <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Explica por qué se rechaza la solicitud..."
                  required
                />
              </div>
            )}

            {modalAction === 'modify' && (
              <div className="mb-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                  <input
                    type="text"
                    value={userUpdates.nombre || ''}
                    onChange={(e) => setUserUpdates(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="text"
                    value={userUpdates.phone || ''}
                    onChange={(e) => setUserUpdates(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Negocio</label>
                  <input
                    type="text"
                    value={userUpdates.business_name || ''}
                    onChange={(e) => setUserUpdates(prev => ({ ...prev, business_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Negocio</label>
                  <select
                    value={userUpdates.business_type || ''}
                    onChange={(e) => setUserUpdates(prev => ({ ...prev, business_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Almacén">Almacén</option>
                    <option value="Minimarket">Minimarket</option>
                    <option value="Pastelería">Pastelería</option>
                    <option value="Cafetería">Cafetería</option>
                    <option value="Restaurante">Restaurante</option>
                    <option value="Panadería">Panadería</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>
            )}

            {modalAction === 'delete' && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">
                  ⚠️ <strong>Acción irreversible:</strong> Se eliminará el usuario completamente del sistema.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                disabled={processing}
              >
                Cancelar
              </button>
              <button
                onClick={executeAction}
                disabled={processing || (modalAction === 'reject' && !rejectionReason.trim())}
                className={`flex-1 px-4 py-2 rounded-md text-white transition-colors ${
                  processing || (modalAction === 'reject' && !rejectionReason.trim())
                    ? 'bg-gray-400 cursor-not-allowed'
                    : modalAction === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700'
                      : modalAction === 'reject'
                        ? 'bg-red-600 hover:bg-red-700'
                        : modalAction === 'delete'
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {processing ? 'Procesando...' : 
                 modalAction === 'approve' ? 'Aprobar Usuario' :
                 modalAction === 'reject' ? 'Rechazar Usuario' :
                 modalAction === 'modify' ? 'Guardar Cambios' :
                 'Eliminar Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};