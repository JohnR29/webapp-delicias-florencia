'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BusinessForm } from '@/lib/types';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const { user, updateUserInfo, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<BusinessForm>(
    user?.businessInfo || {
      negocio: '',
      contacto: '',
      telefono: '',
      tipo: 'Almacén',
      comuna: '',
      direccion: ''
    }
  );
  const [errors, setErrors] = useState<string>('');

  const comunasPermitidas = ['San Bernardo', 'La Pintana', 'El Bosque', 'La Cisterna'];
  const tiposNegocio = ['Almacén', 'Minimarket', 'Pastelería', 'Cafetería', 'Otro'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors('');
    setIsSubmitting(true);

    try {
      const result = await updateUserInfo(formData);
      if (result.success) {
        setIsEditing(false);
        alert('Datos actualizados correctamente');
      } else {
        setErrors(result.message);
      }
    } catch (error) {
      setErrors('Error al actualizar los datos');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Mi Perfil</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Usuario info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Email registrado:</p>
            <p className="font-medium text-gray-800">{user.email}</p>
            <p className="text-xs text-gray-500 mt-1">
              Miembro desde: {new Date(user.createdAt).toLocaleDateString('es-CL')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del negocio
              </label>
              <input
                type="text"
                name="negocio"
                value={formData.negocio}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                  isEditing ? 'bg-white' : 'bg-gray-50'
                } focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Persona de contacto
              </label>
              <input
                type="text"
                name="contacto"
                value={formData.contacto}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                  isEditing ? 'bg-white' : 'bg-gray-50'
                } focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                  isEditing ? 'bg-white' : 'bg-gray-50'
                } focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de negocio
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                  isEditing ? 'bg-white' : 'bg-gray-50'
                } focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                required
              >
                {tiposNegocio.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comuna
              </label>
              <select
                name="comuna"
                value={formData.comuna}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                  isEditing ? 'bg-white' : 'bg-gray-50'
                } focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                required
              >
                <option value="" disabled>Selecciona...</option>
                {comunasPermitidas.map(comuna => (
                  <option key={comuna} value={comuna}>{comuna}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                  isEditing ? 'bg-white' : 'bg-gray-50'
                } focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                required
              />
            </div>

            {errors && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              {!isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex-1 py-2 px-4 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50"
                  >
                    Editar Datos
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex-1 py-2 px-4 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(user.businessInfo);
                      setErrors('');
                    }}
                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                      isSubmitting
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    }`}
                  >
                    {isSubmitting ? 'Guardando...' : 'Guardar'}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}