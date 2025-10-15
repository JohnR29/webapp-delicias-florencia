'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Global cache para evitar cargar GeoJSON múltiples veces
let globalGeoJsonData: any = null;
let isLoadingGeoJson = false;
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
        negocio: selectedAddress.nombre_comercial || selectedAddress.nombre || '',
        contacto: selectedAddress.contacto || '',
        telefono: selectedAddress.telefono_negocio || selectedAddress.telefono || '',
        tipo: (selectedAddress.tipo_negocio as BusinessForm['tipo']) || 'Almacén',
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
  
  // Estados para Google Places y validación de cobertura
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [isInCoverageArea, setIsInCoverageArea] = useState<boolean | null>(null);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [pendingValidationCoords, setPendingValidationCoords] = useState<{lat: number, lng: number} | null>(null);

  // Autocompletar correo si el usuario está autenticado
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      correo: auth.isAuthenticated && auth.user && typeof auth.user.email === 'string'
        ? auth.user.email
        : ''
    }));
  }, [auth.isAuthenticated, auth.user]);

  // Cargar GeoJSON usando cache global
  useEffect(() => {
    const loadCoverageData = async () => {
      // Si ya tenemos datos en cache, usarlos
      if (globalGeoJsonData) {
        setGeoJsonData(globalGeoJsonData);
        return;
      }
      
      // Si ya se está cargando, esperar
      if (isLoadingGeoJson) {
        const checkInterval = setInterval(() => {
          if (globalGeoJsonData) {
            setGeoJsonData(globalGeoJsonData);
            clearInterval(checkInterval);
          }
        }, 100);
        return;
      }
      
      // Cargar por primera vez
      try {
        isLoadingGeoJson = true;
        
        const response = await fetch('/cobertura-costos.geojson', {
          cache: 'force-cache',
          priority: 'high' as RequestInit['priority']
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.features?.length > 0) {
          globalGeoJsonData = data;
          setGeoJsonData(data);
          console.log('✅ Coverage data loaded:', data.features.length, 'zones');
          
          // Si hay una validación pendiente, ejecutarla ahora
          if (pendingValidationCoords) {
            setTimeout(() => {
              checkCoverage(pendingValidationCoords);
              setPendingValidationCoords(null);
            }, 100);
          }
        }
        
      } catch (error) {
        console.error('❌ Error loading coverage data:', error);
      } finally {
        isLoadingGeoJson = false;
      }
    };
    
    loadCoverageData();
  }, []);

  // Inicializar Google Places Autocomplete
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10;

    const initializeAutocomplete = () => {
      if (!addressInputRef.current || autocomplete || typeof window === 'undefined') return;

      console.log(`Initializing autocomplete... Attempt ${attempts + 1}`);

      // Verificar si Google Maps ya está disponible
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log('Google Maps is available, creating autocomplete');
        try {
          const autocompleteInstance = new google.maps.places.Autocomplete(addressInputRef.current, {
            componentRestrictions: { country: 'CL' },
            fields: ['formatted_address', 'geometry', 'name', 'types', 'address_components'],
            types: ['address']
          });

          autocompleteInstance.addListener('place_changed', () => {
            console.log('🎯 Place changed event fired');
            const place = autocompleteInstance.getPlace();
            console.log('📍 Place selected:', {
              name: place?.name,
              formatted_address: place?.formatted_address,
              geometry: place?.geometry ? {
                lat: place.geometry.location?.lat(),
                lng: place.geometry.location?.lng(),
                viewport: place.geometry.viewport
              } : null,
              types: place?.types,
              address_components: place?.address_components
            });
            
            if (place && place.geometry && place.geometry.location) {
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              
              console.log('✅ Valid place with geometry, processing...');
              console.log('🎯 Autocomplete coordinates:', { lat, lng });
              
              // Primero establecer el selectedPlace para evitar conflictos con handleInputChange
              setSelectedPlace(place);
              
              const newAddress = place.formatted_address || place.name || '';
              console.log('📝 Setting address to:', newAddress);
              
              // Usar timeout para asegurar que el selectedPlace se establezca primero
              setTimeout(() => {
                setFormData(prev => ({ 
                  ...prev, 
                  direccion: newAddress
                }));
                
                // Validar automáticamente la cobertura
                console.log('🔍 Starting automatic coverage validation...');
                validateCoverage(place);
              }, 10);
              
            } else {
              console.log('❌ Invalid place or missing geometry:', place);
            }
          });

          setAutocomplete(autocompleteInstance);
          console.log('Autocomplete initialized successfully');
        } catch (error) {
          console.error('Error creating autocomplete:', error);
          // Reintentar si falló
          if (attempts < maxAttempts) {
            attempts++;
            setTimeout(initializeAutocomplete, 1000);
          }
        }
      } else {
        console.log('Google Maps not available, waiting for existing script...');
        // Reintentar hasta que esté disponible
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(initializeAutocomplete, 1000);
        }
      }
    };

    // Esperar un poco más para que otros componentes terminen de cargar Google Maps
    const timer = setTimeout(initializeAutocomplete, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Función para validar cobertura con retry automático hasta que GeoJSON esté listo
  const checkCoverage = useCallback((location: {lat: number, lng: number}, retryCount = 0) => {
    // Validate coverage for location
    
    // Primero verificar si tenemos datos en el cache global
    const currentData = geoJsonData || globalGeoJsonData;
    
    if (!currentData || !window.google || !window.google.maps.geometry) {
      if (retryCount === 0) {
        console.log('⏳ Waiting for coverage data and Google Maps...');
      }
      
      // Si no está listo y no hemos intentado muchas veces, reintentar
      if (retryCount < 15) { // Aumentar intentos
        setTimeout(() => checkCoverage(location, retryCount + 1), 300); // Reducir tiempo entre intentos
        return;
      }
      
      // Si ya intentamos muchas veces, marcar como no disponible
      console.log('⚠️ Coverage validation timed out');
      setIsInCoverageArea(false);
      setShippingCost(0);
      return;
    }

    try {
      console.log('✅ Validating coverage...');
      const point = new google.maps.LatLng(location.lat, location.lng);
      
      for (const feature of currentData.features) {
        if (feature.geometry.type === 'Polygon') {
          const paths = feature.geometry.coordinates.map((ring: number[][]) => 
            ring.map(([lng, lat]: number[]) => new google.maps.LatLng(lat, lng))
          );
          
          const polygon = new google.maps.Polygon({ paths });
          
          if (google.maps.geometry.poly.containsLocation(point, polygon)) {
            const cost = feature.properties.cost || 1000;
            console.log(`✅ Found coverage! Cost: $${cost}`);
            setIsInCoverageArea(true);
            setShippingCost(cost);
            setErrors(prev => ({ ...prev, direccion: undefined }));
            return;
          }
        }
      }
      
      // Si no está en ningún polígono
      console.log('❌ Not in coverage area');
      setIsInCoverageArea(false);
      setShippingCost(0);
      setErrors(prev => ({ 
        ...prev, 
        direccion: 'Esta dirección no está en nuestra zona de cobertura'
      }));
    } catch (error) {
      console.error('💥 Error verificando cobertura:', error);
      setIsInCoverageArea(false);
      setShippingCost(0);
    }
  }, [geoJsonData, pendingValidationCoords]);

  // Wrapper para usar con places
  const validateCoverage = async (place: google.maps.places.PlaceResult) => {
    console.log('🔍 validateCoverage called, extracting coordinates...');
    
    if (!place.geometry?.location) {
      console.log('❌ No geometry location in place');
      return;
    }
    
    setIsValidatingAddress(true);
    
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const coords = { lat, lng };
    console.log('📍 Coordinates extracted:', coords);
    
    // Si los datos no están listos, guardar para validar después
    if (!geoJsonData && !globalGeoJsonData) {
      console.log('📋 Saving coordinates for validation when data is ready...');
      setPendingValidationCoords(coords);
    }
    
    // Usar la misma función que el mapa mayorista
    checkCoverage(coords);
    
    setIsValidatingAddress(false);
  };

  // Función para validar dirección manualmente usando Geocoding API
  const validateAddressManually = async (address: string) => {
    if (!address.trim() || typeof window === 'undefined') return;
    
    setIsValidatingAddress(true);
    
    try {
      console.log('🔍 Validating address manually:', address);
      
      // Verificar que Google Maps esté disponible
      if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
        console.error('❌ Google Maps Geocoder not available');
        setIsInCoverageArea(false);
        setShippingCost(0);
        setIsValidatingAddress(false);
        return;
      }
      
      // Usar el Geocoding API para obtener coordenadas
      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode(
        { 
          address: address + ', Chile',
          componentRestrictions: { country: 'CL' }
        },
        (results, status) => {
          console.log('📍 Geocoding result:', { status, foundResults: results?.length || 0 });
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            const lat = location.lat();
            const lng = location.lng();
            console.log('✅ Geocoded successfully, checking coverage...');
            checkCoverage({ lat, lng });
            setIsValidatingAddress(false);
          } else {
            console.log('❌ Geocoding failed:', status);
            setIsInCoverageArea(false);
            setShippingCost(0);
            setIsValidatingAddress(false);
          }
        }
      );
    } catch (error) {
      console.error('💥 Error in manual validation:', error);
      setIsInCoverageArea(false);
      setShippingCost(0);
      setIsValidatingAddress(false);
    }
  };

  const tiposNegocio = ['Almacén', 'Minimarket', 'Pastelería', 'Cafetería', 'Otro'];

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof (BusinessForm & { correo: string }), string>> = {};

    if (!formData.negocio.trim()) newErrors.negocio = 'El nombre del negocio es requerido';
    if (!formData.contacto.trim()) newErrors.contacto = 'La persona de contacto es requerida';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!formData.tipo) newErrors.tipo = 'El tipo de negocio es requerido';
    if (!formData.direccion.trim()) newErrors.direccion = 'La dirección es requerida';
    if (!formData.correo.trim()) newErrors.correo = 'El correo es requerido';
    
    // Validación de cobertura
    if (formData.direccion.trim() && isInCoverageArea === false) {
      newErrors.direccion = 'Esta dirección no está en nuestra zona de cobertura';
    }

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
    
    console.log('📝 Input change:', { name, value, hasSelectedPlace: !!selectedPlace });
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof BusinessForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Solo resetear el estado de cobertura si el usuario está escribiendo manualmente
    // (no cuando se actualiza por el autocomplete)
    if (name === 'direccion' && !selectedPlace && value !== formData.direccion) {
      console.log('🔄 Resetting coverage status - manual input detected');
      setIsInCoverageArea(null);
      setShippingCost(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Preparar datos para envío al API
      const totalWithShipping = (cartState?.totalMonto || 0) + (isInCoverageArea === true ? shippingCost : 0);
      
      const requestData = {
        businessInfo: { ...formData },
        cart: {
          ...cartState,
          shippingCost,
          totalWithShipping
        },
        products: productosSeleccionados,
        userEmail: formData.correo || auth.user?.email || null,
        user_id: auth.user?.id || null,
        selectedPlace,
        isInCoverageArea,
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
        alert('¡Pedido enviado correctamente! Te enviamos un correo de confirmación con los detalles. Te contactaremos pronto para confirmar la fecha de despacho.');
        
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



        {/* Dirección con Google Places Autocomplete */}
        <div>
          <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
            Dirección del negocio <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                id="direccion"
                name="direccion"
                ref={addressInputRef}
                value={formData.direccion}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                // Limpiar selectedPlace si el usuario empieza a escribir manualmente
                if (selectedPlace && e.key.length === 1) {
                  console.log('🔄 User started typing manually, clearing selectedPlace');
                  setSelectedPlace(null);
                }
                
                // Permitir validación manual con Enter
                if (e.key === 'Enter' && !selectedPlace && formData.direccion.trim()) {
                  e.preventDefault();
                  validateAddressManually(formData.direccion);
                }
              }}
              onInput={() => {
                // También limpiar selectedPlace en input events
                if (selectedPlace) {
                  console.log('🔄 Input event detected, clearing selectedPlace');
                  setSelectedPlace(null);
                }
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10 ${
                errors.direccion ? 'border-red-500' : 
                isInCoverageArea === true ? 'border-green-500' : 
                isInCoverageArea === false ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Busca y selecciona tu dirección..."
              />
              
              {/* Indicador de validación */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {isValidatingAddress && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                )}
                {!isValidatingAddress && isInCoverageArea === true && (
                  <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {!isValidatingAddress && isInCoverageArea === false && (
                  <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
            </div>
            
            {/* Botón para validar manualmente - solo mostrar si no hay lugar seleccionado */}
            {!selectedPlace && (
              <button
                type="button"
                onClick={() => validateAddressManually(formData.direccion)}
                disabled={!formData.direccion.trim() || isValidatingAddress}
                className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
              >
                {isValidatingAddress ? 'Validando...' : 'Validar'}
              </button>
            )}
          </div>
          
          <p className="text-xs text-gray-500 mt-1">
            {selectedPlace 
              ? 'Dirección seleccionada del autocompletado' 
              : 'Busca tu dirección y selecciónala de las opciones sugeridas, o escríbela y presiona "Validar"'
            }
          </p>
          
          {/* Estado de cobertura */}
          {isValidatingAddress && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                ⏳ Verificando cobertura y calculando costo de envío...
              </p>
            </div>
          )}
          
          {!isValidatingAddress && isInCoverageArea === true && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                ✅ Dirección en zona de cobertura • Costo de envío: ${shippingCost.toLocaleString('es-CL')}
              </p>
            </div>
          )}
          
          {!isValidatingAddress && isInCoverageArea === false && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                ❌ Esta dirección no está en nuestra zona de cobertura
              </p>
            </div>
          )}
          
          {errors.direccion && <p className="text-red-500 text-xs mt-1">{errors.direccion}</p>}
        </div>

        {/* Resumen del pedido */}
        {cartState && cartState.totalCantidad > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Resumen del Pedido</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Productos ({cartState.totalCantidad} unidades)</span>
                <span>${cartState.totalMonto.toLocaleString('es-CL')}</span>
              </div>
              
              {isInCoverageArea === true && shippingCost > 0 && (
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span>${shippingCost.toLocaleString('es-CL')}</span>
                </div>
              )}
              
              <hr className="border-gray-300" />
              
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>
                  ${(cartState.totalMonto + (isInCoverageArea === true ? shippingCost : 0)).toLocaleString('es-CL')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={isSubmitting || !isFormValid || isInCoverageArea === false}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            isFormValid && !isSubmitting && isInCoverageArea !== false
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
        
        {isInCoverageArea === false && (
          <p className="text-sm text-red-600 text-center">
            Selecciona una dirección dentro de nuestra zona de cobertura para continuar
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden relative animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h4 className="text-lg font-bold">Agregar nueva dirección</h4>
              <button className="text-gray-500 hover:text-gray-700 text-2xl" onClick={() => setShowAddAddress(false)}>&times;</button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <AddressManager onSelect={addr => {
                setShowAddAddress(false);
                if (addr) {
                  setFormData(prev => ({
                    ...prev,
                    negocio: addr.nombre_comercial || addr.nombre || '',
                    contacto: addr.contacto || '',
                    telefono: addr.telefono_negocio || addr.telefono || '',
                    tipo: (addr.tipo_negocio as BusinessForm['tipo']) || 'Almacén',
                    comuna: addr.comuna || '',
                    direccion: addr.direccion || '',
                  }));
                }
              }} onlyAdd />
            </div>
          </div>
        </div>
      )}

      {/* Modal para seleccionar y administrar direcciones */}
      {showListAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden relative animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h4 className="text-lg font-bold">Seleccionar o administrar direcciones</h4>
              <button className="text-gray-500 hover:text-gray-700 text-2xl" onClick={() => setShowListAddress(false)}>&times;</button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
              <AddressManager onSelect={addr => {
                setShowListAddress(false);
                if (addr) {
                  setFormData(prev => ({
                    ...prev,
                    negocio: addr.nombre_comercial || addr.nombre || '',
                    contacto: addr.contacto || '',
                    telefono: addr.telefono_negocio || addr.telefono || '',
                    tipo: (addr.tipo_negocio as BusinessForm['tipo']) || 'Almacén',
                    comuna: addr.comuna || '',
                    direccion: addr.direccion || '',
                  }));
                }
              }} />
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ContactForm;