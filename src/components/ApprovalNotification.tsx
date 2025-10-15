'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const ApprovalNotification: React.FC = () => {
  const { profile } = useAuth();
  const [showNotification, setShowNotification] = useState(false);
  const [previousStatus, setPreviousStatus] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.approval_status) {
      // Si el estado cambió de pendiente/rechazado a aprobado
      if (previousStatus && previousStatus !== 'approved' && profile.approval_status === 'approved') {
        setShowNotification(true);
        // Auto-hide después de 8 segundos
        setTimeout(() => setShowNotification(false), 8000);
      }
      setPreviousStatus(profile.approval_status);
    }
  }, [profile?.approval_status, previousStatus]);

  if (!showNotification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-green-600 text-white p-4 rounded-lg shadow-lg border border-green-500 animate-fade-in">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-lg">🎉</span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <h4 className="text-sm font-bold">¡Cuenta Aprobada!</h4>
            <p className="text-sm mt-1 opacity-90">
              Tu cuenta ha sido aprobada. Ya puedes realizar pedidos y acceder a todas las funcionalidades.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-xs bg-green-500 hover:bg-green-400 px-3 py-1 rounded text-white font-medium transition-colors"
            >
              Recargar página
            </button>
          </div>
          <button
            onClick={() => setShowNotification(false)}
            className="ml-2 text-green-200 hover:text-white text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};