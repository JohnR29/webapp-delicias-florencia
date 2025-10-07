import React, { useState, useEffect } from 'react';
import { useAdminPuntosVenta, PuntoVentaPendiente } from '../hooks/useAdminPuntosVenta';
import { useAuth } from '../hooks/useAuth';
import { Address } from '../hooks/useAddresses';

interface EstadisticasPuntosVenta {
  total: number;
  pendientes: number;
  aprobados: number;
  rechazados: number;
}

type TabType = 'pendientes' | 'aprobados' | 'rechazados';

export function AdminPuntosVentaPanel() {
  const { user } = useAuth();
  const { 
    puntosPendientes,
    puntosAprobados,
    puntosRechazados,
    todosPuntos,
    loading, 
    error, 
    fetchTodosPuntos,
    aprobarPuntoVenta, 
    rechazarPuntoVenta,
    cambiarEstadoPuntoVenta,
    editarPuntoVenta,
    eliminarPuntoVenta,
    getEstadisticas 
  } = useAdminPuntosVenta();
  
  const [tabActiva, setTabActiva] = useState<TabType>('pendientes');
  const [estadisticas, setEstadisticas] = useState<EstadisticasPuntosVenta | null>(null);
  const [comentarios, setComentarios] = useState<Record<string, string>>({});
  const [procesando, setProcesando] = useState<Record<string, boolean>>({});
  const [puntoEditando, setPuntoEditando] = useState<PuntoVentaPendiente | null>(null);
  const [puntoEliminando, setPuntoEliminando] = useState<PuntoVentaPendiente | null>(null);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarConfirmacionEliminacion, setMostrarConfirmacionEliminacion] = useState(false);
  const [datosEdicion, setDatosEdicion] = useState<Partial<Address>>({});

  // Cargar estadísticas
  useEffect(() => {
    const cargarEstadisticas = async () => {
      const stats = await getEstadisticas();
      setEstadisticas(stats);
    };
    cargarEstadisticas();
  }, [todosPuntos]);

  // Obtener lista actual según pestaña activa
  const getPuntosActuales = () => {
    switch (tabActiva) {
      case 'pendientes':
        return puntosPendientes;
      case 'aprobados':
        return puntosAprobados;
      case 'rechazados':
        return puntosRechazados;
      default:
        return [];
    }
  };

  // Abrir modal de edición
  const abrirModalEdicion = (punto: PuntoVentaPendiente) => {
    setPuntoEditando(punto);
    setDatosEdicion({
      nombre_comercial: punto.nombre_comercial,
      direccion: punto.direccion,
      comuna: punto.comuna,
      contacto: punto.contacto,
      telefono: punto.telefono,
      telefono_negocio: punto.telefono_negocio,
      email_negocio: punto.email_negocio,
      whatsapp_negocio: punto.whatsapp_negocio,
      descripcion_negocio: punto.descripcion_negocio,
      horario_atencion: punto.horario_atencion,
      tipo_negocio: punto.tipo_negocio
    });
    setMostrarModalEdicion(true);
  };

  // Confirmar eliminación
  const confirmarEliminacion = (punto: PuntoVentaPendiente) => {
    setPuntoEliminando(punto);
    setMostrarConfirmacionEliminacion(true);
  };

  // Guardar edición
  const guardarEdicion = async () => {
    if (!puntoEditando) return;

    setProcesando(prev => ({ ...prev, [puntoEditando.id]: true }));
    
    try {
      const result = await editarPuntoVenta(puntoEditando.id, datosEdicion);
      
      if (result.success) {
        // Actualizar estadísticas
        const stats = await getEstadisticas();
        setEstadisticas(stats);
        setMostrarModalEdicion(false);
        setPuntoEditando(null);
        setDatosEdicion({});
      }
    } finally {
      setProcesando(prev => ({ ...prev, [puntoEditando.id]: false }));
    }
  };

  // Ejecutar eliminación
  const ejecutarEliminacion = async () => {
    if (!puntoEliminando) return;

    setProcesando(prev => ({ ...prev, [puntoEliminando.id]: true }));
    
    try {
      const result = await eliminarPuntoVenta(puntoEliminando.id);
      
      if (result.success) {
        // Actualizar estadísticas
        const stats = await getEstadisticas();
        setEstadisticas(stats);
        setMostrarConfirmacionEliminacion(false);
        setPuntoEliminando(null);
      }
    } finally {
      setProcesando(prev => ({ ...prev, [puntoEliminando.id]: false }));
    }
  };

  // Cambiar estado de punto
  const cambiarEstado = async (punto: PuntoVentaPendiente, nuevoEstado: 'pendiente' | 'aprobado' | 'rechazado') => {
    if (!user?.id) return;
    
    setProcesando(prev => ({ ...prev, [punto.id]: true }));
    
    try {
      const result = await cambiarEstadoPuntoVenta(
        punto.id, 
        nuevoEstado,
        user.id, 
        comentarios[punto.id]
      );
      
      if (result.success) {
        // Actualizar estadísticas
        const stats = await getEstadisticas();
        setEstadisticas(stats);
        // Limpiar comentario
        setComentarios(prev => {
          const nuevo = { ...prev };
          delete nuevo[punto.id];
          return nuevo;
        });
      }
    } finally {
      setProcesando(prev => ({ ...prev, [punto.id]: false }));
    }
  };

  const handleAprobar = async (punto: PuntoVentaPendiente) => {
    await cambiarEstado(punto, 'aprobado');
  };

  const handleRechazar = async (punto: PuntoVentaPendiente) => {
    await cambiarEstado(punto, 'rechazado');
  };

  if (loading && puntosPendientes.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Puntos de Venta - Aprobaciones</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Gestión de Puntos de Venta</h2>
        <button
          onClick={fetchTodosPuntos}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* Pestañas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'pendientes', label: 'Pendientes', count: estadisticas?.pendientes },
            { key: 'aprobados', label: 'Aprobados', count: estadisticas?.aprobados },
            { key: 'rechazados', label: 'Rechazados', count: estadisticas?.rechazados }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTabActiva(key as TabType)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                tabActiva === key
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {label} {count !== undefined && `(${count})`}
            </button>
          ))}
        </nav>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Total</p>
            <p className="text-2xl font-bold text-blue-800">{estadisticas.total}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-600 font-medium">⏳ Pendientes</p>
            <p className="text-2xl font-bold text-yellow-800">{estadisticas.pendientes}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">✅ Aprobados</p>
            <p className="text-2xl font-bold text-green-800">{estadisticas.aprobados}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-600 font-medium">❌ Rechazados</p>
            <p className="text-2xl font-bold text-red-800">{estadisticas.rechazados}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Lista de puntos según pestaña activa */}
      {getPuntosActuales().length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">
            {tabActiva === 'pendientes' && 'No hay puntos de venta pendientes de aprobación'}
            {tabActiva === 'aprobados' && 'No hay puntos de venta aprobados'}
            {tabActiva === 'rechazados' && 'No hay puntos de venta rechazados'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {tabActiva === 'pendientes' && `Solicitudes Pendientes (${puntosPendientes.length})`}
            {tabActiva === 'aprobados' && `Puntos Aprobados (${puntosAprobados.length})`}
            {tabActiva === 'rechazados' && `Puntos Rechazados (${puntosRechazados.length})`}
          </h3>
          
          {getPuntosActuales().map((punto) => (
            <div key={punto.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="space-y-4">
                {/* Información del solicitante */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {punto.nombre_comercial || 'Sin nombre comercial'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Solicitado por: {punto.user_name || 'Usuario desconocido'} ({punto.user_email})
                    </p>
                    <p className="text-xs text-gray-500">
                      Fecha solicitud: {new Date(punto.created_at || '').toLocaleDateString('es-CL')}
                    </p>
                    {punto.fecha_aprobacion && (
                      <p className="text-xs text-gray-500">
                        Fecha {punto.estado_aprobacion}: {new Date(punto.fecha_aprobacion).toLocaleDateString('es-CL')}
                      </p>
                    )}
                    {punto.comentarios_admin && (
                      <p className="text-xs text-gray-600 mt-1">
                        <span className="font-medium">Comentarios admin:</span> {punto.comentarios_admin}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    punto.estado_aprobacion === 'pendiente' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : punto.estado_aprobacion === 'aprobado'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {punto.estado_aprobacion === 'pendiente' && '⏳ Pendiente'}
                    {punto.estado_aprobacion === 'aprobado' && '✅ Aprobado'}
                    {punto.estado_aprobacion === 'rechazado' && '❌ Rechazado'}
                  </span>
                </div>

                {/* Información de ubicación */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Información del Punto de Venta:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><span className="font-medium">Dirección:</span> {punto.direccion}</p>
                      <p><span className="font-medium">Comuna:</span> {punto.comuna}</p>
                      <p><span className="font-medium">Contacto:</span> {punto.contacto}</p>
                      <p><span className="font-medium">Teléfono personal:</span> {punto.telefono}</p>
                    </div>
                    <div>
                      {punto.telefono_negocio && (
                        <p><span className="font-medium">Teléfono negocio:</span> {punto.telefono_negocio}</p>
                      )}
                      {punto.email_negocio && (
                        <p><span className="font-medium">Email negocio:</span> {punto.email_negocio}</p>
                      )}
                      {punto.whatsapp_negocio && (
                        <p><span className="font-medium">WhatsApp negocio:</span> {punto.whatsapp_negocio}</p>
                      )}
                      {punto.descripcion_negocio && (
                        <p><span className="font-medium">Descripción:</span> {punto.descripcion_negocio}</p>
                      )}
                      {punto.horario_atencion && (
                        <p><span className="font-medium">Horario:</span> {punto.horario_atencion}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Campo de comentarios */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comentarios (opcional):
                  </label>
                  <textarea
                    value={comentarios[punto.id] || ''}
                    onChange={(e) => setComentarios(prev => ({
                      ...prev,
                      [punto.id]: e.target.value
                    }))}
                    placeholder="Agregar comentarios sobre la aprobación o rechazo..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={2}
                  />
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2 flex-wrap">
                  {/* Botón editar - disponible para todos */}
                  <button
                    onClick={() => abrirModalEdicion(punto)}
                    disabled={procesando[punto.id]}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    ✏️ Editar
                  </button>

                  {/* Botones específicos por estado */}
                  {punto.estado_aprobacion === 'pendiente' && (
                    <>
                      <button
                        onClick={() => handleAprobar(punto)}
                        disabled={procesando[punto.id]}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                      >
                        {procesando[punto.id] ? 'Procesando...' : '✅ Aprobar'}
                      </button>
                      <button
                        onClick={() => handleRechazar(punto)}
                        disabled={procesando[punto.id]}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                      >
                        {procesando[punto.id] ? 'Procesando...' : '❌ Rechazar'}
                      </button>
                    </>
                  )}

                  {punto.estado_aprobacion === 'aprobado' && (
                    <>
                      <button
                        onClick={() => cambiarEstado(punto, 'pendiente')}
                        disabled={procesando[punto.id]}
                        className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                      >
                        {procesando[punto.id] ? 'Procesando...' : '⏳ Marcar Pendiente'}
                      </button>
                      <button
                        onClick={() => cambiarEstado(punto, 'rechazado')}
                        disabled={procesando[punto.id]}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                      >
                        {procesando[punto.id] ? 'Procesando...' : '❌ Rechazar'}
                      </button>
                      <button
                        onClick={() => confirmarEliminacion(punto)}
                        disabled={procesando[punto.id]}
                        className="bg-red-800 hover:bg-red-900 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                      >
                        🗑️ Eliminar
                      </button>
                    </>
                  )}

                  {punto.estado_aprobacion === 'rechazado' && (
                    <>
                      <button
                        onClick={() => cambiarEstado(punto, 'pendiente')}
                        disabled={procesando[punto.id]}
                        className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                      >
                        {procesando[punto.id] ? 'Procesando...' : '⏳ Marcar Pendiente'}
                      </button>
                      <button
                        onClick={() => cambiarEstado(punto, 'aprobado')}
                        disabled={procesando[punto.id]}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                      >
                        {procesando[punto.id] ? 'Procesando...' : '✅ Aprobar'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Edición */}
      {mostrarModalEdicion && puntoEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                Editar Punto de Venta
              </h3>
            </div>
            
            <div className="px-6 py-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Comercial
                  </label>
                  <input
                    type="text"
                    value={datosEdicion.nombre_comercial || ''}
                    onChange={(e) => setDatosEdicion(prev => ({
                      ...prev,
                      nombre_comercial: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={datosEdicion.direccion || ''}
                    onChange={(e) => setDatosEdicion(prev => ({
                      ...prev,
                      direccion: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comuna
                  </label>
                  <input
                    type="text"
                    value={datosEdicion.comuna || ''}
                    onChange={(e) => setDatosEdicion(prev => ({
                      ...prev,
                      comuna: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contacto
                  </label>
                  <input
                    type="text"
                    value={datosEdicion.contacto || ''}
                    onChange={(e) => setDatosEdicion(prev => ({
                      ...prev,
                      contacto: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono Personal
                  </label>
                  <input
                    type="text"
                    value={datosEdicion.telefono || ''}
                    onChange={(e) => setDatosEdicion(prev => ({
                      ...prev,
                      telefono: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono Negocio
                  </label>
                  <input
                    type="text"
                    value={datosEdicion.telefono_negocio || ''}
                    onChange={(e) => setDatosEdicion(prev => ({
                      ...prev,
                      telefono_negocio: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Negocio
                  </label>
                  <input
                    type="email"
                    value={datosEdicion.email_negocio || ''}
                    onChange={(e) => setDatosEdicion(prev => ({
                      ...prev,
                      email_negocio: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp Negocio
                  </label>
                  <input
                    type="text"
                    value={datosEdicion.whatsapp_negocio || ''}
                    onChange={(e) => setDatosEdicion(prev => ({
                      ...prev,
                      whatsapp_negocio: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Negocio
                  </label>
                  <select
                    value={datosEdicion.tipo_negocio || ''}
                    onChange={(e) => setDatosEdicion(prev => ({
                      ...prev,
                      tipo_negocio: e.target.value as 'Almacén' | 'Minimarket' | 'Pastelería' | 'Cafetería' | 'Otro' | undefined
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Seleccionar tipo de negocio</option>
                    <option value="Almacén">Almacén</option>
                    <option value="Minimarket">Minimarket</option>
                    <option value="Pastelería">Pastelería</option>
                    <option value="Cafetería">Cafetería</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción del Negocio
                  </label>
                  <textarea
                    value={datosEdicion.descripcion_negocio || ''}
                    onChange={(e) => setDatosEdicion(prev => ({
                      ...prev,
                      descripcion_negocio: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horario de Atención
                  </label>
                  <input
                    type="text"
                    value={datosEdicion.horario_atencion || ''}
                    onChange={(e) => setDatosEdicion(prev => ({
                      ...prev,
                      horario_atencion: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ej: Lunes a Viernes 9:00 - 18:00"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setMostrarModalEdicion(false);
                  setPuntoEditando(null);
                  setDatosEdicion({});
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardarEdicion}
                disabled={procesando[puntoEditando.id]}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {procesando[puntoEditando.id] ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {mostrarConfirmacionEliminacion && puntoEliminando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar Eliminación
              </h3>
            </div>
            
            <div className="px-6 py-4">
              <p className="text-gray-700 mb-4">
                ¿Estás seguro de que deseas eliminar permanentemente este punto de venta?
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900">
                  {puntoEliminando.nombre_comercial || 'Sin nombre comercial'}
                </p>
                <p className="text-sm text-gray-600">
                  {puntoEliminando.direccion}, {puntoEliminando.comuna}
                </p>
              </div>
              <p className="text-red-600 text-sm mt-4 font-medium">
                ⚠️ Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setMostrarConfirmacionEliminacion(false);
                  setPuntoEliminando(null);
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarEliminacion}
                disabled={procesando[puntoEliminando.id]}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {procesando[puntoEliminando.id] ? 'Eliminando...' : 'Eliminar Definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}