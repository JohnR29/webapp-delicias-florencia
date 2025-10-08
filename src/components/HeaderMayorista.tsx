'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from '@/components/AuthModal';
import { isAdminUser } from '@/lib/admin-config';
import { MapPin, Home } from 'lucide-react';

const HeaderMayorista = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const { user, isAuthenticated, logout } = useAuth();

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
              height={120}
              className="h-10 flex-shrink-0"
              style={{ width: 'auto' }}
              priority
            />
            <span className="font-dancing-script text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent drop-shadow-md whitespace-nowrap">
              DeliciasFlorencia.cl&nbsp;&nbsp;
            </span>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center space-x-6 lg:space-x-8 flex-shrink-0">
            <li>
              <Link
                href="/"
                className="nav-link text-gray-700 hover:text-primary-600 transition-colors text-sm lg:text-base flex items-center space-x-1"
              >
                <Home size={16} />
                <span>Inicio Público</span>
              </Link>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('cobertura')}
                className="nav-link text-gray-700 hover:text-primary-600 transition-colors text-sm lg:text-base"
              >
                Rutas
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
                onClick={() => scrollToSection('catalogo')}
                className="nav-link text-gray-700 hover:text-primary-600 transition-colors text-sm lg:text-base"
              >
                Catálogo
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('cotizar')}
                className="nav-link text-gray-700 hover:text-primary-600 transition-colors text-sm lg:text-base"
              >
                Pedidos
              </button>
            </li>
            
            {/* User Menu */}
            {isAuthenticated && user ? (
              <li className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-sm">
                      {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm lg:text-base font-medium">
                    {user.user_metadata?.full_name || 'Usuario'}
                  </span>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.user_metadata?.full_name || 'Usuario'}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="py-1">
                    {isAdminUser(user?.email) && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        🛠️ Panel Admin
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        window.location.href = '/';
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </li>
            ) : (
              <li>
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setShowAuthModal(true);
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm lg:text-base"
                >
                  Iniciar Sesión
                </button>
              </li>
            )}
          </ul>

          {/* Mobile menu button */}
          <button
            className="md:hidden flex items-center px-3 py-2 border rounded text-gray-700 border-gray-300 hover:text-primary-600 hover:border-primary-600 transition-colors flex-shrink-0"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              <Link
                href="/"
                className="nav-link-mobile text-gray-700 hover:text-primary-600 flex items-center space-x-2 px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home size={16} />
                <span>Inicio Público</span>
              </Link>
              <button
                onClick={() => scrollToSection('cobertura')}
                className="nav-link-mobile text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium transition-colors w-full text-left"
              >
                Rutas de Distribución
              </button>
              <button
                onClick={() => scrollToSection('precios')}
                className="nav-link-mobile text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium transition-colors w-full text-left"
              >
                Precios Mayoristas
              </button>
              <button
                onClick={() => scrollToSection('catalogo')}
                className="nav-link-mobile text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium transition-colors w-full text-left"
              >
                Catálogo de Productos
              </button>
              <button
                onClick={() => scrollToSection('cotizar')}
                className="nav-link-mobile text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium transition-colors w-full text-left"
              >
                Realizar Pedido
              </button>
              
              {/* Mobile User Menu */}
              {isAuthenticated && user ? (
                <div className="border-t border-gray-200 pt-4">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">{user.user_metadata?.full_name || 'Usuario'}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  {isAdminUser(user?.email) && (
                    <Link
                      href="/admin"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      🛠️ Panel Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                      window.location.href = '/';
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:text-red-800 transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4">
                  <button
                    onClick={() => {
                      setAuthModalMode('login');
                      setShowAuthModal(true);
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mx-3"
                  >
                    Iniciar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </header>
  );
};

export default HeaderMayorista;