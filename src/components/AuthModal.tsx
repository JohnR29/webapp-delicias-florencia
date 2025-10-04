'use client';

import { useState, useEffect } from 'react';
import { BusinessForm } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import ForgotPasswordModal from './ForgotPasswordModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [nombre, setNombre] = useState('');
  
  // Sincronizar mode cuando cambie defaultMode
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
    }
  }, [isOpen, defaultMode]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);


  const [errors, setErrors] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const { login, register } = useAuth();

  const resetForm = () => {
  setEmail('');
  setPassword('');
  setConfirmPassword('');
  setNombre('');
  setErrors('');
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (): boolean => {
    if (password.length < 6) {
      setErrors('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setErrors('Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  // Eliminamos validación de businessData

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors('');
    setSuccessMsg('');

    if (!validateEmail(email)) {
      setErrors('Por favor ingresa un email válido');
      return;
    }

    if (!validatePassword()) {
      return;
    }

    if (mode === 'register' && nombre.trim().length < 2) {
      setErrors('Por favor ingresa tu nombre (mínimo 2 caracteres)');
      return;
    }

    setIsSubmitting(true);

    try {
      let result;
      if (mode === 'login') {
        result = await login(email, password);
      } else {
        result = await register(email, password, nombre);
      }

      // Para login/register: éxito si NO hay error
      if (result && !result.error) {
        if (mode === 'register') {
          setSuccessMsg('Registro exitoso. Revisa tu correo para confirmar tu cuenta.');
          resetForm();
          setTimeout(() => {
            setSuccessMsg('');
            onClose();
          }, 3000);
        } else {
          setSuccessMsg('¡Inicio de sesión exitoso!');
          resetForm();
          setTimeout(() => {
            setSuccessMsg('');
            onClose();
          }, 1200);
        }
      } else {
        if (result && result.error) {
          setErrors(result.error.message || 'Error al iniciar sesión');
        } else {
          setErrors('Error al iniciar sesión');
        }
      }
    } catch (error) {
      setErrors('Error inesperado. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setErrors('');
  };

  if (!isOpen) return null;

  // Toast de éxito
  const SuccessToast = () => (
    successMsg ? (
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
        {successMsg}
      </div>
    ) : null
  );

  return (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4" style={{ minHeight: '100vh', zIndex: 99999 }}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[85vh] overflow-y-auto relative" style={{ top: 'auto', left: 'auto', transform: 'none' }}>
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre (solo en registro) */}
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Tu nombre"
                  required
                  minLength={2}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="tu-email@ejemplo.com"
                required
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </div>

            {/* Confirmar contraseña (solo en registro) */}
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Repite tu contraseña"
                  required
                  minLength={6}
                />
              </div>
            )}

            {/* Mensaje de éxito */}
            {successMsg && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-700 text-sm">{successMsg}</p>
              </div>
            )}

            {/* Mensaje de error */}
            {errors && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              {isSubmitting ? 'Procesando...' : 
               mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
            </button>

            {/* Switch mode */}
            <div className="text-center pt-4 space-y-2 border-t border-gray-200 mt-4">
              <button
                type="button"
                onClick={switchMode}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium underline"
              >
                {mode === 'login' 
                  ? '¿No tienes cuenta? Regístrate aquí' 
                  : '¿Ya tienes cuenta? Inicia sesión aquí'
                }
              </button>
              
              {mode === 'login' && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-gray-500 hover:text-gray-700 text-sm underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
      
      {/* Modal de recuperación de contraseña */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
}