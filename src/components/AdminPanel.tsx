'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { isAdminUser } from '@/lib/admin-config';

interface Order {
  id: number;
  created_at: string;
  status: string;
  customer_email: string;
  order_data: {
    businessInfo: {
      negocio: string;
      contacto: string;
      telefono: string;
      comuna: string;
      direccion: string;
      tipo: string;
    };
    totals: {
      totalCantidad: number;
      totalMonto: number;
    };
    products: Array<{
      nombre: string;
      formato: string;
      cantidad: number;
    }>;
  };
  dispatch_date?: string;
  dispatch_notes?: string;
  confirmed_at?: string;
}

const AdminPanel: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [dispatchDate, setDispatchDate] = useState('');
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'confirmed' | 'all'>('pending');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const statusParam = filter === 'all' ? '' : `?status=${filter}`;
      const response = await fetch(`/api/confirm-order${statusParam}`);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
      } else {
        alert('Error cargando pedidos: ' + data.message);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Error conectando con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!selectedOrder || !dispatchDate) {
      alert('Por favor selecciona una fecha de despacho');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/confirm-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          dispatchDate: dispatchDate,
          dispatchNotes: dispatchNotes,
          adminUserId: user?.id
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('¡Pedido confirmado exitosamente! Se envió correo al cliente.');
        setShowConfirmModal(false);
        setSelectedOrder(null);
        setDispatchDate('');
        setDispatchNotes('');
        fetchOrders(); // Recargar la lista
      } else {
        alert('Error confirmando pedido: ' + result.message);
      }
    } catch (error) {
      console.error('Error confirming order:', error);
      alert('Error enviando confirmación');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-green-100 text-green-800 border-green-300',
      dispatched: 'bg-blue-100 text-blue-800 border-blue-300',
      delivered: 'bg-purple-100 text-purple-800 border-purple-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300'
    };
    
    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      dispatched: 'Despachado',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full border ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  // Verificar si el usuario tiene permisos de admin
  const isAdmin = isAuthenticated && isAdminUser(user?.email);
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Acceso Restringido</h2>
          <p className="text-gray-600 mb-4">Necesitas iniciar sesión para acceder al panel de administración.</p>
          <p className="text-sm text-gray-500">Solo administradores autorizados pueden gestionar pedidos.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-red-600">Sin Permisos de Administrador</h2>
          <p className="text-gray-600 mb-4">Tu cuenta no tiene permisos para acceder al panel de administración.</p>
          <p className="text-sm text-gray-500">Contacta al administrador si necesitas acceso.</p>
          <div className="mt-4">
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-sm sm:text-base text-gray-600">Gestión de pedidos - Delicias Florencia</p>
                {user && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Administrador: {user.email}
                  </p>
                )}
              </div>
              
              {/* Desktop Controls */}
              <div className="hidden md:flex gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="pending">Pendientes</option>
                  <option value="confirmed">Confirmados</option>
                  <option value="all">Todos</option>
                </select>
                <button
                  onClick={fetchOrders}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  Actualizar
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  title="Volver al sitio principal"
                >
                  Inicio
                </button>
                <button
                  onClick={async () => {
                    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                      await logout();
                      window.location.href = '/';
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  title="Cerrar sesión"
                >
                  Cerrar Sesión
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden flex flex-col items-center justify-center w-8 h-8 space-y-1"
                aria-label="Abrir menú de opciones"
                aria-expanded={isMobileMenuOpen}
              >
                <span className={`block w-6 h-0.5 bg-gray-700 transition-transform ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                <span className={`block w-6 h-0.5 bg-gray-700 transition-opacity ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block w-6 h-0.5 bg-gray-700 transition-transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
              </button>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-96 pt-4' : 'max-h-0'}`}>
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-700">Filtrar pedidos:</label>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="pending">Pendientes</option>
                    <option value="confirmed">Confirmados</option>
                    <option value="all">Todos</option>
                  </select>
                </div>
                
                <button
                  onClick={() => {
                    fetchOrders();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  Actualizar Pedidos
                </button>
                
                <button
                  onClick={() => {
                    window.location.href = '/';
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Volver al Inicio
                </button>
                
                <button
                  onClick={async () => {
                    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                      await logout();
                      window.location.href = '/';
                    }
                  }}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-gray-600">Cargando pedidos...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay pedidos {filter === 'all' ? '' : filter === 'pending' ? 'pendientes' : 'confirmados'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pedido
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{String(order.id).padStart(4, '0')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {order.order_data?.businessInfo?.negocio || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.order_data?.businessInfo?.contacto || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.order_data?.businessInfo?.comuna || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${order.order_data?.totals?.totalMonto?.toLocaleString('es-CL') || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.order_data?.totals?.totalCantidad || 0} unidades
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('es-CL')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowConfirmModal(true);
                              }}
                              className="text-primary-600 hover:text-primary-900 mr-3"
                            >
                              Confirmar
                            </button>
                          )}
                          <button
                            onClick={() => {
                              // Mostrar detalles del pedido
                              alert(`Detalles del pedido #${String(order.id).padStart(4, '0')}:\n\n${JSON.stringify(order.order_data, null, 2)}`);
                            }}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Ver detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirmModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              Confirmar Pedido #{String(selectedOrder.id).padStart(4, '0')}
            </h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p><strong>Cliente:</strong> {selectedOrder.order_data?.businessInfo?.negocio}</p>
              <p><strong>Contacto:</strong> {selectedOrder.order_data?.businessInfo?.contacto}</p>
              <p><strong>Comuna:</strong> {selectedOrder.order_data?.businessInfo?.comuna}</p>
              <p><strong>Total:</strong> ${selectedOrder.order_data?.totals?.totalMonto?.toLocaleString('es-CL')}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Despacho *
              </label>
              <input
                type="date"
                value={dispatchDate}
                onChange={(e) => setDispatchDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Adicionales
              </label>
              <textarea
                value={dispatchNotes}
                onChange={(e) => setDispatchNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ej: Entregar en horario de mañana, confirmar recepción..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedOrder(null);
                  setDispatchDate('');
                  setDispatchNotes('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                disabled={processing}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={processing || !dispatchDate}
                className={`flex-1 px-4 py-2 rounded-md text-white transition-colors ${
                  processing || !dispatchDate
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {processing ? 'Procesando...' : 'Confirmar Pedido'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;