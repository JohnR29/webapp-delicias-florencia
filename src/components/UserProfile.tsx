"use client";

import { useAuth } from '@/hooks/useAuth';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Perfil de Usuario</h2>
        <div className="mb-4">
          <div className="text-gray-700 font-medium mb-1">Email:</div>
          <div className="text-gray-900">{user.email}</div>
        </div>
        <div className="mb-4">
          <div className="text-gray-700 font-medium mb-1">Miembro desde:</div>
          <div className="text-gray-900">{user.created_at ? new Date(user.created_at).toLocaleDateString('es-CL') : '-'}</div>
        </div>
        <button
          className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}