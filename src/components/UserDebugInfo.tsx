'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

export const UserDebugInfo: React.FC = () => {
  const { user, profile, isEmailVerified, isApproved, profileLoading, refreshProfile } = useAuth();
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const createProfileManually = async () => {
    if (!user || profile) return;
    
    setCreatingProfile(true);
    try {
      // Obtener información completa del usuario
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error getting user data:', userError);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || userData.user?.email,
          email_verified: userData.user?.email_confirmed_at ? true : false,
          approval_status: 'pending',
          created_at: new Date().toISOString(),
        });
      
      if (!error) {
        await refreshProfile();
      } else {
        console.error('Error creating profile:', error);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    } finally {
      setCreatingProfile(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-800">
          Debug: Estado del Usuario
        </h3>
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="text-xs text-gray-600 hover:text-gray-800"
        >
          {showDebug ? 'Ocultar' : 'Mostrar'} Info
        </button>
      </div>
      
      {showDebug && (
        <div className="mt-3 space-y-2 text-xs font-mono">
          <div><strong>User ID:</strong> {user.id}</div>
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Profile exists:</strong> {profile ? 'Sí' : 'No'}</div>
          <div><strong>Profile loading:</strong> {profileLoading ? 'Sí' : 'No'}</div>
          {profile && (
            <>
              <div><strong>Email verified:</strong> {profile.email_verified ? 'Sí' : 'No'}</div>
              <div><strong>Approval status:</strong> {profile.approval_status}</div>
              <div><strong>Approval date:</strong> {profile.approval_date || 'N/A'}</div>
              <div><strong>isEmailVerified:</strong> {isEmailVerified ? 'Sí' : 'No'}</div>
              <div><strong>isApproved:</strong> {isApproved ? 'Sí' : 'No'}</div>
            </>
          )}
          <div className="pt-2 space-x-2">
            <button
              onClick={refreshProfile}
              disabled={profileLoading}
              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 disabled:opacity-50"
            >
              {profileLoading ? 'Actualizando...' : 'Refrescar perfil'}
            </button>
            {!profile && (
              <button
                onClick={createProfileManually}
                disabled={creatingProfile}
                className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 disabled:opacity-50"
              >
                {creatingProfile ? 'Creando...' : 'Crear perfil'}
              </button>
            )}
            <button
              onClick={() => window.location.reload()}
              className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded hover:bg-orange-200"
            >
              Recargar página
            </button>
          </div>
        </div>
      )}
    </div>
  );
};