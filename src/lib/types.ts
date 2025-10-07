// ==========================
// Tipos TypeScript para Delicias Florencia
// ==========================

export type ProductFormat = '12oz' | '9oz';

export type ProductFlavor = 'tres-leches' | 'selva-negra' | 'oreo' | 'pina-crema';

export interface Product {
  key: string;
  nombre: string;
  formato: ProductFormat;
  precio: number;
  ingredientes: string[];
  imagen: string;
  descripcion?: string;
}

export interface CartItem {
  productKey: string;
  cantidad: number;
}

export interface CartState {
  items: Record<string, number>; // productKey -> cantidad
  total12oz: number;
  total9oz: number;
  totalCantidad: number;
  totalMonto: number;
}

export interface BusinessForm {
  negocio: string;
  contacto: string;
  telefono: string;
  tipo: 'Almacén' | 'Minimarket' | 'Pastelería' | 'Cafetería' | 'Otro';
  comuna: string;
  direccion: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  businessInfo: BusinessForm;
  createdAt: string;
  lastLogin: string;
  resetToken?: string;
  resetTokenExpiry?: string;
  migrationNeeded?: boolean; // Para usuarios migrados
}

// Información personal del perfil de usuario
export interface UserProfile {
  id: string;
  user_id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  documento_identidad?: string;
  tipo_documento?: 'RUT' | 'CI' | 'Pasaporte';
  fecha_nacimiento?: string;
  direccion_personal?: string;
  comuna_personal?: string;
  // Campos para socio distribuidor
  es_punto_venta_publico: boolean;
  nombre_comercial?: string;
  descripcion_negocio?: string;
  horario_atencion?: string;
  permite_pedidos_directos: boolean;
  telefono_negocio?: string;
  email_negocio?: string;
  // Campos de aprobación por admin
  aprobado_por_admin: boolean;
  fecha_aprobacion?: string;
  aprobado_por_admin_id?: string;
  created_at: string;
  updated_at: string;
}

// Datos completos del usuario (para formularios)
export interface UserProfileForm {
  nombre: string;
  apellido: string;
  telefono: string;
  documento_identidad?: string;
  tipo_documento?: 'RUT' | 'CI' | 'Pasaporte';
  fecha_nacimiento?: string;
  direccion_personal?: string;
  comuna_personal?: string;
  // Campos para socio distribuidor
  es_punto_venta_publico: boolean;
  nombre_comercial?: string;
  descripcion_negocio?: string;
  horario_atencion?: string;
  permite_pedidos_directos: boolean;
  telefono_negocio?: string;
  email_negocio?: string;
}

// Información específica del socio distribuidor
export interface SocioDistribuidor {
  user_profile_id: string;
  nombre_comercial: string;
  descripcion_negocio?: string;
  horario_atencion?: string;
  permite_pedidos_directos: boolean;
  telefono_negocio?: string;
  email_negocio?: string;
  activo: boolean;
}

// NOTA: Las interfaces SocioDistribuidorPendiente y AprobacionSocioData 
// han sido eliminadas porque el sistema ahora usa el sistema unificado 
// basado en Address con aprobación integrada

export interface PricingTier {
  nombre: string;
  rango: string;
  precio12oz: number;
  precio9oz: number;
  umbralMinimo: number;
  umbralMaximo?: number;
}

// ==========================
// Constantes de configuración
// ==========================

export const PRICING_CONFIG = {
  MINIMO_PEDIDO: 6,
  UMBRAL_TIER2: 15,
  UMBRAL_TIER3: 20,
  
  // Precios formato 12oz
  PRECIO_12OZ_TIER1: 1700, // 6-14 unidades
  PRECIO_12OZ_TIER2: 1600, // 15-19 unidades  
  PRECIO_12OZ_TIER3: 1500, // 20+ unidades
  
  // Precios formato 9oz
  PRECIO_9OZ_TIER1: 1500, // 6-14 unidades
  PRECIO_9OZ_TIER2: 1400, // 15-19 unidades  
  PRECIO_9OZ_TIER3: 1250, // 20+ unidades
} as const;

export const BUSINESS_CONFIG = {
  EMAIL_DESTINO: 'ventas@deliciasflorencia.cl',
  COMUNAS_PERMITIDAS: [
    'San Bernardo',
    'La Pintana', 
    'El Bosque',
    'La Cisterna'
  ] as const,
  TIPOS_NEGOCIO: [
    'Almacén',
    'Minimarket', 
    'Pastelería',
    'Cafetería',
    'Otro'
  ] as const,
} as const;

export const COMUNAS_COORDS = {
  'San Bernardo': { lat: -33.606246, lng: -70.700462 },
  'La Pintana': { lat: -33.579463, lng: -70.648956 },
  'El Bosque': { lat: -33.559729, lng: -70.672550 },
  'La Cisterna': { lat: -33.528348, lng: -70.668608 }
} as const;

// ==========================
// Helpers de precios
// ==========================

export function getPrecioUnitario(totalCantidad: number, formato: ProductFormat): number {
  const config = PRICING_CONFIG;
  
  if (formato === '9oz') {
    if (totalCantidad >= config.UMBRAL_TIER3) return config.PRECIO_9OZ_TIER3;
    if (totalCantidad >= config.UMBRAL_TIER2) return config.PRECIO_9OZ_TIER2;
    return config.PRECIO_9OZ_TIER1;
  } else {
    if (totalCantidad >= config.UMBRAL_TIER3) return config.PRECIO_12OZ_TIER3;
    if (totalCantidad >= config.UMBRAL_TIER2) return config.PRECIO_12OZ_TIER2;
    return config.PRECIO_12OZ_TIER1;
  }
}

export function calcularTotales(items: Record<string, number>, productos: Product[]): CartState {
  let total12oz = 0;
  let total9oz = 0;
  let totalCantidad = 0;
  
  // Calcular totales por formato
  Object.entries(items).forEach(([productKey, cantidad]) => {
    const producto = productos.find(p => p.key === productKey);
    if (producto && cantidad > 0) {
      totalCantidad += cantidad;
      if (producto.formato === '12oz') {
        total12oz += cantidad;
      } else {
        total9oz += cantidad;
      }
    }
  });
  
  // Calcular monto total
  const precio12oz = getPrecioUnitario(total12oz, '12oz');
  const precio9oz = getPrecioUnitario(total9oz, '9oz');
  const totalMonto = (total12oz * precio12oz) + (total9oz * precio9oz);
  
  return {
    items,
    total12oz,
    total9oz, 
    totalCantidad,
    totalMonto
  };
}