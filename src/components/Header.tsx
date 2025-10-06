'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from '@/components/AuthModal';
import { isAdminUser } from '@/lib/admin-config';
import { MapPin } from 'lucide-react';

const Header = () => {
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
              <Link
                href="/donde-comprar"
                className="nav-link text-gray-700 hover:text-primary-600 transition-colors text-sm lg:text-base inline-flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Dónde Comprar
              </Link>
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
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xs lg:text-sm text-gray-600">Hola, {user.user_metadata?.display_name || user.email || 'usuario'}</span>
                  <Link
                    href="/perfil"
                    className="text-xs lg:text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Mi Perfil
                  </Link>
                  {isAdminUser(user.email) && (
                    <a
                      href="/admin"
                      className="text-xs lg:text-sm text-primary-600 hover:text-primary-800 underline"
                    >
                      Admin
                    </a>
                  )}
                  <button
                    onClick={logout}
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
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-screen pb-4' : 'max-h-0'}`}>
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
              <Link
                href="/donde-comprar"
                className="block w-full text-left py-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                Dónde Comprar
              </Link>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('cotizar')}
                className="block w-full text-left bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-lg transition-colors"
              >
                Hacer Pedido
              </button>
            </li>
            <li className="border-t border-gray-200 pt-4">
              {isAuthenticated && user ? (
                <>
                  <div className="text-sm text-gray-600 py-2">Hola, {user.user_metadata?.display_name || user.email || 'usuario'}</div>
                  
                  <Link
                    href="/perfil"
                    className="block text-sm text-blue-600 hover:text-blue-800 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    👤 Mi Perfil
                  </Link>
                  
                  {isAdminUser(user.email) && (
                    <a
                      href="/admin"
                      className="block text-sm text-primary-600 hover:text-primary-800 py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Panel de Administración
                    </a>
                  )}
                  
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left text-sm bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-3 py-2 rounded-lg transition-colors border border-red-200 mt-2"
                  >
                    🚪 Cerrar Sesión
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setShowAuthModal(true);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-700 hover:text-primary-600 border border-gray-300 px-3 py-2 rounded-lg transition-colors mt-2"
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