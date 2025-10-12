'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from '@/components/AuthModal';
import { isAdminUser } from '@/lib/admin-config';
import { ShoppingBag } from 'lucide-react';

const HeaderPublico = () => {
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
              <button
                onClick={() => scrollToSection('inicio')}
                className="nav-link text-gray-700 hover:text-primary-600 transition-colors text-sm lg:text-base"
              >
                Inicio
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('productos')}
                className="nav-link text-gray-700 hover:text-primary-600 transition-colors text-sm lg:text-base"
              >
                Productos
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('donde-comprar')}
                className="nav-link text-gray-700 hover:text-primary-600 transition-colors text-sm lg:text-base inline-flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Dónde Comprar
              </button>
            </li>
            <li>
              <Link
                href="/mayorista"
                className="bg-secondary-600 hover:bg-secondary-700 text-white px-3 py-2 lg:px-4 rounded-lg transition-colors text-sm lg:text-base inline-flex items-center"
              >
                <ShoppingBag size={16} className="mr-1" />
                Portal Socios
              </Link>
            </li>
            
            {/* User Menu - solo si está autenticado */}
            {isAuthenticated && user && (
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
                    <Link
                      href="/mayorista"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      🏢 Portal Socios
                    </Link>
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
                        window.location.reload();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
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
              <button
                onClick={() => scrollToSection('inicio')}
                className="nav-link-mobile text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium transition-colors w-full text-left"
              >
                🏠 Inicio
              </button>
              <button
                onClick={() => scrollToSection('productos')}
                className="nav-link-mobile text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium transition-colors w-full text-left"
              >
                🍰 Nuestros Productos
              </button>
              <button
                onClick={() => scrollToSection('donde-comprar')}
                className="nav-link-mobile text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium transition-colors w-full text-left"
              >
                📍 ¿Dónde Comprar?
              </button>
              <Link
                href="/mayorista"
                className="nav-link-mobile bg-secondary-600 text-white hover:bg-secondary-700 block px-3 py-2 text-base font-medium transition-colors rounded-lg mx-3 mt-4 text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                🏢 Portal Socios
              </Link>
              
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
                      window.location.reload();
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

export default HeaderPublico;