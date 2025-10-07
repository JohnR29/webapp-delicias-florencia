"use client";
import { useState, useEffect } from 'react';
import { UserProfile, UserProfileForm, BUSINESS_CONFIG } from '../lib/types';

interface PersonalInfoFormProps {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  onSave: (data: UserProfileForm) => Promise<{ success: boolean; message: string }>;
  userEmail: string;
}

export default function PersonalInfoForm({ 
  profile, 
  loading, 
  error, 
  onSave, 
  userEmail 
}: PersonalInfoFormProps) {
  const [formData, setFormData] = useState<UserProfileForm>({
    nombre: '',
    apellido: '',
    telefono: '',
    documento_identidad: '',
    tipo_documento: 'RUT',
    fecha_nacimiento: '',
    direccion_personal: '',
    comuna_personal: '',
    es_punto_venta_publico: false,
    permite_pedidos_directos: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cargar datos del perfil existente
  useEffect(() => {
    if (profile) {
      setFormData({
        nombre: profile.nombre || '',
        apellido: profile.apellido || '',
        telefono: profile.telefono || '',
        documento_identidad: profile.documento_identidad || '',
        tipo_documento: profile.tipo_documento || 'RUT',
        fecha_nacimiento: profile.fecha_nacimiento || '',
        direccion_personal: profile.direccion_personal || '',
        comuna_personal: profile.comuna_personal || '',
        es_punto_venta_publico: profile.es_punto_venta_publico || false,
        permite_pedidos_directos: profile.permite_pedidos_directos || false,
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await onSave(formData);
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.message
      });

      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Error inesperado al guardar'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-gray-600">Cargando perfil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mostrar error general */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Mostrar mensaje de resultado */}
      {message && (
        <div className={`border rounded-lg p-4 ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Email (solo lectura) */}
      <div className="bg-gray-50 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email de la cuenta
        </label>
        <input
          type="email"
          value={userEmail}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
        />
        <p className="text-xs text-gray-500 mt-1">
          El email no se puede modificar desde aquí
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-2">
              Apellido *
            </label>
            <input
              type="text"
              id="apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tu apellido"
            />
          </div>
        </div>

        {/* Teléfono */}
        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono *
          </label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="+56 9 1234 5678"
          />
        </div>

        {/* Documento de identidad */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="tipo_documento" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de documento
            </label>
            <select
              id="tipo_documento"
              name="tipo_documento"
              value={formData.tipo_documento}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="RUT">RUT</option>
              <option value="CI">Cédula de Identidad</option>
              <option value="Pasaporte">Pasaporte</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="documento_identidad" className="block text-sm font-medium text-gray-700 mb-2">
              Número de documento
            </label>
            <input
              type="text"
              id="documento_identidad"
              name="documento_identidad"
              value={formData.documento_identidad}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="12345678-9"
            />
          </div>
        </div>

        {/* Fecha de nacimiento */}
        <div>
          <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de nacimiento
          </label>
          <input
            type="date"
            id="fecha_nacimiento"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Dirección personal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="comuna_personal" className="block text-sm font-medium text-gray-700 mb-2">
              Comuna de residencia
            </label>
            <select
              id="comuna_personal"
              name="comuna_personal"
              value={formData.comuna_personal}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccionar comuna</option>
              {BUSINESS_CONFIG.COMUNAS_PERMITIDAS.map(comuna => (
                <option key={comuna} value={comuna}>{comuna}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="direccion_personal" className="block text-sm font-medium text-gray-700 mb-2">
              Dirección personal
            </label>
            <input
              type="text"
              id="direccion_personal"
              name="direccion_personal"
              value={formData.direccion_personal}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Dirección completa"
            />
          </div>
        </div>

        {/* Botón guardar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              isSubmitting
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>

      {/* Nota sobre campos obligatorios */}
      <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
        <p>Los campos marcados con * son obligatorios.</p>
        <p>Esta información ayuda a mejorar tu experiencia en la plataforma.</p>
      </div>
    </div>
  );
}