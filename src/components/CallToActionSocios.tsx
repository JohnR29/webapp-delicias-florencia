"use client";
import Link from 'next/link';
import { FaMapMarked } from 'react-icons/fa';

interface CallToActionSociosProps {
  variant?: 'compact' | 'full' | 'banner';
  className?: string;
}

const CallToActionSocios: React.FC<CallToActionSociosProps> = ({ 
  variant = 'full', 
  className = '' 
}) => {
  if (variant === 'compact') {
    return (
      <div className={`bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div>
              <p className="text-sm font-medium text-gray-800">¿Tienes un negocio?</p>
              <p className="text-xs text-gray-600">Únete como socio distribuidor</p>
            </div>
          </div>
          <Link
            href="/registro-punto-venta"
            className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-semibold rounded-full hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
          >
            ¡Únete!
          </Link>
        </div>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-4 shadow-sm ${className}`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <FaMapMarked className="mr-3 text-orange-600 text-4xl" />
                <span>
                  ¿Tienes un negocio?
                  <br />
                  ¡Únete a nuestra red!
                </span>
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                Tu local puede aparecer aquí. 
                <br />
                Accede a precios mayoristas y entregas programadas.
                </p>
            </div>
          </div>
          <Link
            href="/registro-punto-venta"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
          >
            Registrate ahora
          </Link>
        </div>
      </div>
    );
  }

  // Variant 'full' (default)
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 shadow-sm ${className}`}>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mx-auto mb-4">
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          ¿Quieres ser socio distribuidor?
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Únete a nuestra exclusiva red de distribuidores y transforma tu negocio con nuestros productos artesanales. 
          Accede a precios mayoristas, entregas programadas y marketing incluido.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-1">Precios mayoristas</h4>
          <p className="text-sm text-gray-600">Hasta 40% de descuento</p>
        </div>
        
        <div className="text-center p-4 bg-blue-50 rounded-lg">  
          <h4 className="font-semibold text-gray-900 mb-1">Visibilidad</h4>
          <p className="text-sm text-gray-600">Aparece en nuestro mapa</p>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-1">Entregas</h4>
          <p className="text-sm text-gray-600">Lunes y viernes</p>
        </div>
      </div>
      
      <div className="text-center">
        <Link
          href="/registro-punto-venta"
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
        >
          ¡Registrarme como socio!
        </Link>
        <p className="text-xs text-gray-500 mt-2">
          Proceso de aprobación en 24-48 horas • Sin costos de inscripción
        </p>
      </div>
    </div>
  );
};

export default CallToActionSocios;