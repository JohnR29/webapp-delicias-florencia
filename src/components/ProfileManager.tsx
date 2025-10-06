"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useAddresses } from '../hooks/useAddresses';
import PersonalInfoForm from '@/components/PersonalInfoForm';
import AddressManager from './AddressManager';
import SocioDistribuidorForm from './SocioDistribuidorForm';

type TabType = 'personal' | 'direcciones' | 'negocio';

export default function ProfileManager() {
  const { user } = useAuthContext();
  const userId = user?.id || null;
  const [activeTab, setActiveTab] = useState<TabType>('personal');

  const {
    profile,
    loading: profileLoading,
    error: profileError,
    saveProfile
  } = useProfile(userId);

  const {
    addresses,
    loading: addressLoading
  } = useAddresses(userId);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Debes iniciar sesión para acceder a tu perfil.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'personal' as TabType, label: 'Información Personal', icon: '👤' },
    { id: 'direcciones' as TabType, label: 'Direcciones', icon: '📍' },
    { id: 'negocio' as TabType, label: 'Mi Negocio', icon: '🏪' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="border-b border-gray-200">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-600 mt-2">
              Gestiona tu información personal y direcciones de entrega
            </p>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'personal' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Información Personal
                </h2>
                <p className="text-gray-600 text-sm">
                  Actualiza tus datos personales para tener un perfil completo
                </p>
              </div>
              
              <PersonalInfoForm
                profile={profile}
                loading={profileLoading}
                error={profileError}
                onSave={saveProfile}
                userEmail={user.email || ''}
              />
            </div>
          )}

          {activeTab === 'direcciones' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Direcciones de Entrega
                </h2>
                <p className="text-gray-600 text-sm">
                  Administra las direcciones donde quieres recibir tus pedidos
                </p>
                {addresses.length > 0 && (
                  <div className="mt-2 text-sm text-gray-500">
                    Tienes {addresses.length} direccion{addresses.length !== 1 ? 'es' : ''} guardada{addresses.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
              
              <AddressManager userProfile={profile} />
            </div>
          )}

          {activeTab === 'negocio' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Configuración de Socio Distribuidor
                </h2>
                <p className="text-gray-600 text-sm">
                  Conviértete en un socio distribuidor y permite que clientes finales te encuentren
                </p>
                {profile?.es_punto_venta_publico && (
                  <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Activo como Socio Distribuidor
                  </div>
                )}
              </div>
              
              <SocioDistribuidorForm
                profile={profile}
                loading={profileLoading}
                error={profileError}
                onSave={saveProfile}
                userEmail={user.email || ''}
              />
            </div>
          )}
        </div>

        {/* Loading overlay */}
        {(profileLoading || addressLoading) && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600">Cargando...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}