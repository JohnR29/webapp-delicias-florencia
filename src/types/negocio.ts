// Tipos y constantes unificadas para información de negocios/puntos de venta

export interface DatosNegocio {
  // Información básica requerida
  nombre_comercial: string;
  direccion: string;
  comuna: string;
  telefono_negocio: string;
  
  // Información adicional
  descripcion_negocio?: string;
  horario_atencion?: string;
  tipo_negocio?: TipoNegocio;
  email_negocio?: string;
  whatsapp_negocio?: string;
  
  // Configuraciones
  permite_pedidos_directos?: boolean;
  observaciones?: string;
  
  // Control
  es_punto_venta_publico?: boolean;
  estado_aprobacion?: 'pendiente' | 'aprobado' | 'rechazado';
}

export type TipoNegocio = 'Almacén' | 'Minimarket' | 'Pastelería' | 'Cafetería' | 'Otro';

export const TIPOS_NEGOCIO = [
  { value: 'Almacén', label: 'Almacén' },
  { value: 'Minimarket', label: 'Minimarket' }, 
  { value: 'Pastelería', label: 'Pastelería' },
  { value: 'Cafetería', label: 'Cafetería' },
  { value: 'Otro', label: 'Otro' }
] as const;

export const COMUNAS_DISPONIBLES = [
  'San Bernardo',
  'La Pintana', 
  'El Bosque',
  'La Cisterna',
  'Lo Espejo',
  'Pedro Aguirre Cerda',
  'Maipú',
  'Cerrillos'
];

// Placeholders y textos unificados
export const PLACEHOLDERS = {
  // Campos básicos de persona/contacto
  nombre: 'Ej: Juan Pérez',
  contacto: 'Persona de contacto principal',
  telefono: 'Ej: +56 9 1234 5678',
  
  // Campos de negocio
  nombre_comercial: 'Ej: Panadería El Trigo',
  descripcion_negocio: 'Breve descripción de tu negocio y lo que ofreces...',
  direccion: 'Ej: Av. Los Morros 1234',
  telefono_negocio: 'Ej: +56 9 1234 5678',
  horario_atencion: 'Ej: Lunes a Viernes 8:00 - 18:00, Sábados 9:00 - 14:00',
  email_negocio: 'Email del negocio (opcional)',
  whatsapp_negocio: 'WhatsApp del negocio (opcional)',
  observaciones: 'Información adicional que consideres relevante para tu punto de venta...'
};

// Validación
export const esFormularioNegocioValido = (datos: Partial<DatosNegocio>): boolean => {
  return !!(
    datos.nombre_comercial?.trim() &&
    datos.direccion?.trim() &&
    datos.comuna?.trim() &&
    datos.telefono_negocio?.trim()
  );
};