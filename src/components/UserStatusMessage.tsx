'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface UserStatusMessageProps {
  showLogout?: boolean;
}

export const UserStatusMessage: React.FC<UserStatusMessageProps> = ({ showLogout = true }) => {
  const { user, profile, isEmailVerified, isApproved, logout, refreshProfile, profileLoading } = useAuth();
  const router = useRouter();

  if (!user || !profile) {
    return null;
  }

  // Si el usuario está completamente aprobado, no mostrar ningún mensaje
  if (isEmailVerified && isApproved) {
    return null;
  }

  // Email no verificado
  if (!isEmailVerified) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
              <span className="text-yellow-600 text-lg">📧</span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Email pendiente de verificación
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Necesitas verificar tu correo electrónico para continuar con el proceso de aprobación.
              </p>
              <p className="mt-1">
                Revisa tu bandeja de entrada (y spam) para el correo de confirmación.
              </p>
            </div>
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <button
                onClick={async () => {
                  // Aquí podrías agregar lógica para reenviar el email
                  alert('Función de reenvío en desarrollo');
                }}
                className="text-yellow-800 bg-yellow-100 hover:bg-yellow-200 px-3 py-1 rounded text-sm font-medium transition-colors"
              >
                Reenviar email de verificación
              </button>
              {showLogout && (
                <button
                  onClick={async () => {
                    await logout();
                    router.push('/');
                  }}
                  className="text-yellow-700 hover:text-yellow-900 text-sm underline"
                >
                  Cerrar sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Cuenta recién aprobada
  if (isEmailVerified && profile.approval_status === 'approved' && profile.approval_date) {
    const approvalDate = new Date(profile.approval_date);
    const now = new Date();
    const timeDiff = now.getTime() - approvalDate.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    // Mostrar mensaje de aprobación reciente solo por 24 horas
    if (hoursDiff < 24) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                <span className="text-green-600 text-lg">🎉</span>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-green-800">
                ¡Cuenta aprobada exitosamente!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Tu cuenta ha sido aprobada y ya tienes acceso completo a todas las funcionalidades mayoristas.
                </p>
                <p className="mt-1">
                  Ahora puedes realizar pedidos, agregar productos al carrito y gestionar tu negocio.
                </p>
              </div>
              <div className="mt-3">
                <button
                  onClick={() => window.location.reload()}
                  className="text-green-800 bg-green-100 hover:bg-green-200 px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                  Recargar página para activar todas las funciones
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // Email verificado pero pendiente de aprobación
  if (isEmailVerified && profile.approval_status === 'pending') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
              <span className="text-blue-600 text-lg">⏳</span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-blue-800">
              Cuenta en espera de aprobación
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Tu email ha sido verificado exitosamente. Ahora tu solicitud está siendo revisada por nuestro equipo.
              </p>
              <div className="mt-2 space-y-1">
                <p><strong>Estado:</strong> En revisión</p>
                <p><strong>Tiempo estimado:</strong> 1-2 días hábiles</p>
                <p><strong>Registrado:</strong> {new Date(profile.registered_at).toLocaleDateString('es-CL')}</p>
              </div>
            </div>
            <div className="mt-3 bg-blue-100 rounded p-2">
              <p className="text-blue-800 text-xs">
                💡 <strong>Tip:</strong> Recibirás un correo electrónico tan pronto como tu cuenta sea aprobada.
              </p>
            </div>
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <button
                onClick={refreshProfile}
                disabled={profileLoading}
                className="text-blue-800 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
              >
                {profileLoading ? 'Verificando...' : 'Verificar estado'}
              </button>
              {showLogout && (
                <button
                  onClick={async () => {
                    await logout();
                    router.push('/');
                  }}
                  className="text-blue-700 hover:text-blue-900 text-sm underline"
                >
                  Cerrar sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Cuenta rechazada
  if (profile.approval_status === 'rejected') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
              <span className="text-red-600 text-lg">❌</span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Solicitud rechazada
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                Lamentamos informarte que tu solicitud de cuenta no fue aprobada.
              </p>
              {profile.rejection_reason && (
                <div className="mt-2 p-2 bg-red-100 rounded">
                  <p><strong>Razón:</strong> {profile.rejection_reason}</p>
                </div>
              )}
            </div>
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  router.push('/registro');
                }}
                className="text-red-800 bg-red-100 hover:bg-red-200 px-3 py-1 rounded text-sm font-medium transition-colors"
              >
                Solicitar nuevamente
              </button>
              <button
                onClick={() => {
                  // Contactar soporte - podrías abrir un modal o redirigir
                  window.location.href = 'mailto:johnrojas297@gmail.com?subject=Consulta sobre solicitud rechazada';
                }}
                className="text-red-700 hover:text-red-900 text-sm underline"
              >
                Contactar soporte
              </button>
              {showLogout && (
                <button
                  onClick={async () => {
                    await logout();
                    router.push('/');
                  }}
                  className="text-red-700 hover:text-red-900 text-sm underline"
                >
                  Cerrar sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};