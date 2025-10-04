'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from '@/components/AuthModal';
import { isAdminUser } from '@/lib/admin-config';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const { user, isAuthenticated, logout } = useAuth();
  const [forceUpdate, setForceUpdate] = useState(0);
  const [localAuthState, setLocalAuthState] = useState({ isAuthenticated: false, user: null });

  // Escuchar cambios en localStorage para actualizar estado de autenticación
  useEffect(() => {
    const checkAuthState = () => {
      const savedUser = localStorage.getItem('delicias_user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setLocalAuthState({ isAuthenticated: true, user: userData });
        } catch (error) {
          console.error('Error parsing localStorage user:', error);
          setLocalAuthState({ isAuthenticated: false, user: null });
        }
      } else {
        setLocalAuthState({ isAuthenticated: false, user: null });
      }
    };

    // Verificar al montar
    checkAuthState();

    const handleStorageChange = () => {
      checkAuthState();
      setForceUpdate(prev => prev + 1);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      
      // También escuchar cambios internos de localStorage
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = function(key: string, value: string) {
        originalSetItem.call(this, key, value);
        if (key === 'delicias_user') {
          setTimeout(handleStorageChange, 10);
        }
      };

      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = function(key: string) {
        originalRemoveItem.call(this, key);
        if (key === 'delicias_user') {
          setTimeout(handleStorageChange, 10);
        }
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem = Storage.prototype.setItem;
          localStorage.removeItem = Storage.prototype.removeItem;
        }
      }
    };
  }, []);

  // Usar estado local si está disponible, fallback a useAuth
  const finalAuthState = localAuthState.user ? localAuthState : { isAuthenticated, user };

  // Función de logout personalizada que limpia todo
  const handleLogout = () => {
    logout(); // Limpiar hook useAuth
    setLocalAuthState({ isAuthenticated: false, user: null }); // Limpiar estado local
    localStorage.removeItem('delicias_user'); // Limpiar localStorage
  };

  const scrollToSection = (sectionId: string) => {
    if (typeof window !== 'undefined') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setIsMenuOpen(false);
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-lg z-50">
      <nav className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-20 min-w-0 gap-2">
          {/* Logo */}
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Image
              src="/images/logo-delicias-florencia.png"
              alt="Delicias Florencia"
              width={120}
              height={40}
              className="h-10 w-auto flex-shrink-0"
              priority
            />
            <span className="font-dancing-script text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent drop-shadow-md whitespace-nowrap">
              DeliciasFlorencia.cl&nbsp;&nbsp;
            </span>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center space-x-6 lg:space-x-8 flex-shrink-0">
            <li>
              <button
                onClick={() => scrollToSection('inicio')}
                className="nav-link text-gray-700 hover:text-primary-600 transition-colors text-sm lg:text-base"
              >
                Inicio
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('catalogo')}
                className="nav-link text-gray-700 hover:text-primary-600 transition-colors text-sm lg:text-base"
              >
                Productos
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('precios')}
                className="nav-link text-gray-700 hover:text-primary-600 transition-colors text-sm lg:text-base"
              >
                Precios
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('cobertura')}
                className="nav-link text-gray-700 hover:text-primary-600 transition-colors text-sm lg:text-base"
              >
                Distribución
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('cotizar')}
                className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 lg:px-4 rounded-lg transition-colors text-sm lg:text-base"
              >
                Hacer Pedido
              </button>
            </li>
            <li>
              {finalAuthState.isAuthenticated && finalAuthState.user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xs lg:text-sm text-gray-600">Hola, {finalAuthState.user.email || 'usuario'}</span>
                  {isAdminUser(finalAuthState.user.email) && (
                    <a
                      href="/admin"
                      className="text-xs lg:text-sm text-primary-600 hover:text-primary-800 underline"
                    >
                      Admin
                    </a>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-xs lg:text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setShowAuthModal(true);
                  }}
                  className="text-gray-700 hover:text-primary-600 border border-gray-300 px-2 py-1 lg:px-3 rounded-lg transition-colors text-xs lg:text-sm"
                >
                  Iniciar Sesión
                </button>
              )}
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex flex-col items-center justify-center w-8 h-8 space-y-1"
            aria-label="Abrir menú"
            aria-expanded={isMenuOpen}
          >
            <span className={`block w-6 h-0.5 bg-gray-700 transition-transform ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-gray-700 transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-gray-700 transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}>
          <ul className="space-y-4 pt-4 border-t border-gray-200">
            <li>
              <button
                onClick={() => scrollToSection('inicio')}
                className="block w-full text-left py-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                Inicio
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('catalogo')}
                className="block w-full text-left py-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                Productos
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('precios')}
                className="block w-full text-left py-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                Precios
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('cobertura')}
                className="block w-full text-left py-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                Distribución
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('cotizar')}
                className="block w-full text-left bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-lg transition-colors"
              >
                Hacer Pedido
              </button>
            </li>
            <li>
              {finalAuthState.isAuthenticated && finalAuthState.user ? (
                <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Hola, {finalAuthState.user.email || 'usuario'}</span>
                  {isAdminUser(finalAuthState.user.email) && (
                    <a
                      href="/admin"
                      className="text-left text-sm text-primary-600 hover:text-primary-800 py-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Panel de Administración
                    </a>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setShowAuthModal(true);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-700 hover:text-primary-600 border border-gray-300 px-3 py-2 rounded-lg transition-colors"
                >
                  Iniciar Sesión
                </button>
              )}
            </li>
          </ul>
        </div>

        {/* Modal de autenticación */}
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultMode={authModalMode}
        />
      </nav>
    </header>
  );
};

export default Header;