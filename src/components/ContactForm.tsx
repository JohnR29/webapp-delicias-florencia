'use client';

import { useState, useEffect } from 'react';
import { BusinessForm } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from '@/components/AuthModal';

import { Address, useAddresses } from '@/hooks/useAddresses';
import AddressManager from '@/components/AddressManager';

interface ContactFormProps {
  cartState?: {
    total12oz: number;
    total9oz: number;
    totalCantidad: number;
    totalMonto: number;
  };
  productosSeleccionados?: Array<{
    producto: {
      nombre: string;
      formato: string;
    };
    cantidad: number;
  }>;
  clearCart?: () => void;
  selectedAddress?: Address | null;
}

const ContactForm: React.FC<ContactFormProps> = ({ cartState, productosSeleccionados = [], clearCart, selectedAddress }) => {
  // Estado para mostrar modales de direcciones
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showListAddress, setShowListAddress] = useState(false);
  // Obtener direcciones del usuario
  // Solo obtener userId para direcciones, pero no redeclarar user/isAuthenticated
  const auth = useAuth();
  const userId = auth.user?.id || null;
  const { addresses, fetchAddresses } = useAddresses(userId);
  // Autocompletar formulario si se selecciona una dirección desde AddressManager
  useEffect(() => {
    if (selectedAddress) {
      setFormData(prev => ({
        ...prev,
        negocio: selectedAddress.negocio || '',
        contacto: selectedAddress.contacto || '',
        telefono: selectedAddress.telefono || '',
        tipo: (['Almacén', 'Minimarket', 'Pastelería', 'Cafetería', 'Otro'].includes(selectedAddress.tipo)
          ? selectedAddress.tipo
          : 'Almacén') as BusinessForm['tipo'],
        comuna: selectedAddress.comuna || '',
        direccion: selectedAddress.direccion || '',
      }));
    }
  }, [selectedAddress]);
  const { user, isAuthenticated, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState<BusinessForm & { correo: string }>({
    negocio: '',
    contacto: '',
    telefono: '',
    tipo: 'Almacén',
    comuna: '',
    direccion: '',
    correo: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  type ContactFormFields = BusinessForm & { correo: string };
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormFields, string>>>({});


  // Autocompletar correo si el usuario está autenticado
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      correo: auth.isAuthenticated && auth.user && typeof auth.user.email === 'string'
        ? auth.user.email
        : ''
    }));
  }, [auth.isAuthenticated, auth.user]);

  const comunasPermitidas = ['San Bernardo', 'La Pintana', 'El Bosque', 'La Cisterna'];
  const tiposNegocio = ['Almacén', 'Minimarket', 'Pastelería', 'Cafetería', 'Otro'];

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof (BusinessForm & { correo: string }), string>> = {};

    if (!formData.negocio.trim()) newErrors.negocio = 'El nombre del negocio es requerido';
    if (!formData.contacto.trim()) newErrors.contacto = 'La persona de contacto es requerida';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!formData.tipo) newErrors.tipo = 'El tipo de negocio es requerido';
    if (!formData.comuna) newErrors.comuna = 'La comuna es requerida';
    if (!formData.direccion.trim()) newErrors.direccion = 'La dirección es requerida';
    if (!formData.correo.trim()) newErrors.correo = 'El correo es requerido';

    // Validación de teléfono básica
    if (formData.telefono && !/^[\+]?[0-9\s\-\(\)]{8,}$/.test(formData.telefono)) {
      newErrors.telefono = 'Formato de teléfono inválido';
    }
    // Validación de correo básica
    if (formData.correo && !/^\S+@\S+\.\S+$/.test(formData.correo)) {
      newErrors.correo = 'Formato de correo inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof BusinessForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Preparar datos para envío al API
      const requestData = {
        businessInfo: { ...formData },
        cart: cartState,
        products: productosSeleccionados,
        userEmail: formData.correo || auth.user?.email || null,
        user_id: auth.user?.id || null,
        timestamp: new Date().toISOString()
      };

      // Enviar al API route
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('¡Pedido enviado correctamente! Nos pondremos en contacto contigo pronto.');
        
        // Limpiar el carrito después del envío exitoso
        if (clearCart) {
          clearCart();
        }
        
        // Para usuarios NO autenticados: limpiar formulario 
        if (!auth.isAuthenticated) {
          setFormData({
            negocio: '',
            contacto: '',
            telefono: '',
            tipo: 'Almacén',
            comuna: '',
            direccion: '',
            correo: ''
          });
        }
        // Para usuarios autenticados: mantener los datos del formulario
      } else {
        throw new Error(result.message || 'Error al enviar el pedido');
      }

    } catch (error) {
      console.error('Error al procesar solicitud:', error);
      alert('Error al enviar el pedido. Por favor, intenta nuevamente o contáctanos directamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = cartState && cartState.totalCantidad >= 6;
  

  // Función de logout personalizada que limpia todo
  const handleLogout = () => {
    logout();
    setFormData({
      negocio: '',
      contacto: '',
      telefono: '',
      tipo: 'Almacén',
      comuna: '',
      direccion: '',
      correo: ''
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6 flex flex-col max-w-full overflow-x-auto">
      <div className="flex-1 min-w-0">
  <h3 className="text-2xl font-bold text-gray-800 mb-6">Completar Pedido</h3>
      
      {/* Sección de usuario autenticado */}
      {auth.isAuthenticated && auth.user ? (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-green-800">
                ¡Hola {auth.user.user_metadata?.display_name || auth.user.email || 'usuario'}!
              </h4>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-green-600 hover:text-green-800 underline"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">¿Ya tienes cuenta?</h4>
          <p className="text-sm text-blue-600 mb-3">
            Inicia sesión para autocompletar tus datos y hacer pedidos más rápido
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setAuthModalMode('login');
                setShowAuthModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                setAuthModalMode('register');
                setShowAuthModal(true);
              }}
              className="px-4 py-2 border border-blue-600 text-blue-600 text-sm rounded-lg hover:bg-blue-50"
            >
              Registrarse
            </button>
          </div>
        </div>
      )}
      
      {/* Botones de gestión de direcciones (solo si logeado) */}
      <div className="flex flex-row gap-3 justify-center md:justify-start items-center mb-4">
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-primary-600 text-white text-2xl shadow hover:bg-primary-700 transition"
          title="Agregar dirección"
          onClick={() => {
            if (!auth.isAuthenticated) {
              alert('Debes iniciar sesión para agregar una dirección.');
              return;
            }
            setShowAddAddress(true);
          }}
        >
          +
        </button>
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-primary-700 text-xl shadow hover:bg-gray-300 transition"
          title="Ver direcciones guardadas"
          onClick={() => {
            if (!auth.isAuthenticated) {
              alert('Debes iniciar sesión para ver tus direcciones guardadas.');
              return;
            }
            setShowListAddress(true);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
          </svg>
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-full">
        {/* Nombre del negocio */}
        <div>
          <label htmlFor="negocio" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del negocio <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="negocio"
            name="negocio"
            value={formData.negocio}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.negocio ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ej: Almacén Los Robles"
            autoComplete="organization"
          />
          {errors.negocio && <p className="text-red-500 text-xs mt-1">{errors.negocio}</p>}
        </div>
        {/* Correo de contacto */}
        <div>
          <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">
            Correo electrónico <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="correo"
            name="correo"
            value={formData.correo}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.correo ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ej: contacto@negocio.cl"
            autoComplete="email"
            disabled={auth.isAuthenticated}
          />
          {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo}</p>}
        </div>

        {/* Persona de contacto */}
        <div>
          <label htmlFor="contacto" className="block text-sm font-medium text-gray-700 mb-1">
            Persona de contacto <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="contacto"
            name="contacto"
            value={formData.contacto}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.contacto ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nombre del encargado"
            autoComplete="name"
          />
          {errors.contacto && <p className="text-red-500 text-xs mt-1">{errors.contacto}</p>}
        </div>

        {/* Teléfono */}
        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono comercial <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.telefono ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="+56 9 ..."
            inputMode="tel"
          />
          {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
        </div>

        {/* Tipo de negocio */}
        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de negocio <span className="text-red-500">*</span>
          </label>
          <select
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.tipo ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="" disabled>Selecciona...</option>
            {tiposNegocio.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
          {errors.tipo && <p className="text-red-500 text-xs mt-1">{errors.tipo}</p>}
        </div>

        {/* Comuna */}
        <div>
          <label htmlFor="comuna" className="block text-sm font-medium text-gray-700 mb-1">
            Comuna <span className="text-red-500">*</span>
          </label>
          <select
            id="comuna"
            name="comuna"
            value={formData.comuna}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.comuna ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="" disabled>Selecciona...</option>
            {comunasPermitidas.map(comuna => (
              <option key={comuna} value={comuna}>{comuna}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Rutas de distribución disponibles</p>
          {errors.comuna && <p className="text-red-500 text-xs mt-1">{errors.comuna}</p>}
        </div>

        {/* Dirección */}
        <div>
          <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
            Dirección del negocio <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="direccion"
            name="direccion"
            value={formData.direccion}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.direccion ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Dirección completa del local"
          />
          {errors.direccion && <p className="text-red-500 text-xs mt-1">{errors.direccion}</p>}
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            isFormValid && !isSubmitting
              ? 'bg-primary-600 hover:bg-primary-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? 'Enviando...' : 'Confirmar Pedido'}
        </button>

        {!isFormValid && cartState && cartState.totalCantidad < 6 && (
          <p className="text-sm text-amber-600 text-center">
            Agrega al menos 6 unidades para realizar un pedido mayorista
          </p>
        )}
      </form>

      {/* Modal de autenticación */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authModalMode}
      />
      {/* Modal para agregar dirección (solo alta) */}
      {showAddAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative animate-fade-in">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl" onClick={() => setShowAddAddress(false)}>&times;</button>
            <h4 className="text-lg font-bold mb-4">Agregar nueva dirección</h4>
            <AddressManager onSelect={addr => {
              setShowAddAddress(false);
              if (addr) {
                setFormData(prev => ({
                  ...prev,
                  negocio: addr.negocio || '',
                  contacto: addr.contacto || '',
                  telefono: addr.telefono || '',
                  tipo: (['Almacén', 'Minimarket', 'Pastelería', 'Cafetería', 'Otro'].includes(addr.tipo)
                    ? (addr.tipo as BusinessForm['tipo'])
                    : 'Almacén'),
                  comuna: addr.comuna || '',
                  direccion: addr.direccion || '',
                }));
              }
            }} onlyAdd />
          </div>
        </div>
      )}

      {/* Modal para seleccionar y administrar direcciones */}
      {showListAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative animate-fade-in">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl" onClick={() => setShowListAddress(false)}>&times;</button>
            <h4 className="text-lg font-bold mb-4">Seleccionar o administrar direcciones</h4>
            <AddressManager onSelect={addr => {
              setShowListAddress(false);
              if (addr) {
                setFormData(prev => ({
                  ...prev,
                  negocio: addr.negocio || '',
                  contacto: addr.contacto || '',
                  telefono: addr.telefono || '',
                  tipo: (['Almacén', 'Minimarket', 'Pastelería', 'Cafetería', 'Otro'].includes(addr.tipo)
                    ? (addr.tipo as BusinessForm['tipo'])
                    : 'Almacén'),
                  comuna: addr.comuna || '',
                  direccion: addr.direccion || '',
                }));
              }
            }} />
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ContactForm;